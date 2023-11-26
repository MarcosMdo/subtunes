from urllib.parse import quote
from flask import Flask, redirect, url_for
from flask_migrate import Migrate
import secrets
from .database.db import db
from .model import user, tune
from flask_login import LoginManager, current_user

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
