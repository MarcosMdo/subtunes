'use client'

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Navigation from '../components/Navigation';
import Subtune from '../components/Subtune';
import Playlist from '../components/Playlist';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
import Link from 'next/link';

import './page.css';

const Home = ({searchParams}) => {
  const router = useRouter();
  const [subtunes, setSubtunes] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTab, setSelectedTab] = useState( searchParams.tab ? searchParams.tab : 'subtunes');
  
  useEffect(() => {
    const fetchSubtunes = async () => {
      try {
        const response = await fetch('/api/user/1/subtunes');
        const data = await response.json();
        setSubtunes(data);
      } catch (error) {
        console.error('Error fetching subtune:', error);
      }
    };

    fetchSubtunes();
  }, []);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch('/api/user/1/playlists');
        const data = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching playlist:', error);
      }
    };

    fetchPlaylists();
  }, []);

  useEffect(() => {
    const queryTab = searchParams.tab;

    if (queryTab && queryTab !== selectedTab) {
      handleTabClick(queryTab);
    }

  }, [searchParams, selectedTab]);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };
  

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
