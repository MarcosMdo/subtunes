from dataclasses import dataclass
from ..database.db import db

@dataclass(init=True, repr=True, eq=True, order=True)
class Subtune(db.Model):
    __tabename__ = 'subtune'
    id: int = db.Column(db.Integer, primary_key=True)
    name: str = db.Column(db.String(100), nullable=False)
    description: str = db.Column(db.String(150), nullable=True)
    user_id: int = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at: str = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    last_edited: str = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    color: str = db.Column(db.String(7), nullable=False, default='#FFFFFF')
    image_url: str = db.Column(db.String(500), nullable=True)
    
    subtune_tunes = db.relationship('Subtune_Tune', backref='Subtune', lazy='subquery', cascade="all, delete-orphan")
