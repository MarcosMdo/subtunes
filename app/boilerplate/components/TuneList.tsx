import Tune from "./Tune"
import { Ttune } from '../../subtuneTypes/Tune';
import React, {useState} from 'react';

import { Reorder } from 'framer-motion';

// components/SongList.js
const TuneList = ({ tunes, onAddTune }) => {
  const [tunesList, setTunesList] = useState(tunes);

  return (
    <Reorder.Group values={tunesList} onReorder={setTunesList}>
      {tunesList.map((tune, index) => (
          <Tune key={index} tuneObj={tune} onClick={() => onAddTune(tune)} />
      ))}
  </Reorder.Group>
  );
};


  
export default TuneList;