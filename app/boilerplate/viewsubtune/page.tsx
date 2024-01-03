'use client'

import { useEffect, useState } from 'react';
import Subtune from '../components/Subtune';

const ViewSubtune = () => {
  const [subtune, setSubtune] = useState({});

  useEffect(() => {
    const fetchSubtune = async () => {
      try {
        const response = await fetch(`/api/subtune/1`);
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setSubtune(data["subtune"]);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchSubtune();
  }, []); // Empty dependency array to fetch data once on component mount

  return (
    <div>
      <Subtune subtuneObj={subtune} />
    </div>
  );
};

export default ViewSubtune;