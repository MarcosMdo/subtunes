import requests
from urllib.parse import quote

from ..database.db import db
from ..model.subtune import Subtune
from ..model.subtune_tune import Subtune_Tune
from ..model.tune import Tune

from ..spotify_api_endpoints import spotify_endpoints
from ..blueprints.spotify_auth_api import get_auth_header

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
        subtune_tunes = subtune.subtune_tunes
        # get all the tune records in tune table for this subtune given the subtune_tunes link table
        tune_objects = [subtune_tune.tune for subtune_tune in subtune_tunes]
        tunes_in_subtune[subtune.name] = [tune for tune in tune_objects]
        
        return tunes_in_subtune, 200
        
    return {"Error": "something went really wrong"}, 500

@bp.route("/user/<user_id>/subtunes", methods=["GET"])
@login_required
def get_user_subtunes(user_id=-1):
    with current_app.app_context():
        # return all subtunes for this user
        user_subtunes = Subtune.query.filter_by(user_id=user_id).all()
        current_app.logger.info(f"\n\n\tnumber of subtunes: {len(user_subtunes)}\n\n")
        if not user_subtunes:
            return {"status": "no subtunes found for this user"}, 404
        subtune_res = {}
        buff = 0 # appends a number to the subtune name to make it unique (for testing), 
        # should we enforce unique subtune names??
        for subtune in user_subtunes:
            # get all records in subtune_tunes table for this subtune
            subtune_tunes = subtune.subtune_tunes
            # get all the tune records in tune table for this subtune given the subtune_tunes link table
            tune_objects = [subtune_tune.tune for subtune_tune in subtune_tunes]
            # subtune_res[subtune.name] = jsonify(tunes=[tune for tune in tune_objects])
            subtune_res[subtune.name+str(buff)] = [tune for tune in tune_objects]
            buff += 1
        current_app.logger.info(f"\n\n\tsubtune_res length: {len(subtune_res)}\n\n")
        return subtune_res, 200
        # return tunes_json, 200

# dummy_data = ["5YY7ht3PCArlLjLbcTiAvh", "4urciuKll77Us0CpoAaYt0", "2zSuWrakRZKwWaLtHUvtnz", "7v8kE3NhsgbTtJnI0fwoss", "2Nd1dImwW0VVN5HJ9MfvUd"]
dummy_data = ["1jlKdNbOA90rjnt88GJnwO", "1xuYajTJZh8zZrPRmUaagf", "3kNVYo6BJE9AENxzokM9YC", "1q8NdCAQ9QUjpYiqzdd3mv", "1U5X9bPu8xXHuejzUAi4Bx"]

@bp.route("/create/subtune", methods=["POST", "GET"]) # `/create/` & `GET` for testing for now, should remove once we have a front end
@login_required
def save_subtune():
    tunes_arg = request.args.getlist('tunes')
    tunes = tunes_arg.split(",") if tunes_arg else dummy_data
    if len(tunes) == 0:
        return {"status": "no tunes given"}, 400

    with current_app.app_context():
        subtune_object = Subtune(name="test2", description="test description", user_id=1)
        current_app.logger.info(f"\n\nsubtune: {subtune_object}, saved to db\n")
        db.session.add(subtune_object)
        db.session.commit()
        subtune_id = subtune_object.id  
        for tune_id in tunes:
            # check if the tune is already in the database
            tune = Tune.query.filter_by(id=tune_id).first()
            # if its not in the db, get it from spotify and save it to the db
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
            # have to re-query the subtune again if not it raises a sqlalchemy.orm.exc.DetachedInstanceError, need a fix later
            subtune_object = Subtune.query.get(subtune_id)
            subtune_object.subtune_tunes.append(Subtune_Tune(subtune_id=subtune_id, tune_id=tune.id))
            current_app.logger.info(f"\n\nsubtune_tune: {subtune_object}, saved to db\n")

        db.session.add(subtune_object)
        db.session.commit()
        subtune_final = Subtune.query.get(subtune_id)
        return {"subtune": subtune_final}, 200

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


