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
import { prepPlaylistsForDnd, prepSubtunesForDnd } from '../utils/helperFunctions';
import { Droppable } from '@hello-pangea/dnd';
import DraggableContainer from './DraggableContainer';

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
    onResults, 
    disableContainerDnd
}: {
    side: 'left' | 'right';
    id: string;
    items: Tsubtune[] | Tplaylist[];
    toggle: boolean;
    toggleListener: (data: any) => void;
    onResults: (data: Tsubtune[] | Tplaylist[], dataType: 'subtune' | 'playlist', clear?: boolean) => void;
    disableContainerDnd?: boolean;
}) {
    const [contentType, setContentType] = useState<string>('subtune');
    const [activeTab, setActiveTab] = useState<string>(tabs[0].id);
    const [isEmpty, setIsEmpty] = useState<{ subtune: boolean; playlist: boolean }>({ subtune: false, playlist: false });


    const handleSearchResults = (data: any, hasNext?: boolean, clear?: boolean) => {
        onResults(data, contentType as 'subtune' | 'playlist', clear);
    }

    const loadPlaylists = async () => {
        try {
            const response = await fetch(`/api/user/playlists`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensure cookies are sent with the request
            });
            console.log("response:", response)
            if (response.status === 204) return setIsEmpty({ ...isEmpty, playlist: true });
            if (!response.ok) return console.error('Error fetching subtunes:', response);
            setIsEmpty({ ...isEmpty, playlist: false });
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

    const loadSubtunes = async () => {
        try {
            const response = await fetch(`/api/user/subtunes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensure cookies are sent with the request
                next: { revalidate: 5 } // store cached response only for 5 seconds   
            });
            if (response.status === 204) {
                console.log("subs: ", isEmpty.subtune);
                return setIsEmpty({ ...isEmpty, subtune: true });
            }
            if (!response.ok) return console.error('Error fetching subtunes:', response);
            const data = await response.json();
            if ('error' in data) return console.error('Error fetching playlists:', data.error);
            setIsEmpty({ ...isEmpty, subtune: false });
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
        console.log('contentType:', contentType);
        setContentType(e.target.innerText.slice(0, -1).toLowerCase() as 'subtune' | 'playlist');
    }

    useEffect(() => {
        console.log("is empty:", isEmpty)
        if (contentType === 'subtune') {
            loadSubtunes();
        } else if (contentType === 'playlist') {
            loadPlaylists();
        }
    }, [contentType])

    const getRenderItem = (items: any) => (provided: any, snapshot: any, rubric: any) => (
        <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
        >
            <DDContainer key={`preview-draggable-${nanoid(11)}`} item={items[rubric.source.index]} />
        </div>
    );
    const renderItem = getRenderItem(items);

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
                            onLoadStart={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id ? "" : "hover:opacity-50"} relative rounded-full px-3 py-1.5 font-medium outline-2`}>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId='active-id'
                                    transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                                    className="absolute inset-0 rounded-xl bg-slate-200/25 ring-1 ring-slate-100"
                                />
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
                            className=" flex flex-col h-full no-scrollbar overflow-y-scroll shadow-2xl px-4 content-center rounded-2xl pb-12"
                        >
                            <Droppable
                                key={`droppable-${id}`}
                                droppableId={`droppable-${id}`}
                                isDropDisabled={true}
                                ignoreContainerClipping={true}
                                renderClone={renderItem}
                            >
                                {(provided, snapshot) =>
                                <div>
                                    <div
                                        ref={provided.innerRef}
                                        className="flex flex-col w-full h-full"
                                    >
                                        {
                                            isEmpty[contentType as keyof typeof isEmpty] ?
                                                <span className="w-full text-xl font-semibold align-middle text-center pt-8">Make your first {contentType}!</span>
                                                : items.map((item: Tsubtune | Tplaylist, index: number) => (
                                                    <DraggableContainer id={`${contentType}-${index}`} index={index} disableDrag={disableContainerDnd} >
                                                        <DDContainer key={`${nanoid(11)}`} item={item} />
                                                    </DraggableContainer>
                                                ))
                                        }
                                    </div>
                                    {provided.placeholder}
                                    </div>
                                }
                            </Droppable>
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