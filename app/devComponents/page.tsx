'use client'
import React, {useRef, useState} from 'react'
import Card from '../components/Card';
import Tune from '../components/Tune';
import { tune } from '../subtuneTypes/Tune';
import { subtune } from '../subtuneTypes/Subtune';
import  tabbedSidePanel from  '../components/TabbedSidePanel'
import TabbedSidePanel from '../components/TabbedSidePanel';

import { DndContext, useSensors, useSensor, MouseSensor, TouchSensor, closestCorners, DragOverlay } from "@dnd-kit/core";
import { playlist } from '../subtuneTypes/Playlist';
import { nanoid } from 'nanoid';
import { arrayMove } from '@dnd-kit/sortable';

const tuneitem: tune = {
    id: '1',
    name: 'Tune Name',
    artist: 'Artist Name',
    cover: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
    external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
    color: '#aabbcc',
}


// const subtune: subtune = {
//     id: '1',
//     name: 'Subtune Name',
//     description: 'Subtune Description',
//     image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
//     tunes: [
//         {
//             id: '1',
//             name: 'Tune Name',
//             artist: 'Artist Name',
//             cover: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
//             external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
//             color: '#aabbcc',
//         },
//         {
//             id: '2',
//             name: 'Tune Name',
//             artist: 'Artist Name',
//             cover: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
//             external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
//             color: '#aabbcc',
//         },
//         {
//             id: '3',
//             name: 'Tune Name',
//             artist: 'Artist Name',
//             cover: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
//             external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
//             color: '#aabbcc',
//         },
//     ],
//     color: '#aabbcc',
// }

export default function page() {
    // const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    const [originalContainer, setOriginalContainer] = useState<string | null>(null);
    const [originalIndex, setOriginalIndex] = useState<number | null>(null);
    const dragginTune = useRef<tune | undefined>(undefined);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [results, setResult] = useState<{
        tunes: tune[]; // left panel
        subtune: tune[]; // center/subtune
        playlist: playlist[];// right panel // if we are going to abstract this page we need a bette name for this 
    }>({
        tunes: [],
        subtune: [],
        playlist: []
    });
    
    function findContainer(id: string) {
        // if id is itself a container, return it
        if (id in results) {
            return id;
        }
        // else find the container which holds tune with id
        for (const [key, value] of Object.entries(results)) {
            if (key === 'playlist') {
                for (const playlist of results.playlist) {
                    const tune = playlist.tunes.find((tune) => tune.id === id);
                    if (tune) {
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
        // // let dragginTune: tune | undefined;
        // const { active } = event;
        // const id = active.id;
        // setActiveId(id);
        // const activeContainer = findContainer(id) as keyof typeof results;
        // setOriginalContainer(activeContainer);

        // if (activeContainer === 'playlist'){
        //     const playlist = results[activeContainer].find((playlist) => playlist.tunes.find((tune) => tune.id === active.id));
        //     dragginTune.current = playlist?.tunes.find((tune) => tune.id === active.id);
        //     setOriginalIndex(playlist?.tunes.findIndex((tune) => tune.id === active.id) || null);
        // }else{
        //     dragginTune.current = results[activeContainer].find((tune) => tune.id === active.id);
        //     setOriginalIndex(results[activeContainer].findIndex((tune) => tune.id === active.id) || null);
        // }

    }

    function handleDragOver(event: any) {
        // const { active, over, draggingRect } = event;
        // console.log("Over event: ", event)

        // const { id } = active;
        // const overId = over !== null ? over.id : null;

        // // Find the containers
        // const activeContainer = findContainer(id);
        // const overContainer = findContainer(overId);
        
        // // this acts like the trash event, if a tune from the subtunes container is dragged over anything that is not the subtunes container
        // // it will be removed from the subtunes container, else it will be added to the subtunes container
        // if ((activeContainer === 'subtune' || activeContainer === undefined)) {
        //     // Handle the case where the active container is 'subtune' and it's dragged over anything that is not the 'subtune' container
        //     const present = results['subtune' as keyof typeof results].some((tune) => tune.id === dragginTune.current?.id);
        //     setResult((prev) => {
        //         // remove from subtune container
        //         if(overContainer !== 'subtune'){
        //             return {
        //                 ...prev,
        //                 ['subtune' as keyof typeof prev]: [
        //                     ...prev['subtune' as keyof typeof prev].filter((item) => item.id !== dragginTune.current?.id)
        //                 ],
        //             };
        //         }
        //         else if(overContainer === 'subtune' && present === false){ // re-add to subtune container only once
        //             return {
        //                 ...prev,
        //                 ['subtune' as keyof typeof prev]: [
        //                     ...prev['subtune' as keyof typeof prev].slice(0, originalIndex as number),
        //                     dragginTune.current as tune,
        //                     ...prev['subtune' as keyof typeof prev].slice(originalIndex as number + 1),
        //                 ],
        //             };
        //         }
        //         else{
        //             return prev;
        //         }
        //     });
        // }

        // if (
        //     !activeContainer ||
        //     !overContainer || 
        //     activeContainer === 'subtune' || 
        //     activeContainer === overContainer
        // ) {
        //     return;
        // } 

        // setResult((prev) => {
        //     const activeItems = prev[activeContainer as keyof typeof prev];
        //     const overItems = prev[overContainer as keyof typeof prev];

        //     // Find the indexes for the items
        //     const activeIndex = activeItems.findIndex((item) => item.id === id);
        //     const overIndex = overItems.findIndex((item) => item.id === overId);

        //     let newIndex;
        //     if (overId in prev) {
        //         // We're at the root droppable of a container
        //         newIndex = overItems.length;
        //     } else {
        //         // activeVal and overVal are the 'height' of each draggable item to calc if active should be placed below the last item
        //         const activeVal = event.collisions[event.collisions.findIndex((items: any) => items.id == id)].data.value;
        //         const overVal = event.collisions[event.collisions.findIndex((items: any) => items.id == overId)].data.value;

        //         const isBelowLastItem =
        //             over &&
        //             overIndex === overItems.length - 1 &&
        //             activeVal > overVal;
                    
        //         const modifier = isBelowLastItem ? 1 : 0;
                
        //         newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        //     }

        //     let originalTune: tune = JSON.parse(JSON.stringify((prev[activeContainer as keyof typeof prev][activeIndex] as tune)));
        //     if (activeIndex != -1){
        //         dragginTune.current = prev[activeContainer as keyof typeof prev][activeIndex] as tune;
        //         if(activeContainer === 'tunes' && overContainer === 'subtune'){
        //             const spotifyId = originalTune.id.split('.')[1];
        //             originalTune.id = `${nanoid(11)}.${spotifyId}`;
        //         }
        //     }

        //     return (
        //         {
        //         ...prev,
        //         [activeContainer as keyof typeof prev]: [
        //             ...prev[activeContainer as keyof typeof prev].slice(0, activeIndex),
        //             originalTune,
        //             ...prev[activeContainer as keyof typeof prev].slice(activeIndex + 1),
        //         ],
        //         [overContainer as keyof typeof prev]: [
        //             ...prev[overContainer as keyof typeof prev].slice(0, newIndex),
        //             dragginTune.current as tune,
        //             ...prev[overContainer as keyof typeof prev].slice(newIndex, prev[overContainer as keyof typeof prev].length)
        //         ]
        //     });
        // });
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

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex w-1/3 m-auto h-screen content-center justify-center items-center">
                {/* <Card subtune={subtune}/> */}
                <TabbedSidePanel  />
                <DragOverlay>
                    <Tune tune={tuneitem} />
                </DragOverlay>
            </div>
        </DndContext>
    )
}
