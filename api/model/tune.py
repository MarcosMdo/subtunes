from dataclasses import dataclass
from ..database.db import db

@dataclass(init=True, repr=True, eq=True, order=True)
class Tune(db.Model):
    __tablename__ = 'tune'
    id: str = db.Column(db.String(100), primary_key=True)
    url: str  = db.Column(db.String(100), unique=True, nullable=False)
    uri: str  = db.Column(db.String(100), unique=True, nullable=False)
    name: str = db.Column(db.String(100), nullable=False)
    artist: str = db.Column(db.String(100), nullable=False)
    album: str  = db.Column(db.String(100), nullable=False)
    image_url: str = db.Column(db.String(100))
    duration: int = db.Column(db.Integer, nullable=False)
    
    subtune_tunes = db.relationship('Subtune_Tune', backref='tune', lazy='subquery', cascade='all, delete-orphan') #lazy='dynamic' # lazy='subquery' # lazy='joined' # lazy='select' # lazy='immediate' # lazy='noload' # lazy='raise'    
