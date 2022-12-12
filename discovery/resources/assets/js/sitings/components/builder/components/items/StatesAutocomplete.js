import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from 'react-autocomplete';
import classnames from 'classnames';

class StatesAutocomplete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };

        this.statesData = props.states.reduce((accumulator, state) => {
            accumulator[state.name] = state.id;
            return accumulator;
        }, {});
    }

    static propTypes = {
        disabled: PropTypes.bool.isRequired,
        states: PropTypes.array.isRequired,
        initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onStateSelect: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {initialValue, states} = this.props;
        if (initialValue) {
            const state = states.find(state => state.id === initialValue);
            if (state) {
                this.setState({value: state.name});
            }
        }
    }

    updateAutocomplete = (value) => {
        this.setState({value});
        this.props.onStateSelect(value ? this.statesData[value] : '');
    };

    render = () => (
        <Autocomplete
            value={this.state.value}
            wrapperProps={{className: 'autocomplete-dropdown'}}
            wrapperStyle={{display: null}}
            inputProps={
                {
                    id: 'states-autocomplete',
                    disabled: this.props.disabled,
                    type: 'text',
                    placeholder: 'Type the name of a state',
                    maxLength: 100
                }
            }
            items={this.props.states}

            getItemValue={item => item.name}

            shouldItemRender={(item, value) => {
                return value === '' || item.name.toLowerCase().indexOf(value.toLowerCase()) >= 0
            }}

            onSelect={stateName => {
                this.updateAutocomplete(stateName);
            }}

            onChange={(event, value) => this.updateAutocomplete(value)}

            renderItem={(item, isHighlighted) => (
                <div className={classnames('item', isHighlighted && 'item-highlighted')}
                     key={item.name}
                >{item.name}</div>
            )}

            renderMenu={(items, value) => (
                <div className="menu">
                    {
                        value === ''
                            ? <React.Fragment>
                                <div className="item"><i>Type the name of a state</i></div>
                                {
                                    items
                                }
                            </React.Fragment>
                            : (
                                items.length === 0
                                    ? <div className="item not-found">No state found</div>
                                    : items
                            )
                    }
                </div>
            )}
        />
    )
}

export default StatesAutocomplete;