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
=======
const Subtune = ({ subtuneObj }) => {
  console.log(subtuneObj);
  const subtune: Subtune = subtuneObj;
  console.log("\n\n\n\n");
  console.log("subtune: " + subtune);
  // const id = subtune["id"];
  // const name = subtune["name"];
  // const description = subtune["description"];
  // const tunes = subtune["tunes"];
>>>>>>> b767d8d (adds viewsubtune and viewsubtunes view which pulls from backend)

  // until endpoint on backend returns these fields, need to blank them out.
  //const album = tuneData["album"]["name"];
  //const imageUrl = tuneData["album"]["images"][0]["url"];
  //const duration = tuneData["duration_ms"];
  //const popularity = tuneData["popularity"];
  //const uri = tuneData["uri"];

  return (
    <div>
      <div className='subtune-meta'>
        <p>Title: {subtune.name}</p>
        <p>Description: {subtune.description}</p>
      </div>
      <div className='tunes'>
<<<<<<< HEAD
        <TuneList tunes={tunes} onAddTune={null}/>
>>>>>>> 52b6049 (intermediary commit)
=======
        <TuneList tunes={subtune.tunes} onAddTune={null}/>
>>>>>>> b767d8d (adds viewsubtune and viewsubtunes view which pulls from backend)
      </div>
    </div>
  );
};

export default Subtune;