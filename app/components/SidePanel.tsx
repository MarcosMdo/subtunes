// TODO: side panel component that grows and shrinks horizontally
import { useState, useRef } from 'react';

import { motion } from "framer-motion";

import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { IconButton } from '@mui/material';

import SearchBar from './SearchBar';
import DndList from './DndList';
import { tune } from '../subtuneTypes/Tune';
import { subtune } from '../subtuneTypes/Subtune';
import { playlist } from '../subtuneTypes/Playlist';

import { AnimatePresence } from 'framer-motion';
import DDContainer from './DDContainer';

export default function SidePanel({
        side, 
        searchTarget, 
        id, 
        items,
        toggleListener, 
        onResults
    } : {
        side: 'left' | 'right'; 
        searchTarget: 'tune' | 'playlist' | 'subtune'; 
        id: string; 
        items: tune[] | subtune[] | playlist[];
        toggleListener: (data: any) => void; 
        onResults: (data: tune[] | subtune[] | playlist[], dataType: 'tune' | 'subtune' | 'playlist', clear?: boolean) => void;
    }) {
    const hasNext = useRef<boolean>(false);

    const handleSearchResults = async (data: tune[] | subtune[] | playlist[], next?: boolean, clear?: boolean) => {
        let results = null;
        hasNext.current = next as boolean;
        if( searchTarget === 'tune'){
            results = await data as tune[];
            return onResults(results, searchTarget, clear);
        }
        if (searchTarget === 'subtune'){
            results = await data as subtune[];
            return onResults(results, searchTarget, clear);
        }
        if (searchTarget === 'playlist'){
            results = await data as playlist[];
            return onResults(results, searchTarget, clear);
        }

    } 
    // Should this be handled by the search component?
    const getNextResults = async () => {
        try {
            const response = await fetch(`/api/search/next`);
            const data = await response.json();
            if(searchTarget === 'tune'){
                return handleSearchResults(data.tracks, data.next);
            }
            if(searchTarget === 'subtune'){
                return handleSearchResults(data.subtune, data.next);
            }
            if(searchTarget === 'playlist'){
                return handleSearchResults(data.playlist, data.next);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }

    return (
        <div id={id} onDoubleClick={toggleListener} className={`flex w-full min-h-[80vh] max-h-[80vh] py-8 px-4 ${side === 'left' ? "flex-row" : "flex-row-reverse" }`}>
                <div className="flex flex-col h-full grow shrink rounded-3xl p-4  bg-slate-100/[15%] align-start ring-1 ring-slate-100">
                    <SearchBar onSubmit={handleSearchResults} searchTarget={searchTarget}/>
                        <motion.div 
                        className="contents-container flex grow shrink no-scrollbar overflow-y-clip mt-4 content-center rounded-2xl shadow-md" >
                        {
                            searchTarget === 'tune' ?   
                            <DndList id={`${id}-list`} tunes={items} mini={false}/> 
                            : null
                        }

                        </motion.div>
                            {hasNext.current ?
                                <motion.div
                                    initial={{opacity: 0, scale: 0}}
                                    animate={{opacity: 1, scale: 1}}
                                    transition={{duration: 0.75}}
                                    className="flex content-center justify-center mt-2 my-0 pb-0 border-2 border-solid border-red-500" 
                                >                                        
                                        <IconButton 
                                        onClick={getNextResults} 
                                        disableFocusRipple={true}
                                        disableRipple={true}
                                        className="bg-slate-200/50 my-0 py-0 content-center">
                                            <AddCircleOutlineRoundedIcon fontSize='large'/>
                                        </IconButton>
                                </motion.div>
                                : null
                            }
                </div>
                <div className='self-center'>
                    <IconButton onClick={toggleListener}  disableFocusRipple={false}>
                        <DragIndicatorRoundedIcon fontSize='large'/>
                    </IconButton>
                </div>
        </div>
    )
}

