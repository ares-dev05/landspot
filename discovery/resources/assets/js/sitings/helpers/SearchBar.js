import React from 'react';
import PropTypes from "prop-types";
import {NiceSelect} from '~sitings~/helpers';
import SearchBarAutocomplete from './SearchBarAutocomplete';
import {withRouter} from "react-router-dom";

import pluralize from 'pluralize';

class SearchBar extends React.Component {
    static propTypes = {
        actionHandler: PropTypes.func.isRequired,
        autocompleteNames: PropTypes.array,
        itemType: PropTypes.string.isRequired,
        sortOptions: PropTypes.array.isRequired,
        options: PropTypes.shape({
            filter: PropTypes.string.isRequired,
            sort_by: PropTypes.string.isRequired,
            order: PropTypes.string.isRequired,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };
    }

    componentDidMount() {
        const {options: {sort_by, order}} = this.props;
        const sortIndex = this.props.sortOptions.findIndex(item => (item.sort_by === sort_by && item.order === order));
        this.setState({sortIndex});
    }

    onSearchInputChange = name => {
        this.props.actionHandler({filter: name});
    };

    onSortSelect = sortIndex => {
        this.setState({sortIndex: parseInt(sortIndex)});
        this.props.actionHandler({option: this.props.sortOptions[sortIndex]});
    };

    render() {
        const {autocompleteNames, sortOptions, itemType, options} = this.props;

        return (
            <div className="search-bar">
                {
                    autocompleteNames != null && autocompleteNames.length > 0 &&
                    <div className='search-autocomplete'>
                        <SearchBarAutocomplete
                            onSearchInputChange={value => this.onSearchInputChange(value)}
                            items={autocompleteNames}
                            value={options.filter || ''}
                            itemType={itemType}
                            placeholder={`Search ${itemType}`}
                        />
                    </div>
                }

                <NiceSelect
                    defaultOption={{value: -1, title: `Sort ${pluralize(itemType)} by`}}
                    onChange={e => this.onSortSelect(e.target.value)}
                    value={this.state.sortIndex}
                    renderOptions={() => sortOptions.map((item, index) =>
                        <option key={index} value={index}>
                            {item.title}
                        </option>)
                    }
                />
            </div>
        );
    }
}

export default withRouter(SearchBar);
