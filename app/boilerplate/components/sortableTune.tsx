import React from 'react';
import { forwardRef } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Tune } from './Tune';
import { tune } from '../../subtuneTypes/Tune';

export const SortableTune = (props: { tuneObj: tune; index: number; onClick: (arg0: { tune: tune; }) => void; }) => {
    const sortable = useSortable({ id: props.tuneObj.id });
    const { attributes, listeners, setNodeRef, transform, transition } = sortable;
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    
    return (
        <Tune ref={setNodeRef} index={props.index} tuneObj={props.tuneObj} onClick={props.onClick} style={style} {...attributes} {...listeners}/>
    );
}
