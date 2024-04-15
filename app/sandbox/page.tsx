'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    DragOverlay,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';


import { Tune } from '../poc/components/Tune';
import { TuneList } from '../poc/components/TuneList';
import { tune } from '../subtuneTypes/Tune';
import { SubtuneForm } from '../poc/components/SubtuneForm';
import SearchBar from '../poc/components/SearchBar';


const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
};

const sandbox = () => {
    const [tunes, setTunes] = useState<{
        results: tune[];
        subtune: tune[];
    }>({
        results: [],
        subtune: [],
    });
    const [activeId, setActiveId] = useState(null);
    const [activeTune, setActiveTune] = useState<tune | null>(null);
    const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));


    const handleSearchResults = async (data: any) => {
        const resultTunes = await data as tune[];
        console.log('Search results:', resultTunes)
        setTunes((prev) => ({
            ...prev,
            results: resultTunes
        }));
        console.log('Search results:', tunes.results);
    }

    return (
        <div>
            <div className='search-bar'>
                <SearchBar  onSubmit={handleSearchResults}/>
            </div>
            <div style={wrapperStyle} className="droppableCanvas">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                    onDragMove={handleDragMove}
                >
                    <TuneList id="results" tunes={tunes.results} />
                    <br />
                    <SubtuneForm style={{width: "50%"}}>
                        <TuneList id="subtune" tunes={tunes.subtune} />
                    </SubtuneForm>
                    <DragOverlay adjustScale={false}  >
                        {activeId ? (
                            <Tune
                                tune={activeTune}
                                id={activeId}
                            />
                        ) : null}
                    </DragOverlay>

                </DndContext>
            </div>
        </div>
    );


    function findContainer(id: string) {
        // if id is itself a container, return it
        if (id in tunes) {
            return id;
        }
        // else find the container which holds tune with id
        for (const [key, value] of Object.entries(tunes)) {
            if (value.find((tune) => tune.id === id)) {
                return key;
            }
        }
    }


    function handleDragStart(event: any) {
        const { active } = event;
        const id = active.id;
        setActiveId(id);
        const activeContainer = findContainer(id) as keyof typeof tunes;
        const activeTune = tunes[activeContainer].find((tune) => tune.id === active.id);
        setActiveTune(activeTune || null);
    }

    function handleDragOver(event: any) {
        const { active, over, draggingRect } = event;
        // console.log("event: ", event)

        const { id } = active;
        const { id: overId } = over;
        // console.log("active id: ", id);
        // console.log("over id: ", overId);


        // Find the containers
        const activeContainer = findContainer(id);
        const overContainer = findContainer(overId);
        // console.log("active container: ", activeContainer);
        // console.log("over container: ", overContainer);

        // console.log("active value: ", event.collisions[event.collisions.findIndex((items) => items.id == id)].data.value)
        // console.log("over value: ", event.collisions[event.collisions.findIndex((items) => items.id == overId)].data.value)

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer === overContainer
        ) {
            return;
        }

        setTunes((prev) => {
            const activeItems = prev[activeContainer];
            const overItems = prev[overContainer];
            // console.log("active items: ", activeItems)
            // console.log("over items: ", overItems)

            // Find the indexes for the items
            const activeIndex = activeItems.findIndex((item) => item.id === id);
            const overIndex = overItems.findIndex((item) => item.id === overId);
            // console.log("active index: ", activeIndex);
            // console.log("over index: ", overIndex);

            // return prev;
            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overItems.length;
            } else {
                const activeVal = event.collisions[event.collisions.findIndex((items) => items.id == id)].data.value;
                const overVal = event.collisions[event.collisions.findIndex((items) => items.id == overId)].data.value;
                const isBelowLastItem =
                    over &&
                    overIndex === overItems.length - 1 &&
                    activeVal > overVal;

                const modifier = isBelowLastItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            return {
                // ...prev,
                [activeContainer]: [
                    ...prev[activeContainer].filter((item) => item.id !== active.id)
                ],
                [overContainer]: [
                    ...prev[overContainer].slice(0, newIndex),
                    tunes[activeContainer][activeIndex],
                    ...prev[overContainer].slice(newIndex, prev[overContainer].length)
                ]
            };
        });
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

        const activeIndex = tunes[activeContainer].findIndex((item) => item.id === id);
        const overIndex = tunes[overContainer].findIndex((item) => item.id === overId);

        if (activeIndex !== overIndex) {
            setTunes((items) => ({
                ...items,
                [overContainer]: arrayMove(tunes[overContainer], activeIndex, overIndex)
            }));
        }

        setActiveId(null);
    }

    function handleDragCancel(event: any) {

    }

    function handleDragMove(event: any) {

    }

}

export default sandbox;