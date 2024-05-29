import React from 'react'
import Tune from './Tune'
import { Ttune } from '../subtuneTypes/Tune'

import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

export default function dragTunePreview({tune, mini = false}:{tune: Ttune, mini?: boolean}) {
    return (
        <div
            key={`drag-preview-${tune.id}`}
            className={`flex flex-row grow shrink min-w-fit max-w-full w-full px-2 ${mini ? 'h-20 py-2' : 'h-26 pt-6 pb-2'} max-h-28 content-center items-center rounded-xl shadow-xl bg-slate-100/30 border-1 border-solid border-slate-200 ring-1 ring-slate-200  hover:ring-slate-300 hover:border-slate-300 hover:shadow-2xl

                `}
        >
            <div  >
                <MenuRoundedIcon
                    sx={{ color: "black" }}
                    fontSize='large'
                    className="focus:outline-none"
                />
            </div>
            <Tune tune={tune} mini={mini} />
        </div>
    )
}
// DragPreview
// flex flex-row 
// grow shrink
// min-w-fit max-w-full
// w-full 
// px-2
// h-24 py-4
// max-h-28
// content-center items-center 
// rounded-xl shadow-xl
// bg-slate-100/30 border-1 border-solid border-slate-200 
// ring-1 ring-slate-200 
// hover:ring-slate-300 hover:border-slate-300
// hover:shadow-2xl