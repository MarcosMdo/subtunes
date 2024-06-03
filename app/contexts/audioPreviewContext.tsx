import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ttune } from '../subtuneTypes/Tune';

// Define a context
const CurrentPreviewContext = createContext<{
    currentPlayingTune: Ttune | null;
    currentTime: number,
    duration: number,
    setTime: (time: number) => void;
    setTune: (tune: Ttune | null) => void;
    playTune: () => void;
    pauseTune: () => void;
}>({
    currentPlayingTune: null,
    currentTime: 0,
    duration: 0,
    setTune: () => {},
    setTime: () => {},
    playTune: () => {},
    pauseTune: () => {},
});

// Define a provider
export const CurrentPreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentPlayingTune, setCurrentPlayingTune] = useState<Ttune | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    
    useEffect(() => {
        if (currentPlayingTune?.external) {
            const newAudio = new Audio(currentPlayingTune.external);
            setAudio(newAudio);
            setCurrentTime(0);
            
            newAudio.play().catch(error => console.error('Error playing audio:', error));

            const updateCurrentTime = () => {
                setCurrentTime(newAudio.currentTime);
            };
            newAudio.addEventListener('timeupdate', updateCurrentTime);

            const updateDuration = () => {
                setDuration(newAudio.duration);
            }
            newAudio.addEventListener('loadedmetadata', updateDuration);

            return () => {
                console.log("cleaning up audio");
                // Remove event listeners
                newAudio.removeEventListener('timeupdate', updateCurrentTime);
                newAudio.removeEventListener('loadedmetadata', updateDuration);
                // Pause and reset audio playback
                newAudio.pause();
                newAudio.currentTime = 0;
                // Reset audio in the state
                setAudio(null);
            };
        } else {
            // If there's no current playing tune, pause any existing audio playback
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
                setAudio(null);
            }
        }
    }, [currentPlayingTune]);

    const setTune = (tune: Ttune | null) => {
        if (tune === null) {
            setCurrentPlayingTune(null);
        }else{
            setCurrentPlayingTune(tune);
        }
    }

    const playTune = () => {
        audio?.play().catch(error => console.error('Error playing audio:', error));
    };

    const pauseTune = () => {
        if (audio) {
            audio.pause();
        }
    };

    const setTime = (time: number) => {
        if (audio) {
            audio.currentTime = time;
        }
    };

    return (
        <CurrentPreviewContext.Provider value={{ currentPlayingTune, currentTime, setTime, playTune, pauseTune, setTune, duration }}>
            {children}
        </CurrentPreviewContext.Provider>
    );
};

// Custom hook to consume the context
export const useCurrentPreview = () => useContext(CurrentPreviewContext);
