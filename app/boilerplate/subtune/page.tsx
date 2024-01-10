'use client'

import { useState } from 'react';
import useSWR from 'swr';
import SearchBar from '../components/SearchBar';
import SubtuneForm from '../components/SubtuneForm';
import TuneList from '../components/TuneList';

import "../../globals.css"

const PlaylistCreator = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTunes, setSelectedTunes] = useState([]);

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

  const handleSubmitPlaylist = () => {
    // TODO: Implement logic to submit the subtune
    const subtuneData = {
      title: subtuneTitle,
      description: subtuneDescription,
      songs: selectedTunes,
    };

    console.log('Submitting Subtune:', subtuneData);
    // TODO: call endpoint to create subtune and properly format body.
  };

  return (
    <div>
      <div className='search-bar'>
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className='split-view'>
        <div className='left-column'>
          <SubtuneForm
            onSubmit={handleSubmitPlaylist}
            onTitleChange={(e) => setPlaylistTitle(e.target.value)}
            onDescriptionChange={(e) => setPlaylistDescription(e.target.value)}
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

export default PlaylistCreator;