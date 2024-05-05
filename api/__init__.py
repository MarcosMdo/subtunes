from urllib.parse import quote
from flask import Flask
from flask_migrate import Migrate
import secrets
from .database.db import db
from flask_login import LoginManager, current_user, login_required, logout_user
import json
from dotenv import load_dotenv
import os

def create_app():
    
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:password@localhost/subtunes'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_TYPE'] = 'filesystem' 

    secret_key = secrets.token_hex(24)
    app.config['SECRET_KEY'] = secret_key
    
    register_blueprints(app)
    
    register_extensions(app)
    
    # add_aws_configs(app)

    add_env_vars(app)
    
    return app

# def add_aws_configs(app):
#     aws_configs = json.load(open("./api/aws_creds.json", "r+")) #api/aws_creds.json
#     app.config["AWS_ACCESS_KEY_ID"] = aws_configs["aws_access_key_id"]
#     app.config["AWS_SECRET_ACCESS_KEY"] = aws_configs["aws_secret_access_key"]

def app_configs(app, configs):
    pass

def add_env_vars(app):
    if os.environ.get("ENV") == None:
        load_dotenv()


def register_blueprints(app):
    PREFIX = "/api"
    
    from .blueprints.spotify_auth_api import bp as spotify_auth_api
    app.register_blueprint(spotify_auth_api)

    from .blueprints.tunes_api import bp as tunes_api
    app.register_blueprint(tunes_api, url_prefix=PREFIX)

    from .blueprints.search import bp as search_api
    app.register_blueprint(search_api, url_prefix=PREFIX)

    from .blueprints.playlist_api import bp as playlist_api
    app.register_blueprint(playlist_api, url_prefix=PREFIX)

    from .blueprints.subtunes_api import bp as subtunes_api
    app.register_blueprint(subtunes_api, url_prefix=PREFIX)
    


def register_extensions(app):
    db.init_app(app)
    migrate = Migrate(app, db)

    login_manager = LoginManager()
    login_manager.init_app(app)

