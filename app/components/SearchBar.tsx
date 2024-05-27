import { useEffect, useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@mui/material';
import { InputBase } from '@mui/material';

import { Ttune } from '../subtuneTypes/Tune';
import { Tsubtune } from '../subtuneTypes/Subtune';

import { setDraggableIds, setDroppableIds } from '../utils/helperFunctions';
import { Tplaylist } from '../subtuneTypes/Playlist';

const SearchBar = (
        {   
            onSubmit, 
            searchTarget, 
            isFilter,
            clearFilter,
        }: 
        { 
            onSubmit: (data: any, hasNext?: boolean, clear?: boolean) => void; 
            searchTarget: 'tune' | 'playlist' | 'subtune'; 
            isFilter?: boolean
            clearFilter?: (clear: boolean) => void;
        }) => {

    const [query, setQuery] = useState('');
    
    const handleFilter = async () => {
        try{
            const response = await fetch(`/api/search/${searchTarget}?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            let cleanData;
            if('subtune' in data[0]){
                cleanData = data.map((item: { subtune: Tsubtune }) => item.subtune);
                cleanData = setDroppableIds(cleanData);
            } else {
                cleanData = data.map((item: { playlist: Tplaylist }) => item.playlist);
                cleanData = setDroppableIds(cleanData);
            }
            onSubmit(cleanData, false, true);
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
            const response = await fetch(`/api/search/${searchTarget}?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (searchTarget === 'tune') {
                setDraggableIds(data.tracks as Ttune[])
                return onSubmit(data.tracks as Ttune, data.next, true);
            }
            if (searchTarget === 'subtune') {
                setDraggableIds(data.tracks as Ttune[])
                console.log("subtune data: ", data);
                return onSubmit(data.subtune, data.next, true);
            }
            if (searchTarget === 'playlist') {
                setDraggableIds(data.tracks as Ttune[])
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
                <InputBase
                    className="h-full rounded-md w-full px-4 bg-transparent focus:outline-none"
                    autoComplete='off'
                    name="search"
                    type="search"
                    value={query}
                    placeholder={isFilter ? `Filter ${searchTarget}s...` : `Search ${searchTarget}...`}
                    onChange={(e) => {setQuery(e.target.value)}}
                    onDoubleClick={(e) => e.stopPropagation()}
                />
                <IconButton type="submit">
                    <SearchIcon fontSize='medium'/>
                </IconButton>
            </form>
        </div>
    );
};



export default SearchBar;