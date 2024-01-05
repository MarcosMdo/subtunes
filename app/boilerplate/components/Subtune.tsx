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

<<<<<<< HEAD
const Subtune = ({ subtuneObj }) => {
  console.log(subtuneObj);
  const subtune: Subtune = subtuneObj;

  return (
    <div className='subtune'>
      <div className='subtune-meta'>
        <h1>{subtune.name}</h1>
        <p>{subtune.description}</p>
      </div>
      <div className='tunes'>
        <TuneList tunes={subtune.tunes} onAddTune={null}/>
=======
const Subtune = ({ subtune }) => {
  const id = subtune["id"];
  const name = subtune["name"];
  const description = subtune["description"];
  const tunes = subtune["tunes"];

  // until endpoint on backend returns these fields, need to blank them out.
  //const album = tuneData["album"]["name"];
  //const imageUrl = tuneData["album"]["images"][0]["url"];
  //const duration = tuneData["duration_ms"];
  //const popularity = tuneData["popularity"];
  //const uri = tuneData["uri"];

  return (
    <div>
      <div className='subtune-meta'>
        <p>Title: {name}</p>
        <p>Description: {description}</p>
      </div>
      <div className='tunes'>
        <TuneList tunes={tunes} onAddTune={null}/>
>>>>>>> 52b6049 (intermediary commit)
      </div>
    </div>
  );
};

export default Subtune;