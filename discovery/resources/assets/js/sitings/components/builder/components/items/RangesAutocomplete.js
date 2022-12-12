import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from 'react-autocomplete';
import classnames from 'classnames';

class RangesAutocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
    }

    static propTypes = {
        isDisabled: PropTypes.bool.isRequired,
        placeholder: PropTypes.string.isRequired,
        ranges: PropTypes.array.isRequired,
        onRangeSelect: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.setState({value: this.props.value || ''});
    }

    updateAutocomplete = (value) => {
        this.setState({value});
    };

    createNewItem = () => {
        const {value} = this.state;
        this.props.onRangeSelect(value);
        const e = new KeyboardEvent('keydown', {key: 'Escape', keyCode: 27});
        this.autocompleteRef.handleKeyDown(e);
    };

    render() {
        const {value} = this.state;
        const {ranges, rangesMap, placeholder, isDisabled} = this.props;

        return <Autocomplete
            ref={c => this.autocompleteRef = c}
            value={value}
            wrapperProps={{className: 'autocomplete-dropdown'}}
            wrapperStyle={{display: null}}
            inputProps={
                {
                    disabled: isDisabled,
                    type: 'text',
                    placeholder,
                    maxLength: 100
                }
            }
            items={ranges}

            getItemValue={item => item.name}

            shouldItemRender={(item, value) => item.name.toLowerCase().indexOf(value.toLowerCase()) >= 0}

            onSelect={value => {
                this.props.onRangeSelect(value);
                this.updateAutocomplete(value);
            }}

            onChange={(event, value) => {
                this.updateAutocomplete(value);
                this.props.onRangeSelect(value);
            }}

            renderItem={(item, isHighlighted) => (
                <div className={classnames('item', isHighlighted && 'item-highlighted')}
                     key={item.name}
                >{item.name}</div>
            )}

            renderMenu={(items, value) => (
                <div className="menu">
                    <React.Fragment>
                        {
                            value !== '' && !rangesMap.has(value.toLowerCase()) &&
                            <div className='item new'
                                 role={'button'}
                                 onClick={this.createNewItem}
                            >Add a new range <b>{value}</b>
                                <i className="fal fa-plus"/>
                            </div>
                        }
                        {
                            value === '' && <div className="item"><i>Type the name of a range</i></div>
                        }
                        {items}
                    </React.Fragment>
                </div>
            )}
        />;
    }
}

export default RangesAutocomplete;