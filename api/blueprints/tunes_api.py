"""" This module contains the blueprint for the tunes api endpoints. """

from urllib.parse import quote
from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app
from ..database.db import db
from ..model.tune import Tune
from ..spotify_api_endpoints import spotify_endpoints
from ..blueprints.spotify_auth_api import get_auth_header
import requests


bp = Blueprint('tunes_api', __name__)


SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']


@bp.route("/tune/<id>", methods=["GET"])
def get_tune(id = "-1"):
    """
        NOTE: should probably change name to get_tune_from_db_or_spotify or something more descriptive
        
        get spotify track for a given id (or a random one if no id is given)
        creates a TuneModel object from the spotify track and returns it as a json
    """
    # in case of no id, return a random tune for testing
    tune_id = "11dFghVXANMlKmJXsNCbNl" if id == "-1" else id
    track_endpoint = f"{SPOTIFY_API_URL}/tracks/{tune_id}"
    
    auth_header = get_auth_header(session['expire_time'])
    tune_data_response = requests.get(track_endpoint, headers=auth_header)
    tune = None
    
    if tune_data_response.status_code != 200:
        return {"status": f"error getting track with {tune_id} from Spotify", "HTTPResponse Code": tune_data_response.status_code}, tune_data_response.status_code
    else:
        tune_data = tune_data_response.json()
        
        # check if the tune is already in the database
        tune = Tune.query.get(tune_data["id"])
            
        # if not, create a TuneModel object from the response
        if tune is None:
            # create a TuneModel object from the response   
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
                external_url=tune_data["preview_url"]
            )
            db.session.add(tune)
            db.session.commit()


    
    return {"status": "tune saved to db", "tune": tune}, 200

