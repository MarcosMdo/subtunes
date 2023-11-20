from urllib.parse import quote
from flask import Flask, redirect, url_for
import random
import string



app = Flask(__name__)

# generate random 16 character string for secrete key, needed for session object
N = 16
res = ''.join(random.choices(string.ascii_uppercase + string.digits, k=N))
app.config['SECRET_KEY'] = res

from .blueprints.spotify_auth_api import bp as spotify_auth_api
app.register_blueprint(spotify_auth_api)

from .blueprints.tunes_api import bp as tunes_api
app.register_blueprint(tunes_api)

@app.route("/")
def index():
    return redirect(url_for('spotify_auth_api.login'))
