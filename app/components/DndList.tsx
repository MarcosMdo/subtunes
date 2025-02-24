import { forwardRef, memo, useEffect, useState, useRef } from 'react';
import DraggableTune from './draggableTune';
import { ReactSortable } from "react-sortablejs";
import Sortable, { OnSpill } from 'sortablejs';
import { nanoid } from 'nanoid';
import React from 'react';

import { Ttune } from '../subtuneTypes/Tune';
import { Tsubtune } from '../subtuneTypes/Subtune';
import { Tplaylist } from '../subtuneTypes/Playlist';


interface DndListProps {
    id: string;
    tunes: Ttune[];
    onSort?: (tunes: Ttune[]) => void;  // Simplified - removed removedItems param
    setItems?: (
        items: Ttune[],
        sortable?: Sortable | null,
        store?: any
    ) => void;
    clone?: boolean;
    sort?: boolean;
    droppable?: boolean;
    mini?: boolean;
    disableDroppable?: boolean;
    color?: string;
    multiDrag?: boolean;
    onStart?: () => void;
    onEnd?: (evt: any) => void;
}

const MemoizedDraggableTune = memo(DraggableTune, (prev, next) => {
    return (
        prev.tune.draggableId === next.tune.draggableId &&
        prev.draggableId === next.draggableId &&
        prev.containerId === next.containerId
    );
});

const DndList = forwardRef(function DndList(
    props: DndListProps,
    ref
) {
    const { id, tunes, onSort, setItems, ...otherProps } = props;

    const handleSetList = (newState: any[]) => {
        if (!Array.isArray(newState)) return;
        
        // For target list
        if (id === 'target-list') {
            if (newState.every(item => !('subtune' in item) && !('playlist' in item))) {
                // For reorders and spills, just update the state
                console.log("Reorder or spill", newState);
                setItems?.(newState);
                return;
            }
            
            // For drops from other lists, unwrap the containers
            const extractedTunes = newState.reduce((acc: Ttune[], item) => {
                if ('subtune' in item) {
                    const tunesWithSelection = item.subtune.tunes.map((tune: Ttune) => ({
                        ...tune,
                        draggableId: nanoid(),
                        selected: true,
                        color: item.subtune.color
                    }));
                    return [...acc, ...tunesWithSelection];
                } else if ('playlist' in item) {
                    const tunesWithSelection = item.playlist.tunes.map((tune: Ttune) => ({
                        ...tune,
                        draggableId: nanoid(),
                        selected: true,
                        color: item.playlist.color
                    }));
                    return [...acc, ...tunesWithSelection];
                } else {
                    return [...acc, item];
                }
            }, []);
            
            setItems?.(extractedTunes);
        }
    };

    const handleSpill = (evt: Sortable.SortableEvent) => {
        console.log('OnSpill event fired:', evt.item);
        const spilledId = evt.item.getAttribute('data-id');
        if (spilledId && setItems) {
            const updatedTunes = tunes.filter(tune => tune.draggableId !== spilledId);
            setItems(updatedTunes);
        }
    };

    const handleDrop = (to: Sortable, from: Sortable, dragEl: HTMLElement, event: Sortable.SortableEvent) => {
        if (id === 'target-list' && setItems) {
            console.log('OnDrop event fired:', dragEl);
            // Get the container data from the dragged element
            const container = dragEl.getAttribute('data-container');
            // Get all child elements of the dragged container
            const childElements = Array.from(dragEl.children);
            console.log('Children of dragged element:', childElements);
            if (container) {
                const data = JSON.parse(container);
                if ('subtune' in data || 'playlist' in data) {
                    // Extract and transform tunes
                    const extractedTunes = data.subtune?.tunes || data.playlist?.tunes;
                    const color = data.subtune?.color || data.playlist?.color;
                    
                    const transformedTunes = extractedTunes.map((tune: Ttune) => ({
                        ...tune,
                        draggableId: tune.draggableId || nanoid(),
                        selected: true,
                        color: color
                    }));
                    
                    // Log to verify all tunes have draggableIds
                    console.log('Transformed tunes:', transformedTunes.map((t: Ttune) => t.draggableId));
                    
                    // Update state with new tunes
                    setItems([...tunes, ...transformedTunes]);
                    return false; // Prevent default drop
                }
            }
        }
        return true; // Allow normal drops
    };

    return (
        <div className="flex w-full h-full max-w-full grow shrink justify-center shadow-lg rounded-2xl">
            <ReactSortable
                id={id}
                list={tunes}
                setList={handleSetList}
                animation={150}
                handle=".handle"
                filter=".scrubber"
                group={{
                    name: id === 'target-list' ? 'target' : 'source',
                    pull: id === 'target-list' ? true : 'clone',
                    put: otherProps.droppable
                }}
                sort={otherProps.sort}
                onStart={otherProps.onStart}
                onEnd={otherProps.onEnd}
                dragClass="sortable-drag"
                ghostClass="sortable-ghost"
                chosenClass="sortable-chosen"
                className="flex flex-col w-full h-full min-w-0 max-w-full gap-4 pt-6 pb-6 mb-8 px-4 content-center items-center rounded-xl overflow-y-scroll overflow-x-clip no-scrollbar"
            >
                {tunes.map((tune, index) => (
                    <div
                        key={`dContainer-${tune.draggableId || tune.id}-${index}`}
                        className="w-full max-h-28 relative"
                        data-tune-id={tune.id}
                    >
                        <DraggableTune
                            tune={tune}
                            draggableId={tune.draggableId || tune.id}
                            containerId={id}
                        />
                    </div>
                ))}
            </ReactSortable>
        </div>
    );
});

export default DndList;