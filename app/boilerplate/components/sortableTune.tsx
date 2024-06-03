import React from 'react';
import { forwardRef } from 'react';

import { CSS } from '@dnd-kit/utilities';

import { Tune } from './Tune';
import { Ttune } from '../../subtuneTypes/Tune';

export const SortableTune = (props: { tuneObj: Ttune; index: number; onClick: (arg0: { tune: Ttune; }) => void; }) => {
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
