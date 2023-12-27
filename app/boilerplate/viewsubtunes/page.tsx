'use client'

import { useEffect, useState } from 'react';
import Subtune from '../components/Subtune';

const ViewSubtunes = () => {
  const [subtunes, setSubtunes] = useState([]);

  useEffect(() => {
    const fetchSubtune = async () => {
      try {
        const response = await fetch('/api/user/1/subtunes');
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setSubtunes(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchSubtune();
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

export default ViewSubtunes;