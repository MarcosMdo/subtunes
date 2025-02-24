'use client'
import './page.css'; 
import { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { SpotifyPlayerProvider } from '../contexts/spotifyPlayerContext';
import { spotifyPlayer } from '../services/spotify-player';
import {  useEdit } from '../contexts/editContext';

import { saveLogsToFile } from '../utils/debugLogger';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react'; 

// Types
import { Ttune } from "../subtuneTypes/Tune";
import { playlistItem, Tplaylist } from "../subtuneTypes/Playlist";
import { Tsubtune } from "../subtuneTypes/Subtune";

// Components
import DndList from "../components/DndList";
import SidePanel from "../components/sidepanel";
import TabbedSidePanel from '../components/tabbedSidePanel';
import PlaylistForm from '../components/PlaylistForm';

import 'sortablejs/modular/sortable.complete.esm.js';
import Sortable from 'sortablejs';
import { ReactSortable } from "react-sortablejs";
const queryClient = new QueryClient();

export default function GsapPage() {

    // Panel States
    const [leftPanelState, setLeftPanelState] = useState<boolean>(true);
    const [rightPanelState, setRightPanelState] = useState<boolean>(true);

    // Visual States
    const [playlistColor, setPlaylistColor] = useState<number[]>([0, 0, 0, 0]);
    const [subtuneBackgroundImage, setSubtuneBackgroundImage] = useState<string>("");
    const subtuneColorFlag = useRef(false);

    // Data States
    const [searchTunes, setSearchTunes] = useState<any[]>([]);
    const [collections, setCollections] = useState<(Tsubtune[] | Tplaylist[])>([]);

    // Add state for trash visibility
    const [showTrash, setShowTrash] = useState(false);

    // Edit state
    const { 
        currentState,
        currentEditId,
        editMode,
        updateCurrentState,
        selectedTab
    } = useEdit();

    // Add state for tracking x position
    const [middlePanelX, setMiddlePanelX] = useState<number>(0);

    // Add new state for mode
    const [currentMode, setCurrentMode] = useState<'creating-subtune' | 'editing-subtune' | 'creating-playlist' | 'editing-playlist'>('creating-subtune');

    // Add mode colors mapping
    const modeConfig = {
        'creating-subtune': {
            color: '#22c55e', // Green
            text: 'Creating Subtune',
            icon: '🎵'
        },
        'editing-subtune': {
            color: '#3b82f6', // Blue
            text: 'Editing Subtune',
            icon: '✏️'
        },
        'creating-playlist': {
            color: '#a855f7', // Purple
            text: 'Creating Playlist',
            icon: '📝'
        },
        'editing-playlist': {
            color: '#f97316', // Orange
            text: 'Editing Playlist',
            icon: '📝'
        }
    };

    // Panel Toggle Handler
    const handlePanelToggle = () => {
        if (leftPanelState && rightPanelState) {
            setLeftPanelState(false);
            setRightPanelState(false);
            return;
        }

        if (!leftPanelState && !rightPanelState) {
            setLeftPanelState(true);
            setRightPanelState(true);
            return;
        }

        setLeftPanelState(false);
        setRightPanelState(false);
    };

    // Visual Update Handlers
    const updateSubtunePanelBg = (color?: number[]) => {
        console.log('updateSubtunePanelBg called with:', color);
        if (Array.isArray(color) && color.length >= 3) {
            console.log('Setting color to:', color);
            subtuneColorFlag.current = true;
            setPlaylistColor(color);
        } else {
            console.log('Resetting color to default');
            subtuneColorFlag.current = false;
            setPlaylistColor([0, 0, 0, 0]);
        }
    }

    const updateBackground = (imageurl: string) => {
        setSubtuneBackgroundImage(imageurl);
    }

    // Data Handlers
    const handleSearchSort = (newTunes: Ttune[]) => {
        setSearchTunes(newTunes);
    };

    const handleSearchResults = (data: Ttune[] | Tsubtune[] | Tplaylist[], dataType: 'tune' | 'subtune' | 'playlist', clear?: boolean) => {
        if (dataType === 'tune' && !clear) {
            setSearchTunes(prev => [...prev, ...data]);
        } else if (dataType === 'tune' && clear) {
            setSearchTunes(data as Ttune[]);
        } else {
            console.warn(`Unsupported data type: ${dataType}`);
        }
    };

    const handleTargetSort = (
        items: Ttune[] | ((currentItems: Ttune[]) => Ttune[]),
        sortable?: Sortable | null,
        store?: any
    ) => {
        console.log('handleTargetSort', {
            items,
            sortableEl: sortable,
            Store: store
        });

        let newTunes: Ttune[];

        if (Array.isArray(items) && items[0]) {
            const item = items[0] as any;  // Type assertion for container check
            if ('subtune' in item || 'playlist' in item) {
                const extractedTunes = item.subtune?.tunes || item.playlist?.tunes;
                const color = item.subtune?.color || item.playlist?.color;

                const transformedTunes = extractedTunes.map((tune: Ttune) => ({
                    ...tune,
                    draggableId: nanoid(),
                    selected: true,
                    color: color
                }));
                newTunes = [...currentState.tunes, ...transformedTunes];
            } else {
                newTunes = items;
            }
        } else {
            newTunes = typeof items === 'function' ? items(currentState.tunes) : items;
        }

        updateCurrentState({ 
            tunes: newTunes
        });
    };

    const handlePanelResults = (data: any, dataType: string, clear?: boolean) => {

        if (dataType === 'subtune') {
            setCollections(data as Tsubtune[]);
        } else if (dataType === 'playlist') {
            setCollections(data as Tplaylist[]);
        } else {
            console.warn(`Unsupported collection type: ${dataType}`);
        }
    };

    const handleSetTargetTunes = (items: playlistItem[]) => {
        if (items.length === 0) {
            setPlaylistColor([0, 0, 0, 0]);
            subtuneColorFlag.current = false;
            setSubtuneBackgroundImage("");
        }
        updateCurrentState({ 
            tunes: items.map(item => item.tune)  // Convert playlistItem[] to Ttune[]
        });
    };

    // Add at the top of the component
    const leftPanelRef = useRef(null);
    const middlePanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef(null);
    const containerRef = useRef(null);
    const ease = "elastic.out(0.1, 0.1)";
    const duration = 0.8

    // Left Panel Animation
    useGSAP(() => {
        if (leftPanelRef.current) {
            gsap.to(leftPanelRef.current, {
                x: leftPanelState ? "0%" : "-65%",
                duration: duration,
                ease: ease
            });
        }
    }, {
        scope: containerRef,
        dependencies: [leftPanelState]
    });

    // Right Panel Animation
    useGSAP(() => {
        if (rightPanelRef.current) {
            gsap.to(rightPanelRef.current, {
                x: rightPanelState ? "0%" : "65%",
                duration: duration,
                ease: ease
            });
        }
    }, {
        scope: containerRef,
        dependencies: [rightPanelState]
    });

    // Create refs for different scenarios
    const prevStates = useRef({ left: leftPanelState, right: rightPanelState });

    // Update the GSAP animation
    useGSAP(() => {
        if (middlePanelRef.current) {
            const leftChanged = prevStates.current.left !== leftPanelState;
            const rightChanged = prevStates.current.right !== rightPanelState;

            if (leftChanged || rightChanged) {
                let newX = middlePanelX;
                
                // Handle left panel changes
                if (leftChanged) {
                    if (leftPanelState) {
                        // Left panel opening, move middle right
                        newX += 20;
                    } else {
                        // Left panel closing, move middle left
                        newX -= 20;
                    }
                }

                // Handle right panel changes
                if (rightChanged) {
                    if (rightPanelState) {
                        // Right panel opening, move middle left
                        newX -= 20;
                    } else {
                        // Right panel closing, move middle right
                        newX += 20;
                    }
                }

                // Animate to new position
                gsap.to(middlePanelRef.current, {
                    x: `${newX}%`,
                    width: leftPanelState && rightPanelState ? "38%" : 
                            !leftPanelState && !rightPanelState ? "70%" : "50%",
                    duration: duration,
                    ease: ease
                });

                // Update state
                setMiddlePanelX(newX);
                prevStates.current = { left: leftPanelState, right: rightPanelState };
            }
        }
    }, {
        scope: containerRef,
        dependencies: [leftPanelState, rightPanelState, middlePanelX]
    });

    // Add ref for trash animation
    const trashRef = useRef<HTMLDivElement>(null);

    // Add GSAP animation for trash and middle panel
    useGSAP(() => {
        if (trashRef.current && middlePanelRef.current) {
            if (showTrash) {
                const tl = gsap.timeline();
                tl.to(middlePanelRef.current, {
                    paddingBottom: "10rem",
                    duration: 0.2,
                    ease: "power2.out"
                })
                    .set(trashRef.current, {
                        width: "100%",
                        left: "0",
                        xPercent: 0,
                        opacity: 0,
                        scale: 0
                    })
                    .to(trashRef.current, {
                        y: 0,
                        opacity: 1,
                        scale: .95,
                        duration: 0.4,
                        ease: "power2.out"
                    });
            }
        }
    }, { dependencies: [showTrash, leftPanelState, rightPanelState] });

    // Modify hideTrash to animate both elements
    const hideTrash = () => {
        if (trashRef.current && middlePanelRef.current) {
            const tl = gsap.timeline({
                onComplete: () => setShowTrash(false)
            });
            tl.to(trashRef.current, {
                y: 120,
                scale: 0,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            })
                .to(middlePanelRef.current, {
                    paddingBottom: "10px",
                    duration: 0.4,
                    ease: "power2.in"
                }, "<");
        }
    };

    useEffect(() => {
        const connectWithRetry = (retries = 3) => {
            const initPlayer = async () => {
                try {
                    const response = await fetch('/api/tune/player-token');
                    const { token } = await response.json();
                    await spotifyPlayer.initialize(token);
                } catch (error) {
                    console.error('Spotify Player Error:', error);
                    if (retries > 0) {
                        console.log(`Retrying... ${retries} attempts left`);
                        setTimeout(() => connectWithRetry(retries - 1), 1000);
                    } else {
                        console.error('Failed to connect to Spotify after multiple attempts');
                    }
                }
            };

            initPlayer();
        };

        connectWithRetry();
    }, []);

    // Add effect to handle edit data
    useEffect(() => {
        if (editMode !== null) {
            console.log('editMode', editMode);
        }
    }, [editMode]);

    // Add GSAP animation for glow effect
    useGSAP(() => {
        const color = modeConfig[currentMode].color;
        
        // Clear any existing animations
        gsap.killTweensOf(containerRef.current);
        
        // Set initial state with minimum glow
        gsap.set(containerRef.current, {
            boxShadow: `inset 0 0 100px ${color}44, inset 0 0 50px ${color}22, inset 0 0 25px ${color}11`
        });
        
        // Start the animation with enhanced glow
        gsap.to(containerRef.current, {
            boxShadow: `inset 0 0 200px ${color}88, inset 0 0 100px ${color}66, inset 0 0 50px ${color}44`,
            duration: 5.5,
            ease: "power2.inOut",
            repeat: -1,
            yoyo: true,
            immediateRender: true
        });
    }, {
        dependencies: [currentMode],
        scope: containerRef  // Scope the animation to the container
    });

    // Update mode based on editMode
    useEffect(() => {
        if (editMode) {
            setCurrentMode(editMode === 'subtune' ? 'editing-subtune' : 'editing-playlist');
        } else {
            // Default to creating mode based on selected tab
            setCurrentMode('creating-subtune'); // or based on some other state
        }
    }, [editMode]);

    const [savingLogs, setSavingLogs] = useState(false);

    const handleSaveLogs = async () => {
        setSavingLogs(true);
        try {
            const filepath = await saveLogsToFile();
            alert(`Logs saved to: ${filepath}`);
        } catch (error) {
            alert(`Failed to save logs: ${error}`);
        } finally {
            setSavingLogs(false);
        }
    };

    // Add this effect
    useEffect(() => {
        console.log('Color state changed:', {
            playlistColor,
            flagValue: subtuneColorFlag.current
        });
    }, [playlistColor]);

    return (
        <QueryClientProvider client={queryClient}>
            <SpotifyPlayerProvider
                searchTunes={searchTunes}
                targetTunes={currentState.tunes}
                collections={collections}
            >
                <div 
                    className="fixed inset-0 w-full h-full overflow-hidden"
                    ref={containerRef}
                    style={{
                        backgroundImage: `url(${subtuneBackgroundImage !== "" ? subtuneBackgroundImage : "https://raw.githubusercontent.com/MarcosMdo/subtunes/9b6594c460204437b9c2b3d517238da5fb38e1b5/public/background.png"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="flex flex-col w-full h-full backdrop-blur-md">
                        <PlaylistForm
                            key="subtuneForm"
                            items={currentState.tunes.map(tune => ({
                                tune,
                                draggableId: tune.draggableId || nanoid(),
                                containerId: 'target-list'
                            }))}
                            onColorChange={updateSubtunePanelBg}
                            onImageChange={updateBackground}
                            setItems={handleSetTargetTunes}
                        />

                        <div 
                            className="w-full flex justify-center mb-2"
                        >
                            <div 
                                className="px-6 py-2 rounded-full backdrop-blur-md z-50 transition-all duration-300"
                                style={{
                                    backgroundColor: `${modeConfig[currentMode].color}22`,
                                    border: `1px solid ${modeConfig[currentMode].color}44`,
                                    boxShadow: `0 0 20px ${modeConfig[currentMode].color}22`
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{modeConfig[currentMode].icon}</span>
                                    <span className="text-white text-sm font-medium">
                                        {editMode ? 
                                            `Editing ${editMode === 'subtune' ? 'Subtune' : 'Playlist'}` : 
                                            `Creating ${selectedTab === 'subtune' ? 'Subtune' : 'Playlist'}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="relative w-full h-[75vh] p-8 pb-12 rounded-lg transition-all duration-300">
                            {/* Left Panel - adjusted height */}
                            <div ref={leftPanelRef} className="absolute top-8 left-8 w-[30%] h-[calc(75vh-6rem)] max-h-[calc(75vh-6rem)]">
                                <SidePanel
                                    id="search-panel"
                                    side='left'
                                    searchTarget="tune"
                                    items={searchTunes}
                                    setItems={setSearchTunes}
                                    onSort={handleSearchSort}
                                    toggle={leftPanelState}
                                    toggleListener={() => setLeftPanelState(!leftPanelState)}
                                    onResults={handleSearchResults}
                                    className="h-full"
                                />
                            </div>

                            {/* Middle Panel - adjusted height */}
                            <div ref={middlePanelRef} className="absolute top-8 left-1/2 -translate-x-1/2 w-[38%] h-[calc(75vh-6rem)] max-h-[calc(75vh-6rem)]">
                                <div className="flex flex-col h-full">
                                    <div
                                        className="flex-1 flex flex-col rounded-2xl shadow-2xl ring-1 ring-slate-100 overflow-y-auto no-scrollbar"
                                        style={{
                                            backgroundColor: subtuneColorFlag.current && Array.isArray(playlistColor) ? 
                                                `rgba(${playlistColor.slice(0, -1).join(',')},0.2)` : 
                                                ''
                                        }}
                                        onDoubleClick={handlePanelToggle}
                                    >
                                        <DndList
                                            id="target-list"
                                            tunes={currentState.tunes}
                                            setItems={handleTargetSort}
                                            droppable={true}
                                            multiDrag={true}
                                            onStart={() => setShowTrash(true)}
                                            onEnd={() => hideTrash()}
                                        />
                                    </div>

                                    <div
                                        ref={trashRef}
                                        className="absolute bottom-4 w-[95%] left-0 right-0 h-[120px] bg-red-500/50 backdrop-blur-sm pt-3 rounded-3xl ring-1 ring-red-800"
                                        style={{
                                            visibility: showTrash ? 'visible' : 'hidden',
                                            zIndex: 50,
                                            opacity: 0,
                                            transform: 'translateY(120px) scale(0)'
                                        }}
                                    >
                                        <ReactSortable
                                            list={[]}
                                            setList={() => { }}
                                            group={{
                                                name: "trash",
                                                put: true,
                                                pull: false
                                            }}
                                            animation={150}
                                            sort={false}
                                            filter=".filter"
                                            className="relative h-full flex flex-col items-center justify-center rounded-3xl px-12"
                                            setData={(dataTransfer, dragEl) => {
                                                dragEl.classList.add('dragging-to-trash');
                                            }}
                                            onAdd={(evt) => {
                                                const tuneId = evt.item.getAttribute('data-id');
                                                if (tuneId) {
                                                    updateCurrentState({ 
                                                        tunes: currentState.tunes.filter((tune: Ttune) => tune.draggableId !== tuneId)
                                                    });
                                                }
                                                evt.item.remove();
                                                hideTrash();
                                            }}
                                        >
                                            <div className="filter absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <DeleteOutlineRoundedIcon className="text-white" sx={{ fontSize: 80 }} />
                                            </div>
                                            <div className="w-full h-full rounded-3xl flex items-center justify-center" />
                                        </ReactSortable>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - adjusted height */}
                            <div ref={rightPanelRef} className="absolute top-8 right-8 w-[30%] h-[calc(75vh-6rem)] max-h-[calc(75vh-6rem)]">
                                <TabbedSidePanel
                                    side="right"
                                    id="right-panel"
                                    items={collections}
                                    toggle={rightPanelState}
                                    toggleListener={() => setRightPanelState(!rightPanelState)}
                                    onResults={handlePanelResults}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Conditionally render the button only in development mode */}
                {process.env.NODE_ENV === 'development' && (
                    <button 
                        onClick={handleSaveLogs}
                        disabled={savingLogs}
                        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded"
                    >
                        {savingLogs ? 'Saving...' : 'Save Debug Logs'}
                    </button>
                )}
            </SpotifyPlayerProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
