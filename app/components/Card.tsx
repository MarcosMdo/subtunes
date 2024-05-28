import React, { useState } from 'react'
import { Ttune } from '../subtuneTypes/Tune';
import { Tsubtune } from '../subtuneTypes/Subtune';

import { Typography } from '@mui/material';

import { AnimatePresence, motion, useAnimate } from 'framer-motion';
import Tune from './Tune';





export default function Card({ subtune }: { subtune: Tsubtune }) {
    const [scope, animate] = useAnimate()
    const [open, setOpen] = useState(false)

    const handleMouseEnter = () => {
        setOpen(true);
        // animate("#info", { y:  });
    }

    const handleMouseLeave = () => {
        setOpen(false);
        animate("#info", { y: 0 });
    }

    return (
        <div className="flex w-[32vw] min-w-96 h-96 content-center justify-center bg-slate-100/25 rounded-3xl shadow-xl ring-1 ring-slate-200"
            style={{ backgroundImage: `url(${subtune.image_url})` }}
        >
            <motion.div
                layoutRoot
                ref={scope}
                tabIndex={0}
                className="z-1 flex w-full flex-col min-w-96 h-96 content-center justify-center border-2 border-solid text-white rounded-3xl bg-orange-500"
                initial={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(249, 115, 22, 0.5)', borderRadius: '1.5rem' }}
                whileHover={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(249, 115, 22, 0.5)', borderRadius: '1.5rem' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    id="info"
                    className="flex flex-col w-full content-center justify-center h-fit"
                    initial="closed"
                    transition={{ duration: 0.25, type: "sprint", bounce: 0.25 }}
                >
                    <Typography id={'title'} variant='h3' className="self-center text-white mix-blend-screen">{subtune.name}</Typography>
                    <hr className="self-center w-3/4" />
                    <Typography id={'desc'} variant='subtitle1' className="self-center">{subtune.description}</Typography>
                </motion.div>
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, height: open ? '290px' : 0}}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col w-full h-full py-4 overflow-y-scroll no-scrollbar"
                    >
                        {
                            open && subtune.tunes.map((tune: Ttune) => (
                                <Tune key={tune.id} tune={tune} />
                            ))
                        }
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
