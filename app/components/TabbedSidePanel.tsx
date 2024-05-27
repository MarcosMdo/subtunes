// TODO: have a 'db listener' to see if a 
// new subtune/playlist has been created to re-fetch data
'use client';
import React, { memo, useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import DDContainer from './DDContainer';

import { Tsubtune } from '../subtuneTypes/Subtune';
import { Tplaylist } from '../subtuneTypes/Playlist';
import { nanoid } from 'nanoid';

import { AnimatePresence, motion } from 'framer-motion';

import { IconButton } from '@mui/material';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { prepPlaylistsForDnd, prepSubtunesForDnd} from '../utils/helperFunctions';

const tabs = [
    { id: 'stubtune', label: 'Subtunes' },
    { id: 'playlist', label: 'Playlists' }
]

function TabbedSidePanel({
    side,
    id,
    items,
    toggle,
    toggleListener,
    onResults
}: {
    side: 'left' | 'right';
    id: string;
    items: Tsubtune[] | Tplaylist[];
    toggle: boolean;
    toggleListener: (data: any) => void;
    onResults: (data: Tsubtune[] | Tplaylist[], dataType: 'subtune' | 'playlist', clear?: boolean) => void;
}) {
    const [contentType, setContentType] = useState<string>('subtune');
    const [activeTab, setActiveTab] = useState<string>('subtune');

    useEffect(() => {
        if (contentType === 'subtune') {
            loadSubtunes();
        } else if (contentType === 'playlist') {
            loadPlaylists();
        }
    }, [contentType])

    const handleSearchResults = (data: any, hasNext?: boolean, clear?: boolean) => {
        onResults(data, contentType as 'subtune' | 'playlist', clear);
    }

    // UPDATE TO FETCH <USER_id> SPECIFIC DATA
    const loadPlaylists = async () => {
        try {
            const response = await fetch(`/api/user/1/playlists`);
            const data = await response.json();
            if ('error' in data) {
                return console.error('Error fetching playlists:', data.error);
            }
            let cleanData = prepPlaylistsForDnd(data);
            onResults(cleanData, 'playlist');
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    // UPDATE TO FETCH <USER_id> SPECIFIC DATA
    const loadSubtunes = async () => {
        try {
            const response = await fetch(`/api/user/1/subtunes`);
            const data = await response.json();
            if ('error' in data) {
                return console.error('Error fetching playlists:', data.error);
            }
            let cleanData = prepSubtunesForDnd(data);
            onResults(cleanData, 'subtune');
        } catch (error) {
            console.error('Error fetching subtunes:', error);
        }
    }

    const handleFilterStatus = (clear: boolean) => {
        if (clear) {
            if (contentType === 'subtune') {
                loadSubtunes();
            } else if (contentType === 'playlist') {
                loadPlaylists();
            }
        }
    }

    const toggleContents = (e: any) => {
        setContentType(e.target.innerText.slice(0, -1));
    }

    return (
        <motion.div id={id} onDoubleClick={toggleListener} className={`flex flex-row grow shrink w-full min-w-[566px] min-h-[80vh] max-h-[80vh] py-8 px-4 ${side === 'left' ? "flex-row" : "flex-row-reverse"}`}>
            <div className="flex flex-col h-full grow shrink rounded-3xl px-4 py-4 bg-slate-100/[15%] align-end ring-1 ring-slate-100">
                <SearchBar isFilter clearFilter={handleFilterStatus} onSubmit={handleSearchResults} searchTarget={contentType as 'subtune' | 'playlist'} />
                <div className="flex flex-row w-full justify-evenly py-2.5 ">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            name={tab.id}
                            onClick={(e) => { setActiveTab(tab.id); toggleContents(e) }}
                            className={`${activeTab === tab.id ? "" : "hover:opacity-50"} relative rounded-full px-3 py-1.5 font-medium outline-2`}>
                            {activeTab === tab.id && (
                                <motion.div 
                                transition={{ type: 'spring', stiffness: 700, damping: 30}}
                                layoutId='active-id' 
                                className="absolute inset-0 rounded-xl bg-slate-200/25 ring-1 ring-slate-100" />
                            )}
                            <span className="relative">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <AnimatePresence>
                    {toggle &&
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.25 }}
                            className=" flex flex-col no-scrollbar overflow-y-scroll shadow-2xl  px-4 content-center rounded-2xl pb-12"
                        >
                            {
                                items.map((item: Tsubtune | Tplaylist) => (
                                    <DDContainer key={`${nanoid(11)}`} item={item} />
                                ))
                            }
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
            <div className='self-center'>
                <IconButton onClick={toggleListener} disableFocusRipple={false}>
                    <DragIndicatorRoundedIcon fontSize='large' />
                </IconButton>
            </div>
        </motion.div>
    )
}

export default memo(TabbedSidePanel);

