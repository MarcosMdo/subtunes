"""" This module contains the blueprint for the tunes api endpoints. """

import os
import requests
import json

from ..blueprints.spotify_auth_api import get_auth_header
from ..database.db import db
from ..model.tune import Tune
from ..model.subtune_tune import Subtune_Tune
from ..spotify_api_endpoints import spotify_endpoints

from flask import request, session, Blueprint, jsonify, current_app

bp = Blueprint('tunes_api', __name__)

SPOTIFY_API_URL = f"{os.environ.get('SPOTIFY_API_BASE_URL')}/{os.environ.get('SPOTIFY_API_VERSION')}"

@bp.route("/tune/<id>", methods=["GET"])
def get_tune(id = None):
    """ 
        This endpoint gets a tune from the database if it exists, otherwise it
        gets the track from the Spotify API and saves it to the database before
        returning it.
    """
    track_endpoint = f"{SPOTIFY_API_URL}/tracks/{id}"

    if id is None:
        return {"error": "no tune id given"}
    
    tune = Tune.query.get(id)
    if tune is not None:
        return {"tune": tune}, 200
    
    expire_time = session['expire_time'] if 'expire_time' in session else -1
    auth_header = get_auth_header(expire_time) 
    response = requests.get(track_endpoint, headers=auth_header)
    
    if response.status_code != 200:
        return {"error": f"error getting track with {id} from Spotify", "HTTPResponse Code": response.status_code}, response.status_code

    tune_data = response.json()
    
    # create a Tune object from the response   
    tune = Tune(
        id=tune_data["id"],
        url=tune_data["external_urls"]["spotify"],
        uri=tune_data["uri"],
        name=tune_data["name"],
        artist=tune_data["artists"][0]["name"],
        album=tune_data["album"]["name"],
        image_url=tune_data["album"]["images"][0]["url"],
        duration=tune_data["duration_ms"],
        popularity=tune_data["popularity"],
        preview_url=tune_data["preview_url"]
    )
    # save tune to db
    db.session.add(tune)
    db.session.commit()

    return {"tune": tune}, 200

#delete tune from db
@bp.route("/tune/<id>", methods=["DELETE"])
def delete_tune(id=None):
    with current_app.app_context():
        if id is None or id == "":
            return {"error": "tune id required"}, 404

        tune = Tune.query.get(id)
        if tune is None:
            return {"error": "tune not found"}, 404
        
        subtunes = Subtune_Tune.query.filter_by(tune_id=id).all()
        
        if len(subtunes) > 0:
            return {"error": f"Tune was not removed. Tune {tune.name} is currently in {len(subtunes)} subtunes."}, 400
        
        db.session.delete(tune)
        db.session.commit()
        return {"error": "tune deleted"}, 200
    

@bp.route("/tune/top", methods=["GET"])
def get_top_tunes(id="-1"):
    with current_app.app_context():
        spotify_id = request.cookies.get('spotify_id')
        if not spotify_id:
            return jsonify({"error": "user_id is required"}), 400
            
        user_id = int(spotify_id)
        
        top_tracks_url = f"{SPOTIFY_API_URL}/me/top/tracks"

        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time) 
        headers = {'Authorization': f'Bearer {auth_header}'}

        response = requests.get(top_tracks_url, headers=headers)
    
        if response.status_code != 200:
            return {"error": response.text}

        tracks = response.json().get('items', [])
        next_results = response.json().get('next', '')
        if next_results is not None:
            session['next'] = next_results

        track_info = [{'id': track['id'], 'name': track['name'], 'artist': track['artists'][0]['name'], 'external': track['preview_url'], 'cover': track['album']['images'][0]['url']} for track in tracks]

        return jsonify({'tracks': track_info, 'next': True if next_results else None}), 200

@bp.route("/tune/play/<uri>", methods=["PUT"])
def play_tune(uri = None):
    current_app.logger.debug(f"Received play request for URI: {uri}")
    with current_app.app_context():
        if uri is None:
            return jsonify({"error": "uri is required"}), 400

        play_endpoint = f"{SPOTIFY_API_URL}/me/player/play"
        # Get position from request body
        data = request.get_json(silent=True) or {}
        position_ms = int(data.get('position', 0))

        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time) 
        headers = {'Authorization': f'Bearer {auth_header}'}
        
        body = {
            "uris": [uri],
            "position_ms": position_ms
        }

        response = requests.put(play_endpoint, headers=headers, json=body)
        current_app.logger.info(f"Play tune response status: {response.status_code}")
        devices = get_spotify_devices()
        return jsonify({"status": "success"}), response.status_code

@bp.route("/tune/pause", methods=["PUT"])
def pause_tune():
    with current_app.app_context():
        pause_endpoint = f"{SPOTIFY_API_URL}/me/player/pause"

        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time) 
        headers = {'Authorization': f'Bearer {auth_header}'}

        response = requests.put(pause_endpoint, headers=headers)
        current_app.logger.info(f"Pause response status: {response.status_code}")
        
        return jsonify({"status": response.status_code}), response.status_code

@bp.route("/tune/currently-playing", methods=["GET"])
def get_currently_playing():
    with current_app.app_context():
        play_endpoint = f"{SPOTIFY_API_URL}/me/player/currently-playing"

        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time) 
        headers = {'Authorization': f'Bearer {auth_header}'}

        response = requests.get(play_endpoint, headers=headers)
        # current_app.logger.info(f"Currently playing response: {response.json()}")
        # data.item.duration_ms
        return jsonify({ "data": response.json() }), 200

@bp.route("/tune/seek/<position>", methods=["PUT"])
def seek_position(position = None):
    with current_app.app_context():
        if position is None:
            return jsonify({"error": "position is required"}), 400

        seek_endpoint = f"{SPOTIFY_API_URL}/me/player/seek?position_ms={position}"

        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time) 
        headers = {'Authorization': f'Bearer {auth_header}'}

        response = requests.put(seek_endpoint, headers=headers)
        current_app.logger.info(f"Seek response status: {response.status_code}")
        
        return jsonify({"status": "success"}), response.status_code

@bp.route("/tune/player-token", methods=["GET"])
def get_player_token():
    with current_app.app_context():
        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time)
        return jsonify({"token": auth_header['Authorization'].split(' ')[1]}), 200

def get_spotify_devices():
    with current_app.app_context():
        play_endpoint = f"{SPOTIFY_API_URL}/me/player/devices"

        expire_time = session['expire_time'] if 'expire_time' in session else -1
        auth_header = get_auth_header(expire_time) 
        headers = {'Authorization': f'Bearer {auth_header}'}

        response = requests.get(play_endpoint, headers=headers)
        current_app.logger.info(f"Current spotify device response: {json.dumps(response.json(), indent=2)}")
        return response.json()