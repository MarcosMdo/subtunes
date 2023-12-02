'use client'
import { useState } from 'react';

const Search = () => {
  
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/search/tune?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      // Handle the data as needed
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your search query"
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default Search;