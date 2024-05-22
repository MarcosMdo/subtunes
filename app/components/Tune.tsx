'use client'

import react, { useRef, useEffect, CSSProperties } from 'react';
import { Ttune } from '../subtuneTypes/Tune';
import { useCurrentPreview } from '../contexts/audioPreviewContext';

import { IconButton, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayDisabledRoundedIcon from '@mui/icons-material/PlayDisabledRounded';
import Slider from '@mui/material/Slider';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';

import { motion } from 'framer-motion';

export default function Tune({ tune, style, mini }: { tune: Ttune; style?: CSSProperties; mini?: boolean;}) {
    const [isPlaying, setIsPlaying] = react.useState(false);
    const [position, setPosition] = react.useState(0);
    const { currentPlayingTune, playTune, pauseTune, currentTime, setTime, setTune, duration } = useCurrentPreview();
    mini = mini || false;

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseTune();
        }else if(!isPlaying && currentPlayingTune?.id === tune.id){
            playTune()
        } 
        else if (currentPlayingTune?.id !== tune.id){
            setTune(tune);
        }
        setIsPlaying(!isPlaying);
    }

    //allows to change the current time of tune to where slider is
    const handleSliderChange = (_: Event, value: number | number[]) => {
        const newPosition = Array.isArray(value) ? value[0] : value;
        if (currentPlayingTune?.id === tune.id && currentPlayingTune?.draggableId === tune.draggableId) {
            setTime(newPosition);
        }
    };

    useEffect(() => {
        if (currentPlayingTune?.id === tune.id && currentPlayingTune?.draggableId === tune.draggableId) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
        return () => {
            setTune(null);
        }

    }, []);

    useEffect(() => {
        if(currentPlayingTune?.id === tune.id && currentPlayingTune?.draggableId === tune.draggableId){
            setPosition(currentTime);
            if(currentTime === duration){
                setIsPlaying(false);
                setPosition(0);
            }
        }
        else{
            setPosition(0);
        }
        
    }, [currentTime]);

    return (
        <div  className="tune flex flex-row grow shrink min-w-fit max-w-full w-full min-h-[80px] h-full mr-4 pr-2">
            <div  className="album-cover flex pl-2 items-center justify-center content-center">
                { tune.image_url !== null ?
                        <img src={tune.image_url} alt={tune.name} className={`object-scale-down flex shrink  ${mini ? 'w-12' : 'w-24 mb-4'}  shadow-lg shadow-slate-400 rounded`} /> :
                        <IconButton size='large' sx={{color: "black"}}>
                            <ImageNotSupportedRoundedIcon fontSize='large' />
                        </IconButton>    
                }
            </div>
            <div  className="flex flex-col grow shrink w-full pl-2 justify-center">
                <div  className="flex flex-col shrink w-fit justify-start">
                    <h2 className="line-clamp-1 max-w-full h-full leading-5 text-center text-xl ml-2 pr-4"  >
                        {tune.name}
                    </h2>
                    <p  className="line-clamp-1 h-full text-gray-600 ml-2">
                        {tune.artist}
                    </p>
                </div>
                { mini ? null :
                <div className="play-pause pt-1 grow shrink flex flex-row w-full content-center py-2 my-0 pr-2 justify-end">
                    <div className="flex content-end">
                        <IconButton 
                            edge="start"
                            size="small" 
                            onClick={handlePlayPause}
                            sx={{color: "black"}}
                        >
                            {tune.external === null ?
                                <PlayDisabledRoundedIcon /> :
                                isPlaying ?
                                    <PauseRoundedIcon /> :
                                <PlayArrowRoundedIcon />}
                        </IconButton>
                    </div>
                    <div className="slider flex grow shrink max-w-full pl-2 mr-3 items-center">
                        <Slider
                            size="small"
                            defaultValue={0}
                            aria-label="Small"
                            valueLabelDisplay="off"
                            value={position}
                            min={0}
                            step={1}
                            max={30}
                            onChange={handleSliderChange}
                            sx={{
                                color: 'rgba(0,0,0,0.87)',
                                height: 2,
                                '& .MuiSlider-thumb': {
                                    width: 6,
                                    height: 6,
                                    transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                    '&::before': {
                                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                                    },
                                    '&:hover, &.Mui-focusVisible': {
                                        boxShadow: `0px 0px 0px 3px rgb(0 0 0 / 16%)`,
                                    },
                                    '&.Mui-active': {
                                        width: 8,
                                        height: 8,
                                    },
                                },
                                '& .MuiSlider-rail': {
                                    opacity: 0.28,
                                },
                                
                            }}
                        />
                    </div>
                </div>
                }
            </div>
        </div>
    )
}