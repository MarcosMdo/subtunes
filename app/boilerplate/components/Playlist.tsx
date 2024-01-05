import TuneList from './TuneList';
import TuneObj from './Tune';

// Note on Tune component:
// Originally I planned on making this a class, but for rendering 
// purposes and nextjs standards, this seems expected.

type Playlist = {
  id: string;
  name: string;
  description: string;
  tunes: Array<TuneObj>;
}

const Playlist = ({ playlistObj }) => {
  //console.log(playlistObj);
  const playlist: Playlist = playlistObj;

  return (
    <div className='playlist'>
      <div className='subtune-meta'>
        <h1>{playlist.name}</h1>
        <p>{playlist.description}</p>
      </div>
      <div className='tunes'>
        <TuneList tunes={playlist.tunes} onAddTune={null}/>
      </div>
    </div>
  );
};

export default Playlist;