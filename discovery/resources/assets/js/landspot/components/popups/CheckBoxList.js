import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {clickHandler, NiceCheckbox} from '~/helpers';

class CheckBoxList extends React.Component {

    static propTypes = {
        checkAllOptionsText: PropTypes.string,
        onMount: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
        selectedOptions: PropTypes.array.isRequired,
        unCheckAllOptionsText: PropTypes.string,
        selectedOptionsLimit: PropTypes.number.isRequired
    };

    constructor(props) {
        super(props);
        this.state = {
            opened: false,
            customOptionsChecked: false,
            allChecked: false,
            allUnchecked: false,
            selectedOptions: []
        };
        this.itemsList = null;
    }

    getCheckboxes() {
        return this.itemsList.querySelectorAll('input[type=checkbox]');
    }

    checkAllOptions = (check = true) => {
        const checkBoxes = this.getCheckboxes();
        checkBoxes.forEach(item => item.checked = check);
        this.setState({
            allChecked: check,
            allUnchecked: !check,
            customOptionsChecked: false,
            selectedOptions: [],
            open: false
        });

    };

    changeCheckedStatus(companyID, status) {
        let selectedOptions = this.state.selectedOptions.slice(0);
        if(status) {
            if (selectedOptions.indexOf(companyID) === -1 &&
                selectedOptions.length < this.props.selectedOptionsLimit
            ) {
                selectedOptions.push(companyID);
            }
        } else {
            selectedOptions = selectedOptions.filter(id => id !== companyID);
        }

        this.setState({
            allChecked: false,
            allUnchecked: false,
            customOptionsChecked: true,
            selectedOptions,
            open: true
        });
    }

    componentDidMount() {
        const {customOptionsChecked, allChecked, allUnchecked, selectedOptions} = this.props;
        this.setState({customOptionsChecked, allChecked, allUnchecked, selectedOptions});
        this.props.onMount(() => this.state);
    }

    getSelectedItemsText() {
        if (this.props.checkAllOptionsText && this.state.allChecked) {
            return this.props.checkAllOptionsText;
        }
        if (this.props.unCheckAllOptionsText && this.state.allUnchecked) {
            return this.props.unCheckAllOptionsText;
        }
        if (this.state.customOptionsChecked) {
            let selectedItems = [];
            this.props.options.forEach(item => {
                if (this.state.selectedOptions.indexOf(item.id) >= 0) {
                    selectedItems.push(item.name);
                }
            });
            if (!selectedItems.length) {
                return 'PLEASE SELECT';
            }
            return selectedItems.join(', ') + (selectedItems.length === 1 ? ' ONLY' : '');
        }
    }

    render() {
        return (
            <div className={classnames('multi-checkbox-list', this.state.opened && 'open')}>
                <div className="title" onClick={() => this.setState({opened: !this.state.opened})}>
                    {this.getSelectedItemsText()}
                </div>
                <ul className="dropdown-menu" ref={(e) => this.itemsList = e}>
                    {
                        this.props.checkAllOptionsText &&
                        <li>
                            <a href="#" tabIndex="-1"
                               onClick={(e) => clickHandler(e, this.checkAllOptions, [true])}>
                                <span>{this.props.checkAllOptionsText}</span>
                            </a>
                        </li>
                    }
                    {
                        this.props.unCheckAllOptionsText &&
                        <li>
                            <a href="#" className="small" tabIndex="-1"
                               onClick={(e) => clickHandler(e, this.checkAllOptions, [false])}>
                                <span>{this.props.unCheckAllOptionsText}</span>
                            </a>
                        </li>
                    }
                    {
                        this.props.options.map((item, index) =>
                            <li key={index}>
                                <label className="small">
                                    <NiceCheckbox
                                        label={item.name}
                                        name={`company-${item.id}`}
                                        onChange={e => this.changeCheckedStatus(item.id, e.target.checked)}
                                        checked={this.state.selectedOptions.indexOf(item.id) !== -1}
                                    />
                                </label>
                            </li>
                        )
                    }
                </ul>
            </div>
        );
    }
}

export default CheckBoxList;