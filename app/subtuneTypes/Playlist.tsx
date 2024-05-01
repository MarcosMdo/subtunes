import { tune } from './Tune';
import { subtune } from './Subtune';

export type playlist = {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    tunes: Array<tune>;
    subtunes?: Array<subtune>;
    color: string;
}