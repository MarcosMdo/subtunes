from dataclasses import dataclass
from ..database.db import db
from flask_login import UserMixin


@dataclass(init=True, repr=True, eq=True, order=True)
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    spotify_id = db.Column(db.String(50), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    image = db.Column(db.String(100))
    uri = db.Column(db.String(100))