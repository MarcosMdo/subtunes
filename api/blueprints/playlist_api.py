import requests
import copy
import uuid
from urllib.parse import quote
import os

from ..database.db import db
from flask_sqlalchemy import SQLAlchemy

from ..model.playlist import Playlist
from ..model.playlist_tune import Playlist_Tune
from ..model.subtune import Subtune
from ..model.subtune_tune import Subtune_Tune
from ..model.tune import Tune

from ..spotify_api_endpoints import spotify_endpoints


from ..blueprints.spotify_auth_api import get_auth_header
from ..blueprints.subtunes_api import get_subtune_by_id
# from ..blueprints.tunes_api import get_tune

from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app
from flask_login import current_user, login_required


bp = Blueprint('playlist_api', __name__)

SPOTIFY_API_URL = f"{os.environ.get('SPOTIFY_API_BASE_URL')}/{os.environ.get('SPOTIFY_API_VERSION')}"



# PROOF OF CONCEPT - this is a very naive implementation of a playlist creation endpoint
# we must accept the tunes/subtune data in a way where we can define order. right now we iterate over subtunes and assign order via that


# {
#     "name": "name",
#     "description": "yer",
#     "tunes": [
#         {
#             "tune_id": "3424242",
#             "subtune_id": "2"
#         },
#         {
#             "tune_id": "65633",
#             "subtune_id": "2"
#         },
#         {
#             "tune_id": "1166565",
#             "subtune_id": "1"
#         },
#     ]
# }

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

    user_spotify_id = current_user.spotify_id
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
    playlist_res = requests.post(f"{SPOTIFY_API_URL}/users/{user_spotify_id}/playlists", headers=headers, json=body)

    spotify_playlist_id = playlist_res.json()['id']
    playlist_snapshot_id = playlist_res.json()['snapshot_id']
    
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
    subtunes_in_playlist = {}
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

    return {"error": "something went really wrong"}, 500

# get all playlists for a user
@bp.route("/user/<user_id>/playlists", methods=["GET"])
@login_required
def get_user_playlists(user_id=-1):
    with current_app.app_context():
        # return all subtunes for this user
        user_playlists = Playlist.query.filter_by(user_id=user_id).all()

        if not user_playlists:
            return {"error": "no subtunes found for this user"}, 404
        
        response = []

        for playlist in user_playlists:
            res, code = get_playlist_by_id(playlist.id)

            if "error" in res:
                return res, code
            
            response.append(res)
        
        return response, 200

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