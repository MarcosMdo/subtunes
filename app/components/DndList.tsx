import { forwardRef, memo, useEffect, useState } from 'react';
import DraggableTune from './DraggableTune';
import { Ttune } from '../subtuneTypes/Tune';
import { motion } from 'framer-motion';
import { Droppable } from '@hello-pangea/dnd';
import TuneDragPreview from './TuneDragPreview';
import ReactDOM from 'react-dom';
import { nanoid } from 'nanoid';


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
            {(provided, snapshot) => (console.log("placeholder: ", provided.placeholder),
                <div
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
                            <div key={`dContainer-${tune.draggableId}`} className="w-full">
                                <div
                                    key={`dItem-${tune.draggableId}`}
                                    className=" w-full"
                                    onMouseDown={() => onDragStart(tune)}
                                    style={{ display: 'inline-block' }}
                                    >
                                    <DraggableTune
                                        key={`dTune.${tune.draggableId}`}
                                        tune={tune}
                                        index={index}
                                        mini={mini}
                                        styles={{ backgroundColor: color && color !== '0,0,0,0' ? `rgba(${color})` : 'rgba(226, 232, 240, 0.25)' }}
                                    />
                                </div>
                                {snapshot.isUsingPlaceholder && draggingItem?.draggableId === tune.draggableId && <TuneDragPreview tune={tune} mini={mini}/>}
                            </div>
                        </>
                        ))}
                        { provided.placeholder }
                    </div>
                </div>
            )}
        </Droppable>
    );
});

export default memo(DndList);


// import { forwardRef, memo, useState } from 'react';

// import DraggableTune from './DraggableTune';
// import { Ttune } from '../subtuneTypes/Tune';

// import { motion, useScroll } from 'framer-motion';
// import { Droppable } from '@hello-pangea/dnd';
// import Tune from './Tune';
// import TuneDragPreview from './TuneDragPreview';
// import { render } from 'react-dom';
// import ReactDOM from 'react-dom';

// import { hexToRGB } from '../utils/helperFunctions';


// const DndList = forwardRef(function DndList(props: {id: any; tunes: Ttune[]; mini?: boolean; disableDroppable?: boolean; color?: string}, ref) {
//     const { id, tunes, mini, disableDroppable, color } = props;

//     const [draggingItem, setDraggingItem] = useState<Ttune | null>(null);
    
//     const renderItem = (provided: any, snapshot: any, tune: Ttune, index: number) => (
//         <DraggableTune
//             key={`${tune.draggableId}`}
//             tune={tune}
//             index={index}
//             isDropDisabled={disableDroppable}
//             mini={mini}
//             styles={{backgroundColor: color && color !== '0,0,0,0' ? `rgba(${color})`: 'rgba(226, 232, 240, 0.25)'}}
//         />
//     );

//     const getStyle = (style: any, snapshot: any) => {
//         if (!snapshot.isDropAnimating) {
//             return style;
//         }
//         const { moveTo, curve, duration, scale } = snapshot.dropAnimation;
//         const translate = `translate(${moveTo.x + 20}px, ${moveTo.y + 50}px)`;
//         return {
//             ...style,
//             transform: `${translate}`,
//             transition: `all ${curve} ${duration + 0.05}s`,
//         };
//     };

//     const getRenderItem = (items: any) => (provided: any, snapshot: any, rubric: any) => {
//         const item = items[rubric.source.index];
//         return (
//             <>
//                 <div
//                     {...provided.draggableProps}
//                     {...provided.dragHandleProps}
//                     ref={provided.innerRef}
//                     style={getStyle(provided.draggableProps.style, snapshot)}
//                 >
//                     <TuneDragPreview tune={item} />
//                 </div>
//             </>
//         )
//     };
//     const renderDropItem = getRenderItem(tunes);

//     const onDragStart = (initial: any) => {
//         setDraggingItem(initial);
//     };

//     const onDragEnd = () => {
//         setDraggingItem(null);
//     };

//     return (
//         <Droppable
//             droppableId={id}
//             isDropDisabled={disableDroppable}
//             ignoreContainerClipping={true}
//         >
//             {(provided, snapshot) => (
//                 <div
//                     ref={provided.innerRef}
//                     className="relative flex w-full h-full max-w-full justify-center shadow-lg rounded-2xl"
//                 >
//                     <motion.div
//                         className="absolute flex flex-col w-full h-full min-w-[450px] max-w-full gap-4 pt-6 pb-6 mb-8 px-4 content-center items-center rounded-xl overflow-y-auto overflow-x-clip no-scrollbar"
//                     >
//                         {tunes.map((tune: Ttune, index: number) => (
//                             <div key={tune.draggableId} className="w-full">
//                                 <div
//                                     className="relative w-full"
//                                     onMouseDown={() => onDragStart(tune)}
//                                     style={{ display: 'inline-block'}}
//                                 >
//                                     {renderItem(provided, snapshot, tune, index)}
//                                 </div>
//                                 {draggingItem && draggingItem.draggableId === tune.draggableId && (
//                                     <>
//                                     <p>clone</p>
//                                     <CloneDraggedItem tune={tune} />
//                                     </>
//                                 )}
//                             </div>
//                         ))}
//                         {provided.placeholder}
//                     </motion.div>
//                 </div>
//             )}
//         </Droppable>
//     );
// });

// const CloneDraggedItem = ({ tune }: {tune: Ttune}) => {
//     const portalContainer = document.getElementById('portal-root');
//     if (!portalContainer) return null;
//     return ReactDOM.createPortal(
//         <div className="w-full" style={{ position: 'fixed', pointerEvents: 'none' }}>
//             <TuneDragPreview tune={tune} />
//         </div>,
//         portalContainer
//     );
// };

// export default memo(DndList);

// function getStyle(style: any, snapshot: any) {
//     // console.log("styles: ", style, "snapshot: ", snapshot)
//     if (!snapshot.isDropAnimating) {
//         return style;
//     }
//     const { moveTo, curve, duration, scale } = snapshot.dropAnimation;
//     // move to the right spot
//     const translate = `translate(${moveTo.x+20}px, ${moveTo.y+20}px)`;
//     // const scaleTransform = `scale(1.125)`;
//     // console.log("translate: ", translate, "scale: ", scaleTransform);
//     // patching the existing style
//     return {
//         ...style,
//         transform: `${translate} `,//${scaleTransform}
//         // slowing down the drop because we can
//         transition: `all ${curve} ${duration + .05}s`,
//     };
// }

// const getRenderItem = (items: any) => (provided: any, snapshot: any, rubric: any) => {
//     const item = items[rubric.source.index];
//     return (
//         <>
//             <div
//                 {...provided.draggableProps}
//                 {...provided.dragHandleProps}
//                 ref={provided.innerRef}
//                 style={getStyle(provided.draggableProps.style, snapshot)}
//             >
//                 <TuneDragPreview tune={item} />
//             </div>
//         </>
//     )
// };



// const DndList = forwardRef(function DndList(props: any, ref) {
//     const { id, tunes, mini, disableDroppable } = props;
//     const renderItem = getRenderItem(tunes);

//     return (
//         <Droppable
//             droppableId={`${id}`}
//             // mode='virtual'
//             isDropDisabled={disableDroppable}
//             renderClone={renderItem}
//         >
//             {/* console.log("snapshot: ", snapshot, "provided: ", provided), */}
//             {(provided, snapshot) => (
//                 <div ref={provided.innerRef} className="relative flex w-full h-full max-w-full justify-center border-2 border-green-400">
//                     <motion.div
//                         className="absolute flex flex-col w-full h-full min-w-[450px] max-w-full gap-4 pt-6 pb-12 mb-8 px-4 content-center items-center rounded-xl overflow-y-auto overflow-x-clip no-scrollbar"
//                     >
//                         {tunes.map((tune: Ttune, index: number) => (
//                             <DraggableTune key={tune.draggableId} tune={tune} index={index} isDropDisabled={disableDroppable} mini={mini} />
//                         ))}
//                         {provided.placeholder}
//                     {/* {!snapshot.isDraggingOver && <></> } */}
//                     </motion.div>
//                 </div>
//             )}
//         </Droppable>
//     );
// });

// export default memo(DndList);




// const getItem  = (tunes: Ttune[], draggableId: string) => {
//     if(draggableId !== undefined){
//         const item = tunes.find((tune: Ttune) => tune.draggableId === draggableId);
//         console.log("dragging item: ", item);
//         return item
//     }
// }