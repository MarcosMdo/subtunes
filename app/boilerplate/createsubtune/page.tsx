'use client'

import { useState } from 'react';
import useSWR from 'swr';
import SearchBar from '../components/SearchBar';
import SubtuneForm from '../components/SubtuneForm';
import TuneList from '../components/TuneList';

import "../../globals.css"

const SubtuneCreator = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTunes, setSelectedTunes] = useState([]);
  const [subtuneTitle, setSubtuneTitle] = useState("");
  const [subtuneDescription, setSubtuneDescription] = useState("");

  const handleSearch = async (query) => {
    // Trigger API call with query and update searchResults
    try {
      const response = await fetch(`/api/search/tune?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data["tracks"]);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleAddTune = (tune) => {
    // Add the selected song to the playlist
    setSelectedTunes((prevTunes) => [...prevTunes, tune]);
  };

  const handleSubmitSubtune = async () => {
    // TODO: Implement logic to submit the subtune
    const tune_ids = selectedTunes.map(tune => tune.id);
    
    const subtuneData = {
      "name": subtuneTitle,
      "description": subtuneDescription,
      "tunes": tune_ids
    };

    try {
      const response = await fetch('/api/subtune', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtuneData),
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
    <div>
      <div className='search-bar'>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className='split-view'>
        <div className='left-column'>
          <SubtuneForm
            onSubmit={handleSubmitSubtune}
            onTitleChange={(e) => setSubtuneTitle(e.target.value)}
            onDescriptionChange={(e) => setSubtuneDescription(e.target.value)}
            tunes={selectedTunes}
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