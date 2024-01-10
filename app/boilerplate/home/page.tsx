'use client'

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Navigation from '../components/Navigation';
import Subtune from '../components/Subtune';
import Playlist from '../components/Playlist';
import { useRouter } from 'next/navigation';
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { subtune } from '../../subtuneTypes/Subtune';

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
    <div style={{ backgroundImage: 'url(../background.png)', backgroundSize: 'cover' }}>
      <Navigation />

      <div className='tabs'>
        <Link href='/boilerplate/home?tab=subtunes' className={`tab ${selectedTab === 'subtunes' ? 'selected' : ''}`} onClick={() => handleTabClick('subtunes')}> Subtunes </Link>
        <Link href='/boilerplate/home?tab=playlists' className={`tab ${selectedTab === 'playlists' ? 'selected' : ''}`} onClick={() => handleTabClick('playlists')}> Playlists </Link>
      </div>

      <div className='preview'>
        {selectedTab === 'subtunes' && (
          <>
            {subtunes && Array.isArray(subtunes) && subtunes.slice(0, 15).map((subtune) => (
              <div className='item' key={subtune.subtune.id} >
                <Subtune subtuneObj={subtune.subtune} />
              </div>
            ))}
          </>
        )}

        {selectedTab === 'playlists' && (
          <>
            {playlists && Array.isArray(playlists) && playlists.slice(0, 15).map((playlist) => (
              <div className='item' key={playlist.playlist.id}>
                <Playlist playlistObj={playlist.playlist} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
