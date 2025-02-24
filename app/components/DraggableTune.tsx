'use-client';
import React, { memo, useState } from 'react';
import Tune from './Tune';
import { Ttune } from '../subtuneTypes/Tune';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { nanoid } from 'nanoid';
import { hexToRGB } from '../utils/helperFunctions';
import { CSSProperties } from 'react';

interface DraggableTuneProps {
    tune: Ttune;
    draggableId: string;
    containerId: string;
    mini?: boolean;
    styles?: CSSProperties;
    className?: string;
}

function DraggableTune({ tune, draggableId, containerId, mini, styles, className }: DraggableTuneProps) {
    const [isHovering, setIsHovering] = useState(false);
    
    const uniqueId = React.useMemo(() => {
        if (tune.uniqueId) {
            return tune.uniqueId;
        }
        if (tune.id) {
            return tune.id.toString();
        }
        return nanoid(11);
    }, [tune.id, tune.uniqueId]);

    return (
        <div
            key={`draggable-${draggableId}-${containerId}`}
            data-id={draggableId}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`dtune flex flex-row grow shrink w-full py-12 px-2 ${
                mini ? 'h-[16%]' : 'h-[20%]'
            } content-center items-center rounded-2xl shadow-2xl border-50 border-solid border-slate-200 ring-1 ring-slate-200 hover:ring-slate-300 hover:border-slate-300 hover:shadow-2xl ${className || ''} relative`}
            style={{
                ...styles,
                height: mini ? '64px' : '80px',
                backgroundColor: tune.color ? hexToRGB(tune.color, 0.25) : 
                    styles?.backgroundColor || 'rgba(226, 232, 240, 0.25)'
            }}
        >
            <div className="cursor-move items-center justify-center px-1">
                <MenuRoundedIcon
                    sx={{ color: "black" }}
                    fontSize="medium"
                    className="handle focus:outline-none"
                />
            </div>
            <Tune key={`tune-key-${draggableId}.${tune.id}`} tune={tune} mini={mini} containerId={containerId} />
        </div>
    );
}

export default memo(DraggableTune); 