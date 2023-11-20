"""" This module contains the blueprint for the tunes api endpoints. """

from urllib.parse import quote
from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify
from ..model.tune import TuneModel
from ..spotify_api_endpoints import spotify_endpoints
from ..blueprints.spotify_auth_api import get_auth_header
import requests


bp = Blueprint('tunes_api', __name__)


SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']


@bp.route("/get/tune/<id>")
def get_tune(id = "-1"):
    """
        get spotify track for a given id (or a random one if no id is given)
        creates a TuneModel object from the spotify track and returns it as a json
    """
    # in case of no id, return a random tune for testing
    tune_id = "11dFghVXANMlKmJXsNCbNl" if id == "-1" else id
    track_endpoint = f"{SPOTIFY_API_URL}/tracks/{tune_id}"
    
    auth_header = get_auth_header(session['expire_time'])
    response = requests.get(track_endpoint, headers=auth_header)
    
    tune_id = response.json()["id"]
    tune_url = response.json()["external_urls"]["spotify"]
    tune_uri = response.json()["uri"]
    tune_name = response.json()["name"]
    tune_artist = response.json()["artists"][0]["name"]
    tune_album = response.json()["album"]["name"]
    tune_image_url = response.json()["album"]["images"][0]["url"]
    tune_duration = response.json()["duration_ms"]
    tune = TuneModel(tune_id, tune_url, tune_uri, tune_name, tune_artist, tune_album, tune_image_url, tune_duration)
    
    return {"Tune obj": tune}


@bp.route("/search/<query>")
def search(query = ""):
    """ simple search endpoint just to f-around for now"""
    search_endpoint = f"{SPOTIFY_API_URL}/search"

    auth_header = get_auth_header(session['expire_time'])
    params = {"q": query, "type": "track,playlist,artist,album", "limit": 10, "offset": 0}
    response = requests.get(search_endpoint, headers=auth_header, params=params)

    return response.json()
