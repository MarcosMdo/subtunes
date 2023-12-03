from urllib.parse import quote
from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app
from ..database.db import db
from ..model.subtune import Subtune
from ..model.subtune_tune import Subtune_Tune
from ..model.tune import Tune
from ..spotify_api_endpoints import spotify_endpoints
from ..blueprints.spotify_auth_api import get_auth_header
import requests


bp = Blueprint('subtunes_api', __name__)


SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']

@bp.route("/subtune/<id>", methods=["GET"])
def get_subtune_by_id(id=-1):
    tunes_in_subtune = {}
    subtune = None
    with current_app.app_context():
        subtune = Subtune.query.get(1)
        if subtune:
            # get all records in subtune_tunes table for this subtune
            subtune_tunes = subtune.subtune_tunes
            # get all the tune records in tune table for this subtune given the subtune_tunes link table
            tune_objects = [subtune_tune.tune for subtune_tune in subtune_tunes]
            tunes_json = jsonify(tunes=[tune for tune in tune_objects])
            return tunes_json, 200
        return {"status": "subtune not found"}, 404



@bp.route("/create/subtune")
def save_subtune():
    tunes_arg = request.args.getlist('tunes')
    tunes = tunes_arg.split(",") if tunes_arg else []
    if len(tunes) == 0:
        return {"status": "no tunes given"}, 400

    with current_app.app_context():
        subtune = Subtune()
        db.session.add(subtune)
        # db.session.commit()
        current_app.logger.info(f"\n\nsubtune: {subtune}, saved to db\n")
        for tune_id in tunes:
            # check if the tune is already in the database
            tune = Tune.query.filter_by(id=tune_id).first()
            if tune is None:
                track_endpoint = f"{SPOTIFY_API_URL}/tracks/{tune_id}"
                auth_header = get_auth_header(session['expire_time'])
                tune_data_response = requests.get(track_endpoint, headers=auth_header)
                if tune_data_response.status_code != 200:
                    return {"status": f"error getting track with {tune_id} from Spotify", "HTTPResponse Code": tune_data_response.status_code}, tune_data_response.status_code
                else:
                    tune_data = tune_data_response.json()
                    current_app.logger.info(f"\ntune data: {tune_data}")
                    # create a TuneModel object from the response   
                    tune = Tune(
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
                    # db.session.commit()
                    current_app.logger.info(f"\n\ntune: {tune}, saved to db\n")
            subtune_tune = Subtune_Tune(subtune_id=subtune.id, tune_id=tune.id)
            db.session.add(subtune_tune)
            db.session.commit()
            current_app.logger.info(f"\n\nsubtune_tune: {subtune_tune}, saved to db\n")
    return {"tune ids": tunes}, 200
    

#https://127.0.0.1:5328/create/subtune?tune=1&tune=2&tune=3