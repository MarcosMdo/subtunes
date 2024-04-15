'use client'

import { ChangeEvent, useState }  from 'react';
import useSWR from 'swr';
import Navigation from '../components/Navigation';
import SearchBar from '../components/SearchBar';
import SubtuneForm from '../components/SubtuneForm';
import TuneList from '../components/TuneList';
import { tune } from '../../subtuneTypes/Tune';

import { Reorder } from 'framer-motion';


import "../../globals.css"

const SubtuneCreator = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTunes, setSelectedTunes] = useState<tune[]>([]);
  const [subtuneTitle, setSubtuneTitle] = useState("");
  const [subtuneDescription, setSubtuneDescription] = useState("");
  const [subtuneColor, setSubtuneColor] = useState("#aabbcc");
  const [imageFile, setImageFile] = useState<File>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // should set size limit and file type checks later
    const files = event.target.files;
    if (files && files.length > 0){
      setImageFile(files[0]);
    }
  };

  const handleSearch = async (query: string) => {
    // Trigger API call with query and update searchResults
    try {
      const response = await fetch(`/api/search/tune?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data["tracks"]);
      console.log('Search results:', data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleAddTune = (tune : tune) => {
    // Add the selected song to the playlist
    setSelectedTunes((prevTunes: tune[]) => [...prevTunes, tune]);
  };

  const handleSubmitSubtune = async () => {
    // TODO: Implement logic to submit the subtune
    const tune_ids = selectedTunes.map(tune => tune.id);
    
    const subtuneData = {
      "name": subtuneTitle,
      "description": subtuneDescription,
      "tunes": tune_ids,
      "color": subtuneColor,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(subtuneData));
    // only append image if it exists
    imageFile && formData.append("image", imageFile);

    try {
      const response = await fetch('/api/subtune', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to create subtune');
      }
  
      const responseData = await response.json();
      console.log('Subtune created successfully:', responseData);
      // Handle any further logic after creating the subtune
    } catch (error) {
      console.error('Error creating subtune:', error);
      // Handle error scenarios
    }
  };

  return (
    <div style={{ backgroundImage: 'url(../background.png)', backgroundSize: 'cover' }}>
      <Navigation />
      <div className='search-bar'>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className='split-view'>
        <div className='left-column' style={{backgroundColor: subtuneColor, borderRadius: "15px"}}>
          <SubtuneForm
            onSubmit={handleSubmitSubtune}
            onTitleChange={(e: ChangeEvent<HTMLInputElement>) => setSubtuneTitle(e.target.value)}
            onDescriptionChange={(e: ChangeEvent<HTMLInputElement>) => setSubtuneDescription(e.target.value)}
            tunes={selectedTunes}
            subtuneColor={subtuneColor}
            setSubtuneColor={setSubtuneColor}
            onSetImage={handleFileChange}
          />
        </div>
        <div className='right-column'>
          <TuneList tunes={searchResults}
            onAddTune={handleAddTune}
          />
        </div>    
      </div>  
    </div>
  );
};

export default SubtuneCreator;