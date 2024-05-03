'use client'
import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import DDContainer from './DDContainer';

import { subtune } from '../subtuneTypes/Subtune';
import { playlist } from '../subtuneTypes/Playlist';
import { tune } from '../subtuneTypes/Tune';
import { nanoid } from 'nanoid';

import { motion } from 'framer-motion';

import { IconButton } from '@mui/material';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';

export default function TabbedSidePanel({
    side,  
    id, 
    items,
    toggleListener, 
    onResults
} : {
    side: 'left' | 'right'; 
    id: string; 
    items: subtune[] | playlist[];
    toggleListener: (data: any) => void; 
    onResults: (data: tune[] | subtune[] | playlist[], dataType: 'tune' | 'subtune' | 'playlist', clear?: boolean) => void;
}) {
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
            // setContents(data);
            onResults(data, 'playlist')
            console.log(data);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    const loadSubtunes = async () => { 
        try {
            const response = await fetch(`/api/user/1/subtunes`);
            let data = await response.json();
            data = data.map((item: any) => item.subtune);
            onResults(data, 'subtune')
            console.log(data);
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
    }, [contentType]);

    const toggleContents = (e: any) => {
        console.log(e.target.name)
        setContentType(e.target.name)
    }

    return (
<div id={id} onDoubleClick={toggleListener} className={`flex w-full min-h-[80vh] max-h-[80vh] py-8 px-4 ${side === 'left' ? "flex-row" : "flex-row-reverse" }`}>
                <div className="flex flex-col h-full grow shrink rounded-3xl p-4  bg-slate-100/[15%] align-start ring-1 ring-slate-100">
                    <div className="flex flex-row w-full justify-evenly border-2 border-yellow-500">
                        <button name="subtunes" onClick={toggleContents} className="border-2 border-green-500" >subtunes</button>
                        <button name="playlists" onClick={toggleContents} className="border-2 border-green-500" >playlists</button>
                    </div>
                    <SearchBar isFilter onSubmit={handleSearchResults} searchTarget={searchTarget}/>
                        <motion.div 
                        className="contents-container flex flex-col grow shrink no-scrollbar overflow-y-scroll mt-4 content-center rounded-2xl shadow-md" >
                        {
                            items.map((item: subtune | playlist) => (
                                <DDContainer key={`${nanoid(11)}`} item={item} />
                            ))
                        }

                        </motion.div>
                </div>
                <div className='self-center'>
                    <IconButton onClick={toggleListener}  disableFocusRipple={false}>
                        <DragIndicatorRoundedIcon fontSize='large'/>
                    </IconButton>
                </div>
        </div>
    )
}
        // <div id={id} className="felx flex-col w-full h-[70vh] border-2 border-red-500 overflow-clip">
        //     <div className="flex flex-col w-full border-2 border-blue-500 overflow-y-auto">
        //         <div className="flex flex-row w-full justify-evenly border-2 border-yellow-500">
        //             <button name="subtunes" onClick={toggleContents} className="border-2 border-green-500" >subtunes</button>
        //             <button name="playlists" onClick={toggleContents} className="border-2 border-green-500" >playlists</button>
        //         </div>
        //         <div className="flex flex-row w-full h-full py-2 grow shrink">
        //             <SearchBar onSubmit={handleSearchResults} searchTarget={searchTarget} />
        //         </div>
        //     </div>
        //     <div key={`${nanoid(11)}`} className="flex flex-col grow shrink w-full h-full overflow-y-auto no-scrollbar border-2 border-purple-500">
        //             {items.map((item: subtune | playlist) => (
        //                 <DDContainer key={`${nanoid(11)}`} item={item} />
        //             ))}
        //     </div>
        // </div>