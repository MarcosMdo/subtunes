import TuneList from './TuneList';

const SubtuneForm = ({ onSubmit, tunes, onTitleChange, onDescriptionChange }) => {
    
    // TODO: must make onAddTune nullified somehow... right now throws error
    // when the user clicks on the tune within the subtune creator.
    return (
      <form className="subtune">
        <div className='title-container'>
        <input className="title"
            type="text"
            placeholder="Title"
            onChange={onTitleChange}
        />
        </div>
       <div className="decription-container">
        <input className='description'
                type="text"
                placeholder="Description"
                onChange={onDescriptionChange}
            />
       </div>
        
        <TuneList tunes={tunes} onAddTune={null}/>
        <button onClick={onSubmit}>Create Subtune</button>
      </form>
    );
  };
  
  export default SubtuneForm;