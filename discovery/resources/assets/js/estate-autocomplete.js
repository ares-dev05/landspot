import ReactDOM from 'react-dom';
import React, {useState} from 'react';
import axios from 'axios';

const AutocompleteInput = () => {
    const [suggestions, setSuggestion] = useState([]);
    const [text, setText] = useState('');

    const onTextChanged = async (e) => {
        const search = e.target.value;
        setText(search);
        if (search.length) {
            const response = await axios.post('/land-estates/estate-autocomplete', {
                search
            });
            setSuggestion(response.data || []);
        } else {
            setSuggestion([]);
        }
    };

    return (
        <div className="search-input">
            <i className="far fa-search" />
            <input value={text}
                   onChange={onTextChanged}
                   type="text"
                   placeholder="Search Estates"/>
            {suggestions.length !== 0 && (
                <div className="list">
                    {suggestions.map(({id, name, suburb_slug, slug}) => (
                        <a key={id}
                           href={`/land-estates/vic/${suburb_slug}/${slug}`}
                           className="item"
                        >{name}</a>
                    ))}
                </div>
            )}
        </div>
    );
};


ReactDOM.render(<AutocompleteInput/>, document.getElementById('estate-autocomplete'));