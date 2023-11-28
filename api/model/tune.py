from dataclasses import dataclass
from ..database.db import db

@dataclass(init=True, repr=True, eq=True, order=True)
class TuneModel(db.Model):
    id = db.Column(db.String(100), primary_key=True)
    url  = db.Column(db.String(100), unique=True, nullable=False)
    uri  = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    album  = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(100))
    duration = db.Column(db.Integer, nullable=False)
    
    
    def __repr__(self):
        return f"<Tune {self.name} by {self.artist}>"
    
    def __str__(self):
        return f"{self.name} by {self.artist}"