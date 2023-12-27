import React from 'react';

// Note on Tune component:
// Originally I planned on making this a class, but for rendering 
// purposes and nextjs standards, this seems expected.

interface Tune {
  id: string;
  name: string;
  artist: string;
  url_preview: string;
}

const Tune = ({ tuneObj, onClick }) => {
  const tune: Tune = tuneObj;

  // until endpoint on backend returns these fields, need to blank them out.
  //const album = tuneData["album"]["name"];
  //const imageUrl = tuneData["album"]["images"][0]["url"];
  //const duration = tuneData["duration_ms"];
  //const popularity = tuneData["popularity"];
  //const uri = tuneData["uri"];

  return (
    <div className='tune'>
        <li onClick={() => onClick({ tune })}>
            <p>Name: {tune.name}</p>
            <p>Artist: {tune.artist}</p>
            <a href={tune.url_preview}>Preview Song</a>
            <p>ID: {tune.id}</p>
        </li>
    </div>
  );
};

export default Tune;