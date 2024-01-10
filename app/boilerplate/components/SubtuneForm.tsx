import { useState } from 'react';
import TuneList from './TuneList';

import { HexColorPicker, HexColorInput } from "react-colorful";
import { AnimatePresence, motion } from "framer-motion"

const SubtuneForm = ({ onSubmit, tunes, onTitleChange, onDescriptionChange, subtuneColor, setSubtuneColor, onSetImage}) => {

    const [showColorPicker, setShowColorPicker] = useState(false);

    const toggleColorPicker = () => {
      setShowColorPicker(!showColorPicker);
    };
    
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
        
        <div>
          <button onClick={onSubmit}>Create Subtune</button>
          |
          <button type='button' onClick={toggleColorPicker}>Color Picker</button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div className='color-picker' style={{ position: 'absolute', left: '150px'}}
              key="color-picker"
              initial={{ opacity: 0, scale: 0.25, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.125, rotate: -90 }}
              transition={{
                duration: 0.3,
                ease: [0, 0.71, 0.45, 1.01],
                scale: {
                  type: "spring",
                  damping: 15,
                  stiffness: 100,
                  restDelta: 0.001
                }
              }}
              >
                <HexColorPicker color={subtuneColor} onChange={setSubtuneColor} />
                <HexColorInput className='color-input' color={subtuneColor} onChange={setSubtuneColor} />
              </motion.div>
            )}
            </AnimatePresence>
            <br />
            <input type='file' onChange={onSetImage} />
        </div>
          <TuneList tunes={tunes} onAddTune={null}/>
      </form>
    );
  };
  
  export default SubtuneForm;