// container for none draggable tunes


export default function TuneContainer({children}: {children: any}) {
    return (
        <div className="flex w-full h-full pl-2 pt-3 max-h-28 content-center items-center rounded-xl border-1 border-solid border-slate-200 ring-1 ring-slate-200 ">
            {children}
        </div>
    )
}
