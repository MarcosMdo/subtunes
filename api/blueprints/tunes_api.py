"""" This module contains the blueprint for the tunes api endpoints. """

import requests

from ..database.db import db

from ..model.tune import Tune
from ..model.subtune_tune import Subtune_Tune

from ..spotify_api_endpoints import spotify_endpoints

from ..blueprints.spotify_auth_api import get_auth_header

from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app


bp = Blueprint('tunes_api', __name__)


SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']


@bp.route("/tune/<id>", methods=["GET"])
def get_tune(id = "-1"):
    """ 
        This endpoint gets a tune from the database if it exists, otherwise it
        gets the track from the Spotify API and saves it to the database before
        returning it.
    """
    # in case of no id, return a random tune for testing
    tune_id = "11dFghVXANMlKmJXsNCbNl" if id == "-1" else id
    
    tune = Tune.query.get(tune_id)
    if tune is not None:
        return {"tune": tune}, 200
    
    expire_time = session['expire_time'] if 'expire_time' in session else -1
    auth_header = get_auth_header(expire_time) 

    track_endpoint = f"{SPOTIFY_API_URL}/tracks/{tune_id}"
    tune_data_response = requests.get(track_endpoint, headers=auth_header)
    
    if tune_data_response.status_code != 200:
        return {"error": f"error getting track with {tune_id} from Spotify", "HTTPResponse Code": tune_data_response.status_code}, tune_data_response.status_code

    tune_data = tune_data_response.json()
    
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
def delete_tune(id="-1"):
    with current_app.app_context():
        tune = Tune.query.get(id)
        if tune is None:
            return {"error": "tune not found"}, 404
        
        subtunes = Subtune_Tune.query.filter_by(tune_id=id).all()
        if len(subtunes) > 0:
            return {"error": f"Tune was not removed. Tune {tune.name} is currently in {len(subtunes)} subtunes."}, 400
        
        db.session.delete(tune)
        db.session.commit()
        return {"error": "tune deleted"}, 200