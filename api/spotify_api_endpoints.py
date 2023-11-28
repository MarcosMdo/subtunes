spotify_endpoints = {
    'LOCAL_URL': 'http://127.0.0.1',
    'PORT': 5328,
    'SPOTIFY_AUTH_URL': 'https://accounts.spotify.com/authorize',
    'SPOTIFY_TOKEN_URL': 'https://accounts.spotify.com/api/token',
    'SPOTIFY_API_BASE_URL': 'https://api.spotify.com',
    'API_VERSION': 'v1',
}
spotify_endpoints['SPOTIFY_REDIRECT_URI'] = f"{spotify_endpoints['LOCAL_URL']}:{spotify_endpoints['PORT']}/callback"
spotify_endpoints['SPOTIFY_API_URL'] = f"{spotify_endpoints['SPOTIFY_API_BASE_URL']}/{spotify_endpoints['API_VERSION']}"