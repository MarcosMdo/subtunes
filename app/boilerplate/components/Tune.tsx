import React from 'react';
import { Tune } from '../../subtuneTypes/Tune';


const Tune = ({ tuneObj, onClick }) => {
  const tune: Tune = tuneObj;

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