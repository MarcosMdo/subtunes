import { useEffect, useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import { InputBase } from '@mui/material';
import { Autocomplete } from '@mui/material';

import { tune } from '../subtuneTypes/Tune';

const SearchBar = (
    { 
        onSubmit, 
        searchTarget, 
        isFilter,
        clearFilter
    }: { 
        onSubmit: (data: any, hasNext?: boolean, clear?: boolean) => void; 
        searchTarget: 'tune' | 'playlist' | 'subtune';  
        isFilter?: boolean
        clearFilter?: (clear: boolean) => void;
    }) => {
    const [query, setQuery] = useState('');
    
    const handleFilter = async () => {
        try{
            console.log(`filtering ${searchTarget} for: `, query);
            const response = await fetch(`/api/search/${searchTarget}?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            onSubmit(data, false, true);
            console.log("filter results: ", data);
            return;

        } catch (error) {
            console.error('Error fetching filter results:', error);
        }
    }   

    useEffect(() => {
        if (isFilter !== true) return;
        clearFilter && clearFilter(query.length < 1);
    }, [query]);

    const handleSearch = async (event: any) => {
        event.preventDefault();
        if (isFilter){
            handleFilter();
            return;
        }

        // Trigger API call with query and update searchResults
        try {
            console.log("quering backend for: ", query);
            const response = await fetch(`/api/search/${searchTarget}?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (searchTarget === 'tune') {
                const prependedIds = data.tracks.map((track: any) => ({ ...track, id: 'results-' + track.id }));
                return onSubmit(data.tracks as tune, data.next, true);
            }
            if (searchTarget === 'subtune') { 
                // eventually prependedIds should be something like: subtune_<subtune_id>-<track_id> to ensure unique keys accross all subtunes
                const prependedIds = data.tracks.map((track: any) => ({ ...track, id: `subtune-${track.id}` }));
                return onSubmit(data.subtune, data.next, true);
            }
            if (searchTarget === 'playlist') {
                // eventually prependedIds should be something like: playlist_<playlist_>-<track_id> to ensure unique keys accross all subtunes
                const prependedIds = data.tracks.map((track: any) => ({ ...track, id: `playlist-${track.id}` }));
                return onSubmit(data.playlist, data.next, true);
            }
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

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
                    autoComplete='off'
                    name="search"
                    type="search"
                    value={query}
                    placeholder={isFilter ? `Filter ${searchTarget}s...` : `Search ${searchTarget}...`}
                    onChange={(e) => {setQuery(e.target.value)}}
                />
                <IconButton type="submit">
                    <SearchIcon fontSize='medium'/>
                </IconButton>
            </form>
        </div>
    );
};



export default SearchBar;