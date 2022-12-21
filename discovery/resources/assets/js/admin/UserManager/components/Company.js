import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {withRouter} from 'react-router-dom';
import {isEqual} from 'lodash';
import UsersTable from './users/UsersTable';
import DialogList from './popups/DialogList';
import {LoadingSpinner, validateEmail} from '~/helpers';
import UserAction from './users/consts';
import * as actions from '../store/users/actions';
import store from '../store/index';
import UsersTableHeader from './users/UsersTableHeader';


class Company extends Component {
    static componentUrl = '/landspot/user-manager/company/:companyID';
    static propTypes = {
        getUsers: PropTypes.func.isRequired,
        removeUser: PropTypes.func.isRequired,
        addUser: PropTypes.func.isRequired,
        updateUser: PropTypes.func.isRequired,
        sendSupportRequest: PropTypes.func.isRequired,
        closeAccessRequest: PropTypes.func.isRequired,
        resetUser2FA: PropTypes.func.isRequired,
        sendResetPasswordLink: PropTypes.func.isRequired,
        updateCompany: PropTypes.func.isRequired,
        getSelectedFilters: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.companyID = props.match.params.companyID;
        this.state = {
            userAction: null,
            locationKey: null,
            errors: {},
            preloader: true,
            userActionData: null
        };
    }

    componentDidMount() {
        let {
            location: {key: locationKey = null},
        } = this.props;

        this.setState({locationKey});

        this.requestUsersHandler();
    }

    componentWillUnmount() {
        store.dispatch({type: 'RESET_USERS_STATE'});
    }

    componentDidUpdate(prevProps, prevState) {
        const {locationKey} = this.state;

        const {errors: propsErrors, alert} = this.props;

        const {alert: {error}} = this.props;

        if (propsErrors && propsErrors.length) {
            error(propsErrors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));

            store.dispatch({type: 'RESET_NOTIFICATION_MESSAGES'});


            const errors = {};
            Object.keys(propsErrors).map(
                error => {
                    const key = error.replace(/columnValues\./gi, '');
                    errors[key] = true;
                }
            );
            this.setState({errors, preloader: false});
        }

        if (prevState.locationKey !== locationKey) {
            this.requestUsersHandler();
        }

        const {message} = this.props.popupMessage;

        if (message && message.success) {
            alert.success(message.success);
            store.dispatch({type: 'RESET_MESSAGE'});
            this.setUserAction(null);
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {
            USERS_UPDATED,
            location: {key: locationKey = ''}
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (USERS_UPDATED) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_USERS_UPDATED'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    requestUsersHandler = () => {
        let {
            getSelectedFilters
        } = this.props;

        const filters = getSelectedFilters();
        filters.filterUsers = 1;

        this.props.getUsers({id: this.companyID}, filters);
        this.setState({preloader: true});
    };

    onUserEdit = (userIndex) => {
        const user = this.props.users[userIndex];

        this.setUserAction(
            UserAction.EDIT_USER,
            {
                editableUserItem: {userIndex},
                editableUserData: Object.assign({password: ''}, user)
            },
            true
        );
        this.setState({errors: {}});
    };

    onRemove = (itemType, itemId, user) => {
        const itemName = 'User ' + user['display_name'];
        this.setUserAction(UserAction.CONFIRM_REMOVE_ITEM, {itemType, itemId, itemName});
    };

    onRestore = (itemType, itemId, user) => {
        const itemName = 'User ' + user['display_name'];
        this.setUserAction(UserAction.CONFIRM_RESTORE_ITEM, {itemType, itemId, itemName});
    };

    removeHandler = (data) => {
        const {removeUser} = this.props;
        const filters = this.getSelectedFilters();

        const itemId = data.itemId;

        removeUser({filters}, {id: itemId});

        this.setUserAction(null);
        this.setState({preloader: true});
    };

    restoreHandler = (data) => {
        const {restoreUser} = this.props;
        const filters = this.getSelectedFilters();

        const itemId = data.itemId;

        restoreUser({filters}, {id: itemId});

        this.setUserAction(null);
        this.setState({preloader: true});
    };

    onUserInputChange = (data) => {
        const {userActionData} = this.state;

        userActionData.editableUserData = {
            ...userActionData.editableUserData, ...data
        };

        this.setState({userActionData, errors: {}});
    };

    toggleDisplayNewUser = () => {
        let beginAddNewUser = this.state.userAction !== UserAction.ADD_USER;

        if (beginAddNewUser) {
            this.setUserAction(UserAction.ADD_USER, {
                editableUserItem: {userIndex: null},
                editableUserData: {role: ''},
            }, true);
        } else {
            this.setUserAction(null, null, true);
        }
        this.setState({errors: {}});
    };

    validateAction(values, userIndex) {
        let errors = {};
        const columns = ['display_name', 'email', 'state_id', 'password'];
        const {
            manager: {isGlobalAdmin = false}
        } = this.props;

        columns.forEach((column, index) => {
            const value = values[column];
            if (column === 'password') {
                if (value && (value.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value))) {
                    errors[column] = {
                        message: 'Password must contain minimum eight characters, at least one number character and both uppercase and lowercase letters.',
                    };
                }
                return;
            }
            if (userIndex) {
                const user = this.props.users[userIndex];
                if ((!value && user[index] === null) || value === '') {
                    errors[column] = {
                        message: `${column.replace(/(_id*)|(_)/i, ' ')} required`,
                    };
                } else if (index === 2 && parseInt(value) === 0) {
                    errors[column] = {
                        message: `${column.replace(/(_id*)|(_)/i, ' ')} required`,
                    };
                } else if (column === 'email' && value && !validateEmail(value)) {
                    errors[column] = {
                        message: `${value} is not a valid email.`,
                    };
                }
            } else {
                if (!value) {
                    if (!isGlobalAdmin && index === 2) {
                        return;
                    } else {
                        errors[column] = {
                            message: `${column.replace(/(_id*)|(_)/i, ' ')} required`,
                        };
                    }
                } else if (index === 2 && parseInt(value) === 0) {
                    errors[column] = {
                        message: `${column.replace(/(_id*)|(_)/i, ' ')} required`,
                    };
                } else if (column === 'email' && value && !validateEmail(value)) {
                    errors[column] = {
                        message: `${value} is not a valid email.`,
                    };
                }
            }
        });

        if (Object.keys(errors).length !== 0) {
            this.showErrors(errors);
            this.setState({errors});
            return false;
        } else {
            this.setState({errors});
            return true;
        }
    }

    showErrors = (propsErrors) => {
        const {
            alert: {error},
        } = this.props;

        let errors = [];
        typeof propsErrors === 'object'
            ? Object.keys(propsErrors).forEach((error, i) => {
                const column = propsErrors[error];
                errors[i] = {
                    message: `${column.message || column}`,
                };
            })
            : errors.push(propsErrors);


        if (errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
        }

        store.dispatch({type: 'RESET_NOTIFICATION_MESSAGES'});
    };

    saveUserHandler = (userId) => {
        const {addUser, updateUser, users} = this.props;
        const {userActionData, editableUserData} = this.state;

        const filters = this.getSelectedFilters();
        const columnValues = userActionData.editableUserData;

        if (userId) {
            const userIndex = userActionData.editableUserItem.userIndex;
            const user = Object.assign({}, users[userIndex], editableUserData);

            if (this.validateAction(columnValues, userIndex)) {
                if (Object.keys(columnValues).length !== 0 && !isEqual(columnValues, user)) {
                    updateUser({columnValues, filters}, {id: userId});
                    this.setState({preloader: true});
                } else {
                    this.setUserAction(null);
                }
            }
        } else {
            if (this.validateAction(columnValues)) {
                addUser({columnValues, filters});
                this.setState({preloader: true});
            }
        }
    };

    setUserAction = (action, actionData, noActionToggle) => {
        const vals = Object.keys(UserAction).map(function (key) {
            return UserAction[key];
        });

        if (action && vals.indexOf(action) === -1) {
            throw 'action not found';
        }

        const actionChanged = action !== this.state.userAction ||
            (actionData != null && !isEqual(actionData, this.state.userActionData));

        if (actionChanged) {
            this.setState({
                userAction: action,
                userActionData: actionData || null
            });
        } else if (!noActionToggle) {
            this.setState({
                userAction: null,
                userActionData: null
            });
            action = null;
        }
    };

    supportRequest = (userId) => {
        const {sendSupportRequest} = this.props;
        const filters = this.getSelectedFilters();

        sendSupportRequest({filters}, {id: userId});

        this.setState({preloader: true});
    };

    closeAccess = (userId) => {
        const {closeAccessRequest} = this.props;
        const filters = this.getSelectedFilters();

        closeAccessRequest({filters}, {id: userId});

        this.setState({preloader: true});
    };

    resetUser2FA = (user) => {
        const {resetUser2FA} = this.props;
        const filters = this.getSelectedFilters();
        resetUser2FA({filters}, user);

        this.setState({preloader: true});
    };

    getSelectedFilters = () => {
        const {getSelectedFilters} = this.props;
        const company_id = this.companyID;
        const selectedFilters = getSelectedFilters();

        return Object.assign({}, selectedFilters, {company_id});
    };

    updateCompany = (data) => {
        const {company, updateCompany} = this.props;

        updateCompany(data, company);
    };

    render() {
        const {users, company, states, manager: {isGlobalAdmin = false}} = this.props;
        const {userActionData, userAction, preloader} = this.state;
        return (
            <React.Fragment>
                <DialogList
                    userAction={userAction}
                    userActionData={userActionData}
                    removeHandler={this.removeHandler}
                    restoreHandler={this.restoreHandler}
                    setUserAction={this.setUserAction}
                    sendResetPasswordLink={this.props.sendResetPasswordLink}
                    resetUser2FA={this.resetUser2FA}
                />
                {company === null
                    ? <LoadingSpinner className={'overlay'}/>
                    : <React.Fragment>
                        <UsersTableHeader
                            company={company}
                            addNewUserBtnActive={
                                (userAction === UserAction.ADD_USER)
                            }
                            toggleDisplayNewUser={() => this.toggleDisplayNewUser()}
                            isGlobalAdmin={isGlobalAdmin}
                            openCompanyLogosDialog={() => this.setUserAction(UserAction.OPEN_COMPANY_LOGOS_DIALOGUE, {company})}
                            openSalesLocationDialog={() => this.setUserAction(UserAction.OPEN_SALES_LOCATION_DIALOGUE, {company})}
                            openLotmixVisibilityDialog={() => this.setUserAction(UserAction.OPEN_LOTMIX_VISIBILITY_DIALOGUE, {company})}
                            updateCompany={data => this.updateCompany(data)}
                        />
                        <UsersTable
                            company={company}
                            users={users}
                            states={states}
                            userActionData={userActionData}
                            userAction={userAction}
                            companyState={this.state}
                            onUserEdit={this.onUserEdit}
                            onUserInputChange={this.onUserInputChange}
                            onRemove={this.onRemove}
                            onRestore={this.onRestore}
                            saveUserHandler={this.saveUserHandler}
                            setUserAction={this.setUserAction}
                            isGlobalAdmin={isGlobalAdmin}
                            supportRequest={this.supportRequest}
                            closeAccess={this.closeAccess}
                        />
                        {preloader && <LoadingSpinner className={'overlay'}/>}
                    </React.Fragment>
                }
            </React.Fragment>
        );
    }
}

const CompanyInstance = withAlert(withRouter(connect((state) => ({
    users: state.users.users,
    states: state.users.states,
    company: state.users.company,
    USERS_UPDATED: state.users.USERS_UPDATED,
    errors: state.users.errors,
    popupMessage: state.popupMessage,
    manager: state.catalogue.user
}), actions)(Company)));

export {CompanyInstance, Company};