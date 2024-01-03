'use client'

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Subtune from '../components/Playlist';
import SearchBar from '../components/SearchBar';

const ViewPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [backup, setBackup] = useState([]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch('/api/user/1/playlists');
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setPlaylists(data);
        setBackup(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchPlaylist();
  }, []); // Empty dependency array to fetch data once on component mount

  const handleSearch = async (query) => {
    // Trigger API call with query and update searchResults
    try {
      const response = await fetch(`/api/search/playlist?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log(data);
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const resetSearch = () => {
    setPlaylists(backup);
  }

  return (
    <div style={{ backgroundImage: 'url(../background.png)', backgroundSize: 'cover' }}>
      <Navigation />
      <div className='search-bar'>
        <SearchBar onSearch={handleSearch} />
      </div>
      <a onClick={resetSearch}>Clear</a>
      {
      playlists && Array.isArray(playlists) && playlists.map((playlist) => (
        <Subtune playlistObj={playlist["playlist"]} />
      ))}
    </div>
  );
};

export default ViewPlaylists;