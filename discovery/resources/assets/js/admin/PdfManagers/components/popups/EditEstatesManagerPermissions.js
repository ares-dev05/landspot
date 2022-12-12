import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner, NiceCheckbox} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import store from '../../store';

class EditEstatesManagerPermissions extends Component {
    static propTypes = {
        userActionData: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        savePermissions: PropTypes.func.isRequired,
        users: PropTypes.array.isRequired,
        estates: PropTypes.array.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedManagers: [],
            deletedManagers: [],
            preloader: false
        };
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidMount() {
        const {userActionData: {estateId}, users, estates} = this.props;
        const estate = estates.find(estate => estate.id === estateId);

        const selectedManagers = users.filter(
            user => estate.managers.filter(
                manager => manager.id === user.id
            ).length !== 0
        );

        this.setState({selectedManagers});
    }

    componentDidUpdate() {
        const {
            popupDialog: {message, errors},
            alert: {show, error},
            onCancel
        } = this.props;

        if (errors && errors.length) {
            this.setState({preloader: false});
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }

        if (message && message.success) {
            show(
                message.success,
                {
                    type: 'success',
                }
            );
            onCancel();
        }
    }

    onSelectManager = (action, managerId) => {
        const {users} = this.props;
        let {selectedManagers, deletedManagers} = this.state;

        const user = users.find(user => user.id === managerId);

        switch (action) {
            case 'add': {
                const deletedUser = deletedManagers.find(manager => manager.id === user.id);
                if (deletedUser) {
                    deletedManagers = deletedManagers.filter(manager => manager.id !== deletedUser.id);
                }

                selectedManagers.push(user);
            }
                break;
            case 'remove': {
                const selectedUser = selectedManagers.find(manager => manager.id === user.id);
                if (selectedUser) {
                    deletedManagers = deletedManagers.concat(selectedUser);
                }

                selectedManagers = selectedManagers.filter(manager => manager.id !== user.id);
            }
                break;
        }

        this.setState({selectedManagers, deletedManagers});
    };

    savePermissions = () => {
        const {userActionData: {estateId, companyId}, estates, savePermissions} = this.props;
        const {selectedManagers, deletedManagers}  = this.state;

        const estate = estates.find(estate => estate.id === estateId);

        savePermissions({selectedManagers, deletedManagers, estateId: estate.id, companyId});
        this.setState({preloader: true});
    };

    render() {
        const {selectedManagers, preloader} = this.state;
        const {userActionData: {estateId}, onCancel, users, estates} = this.props;
        const estate = estates.find(estate => estate.id === estateId);
        return (
            <PopupModal dialogClassName={'wide-popup'}
                        topActionButtons={true}
                        okButtonTitle={'Save changes'}
                        title={`Assign PDF Manager to ${estate.name}`}
                        onOK={this.savePermissions}
                        onModalHide={onCancel}
            >
                {estate.id
                    ? <UsersTable users={users}
                                  estate={estate}
                                  selectedManagers={selectedManagers}
                                  onSelectManager={this.onSelectManager}/>
                    : <LoadingSpinner className={'overlay'}/>
                }

                {preloader && <LoadingSpinner className={'overlay'}/>}
            </PopupModal>
        );
    }
}

const UsersTable = ({users, estate, selectedManagers, onSelectManager}) => {
    const availableUsers = users.filter(user => user['state_id'] === estate['state_id']);
    return (
        <React.Fragment>
            <table className="table users modal-table">
                <thead>
                <tr>
                    <th scope="col">
                        USER NAME
                    </th>
                    <th scope="col">
                        PDF MANAGER
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    availableUsers.length
                        ? availableUsers.map(user => {
                            const selected = selectedManagers.find(manager => manager.id === user.id);
                            return <tr key={user.id}>
                                <td className='main-column'>
                                    {user['display_name']}
                                </td>
                                <td className="permissions">
                                    <NiceCheckbox
                                        checkboxClass={selected ? 'selected' : ''}
                                        checked={!!selected}
                                        name={`pdf-manager-permission-${user.id}`}
                                        defaultValue={user.id}
                                        onChange={() => onSelectManager(selected ? 'remove' : 'add', user.id)}
                                    />
                                </td>
                            </tr>;
                        })
                        : <tr>
                            <td colSpan={2}>
                                No users to select
                            </td>
                        </tr>
                }
                </tbody>
            </table>
            <p>If no users are selected, all users from your company will be able to upload packages to this estate</p>
        </React.Fragment>
    );
};

UsersTable.propTypes = {
    users: PropTypes.array.isRequired,
    estate: PropTypes.object.isRequired,
    onSelectManager: PropTypes.func.isRequired,
};

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
        users: state.estate.users,
        estates: state.estate.estates,
    })), actions
)(EditEstatesManagerPermissions));