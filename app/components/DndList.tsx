import { forwardRef, memo, useEffect, useState } from 'react';
import DraggableTune from './DraggableTune';
import { Ttune } from '../subtuneTypes/Tune';
import { motion } from 'framer-motion';
import { Droppable } from '@hello-pangea/dnd';
import TuneDragPreview from './TuneDragPreview';
import ReactDOM from 'react-dom';
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
                
                if (snapshot.isUsingPlaceholder && React.isValidElement(provided.placeholder)) {
                    const placeholderProps = (provided.placeholder as React.ReactElement).props;
                    console.log(placeholderProps);
                    placeholderProps.on.client.contentBox.center.y = 10000;
                    placeholderProps.on.client.contentBox.height = 0;
                    placeholderProps.on.client.contentBox.bottom = placeholderProps.on.client.contentBox.top;
                    
                    placeholderProps.on.client.borderBox.center.y = 10000;
                    placeholderProps.on.client.borderBox.height = 0;
                    placeholderProps.on.client.borderBox.bottom = placeholderProps.on.client.borderBox.top;
                    
                    placeholderProps.on.client.marginBox.center.y = 10000;
                    placeholderProps.on.client.marginBox.height = 0;
                    placeholderProps.on.client.marginBox.bottom = placeholderProps.on.client.marginBox.top;
                    
                    placeholderProps.on.client.paddingBox.center.y = 10000;
                    placeholderProps.on.client.paddingBox.height = 0;
                    placeholderProps.on.client.paddingBox.bottom = placeholderProps.on.client.paddingBox.top;

                    placeholderProps.on.client.padding.bottom = 0;
                    placeholderProps.on.client.padding.top = 0;
                }
                return (<div
                    // key={nanoid(11)}
                    ref={provided.innerRef}
                    className=" flex w-full h-full max-w-full justify-center shadow-lg rounded-2xl"
                >
                    <div
                        // key={nanoid(11)}
                        className=" flex flex-col w-full h-full min-w-[450px] max-w-full gap-4 pt-6 pb-6 mb-8 px-4 content-center items-center rounded-xl overflow-y-scroll overflow-x-clip no-scrollbar"
                    >
                        {tunes.map((tune: Ttune, index: number) => (
                        <>
                            <div key={`dContainer-${tune.draggableId}`} className="w-full max-h-28">
                                <div
                                    key={`dItem-${tune.draggableId}`}
                                    className=" w-full"
                                    onMouseDown={() => onDragStart(tune)}
                                    // style={{ display: 'inline-block' }}
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
                                    <div className="PREVIEW CONTAINER w-full max-h-28">
                                        <TuneDragPreview tune={tune} mini={mini}/>
                                    </div>
                                }
                                    
                            </div>
                        </>
                        ))}
                        <span className="PLACEHOLDER fixed h-0 hidden">{ provided.placeholder }</span>
                    </div>
                </div>)
        }}
        </Droppable>
    );
});

export default memo(DndList);