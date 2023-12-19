import Tune from "./Tune"
import React from 'react';

// components/SongList.js
const TuneList = ({ tunes, onAddTune }) => {
  return (
    <ul>
      {tunes && tunes.map((tune, index) => (
          <Tune key={index} tune={tune} onClick={() => onAddTune(tune)} />
      ))}
    </ul>
  );
};
  
export default TuneList;