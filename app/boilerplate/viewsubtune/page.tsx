'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation';
import Subtune from '../components/Subtune';

const ViewSubtune = ({searchParams}) => {
  const [subtune, setSubtune] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchSubtune = async () => {
      try {
        if (searchParams && searchParams.id) {
          const id  = searchParams.id;
          const response = await fetch(`/api/subtune/${id}`);
          const data = await response.json();
          console.log("return from api: \n\n" + JSON.stringify(data));
          setSubtune(data["subtune"]);
        }
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchSubtune();
  }, [router, searchParams]); // Empty dependency array to fetch data once on component mount

  return (
    <div style={{ backgroundImage: 'url(../background.png)', backgroundSize: 'cover' }}>
      <Navigation />
      <Subtune subtuneObj={subtune} />
    </div>
  );
};

export default ViewSubtune;