import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from 'react-autocomplete';
import classnames from 'classnames';

class SearchBarAutocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
    }

    static propTypes = {
        items: PropTypes.array.isRequired,
        value: PropTypes.string.isRequired,
        placeholder: PropTypes.string.isRequired,
        onSearchInputChange: PropTypes.func.isRequired,
        onSelect: PropTypes.func,
    };

    componentDidMount() {
        this.setState({value: this.props.value});
    }

    updateAutocomplete = (value) => {
        this.setState({value});
    };

    render = () => (
        <Autocomplete
            value={this.state.value}
            wrapperProps={{className: 'autocomplete-dropdown'}}
            inputProps={
                {
                    id: 'search-autocomplete',
                    type: 'text',
                    placeholder: this.props.placeholder,
                    maxLength: 100
                }
            }
            items={this.props.items}

            getItemValue={item => item.name}

            shouldItemRender={(item, value) => item.name.toLowerCase().indexOf(value.toLowerCase()) >= 0}

            onSelect={value => {
                this.props.onSearchInputChange(value);
                this.updateAutocomplete(value);
                if (this.props.onSelect) {
                    this.props.onSelect(value);
                }
            }}

            onChange={(event, value) => {
                this.props.onSearchInputChange(value);
                this.updateAutocomplete(value);
            }}

            renderItem={(item, isHighlighted) => (
                <div className={classnames('item', isHighlighted && 'item-highlighted')}
                     key={item.name}
                >{item.name}</div>
            )}

            renderMenu={(items, value) => (
                <div className="menu">
                    {value === '' ? (
                        <div className="item">{`Type a name of ${this.props.itemType}`}</div>
                    ) : items.length === 0 ? (
                        <div className="item">No matches for <b>{value}</b></div>
                    ) : items}
                </div>
            )}
        />
    )
}

export default SearchBarAutocomplete;