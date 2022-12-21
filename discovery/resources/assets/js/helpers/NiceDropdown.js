import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {clickHandler} from '~/helpers';
import store from './store';


class NiceDropdown extends Component {
    static propTypes = {
        disabled: PropTypes.bool,
        items: PropTypes.array.isRequired,
        itemClass: PropTypes.string,
        placement: PropTypes.string,        //bottom|top
        onChange: PropTypes.func.isRequired,
        defaultItem: PropTypes.string,          //null|string
        defaultValue: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]),
        value: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]),
    };

    static defaultProps = {
        title: 'Select',
        defaultItem: 'Please select',
    };

    constructor(props) {
        super(props);

        this.state = {
            activeDropdown: null
        };

        this.dropdown    = null;
        this.unsubscribe = null;
        this.dropdownId = 'dropdown-' + Math.random().toString(36).substring(7);
    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(this.dropdownStoreChangeHandler);
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    dropdownStoreChangeHandler = () => {
        const state            = store.getState();
        const {activeDropdown} = state.dropdown;

        this.setState({activeDropdown});
    };

    setActiveDropdown = (activeDropdown) => {
        if (!activeDropdown) {
            store.dispatch({type: 'RESET_ACTIVE_DROPDOWN'});
        } else {
            store.dispatch({type: 'SET_ACTIVE_DROPDOWN', payload: {activeDropdown}});
        }
    };

    checkDropdown = () => {
        const {activeDropdown} = this.state;
        if (activeDropdown) {
            return activeDropdown.isEqualNode(this.dropdown);
        }
        return false;
    };

    render() {
        const {defaultItem, items, value, onChange, defaultValue, itemClass, placement, disabled} = this.props;

        const selectedIndex = items.findIndex(
            item => value != null && item.value != null && value.toString() === item.value.toString()
        );

        const opened = this.checkDropdown();
        return (
            <div className={classnames('nice-dropdown', itemClass, opened && 'expanded')}>
                <button type="button" aria-haspopup="true"
                        disabled={disabled || !items.length}
                        aria-expanded={opened}
                        id={this.dropdownId}
                        ref={node => this.dropdown = node}
                        onClick={e => clickHandler(e, () => this.setActiveDropdown(opened ? null : this.dropdown))}>
                    {selectedIndex >= 0 ? items[selectedIndex].text : (defaultItem || '\u00A0')}
                </button>

                <div className={classnames('list', placement)}>
                    {
                        defaultItem !== null &&
                        <Option text={defaultItem}
                                onClick={e => {
                                    clickHandler(e, onChange, [defaultValue]);
                                    this.setActiveDropdown(null);
                                }}
                        />
                    }
                    {
                        items.map((item, index) =>
                            <Option
                                key={index}
                                {...item}
                                selected={index === selectedIndex}
                                onClick={e => {
                                    clickHandler(e, onChange, [item.value]);
                                    this.setActiveDropdown(null);
                                }}
                            />
                        )
                    }
                </div>
            </div>
        );
    }
}

const Option = ({text, selected, onClick}) =>
    <a href="#"
       title={text}
       className={classnames('item', selected && 'selected')}
       onClick={onClick}>{text}
    </a>;

export default NiceDropdown;