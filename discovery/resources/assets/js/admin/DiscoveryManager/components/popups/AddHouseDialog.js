import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner, clickHandler} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {connect} from 'react-redux';
import * as actions from '../../store/popupDialog/actions';
import NiceDropdown from '~/helpers/NiceDropdown';
import store from '../../store';

class AddHouseDialog extends Component {
    static propTypes = {
        userActionData: PropTypes.oneOfType([
            PropTypes.shape({
                userRanges: PropTypes.array.isRequired,
                selectedRange: PropTypes.oneOfType([
                    PropTypes.string
                ]),
            })
        ]),
        onCancel: PropTypes.func.isRequired,
        saveHouse: PropTypes.func.isRequired,
        getHouses: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            title: '',
            range_name: null,
            range_id: null,
            preloader: false,
            errors: [],
        };
    }

    componentDidMount() {
        const {userActionData: {userRanges, selectedRange}} = this.props;

        if (userRanges.length === 0) {
            this.setState({range_name: ''});
        } else {
            const range_id = selectedRange || userRanges[0].id;
            this.setState({range_id});
        }
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }



    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {ajax_success, errors, fetch},
            getHouses,
            onCancel,
            alert: {error},
        } = props;
        let newState = {};

        if (ajax_success) {
            getHouses();
            onCancel();
            return null;
        }

        if (errors && errors.length) {
            newState.errors = errors;
            newState.preloader = false;
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }

        if (fetch) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_POPUP_FETCH_FLAG'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onInputChange = (data) => {
        this.setState({...this.state, ...data, errors: []});
    };

    saveHouse = () => {
        const {title, range_name, range_id} = this.state;

        this.props.saveHouse({title, range_name, range_id});

        this.setState({preloader: true});
    };

    toggleRange = () => {
        const {range_name, range_id} = this.state;
        const {userActionData: {userRanges}} = this.props;

        if (range_name !== null) {
            this.setState({range_id: userRanges[0].id, range_name: null});
        } else if (range_id) {
            this.setState({range_id: null, range_name: ''});
        }
    };

    render() {
        const {title, range_name, range_id, errors, preloader} = this.state;
        const {onCancel, userActionData: {userRanges}} = this.props;
        return (
            <PopupModal title="Edit Details"
                        dialogClassName={'wide-popup house-details overflow-unset'}
                        onOK={this.saveHouse}
                        onModalHide={onCancel}
            >
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                    <p className='annotation'>Please select range or create new, and type name for new house.</p>
                    <div className="modal-form">
                        <div className="form-rows">
                            <div className="form-row">
                                <div className='row-column'>
                                    {range_id !== null &&
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Select Range
                                        </div>

                                        <NiceDropdown
                                            itemClass='new-house'
                                            defaultItem={null}
                                            defaultValue={range_id}
                                            items={
                                                userRanges.map(range => ({value: range.id, text: range.name}))
                                            }
                                            onChange={range_id => this.onInputChange({range_id, range_name: null})}
                                            value={range_id || null}
                                        />
                                    </div>
                                    }
                                    {range_name !== null &&
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Add New Range
                                        </div>
                                        <input type="text" name="range_name"
                                               className={errors['range_name'] ? 'required-field' : ''}
                                               placeholder="Add New Range"
                                               maxLength="255"
                                               value={range_name || ''}
                                               onChange={(e) => this.onInputChange({range_name: e.target.value, range_id: null})}
                                        />
                                    </div>
                                    }
                                </div>
                                <div className='row-column'>
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            House Name
                                        </div>
                                        <input type="text" name="title"
                                               className={errors['title'] ? 'required-field' : ''}
                                               placeholder="House Name"
                                               maxLength="255"
                                               value={title || ''}
                                               onChange={(e) => this.onInputChange({title: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                {userRanges.length !== 0 &&
                                <a className='button default'
                                   onClick={(e) => clickHandler(e, this.toggleRange)}>
                                    {range_name !== null
                                        ? 'Select existing ranges'
                                        : 'Add new range'
                                    }
                                </a>
                                }
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </PopupModal>);
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
    })), actions
)(AddHouseDialog));