import requests
import copy
import uuid
from urllib.parse import quote


from ..database.db import db
from flask_sqlalchemy import SQLAlchemy

from ..model.subtune import Subtune
from ..model.subtune_tune import Subtune_Tune
from ..model.tune import Tune

from ..spotify_api_endpoints import spotify_endpoints

from ..blueprints.spotify_auth_api import get_auth_header
from ..blueprints.tunes_api import get_tune

from flask import Flask, request, redirect, session, url_for, Blueprint, jsonify, current_app
from flask_login import current_user, login_required


bp = Blueprint('subtunes_api', __name__)

SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']

@bp.route("/subtune/<id>", methods=["GET"])
@login_required
def get_subtune_by_id(id=1):
    user_id = current_user.id
    tunes_in_subtune = {}
    subtune = None
    with current_app.app_context():
        subtune = Subtune.query.get(id)
        
        # check if the subtune exists
        if subtune is None:
            return {"status": "subtune not found"}, 404
        
        # check if the user owns this subtune
        if subtune.user_id != user_id:
            return {"status": "user does not own this subtune"}, 401
        
        # get all records in subtune_tunes table for this subtune
        subtune_tunes = sorted(subtune.subtune_tunes, key=lambda subtune_tune: subtune_tune.order_in_subtune)
        # get all the tune records in tune table for this subtune given the subtune_tunes link table
        tune_objects = [( subtune_tune.order_in_subtune, subtune_tune.tune) for subtune_tune in subtune_tunes]
        tunes_in_subtune[subtune.name] = [tune for tune in tune_objects]
        
        return tunes_in_subtune, 200
        
    return {"Error": "something went really wrong"}, 500

@bp.route("/user/<user_id>/subtunes", methods=["GET"])
@login_required
def get_user_subtunes(user_id=-1):
    with current_app.app_context():
        # return all subtunes for this user
        user_subtunes = Subtune.query.filter_by(user_id=user_id).all()

        if not user_subtunes:
            return {"status": "no subtunes found for this user"}, 404
        subtune_res = {}
        # should we enforce unique subtune names??
        for subtune in user_subtunes:
            res, code = get_subtune_by_id(subtune.id)
            if ("status", "Error") in res:
                return res, code
            subtune_res[subtune.name] = res
        return subtune_res, 200

# dummy_data = ["5YY7ht3PCArlLjLbcTiAvh", "4urciuKll77Us0CpoAaYt0", "2zSuWrakRZKwWaLtHUvtnz", "7v8kE3NhsgbTtJnI0fwoss", "2Nd1dImwW0VVN5HJ9MfvUd"]
dummy_data = ["1jlKdNbOA90rjnt88GJnwO", "1xuYajTJZh8zZrPRmUaagf", "3kNVYo6BJE9AENxzokM9YC", "1q8NdCAQ9QUjpYiqzdd3mv", "1U5X9bPu8xXHuejzUAi4Bx"]

@bp.route("/create/subtune", methods=["POST", "GET"]) # `/create/` & `GET` for testing for now, should remove once we have a front end
@login_required
def save_subtune():
    """
    NOTE: added a `error_with_tunes` field to the response, this will be a list of 
    errors if any for a given tune id. may not need but just in case for now.
    """
    # maybe we want to pass data through body instead of query params once front end is set up
    subtune_name = request.args.get('name') if request.args.get('name') \
        else f"{current_user.display_name}'s subtune {uuid.uuid4().hex[:6]}"
    subtune_desc = request.args.get('description') if request.args.get('description') else "test description"
    
    tunes_arg = request.args.getlist('tunes')
    tune_ids = tunes_arg.split(",") if tunes_arg else dummy_data # change to [] eventually
    if len(tune_ids) == 0:
        return {"status": "no tunes given"}, 400

    subtune= Subtune(name=subtune_name, description=subtune_desc, user_id=current_user.id)
    db.session.add(subtune)
    
    error_with_tunes = []

    # get tune objects
    for idx, tune_id in enumerate(tune_ids, 1):
        res, http_res_code = get_tune(tune_id)
        
        # something went wrong retrieving the tune
        if "tune" not in res:
            error_with_tunes.append({"Error": res, "HTTPResponse code": http_res_code})
            continue
        
        # 'add' tune to subtune
        subtune.subtune_tunes.append(Subtune_Tune(tune_id=tune_id, order_in_subtune=idx))

    # save all subtune_tune's and subtune object to db
    db.session.commit()
    
    error_with_tunes = error_with_tunes if len(error_with_tunes) > 0 else None
    return {"subtune": subtune, "Error with tunes": error_with_tunes}, 200

@bp.route("/delete/subtune/<id>", methods=["DELETE", 'GET']) # `/delete/` & `GET` added just for testing for now, should remove once we have a front end
def delete_subtune(id=1):
    """
        For now this endpoint deletes any subtune with the given id, no user authentication is done.
        The same action can be done with pgadmin, but maybe we want a similar endpoint in the future
        and another default endpoint that requires a user to be logged in to use in the front end
    """
    with current_app.app_context():
        subtune = Subtune.query.get(id)
        if subtune is None:
            return {"status": "subtune not found"}, 404
        db.session.delete(subtune)
        db.session.commit()
        return {"status": "subtune deleted"}, 200


