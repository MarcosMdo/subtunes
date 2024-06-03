import React, { useState } from 'react'
import { Ttune } from '../subtuneTypes/Tune';
import { Tsubtune } from '../subtuneTypes/Subtune';

import { Typography } from '@mui/material';

import { AnimatePresence, motion } from 'framer-motion';
import Tune from './Tune';
import TuneContainer from './TuneContainer';
import { Tplaylist } from '../subtuneTypes/Playlist';

export default function Card({ playlist, xl }: { playlist: Tsubtune | Tplaylist, xl?: boolean}) {
    const [open, setOpen] = useState(false)

    const handleMouseEnter = () => {
        setOpen(true);
    }

    const handleMouseLeave = () => {
        setOpen(false);
    }

    return (
        <div className={`flex w-[32vw] min-w-96 ${xl ? "h-[80vh]":"h-[40vh]"} mx-2 my-2 content-center justify-center bg-slate-100/25 rounded-3xl shadow-xl ring-1 ring-slate-200`}
            style={{ 
                backgroundImage: `url(${playlist.image_url})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <motion.div
                layoutRoot
                tabIndex={0}
                className="z-1 flex w-full flex-col min-w-96 h-full px-4  content-center justify-center border-2 border-solid text-white rounded-3xl bg-orange-500"
                // TODO: use subtune/playlist color
                initial={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(249, 115, 22, 0.5)', borderRadius: '1.5rem' }}
                whileHover={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(249, 115, 22, 0.5)', borderRadius: '1.5rem' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    id="info"
                    className="flex flex-col w-full content-center mt-2 justify-center h-fit"
                    initial="closed"
                    transition={{ duration: 0.25, type: "sprint", bounce: 0.25 }}
                >
                    <Typography id={'title'} variant='h3' className="self-center text-white mix-blend-screen">{playlist.name}</Typography>
                    <hr className="self-center w-3/4" />
                    <Typography id={'desc'} variant='subtitle1' className="self-center">{playlist.description}</Typography>
                </motion.div>
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, height: open ? '100%' : 0}}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.75, type: "spring" }}
                        className="flex flex-col w-full h-full mb-4 mt-2 pt-1 px-2  mr-4 gap-4 rounded-2xl overflow-y-scroll no-scrollbar"
                    >
                        {
                            open && playlist.tunes.map((tune: Ttune, index: number) => (
                                // TODO: use subtune color
                                <TuneContainer key={index}>
                                    <Tune key={tune.id} tune={tune} />
                                </TuneContainer>
                            ))
                        }
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
