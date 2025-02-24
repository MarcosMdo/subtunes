import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { IconButton } from '@mui/material';

import SearchBar from './SearchBar';
import DndList from './DndList';
import { Ttune } from '../subtuneTypes/Tune';
import { Tsubtune } from '../subtuneTypes/Subtune';
import { Tplaylist } from '../subtuneTypes/Playlist';

export default function SidePanel({
    side,
    searchTarget,
    id,
    items,
    setItems,
    onSort,
    toggle,
    toggleListener,
    onResults,
    animate,
    variants,
    className
}: {
    side: 'left' | 'right';
    searchTarget: 'tune' | 'playlist' | 'subtune';
    id: string;
    items: Ttune[];
    setItems: (items: Ttune[]) => void;
    onSort: (items: Ttune[]) => void;
    toggle: boolean;
    toggleListener: (data: any) => void;
    onResults: (data: Ttune[] | Tsubtune[] | Tplaylist[], dataType: 'tune' | 'subtune' | 'playlist', clear?: boolean) => void;
    animate?: any;
    variants?: any;
    className?: string;
}) {
    const hasNext = useRef<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);
    const addButtonRef = useRef<HTMLDivElement>(null);

    const handleSearchResults = async (data: Ttune[] | Tsubtune[] | Tplaylist[], next?: boolean, clear?: boolean) => {
        let results = null;
        hasNext.current = next as boolean;
        if (searchTarget === 'tune') {
            results = await data as Ttune[];
            return onResults(results, searchTarget, clear);
        }
        if (searchTarget === 'subtune') {
            results = await data as Tsubtune[];
            return onResults(results, searchTarget, clear);
        }
        if (searchTarget === 'playlist') {
            results = await data as Tplaylist[];
            return onResults(results, searchTarget, clear);
        }
    }

    const getNextResults = async () => {
        try {
            const response = await fetch(`/api/search/next`);
            const data = await response.json();
            if (searchTarget === 'tune') {
                return handleSearchResults(data.tracks, data.next, false);
            }
            if (searchTarget === 'subtune') {
                return handleSearchResults(data.subtune, data.next);
            }
            if (searchTarget === 'playlist') {
                return handleSearchResults(data.playlist, data.next);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    }

    // Add wrapper function
    const handleSetItems = (items: Ttune[]) => {
        handleSearchResults(items);
    };

    // Handle panel content animation
    useEffect(() => {
        if (listContainerRef.current && addButtonRef.current) {
            const tl = gsap.timeline();
            
            if (toggle) {
                tl.fromTo(listContainerRef.current,
                    { opacity: 0, scale: 0 },
                    { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" }
                );
                
                if (hasNext.current) {
                    tl.fromTo(addButtonRef.current,
                        { opacity: 0, scale: 0 },
                        { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" },
                        "-=0.1"
                    );
                }
            } else {
                tl.to([listContainerRef.current, addButtonRef.current], {
                    opacity: 0,
                    scale: 0,
                    duration: 0.25,
                    ease: "power2.in"
                });
            }
        }
    }, [toggle, hasNext.current]);

    return (
        <div 
            ref={containerRef}
            className="flex flex-row h-full w-full pl-4 pr-12"
        >
            <div className="flex flex-col grow h-full w-full min-w-[420px] rounded-3xl p-4 bg-slate-100/[15%] ring-1 ring-slate-100">
                <SearchBar onSubmit={handleSearchResults} searchTarget={searchTarget} />
                
                <div
                    ref={listContainerRef}
                    className="contents-container flex grow shrink no-scrollbar overflow-y-scroll mt-4 content-center rounded-2xl shadow-md"
                    style={{ opacity: 0, scale: 0 }}
                >
                    <DndList
                        id="source-list"
                        tunes={items}
                        setItems={setItems}
                        clone={true}
                        sort={false}
                        droppable={false}
                        multiDrag={true}
                    />
                </div>

                {hasNext.current && (
                    <div 
                        ref={addButtonRef}
                        className="flex content-center justify-center mt-2 my-0 pb-0"
                        style={{ opacity: 0, scale: 0 }} 
                    >
                        <IconButton
                            onClick={getNextResults}
                            disableFocusRipple={true}
                            disableRipple={true}
                            className="bg-slate-200/50 my-0 py-0 content-center"
                        >
                            <AddCircleOutlineRoundedIcon fontSize='large' />
                        </IconButton>
                    </div>
                )}
            </div>
            <div className='flex h-full items-center justify-center'>
                <IconButton onClick={toggleListener} disableFocusRipple={false}>
                    <DragIndicatorRoundedIcon fontSize='large' />
                </IconButton>
            </div>
        </div>
    );
} 