import React from 'react';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { SortableTune } from './SortableTune';
import { tune } from '../../subtuneTypes/Tune';

import { Stack, Box } from '@mui/material';

const containerStyle = {
    display: "flex",
    flexWrap: "wrap",
    padding: 5,
    margin: 5,
    overflowY: "auto",
    width: "100%",

};

export function TuneList(props: any) {
    const { id, tunes } = props;
    const { isOver, setNodeRef } = useDroppable({
        id,
    });


    return (
        <SortableContext 
            items={tunes} 
            id={id} 
            strategy={verticalListSortingStrategy} 
        >
            <Box ref={setNodeRef} sx={containerStyle}>
                {tunes.map((tune: { id: any; name: string; artist: string; external: string; }, index: number) => (
                    <SortableTune key={tune.id} tune={tune} id={tune.id} />
                ))}
            </Box>
        </SortableContext>
    );
}
export default TuneList;