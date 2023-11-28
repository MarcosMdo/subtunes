"""" This module contains the blueprint for the tunes api endpoints. """

from urllib.parse import quote
from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app
from ..database.db import db
from ..model.tune import TuneModel
from ..spotify_api_endpoints import spotify_endpoints
from ..blueprints.spotify_auth_api import get_auth_header
import requests


bp = Blueprint('tunes_api', __name__)


SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']


@bp.route("/tune/<id>", methods=["GET"])
def get_tune(id = "-1"):
    """
        get spotify track for a given id (or a random one if no id is given)
        creates a TuneModel object from the spotify track and returns it as a json
    """
    # in case of no id, return a random tune for testing
    tune_id = "11dFghVXANMlKmJXsNCbNl" if id == "-1" else id
    track_endpoint = f"{SPOTIFY_API_URL}/tracks/{tune_id}"
    
    auth_header = get_auth_header(session['expire_time'])
    tune_data_response = requests.get(track_endpoint, headers=auth_header)
    tune = None
    if tune_data_response.status_code == 200:
        tune_data = tune_data_response.json()
        current_app.logger.info(f"\ntune data: {tune_data}")
        
        # check if the tune is already in the database
        with current_app.app_context():
            tune = TuneModel.query.filter_by(id=tune_data["id"]).first()
            current_app.logger.info(f"\n\ntune already in db: {tune}\n")
            
        # if not, create a TuneModel object from the response
        if tune is None:
            # create a TuneModel object from the response   
            tune = TuneModel(
                id=tune_data["id"],
                url=tune_data["external_urls"]["spotify"],
                uri=tune_data["uri"],
                name=tune_data["name"],
                artist=tune_data["artists"][0]["name"],
                album=tune_data["album"]["name"],
                image_url=tune_data["album"]["images"][0]["url"],
                duration=tune_data["duration_ms"]
            )
            db.session.add(tune)
            db.session.commit()
            current_app.logger.info(f"\n\ntune: {tune}, saved to db\n")

    return {"status": "tune saved to db", "tune": str(tune)}, 200


@bp.route("/search/<query>")
def search(query = ""):
    """ simple search endpoint just to f-around for now"""
    search_endpoint = f"{SPOTIFY_API_URL}/search"

    auth_header = get_auth_header(session['expire_time'])
    params = {"q": query, "type": "track,playlist,artist,album", "limit": 10, "offset": 0}
    response = requests.get(search_endpoint, headers=auth_header, params=params)

    return response.json()
