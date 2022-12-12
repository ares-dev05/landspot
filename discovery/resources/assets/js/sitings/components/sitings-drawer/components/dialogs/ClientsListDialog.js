import React from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';

import {LoadingSpinner, PopupModal} from '~sitings~/helpers';
import {NiceRadio} from '~sitings~/helpers/NiceRadio';
import * as actions from '~sitings~/components/popup-dialog/store/actions';

class ClientsListDialog extends React.Component {
    static propTypes = {
        userActionData: PropTypes.shape({
            siting: PropTypes.object.isRequired,
        }).isRequired,
        onCancel: PropTypes.func.isRequired,
        getClientsList: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
    };

    state = {
        preloader: false,
        selectedClient: null,
        firstName: '',
        lastName: ''
    };

    componentDidMount() {
        const {
            userActionData: {
                siting
            },
            getClientsList
        } = this.props;

        getClientsList(siting);
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    onFilterChange = e => {
        this.setState({
            [e.target.name]: e.target.value.trim().toLowerCase()
        });
    };
    sendInvite = () => {
        const {selectedClient} = this.state;
        if (selectedClient) {
            const {
                userActionData: {
                    clientInviteCallback,
                },
            } = this.props;
            this.setState({preloader: true});
            clientInviteCallback(selectedClient);
        }
    };

    onClientSelect = (selectedClient) => {
        this.setState({selectedClient});
    };

    render() {
        const {
            preloader, selectedClient, firstName, lastName
        } = this.state;

        const {clients} = this.props.popupDialogStore;

        const filteredClients = clients ? clients.filter(client => {
            return (!firstName || client.first_name.toLowerCase().includes(firstName)) &&
                (!lastName || client.last_name.toLowerCase().includes(lastName));
        }) : [];

        if (!clients) return <LoadingSpinner/>;
        return (
            <PopupModal title="Assign to Client"
                        onModalHide={this.props.onCancel}
                        onOK={this.sendInvite}
                        dialogClassName='wide-popup'
                        modalBodyClass='sitings-invite'
                        okButtonTitle={'Save'}
                        okButtonDisabled={!selectedClient}>
                <React.Fragment>
                    {
                        preloader &&
                        <LoadingSpinner className={'overlay'}/>
                    }
                    <div className="form-rows">
                        <p>Filter by:</p>
                        <div className="form-row">
                            <label className="left-item">First Name</label>
                            <div className="left-item landconnect-input">
                                <input type="text"
                                       onChange={this.onFilterChange}
                                       placeholder="First name"
                                       name="firstName"
                                       value={firstName}/>
                            </div>
                            <label className="left-item">Last name</label>
                            <div className="left-item landconnect-input">
                                <input type="text"
                                       onChange={this.onFilterChange}
                                       placeholder="Last name"
                                       name="lastName"
                                       value={lastName}/>
                            </div>
                        </div>
                    </div>
                    <table className="portal-table">
                        <thead>
                        <tr>
                            <th title="Date" colSpan="2">
                                FIRST NAME
                            </th>
                            <th title="Floorplan" colSpan="2">
                                LAST NAME
                            </th>
                            <th title="Action">ACTION</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredClients.length ? (
                            filteredClients.map(
                                client => (
                                    <tr key={client.id}>
                                        <td colSpan="2">{client.first_name}</td>
                                        <td colSpan="2">{client.last_name}</td>
                                        <td className="actions">
                                            <div className='landconnect-input'>
                                                <NiceRadio
                                                    name={`range-radio-${client.id}`}
                                                    value={client.id}
                                                    checked={client.id === (selectedClient ? selectedClient.id : null)}
                                                    label={''}
                                                    onChange={() => this.onClientSelect(client)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td className="my-clients-table_one-cell" colSpan="7">
                                    Table is empty
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialogStore: state.popupDialog,
    })), actions
)(ClientsListDialog));