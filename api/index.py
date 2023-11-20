from urllib.parse import quote
from flask import Flask, redirect, url_for
import random
import string



app = Flask(__name__)

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"