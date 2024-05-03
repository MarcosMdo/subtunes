import React, {useState} from 'react'

import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputBase } from '@mui/material';



export default function FilterBar() {
    const [query, setQuery] = useState('');


    return (
        <div className="flex flex-row w-full p-1 bg-slate-100/25 ring-1 ring-slate-200 rounded-xl shadow-xl">
        <form onSubmit={handleSearch}
            className="flex flex-row grow shrink justify-between items-center w-full"
        >
            {/* <Autocomplete
                className="h-full rounded-md w-full self-end px-4 bg-transparent focus:outline-none"
                id="search-bar"
                freeSolo
                // TODO: query db as user types and add to options list
                options = {[]}
                renderInput={(params) => (
                    <InputBase
                        {...params}
                        autoComplete='on'
                        name="search"
                        type="search"
                        value={query}
                        placeholder={`Search ${searchTarget}...`}
                        onChange={(e) => setQuery(e.target.value)}
                        onDoubleClick={(e) => e.stopPropagation()}
                    />
                )} /> */}
            <InputBase
                className="h-full rounded-md w-full px-4 bg-transparent focus:outline-none"
                autoComplete='on'
                name="search"
                type="text"
                value={query}
                placeholder="Search tunes..."
                onChange={(e) => setQuery(e.target.value)}
            />
            <IconButton type="submit">
                <SearchIcon fontSize='medium'/>
            </IconButton>
        </form>
    </div>
    )
}
