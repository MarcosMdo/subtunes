import { tune } from './Tune';

export type subtune = {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    tunes: Array<tune>;
    color: string;
    }