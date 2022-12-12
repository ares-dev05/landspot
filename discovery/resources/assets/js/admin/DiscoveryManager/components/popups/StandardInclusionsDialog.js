import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {connect} from 'react-redux';
import * as actions from '../../store/popupDialog/actions';
import store from '../../store';
import {LoadingSpinner} from '~/helpers';

class StandardInclusionsDialog extends Component {
    static propTypes = {
        userActionData: PropTypes.oneOfType([
            PropTypes.shape({
                userRanges: PropTypes.array.isRequired
            })
        ]),
        onCancel: PropTypes.func.isRequired,
        saveRangeInclusions: PropTypes.func.isRequired,
        getHouses: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false,
            rangeInclusions: []
        };
    }

    componentDidMount() {
        const {userActionData: {userRanges}} = this.props;
        
        const rangeInclusions = userRanges.map(
            ({id, name, inclusions}) => ({id, name, inclusions})
        );
        this.setState({rangeInclusions});
    }

    static getDerivedStateFromProps(props) {
            const {
            popupDialog: {
                errors,
                fetch,
            },
            alert: {error},
        } = props;
        let newState = {};

        if (errors &&errors.length) {
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

    componentWillUnmount() {
        const {getHouses, resetDialogStore} = this.props;
        getHouses();
        resetDialogStore();
    }

    onInputChange = ({inclusions, rangeId}) => {
        const {rangeInclusions} = this.state;

        const rangeIndex = rangeInclusions.findIndex(range => range.id === rangeId);

        rangeInclusions[rangeIndex].inclusions = inclusions;

        this.setState({rangeInclusions});
    };

    saveInclusions = () => {
        const {rangeInclusions} = this.state;
        this.setState({preloader: true});
        this.props.saveRangeInclusions({rangeInclusions});
    };

    render() {
        const {onCancel}   = this.props;
        const {rangeInclusions, preloader} = this.state;

        return (
            <React.Fragment>
                <PopupModal title="Edit Standard Inclusions"
                            dialogClassName={'wide-popup house-details'}
                            onOK={this.saveInclusions}
                            onModalHide={onCancel}
                >
                    <React.Fragment>
                        {preloader && <LoadingSpinner className={'overlay'}/>}
                        <p className='annotation'>
                            {rangeInclusions.length
                                ? 'Please type each inclusion on the new line.'
                                : 'Please create a new range ("Add House" button) to add an inclusion.'
                            }
                        </p>
                        <div className="modal-form">
                            <div className="form-rows">
                                {rangeInclusions.map(
                                    range => <div key={range.id} className="form-row">
                                        <div className="row-column">{range.name}</div>
                                        <div className="row-column">
                                            <div className="landspot-input">
                                                <textarea name="inclusions" rows="4"
                                                          placeholder="Inclusions"
                                                          onChange={(e) => this.onInputChange({
                                                              inclusions: e.target.value,
                                                              rangeId: range.id
                                                          })}
                                                          value={range.inclusions || ''}/>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                </PopupModal>
            </React.Fragment>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
    })), actions
)(StandardInclusionsDialog));