export type tune = {
    id: string;
    name: string;
    artist: string;
    external: string | null;
    image_url: string | null;
    color: string;
};

export function isTune(obj: any): obj is tune {
    return (
        obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.artist === 'string'
    )
}
