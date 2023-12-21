from dataclasses import dataclass
from .subtune import Subtune
from .tune import Tune
from ..database.db import db

@dataclass(init=True, repr=True, eq=True, order=True)
class Subtune_Tune(db.Model):
    __tablename__ = 'subtune_tune'
    id: int = db.Column(db.Integer, primary_key=True)
    subtune_id: int = db.Column(db.Integer, db.ForeignKey('subtune.id'), nullable=False)
    tune_id: str = db.Column(db.String(100), db.ForeignKey('tune.id') ,nullable=False)
    order_in_subtune: int = db.Column(db.Integer, default=0, nullable=False)
    db.UniqueConstraint(subtune_id, tune_id, name='_subtune_tune_uc') # explicitly name unique constraint
    
    """
        relate to the Tune and Subtune models, this allows us to access the Tune
        and Subtune objects from the Subtune_Tune object directly this reduces 
        the number of queries we need to make to the database to retrieve the
        tune objects for a given subtune.
        
        i.e instead of getting the list of tune ids from the subtune_tune table 
        and then getting the tune objects from the tune table with another 
        query, we can just get the tune objects directly from the subtune_tune table.
    """

    tune = db.relationship('Tune',backref='subtune_tune', lazy='subquery', viewonly=True)
    subtune = db.relationship('Subtune', backref='subtune_tune', lazy='subquery', viewonly=True)
