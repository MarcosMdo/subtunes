'use-client'

import react from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import { Box, Card } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { sizing } from '@mui/system';


import  Tune  from './Tune';
import { tune } from '../subtuneTypes/Tune';

import { motion } from 'framer-motion';

export default function SortableTune({ tune, id, mini }: { tune: tune; id: string; mini?: boolean;}) {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} id={id} style={style}
            className={`
                flex flex-row 
                grow shrink 
                min-w-full max-w-full 
                px-2
                ${mini ? 'h-20 py-2': 'h-28 py-16'}
                max-h-28
                content-center items-center 
                rounded-xl shadow-xl
                bg-slate-100/30 border-1 border-solid border-slate-200 
                ring-1 ring-slate-200 
                hover:ring-slate-300 hover:border-slate-300
                hover:shadow-2xl
            `}
        >
                <MenuRoundedIcon sx={{color: "black"}} fontSize='large' {...attributes} {...listeners}
                    className="focus:outline-none"
                />
                <Tune tune={tune} mini={mini} />
                
        </div>
    )
}
