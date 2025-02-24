'use client';
import React, { memo, useEffect, useState, useRef } from 'react'
import SearchBar from './SearchBar'
import DDContainer from './DDContainer';

import { Tsubtune } from '../subtuneTypes/Subtune';

import { IconButton } from '@mui/material';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { ReactSortable } from 'react-sortablejs';
import Sortable, { MultiDrag } from 'sortablejs';
import gsap from 'gsap';
import { useEdit } from '../contexts/editContext';

// Mount MultiDrag plugin
Sortable.mount(new MultiDrag());

// Define a type for tab IDs
type TabId = 'subtune' | 'playlist';

const tabs = [
    { id: 'subtune' as TabId, label: 'Subtunes' },
    { id: 'playlist' as TabId, label: 'Playlists' }
];

interface TabbedSidePanelProps {
    side: string;
    id: string;
    items: any[];
    toggle: boolean;
    toggleListener: () => void;
    onResults: (data: any, dataType: string, clear?: boolean) => void;
    animate?: any;
    variants?: any;
    className?: string;
}

const toggleClass = (el: HTMLElement, className: string, state: boolean) => {
    if (el.classList) {
        el.classList[state ? 'add' : 'remove'](className);
    }
};

const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
    side,
    id,
    items,
    toggle,
    toggleListener,
    onResults,
    animate,
    variants,
    className
}) => {
    const { listRefreshTrigger } = useEdit();
    const [contentType, setContentType] = useState<TabId>('subtune');
    const [activeTab, setActiveTab] = useState<TabId>('subtune');
    const [isEmpty, setIsEmpty] = useState<{ subtune: boolean; playlist: boolean }>({ subtune: false, playlist: false });

    const listContainerRef = useRef<HTMLDivElement>(null);
    const tabIndicatorRef = useRef<HTMLDivElement>(null);

    // Add refs for both content lists
    const subtunesListRef = useRef<HTMLDivElement>(null);
    const playlistsListRef = useRef<HTMLDivElement>(null);

    const prevContentType = useRef<string>('subtune');

    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleSearchResults = (data: any, hasNext?: boolean, clear?: boolean) => {
        // console.log("handleSearchResults", data, contentType, clear);
        onResults(data, contentType as 'subtune' | 'playlist', clear);
    }

    const loadPlaylists = async () => {
        try {
            const response = await fetch(`/api/user/playlists`);
            if (response.status === 204) return setIsEmpty({ ...isEmpty, playlist: true });
            
            if (!response.ok) return console.error('Error fetching subtunes:', response);
            
            setIsEmpty({ ...isEmpty, playlist: false });
            
            const data = await response.json();
            
            if ('error' in data) return console.error('Error fetching playlists:', data.error);
            console.log("loadPlaylists", data);
            onResults(data, 'playlist');
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    const loadSubtunes = async () => {
        try {
            const response = await fetch(`/api/user/subtunes`);
            if (response.status === 204) return setIsEmpty({ ...isEmpty, subtune: true });

            if (!response.ok) return console.error('Error fetching subtunes:', response);
            
            const data = await response.json();
            
            if ('error' in data) return console.error('Error fetching playlists:', data.error);
            
            setIsEmpty({ ...isEmpty, subtune: false });
            console.log("loadSubtunes", data);
            onResults(data, 'subtune');
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

    const handleTabClick = (tabId: TabId) => {
        setActiveTab(tabId);
        setContentType(tabId);
        console.log('Tab clicked:', tabId); // Add debugging
    };

    const handleSort = (newState: Tsubtune[], sortable: Sortable | null) => {
        handleSearchResults(newState, false, true);
    };

    useEffect(() => {
        if (contentType === 'subtune') {
            loadSubtunes();
        } else if (contentType === 'playlist') {
            loadPlaylists();
        }
    }, [contentType, listRefreshTrigger]);

    // Update the content animation to handle both lists and toggle
    useEffect(() => {
        const subtunes = subtunesListRef.current;
        const playlists = playlistsListRef.current;
        
        if (subtunes && playlists) {
            const tl = gsap.timeline();
            
            if (!toggle) {
                // Hide both lists when panel is closed
                tl.to([subtunes, playlists], {
                    // opacity: 0,
                    scale: 0,
                    duration: 0.25,
                    ease: "power2.in"
                });
            } else if (contentType !== prevContentType.current) {
                // Tab switching animation
                const currentList = contentType === 'subtune' ? subtunes : playlists;
                const otherList = contentType === 'subtune' ? playlists : subtunes;
                
                // Make both lists visible initially
                gsap.set([currentList, otherList], { 
                    visibility: 'visible',
                    scale: 1
                });

                // Determine directions
                const enterFrom = contentType === 'subtune' ? '-100%' : '100%';
                const exitTo = contentType === 'subtune' ? '100%' : '-100%';
                
                // Animate both lists simultaneously
                tl.fromTo([currentList, otherList],
                    {
                        x: (index) => index === 0 ? enterFrom : '0%',
                        opacity: (index) => index === 0 ? 0 : 1
                    },
                    {
                        x: (index) => index === 0 ? '0%' : exitTo,
                        opacity: (index) => index === 0 ? 1 : 0,
                        duration: 0.5,
                        ease: "power2.inOut",
                        stagger: 0,  // Animate simultaneously
                        onComplete: () => {
                            // Hide the exited list
                            gsap.set(otherList, { visibility: 'hidden' });
                        }
                    }
                );
            } else {
                // Panel toggle open animation
                const currentList = contentType === 'subtune' ? subtunes : playlists;
                
                tl.fromTo(currentList,
                    { 
                        opacity: 0,
                        scale: 0,
                        visibility: 'visible'
                    },
                    { 
                        opacity: 1,
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    }
                );
            }
        }
        
        prevContentType.current = contentType;
    }, [contentType, toggle]);

    // Update the animation effect using refs
    useEffect(() => {
        const activeButton = tabRefs.current[tabs.findIndex(tab => tab.id === activeTab)];
        const indicator = tabIndicatorRef.current;
        
        if (activeButton && indicator) {
            gsap.to(indicator, {
                left: activeButton.offsetLeft,
                width: activeButton.offsetWidth,
                duration: 0.8,
                ease: "elastic.out(1, 0.75)",
                autoAlpha: 1
            });
        }
    }, [activeTab]);

    // Remove setRefreshContainers and use listRefreshTrigger instead
    useEffect(() => {
        refreshPanelData();
    }, [contentType, listRefreshTrigger]);  // Refresh when content type or trigger changes

    const refreshPanelData = async () => {
        try {
            const response = await fetch(`/api/${contentType}`, {
                method: 'GET'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            // Check the data structure and pass it correctly
            if (Array.isArray(data)) {
                onResults(data, contentType);
            } else if (data[contentType]) {
                onResults(data[contentType], contentType);
            }
        } catch (error) {
            console.error('Error refreshing panel:', error);
        }
    };

    return (
        <div
            className="flex flex-row-reverse h-full w-full pr-4 pl-12"

        >
            <div className="flex flex-col grow px-4 pr-2 py-4 w-full min-w-[420px] rounded-3xl bg-slate-100/[15%] ring-1 ring-slate-100">
                <SearchBar isFilter clearFilter={handleFilterStatus} onSubmit={handleSearchResults} searchTarget={contentType as 'subtune' | 'playlist'} />
                <div className="flex flex-row w-full justify-center gap-4 py-2.5 relative">
                    {/* Tab indicator */}
                    <div 
                        ref={tabIndicatorRef}
                        className="absolute rounded-2xl py-4 bg-slate-200/25 ring-1 ring-slate-100"
                        style={{ 
                            position: 'absolute',
                            top: '25%',
                            visibility: 'hidden',
                            opacity: 0,
                        }}
                    />
                    
                    {/* Tab buttons */}
                    {tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            ref={el => tabRefs.current[index] = el}
                            name={tab.id}
                            onClick={(e) => { handleTabClick(tab.id as TabId); }}
                            className={`${activeTab === tab.id ? "" : "hover:opacity-50"} 
                                relative rounded-full px-8 py-2 font-medium outline-2 h-[44px] 
                                flex items-center justify-center min-w-[160px]`}
                        >
                            <span className="relative px-4">{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 min-h-0 overflow-hidden rounded-2xl shadow-md ">
                    <div
                        ref={subtunesListRef}
                        className="absolute inset-0 flex flex-col shrink grow h-full no-scrollbar overflow-y-scroll px-4 content-center rounded-2xl pb-12"
                        style={{ 
                            opacity: 0,
                            transform: `translateX(${contentType === 'subtune' ? '0%' : '-100%'})`,
                            visibility: contentType === 'subtune' ? 'visible' : 'hidden'
                        }}
                    >
                        <ReactSortable
                            list={items}
                            setList={handleSort}
                            animation={150}
                            group={{
                                name: "containers",
                                pull: 'clone',
                                put: false
                            }}
                            className="flex flex-col w-full h-full"
                        >
                            {contentType === 'subtune' && (isEmpty.subtune ? (
                                <span className="w-full text-xl font-semibold align-middle text-center pt-8">
                                    Make your first subtune!
                                </span>
                            ) : items.filter(item => 'subtune' in item).map((item, index) => (
                                <DDContainer 
                                    key={`dd-container-${contentType}-${item.id}-${index}`} 
                                    item={item} 
                                    sortable={false}
                                    setItems={onResults}
                                />
                            )))}
                        </ReactSortable>
                    </div>

                    <div
                        ref={playlistsListRef}
                        className="absolute inset-0 flex flex-col h-full no-scrollbar overflow-y-scroll px-4 content-center rounded-2xl pb-12"
                        style={{ 
                            opacity: 0,
                            transform: `translateX(${contentType === 'playlist' ? '0%' : '100%'})`,
                            visibility: contentType === 'playlist' ? 'visible' : 'hidden'
                        }}
                    >
                        <ReactSortable
                            list={items}
                            setList={handleSort}
                            animation={150}
                            group={{
                                name: "containers",
                                pull: 'clone',
                                put: false
                            }}
                            className="flex flex-col w-full h-full"
                            dragClass="sortable-drag"
                        >
                            {contentType === 'playlist' && (isEmpty.playlist ? (
                                <span className="w-full text-xl font-semibold align-middle text-center pt-8">
                                    Make your first playlist!
                                </span>
                            ) : items.filter(item => 'playlist' in item).map((item, index) => (
                                <DDContainer 
                                    key={`dd-container-${contentType}-${item.id}-${index}`} 
                                    item={item} 
                                    sortable={false}
                                    setItems={onResults}
                                />
                            )))}
                        </ReactSortable>
                    </div>
                </div>
            </div>
            <div className='flex h-full items-center justify-center'>
                <IconButton onClick={toggleListener} disableFocusRipple={false}>
                    <DragIndicatorRoundedIcon fontSize='large' />
                </IconButton>
            </div>
        </div>
    )
}

export default memo(TabbedSidePanel); 