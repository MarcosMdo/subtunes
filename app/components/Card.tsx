import React, {useState} from 'react'
import { tune } from '../subtuneTypes/Tune';
import { subtune } from '../subtuneTypes/Subtune';

import { Typography } from '@mui/material';

import { motion } from 'framer-motion';





export default function Card({subtune}:{subtune: subtune}) {

    return (
        <div className="flex w-[32vw] min-w-96 h-96 content-center justify-center bg-slate-100/25 rounded-3xl shadow-xl ring-1 ring-slate-200"
            style={{backgroundImage: `url(${subtune.image_url})`}}
        >
            <motion.div
                tabIndex={0}
                className=" flex w-full flex-col min-w-96 h-96 content-center justify-center border-2 border-solid text-white rounded-3xl bg-orange-500"
                initial={{backdropFilter: 'blur(12px)', backgroundColor: 'rgba(249, 115, 22, 0.5)', borderRadius: '1.5rem'}}
                whileHover={{backdropFilter: 'blur(0px)', backgroundColor: 'rgba(249, 115, 22, 0.3)', borderRadius: '1.5rem'}}
            >
                <motion.div layout
                    className="flex flex-col w-full content-center justify-center h-[150%] border-2 border-black border-solid"
                    initial={{y: '0px', alignItems: 'center'}}
                    whileHover={{y: '-120px', height: '500px', alignItems: 'center'}}
                    transition={{duration: 0.25}}
                >
                    <Typography id={'title'} variant='h3' className="self-center">{subtune.name}</Typography>
                    <hr className="self-center w-3/4" />
                    <Typography id={'desc'} variant='subtitle1' className="self-center">{subtune.description}</Typography>
                </motion.div>
            </motion.div>
        </div>
    )
}
