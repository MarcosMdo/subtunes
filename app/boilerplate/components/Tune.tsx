import React from 'react';

interface Tune {
  id: string;
  name: string;
  artist: string;
  url_preview: string;
}

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
            <p>{tune.name}</p>
            <p>{tune.artist}</p>
            {/* <a href={tune.url_preview}>Preview Song</a> */}
            {/* <p>ID: {tune.id}</p> */}
        </li>
    </div>
  );
};

export default Tune;