import React from 'react';

// Note on Tune component:
// Originally I planned on making this a class, but for rendering 
// purposes and nextjs standards, this seems expected.

const Tune = ({ tune, onClick }) => {
  const id = tune["id"];
  const name = tune["name"];
  const artist = tune["artist"];
  const url = tune["preview_url"];

  // until endpoint on backend returns these fields, need to blank them out.
  //const album = tuneData["album"]["name"];
  //const imageUrl = tuneData["album"]["images"][0]["url"];
  //const duration = tuneData["duration_ms"];
  //const popularity = tuneData["popularity"];
  //const uri = tuneData["uri"];

  return (
    <div className='tune'>
        <li onClick={() => onClick({ id, name, artist, external: url })}>
            <p>Name: {name}</p>
            <p>Artist: {artist}</p>
            <a href={url}>Preview Song</a>
            <p>ID: {id}</p>
        </li>
    </div>
  );
};

export default Tune;