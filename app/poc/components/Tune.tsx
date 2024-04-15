
import react, { useRef, useEffect } from 'react';
import { tune } from '../../subtuneTypes/Tune';

import { IconButton, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import PlayDisabledRoundedIcon from '@mui/icons-material/PlayDisabledRounded';

export const Tune = ({ tune, style, id }: { tune: tune; style: any; id: any }) => {
    const [isPlaying, setIsPlaying] = react.useState(false);
    const inlineStyles = {
        flex: 1,
        ...style,
    };

    const audioRef = useRef(new Audio(tune.external)); // Initialize with the Audio object

    const handlePlayPause = () => {
        const audio = audioRef.current;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.currentTime = 0; // Reset audio to the beginning
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                setIsPlaying(false); // Update state if there's an error
            });
        }

        setIsPlaying(!isPlaying);
    };

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            audioRef.current.pause(); // Pause audio on unmount
            audioRef.current.currentTime = 0; // Reset audio to the beginning
            setIsPlaying(false); // Reset state
        };
    }, []);

    return (
        <Stack className="tune" direction={"row"} id={id} sx={inlineStyles}>
            <IconButton onClick={handlePlayPause}>
                {tune.external === null ?
                    <PlayDisabledRoundedIcon /> :
                    isPlaying ?
                    <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <Stack direction={"column"}>
                <Typography variant={'h6'}>{tune.name}</Typography>
                <Typography variant={'subtitle2'} gutterBottom>{tune.artist}</Typography>
                <Typography variant={'caption'}>tune id: {tune.id}</Typography>
            </Stack>

        </Stack>
    )
};


