import react from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import { Box, Card } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { sizing } from '@mui/system';


import { Tune } from './Tune';
import { tune } from '../../subtuneTypes/Tune';

export const SortableTune = ({ tune, id }: { tune: tune; id: number; }) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: id});

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const paperStyles = {
        background: "transparent",
        display: "flex",
        flexWrap: "wrap",
        justifySelf: "stretch",
        flexBasis: "100%",

        
    }
    return (
        <Card ref={setNodeRef}  sx={paperStyles} >
            <Box className="box1"
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "100%",
                    flexWrap: "wrap",
                }}
            >
                <DragIndicatorIcon color="primary" {...attributes} {...listeners} />
                <Tune style={style} tune={tune} />
            </Box>
        </Card>
    )
}
export default SortableTune;