'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { Ttune } from "../subtuneTypes/Tune"
import { Tplaylist } from "../subtuneTypes/Playlist"
import { Tsubtune } from "../subtuneTypes/Subtune"
import DndList from "../components/DndList"
import DraggableTune from "../components/DraggableTune"
import SidePanel from "../components/SidePanel"
import SubtuneForm from "../components/SubtuneForm"
import { CurrentPreviewProvider } from "../contexts/audioPreviewContext"

import { motion, useAnimate, useMotionTemplate, useMotionValue, animate } from "framer-motion";

import { nanoid } from 'nanoid';
import TabbedSidePanel from '../components/TabbedSidePanel';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { setDraggableId, setDraggableIds, hexToRGB, rgbaToHex } from '../utils/helperFunctions';
import invariant from 'tiny-invariant';
import { breadcrumbsClasses } from '@mui/material';

const renderClone = (provided: any, snapshot: any, rubric: any) => (
    <div
        ref={provided.innerRef}
        style={{
            width: 0,
            height: 0,
        }}
    />
);

export default function CreateSubtune() {
    const [scope, animatePanels] = useAnimate();
    const [leftPanelState, setLeftPanelState] = useState<boolean>(true);
    const [rightPanelState, setRightPanelState] = useState<boolean>(true);
    const [subtuneColor, setSubtuneColor] = useState<number[]>([0, 0, 0, 0]);
    const [subtuneBackgroundImage, setSubtuneBackgroundImage] = useState<string>("");
    
    // the three containers' states
    const [tunes, setTunes] = useState<Ttune[]>([])
    const [subtune, setSubtune] = useState<Ttune[]>([]);
    const [library, setLibrary] = useState<Tsubtune[] | Tplaylist[]>([]);

    const tuneRef = useRef<Ttune | undefined>(undefined);
    const AURACOLORS = [rgbaToHex(subtuneColor), "#000000"];
    const auraColor = useMotionValue(AURACOLORS[0]);
    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, transparent 75%, ${auraColor})`

    useEffect(()=> {
        animate(auraColor, AURACOLORS, {
            ease: 'easeInOut',
            duration: 5,
            repeat: Infinity,
            repeatType: 'mirror'
        })
    })

    const updateSubtunePanelBg = (color: number[]) => {
        console.log("Subtune color received: ", color);
        setSubtuneColor(color);
    }

    const updateBackground = (imageurl: string) => {
        console.log("Background image received: ", imageurl);
        setSubtuneBackgroundImage(imageurl);
    }

    const hideShowPanels = () => {
        if (leftPanelState && rightPanelState) {
            setLeftPanelState(false);
            setRightPanelState(false);
        }
        if (!leftPanelState && !rightPanelState) {
            setLeftPanelState(true);
            setRightPanelState(true);
        }
        if (leftPanelState && !rightPanelState) {
            setLeftPanelState(false);
        }
        if (!leftPanelState && rightPanelState) {
            setRightPanelState(false);
        }
    }

    useEffect(() => {
        if (!leftPanelState) {
            animatePanels("#tunes-panel", { x: "-75%", width: '100%' }, { type: 'spring', bounce: 0.35 });
        }
        if (!rightPanelState) {
            animatePanels("#right-panel", { x: "75%", width: '100%' }, { type: 'spring', bounce: 0.35 });
        }
        if (leftPanelState && rightPanelState) {
            animatePanels("#playlist", { x: 0, width: '100%' }, { type: 'spring', bounce: 0.35 });
            animatePanels("#tunes-panel", { x: "0%", width: '100%' }, { type: 'spring', bounce: 0.35 });
            animatePanels("#right-panel", { x: "0%", width: '100%' }, { type: 'spring', bounce: 0.35 });
        }
        if (!leftPanelState && !rightPanelState) {
            animatePanels("#playlist", { x: 0, width: '250%' }, { type: 'spring', bounce: 0.35 });
        }
        if (leftPanelState && !rightPanelState) {
            animatePanels("#tunes-panel", { x: "0%", width: '350%' }, { type: 'spring', bounce: 0.35 });
            animatePanels("#playlist", { x: 80, width: '350%' }, { type: 'spring', bounce: 0.35 });
        }
        if (!leftPanelState && rightPanelState) {
            animatePanels("#right-panel", { x: "0%", width: '350%' }, { type: 'spring', bounce: 0.35 });
            animatePanels("#playlist", { x: -80, width: '350%' }, { type: 'spring', bounce: 0.35 });
        }
    }, [leftPanelState, rightPanelState])

    const onDragStart = (result: any) => {
        const { source, draggableId } = result;
        console.log("tunes length", tunes.length)
        if (source.droppableId !== "droppable-subtune" && source.droppableId !== "droppable-tunes-panel") {
            const playlist = library.find(item => {
                return item.droppableId === source.droppableId
            });

            if (playlist === undefined) {
                console.error("playlist not found")
                return;
            }
            tuneRef.current = playlist.tunes.find(tune => tune.draggableId === result.draggableId);
        }
    }

    const onDragUpdate = (result: any) => {
        console.log(result);
    };

    const onDragEnd = useCallback((result: any) => {
        // console.log("on end result: ", result);
        if (!result.destination) return;

        // trash
        if (result.destination.droppableId !== "droppable-subtune") {
            if (result.source.droppableId === "droppable-subtune") {
                console.log('removing');
                const new_subtune = subtune.filter(tune => tune.draggableId !== result.draggableId);
                setSubtune(new_subtune);
            }
            return;
        }

        // add tune from tunes panel
        if (result.source.droppableId === "droppable-tunes-panel") {
            const tune = tunes.find(tune => {
                return tune.draggableId === result.draggableId;
            });
            if (tune) {
                let new_tune = { ...tune };
                new_tune = setDraggableId(new_tune);
                setSubtune([...subtune, new_tune]);
                console.log("tune added to subtune: ", new_tune)
            }
        }
        // add tune from any playlist/subtune in library
        if (result.source.droppableId !== "droppable-tunes-panel" && result.source.droppableId !== "droppable-subtune") {
            if (result.destination.droppableId === "droppable-subtune") {
                const tune = tuneRef.current;
                tuneRef.current = undefined;
                if (tune) {
                    let new_tune = { ...tune };
                    new_tune = setDraggableId(new_tune);
                    setSubtune([...subtune, new_tune]);
                }
            }
        }

        // reorder subtune tunes
        if (result.source.droppableId === "droppable-subtune" && result.destination.droppableId === "droppable-subtune") {
            const destinationIndex = result.destination.index;
            const sourceTune = subtune.find(tune => tune.draggableId === result.draggableId);
            if (sourceTune) {
                const newSubtune = [...subtune];
                newSubtune.splice(result.source.index, 1);
                newSubtune.splice(destinationIndex, 0, sourceTune);
                setSubtune(newSubtune);
            }
        }

    }, [subtune, tunes, setSubtune]);

    const handleTabbedResults = (data: Tsubtune[] | Tplaylist[], dataType: 'subtune' | 'playlist', clear?: boolean) => {
        const tabData = data;
        if (dataType === 'subtune') {
            setLibrary(tabData as Tsubtune[]);
        }
    }

    const handleTunesResults = async (data: Ttune[] | Tsubtune[] | Tplaylist[], dataType: 'tune' | 'subtune' | 'playlist', clear?: boolean) => {
        const tabData = data;
        // console.log("tunes results: ", tabData);
        setTunes(tabData as Ttune[]);
    }

    return (
        <CurrentPreviewProvider>
            <div className="flex flex-col w-full h-full overflow-y-clip no-scrollbar"
                style={{
                    backgroundImage: `url(${subtuneBackgroundImage !== "" ? subtuneBackgroundImage : "https://raw.githubusercontent.com/MarcosMdo/subtunes/9b6594c460204437b9c2b3d517238da5fb38e1b5/public/background.png"})`,
                    backgroundSize: `cover`,
                    backgroundPosition: `center`,
                    backgroundRepeat: `no-repeat`,
                }}
            >
                <motion.div
                    layoutRoot
                    className="flex flex-col w-full h-full"
                    style={{backgroundImage,}}
                >
                    <div className="flex flex-col w-full h-full backdrop-blur-md" >
                        <DragDropContext 
                            onDragStart={onDragStart} 
                            onDragEnd={onDragEnd}
                        >
                            <Droppable
                                droppableId='trash'
                                mode="virtual"
                                renderClone={renderClone}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        key={nanoid(11)}
                                        ref={provided.innerRef}
                                    >
                                        <SubtuneForm key={`subtuneForm`} onColorChange={updateSubtunePanelBg} onImageChange={updateBackground} subtuneTunes={subtune} />
                                    </div>
                                )}
                            </Droppable>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, when: "beforeChildren" }}
                                className=" flex flex-row ">
                                <div
                                    ref={scope}
                                    className="motion flex flex-row grow shrink w-full overflow-x-clip"
                                >
                                    <SidePanel
                                        id="tunes-panel"
                                        side='left'
                                        searchTarget="tune"
                                        items={tunes}
                                        toggle={leftPanelState}
                                        toggleListener={() => { setLeftPanelState(!leftPanelState) }}
                                        onResults={handleTunesResults}
                                    />
                                    <div
                                        id='playlist'
                                        className="flex flex-col justify-center content-center p-4 my-8 ring-1 ring-slate-100 rounded-2xl shadow-2xl w-full overflow-y-auto no-scrollbar hover:ring-2 hover:ring-slate-200/50"
                                        // style={{ backgroundColor: `rgba(${subtuneColor.join(',')})` }}
                                        onDoubleClick={hideShowPanels}
                                    >
                                        <DndList color={subtuneColor.toString()} disableDroppable={false} id='droppable-subtune' tunes={subtune} mini={false} />
                                    </div>
                                    <TabbedSidePanel
                                        side='right'
                                        id={'right-panel'}
                                        items={library}
                                        toggle={rightPanelState}
                                        toggleListener={() => { setRightPanelState(!rightPanelState) }}
                                        onResults={handleTabbedResults}
                                    />
                                </div>
                            </motion.div>
                        </DragDropContext>
                    </div>
                </motion.div>
            </div>
        </CurrentPreviewProvider>
    )

}