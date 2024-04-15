'use client'
import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import DDContainer from './DDContainer';

import { subtune } from '../subtuneTypes/Subtune';
import { playlist } from '../subtuneTypes/Playlist';

import { nanoid } from 'nanoid';

export default function TabbedSidePanel() {
    const [contents, setContents] = useState<subtune[] | playlist[]>([]);
    const [contentType, setContentType] = useState<string>('subtunes');

    const searchTarget = 'tune'
    const handleSearchResults = (data: any) => {
        console.log(data)
    }
    const loadPlaylists = async () => {

        try {
            const response = await fetch(`/api/user/1/playlist`);
            const data = await response.json();
            setContents(data);
            console.log(data);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    const loadSubtunes = async () => { 
        try {
            const response = await fetch(`/api/user/1/subtunes`);
            const data = await response.json();
            setContents(data);
            console.log(data);
        } catch (error) {
            console.error('Error fetching subtunes:', error);
        }
    
    }

    useEffect(() => {
        if(contentType === 'subtunes'){
            loadSubtunes()
        }else if(contentType === 'playlists'){
            loadPlaylists();
        }
    }, [window.onload, contentType]);

    const toggleContents = (e: any) => {
        console.log(e.target.name)
        setContentType(e.target.name)
    }

    return (
        <div className="felx flex-col w-full h-2/3 border-2 border-red-500 overflow-clip">
            <div className="flex flex-col w-full border-2 border-blue-500 overflow-y-auto">
                <div className="flex flex-row w-full justify-evenly border-2 border-yellow-500">
                    <button name="subtunes" onClick={toggleContents} className="border-2 border-green-500" >subtunes</button>
                    <button name="playlists" onClick={toggleContents} className="border-2 border-green-500" >playlists</button>
                </div>
                <div className="flex flex-row w-full h-full py-2 grow shrink">
                    <SearchBar onSubmit={handleSearchResults} searchTarget={searchTarget} />
                </div>
            </div>
            <div key={`${nanoid(11)}`} className="flex flex-col grow shrink w-full h-full overflow-y-auto no-scrollbar border-2 border-purple-500">
                    {contents.map((item: subtune | playlist) => (
                        <DDContainer key={`${nanoid(11)}`} item={item} />
                        // <p key={`${nanoid(11)}`}>samething</p>
                    ))}
            </div>
        </div>
    )
}
