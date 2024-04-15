// components/SearchBar.js
import { useState } from 'react';

const SearchBar = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const [query, setQuery] = useState('');

    const handleSearch = async (event: any) => {
        event.preventDefault();

        // Trigger API call with query and update searchResults
        try {
            console.log("quering backend for: ", query);
            const response = await fetch(`/api/search/tune?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            console.log('Search results:', data);
            return onSubmit(data.tracks)
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSearch}>
                <input
                    name="search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
        </div>
    );
};



export default SearchBar;