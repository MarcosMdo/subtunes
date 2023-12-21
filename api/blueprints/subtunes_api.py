import requests
import copy
import uuid
from urllib.parse import quote

from ..database.db import db
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import insert

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

# get subtune by id
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
        
        response = {"title": subtune.name, "description": subtune.description}
        
        # get relavent rows from link table
        subtune_tunes = sorted(subtune.subtune_tunes, key=lambda subtune_tune: subtune_tune.order_in_subtune)
        
        # get tunes from link table 
        response["tunes"] = [subtune_tune.tune for subtune_tune in subtune_tunes]
        
        return response, 200
        
    return {"Error": "something went really wrong"}, 500

# get all subtunes for a user
@bp.route("/user/<user_id>/subtunes", methods=["GET"])
@login_required
def get_user_subtunes(user_id=-1):
    with current_app.app_context():
        # return all subtunes for this user
        user_subtunes = Subtune.query.filter_by(user_id=user_id).all()

        if not user_subtunes:
            return {"status": "no subtunes found for this user"}, 404
        
        response = []

        for subtune in user_subtunes:
            res, code = get_subtune_by_id(subtune.id)

            if "status" in res or "Error" in res:
                return res, code
            
            response.append(res)
        
        return response, 200

# save subtune to db
@bp.route("/subtune", methods=["POST"])
@login_required
def save_subtune():
    """
    NOTE: added a `error_with_tunes` field to the response, this will be a list of 
    errors if any for a given tune id. may not need but just in case for now.
    """
    
    request_body = request.get_json()
    
    if "name" not in request_body:
        return {"status": "subtune name is required"}, 400
    if "tunes" not in request_body or len(request_body["tunes"]) == 0:
        return {"status": "no tunes given"}, 400
    
    
    name = request_body["name"]
    description = request_body["description"]
    tune_ids = request_body["tunes"]

    subtune= Subtune(name=name, description=description, user_id=current_user.id)
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

    # save all subtune_tune's and the subtune object to db
    db.session.commit()
    
    error_with_tunes = error_with_tunes if len(error_with_tunes) > 0 else None
    return {"subtune": subtune, "Error with tunes": error_with_tunes}, 200

# update subtune
@bp.route("/subtune/<id>", methods=["PUT"])
def update_subtune(id=-1):
    subtune = Subtune.query.get(id)
    
    if subtune is None:
        return {"status": "subtune not found"}, 404
    
    body = request.get_json()
    
    if "name" in body:
        subtune.name = body["name"]
    if "description" in body:
        subtune.description = body["description"]
    
    if "new_tunes" in body:
        new_tunes = body["new_tunes"]
        
        for tune_id in new_tunes:
            res, http_res_code = get_tune(tune_id)
            
            # something went wrong retrieving the tune
            if "tune" not in res:
                return {"Error": res, "HTTPResponse code": http_res_code}, http_res_code
            
            # 'add' tune to subtune
            stmt = insert(Subtune_Tune).values(subtune_id=1, tune_id=tune_id)
            stmt = stmt.on_conflict_do_nothing(index_elements=['subtune_id', 'tune_id'])
            db.session.execute(stmt)
    
    #deletes tune from subtune, or do nothing
    if "remove_tunes" in body:
        for tune_id in body["remove_tunes"]:
            subtune_tune = Subtune_Tune.query.filter_by(subtune_id=id, tune_id=tune_id).delete()
    
    if "order" in body:
        for idx, tune_id in enumerate(body["order"]):
            subtune_tune = Subtune_Tune.query.filter_by(subtune_id=id, tune_id=tune_id).first()
            subtune_tune.order_in_subtune = idx
    
    db.session.commit()
    return {"subtune": subtune}, 200
    



# Delete subtune from db
@bp.route("/subtune/<id>", methods=["DELETE"]) 
@login_required
def delete_subtune(id=1):
    with current_app.app_context():
        subtune = Subtune.query.get(id)
        if subtune is None:
            return {"status": "subtune not found"}, 404
        db.session.delete(subtune)
        db.session.commit()
        return {"status": "subtune deleted"}, 200
