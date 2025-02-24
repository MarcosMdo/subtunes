import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { spotifyPlayer } from '../services/spotify-player';
import { Ttune } from '../subtuneTypes/Tune';
import { Tsubtune } from '../subtuneTypes/Subtune';
import { Tplaylist } from '../subtuneTypes/Playlist';

interface SpotifyPlayerContextType {
    currentTrack: Ttune | null;
    isPlaying: boolean;
    position: number;
    duration: number;
    playTune: (tune: Ttune) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    seek: (position: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export const useSpotifyPlayer = () => {
    const context = useContext(SpotifyPlayerContext);
    if (!context) {
        throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
    }
    return context;
};

interface SpotifyPlayerProviderProps {
    children: React.ReactNode;
    searchTunes: Ttune[];
    targetTunes: Ttune[];
    collections: (Tsubtune[] | Tplaylist[]);
}

export const SpotifyPlayerProvider: React.FC<SpotifyPlayerProviderProps> = ({ 
    children, 
    targetTunes,
    searchTunes, 
    collections 
}) => {
    const [currentTrack, setCurrentTrack] = useState<Ttune | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // Initialize player
    useEffect(() => {
        const initPlayer = async () => {
            try {
                const response = await fetch('/api/tune/player-token');
                const { token } = await response.json();
                await spotifyPlayer.initialize(token);
                
                // Set up state change listener
                spotifyPlayer.subscribeToStateChanges((state) => {
                    if (state.track_window?.current_track) {
                        const track = state.track_window.current_track;
                        setCurrentTrack({
                            id: track.id,
                            name: track.name,
                            artist: track.artists[0].name,
                            uri: track.uri,
                            duration: track.duration_ms,
                            image_url: track.album.images[0].url,
                        });
                        setDuration(track.duration_ms);
                    }
                    // Only update position if it's valid
                    if (typeof state.position === 'number' && state.position >= 0) {
                        setPosition(state.position);
                    }
                    setIsPlaying(!state.paused);
                });
            } catch (error) {
                console.error('Failed to initialize player:', error);
            }
        };

        initPlayer();
        return () => spotifyPlayer.disconnect();
    }, []);

    // Update position while playing
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isPlaying && currentTrack) {
            interval = setInterval(async () => {
                const state = await spotifyPlayer.getCurrentState();
                if (state) {
                    // console.log('Position update:', {
                    //     track: state.track_window.current_track.name,
                    //     position: state.position,
                    //     duration: state.track_window.current_track.duration_ms
                    // });
                setPosition(state.position);
                }
            }, 100);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, currentTrack]);

    const findNextTune = (currentTrack: Ttune): Ttune | null => {
        const currentIndex = targetTunes.findIndex(t => t.id === currentTrack.id);
        if (currentIndex >= 0 && currentIndex < targetTunes.length - 1) {
            return targetTunes[currentIndex + 1];
        }
        return null;
    };

    const handlePlay = async (tune: Ttune) => {
        try {
            if (!tune.uri) {
                console.error('🎵 [Context] Invalid tune URI:', tune);
                throw new Error('Invalid tune URI');
            }

            setPosition(0);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Pass the URI string to spotifyPlayer.play
            await spotifyPlayer.play(tune.uri);  // This expects a string

            // Explicitly seek to the start of the track
            await spotifyPlayer.seek(0);

            const playerState = await spotifyPlayer.getCurrentState();
            if (playerState) {
                console.log('🎵 [Context] Successfully playing tune:', {
                    name: tune.name,
                    position: playerState.position,
                    trackId: playerState.track_window?.current_track?.id
                });
                setDuration(playerState.track_window?.current_track?.duration_ms as number);
                setCurrentTrack(tune);
                setIsPlaying(true);
            } else {
                console.error('🎵 [Context] Player state is null after play attempt');
                throw new Error('Player state is null');
            }
        } catch (error) {
            console.error('🎵 [Context] Play error:', error);
            // Add more detailed error logging
            if (error instanceof Error) {
                console.error('🎵 [Context] Error details:', {
                    message: error.message,
                    stack: error.stack,
                    tune: tune
                });
            }
            // Reset state on error
            setCurrentTrack(null);
            setIsPlaying(false);
            throw error;
        }
    };

    const handlePause = useCallback(async () => {
        try {
            await spotifyPlayer.pause();
            setIsPlaying(false);
        } catch (error) {
            console.error('Failed to pause:', error);
        }
    }, []);

    const handleResume = useCallback(async () => {
        try {
            await spotifyPlayer.resume();
            setIsPlaying(true);
        } catch (error) {
            console.error('Failed to resume:', error);
        }
    }, []);

    const handleSeek = useCallback(async (positionMs: number) => {
        try {
            await spotifyPlayer.seek(positionMs);
            setPosition(positionMs);
        } catch (error) {
            console.error('Failed to seek:', error);
        }
    }, []);

    // Modify track ending effect to use findNextTune
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isPlaying && currentTrack && position > 0) {
            const timeLeft = Math.max(0, duration - position);
            console.log('timeLeft', timeLeft);
            timeoutId = setTimeout(async () => {
                const nextTrack = findNextTune(currentTrack);
                if (nextTrack?.uri) {
                    try {
                        await handlePlay(nextTrack);
                    } catch (error) {
                        console.error('Error during track transition:', error);
                    }
                }
            }, timeLeft);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isPlaying, currentTrack, position, duration]);


    const value = {
        currentTrack,
        isPlaying,
        position,
        duration,
        playTune: handlePlay,
        pause: handlePause,
        resume: handleResume,
        seek: handleSeek,
        // updateQueue
    };

    return (
        <SpotifyPlayerContext.Provider value={value}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
}; 