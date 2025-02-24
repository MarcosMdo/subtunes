'use client';
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import gsap from 'gsap';
import { nanoid } from 'nanoid';

import styles from "./Component.module.css"

import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { styled } from '@mui/material/styles';

import { motion, AnimatePresence } from 'framer-motion';

import { HexColorPicker, HexColorInput } from "react-colorful";

import { playlistItem } from "../subtuneTypes/Playlist";
import { useEdit } from "../contexts/editContext";
import { hexToRGB } from '../utils/helperFunctions';

interface PlaylistFormProps {
    items: playlistItem[];
    onColorChange: (color?: number[]) => void;
    onImageChange: (imageurl: string) => void;
    setItems: (items: playlistItem[]) => void;
}

export default function PlaylistForm({
    items,
    onColorChange,
    onImageChange,
    setItems
}: PlaylistFormProps) {
    const { 
        currentState,
        currentEditId, 
        editMode,
        clearEdit,
        refreshList,
        refreshContainer,
        updateCurrentState,
        preEditSnapshot,
        selectedTab,
        setSelectedTab
    } = useEdit();

    const [file, setFile] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    const [compColor, setCompColor] = useState<string>("#000000");
    const [playlistColorRGBA, setSubtuneColorRGBA] = useState<number[]>([0, 0, 0, 0]);

    const [isClosing, setIsClosing] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    
    const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(null);
    
    const processedEdit = useRef(false);
    
    // Reset the processed flag when editData changes
    useEffect(() => {
        if (!currentState) {
            processedEdit.current = false;
        }
    }, [currentState]);

    // Handle color picker animation
    useEffect(() => {
        if (!colorPickerRef.current) return;

        const tl = gsap.timeline();

        if (anchorEl) {
            setIsClosing(false);
            tl.fromTo(colorPickerRef.current,
                {
                    opacity: 0.7,
                    scale: 0.25,
                    rotation: -35
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    duration: 0.3,
                    ease: "back.out(1.7)"
                }
            );
        }
    }, [anchorEl]);

    const handleClose = () => {
        if (!colorPickerRef.current || isClosing) return;
        
        setIsClosing(true);
        gsap.to(colorPickerRef.current, {
            opacity: 0,
            scale: 0.125,
            rotation: 0,
            duration: 0.3,
            ease: "back.out(1.7)",
            onComplete: () => {
                setIsClosing(false);
                setAnchorEl(null);
            }
        });
    };

    // color picker
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const open = Boolean(anchorEl);
    const popoverId = open ? 'colorPickerPopover' : undefined;

    const handleColorChange = (color: string) => {
        if (!editMode) {
            updateCurrentState({ color });
        }
        const rgb = color.match(/\w\w/g)?.map(x => parseInt(x, 16));
        if (rgb) {
            const rgba = [...rgb, 0.5];
            setSubtuneColorRGBA(rgba);
            onColorChange(rgba);
        }
    };

    // image uploader
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // checks 
        if (!e.target.files) return console.log("No files selected");
        setFile(e.target.files[0])
    }
    
    useEffect(() => {
        if (currentState.image) {
            onImageChange(currentState.image);
        }
        else{ // covers the case where the image is not set or when the subtune being edited has no image
            onImageChange("");
        }
    }, [currentState.image])
    
    useEffect(() => {
        const reader = new FileReader();

        // we first read the contents of the file and store it in the file reader object
        if (file) {
            reader.readAsDataURL(file);
        }

        // then we store it in state var
        reader.onload = () => {
            setImage(reader.result as string);
            onImageChange(reader.result as string);
            updateCurrentState({ image: reader.result as string });
        }
    }, [file]);



    useLayoutEffect(() => {
        if (currentState && editMode) {
            console.log('Edit state update:', {
                currentState,
                editMode,
                color: currentState.color,
                hasColor: !!currentState.color
            });

            // Update visual states
            if (currentState.color) {
                console.log("Current color:", currentState.color);
                const rgbValues = currentState.color.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [];
                if (rgbValues.length === 3) {
                    const rgba = [...rgbValues, 0.5];
                    console.log("Converted RGBA:", rgba);
                    setSubtuneColorRGBA(rgba);
                    onColorChange(rgba);  // Direct update to middle panel
                    
                    // Update complementary color
                    const complementaryRgb = rgbValues.map(x => 255 - x);
                    const complementaryColor = `#${complementaryRgb.map((x: number) => x.toString(16).padStart(2, '0')).join('')}`;
                    setCompColor(complementaryColor);
                }
            }

            if (currentState.image) {
                onImageChange(currentState.image);
            }
        }
    }, [editMode]);

    // Add a dependency array to the playlistData monitor effect
    useEffect(() => {
        console.log('playlistData changed:', {
            title: currentState.title,
            description: currentState.description,
            color: currentState.color
        });
    }, [currentState.title, currentState.description, currentState.color]);

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const CACHE_KEY = 'playlistFormCache';

    const saveToCache = () => {
        const cacheData = {
            currentState,
            selectedTab,
            currentEditId
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    };

    const loadFromCache = () => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const data = JSON.parse(cached);
            updateCurrentState(data.currentState);
            setItems(data.currentState.tunes);
            updateCurrentState({tunes: data.currentState.tunes})
            setSelectedTab(data.selectedTab);
            setImage(data.currentState.image);
            setSubtuneColorRGBA(data.subtuneColorRGBA);
            onColorChange(data.subtuneColorRGBA);
            if (data.currentEditId) {
                setCurrentPlaylistId(data.currentEditId);
            }
        }
    };

    const clearCache = () => {
        localStorage.clear();
    };

    // Add effect to load cache on mount
    useEffect(() => {
        loadFromCache();
    }, []);

    // Add effect to save to cache when data changes
    useEffect(() => {
        saveToCache();
    }, [currentState, items, selectedTab, image, currentEditId]);

    const clearForm = () => {
        // First clear the cache to prevent state restoration
        clearCache();

        // Clear visual states first
        setSubtuneColorRGBA([0, 0, 0, 0]);
        onColorChange();
        onImageChange("");
        
        // Then clear form data
        updateCurrentState({
            title: "",
            description: "",
            color: "",
            image: "",
            tunes: [],
        });

        setFile(null);
        setImage(null);
        setItems([]);

        // Clear edit state last
        if (editMode) {
            clearEdit();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        const updateData = {
            name: currentState.title,
            description: currentState.description,
            color: currentState.color,
            image: currentState.image,
            tunes: currentState.tunes.map(tune => tune.id)  // Make sure these are strings
        };
        
        // Log the exact data being sent
        console.log('Sending data:', {
            mode: editMode || selectedTab,
            updateData: JSON.stringify(updateData),
            tuneIds: updateData.tunes
        });
        
        formData.append('data', JSON.stringify(updateData));

        try {
            const mode = editMode || selectedTab;
            const response = await fetch(`/api/${mode}`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }
            
            await clearEdit();
            refreshList(mode);  // Refresh the list after successful save
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    // Add refs for the buttons
    const playlistButtonRef = useRef<HTMLButtonElement>(null);
    const subtuneButtonRef = useRef<HTMLButtonElement>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);

    // Add tab indicator ref
    const tabIndicatorRef = useRef<HTMLDivElement>(null);

    const updateTabIndicator = () => {
        if (tabIndicatorRef.current) {
            const tabElement = document.querySelector(`button[name="${selectedTab}"]`);
            if (tabElement) {
                const bounds = tabElement.getBoundingClientRect();
                const parentBounds = tabElement.parentElement?.getBoundingClientRect();
                
                if (parentBounds) {
                    // Calculate position relative to center
                    const x = (bounds.left - parentBounds.left) - (parentBounds.width / 2);
                    
                    gsap.to(tabIndicatorRef.current, {
                        xPercent: 0,
                        x,
                        width: bounds.width,
                        duration: 0.8,
                        ease: "elastic.out(1 , 0.75)",
                        autoAlpha: 1
                    });
                }
            }
        }
    };

    useEffect(() => {
        updateTabIndicator();
        
        // Add resize listener
        window.addEventListener('resize', updateTabIndicator);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', updateTabIndicator);
        };
    }, [selectedTab]); // Runs on tab change and handles resize

    // Update the getTabLabels function to return separate words
    const getTabLabels = () => [
        { 
            id: 'subtune', 
            label: {
                action: currentEditId ? 'Editing' : 'Creating',
                type: 'Subtune'
            }
        },
        { 
            id: 'playlist', 
            label: {
                action: currentEditId ? 'Editing' : 'Creating',
                type: 'Playlist'
            }
        }
    ];

    useLayoutEffect(() => {
        if (currentState?.color) {
            const rgbValues = currentState.color.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [];
            if (rgbValues.length === 3) {
                const rgba = [...rgbValues, 0.5];
                onColorChange(rgba);
            }
        } else {
            onColorChange();  // Reset color if no color in state
        }
    }, [currentState]);

    // Update selectedTab when editMode changes
    useEffect(() => {
        if (editMode) {
            // Force tab to match edit type
            setSelectedTab(editMode);
        }
    }, [editMode]);

    // Modify tab click handler
    const handleTabClick = (tabId: 'playlist' | 'subtune') => {
        if (!editMode) {  // Only allow tab changes when not editing
            setSelectedTab(tabId);
        }
    };

    return (
        <div className="flex shrink h-1/16" style={{ position: 'relative', zIndex: 20 }}>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col grow shrink w-full h-full p-2 content-center justify-center"
            >
                <div className="flex flex-col w-full h-full content-center justify-center">
                    {/* Name Input */}
                    <input
                        required
                        type="text"
                        name="subtune-name"
                        id="subtune-name"
                        autoComplete="off"
                        placeholder={`${selectedTab === 'subtune' ? 'Subtune' : 'Playlist'} Name`}
                        value={currentState.title}
                        onChange={(e) => {
                            if (!editMode) {
                                updateCurrentState({ title: e.target.value });
                            }
                        }}
                        className="text-7xl w-full text-center self-center bg-transparent placeholder:text-center placeholder:text-gray-50 focus:outline-none"
                    />
                    
                    {/* Description Input */}
                    <input
                        type="text"
                        name="subtune-description"
                        id="subtune-description"
                        autoComplete="off"
                        placeholder={`${selectedTab === 'subtune' ? 'Subtune' : 'Playlist'} Description`}
                        value={currentState.description}
                        onChange={(e) => {
                            if (!editMode) {
                                updateCurrentState({ description: e.target.value });
                            }
                        }}
                        className="text-3xl w-full text-center self-center p-2 bg-transparent placeholder:text-center placeholder:text-gray-50 focus:outline-none"
                    />

                    {/* Action Buttons - Moved up */}
                    <div className="flex flex-row justify-center content-center pb-4">
                        <Button type="submit"><SaveRoundedIcon /></Button>
                        <Button type="button" onClick={clearForm}><DeleteOutlineRoundedIcon /></Button>
                        <Button aria-describedby={popoverId} onClick={handleClick}><ColorLensRoundedIcon /></Button>
                        <Button component="label" role={undefined} tabIndex={-1}>
                            <VisuallyHiddenInput type="file" onChange={handleImageUpload} />
                            <AddPhotoAlternateIcon />
                        </Button>
                        
                        {/* Add back the Popover */}
                        <Popover
                            id={popoverId}
                            open={Boolean(anchorEl) || isClosing}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'center',
                            }}
                            className={styles.transparentChild}
                        >
                            <div>
                                {(Boolean(anchorEl) || isClosing) && (
                                    <div ref={colorPickerRef} className='color-picker flex flex-col justify-items-center pl-4' style={{ overflow: "hidden" }}>
                                        <HexColorInput 
                                            className='flex self-stretch color-input mx-0' 
                                            color={currentState.color} 
                                            style={{ marginBottom: "5px" }} 
                                            prefixed 
                                        />
                                        <HexColorPicker 
                                            color={currentState.color} 
                                            onChange={handleColorChange} 
                                        />
                                    </div>
                                )}
                            </div>
                        </Popover>
                    </div>

                    {/* Tab Buttons - Moved down */}
                    <div ref={buttonContainerRef} className="flex flex-row w-full justify-center gap-4 relative mb-4">
                        {/* Tab indicator */}
                        <div 
                            ref={tabIndicatorRef}
                            className="absolute rounded-3xl py-2 bg-slate-200/25 ring-1 ring-slate-100"
                            style={{ 
                                height: '32px',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                visibility: 'hidden',
                                opacity: 0,
                            }}
                        />
                        
                        {/* Tab buttons */}
                        {getTabLabels().map((tab) => (
                            <button
                                key={tab.id}
                                name={tab.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTabClick(tab.id as 'playlist' | 'subtune');
                                }}
                                disabled={editMode !== null}  // Disable when editing
                                className={`${selectedTab === tab.id ? "" : "hover:opacity-50"} 
                                    relative rounded-full px-3 font-medium outline-2 flex items-center
                                    ${editMode && tab.id !== editMode ? "opacity-50" : ""}  // Dim non-selected tab when editing
                                    ${editMode ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                <span className="relative flex flex-col items-center leading-tight">
                                    <span className="text-base">
                                        {editMode ? 
                                            `${tab.label.type}` : 
                                            `${tab.label.type}`}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </form>
        </div>
    )
}