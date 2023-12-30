'use client'

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Subtune from '../components/Subtune';

const ViewSubtunes = () => {
  const [subtunes, setSubtunes] = useState([]);
  const [backup, setBackup] = useState([]);

  useEffect(() => {
    const fetchSubtune = async () => {
      try {
        const response = await fetch('/api/user/1/subtunes');
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setSubtunes(data);
        setBackup(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchSubtune();
  }, []); // Empty dependency array to fetch data once on component mount

  const handleSearch = async (query) => {
    // Trigger API call with query and update searchResults
    try {
      const response = await fetch(`/api/search/subtune?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log(data);
      setSubtunes(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const resetSearch = () => {
    setSubtunes(backup);
  }

  return (
    <div>
      <Navigation />
      <div className='search-bar'>
        <SearchBar onSearch={handleSearch} />
      </div>
      <a onClick={resetSearch}>Clear</a>
      <div className='container'>
        {
        subtunes.map((subtune) => (
          <div className='item'>
            <Subtune subtuneObj={subtune["subtune"]} />
          </div>
        ))}
      </div>      
      
    </div>
  );
};

export default ViewSubtunes;