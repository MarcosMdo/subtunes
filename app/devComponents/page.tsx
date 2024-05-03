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
    image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
    external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
    color: '#aabbcc',
}


const subtuneObj: subtune = {
    id: '1',
    name: 'Subtune Name',
    description: 'Subtune Description',
    image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
    tunes: [
        {
            id: '1',
            name: 'Tune Name',
            artist: 'Artist Name',
            image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
            external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
            color: '#aabbcc',
        },
        {
            id: '2',
            name: 'Tune Name',
            artist: 'Artist Name',
            image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
            external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
            color: '#aabbcc',
        },
        {
            id: '3',
            name: 'Tune Name',
            artist: 'Artist Name',
            image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
            external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
            color: '#aabbcc',
        },
    ],
    color: '#aabbcc',
}

const library = [
    {
        id: '2',
        name: 'Subtune Name 2',
        description: 'Subtune Description 2',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
        tunes: [
            {
                id: '4',
                name: 'Tune Name 4',
                artist: 'Artist Name 4',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '5',
                name: 'Tune Name 5',
                artist: 'Artist Name 5',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
        ],
        color: '#aabbcc',
    },
    {
        id: '3',
        name: 'Subtune Name 3',
        description: 'Subtune Description 3',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
        tunes: [
            {
                id: '6',
                name: 'Tune Name 6',
                artist: 'Artist Name 6',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '7',
                name: 'Tune Name 7',
                artist: 'Artist Name 7',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '8',
                name: 'Tune Name 8',
                artist: 'Artist Name 8',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
        ],
        color: '#aabbcc',
    },
    {
        id: '4',
        name: 'Subtune Name 4',
        description: 'Subtune Description 4',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
        tunes: [
            {
                id: '9',
                name: 'Tune Name 9',
                artist: 'Artist Name 9',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '10',
                name: 'Tune Name 10',
                artist: 'Artist Name 10',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
        ],
        color: '#aabbcc',
    },
    {
        id: '5',
        name: 'Subtune Name 5',
        description: 'Subtune Description 5',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
        tunes: [
            {
                id: '11',
                name: 'Tune Name 11',
                artist: 'Artist Name 11',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '12',
                name: 'Tune Name 12',
                artist: 'Artist Name 12',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '13',
                name: 'Tune Name 13',
                artist: 'Artist Name 13',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
        ],
        color: '#aabbcc',
    },
    {
        id: '6',
        name: 'Subtune Name 6',
        description: 'Subtune Description 6',
        image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
        tunes: [
            {
                id: '14',
                name: 'Tune Name 14',
                artist: 'Artist Name 14',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '15',
                name: 'Tune Name 15',
                artist: 'Artist Name 15',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
            {
                id: '16',
                name: 'Tune Name 16',
                artist: 'Artist Name 16',
                image_url: 'https://i.scdn.co/image/ab67616d0000b273125624f2e04f5a1ccb0dfb45',
                external: 'https://p.scdn.co/mp3-preview/4f7fe3eb08c8f3619866bb90d53bc4e07b772c24?cid=8ec871a4f62845869913cbc667b7f413',
                color: '#aabbcc',
            },
        ],
        color: '#aabbcc',
    },
]

export default function page() {
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    const handlePanelResults = (data: any, dataType: any, clear?: boolean) => {
        return;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
        >
        <div className="flex w-1/3 m-auto h-full content-center justify-center items-center">
            {/* <Card subtune={subtune}/> */}
            <TabbedSidePanel 
                id="right-panel" 
                side='right' 
                searchTarget="subtune" 
                items={library}
                toggleListener={() =>{}}
                onResults={handlePanelResults} />
        </div>
        </DndContext>
    )
}
