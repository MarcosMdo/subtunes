import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from "framer-motion";

import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';
import { Icon, IconButton } from '@mui/material';

import { playlist } from '../subtuneTypes/Playlist';
import { subtune } from '../subtuneTypes/Subtune';
import { tune } from '../subtuneTypes/Tune';
import { DndList } from './DndList';

import { nanoid } from 'nanoid';

import { useDroppable } from "@dnd-kit/core";


export default function DDContainer({ item, id }: { item: playlist | subtune, id: string }) {
    const [toggle, setToggle] = useState(false);
    const [contents, setContents] = useState<any>([]);
    const { isOver, setNodeRef } = useDroppable({
        id,
    });


    const handleToggle = (e: any) => {
        setToggle(!toggle);
    }
    if('subtunes' in item){
        item = item as playlist;
    }else{
        item = item as subtune;
    }
    // useEffect(() => {
    //     setContents(item);
    // },[])

    return (
    <div className="flex flex-col w-full my-2 rounded-2xl shadow-md border-2 border-pink-700" >
        <div key={`playlist-${item.name}`} className={`flex grow flex-col max-h-24 bg-slate-100/25 border-2 border-green-500`}>
            <div className='flex grow justify-start content-center items-center p-2 pr-2'>
                <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: toggle ? 90 : 0 }}
                    transition={{ 
                        type: 'spring',
                        bounce: 0.65,
                        duration: 0.25,
                    }}
                    className="mr-4"
                >
                    <IconButton onClick={handleToggle} disableFocusRipple={false}>
                        <DoubleArrowRoundedIcon />
                    </IconButton>
                </motion.div>
                <p className="text-3xl font-extralight">
                    {item.name}
                    {/* {contents.tunes?.length} */}
                </p>
            </div>
        </div>
        <AnimatePresence>
            { toggle &&
                <motion.div
                    className="overflow-y-scroll overflow-x-hidden no-scrollbar pt-2"
                    key={item.name}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                        open: { 
                            opacity: 1,
                            scale:1,
                            height: 400,
                            transition:{
                                type: 'spring',
                                bounce: 0.35,
                                duration: .75,
                                staggerChildren: 0.1
                            }
                        },
                        collapsed: { 
                            opacity: 0.8, 
                            scale: 0.75,
                            height: 0,
                            transition:{
                                type: 'spring',
                                bounce: 0.35,
                                // duration: .75,
                                staggerChildren: 0.1,
                            }
                        }
                    }}
                    // transition={{ type: 'spring' , duration: 0.15, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                    <DndList key={`${nanoid(11)}.${item.name}`} tunes={item.tunes} mini={true} />
                </motion.div> 
            }
        </AnimatePresence>
    </div>
    )
}