'use client';

import React, {useState, useEffect} from 'react';
import {
    DndContext,
    closestCenter,
    rectIntersection,
    MouseSensor,
    TouchSensor,
    DragOverlay,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    verticalListSortingStrategy,
    arraySwap
} from '@dnd-kit/sortable';

import {restrictToWindowEdges} from '@dnd-kit/modifiers';

import { ReactDOM } from 'react';
import { createPortal } from 'react-dom';

import { Tune } from '../poc/components/Tune';
import { TuneList } from '../poc/components/TuneList';
import { SortableTune } from '../poc/components/SortableTune';
import { tune } from '../subtuneTypes/Tune';

const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
};

const sandbox = () =>{
    const [containers, setContainers] = useState([ "results", "subtune" ]);
    const [tracks, setTracks] = useState<tune[]>([{id: '4', name: 'Tune 4', artist: 'Artist 4', url_preview: ''},]);
    const [tunes, setTunes] = useState<tune[]>([
        {id: '0', name: 'Tune 0', artist: 'Artist 0', url_preview: ''},
        {id: '1', name: 'Tune 1', artist: 'Artist 1', url_preview: ''},
        {id: '2', name: 'Tune 2', artist: 'Artist 2', url_preview: ''},
        {id: '3', name: 'Tune 3', artist: 'Artist 3', url_preview: ''},
    ]);
    const [activeId, setActiveId] = useState(null);
    const [activeTune, setActiveTune] = useState<tune | null>(null);
    const [portalMount, setPortalMount] = useState<HTMLElement | null>(document.body);;
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
    
    let ActiveContainer = tunes;

    return (
        <div style={wrapperStyle} className="droppableCanvas">
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            onDragMove={handleDragMove}
            modifiers={[restrictToWindowEdges]}
        >
            <TuneList id="results" tunes={tunes} />
            <br />
            <TuneList  id="subtune" tunes={tracks} />
            <DragOverlay adjustScale={false}  >
                {activeId ? (
                    <Tune
                            tune={activeTune}
                            index={activeId}
                        />
                    ) : null}
            </DragOverlay>

            {/* {createPortal(
            <DragOverlay adjustScale={false}  >
                {activeId ? (
                    <Tune
                            tune={activeTune}
                            index={activeId}
                        />
                    ) : null}
            </DragOverlay>,
            portalMount,
        )} */}

        </DndContext>
        </div>
    );

    function handleDragStart(event: any) {
        // console.log("in DS: event", event);
        const container = event.active.data.current.sortable.containerId;
        const tune = container === 'results' ? tunes.find((tune) => tune.id === event.active.id) : tracks.find((tune) => tune.id === event.active.id);
        // console.log("in DS: tune", tune);
        setActiveTune(tune || null);
        setActiveId(event.active.id);
    }

    function handleDragMove(event: any) {
        console.log("in DM: event=", event);
    }
    

    function getContainerState(id: string) {
        if (id === 'results') {
            return tunes;
        }
        if (id === 'subtune') {
            return tracks;
        }
    }

    function getContainerSetter(id: string) {
        if (id === 'results') {
            return setTunes;
        }
        if (id === 'subtune') {
            return setTracks;
        }
    }

    function handleDragEnd(event: any) {
        const {active, over} = event;
        console.log("in DE: active=", active)
        console.log("in DE over=", over)
        const activeContainer = active.data.current?.sortable.containerId;
        const overContainer = over?.data?.current?.sortable.containerId || over.id;
        
        console.log("activeContainer", activeContainer);
        if ( activeContainer === overContainer){
            if (active.id !== over.id && activeContainer == "results") {
                setTunes((tunes) => {
                    const oldIndex = tunes.findIndex((tune) => tune.id === active.id);
                    const newIndex = tunes.findIndex((tune) => tune.id === over.id);
                    const new_arr = arrayMove(tunes, oldIndex, newIndex);
                    console.log("results arr", new_arr )
                    return new_arr;
                });
            }
            if (active.id !== over.id && activeContainer == "subtune") {
                setTracks((tracks) => {
                    const oldIndex = tracks.findIndex((tune) => tune.id === active.id);
                    const newIndex = tracks.findIndex((tune) => tune.id === over.id);
                    console.log("oldIndex", oldIndex);
                    console.log("newIndex", newIndex);
                    const new_arr = arrayMove(tracks, oldIndex, newIndex);
                    console.log("subtunes arr: ", new_arr )
                    return new_arr;
                });
            }
        }
        else if (containers.some((container) => container === overContainer)) {
            if (activeContainer === 'results') {
                setTracks((tracks) => {
                    const newTrack = tunes.find((tune) => tune.id === active.id);
                    if (newTrack) {
                        const overIdx = tracks.findIndex((tune) => tune.id === over.id);
                        return [...tracks.slice(0, overIdx), newTrack, ...tracks.slice(overIdx)];
                    }
                    return tracks;
                });
                setTunes((tunes) => tunes.filter((tune) => tune.id !== active.id));
            }
            if (activeContainer === 'subtune') {
                setTunes((tunes) => {
                    const newTrack = tracks.find((tune) => tune.id === active.id);
                    if (newTrack) {
                        const overIdx = tunes.findIndex((tune) => tune.id === over.id);
                        return [...tunes.slice(0, overIdx), newTrack, ...tunes.slice(overIdx)];
                    }
                    return tunes;
                });
                setTracks((tracks) => tracks.filter((tune) => tune.id !== active.id));
            }
        }
        setActiveId(null);
    }

    function handleDragOver(event: any){
        const { active, over, draggingRect } = event;
        const { id } = active;
        const { id: overId } = over;
        // console.log("event", event);
        // console.log("active container:", active.data.current?.sortable.containerId);
        // console.log("over container:", over.data.current?.sortable.containerId || overId);
        
        // store dragged tune
        const draggedTuneId = active.id;

        // Find the containers
        const activeContainer =  active.data.current?.sortable.containerId;
        const overContainer = over.data.current?.sortable.containerId || overId;

        console.log('Active Container:', active);
        console.log('Over Container:', over);
        return;

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

    }

    function handleDragCancel() {
        setActiveId(null);
    }


}

export default sandbox;
