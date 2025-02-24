interface SpotifyPlayerConfig {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume: number;
}

interface SpotifyTrack {
    uri: string;
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    duration_ms: number;
    album: {
        images: Array<{ url: string }>;
    };
}

interface PlaybackState {
    track_window: {
        current_track: SpotifyTrack;
    };
    paused: boolean;
    position: number;
}

declare global {
    interface Window {
        Spotify: {
            Player: new (config: SpotifyPlayerConfig) => any;
        };
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

class SpotifyPlayer {
    private player: any = null;
    private deviceId: string | null = null;
    private stateChangeCallbacks: ((state: PlaybackState) => void)[] = [];
    private isInitialized: boolean = false;

    async initialize(token: string): Promise<void> {
        console.log('🎵 [SpotifyPlayer] Initializing...', { hasPlayer: !!this.player });
        
        if (this.player) {
            console.log('🎵 [SpotifyPlayer] Disconnecting existing player...');
            await this.disconnect();
        }

        return new Promise<void>((resolve, reject) => {
            window.onSpotifyWebPlaybackSDKReady = () => {
                this.player = new window.Spotify.Player({
                    name: 'Subtunes Web Player',
                    getOAuthToken: cb => cb(token),
                    volume: 0.5
                });

                this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
                    this.deviceId = device_id;
                    this.isInitialized = true;
                    console.log('🎵 [SpotifyPlayer] Ready with device ID:', device_id);
                    resolve();
                });

                this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                    console.warn('🎵 [SpotifyPlayer] Device ID has gone offline:', device_id);
                    this.initialize(token);
                });

                this.player.addListener('initialization_error', ({ message }: { message: string }) => {
                    console.error('🎵 [SpotifyPlayer] Failed to initialize:', message);
                    reject(new Error(message));
                });

                this.player.addListener('authentication_error', ({ message }: { message: string }) => {
                    console.error('🎵 [SpotifyPlayer] Auth error:', message);
                });

                this.player.addListener('account_error', ({ message }: { message: string }) => {
                    console.error('🎵 [SpotifyPlayer] Account error:', message);
                });

                console.log('🎵 [SpotifyPlayer] Connecting player...');
                this.player.connect();
            };

            if (window.Spotify) {
                window.onSpotifyWebPlaybackSDKReady();
            }
        });
    }

    subscribeToStateChanges(callback: (state: PlaybackState) => void): void {
        console.log('🎵 [SpotifyPlayer] Subscribing to state changes', { hasPlayer: !!this.player });
        if (!this.player) {
            console.warn('🎵 [SpotifyPlayer] No player available for state subscription');
            return;
        }
        
        // Remove existing listeners to prevent duplicates
        this.player.removeListener('player_state_changed');
        
        // Add new listener
        this.player.addListener('player_state_changed', (state: PlaybackState | null) => {
            if (!state) {
                console.warn('🎵 [SpotifyPlayer] Received null state');
                return;
            }

            console.log('🎵 [SpotifyPlayer] State changed:', {
                track: state.track_window?.current_track?.name,
                paused: state.paused,
                position: state.position,
                playerInstance: !!this.player
            });

            // Ensure we have a valid player instance before calling callback
            if (this.player) {
                callback(state);
            }
        });

        // Get initial state
        this.player.getCurrentState().then((state: PlaybackState | null) => {
            if (state) {
                callback(state);
            }
        });
    }

    async play(uri: string): Promise<void> {
        console.log('🎵 [SpotifyPlayer] Play requested', { uri, deviceId: this.deviceId, hasPlayer: !!this.player });
        if (!this.deviceId) {
            console.error('🎵 [SpotifyPlayer] Player not ready');
            throw new Error('Player not ready');
        }

        try {
            const response = await fetch('/api/tune/player-token');
            const { token } = await response.json();

            // Log transfer request
            console.log('🎵 [SpotifyPlayer] Transferring playback...');
            await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [this.deviceId],
                    play: false
                })
            });

            // Log play request
            console.log('🎵 [SpotifyPlayer] Starting playback...');
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [uri],
                    position_ms: 0
                })
            });
        } catch (error) {
            console.error('🎵 [SpotifyPlayer] Play error:', error);
            throw error;
        }
    }

    async pause(): Promise<void> {
        if (!this.player) return;
        console.log('pausing')
        await this.player.pause();
    }

    async resume(): Promise<void> {
        if (!this.player) return;
        console.log('resuming')
        await this.player.resume();
    }

    async seek(position: number): Promise<void> {
        if (!this.player) return;
        console.log('seeking')
        await this.player.seek(position);
    }

    disconnect(): void {
        if (this.player) {
            this.player.disconnect();
            this.player = null;
        }
    }

    async getCurrentState(): Promise<PlaybackState | null> {
        if (!this.player || !this.isInitialized) {
            console.warn('🎵 [SpotifyPlayer] Player not initialized');
            return null;
        }
        return await this.player.getCurrentState();
    }
}

export const spotifyPlayer = new SpotifyPlayer(); 