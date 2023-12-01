from urllib.parse import quote
from flask import Flask, redirect, url_for
from flask_migrate import Migrate
import secrets
from .database.db import db
from .model.user import User
from flask_login import LoginManager, current_user, login_required, logout_user

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost/subtunes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_TYPE'] = 'filesystem' 

secret_key = secrets.token_hex(24)
app.config['SECRET_KEY'] = secret_key

db.init_app(app)
migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)

from .blueprints.spotify_auth_api import bp as spotify_auth_api
app.register_blueprint(spotify_auth_api)

from .blueprints.tunes_api import bp as tunes_api
app.register_blueprint(tunes_api)

@app.route("/")
def index():
    return redirect(url_for('spotify_auth_api.login'))

@app.route("/logout")
def logout():
    logout_user()
    
    if current_user.is_authenticated:
        return "{} should not be logged in".format(current_user.display_name)
    else:
        return "user has been logged out."

@app.route("/home")
def home():
    if current_user.is_authenticated:
        return "{} logged in".format(current_user.display_name)
    else:
        return "no user logged in."

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))