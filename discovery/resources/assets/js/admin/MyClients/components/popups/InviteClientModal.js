import React from 'react';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isEqual} from 'lodash';

import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/myClients/actions';
import {LoadingSpinner} from '~/helpers';
import {FormRowDropdown} from '~/helpers/FormRow';
import {NiceRadio} from '~/helpers/NiceRadio';

class InviteClientModal extends React.Component {
    static propTypes = {
        loading: PropTypes.bool.isRequired,
        updated: PropTypes.bool,
        isBuilder: PropTypes.bool,
        onCancel: PropTypes.func.isRequired,
        sendInvite: PropTypes.func.isRequired,
        estates: PropTypes.array.isRequired,
        errors: PropTypes.array.isRequired
    };

    static defaultProps = {
        updated: false
    };

    state = {
        form: {
            tos: 0,
            first_name: '',
            last_name: '',
            email: '',
            estate: null
        }
    };

    componentDidUpdate(prevProps) {
        const {
            errors,
            alert: {error, success},
            onCancel,
            updated,
            resetMyClientsMessages
        } = this.props;

        if (errors && errors.length && !isEqual(prevProps.errors, errors)) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>
                        {errorIndex + 1}) {error.message || error}
                    </div>
                )),
                {
                    onClose() {
                        resetMyClientsMessages();
                    }
                }
            );
        }
        if (updated) {
            success('Invite sent!');
            onCancel();
            resetMyClientsMessages();
        }
    }

    onInputChange = data => {
        this.setState({form: {...this.state.form, ...data}});
    };
    onEstateSelectChange = id =>
        this.setState({
            form: {...this.state.form, estate: id}
        });
    onSendInvite = () => {
        const {sendInvite} = this.props;
        sendInvite(this.state.form);
    };

    render() {
        const {loading, onCancel, estates, isBuilder} = this.props;
        const {form} = this.state;
        return (
            <PopupModal
                okButtonTitle={'Send invite'}
                title={'Invite client'}
                onOK={this.onSendInvite}
                dialogClassName={'overflow-unset invite-popup'}
                onModalHide={onCancel}
                okButtonDisabled={form.tos === 0}
            >
                {loading && <LoadingSpinner className={'overlay'}/>}
                <p>
                    <b>This will do the following:</b>
                </p>
                <p>Create account for client on Lotmix.com.au</p>
                <p>
                    Provide them access to your estate and builder information.
                </p>
                <div className="invite-form">
                    <div className="form-rows">
                        <div className="form-row">
                            <label className="left-item">Name: </label>
                            <div className="landspot-input two-inputs">
                                <input
                                    type="text"
                                    autoComplete="off"
                                    onChange={e => {
                                        this.onInputChange({
                                            first_name: e.target.value
                                        });
                                    }}
                                    placeholder="First"
                                    maxLength={50}
                                    value={form.first_name || ''}
                                />
                                <input
                                    type="text"
                                    autoComplete="off"
                                    onChange={e => {
                                        this.onInputChange({
                                            last_name: e.target.value
                                        });
                                    }}
                                    placeholder="Last"
                                    maxLength={50}
                                    value={form.last_name || ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <label className="left-item">Email: </label>
                            <div className="landspot-input">
                                <input
                                    type="text"
                                    autoComplete="off"
                                    onChange={e => {
                                        this.onInputChange({
                                            email: e.target.value
                                        });
                                    }}
                                    placeholder="Email"
                                    maxLength={150}
                                    value={form.email || ''}
                                />
                            </div>
                        </div>
                        {/*<div className="form-row">*/}
                        {/*    <label className="left-item">Phone Number: </label>*/}
                        {/*    <div className="landspot-input input-group">*/}
                        {/*        <div className="input-group-addon">+61</div>*/}
                        {/*        <input*/}
                        {/*            style={{width: '100%'}}*/}
                        {/*            type="text"*/}
                        {/*            autoComplete="off"*/}
                        {/*            onChange={e => {*/}
                        {/*                this.onInputChange({*/}
                        {/*                    phone: `${e.target.value.replace(/[^0-9]/g, '')}`*/}
                        {/*                });*/}
                        {/*            }}*/}
                        {/*            placeholder="Phone Number"*/}
                        {/*            maxLength={20}*/}
                        {/*            minLength={6}*/}
                        {/*            value={form.phone || ''}*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        {!isBuilder && (
                            <FormRowDropdown
                                defaultItem={form.estate ? null : 'Estate'}
                                defaultValue={0}
                                itemClass="invite-client-dropdown"
                                label="Estate:"
                                items={estates.map(item => ({
                                    text: item.name,
                                    value: item.id
                                }))}
                                onChange={this.onEstateSelectChange}
                                value={form.estate}
                            />
                        )}

                        <div className="form-row">
                            <div className="landconnect-input">
                                <NiceRadio
                                    name={`range-radio-${form.tos}`}
                                    value={form.tos}
                                    checked={String(form.tos) === '1'}
                                    label={
                                        'The client is aware the above information is used to invite them to Lotmix.com.au.'
                                    }
                                    onChange={tos => {
                                        this.onInputChange({
                                            tos: parseInt(tos) === 0 ? 1 : 0
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            estates: state.myClients.estates,
            loading: state.myClients.loading,
            errors: state.myClients.errors,
            updated: state.myClients.updated
        }),
        actions
    )(InviteClientModal)
);
