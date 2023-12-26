'use client'

import Subtune from '../components/Subtune';

import "../../globals.css"

const ViewSubtune = () => {
  const subtune = {
    "name": "my dummy playlist!",
    "description" : "its gettin a lil dummy in here",
    "id": "1",
    "tunes": [
      {
        "album": "Entren Los Que Quieran",
        "artist": "Calle 13",
        "duration": 234133,
        "id": "1jlKdNbOA90rjnt88GJnwO",
        "image_url": "https://i.scdn.co/image/ab67616d0000b27316c24c88236c87c148bb4329",
        "name": "La Vuelta Al Mundo",
        "popularity": 72,
        "preview_url": "https://p.scdn.co/mp3-preview/bac7a7931f47e82f4287c97926392457fe938ebb?cid=8ec871a4f62845869913cbc667b7f413",
        "uri": "spotify:track:1jlKdNbOA90rjnt88GJnwO",
        "url": "https://open.spotify.com/track/1jlKdNbOA90rjnt88GJnwO"
      },
      {
        "album": "Entren Los Que Quieran",
        "artist": "Calle 13",
        "duration": 301426,
        "id": "1xuYajTJZh8zZrPRmUaagf",
        "image_url": "https://i.scdn.co/image/ab67616d0000b27316c24c88236c87c148bb4329",
        "name": "Latinoam\u00e9rica (feat. Tot\u00f3 la Momposina, Susana Baca & Maria Rita)",
        "popularity": 65,
        "preview_url": "https://p.scdn.co/mp3-preview/8f7b83cff5ade43ea38c37a5513a1a600ccf4ea3?cid=8ec871a4f62845869913cbc667b7f413",
        "uri": "spotify:track:1xuYajTJZh8zZrPRmUaagf",
        "url": "https://open.spotify.com/track/1xuYajTJZh8zZrPRmUaagf"
      },
      {
        "album": "Entren Los Que Quieran",
        "artist": "Calle 13",
        "duration": 189866,
        "id": "3kNVYo6BJE9AENxzokM9YC",
        "image_url": "https://i.scdn.co/image/ab67616d0000b27316c24c88236c87c148bb4329",
        "name": "Muerte En Hawaii",
        "popularity": 74,
        "preview_url": "https://p.scdn.co/mp3-preview/3e580acca50994dd3c9db9113b2fc8519f7406d8?cid=8ec871a4f62845869913cbc667b7f413",
        "uri": "spotify:track:3kNVYo6BJE9AENxzokM9YC",
        "url": "https://open.spotify.com/track/3kNVYo6BJE9AENxzokM9YC"
      }
    ]
  }

  

  

  return (
    <div>
      <Subtune subtune={subtune} />
    </div>
  );
};

export default ViewSubtune;