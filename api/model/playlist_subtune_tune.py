from dataclasses import dataclass
from ..database.db import db

@dataclass(init=True, repr=True, eq=True, order=True)
class Playlist_Subtune_Tune(db.Model):
    __tablename__ = 'playlist_subtune_tune'
    id = db.Column(db.Integer, primary_key=True)
    playlist_id = db.Column(db.String, db.ForeignKey('playlist.id'), nullable=False)
    subtune_id = db.Column(db.Integer, db.ForeignKey('subtune.id'), nullable=True)
    tune_id = db.Column(db.String(100), db.ForeignKey('tune.id'), nullable=True)
    order_in_playlist = db.Column(db.Integer, nullable=False)

    # Relationships
    playlist = db.relationship('Playlist', backref='playlist_subtune_tune', lazy='subquery', viewonly=True)
    subtune = db.relationship('Subtune', backref='playlist_subtune_tune', lazy='subquery', viewonly=True)
    tune = db.relationship('Tune', backref='playlist_subtune_tune', lazy='subquery', viewonly=True)
    