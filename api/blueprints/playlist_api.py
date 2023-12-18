import requests
import copy
import uuid
from urllib.parse import quote

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

SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']


# PROOF OF CONCEPT - this is a very naive implementation of a playlist creation endpoint
@bp.route("/create/playlist")
def save_playlist():
    playlist_name = request.args.get('name') if request.args.get('name') \
        else f"{current_user.display_name}'s playlist {uuid.uuid4().hex[:6]}"
    description = request.args.get('description') if request.args.get('description') \
        else f"Playlist created by Subtunes"
    user_spotify_id = current_user.spotify_id
    user_id = current_user.id
    subtunes_arg = request.args.get('subtunes') if request.args.get('subtunes') \
        else None
    subtune_ids = subtunes_arg.split(',') if subtunes_arg else [20, 110]
    
    if len(subtune_ids) == 0:
        return {"status": "no subtunes given"}, 400
    
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
    
    subtune_tunes = []
    for subtune_id in subtune_ids:
        subtune = Subtune.query.get(subtune_id)
        
        if subtune is None:
            return {"status": "subtune not found"}, 404

        if subtune.user_id != user_id:
            return {"status": "user does not own this subtune"}, 401
        
        # 'add' subtunes to tunes list
        for subtune_tune in subtune.subtune_tunes:
            subtune_tunes.append(subtune_tune)

    for idx, subtune_tune in enumerate(subtune_tunes):
        
        subtune_id = subtune_tune.subtune_id
        tune_id = subtune_tune.tune_id
            
        playlist.playlist_subtune_tunes.append(
            Playlist_Tune(subtune_id=subtune_id, tune_id=tune_id, order_in_playlist=idx)
        )

    db.session.commit()
    tune_uris = [pst.tune.uri for pst in playlist.playlist_subtune_tunes]
    
    res = requests.post(f"{SPOTIFY_API_URL}/playlists/{spotify_playlist_id}/tracks", headers=headers, json={"uris": tune_uris})
    
    if res.status_code != 201:
        # delete playlist
        db.session.rollback()
        return {"status": "failed to add tracks to playlist"}, res.status_code
    
    return jsonify(playlist), 200
