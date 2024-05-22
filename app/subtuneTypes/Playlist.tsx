import { Ttune } from './Tune';
import { Tsubtune } from './Subtune';

export type Tplaylist = {
    id: string;
    name: string;
    description?: string;
    image_url?: string;
    tunes: Array<Ttune>;
    subtunes?: Array<Tsubtune>;
    color: string;
    droppableId?: string;
}