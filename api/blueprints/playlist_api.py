import os
import requests

from ..blueprints.spotify_auth_api import get_auth_header
from ..database.db import db
from ..model.playlist import Playlist
from ..model.playlist_tune import Playlist_Tune

from flask import Blueprint, current_app, jsonify, request, session
from flask_login import current_user, login_required

bp = Blueprint('playlist_api', __name__)

SPOTIFY_API_URL = f"{os.environ.get('SPOTIFY_API_BASE_URL')}/{os.environ.get('SPOTIFY_API_VERSION')}"

@bp.route("/playlist", methods=["POST"])
def save_playlist():
    
    request_body = request.get_json()
    current_app.logger.info(request_body)

    if "name" not in request_body:
        return {"error": "playlist name is required"}, 400
    
    if "tunes" not in request_body or len(request_body["tunes"]) == 0:
        return {"error": "no tunes given"}, 400

    playlist_name = request_body["name"]
    
    if "description" not in request_body:
        description = ""
    else:
        description = request_body["description"]

    user_spotify_id = current_user.id
    user_id = current_user.id

    tunes = request_body["tunes"]
    
    if len(tunes) == 0:
        return {"error": "no tunes given"}, 400
    
    # POST Spotify API to create a playlist and retrieve the id.

    headers = {"Content-Type": "application/json"}
    headers.update(get_auth_header(session['expire_time']))

    body = {
        "name": playlist_name,
        "description": description,
    }
    response = requests.post(f"{SPOTIFY_API_URL}/users/{user_spotify_id}/playlists", headers=headers, json=body)
    spotify_playlist_id = response.json()['id']
    playlist_snapshot_id = response.json()['snapshot_id']

    if response.status_code != 200:
        return jsonify({"error": response.content}), 404
    
    playlist = Playlist(
        id=spotify_playlist_id,
        name=playlist_name,
        description=description,
        user_id=user_id,
        snapshot_id=playlist_snapshot_id
    )
    db.session.add(playlist)

    # TODO: allow for null subtune_id.
    for idx, tune in enumerate(tunes):
        playlist.playlist_tunes.append(
            Playlist_Tune(subtune_id=tune["subtune_id"], tune_id=tune["tune_id"], order_in_playlist=idx)
        )

    db.session.commit()
    tune_uris = [pst.tune.uri for pst in playlist.playlist_tunes]
    
    res = requests.post(f"{SPOTIFY_API_URL}/playlists/{spotify_playlist_id}/tracks", headers=headers, json={"uris": tune_uris})
    
    if res.status_code != 201:
        # delete playlist
        # TODO: delete / unfollow the spotify playlist
        db.session.rollback()
        return {"error": "failed to add tracks to playlist"}, res.status_code
    
    return jsonify(playlist), 200

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
        # return all subtunes for this user
        user_id = int(request.cookies.get('spotify_id'))
        if user_id is None:
            return jsonify({"error": "user_id is required"}), 400
        
        user_playlists = Playlist.query.filter_by(user_id=user_id).all()

        if not user_playlists:
            current_app.logger.info("no subtunes found for this user")
            return {"error": "no subtunes found for this user"}
        
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