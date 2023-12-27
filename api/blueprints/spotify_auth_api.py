""""This blueprint handles the authentication with Spotify."""

from urllib.parse import quote
from ..spotify_api_endpoints import spotify_endpoints
from ..model.user import User
from ..database.db import db
import requests
import base64
import time
import json


from flask import request, redirect, Blueprint, session, current_app, url_for
from flask_login import login_user

bp = Blueprint('spotify_auth_api', __name__)

CLIENT = json.load(open("./api/spotify_secrets.json", "r+"))
client_id = CLIENT['client_id']
scope = CLIENT['scope']
client_secret =  CLIENT['client_secret']
encoded_client_creds = base64.b64encode((client_id + ":" + client_secret).encode("ascii")).decode("ascii")

SPOTIFY_REDIRECT_URI = spotify_endpoints['SPOTIFY_REDIRECT_URI']
SPOTIFY_AUTH_URL = spotify_endpoints['SPOTIFY_AUTH_URL']
SPOTIFY_TOKEN_URL = spotify_endpoints['SPOTIFY_TOKEN_URL']
SPOTIFY_API_URL = spotify_endpoints['SPOTIFY_API_URL']

# don't know the best place for this just yet, maybe separate concerns and make a decorator or 2 from this?
def get_auth_header(expire_time = -1):
    """helper function to get the auth header for spotify api requests, renewing the token if necessary
    Args:
        expire_time (int, optional): pass in the session['expire_time'] of the current session.
        Defaults to -1 if session or session['expire_time] is None.
    Returns:
        Dict: returns a Dict with the Authorization header for spotify api requests that require authentication
    """
    if time.time() >= expire_time:
        refresh_payload = {
            "grant_type": "refresh_token",
            "refresh_token": session['refresh_token']
        }
        headers = {
            "content-type": "application/x-www-form-urlencoded", 
            "Authorization": "Basic " + encoded_client_creds
        }
        response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, params=refresh_payload)

        session['access_token'] = response.json()["access_token"]
        session['token_expires_in'] = response.json()["expires_in"]
        session['token_type'] = response.json()["token_type"]
        session['expire_time'] = time.time() + session['token_expires_in']

    return {"Authorization": "Bearer " + session['access_token']}


@bp.route("/api/login")
def login():
    """"
        login endpoint for spotify. redirects to the spotify login page.
        after logging in, spotify redirects to the callback endpoint.
    """
    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "scope": scope,
        "show_dialog": "true",
    }

    url_args = "&".join(["{}={}".format(key, quote(val)) for key, val in params.items()])
    auth_url = "{}/?{}".format(SPOTIFY_AUTH_URL, url_args)    

    return redirect(auth_url)


@bp.route("/callback")
def callback():
    """ 
        callback function for spotify login. after logging in, spotify redirects to this endpoint.
        this endpoint extracts the code from the url and makes a post request to spotify to get the access token.
    """
    code = request.args['code']

    headers = {
        "content-type": "application/x-www-form-urlencoded", 
        "Authorization": "Basic " + encoded_client_creds
    }

    code_payload = {
        "response_type": "code",
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": SPOTIFY_REDIRECT_URI,
    }

    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, params=code_payload)

    if response.status_code == 200:
        # Store tokens in the session
        session['access_token'] = response.json()["access_token"]
        session['refresh_token'] = response.json()["refresh_token"]
        session['token_expires_in'] = response.json()["expires_in"]
        session['token_type'] = response.json()["token_type"]
        session['expire_time'] = time.time() + session['token_expires_in']
        current_app.logger.info(session)

        access_token = response.json()["access_token"]
        refresh_token = response.json()["refresh_token"]
        login_successful = login_user_from_spotify(access_token, refresh_token)

        if login_successful:
            # Redirect to the home page or wherever you want
            return redirect(url_for('home'))
        else:
            return {'error': 'Failed to log in user'}, 500
    else:
        return {'error': 'Failed to authenticate with Spotify'}, response.status_code

def login_user_from_spotify(access_token, refresh_token):

    # Use the access token to get user data from Spotify /me endpoint
    user_info_url = f"{SPOTIFY_API_URL}/me"
    headers = {'Authorization': f'Bearer {access_token}'}
    user_info_response = requests.get(user_info_url, headers=headers)

    # Check the response status code
    if user_info_response.status_code == 200:
        user_info = user_info_response.json()
        current_app.logger.info("\nuser info: {}".format(user_info))

        #Check if the user exists in the database, otherwise create a new user
        with current_app.app_context():
            user = User.query.filter_by(spotify_id=user_info['id']).first()
        if not user:
            user = User(
                spotify_id=user_info['id'],
                display_name=user_info.get('display_name'),
                email=user_info.get('email'),
                image=user_info.get('images')[0]['url'] if user_info.get('images') else None,
                uri=user_info['uri']
            )
            db.session.add(user)
            db.session.commit()

        #Log in the user
        login_user(user)
        current_app.logger.info(f"\n\n\tuser logged in: {user}\n\n")

        return True  # User successfully logged in
    else:
        # If the status code is not 200, handle the error
        return False  # User login failed
