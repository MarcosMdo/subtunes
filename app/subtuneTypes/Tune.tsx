
export type Ttune = {
    id: string;
    name: string;
    artist: string;
    image_url: string | null;
    color?: string;
    external?: string | null;
    draggableId?: string;
    uri?: string;
    duration?: number;
    // sortablejs does not give cloned tunes unique ids, so we need to set our own
    // so that we can identify which instance of the tune is currently playing
    uniqueId?: string; 
};
