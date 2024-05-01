import TuneList from './TuneList';
import TuneObj from './Tune';
import { subtune } from '../../subtuneTypes/Subtune';

import Link from 'next/link';

// Note on Tune component:
// Originally I planned on making this a class, but for rendering 
// purposes and nextjs standards, this seems expected.


const Subtune = ({ subtuneObj }: {subtuneObj: subtune}) => {
  //console.log(subtuneObj);
  const subtune: subtune = subtuneObj;

  return (
    <Link href={{pathname: `/boilerplate/editsubtune`, query: {id: subtune.id}}}>
      <div className='subtune' >
      <div className='subtune-meta' style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: 'auto' }}>
            <h1>{subtune.name}</h1>
            <p>{subtune.description}</p>
          </div>
          <div>
            <img src={subtune.image_url} width={'64px'} style={{paddingRight: '10px'}} />
          </div>
        </div>
        <div className='tunes'>
          {subtune.tunes && <TuneList tunes={subtune.tunes} onAddTune={null} />}
        </div>
      </div>
    </Link>
  );
};

export default Subtune;