import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import * as actions from '~sitings~/components/popup-dialog/store/actions'
import {PopupModal} from '~sitings~/helpers';
import BulkUploader from './BulkUploader';

class BulkFloorplanUploaderDialog extends React.Component {
    state = {
        step: 0
    };

    static propTypes = {
        userActionData: PropTypes.shape({}).isRequired,
        popupDialogStore: PropTypes.shape({
            history: PropTypes.array,
        }).isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        resetErrorMessages: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.submitCallback = null;
    }

    componentWillUnmount = () => {
        this.props.resetDialogStore();
    };

    onSubmitFloorplans = () => {
        if (this.submitCallback) {
            this.submitCallback();
        }
    };

    setupSubmitCallback = callback => this.submitCallback = callback;
    setStep = step => this.setState({step});

    render() {
        const {step} = this.state;
        return (
            <PopupModal title='Bulk Upload'
                        dialogClassName='bulk-uploader'
                        onModalHide={this.props.onCancel}
                        okButtonTitle={step === 0 ? 'NEXT' : 'SUBMIT'}
                        onOK={this.onSubmitFloorplans}>
                <BulkUploader
                    closeDialogue={this.props.onCancel}
                    step={step}
                    setupSubmitCallback={this.setupSubmitCallback}
                    setStep={this.setStep}
                />
            </PopupModal>
        );
    }
}

export default connect(
    (state => ({
        popupDialogStore: state.popupDialog
    })), actions
)(BulkFloorplanUploaderDialog);