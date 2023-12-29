'use client'

import { useEffect, useState } from 'react';
import Subtune from '../components/Subtune';

const Home = () => {
  const [subtunes, setSubtunes] = useState([]);

  useEffect(() => {
    const fetchSubtunes = async () => {
      try {
        const response = await fetch('/api/user/1/subtunes');
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setSubtunes(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchSubtunes();
  }, []); // Empty dependency array to fetch data once on component mount


  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/user/1/subtunes');
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setSubtunes(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchPlaylists();
  }, []); // Empty dependency array to fetch data once on component mount

  return (
    <div>
      {/* <Subtune subtuneObj={subtunes} /> */}
      {
      subtunes.map((subtune) => (
        <Subtune subtuneObj={subtune["subtune"]} />
      ))}
    </div>
  );
};

export default Home;