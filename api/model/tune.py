from dataclasses import dataclass

@dataclass(init=True, repr=True, eq=True, order=True, frozen=True)
class TuneModel():
    id : int
    url : str
    uri : str
    name : str
    artist : str
    album : str
    image_url : str
    duration : int