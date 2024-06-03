import { Ttune } from './Tune';

export type Tsubtune = {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    tunes: Array<Ttune>;
    color: string;
    droppableId?: string;
}