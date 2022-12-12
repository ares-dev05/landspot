import React from 'react';

const SearchBar = ({placeholder, onUserInput, value}) => {
    return <div className='search-bar landspot-input'>
        <input type='text'
               onChange={e => onUserInput(e.target.value)}
               value={value}
               placeholder={placeholder}
        />
    </div>;
};
export default SearchBar;