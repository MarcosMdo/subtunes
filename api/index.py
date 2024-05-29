from urllib.parse import quote
from flask import Flask, redirect, url_for, flash
from flask_migrate import Migrate
import secrets
import os
from .database.db import db
from .model.user import User
from flask_login import LoginManager, current_user, login_required, logout_user

from . import create_app

app = create_app()


@app.route("/")
def index():
    if os.environ.get('VERCEL_ENV') == 'production':
        return redirect(f"https://{os.environ.get('VERCEL_PROJECT_PRODUCTION_URL')}")
    elif os.environ.get('VERCEL_ENV') == 'preview':
        return redirect(os.environ.get('VERCEL_URL'))
    else:
        return redirect('http://127.0.0.1:3000/')

@app.route("/logout")
def logout():
    logout_user()
    
    if current_user.is_authenticated:
        return "{} should not be logged in".format(current_user.display_name)
    else:
        return "user has been logged out."

@app.route("/home")
def home():
    # TODO: redirect based on not logged in home page vs user dashboard when paths defined
    if os.environ.get('VERCEL_ENV') == 'production':
        return redirect(f"https://{os.environ.get('VERCEL_PROJECT_PRODUCTION_URL')}")
    elif os.environ.get('VERCEL_ENV') == 'preview':
        return redirect(os.environ.get('VERCEL_URL'))
    else:
        return redirect('http://127.0.0.1:3000/')


@app.login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.login_manager.unauthorized_handler
def unauthorized_callback():
    flash("You need to be logged in to access this page.", "error")
    return redirect(url_for('spotify_auth_api.login')) 