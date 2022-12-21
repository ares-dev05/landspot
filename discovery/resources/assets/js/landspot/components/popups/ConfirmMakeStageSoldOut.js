import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/estate/actions';
import {resetDialogStore} from '../../store/popupDialog/actions';


class ConfirmMakeStageSoldOut extends Component {
    static propTypes = {
        stage: PropTypes.object.isRequired,
        filters: PropTypes.object.isRequired,
        updateStage: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false
        };
    }

    componentDidUpdate() {
        const {
            popupDialog: {ESTATE_UPDATED},
            alert: {success},
            onCancel
        } = this.props;

        if (ESTATE_UPDATED) {
            success('The stage has been successfully updated');
            onCancel();
        }
    }

    submitHandler = () => {
        const {
            stage,
            filters,
            updateStage,
        } = this.props;

        updateStage({sold: stage.sold ? 0 : 1, filters}, stage);
        this.setState({preloader: true});
    };

    render() {
        const {stage, onCancel} = this.props;
        const {preloader} = this.state;
        return (
            <PopupModal okButtonTitle={'Save'}
                        dialogClassName={'overflow-unset'}
                        title={'Confirm action'}
                        onOK={this.submitHandler}
                        onModalHide={onCancel}>
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                    <span>
                        Has this entire stage <b>{stage.name}</b> been {stage.sold ? 'unsold' : 'sold'}?
                    </span>
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
        estate: state.estate.estate
    })), {...actions, resetDialogStore}
)(ConfirmMakeStageSoldOut));
