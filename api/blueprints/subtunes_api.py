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



@bp.route("/create/subtune", methods=["POST"])
def save_subtune():
    return {"status": "Unimplemented"}, 200
    
