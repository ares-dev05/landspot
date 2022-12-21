import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';
import {isEmpty, isEqual} from 'lodash';
import * as actions from '../../store/popupDialog/actions';
import store from '../../store';

class EditInvitedUserModal extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        onUpdateMyClientsTable: PropTypes.func.isRequired,
        userActionData: PropTypes.shape({
            id: PropTypes.number.isRequired,
            email: PropTypes.string.isRequired,
            phone: PropTypes.string.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired
        }).isRequired,
        loading: PropTypes.bool.isRequired
    };

    state = {
        editRow: null,
        editableFields: {},
        savedFields: {}
    };

    static tableFields = Object.freeze({
        email: 'EMAIL',
        phone: 'PHONE',
        first_name: 'FIRST NAME',
        last_name: 'LAST NAME'
    });

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidUpdate(prevProps) {
        const {
            errors,
            alert: {error, success},
            onUpdateMyClientsTable,
            onCancel,
            updated
        } = this.props;

        if (errors && errors.length && !isEqual(prevProps.errors, errors)) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>{error.message || error}</div>
                )),
                {
                    onClose() {
                        store.dispatch({type: 'RESET_POPUP_MESSAGES'});
                    }
                }
            );
        }
        if (updated) {
            success('My client info updated!');
            onCancel();
            onUpdateMyClientsTable();
        }
    }

    onSaveChanges = () => {
        const {
            updateMyClient,
            onCancel,
            userActionData,
            alert: {success}
        } = this.props;
        const {savedFields} = this.state;
        if (isEmpty(savedFields)) {
            success('My client info updated!');
            onCancel();
        } else {
            updateMyClient(savedFields, {id: userActionData.id});
        }
    };

    render() {
        const {onCancel, userActionData, loading} = this.props;
        const {editRow, savedFields, editableFields} = this.state;

        return (
            <PopupModal
                dialogClassName={'wide-popup'}
                okButtonTitle={'Save changes'}
                title={`${userActionData.first_name} ${userActionData.last_name} Details`}
                onOK={this.onSaveChanges}
                onModalHide={onCancel}
            >
                {loading && <LoadingSpinner className={'overlay'}/>}
                <table className="table">
                    <tbody>
                    {Object.keys(EditInvitedUserModal.tableFields).map(
                        (key, index) => (
                            <tr key={index}>
                                <td width="45%">
                                    {EditInvitedUserModal.tableFields[key]}
                                </td>
                                <td width="45%" className="landspot-input">
                                    {editRow === index ? (
                                        <input
                                            style={{width: '100%'}}
                                            type="text"
                                            onChange={e => {
                                                let value = e.target.value;
                                                const isPhoneImput = key === 'phone';
                                                if (isPhoneImput) {
                                                    value = (e.target.value = value.replace(/[^0-9]/g, ''));
                                                }
                                                this.setState({
                                                    editableFields: {
                                                        [key]: value
                                                    }
                                                });
                                            }

                                            }
                                            maxLength={
                                                key === 'phone' ? 20 : 50
                                            }
                                            minLength={key === 'phone' ? 6 : null}
                                            defaultValue={
                                                savedFields[key] ||
                                                userActionData[key]
                                            }
                                        />
                                    ) : (
                                        <span className="my-client-theme-text">
                                                {savedFields[key] ||
                                                userActionData[key]}
                                            </span>
                                    )}
                                </td>
                                <td className="actions">
                                    {key !== 'email' &&
                                    (editRow === index ? (
                                        <a
                                            onClick={() =>
                                                this.setState({
                                                    savedFields: {
                                                        ...savedFields,
                                                        ...editableFields
                                                    },
                                                    editRow: null
                                                })
                                            }
                                        >
                                            <i className="fal fa-save"/>
                                        </a>
                                    ) : (
                                        <a
                                            onClick={() =>
                                                this.setState({
                                                    editRow: index,
                                                    editableFields: {}
                                                })
                                            }
                                        >
                                            <i className="landspot-icon pen"/>
                                        </a>
                                    ))}
                                </td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            loading: state.popupDialog.loading,
            errors: state.popupDialog.errors,
            updated: state.popupDialog.updated
        }),
        actions
    )(EditInvitedUserModal)
);
