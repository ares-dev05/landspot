import React from 'react';
import PropTypes from 'prop-types';
import RangesAutocomplete from './RangesAutocomplete';

class RangesInput extends React.Component {
    static propTypes = {
        onFloorplanFormInputChange: PropTypes.func.isRequired,
        disabled: PropTypes.bool.isRequired,
        ranges: PropTypes.array.isRequired,
        value: PropTypes.string.isRequired,
        state_id: PropTypes.oneOfType([
            PropTypes.string.isRequired,
            PropTypes.number.isRequired,
        ]),
    };

    constructor(props) {
        super(props);

        this.state = {
            rangesFilteredByState: [],
            rangesMap: new Map()
        };
    }

    static getRangesMap = (rangesFilteredByState, state_id) => {
        const rangesMap = new Map();
        rangesFilteredByState.forEach(range =>
            state_id !== '' &&
            range.state_id === state_id &&
            rangesMap.set(range.name.toLowerCase(), range)
        );
        return rangesMap;
    };

    static getDerivedStateFromProps(props/*, state*/) {
        const {ranges, state_id} = props;

        const rangesFilteredByState = ranges.filter(range => range.state_id === state_id);
        return {
            rangesFilteredByState,
            rangesMap: RangesInput.getRangesMap(rangesFilteredByState, state_id)
        };
    }

    render() {
        const {value, disabled, onFloorplanFormInputChange, state_id} = this.props;
        const {rangesFilteredByState, rangesMap} = this.state;
        const props = {value, rangesMap, ranges: rangesFilteredByState, disabled};
        return (
            <React.Fragment>
                <label htmlFor='community-autocomplete'>RANGE NAME</label>
                <RangesAutocomplete
                    isDisabled={!state_id || disabled}
                    placeholder={state_id ? 'Type the name of a range' : 'Select a state first'}
                    onRangeSelect={value => onFloorplanFormInputChange('range', value)}
                    {...props}
                />
            </React.Fragment>
        );
    }
}

export default RangesInput;