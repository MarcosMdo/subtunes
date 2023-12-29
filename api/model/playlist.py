from dataclasses import dataclass
from .subtune import Subtune
from ..database.db import db

@dataclass(init=True, repr=True, eq=True, order=True)
class Playlist(db.Model):
    __tablename__ = 'playlist'
    id: int = db.Column(db.String(100), primary_key=True)
    name: str = db.Column(db.String(100), nullable=False)
    description: str = db.Column(db.String(1000), nullable=False)
    user_id: int = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    from_subtunes: bool = db.Column(db.Boolean, default=True, nullable=True)
    snapshot_id: str = db.Column(db.String(100), nullable=True)
    
    db.UniqueConstraint(name, user_id, name='_playlist_uc')
    playlist_tunes = db.relationship('Playlist_Tune', backref='Playlist', lazy='subquery', cascade="all, delete-orphan")