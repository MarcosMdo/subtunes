import TuneList from './TuneList';
import TuneObj from './Tune';

import Link from 'next/link';

// Note on Tune component:
// Originally I planned on making this a class, but for rendering 
// purposes and nextjs standards, this seems expected.

type Subtune = {
  id: string;
  name: string;
  description: string;
  tunes: Array<TuneObj>;
}


const Subtune = ({ subtuneObj }) => {
  //console.log(subtuneObj);
  const subtune: Subtune = subtuneObj;

  return (
    <Link href={{pathname: `/boilerplate/editsubtune`, query: {id: subtune.id}}}>
      <div className='subtune'>
        <div className='subtune-meta'>
          <h1>{subtune.name}</h1>
          <p>{subtune.description}</p>
        </div>
        <div className='tunes'>
          <TuneList tunes={subtune.tunes} onAddTune={null} />
        </div>
      </div>
    </Link>
  );
};

export default Subtune;