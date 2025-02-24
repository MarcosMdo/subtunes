import { memo, useState, useCallback, useEffect, useRef, useLayoutEffect, createContext, useContext, useMemo } from 'react';
import gsap from 'gsap';
import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';
import { IconButton } from '@mui/material';
import { Tplaylist } from '../subtuneTypes/Playlist';
import { Tsubtune } from '../subtuneTypes/Subtune';
import { Ttune } from '../subtuneTypes/Tune';
import { ReactSortable } from "react-sortablejs";
import DraggableTune from './draggableTune';
import { hexToRGB } from '../utils/helperFunctions';
// import Sortable from 'sortablejs';
import { useEdit } from '../contexts/editContext';
import EditIcon from '@mui/icons-material/Edit';
// import EditInProgressIcon from '@mui/icons-material/ModeEdit';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';

// import Sortable, { MultiDrag } from 'sortablejs';

interface SubtuneWrapper {
    subtune: Tsubtune;
}

interface PlaylistWrapper {
    playlist: Tplaylist;
}

function isSubtuneWrapper(item: any): item is SubtuneWrapper {
    return 'subtune' in item;
}

function isPlaylistWrapper(item: any): item is PlaylistWrapper {
    return 'playlist' in item;
}

interface TuneComparison {
    id: string;
    name: string;
    artist: string;
    uri: string | undefined;
}

const AnimationContext = createContext({ isTabMounted: false });

function DDContainer({
    item,
    clone = true,
    droppable = false,
    sortable = false,
    setItems
}: {
    item: any;
    clone?: boolean;
    droppable?: boolean;
    sortable?: boolean;
    setItems: (data: any, dataType: string, clear?: boolean) => void;
}) {
    const { isTabMounted } = useContext(AnimationContext);
    const { 
        currentState,
        currentEditId, 
        editMode,
        updateCurrentState,
        startEdit,
        clearEdit,
        registerContainer,
        refreshContainer
    } = useEdit();
    
    const [isCurrentlyEditing, setIsCurrentlyEditing] = useState(false);

    // Local container state
    const [containerTunes, setContainerTunes] = useState<Ttune[]>(
        isSubtuneWrapper(item) ? item.subtune.tunes : 
        isPlaylistWrapper(item) ? item.playlist.tunes : 
        []
    );

    const [isOpen, setIsOpen] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const containerRef = useRef(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const tunesContainerRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);  // Track if we've animated before
    const firstRender = useRef(true);
    
    const containerId = isSubtuneWrapper(item) ? item.subtune.id : item.playlist.id;

    // Track initial mount and tune changes
    const initialMount = useRef(true);
    const previousTunes = useRef<TuneComparison[]>([]);

    // Update isCurrentlyEditing when edit state changes
    useEffect(() => {
        const isEditing = currentEditId === containerId;
        console.log('Edit State:', { currentEditId, containerId, isEditing });
        setIsCurrentlyEditing(isEditing);
    }, [currentEditId, containerId]);

    // Log changes to isCurrentlyEditing
    useEffect(() => {
        console.log('isCurrentlyEditing changed:', isCurrentlyEditing);
    }, [isCurrentlyEditing]);

    // Container refresh function
    const refreshData = async () => {
        const mode = isSubtuneWrapper(item) ? 'subtune' : 'playlist';
        try {
            const response = await fetch(`/api/${mode}/${containerId}`);
            if (response.ok) {
                const data = await response.json();
                setContainerTunes(data[mode].tunes);
                
                // Update parent item's tunes
                if (isSubtuneWrapper(item)) {
                    item.subtune.tunes = data[mode].tunes;
                } else if (isPlaylistWrapper(item)) {
                    item.playlist.tunes = data[mode].tunes;
                }
            }
        } catch (error) {
            console.error('Error refreshing container:', containerId, error);
        }
    };

    // Register container for refresh
    useEffect(() => {
        if (containerId) {
            registerContainer(containerId, refreshData);
        }
    }, [containerId, registerContainer]);

    // Set initial styles
    useLayoutEffect(() => {
        if (contentRef.current) {
            gsap.set(contentRef.current, { 
                height: 0,
                scale: 0.95,
                opacity: 0,
                transformOrigin: "top",
                immediateRender: true,
                visibility: "visible"
            });
        }
    }, []); // Run once on mount

    // Handle animations
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (!contentRef.current) return;

        const tl = gsap.timeline({ paused: true });
        
        if (isOpen) {
            // Only measure height when opening
            gsap.set(contentRef.current, { height: "auto", visibility: "hidden" });
            const naturalHeight = (contentRef.current as HTMLDivElement).offsetHeight;
            gsap.set(contentRef.current, { height: 0, visibility: "visible" });

            // Open animation
            tl.to(contentRef.current, {
                duration: 0.4,
                height: naturalHeight,
                ease: "power2.inOut"
            })
            .to(contentRef.current, {
                duration: 0.3,
                scale: 1,
                opacity: 1,
                ease: "power2.out"
            }, "-=0.2");
        } else {
            // Close animation
            tl.to(contentRef.current, {
                duration: 0.4,
                height: 0,
                scale: 0.95,
                opacity: 0,
                ease: "power2.inOut"
            });
        }

        tl.play();

        return () => {
            tl.kill();
            return undefined;
        };
    }, [isOpen]);

    const handleSelect = useCallback(() => {
        // Mark all tunes as selected
        const selectedTunes = containerTunes.map(tune => ({
            ...tune,
            selected: true
        }));
        setItems(selectedTunes, 'tunes');
    }, [containerTunes, setItems]);

    const compareTunes = useCallback((tunesA: TuneComparison[], tunesB: Ttune[]) => {
        if (tunesA.length !== tunesB.length) return false;
        
        return tunesA.every((tuneA, index) => {
            const tuneB = tunesB[index];
            return tuneA.id === tuneB.id && 
                   tuneA.name === tuneB.name && 
                   tuneA.artist === tuneB.artist &&
                   tuneA.uri === tuneB.uri;
        });
    }, []);

    // Monitor tune changes
    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false;
            return;
        }

        if (!isCurrentlyEditing) {
            const newTunes = isSubtuneWrapper(item) ? item.subtune.tunes : 
                            isPlaylistWrapper(item) ? item.playlist.tunes : 
                            [];
            
            const tunesAreDifferent = !compareTunes(previousTunes.current, newTunes);

            if (tunesAreDifferent) {
                previousTunes.current = newTunes.map(tune => ({
                    id: tune.id,
                    name: tune.name,
                    artist: tune.artist,
                    uri: tune.uri
                }));
                setContainerTunes(newTunes);
            }
        }
    }, [item, isCurrentlyEditing, compareTunes]);

    // Create the container data with the full tunes array
    const containerData = {
        [isSubtuneWrapper(item) ? 'subtune' : 'playlist']: {
            tunes: item.subtune?.tunes || item.playlist?.tunes || [],
            color: item.subtune?.color || item.playlist?.color
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        // Get all tune elements in this container
        const tuneElements = Array.from(e.currentTarget.querySelectorAll('[data-tune-id]')) as HTMLElement[];
        console.log('Found tunes:', tuneElements.length);

        // Just add selected class for visual feedback
        tuneElements.forEach(el => {
            el.classList.add('selected-item');
        });

        // Store selected tunes in a data attribute for later use
        e.currentTarget.setAttribute('data-selected-tunes', JSON.stringify(
            tuneElements.map(el => el.getAttribute('data-tune-id'))
        ));
    };

    useEffect(() => {
        if (!isTabMounted) return;
        // ... animation code
    }, [isOpen, isTabMounted]);

    // Handle edit actions
    const handleEdit = async () => {
        if (isCurrentlyEditing) {
            await clearEdit();
            return;
        }
        
        const mode = isPlaylistWrapper(item) ? 'playlist' : 'subtune';
        const data = mode === 'playlist' ? item.playlist : item.subtune;
        
        startEdit(mode, data.id, {
            id: data.id,
            title: data.name,
            description: data.description,
            color: data.color,
            image: data.image,
            tunes: data.tunes
        });

    };

    // Sync with edit state
    useEffect(() => {
        if (isCurrentlyEditing) {
            // Sync tunes
            setContainerTunes(currentState.tunes);
            
            // Sync color
            if (isSubtuneWrapper(item)) {
                item.subtune.color = currentState.color;
            } else if (isPlaylistWrapper(item)) {
                item.playlist.color = currentState.color;
            }
        }
    }, [isCurrentlyEditing, currentState.tunes, currentState.color]);

    return (
        <div
            ref={containerRef}
            className={`cursor-move flex shrink flex-col w-full rounded-xl mt-4 shadow-xl ring-2 ring-slate-200 hover:ring-slate-100 hover:shadow-2xl container`}
            style={{ 
                backgroundColor: (item.subtune?.color || item.playlist?.color) ? 
                    hexToRGB(item.subtune?.color || item.playlist?.color, 0.25) : 
                    'slate' 
            }}
            // onClick={handleContainerClick}  // Change back to onClick
            data-container={JSON.stringify(containerData)}
        >
            {/* Header */}
            <div className="flex justify-between items-center p-2 pr-2">
                <div className="flex items-center">
                    <div className="mr-4">
                        <IconButton onClick={() => setIsOpen(!isOpen)}>
                            <DoubleArrowRoundedIcon 
                                style={{ 
                                    transform: `rotate(${isOpen ? 90 : 0}deg)`,
                                    transition: 'transform 0.3s ease'
                                }}
                            />
                        </IconButton>
                    </div>
                    <p>{item.subtune?.name || item.playlist?.name}</p>
                </div>
                <IconButton 
                    onClick={handleEdit}
                    className={isCurrentlyEditing ? 'text-blue-400' : ''}
                >
                    {isCurrentlyEditing ? (
                        <BorderColorRoundedIcon className="animate-pulse" />
                    ) : (
                        <EditIcon />
                    )}
                </IconButton>
            </div>

            {/* Content */}
            <div 
                ref={contentRef}
                style={{
                    height: 0,
                    opacity: 0,
                    transform: 'scale(0.95)',
                    transformOrigin: 'top',
                    overflow: 'hidden'
                }}
            >
                <div style={{ display: 'none' }}>
                    Tunes count: {containerTunes?.length || 0}
                </div>
                <div ref={tunesContainerRef} className="flex flex-col gap-4 p-4 container">
                    <ReactSortable
                        list={containerTunes}
                        setList={setContainerTunes}
                        animation={50}
                        group={{
                            name: "tunes",
                            pull: "clone",
                            put: false
                        }}
                        sort={false}
                        className="flex flex-col gap-4"
                    >
                        {containerTunes?.map((tune, index) => (
                            <div
                                key={`dContainer-${tune.id}`}
                                className="w-full max-h-28 relative"
                                data-tune-id={tune.id}
                                data-id={tune.id}
                            >
                                <DraggableTune
                                    tune={tune}
                                    draggableId={tune.draggableId || tune.id}
                                    containerId={item.id}
                                    mini={true}
                                    className="draggable-tune"
                                />
                            </div>
                        ))}
                    </ReactSortable>
                </div>
            </div>
        </div>
    );
}

export default memo(DDContainer); 
