import TuneList from './TuneList';
import TuneObj from './Tune';

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
  console.log(subtuneObj);
  const subtune: Subtune = subtuneObj;

  return (
    <div className='subtune'>
      <div className='subtune-meta'>
        <p>Title: {subtune.name}</p>
        <p>Description: {subtune.description}</p>
      </div>
      <div className='tunes'>
        <TuneList tunes={subtune.tunes} onAddTune={null}/>
      </div>
    </div>
  );
};

export default Subtune;