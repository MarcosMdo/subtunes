import { useState } from 'react';

import { AnimatePresence, motion } from "framer-motion";

import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';
import { Icon, IconButton } from '@mui/material';

import { playlist } from '../subtuneTypes/Playlist';
import { subtune } from '../subtuneTypes/Subtune';
import { DndList } from './DndList';

import { nanoid } from 'nanoid';


export default function DDContainer({ item }: { item: playlist | subtune }) {
    const [toggle, setToggle] = useState(false);

    const handleToggle = () => {
        setToggle(!toggle);
    }
    if('subtune' in item){
        item = item.subtune as subtune;
    }
    else if('playlist' in item){
        item = item.playlist as playlist;
    }

    return (
        <div key={`playlist-${item.name}`} className='flex grow flex-col basis-3/4 rounded-xl my-4 shadow-xl bg-slate-100/25'>
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
                <p>
                    {item.name}
                </p>
            </div>
            <AnimatePresence>
                { toggle ?
                    <motion.div
                        className="overflow-y-scroll overflow-x-hidden no-scrollbar pt-2"
                        key={item.name}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: 400 },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ type: 'spring' , duration: 0.65, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <DndList key={`${nanoid(11)}-${item.name}`} tunes={item.tunes} mini={true} />
                    </motion.div> : null
                }
            </AnimatePresence>

        </div>
    )
}