// pages/index.js
'use client'

import { useState, useEffect } from 'react';
import '../../globals.css';
import './page.css'

const Home = () => {
  const [query, setQuery] = useState('');
  const [musicData, setSubtuneData] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/search/subtune?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      // Update the state with the fetched data
      setSubtuneData(data["subtunes"]);
      console.log(data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // You can add additional logic or use fetchData() if needed
  }, []);

  return (
    <div>
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your search query"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <ul>
        {musicData.map((item, index) => (
          <li key={index}>
            <p>ID: {item.id}</p>
            <p>Name: {item.name}</p>
            <p>Artist: {item.description}</p>
            <p>User id: {item.user_id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
