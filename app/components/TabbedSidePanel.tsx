'use client'

import React, { useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import DDContainer from './DDContainer';

import { subtune } from '../subtuneTypes/Subtune';
import { playlist } from '../subtuneTypes/Playlist';
import { tune } from '../subtuneTypes/Tune';

import { nanoid } from 'nanoid';


import { IconButton } from '@mui/material';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { on } from 'events';
import { SortableContext } from '@dnd-kit/sortable';
import { DndContext, useDroppable } from '@dnd-kit/core';


export default function TabbedSidePanel(
    {
        id, 
        side, 
        searchTarget,
        items,
        toggleListener,
        onResults,
    }:{
        id: string; 
        side: 'left' | 'right'; 
        searchTarget: 'playlist' | 'subtune';
        items: subtune[] | playlist[];
        toggleListener: (data: any) => void;
        onResults: (data: subtune[] | playlist[], dataType: 'subtune' | 'playlist', clear?: boolean) => void;
    }) {
    const [contents, setContents] = useState<subtune[] | playlist[]>([]);
    const [contentType, setContentType] = useState<string>('subtune');
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    const handleSearchResults = (data: any, hasNext?: boolean, clear?: boolean) => {
        console.log(data)
        // setContents(data);
        onResults(data, contentType as 'subtune' | 'playlist', clear);
    }
    // UPDATE TO FETCH <USER_id> SPECIFIC DATA
    const loadPlaylists = async () => {
        try {
            const response = await fetch(`/api/user/1/playlist`);
            const data = await response.json();
            // setContents(data);
            onResults(data, 'playlist');
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    // UPDATE TO FETCH <USER_id> SPECIFIC DATA
    const loadSubtunes = async () => { 
        try {
            const response = await fetch(`/api/user/1/subtunes`);
            const data = await response.json();
            // setContents(data);
            const cleanData = data.map((item: { subtune: subtune }) => item.subtune);
            onResults(cleanData, 'subtune');
        } catch (error) {
            console.error('Error fetching subtunes:', error);
        }
    
    }

    const handleFilterStatus = (clear: boolean) => {
        if(clear){
            if(contentType === 'subtune'){
                loadSubtunes();
            } else if(contentType === 'playlist'){
                loadPlaylists();
            }
        }
    }

    const toggleContents = (e: any) => {
        const prevContentType = contentType;
        setContentType(e.target.name)
        // TODO: add a check to prevent reloading the same content
        if(contentType === 'subtune'){
            loadSubtunes();
        } else if(contentType === 'playlist'){
            loadPlaylists();
        }
    }

    // useEffect(() => {
    //     console.log("initial load of ", searchTarget);
    //     if(contentType === 'subtune'){
    //         loadSubtunes();
    //     } else if(contentType === 'playlist'){
    //         loadPlaylists();
    //     }
    // }, []);

    return (
        // <DndContext>
        // <SortableContext
        //     items={items}
        //     id={`${id}-sortable-context`}
        // >
        <div id={id} onDoubleClick={toggleListener} className={`flex w-full min-h-[80vh] max-h-[80vh] py-8 px-4 ${side === 'left' ? "flex-row" : "flex-row-reverse" }`}>
            <div className="felx flex-col w-full h-[80vh] rounded-2xl p-6 border-2 border-red-500 content-center justify-start">
                <div className="flex flex-col w-full rounded-2xl mb-2 border-2 border-blue-500">
                    <div className="flex flex-row w-full justify-evenly border-2 border-yellow-500">
                        <button name="subtune" onClick={toggleContents} className="border-2 border-green-500" >subtunes</button>
                        <button name="playlist" onClick={toggleContents} className="border-2 border-green-500" >playlists</button>
                    </div>
                    <div className="flex flex-row w-full h-full py-2 grow shrink">
                        <SearchBar isFilter clearFilter={handleFilterStatus} onSubmit={handleSearchResults} searchTarget={contentType as "tune" | "playlist" | "subtune"} />
                    </div>
                </div>
                <div  className="flex flex-col w-full h-[90%] max-h-full overflow-y-scroll border-2 border-red-500">
                    {items.map((item: subtune | playlist) => (
                        <DDContainer key={`${nanoid(11)}.${item.name}`} id={`${nanoid(11)}.${item.name}`} item={item} />
                    ))}
                </div>
            </div>
            <div className='self-center'>
                    <IconButton onClick={toggleListener}  disableFocusRipple={false}>
                        <DragIndicatorRoundedIcon fontSize='large'/>
                    </IconButton>
            </div>
        </div>
        // </SortableContext>
        // </DndContext>
    )
}

