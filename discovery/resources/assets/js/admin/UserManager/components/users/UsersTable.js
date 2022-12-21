import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import EditableRow from './user-row/EditableRow';
import StaticRow from './user-row/StaticRow';
import * as actions from '../../store/users/actions';
import HeaderCellsList from './HeaderCellsList';
import UserAction from './consts';

class UsersTable extends Component {
    static propTypes = {
        users: PropTypes.array.isRequired,
        companyState: PropTypes.shape({
            errors: PropTypes.object,
            userAction: PropTypes.symbol
        }).isRequired,
        company: PropTypes.object.isRequired,

        onUserEdit: PropTypes.func.isRequired,
        saveUserHandler: PropTypes.func.isRequired,
        onUserInputChange: PropTypes.func.isRequired,
        setUserAction: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        supportRequest: PropTypes.func.isRequired,
        closeAccess: PropTypes.func.isRequired,
        isGlobalAdmin: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    statesList = () => {
        const {states} = this.props;
        return states.map(
            state => ({value: state.id, text: state.name})
        );
    };

    salesLocationsList = () => {
        const {
            company: {sales_location: locations}
        } = this.props;

        return locations.map(
            location => ({value: location.id, text: location.name})
        );
    };

    userRolesList = () => {
        const {userRoles} = this.props;
        return Object.keys(userRoles).map(
            key => ({value: key, text: userRoles[key]})
        );
    };

    userDiscoveryLevelsList = () => {
        const {userDiscoveryLevels} = this.props;
        return Object.keys(userDiscoveryLevels).map(
            key => ({value: key, text: userDiscoveryLevels[key]})
        );
    };

    isBuilder = () => {
        const {company} = this.props;

        return company.type === 'builder';
    };

    hasFootprints = () => {
        const {company} = this.props;

        if (company.type === 'builder' && company.hasFootprints) {
            return true;
        }

        return false;
    };

    render() {
        const {
            errors,
        } = this.props.companyState;

        const {
            users, onUserEdit, saveUserHandler, onUserInputChange,
            setUserAction, userActionData, onRemove, onRestore, isGlobalAdmin,
            supportRequest, closeAccess, company: {sales_location: salesLocations, isLandconnect},
            userRoles, userDiscoveryLevels, userAction, manager: {isBuilderAdmin}
        } = this.props;

        let {editableUserItem, editableUserData} = userActionData ? userActionData : {};

        const staticColumnsCount = this.isBuilder()
            ? (isGlobalAdmin ? this.hasFootprints() ? 5 : 4 : 1)
            : (isGlobalAdmin ? 4 : 2);

        //name2 email2/phone, usermanager, discoverymanager, edit
        const totalColumns = 7 + staticColumnsCount;

        const editableUserIndex = editableUserItem ? editableUserItem.userIndex : null;

        return (
            <div className="responsive-table full-height">
                <table className="table users fixed">
                    <HeaderCellsList
                        isBuilder={this.isBuilder}
                        isGlobalAdmin={isGlobalAdmin}
                        isBuilderAdmin={isBuilderAdmin}
                    />

                    <tbody>
                    {
                        (userAction === UserAction.ADD_USER) &&
                        <EditableRow
                            onUserInputChange={onUserInputChange}
                            editableUserData={editableUserData}
                            saveUserHandler={saveUserHandler}
                            errors={errors}
                            isGlobalAdmin={isGlobalAdmin}
                            isBuilderAdmin={isBuilderAdmin}
                            statesList={this.statesList}
                            salesLocationsList={this.salesLocationsList}
                            userRolesList={this.userRolesList}
                            isBuilder={this.isBuilder}
                            userAction={userAction}
                        />
                    }
                    {
                        users.map((user, userIndex) => {
                            const userId = user.id;
                            return (
                                userAction === UserAction.EDIT_USER &&
                                editableUserIndex === userIndex
                            )
                                ? <EditableRow key={userIndex}
                                               onUserInputChange={onUserInputChange}
                                               errors={errors}
                                               editableUserData={editableUserData}
                                               saveUserHandler={saveUserHandler}
                                               userId={userId}
                                               isGlobalAdmin={isGlobalAdmin}
                                               isBuilderAdmin={isBuilderAdmin}
                                               statesList={this.statesList}
                                               salesLocationsList={this.salesLocationsList}
                                               userRolesList={this.userRolesList}
                                               isBuilder={this.isBuilder}
                                />
                                : (
                                    <StaticRow key={userIndex}
                                               user={user}
                                               userIndex={userIndex}
                                               onUserEdit={onUserEdit}
                                               setUserAction={setUserAction}
                                               isGlobalAdmin={isGlobalAdmin}
                                               isBuilderAdmin={isBuilderAdmin}
                                               toggleDeleteUser={() => onRemove('user', userId, users[userIndex])}
                                               toggleRestoreUser={() => onRestore('user', userId, users[userIndex])}
                                               editUserAccess={() => setUserAction(
                                                   UserAction.EDIT_USER_ACCESS,
                                                   {
                                                       isGlobalAdmin,
                                                       isBuilderAdmin,
                                                       onUserInputChange,
                                                       saveUserHandler,
                                                       isLandconnect,
                                                       isBuilder: this.isBuilder,
                                                       hasFootprints: this.hasFootprints,
                                                       userDiscoveryLevelsList: this.userDiscoveryLevelsList,
                                                       editableUserData: {...user},
                                                       editableUserItem: {userIndex}
                                                   }
                                               )}
                                               isBuilder={this.isBuilder}
                                               hasFootprints={this.hasFootprints}
                                               supportRequest={supportRequest}
                                               closeAccess={closeAccess}
                                               salesLocations={salesLocations}
                                               userRoles={userRoles}
                                               userDiscoveryLevels={userDiscoveryLevels}
                                    />
                                );
                        })
                    }
                    {
                        users.length === 0 && <tr>
                            <td colSpan={totalColumns}>No users found</td>
                        </tr>
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default connect((state => ({
    manager: state.catalogue.user,
    userRoles: state.users.userRoles,
    userDiscoveryLevels: state.users.userDiscoveryLevels,
})), actions)(UsersTable);