import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import  SortableTune  from './SortableTune';
import { tune } from '../subtuneTypes/Tune';

import { motion, LayoutGroup } from 'framer-motion';

export function DndList(props: any) {
    const { id, tunes, mini } = props;
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    return (
        <SortableContext 
            items={tunes} 
            id={id} 
            strategy={verticalListSortingStrategy} 
            >
            {/* TODO: can we abstract away what we are sorting i.e is it a sortableTune or a sortablePlaylist? -> children prop?
                or do we conditionally render the component based on the type of item we are sorting?
                orr do we even need to?
            */}
            <motion.div 
                layout
                layoutRoot
                initial={{ display: 'none', opacity: 0}}
                animate={{ display: 'flex', opacity: 1 }}
                exit={{ display: 'none', opacity: 0 }}
                transition={{ delay: 0.01, duration: 0.01 }}
                ref={setNodeRef} 
                className="flex grow shrink h-full w-full max-w-full flex-col gap-4 pt-6 pb-12 mb-8 px-4 content-center items-center rounded-xl overflow-y-auto overflow-x-clip no-scrollbar" >
                {tunes.map((tune: tune, index: number) => (
                    <SortableTune key={tune.id} tune={tune} id={tune.id} mini={mini}/>
                ))}
            </motion.div>
        </SortableContext>
    );
}
export default DndList;