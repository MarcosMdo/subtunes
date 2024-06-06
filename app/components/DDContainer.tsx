import { memo, useState, useCallback, useEffect } from 'react';

import { AnimatePresence, motion } from "framer-motion";

import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';
import { IconButton } from '@mui/material';

import { Tplaylist } from '../subtuneTypes/Playlist';
import { Tsubtune } from '../subtuneTypes/Subtune';
import DndList from './DndList';

import { nanoid } from 'nanoid';

import { hexToRGB } from '../utils/helperFunctions';


function DDContainer({ item }: { item: Tplaylist | Tsubtune }) {
    const [toggle, setToggle] = useState(false);
    const [itemType, setItemType] = useState<string>('subtune');

    const handleToggle = useCallback((event: any) => {
        setToggle(!toggle);
    }, [toggle]);

    useEffect(() => {
        if ('subtunes' in item) {
            setItemType('playlist');
        } else {
            setItemType('subtune');
        }
    }, [item]);

    const calcDDListHeight = (tunes: any) => {
        if (tunes.length < 1) return 112
        return tunes.length * 112;
    }

    return (
        <>
            <div 
                key={`playlist-${item.name}`} 
                id={`playlist-${item.droppableId}`} 
                className={`flex shrink flex-col w-full rounded-xl mt-4 shadow-xl ring-2 ring-slate-200 hover:ring-slate-100 hove:shadow-2xl`}
                style={{ backgroundColor: item.color.length > 0 ? hexToRGB(item.color, 0.25) : 'slate' }}
            >

                <div className={`flex justify-start content-center items-center p-2 pr-2 `}>
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
                    {toggle &&
                        <motion.div
                            key={`motion-div.${item.name}.${nanoid(11)}`}
                            className="no-scrollbar" 
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                                open: { opacity: 1, height: calcDDListHeight(item.tunes) },
                                collapsed: { opacity: 0, height: 0 }
                            }}
                            transition={{ type: 'spring', duration: 0.85, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                            <AnimatePresence>
                                <DndList disableDroppable={true} key={`dnd-list-${item.droppableId}`} id={item.droppableId} tunes={item.tunes} mini={true} />
                            </AnimatePresence>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </>

    )
}

export default memo(DDContainer);
