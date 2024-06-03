import { forwardRef, memo, useEffect, useState } from 'react';
import DraggableTune from './DraggableTune';
import { Ttune } from '../subtuneTypes/Tune';
import { Droppable } from '@hello-pangea/dnd';
import TuneDragPreview from './TuneDragPreview';
import { nanoid } from 'nanoid';
import React from 'react';


const DndList = forwardRef(function DndList(props: { id: any; tunes: Ttune[]; mini?: boolean; disableDroppable?: boolean; color?: string }, ref) {
    const { id, tunes, mini, disableDroppable, color } = props;
    const [draggingItem, setDraggingItem] = useState<Ttune | null>(null);

    const onDragStart = (tune: Ttune | null) => {
        if(tune !== undefined){
            setDraggingItem(tune);
        }
    };

    const onDragEnd = (content: any) => {
        console.log("should remove preview")
        setDraggingItem(content);
    };

    useEffect(() => {
        setDraggingItem(draggingItem);
    },[draggingItem]);

    const getRenderItem = (items: any) => (provided: any, snapshot: any, rubric: any) => (
        <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
        >
            <TuneDragPreview key={`preview-draggable-${nanoid(11)}`} tune={items[rubric.source.index]}/>
        </div>
    );
    const renderItem = getRenderItem(tunes);

    return (
        <Droppable
            key={`${id}`}
            droppableId={id}
            isDropDisabled={disableDroppable}
            ignoreContainerClipping={true}
            renderClone={renderItem}
        >
            {(provided, snapshot) => {
                return (<div
                    ref={provided.innerRef}
                    className=" flex w-full h-full max-w-full justify-center shadow-lg rounded-2xl"
                >
                    <div
                        className=" flex flex-col w-full h-full min-w-[450px] max-w-full gap-4 pt-6 pb-6 mb-8 px-4 content-center items-center rounded-xl overflow-y-scroll overflow-x-clip no-scrollbar"
                    >
                        {tunes.map((tune: Ttune, index: number) => (
                        <>
                            <div key={`dContainer-${tune.draggableId}`} className="w-full max-h-28">
                                <div
                                    key={`dItem-${tune.draggableId}`}
                                    className=" w-full"
                                    onMouseDown={() => onDragStart(tune)}
                                    >
                                    <DraggableTune
                                        key={`dTune.${tune.draggableId}`}
                                        tune={tune}
                                        index={index}
                                        mini={mini}
                                        styles={{ backgroundColor: color && color !== '0,0,0,0' ? `rgba(${color})` : 'rgba(226, 232, 240, 0.25)' }}
                                    />
                                </div>
                                {    
                                    snapshot.isUsingPlaceholder && 
                                    draggingItem?.draggableId === tune.draggableId &&
                                    id !== 'droppable-subtune' &&
                                    <div className="w-full max-h-28">
                                        <TuneDragPreview tune={tune} mini={mini}/>
                                    </div>
                                }
                                    
                            </div>
                        </>
                        ))}
                        <span className="fixed h-0 hidden">{ provided.placeholder }</span>
                    </div>
                </div>)
        }}
        </Droppable>
    );
});

export default memo(DndList);