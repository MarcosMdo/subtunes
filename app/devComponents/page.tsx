'use client'
import React from 'react'
import Card from '../components/Card';
import { tune } from '../subtuneTypes/Tune';
import { subtune } from '../subtuneTypes/Subtune';
import  tabbedSidePanel from  '../components/TabbedSidePanel'
import TabbedSidePanel from '../components/TabbedSidePanel';

import { DndContext, useSensors, useSensor, MouseSensor, TouchSensor, closestCorners } from "@dnd-kit/core";

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
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
        >
        <div className="flex w-1/3 m-auto h-screen content-center justify-center items-center">
            {/* <Card subtune={subtune}/> */}
            <TabbedSidePanel  />
        </div>
        </DndContext>
    )
}
