"""" This module contains the blueprint for the tunes api endpoints. """

from urllib.parse import quote
from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app
from ..database.db import db
from ..model.playlist import Playlist
from ..model.subtune import Subtune
from ..model.tune import Tune
from ..spotify_api_endpoints import spotify_endpoints
from ..blueprints.spotify_auth_api import get_auth_header
import requests


bp = Blueprint('search_api', __name__)

SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']
SPOTIFY_SEARCH_API_URL = f"{SPOTIFY_API_URL}/search"

the_query="nadie&type=album&include_external=audio&locale=en-US%2Cen%3Bq%3D0.9%2Ces%3Bq%3D0.8&offset=0&limit=20"

@bp.route("/search/next", methods=["GET"])
def search_next():
    next_results = session.get('next', None)
    if next_results is None:
        return jsonify({'error': 'No more results'}), 404
    query = next_results.split('?')[1]
    current_app.logger.info("next query:" + query)
    resp = search_tune(query)
    data = resp[0].get_json()
    current_app.logger.info(data)
    if resp[0].status_code == 200:
        return jsonify(data), 200
    else:
        return jsonify({'error': 'Failed to fetch tracks from Spotify'}), resp[0].status_code
    

@bp.route("/search/tune", methods=["GET"])
def search_tune(query = "name=nadie sabe lo que"):
    # Get the search term from the query parameters
    query = "name={}".format(request.args.get('query'))
    
    current_app.logger.info(query)

    if not query:
        return jsonify({'error': 'Query parameter "query" is required'}), 400


    auth_header = get_auth_header(session['expire_time'])
    params = {
        "q": query,
        "type": "album,artist,track",
        "limit": 20,
        "offset": 0,
        "market": "US",
        "include_external": "audio"
    }

    response = requests.get(SPOTIFY_SEARCH_API_URL, headers=auth_header, params=params)

    current_app.logger.info(response)
    
    hasNext = None
    if response.status_code == 200:
        # Parse the response and extract track information
        tracks = response.json().get('tracks', {}).get('items', [])
        next_results = response.json().get('tracks', {}).get('next', '')
        session['next'] = next_results
        if next_results is None:
            del session['next']
        current_app.logger.info(tracks[0].keys())
        # Extract relevant information from each track
        track_info = [{'id': track['id'], 'name': track['name'], 'artist': track['artists'][0]['name'], 'external': track['preview_url'], 'cover': track['album']['images'][0]['url']} for track in tracks]

        return jsonify({'tracks': track_info, 'next': True if next_results else None}), 200
    else:
        return jsonify({'error': 'Failed to fetch tracks from Spotify'}), response.status_code

@bp.route("/search/subtune", methods=["GET"])
def search_subtune(query = ""):
    query = "{}%".format(request.args.get('query'))

    if not query:
        return jsonify({'error': 'Query parameter "query" is required'}), 400
    
    current_app.logger.info("query={}".format(query))

    with current_app.app_context():
        subtunes = Subtune.query.filter(Subtune.name.ilike(query)).all()
        
        # check if the subtune exists
        if subtunes is None:
            return {"error": "subtune not found"}, 404
        
        current_app.logger.info(subtunes)

        resp = []

        for subtune in subtunes:
            subtune_obj = {"name": subtune.name, "description": subtune.description, "id": subtune.id}
            tunes = sorted(subtune.subtune_tunes, key=lambda subtune_tune: subtune_tune.order_in_subtune)
            subtune_obj["tunes"] = [subtune_tune.tune for subtune_tune in tunes]
            
            resp.append({"subtune": subtune_obj})
        
        current_app.logger.info("\n\n\n")

        current_app.logger.info(resp)
        
        return resp, 200

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
            return {"error": "playlists not found"}, 404
        
        current_app.logger.info(playlists)

        resp = []

        for playlist in playlists:
            playlist_obj = {"name": playlist.name, "description": playlist.description, "id": playlist.id}
            tunes = sorted(playlist.playlist_tunes, key=lambda playlist_tune: playlist_tune.order_in_playlist)
            playlist_obj["tunes"] = [playlist_tune.tune for playlist_tune in tunes]
            
            resp.append({"playlist": playlist_obj})
        
        current_app.logger.info("\n\n\nplaylist:")

        current_app.logger.info(resp)
        
        return resp, 200