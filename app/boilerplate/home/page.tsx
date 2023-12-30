'use client'

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Subtune from '../components/Subtune';
import Playlist from '../components/Playlist';

import Link from 'next/link'

const Home = () => {
  const [subtunes, setSubtunes] = useState([]);
  const [playlists, setPlaylists] = useState([]);

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
        const response = await fetch('/api/user/1/playlists');
        const data = await response.json();
        console.log("return from api: \n\n" + JSON.stringify(data));
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchPlaylists();
  }, []); // Empty dependency array to fetch data once on component mount

  return (
    <div>
      <Navigation />
      <div className='preview'>
        <p>Subtunes</p>
        {
        subtunes && Array.isArray(subtunes) && subtunes.slice(0, 5).map((subtune) => (
          <div className='item'>
            <Subtune subtuneObj={subtune["subtune"]} />
          </div>
        ))}
      </div>
      <div className='see-all-button'>
        <Link href="/boilerplate/viewsubtunes">All Subtunes</Link>
      </div>
      <p> ___</p>
      <div className='preview'>
        <p>Playlists</p>
        {
        playlists && Array.isArray(playlists) && playlists.slice(0, 5).map((playlist) => (
          <div className='item'>
            <Playlist playlistObj={playlist["playlist"]} />
          </div>
        ))}
      </div>
      <div className='see-all-button'>
        <Link href="/boilerplate/viewplaylists">All Playlists</Link>
      </div>
    </div>
  );
};

export default Home;