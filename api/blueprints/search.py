"""" This module contains the blueprint for the tunes api endpoints. """

import os
import requests

from ..blueprints.spotify_auth_api import get_auth_header
from ..model.playlist import Playlist
from ..model.subtune import Subtune

from flask import Blueprint, current_app, jsonify, request, session

bp = Blueprint('search_api', __name__)

SPOTIFY_API_URL = f"{os.environ.get('SPOTIFY_API_BASE_URL')}/{os.environ.get('SPOTIFY_API_VERSION')}"
SPOTIFY_SEARCH_API_URL = f"{SPOTIFY_API_URL}/search"

@bp.route("/search/next", methods=["GET"])
def search_next():
    next_results = session.get('next', None)
    if next_results is None:
        return jsonify({'error': 'No more results'}), 404
    
    query = next_results.split('?')[1]

    current_app.logger.debug("next query:" + query)

    resp = search_tune(query)
    data = resp[0].get_json()

    current_app.logger.debug(data)

    if resp[0].status_code == 200:
        return jsonify(data), 200
    else:
        return jsonify({'error': 'Failed to fetch tracks from Spotify'}), resp[0].status_code

@bp.route("/search/tune", methods=["GET"])
def search_tune(query = ""):

    if request.args.get("query") is None or request.args.get("query") == "":
        return jsonify({'error': 'search query required'}), 400
    # Get the search term from the query parameters
    query = "name={}".format(request.args.get('query'))
    auth_header = get_auth_header(session['expire_time'])
    
    current_app.logger.debug(query)

    # TODO: improve our search.
    params = {
        "q": query,
        "type": "album,artist,track",
        "limit": 20,
        "offset": 0,
        "market": "US",
        "include_external": "audio"
    }

    response = requests.get(SPOTIFY_SEARCH_API_URL, headers=auth_header, params=params)

    current_app.logger.debug(response)
    
    if response.status_code == 200:
        # Parse the response and extract track information
        tracks = response.json().get('tracks', {}).get('items', [])
        next_results = response.json().get('tracks', {}).get('next', '')
        session['next'] = next_results

        if next_results is None:
            del session['next']

        current_app.logger.debug(tracks[0].keys())
        # Extract relevant information from each track
        track_info = [{'id': track['id'], 'name': track['name'], 'artist': track['artists'][0]['name'], 'external': track['preview_url'], 'image_url': track['album']['images'][0]['url']} for track in tracks]

        return jsonify({'tracks': track_info, 'next': True if next_results else None}), 200
    else:
        return jsonify({'error': 'Failed to fetch tracks from Spotify'}), response.status_code

@bp.route("/search/subtune", methods=["GET"])
def search_subtune(query = ""):
    query = "{}%".format(request.args.get('query'))

    if not query:
        return jsonify({'error': 'Query parameter "query" is required'}), 400
    
    current_app.logger.debug("query={}".format(query))

    with current_app.app_context():
        subtunes = Subtune.query.filter(Subtune.name.ilike(query)).all()
        
        # check if the subtune exists
        if subtunes is None:
            current_app.logger.info("query={}".format(query))
            return {"error": "subtune not found"}, 404
        
        current_app.logger.debug(subtunes)

        response = []

        for subtune in subtunes:
            subtune_obj = {"name": subtune.name, "description": subtune.description, "id": subtune.id, 'created_at': subtune.created_at, 'color': subtune.color}
            tunes = sorted(subtune.subtune_tunes, key=lambda subtune_tune: subtune_tune.order_in_subtune)
            subtune_obj["tunes"] = [subtune_tune.tune for subtune_tune in tunes]
            
            resp.append({"subtune": subtune_obj})
            resp = sorted(resp, key=lambda x: x['subtune']['created_at'], reverse=True)
            current_app.logger.info("\n\n\nresp:", str(resp), "\n\n\n")
        
        current_app.logger.debug(response)
        
        return response, 200

@bp.route("/search/playlist", methods=["GET"])
def search_playlist(query = ""):
    query = "{}%".format(request.args.get('query'))

    if not query:
        return jsonify({'error': 'Query parameter "query" is required'}), 400
    
    current_app.logger.info("query={}".format(query))

    with current_app.app_context():
        playlists = Playlist.query.filter(Playlist.name.ilike(query)).all()
        
        # check if the playlist exists
        if playlists is None:
            return {"error": "no playlists like {}".format(query)}, 404
        
        current_app.logger.debug(playlists)

        response = []

        for playlist in playlists:
            playlist_obj = {"name": playlist.name, "description": playlist.description, "id": playlist.id}
            tunes = sorted(playlist.playlist_tunes, key=lambda playlist_tune: playlist_tune.order_in_playlist)
            playlist_obj["tunes"] = [playlist_tune.tune for playlist_tune in tunes]
            
            response.append({"playlist": playlist_obj})
        
        current_app.logger.debug(response)
        
        return response, 200