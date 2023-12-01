from dataclasses import dataclass
from ..database.db import db
from flask_login import UserMixin


@dataclass(init=True, repr=True, eq=True, order=True)
class User(db.Model, UserMixin):
    id: int = db.Column(db.Integer, primary_key=True)
    spotify_id: str = db.Column(db.String(50), unique=True, nullable=False)
    display_name: str = db.Column(db.String(100))
    email: str = db.Column(db.String(100))
    image: str = db.Column(db.String(100))
    uri: str = db.Column(db.String(100))
