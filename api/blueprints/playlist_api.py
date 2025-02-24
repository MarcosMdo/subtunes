import os
import requests
import json

from ..blueprints.spotify_auth_api import get_auth_header
from ..database.db import db
from ..model.playlist import Playlist
from ..model.playlist_tune import Playlist_Tune
from ..model.tune import Tune

from flask import Blueprint, current_app, jsonify, request, session
from flask_login import current_user, login_required

bp = Blueprint('playlist_api', __name__)

SPOTIFY_API_URL = f"{os.environ.get('SPOTIFY_API_BASE_URL')}/{os.environ.get('SPOTIFY_API_VERSION')}"

@bp.route("/playlist", methods=["POST"])
def save_playlist():
    try:
        # Get form data
        current_app.logger.info("Received playlist creation request")
        data = json.loads(request.form.get('data'))
        current_app.logger.info(f"Parsed data: {data}")
        
        image_file = request.files.get('image')
        current_app.logger.info(f"Image file present: {bool(image_file)}")

        if "name" not in data:
            return {"error": "playlist name is required"}, 400
        
        if "tunes" not in data or len(data["tunes"]) == 0:
            return {"error": "no tunes given"}, 400

        playlist_name = data["name"]
        description = data.get("description", "")
        color = data.get("color")
        user_spotify_id = current_user.id
        user_id = current_user.id
        tunes = data["tunes"]
        
        current_app.logger.info(f"Creating playlist: {playlist_name} for user {user_id}")
        
        # Create Spotify playlist
        headers = {"Content-Type": "application/json"}
        headers.update(get_auth_header(session['expire_time']))

        body = {
            "name": playlist_name,
            "description": description,
        }
        
        current_app.logger.info("Making Spotify API request to create playlist")
        response = requests.post(
            f"{SPOTIFY_API_URL}/users/{user_spotify_id}/playlists", 
            headers=headers, 
            json=body
        )
        
        if response.status_code != 201:
            current_app.logger.error(f"Spotify API error: {response.content}")
            return jsonify({"error": response.content}), response.status_code
            
        spotify_response = response.json()
        current_app.logger.info(f"Spotify playlist created: {spotify_response['id']}")
        
        spotify_playlist_id = spotify_response['id']
        playlist_snapshot_id = spotify_response['snapshot_id']

        # First, ensure all tunes exist in our database
        for tune_id in tunes:
            tune = Tune.query.get(tune_id)
            if not tune:
                # If tune doesn't exist, fetch it from Spotify and save it
                tune_response = requests.get(
                    f"{SPOTIFY_API_URL}/tracks/{tune_id}", 
                    headers=headers
                )
                if tune_response.status_code == 200:
                    tune_info = tune_response.json()
                    new_tune = Tune(
                        id=tune_info['id'],
                        name=tune_info['name'],
                        uri=tune_info['uri'],
                        url=f"https://open.spotify.com/track/{tune_info['id']}",
                        artist=tune_info['artists'][0]['name'],
                        album=tune_info['album']['name'],
                        image_url=tune_info['album']['images'][0]['url'] if tune_info['album']['images'] else None,
                        duration=tune_info['duration_ms'],
                        popularity=tune_info['popularity'],
                        preview_url=tune_info['preview_url']
                    )
                    db.session.add(new_tune)
                else:
                    return {"error": f"Failed to fetch tune {tune_id}"}, 400

        # Now create the playlist
        playlist = Playlist(
            id=spotify_playlist_id,
            name=playlist_name,
            description=description,
            user_id=user_id,
            snapshot_id=playlist_snapshot_id,
            color=color,
            from_subtunes=data.get("from_subtunes", False)
        )
        
        # Handle image upload if provided
        if image_file:
            # Upload image to Spotify
            image_response = requests.put(
                f"{SPOTIFY_API_URL}/playlists/{spotify_playlist_id}/images",
                headers={"Content-Type": "image/jpeg", **headers},
                data=image_file.read()
            )
            if image_response.status_code == 202:
                playlist.image = f"spotify:image:{spotify_playlist_id}"

        db.session.add(playlist)

        # Add tunes to playlist
        for idx, tune_id in enumerate(tunes):
            playlist.playlist_tunes.append(
                Playlist_Tune(
                    tune_id=tune_id,
                    order_in_playlist=int(idx)
                )
            )

        db.session.commit()

        # Add tracks to Spotify playlist
        tune_uris = [pt.tune.uri for pt in playlist.playlist_tunes]
        res = requests.post(
            f"{SPOTIFY_API_URL}/playlists/{spotify_playlist_id}/tracks", 
            headers=headers, 
            json={"uris": tune_uris}
        )
        
        if res.status_code != 201:
            db.session.rollback()
            return {"error": "failed to add tracks to playlist"}, res.status_code
        
        return jsonify(playlist), 200
        
    except Exception as e:
        current_app.logger.error(f"Error creating playlist: {str(e)}")
        db.session.rollback()
        return {"error": str(e)}, 500

@bp.route("/playlist/<id>", methods=["GET"])
@login_required
def get_playlist_by_id(id=1):
    user_id = current_user.id
    playlist = None

    with current_app.app_context():
        playlist = Playlist.query.get(id)
        # check if the playlist exists
        if playlist is None:
            return {"error": "playlist not found"}, 404
        
        # check if the user owns this play;ist
        if playlist.user_id != user_id:
            return {"error": "user does not own this playlist"}, 401
        
        playlist_obj = {"name": playlist.name, "description": playlist.description}
        
        # get relevant rows from link table
        playlist_tunes = sorted(playlist.playlist_tunes, key=lambda playlist_tune: playlist_tune.order_in_playlist)
        
        # get tunes from link table 
        playlist_obj["tunes"] = [playlist_tune.tune for playlist_tune in playlist_tunes]
        playlist_obj["id"] = playlist.id

        return {"playlist" : playlist_obj}, 200

# get all playlists for a user
@bp.route("/user/playlists", methods=["GET"])
@login_required
def get_user_playlists(user_id="ALL"):
    with current_app.app_context():
        # return all playlists for this user
        user_id = int(request.cookies.get('spotify_id'))
        if user_id is None:
            return jsonify({"error": "user_id is required"}), 400
        
        user_playlists = Playlist.query.filter_by(user_id=user_id).all()
        if not user_playlists:
            current_app.logger.info("no playlist found for this user")
            return {"error": "no playlist found for this user"}, 204
        
        current_app.logger.info("\n\nuser_playlists: " + str(user_playlists)+"\n\n")

        response = []
        
        for playlist in user_playlists:
            res, code = get_playlist_by_id(playlist.id)

            if "error" in res:
                return res, code
            
            response.append(res)
        
        return jsonify(response), 200

# Delete playlist from db
@bp.route("/playlist/<id>", methods=["DELETE"]) 
@login_required
def delete_playlist(id=1):
    with current_app.app_context():
        playlist = Playlist.query.get(id)
        if playlist is None:
            return {"error": "playlist not found"}, 404
        
        db.session.delete(playlist)
        db.session.commit()

        return {"status": "playlist deleted"}, 200