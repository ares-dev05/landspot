import PropTypes from 'prop-types';
import React from 'react';
import {PopupModal} from '~/popup-dialog/PopupModal';

const SendResetPasswordLinkDialog = ({onConfirm, userActionData, onCancel}) => (
    <PopupModal title="Confirm action"
                onOK={() => onConfirm(userActionData)}
                onModalHide={onCancel}>
        <p>Send a reset password link to the email of <b>{userActionData.user.display_name}</b>?</p>
    </PopupModal>
);

SendResetPasswordLinkDialog.propTypes = {
    userActionData: PropTypes.shape({
        user: PropTypes.object.isRequired
    }),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default SendResetPasswordLinkDialog;
