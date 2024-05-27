'use-client';
import React, { memo } from 'react';
import Tune from './Tune';
import { Ttune } from '../subtuneTypes/Tune';
import { Draggable } from '@hello-pangea/dnd';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { nanoid } from 'nanoid';

// not used right now but hopefully we can use something similar to animate clone animations
function getStyle(style: any, snapshot: any) {
    if (!snapshot.isDropAnimating) {
        return style;
    }

    const { moveTo, curve, duration } = snapshot.dropAnimation;
    const translate = snapshot.draggingOver !== 'trash' ? `translate(${moveTo.x + 50}px, ${moveTo.y + 50}px)` : `translate(${moveTo.x + (Math.random() * window.innerWidth)}px, ${moveTo.y}px)`;
    const rotate = 'rotate(2.5turn)';

    const transition = `all ${curve} ${duration}s`;// Otherwise use the default transition

    return {
        ...style,
        transform: `${translate} ${snapshot.draggingOver === 'trash' ? rotate : ''}`,
        opacity: snapshot.draggingOver === 'trash' ? 0 : 1,
        transition: transition,
    };
}


function DraggableTune({ tune, index, mini, styles }: { tune: Ttune; index: number, mini?: boolean; styles?: any }) {

    return (
        <Draggable
            key={`draggable-key-${tune.draggableId}`}
            draggableId={`${tune.draggableId}` ?? `${tune.id}.${nanoid(11)}`}
            index={index}
        >
            {(provided, snapshot) => {
                return (
                <>
                    <div
                        ref={provided.innerRef}
                        key={`draggable-${tune.draggableId}`}
                        {...provided.draggableProps}
                        className={` flex flex-row grow shrink min-w-fit max-w-full w-full px-2 ${mini ? 'h-20 py-2' : 'h-24 pt-6 pb-2'} max-h-26 content-center items-center rounded-xl shadow-xl border-1 border-solid border-slate-200 ring-1 ring-slate-200  hover:ring-slate-300 hover:border-slate-300 hover:shadow-2xl`}
                        style={{
                            ...provided.draggableProps.style,
                            ...styles,
                            height: mini ? '80px' : '96px',
                            ...getStyle(provided.draggableProps.style, snapshot),
                        }}
                    >
                        <div
                            {...provided.dragHandleProps}
                            className={`${mini ? '' : 'mb-5'}`}
                        >
                            <MenuRoundedIcon
                                sx={{ color: "black" }}
                                fontSize='large'
                                className=" focus:outline-none"
                            />
                        </div>
                        <Tune key={`tune-key-${tune.draggableId}.${tune.id}`} tune={tune} mini={mini} />
                    </div>
                </>
                )
            }}
        </Draggable>
    );
}

export default memo(DraggableTune);



