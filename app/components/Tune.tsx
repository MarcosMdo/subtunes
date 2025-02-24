'use client';
import { CSSProperties } from 'react';
import { Ttune } from '../subtuneTypes/Tune';
import { useSpotifyPlayer } from '../contexts/spotifyPlayerContext';

import { IconButton } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayDisabledRoundedIcon from '@mui/icons-material/PlayDisabledRounded';
import Slider from '@mui/material/Slider';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';

export default function Tune({ tune, style, mini, containerId }: { 
    tune: Ttune; 
    style?: CSSProperties; 
    mini?: boolean;
    containerId?: string;
}) {
    const { 
        currentTrack, 
        position, 
        duration, 
        isPlaying,
        playTune,
        pause,
        resume,
        seek
    } = useSpotifyPlayer();
    
    mini = mini || false;
    const isTunePlaying = isPlaying && currentTrack?.id === tune.id;


    const getSliderPosition = () => {
        const isCurrentTune = currentTrack?.id === tune.id ;
        return isCurrentTune ? position : 0;
    };

    const handlePlayPause = async () => {
        console.log('PlayPause clicked:', {
            tuneName: tune.name,
            tuneId: tune.id,
            currentTrackId: currentTrack?.id,
            isCurrentTrack: currentTrack?.id === tune.id,
            isPlaying,
            isTunePlaying
        });

        if (!tune.uri) return;

        try {
            if (currentTrack?.id === tune.id) {
                console.log("pausing or resuming current track")
                if (isPlaying) {
                    // console.log('Pausing current track');
                    await pause();
                } else {
                    // console.log('Resuming current track');
                    await resume();
                }
            } else {
                console.log('Playing new track:', tune.name);
                await playTune(tune);
            }
        } catch (error) {
            console.error('Error in handlePlayPause:', error);
        }
    };

    const handleSliderChange = async (_event: Event | React.SyntheticEvent, value: number | number[]) => {
        if ('preventDefault' in _event) {
            _event.preventDefault();
        }
        
        const newPosition = Array.isArray(value) ? value[0] : value;
        console.log('Slider changed:', {
            tuneName: tune.name,
            oldPosition: position,
            newPosition,
            isCurrentTrack: currentTrack?.id === tune.id
        });

        if (currentTrack?.id === tune.id) {
            await seek(newPosition);
        }
    };

    return (
        <div className="tune flex flex-row grow shrink min-w-0 w-full min-h-[80px] h-full pr-2 pt-2">
            <div className="album-cover flex-none pl-2 flex items-center justify-center content-center h-full aspect-square">
                {tune.image_url !== null ?
                    <img src={tune.image_url} alt={tune.name} className={`object-contain h-[90%] aspect-square flex shrink ${
                        mini ? 'max-h-12' : 'max-h-24'
                    } shadow-lg shadow-slate-400 rounded `} /> :
                    <IconButton size='large' sx={{ color: "black" }}>
                        <ImageNotSupportedRoundedIcon fontSize='large' />
                    </IconButton>
                }
            </div>
            <div className="flex flex-col grow min-w-0 pl-2 justify-center mt-2 ">
                <div className="flex flex-col w-[80%] min-w-[150px] justify-start ">
                    <h2 className="line-clamp-1 h-full leading-5 text-start text-xl ml-2 pr-4 ">
                        {tune.name}
                    </h2>
                    <p className="line-clamp-1 h-full text-gray-600 ml-2">
                        {tune.artist}
                    </p>
                </div>
                {mini ? null :
                    <div className="play-pause flex flex-row items-center py-2 ">
                        <div className="flex-none flex items-center">
                            <IconButton
                                edge="start"
                                size="small"
                                onClick={handlePlayPause}
                                sx={{ color: "black" }}
                            >
                                {tune.uri === null ?
                                    <PlayDisabledRoundedIcon /> :
                                    isTunePlaying ?
                                        <PauseRoundedIcon /> :
                                        <PlayArrowRoundedIcon />
                                }
                            </IconButton>
                        </div>
                        <div className="slider w-full pl-2 flex items-center">
                            <Slider
                                size="small"
                                defaultValue={0}
                                aria-label="Small"
                                valueLabelDisplay="off"
                                value={getSliderPosition()}
                                min={0}
                                step={1}
                                max={duration}
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
    );
}