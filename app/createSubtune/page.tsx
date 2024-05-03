'use client'
import { useState, useEffect, useLayoutEffect, useRef } from 'react';

import { 
    DndContext, 
    useSensors, 
    useSensor, 
    closestCorners,
    pointerWithin, 
    closestCenter,
    MouseSensor, 
    TouchSensor, 
    DragOverlay 
} from "@dnd-kit/core"
import { arrayMove } from '@dnd-kit/sortable';

import { tune, isTune } from "../subtuneTypes/Tune"
import { playlist } from "../subtuneTypes/Playlist"
import { subtune } from "../subtuneTypes/Subtune"
import { DndList } from "../components/DndList"
import SortableTune  from "../components/SortableTune"
import SidePanel from "../components/SidePanel"
import SubtuneForm from "../components/SubtuneForm"
import { CurrentPreviewProvider } from "../contexts/audioPreviewContext"

import { motion, useAnimate } from "framer-motion";

import { nanoid } from 'nanoid';
import TabbedSidePanel from '../components/TabbedSidePanel';

export default function CreateSubtune() {
    const [scope, animate] = useAnimate();
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    const [leftPanelState, setLeftPanelState] = useState<boolean>(true);
    const [rightPanelState, setRightPanelState] = useState<boolean>(true);
    const [subtuneColor, setSubtuneColor] = useState<number[]>([0, 0, 0, 0]);
    const [backgroundImage, setBackgroundImage] = useState<string>("");
    const [originalContainer, setOriginalContainer] = useState<string | null>(null);
    const [originalIndex, setOriginalIndex] = useState<number | null>(null);
    const dragginTune = useRef<tune | undefined>(undefined);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [results, setResult] = useState<{
        tunes: tune[]; // left panel
        subtune: tune[]; // center/subtune
        library: playlist[] | subtune[];// right panel // if we are going to abstract this page we need a bette name for this 
    }>({
        tunes: [],
        subtune: [],
        library: []
    });

    const processIds = (data?: tune[] | subtune[] | playlist[], dataType?: 'tune' | 'playlist' | 'subtune') => {
        console.log("processing ids...", data);
        if (data !== undefined){
            if (dataType === 'tune'){
                console.log("prepending ids")
                data.forEach((tune) => {
                    tune.id =  `${nanoid(11)}.${tune.id}`;
                });
            }
            else{
                data.forEach((item) => {
                    if('tunes' in item){
                        item.tunes.forEach((tune) => {
                            tune.id = `${nanoid(11)}.${tune.id}`;
                        });
                    }
            })
            }
        }
    }

    // uugglyy pero fuckitin
    const handlePanelResults = async (data: tune[] | subtune[] | playlist[], dataType: 'tune' | 'subtune' | 'playlist', clear?: boolean) =>{
        let resultData = await data;
        processIds(resultData); // only works for tunes or a single tune right now
        if (dataType === 'tune') {
            if (clear === false || clear === undefined){
                return setResult((prev) => ({
                    ...prev,
                    [`${dataType}s`]: [...prev[`${dataType}s`], ...resultData] 
                }));
            }
            else if (clear === true){
                return setResult((prev) => ({
                    ...prev,
                    [`${dataType}s`]: resultData
                }));
            }

        }
        else{
            setResult((prev) => ({
                ...prev,
                ['library' as keyof typeof results]: resultData
            }));
        }
    }

    const updateSubtunePanel = (color: number[]) => {
        console.log("Subtune color received: ", color);
        setSubtuneColor(color);
    }

    const updateBackground = (imageurl: string) => {
        console.log("Background image received: ", imageurl);
        setBackgroundImage(imageurl);
    }

    const hideShowPanels = () => {
        if (leftPanelState && rightPanelState) {
            setLeftPanelState(false);
            setRightPanelState(false);
        }
        if(!leftPanelState && !rightPanelState){
            setLeftPanelState(true);
            setRightPanelState(true);
        }
        if(leftPanelState && !rightPanelState){
            setLeftPanelState(false);
        }
        if(!leftPanelState && rightPanelState){
            setRightPanelState(false);
        }
    }

    useLayoutEffect(() => {
        if(!leftPanelState){
            animate("#left-panel", {x:"-75%", width: '100%'}, {type: 'spring', bounce: 0.35});
        }
        if(!rightPanelState){
            animate("#right-panel", {x:"75%", width: '100%'}, {type: 'spring', bounce: 0.35});
        }
        if(leftPanelState && rightPanelState) {
            animate("#playlist", { x: 0, width: '100%'}, {type: 'spring', bounce: 0.35});
            animate("#left-panel", {x:0, width: '100%'}, {type: 'spring', bounce: 0.35});  
            animate("#right-panel", {x:0, width: '100%'}, {type: 'spring', bounce: 0.35});
        }
        if (!leftPanelState && !rightPanelState) {
            animate("#playlist", { x: 0, width: '250%'}, {type: 'spring', bounce: 0.35});
        }
        if(leftPanelState && !rightPanelState){
            animate("#left-panel", {x: 0, width: '350%'}, {type: 'spring', bounce: 0.35});
            animate("#playlist", {x: 80, width: '350%'}, {type: 'spring', bounce: 0.35});
        }
        if (!leftPanelState && rightPanelState) {
            animate("#right-panel", {x: 0, width: '350%'}, {type: 'spring', bounce: 0.35});
            animate("#playlist", {x: -80, width: '350%' }, {type: 'spring', bounce: 0.35});
        }
    }, [leftPanelState, rightPanelState])

    function findContainer(id: string) {
        // if id is itself a container, return it
        if (id in results) {
            return id;
        }
        // else find the container which holds tune with id
        for (const [key, value] of Object.entries(results)) {
            if (key === 'library') {
                console.log("searching in library...")
                for (const playlist of results.library) {
                    console.log("search playlist", playlist)
                    const tune = playlist.tunes.find((tune) => tune.id === id);
                    if (tune !== undefined) {
                        // Found the tune with matching id in the playlist
                        // Do something with it
                        console.log("Found tune:", tune);
                        return key;
                    }
                }
            }
            if (value.find((tune) => tune.id === id)) {
                return key;
            }
        }
    }
    
    function handleDragStart(event: any) {
        // let dragginTune: tune | undefined;
        const { active } = event;
        const id = active.id;
        setActiveId(id);
        const activeContainer = findContainer(id) as keyof typeof results;
        setOriginalContainer(activeContainer);

        if (activeContainer === 'library'){
            const playlist = results[activeContainer].find((playlist) => playlist.tunes.find((tune) => tune.id === active.id));
            dragginTune.current = playlist?.tunes.find((tune) => tune.id === active.id);
            setOriginalIndex(playlist?.tunes.findIndex((tune) => tune.id === active.id) || null);
        }else{
            dragginTune.current = results[activeContainer].find((tune) => tune.id === active.id);
            setOriginalIndex(results[activeContainer].findIndex((tune) => tune.id === active.id) || null);
        }

    }

    function handleDragOver(event: any) {
        const { active, over, draggingRect } = event;
        console.log("Over event: ", event)

        const { id } = active;
        const overId = over !== null ? over.id : null;

        // Find the containers
        const activeContainer = findContainer(id);
        const overContainer = findContainer(overId);
        
        // this acts like the trash event, if a tune from the subtunes container is dragged over anything that is not the subtunes container
        // it will be removed from the subtunes container, else it will be added to the subtunes container
        if ((activeContainer === 'subtune' || activeContainer === undefined)) {
            // Handle the case where the active container is 'subtune' and it's dragged over anything that is not the 'subtune' container
            const present = results['subtune' as keyof typeof results].some((tune) => tune.id === dragginTune.current?.id);
            setResult((prev) => {
                // remove from subtune container
                if(overContainer !== 'subtune'){
                    return {
                        ...prev,
                        ['subtune' as keyof typeof prev]: [
                            ...prev['subtune' as keyof typeof prev].filter((item) => item.id !== dragginTune.current?.id)
                        ],
                    };
                }
                else if(overContainer === 'subtune' && present === false){ // re-add to subtune container only once
                    return {
                        ...prev,
                        ['subtune' as keyof typeof prev]: [
                            ...prev['subtune' as keyof typeof prev].slice(0, originalIndex as number),
                            dragginTune.current as tune,
                            ...prev['subtune' as keyof typeof prev].slice(originalIndex as number + 1),
                        ],
                    };
                }
                else{
                    return prev;
                }
            });
        }

        if (
            !activeContainer ||
            !overContainer || 
            activeContainer === 'subtune' || 
            activeContainer === overContainer
        ) {
            return;
        } 
        if(activeContainer === 'library'){
        
        }else{
        setResult((prev) => {
            const activeItems = prev[activeContainer as keyof typeof prev];
            const overItems = prev[overContainer as keyof typeof prev];

            // Find the indexes for the items
            const activeIndex = activeItems.findIndex((item) => item.id === id);
            const overIndex = overItems.findIndex((item) => item.id === overId);

            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length;
            } else {
                // activeVal and overVal are the 'height' of each draggable item to calc if active should be placed below the last item
                const activeVal = event.collisions[event.collisions.findIndex((items: any) => items.id == id)].data.value;
                const overVal = event.collisions[event.collisions.findIndex((items: any) => items.id == overId)].data.value;

                const isBelowLastItem =
                    over &&
                    overIndex === overItems.length - 1 &&
                    activeVal > overVal;
                    
                const modifier = isBelowLastItem ? 1 : 0;
                
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            let originalTune: tune = JSON.parse(JSON.stringify((prev[activeContainer as keyof typeof prev][activeIndex] as tune)));
            if (activeIndex != -1){
                dragginTune.current = prev[activeContainer as keyof typeof prev][activeIndex] as tune;
                if(activeContainer === 'tunes' && overContainer === 'subtune'){
                    const spotifyId = originalTune.id.split('.')[1];
                    originalTune.id = `${nanoid(11)}.${spotifyId}`;
                }
            }

            return (
                {
                ...prev,
                [activeContainer as keyof typeof prev]: [
                    ...prev[activeContainer as keyof typeof prev].slice(0, activeIndex),
                    originalTune,
                    ...prev[activeContainer as keyof typeof prev].slice(activeIndex + 1),
                ],
                [overContainer as keyof typeof prev]: [
                    ...prev[overContainer as keyof typeof prev].slice(0, newIndex),
                    dragginTune.current as tune,
                    ...prev[overContainer as keyof typeof prev].slice(newIndex, prev[overContainer as keyof typeof prev].length)
                ]
            });
        });
    }   
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;
        const { id } = active;
        const { id: overId } = over;

        const activeContainer = findContainer(id);
        const overContainer = findContainer(overId);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            return;
        }

        const activeIndex = results[activeContainer as keyof typeof results].findIndex((item) => item.id === id);
        const overIndex = results[overContainer as keyof typeof results].findIndex((item) => item.id === overId);

        if (activeIndex !== overIndex) {
            setResult((items) => ({
                ...items,
                [overContainer]: overContainer === 'tunes' ? arrayMove(results.tunes, activeIndex, overIndex) : arrayMove(results.subtune, activeIndex, overIndex)
            }));
        }

        setActiveId(null);
    }

    function handleDragCancel(event: any) {
        setActiveId(null);
    }
    
    return (
        <CurrentPreviewProvider>
            <div className="flex flex-col w-full h-full"
                style={{
                    backgroundImage: `url(${backgroundImage !== "" ? backgroundImage : "https://raw.githubusercontent.com/MarcosMdo/subtunes/9b6594c460204437b9c2b3d517238da5fb38e1b5/public/background.png"})`, 
                    backgroundSize: `cover`, 
                    backgroundPosition: `center`, 
                    backgroundRepeat: `no-repeat`}}
            >
                <div className="flex flex-col w-full h-full backdrop-blur-md" >
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                        // onDragMove={handleDragMove}
                    >
                        <SubtuneForm onColorChange={updateSubtunePanel} onImageChange={updateBackground} subtuneTunes={results.subtune}/>
                        <motion.div 
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.5, when: "beforeChildren"}}
                        className="flex flex-row ">
                            <div 
                                ref={scope}
                                className="motion flex flex-row grow shrink w-full overflow-x-clip"
                            >
                                <SidePanel 
                                    id="left-panel" 
                                    side='left' 
                                    searchTarget="tune"
                                    items={results.tunes}
                                    toggleListener={() =>{setLeftPanelState(!leftPanelState)}}
                                    onResults={handlePanelResults}
                                />
                                <div 
                                    id='playlist' 
                                    className="flex flex-col justify-center content-center p-4 my-8 ring-1 ring-slate-100 rounded-2xl shadow-2xl w-full overflow-y-auto no-scrollbar hover:ring-2 hover:ring-slate-200/50"
                                    style={{backgroundColor: `rgba(${subtuneColor.join(',')})`}}
                                    onDoubleClick={hideShowPanels}
                                >
                                    <DndList id='subtune' tunes={results.subtune} mini={false} />
                                </div>
                                <TabbedSidePanel 
                                    id="right-panel" 
                                    side='right' 
                                    items={results.library}
                                    toggleListener={() =>{setRightPanelState(!rightPanelState)}}
                                    onResults={handlePanelResults}
                                />
                                {/* <SidePanel 
                                    id="right-panel" 
                                    side='right' 
                                    searchTarget="playlist" 
                                    items={results.library}
                                    toggleListener={() =>{setRightPanelState(!rightPanelState)}}
                                    onResults={handlePanelResults}
                                /> */}
                            </div>
                        <DragOverlay
                            className="w-full h-full content-center items-center justify-center"
                            zIndex={10}
                        >
                            { dragginTune &&
                                <SortableTune tune={dragginTune.current as tune} id={'overlay'} mini={true}/>
                            }
                        </DragOverlay>
                    </motion.div>
                    </DndContext>
                </div>
            </div>
        </CurrentPreviewProvider>
    )

}