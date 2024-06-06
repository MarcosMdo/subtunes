import { Draggable } from '@hello-pangea/dnd'
import React from 'react'

export default function DraggableContainer({children, id, index, disableDrag}:{children: React.ReactNode, id: string; index: number; disableDrag?: boolean;}) {
    return (
        <Draggable
            key={`draggable-key-${id}`}
            draggableId={`${id}`}
            index={index}
            isDragDisabled={disableDrag}
        >
            {(provided, snapshot) => {
                return (
                    <div
                        ref={provided.innerRef}
                        key={`draggable-${id}`}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex w-full`}
                        // style={{
                        //     ...provided.draggableProps.style,
                        //     height: '96px',
                        // }}
                    >
                        {children}
                    </div>
                )
            }}
        </Draggable>
    )
}
