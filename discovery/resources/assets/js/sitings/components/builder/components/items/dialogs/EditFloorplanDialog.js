import PropTypes from 'prop-types';
import React from 'react';
import {PopupModal} from '~sitings~/helpers';
import EditFloorplanForm from './EditFloorplanForm';

class EditFloorplanDialog extends React.Component {

    static propTypes = {
        userActionData: PropTypes.shape({
            filters: PropTypes.object.isRequired,
            permissions: PropTypes.object.isRequired,
        }).isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.submitCallback = null;
    }

    onSubmitFloorplan = () => {
        if (this.submitCallback) {
            const result = this.submitCallback();
            if (result === false) {
                this.props.onCancel();
            }
        }
    };

    setupSubmitCallback = callback => this.submitCallback = callback;

    render() {
        const {floorplanId, filters, permissions} = this.props.userActionData;

        return (
            <PopupModal title={`${floorplanId ? 'Edit' : 'Create'} Floorplan`}
                        onModalHide={this.props.onCancel}
                        onOK={this.onSubmitFloorplan}>
                <EditFloorplanForm
                    {...{filters, floorplanId, permissions}}
                    closeDialogue={this.props.onCancel}
                    setupSubmitCallback={this.setupSubmitCallback}
                />
            </PopupModal>
        );
    }
}

export default EditFloorplanDialog;