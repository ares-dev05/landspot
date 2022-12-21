import React from 'react';
import PropTypes from 'prop-types';
import {PopupModal} from '~sitings~/helpers';

const ConfirmDialog = ({onConfirm, userActionData, onCancel, children}) => (
    <PopupModal title="Confirm action"
                onOK={() => onConfirm(userActionData)}
                onModalHide={onCancel}>
        {children}
    </PopupModal>
);

ConfirmDialog.propTypes = {
    userActionData: PropTypes.oneOfType([
        PropTypes.shape({
            itemName: PropTypes.string,
            itemType: PropTypes.string
        })
    ]),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

const ConfirmDeleteDialog = (props) => (
    <ConfirmDialog {...props}>
        <p>Are you sure wish to delete {props.userActionData.itemType} <b>{props.userActionData.itemName}</b>?</p>
    </ConfirmDialog>
);

ConfirmDeleteDialog.propTypes = {
    userActionData: PropTypes.oneOfType([
        PropTypes.shape({
            itemName: PropTypes.string.isRequired,
            itemType: PropTypes.string
        })
    ]),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};


export {ConfirmDeleteDialog};