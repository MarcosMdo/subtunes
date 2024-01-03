import React from 'react';

interface Tune {
  id: string;
  name: string;
  artist: string;
  url_preview: string;
}

const Tune = ({ tuneObj, onClick }) => {
  const tune: Tune = tuneObj;

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