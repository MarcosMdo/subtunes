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
    db.UniqueConstraint(name, user_id, name='_playlist_uc')
    
    user = db.relationship('User', backref='playlist', lazy='subquery', viewonly=True)
    # subtune = db.relationship('Subtune', secondary='playlist_subtune_tune', backref=db.backref('playlists', lazy='dynamic'), viewonly=True)
    # tune = db.relationship('Tune', secondary='playlist_subtune_tune', backref=db.backref('playlists', lazy='dynamic'), viewonly=True)
    playlist_subtune_tunes = db.relationship('Playlist_Subtune_Tune', backref='Playlist', lazy='subquery', cascade="all, delete-orphan")