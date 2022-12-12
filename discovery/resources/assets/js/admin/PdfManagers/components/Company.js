import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import EstateList from './estate/EstateList';
import DialogList from './popups/DialogList';
import {LoadingSpinner} from '~/helpers';
import UserAction from './estate/consts';
import * as actions from '../store/estate/actions';
import store from '../store';

const queryString = require('query-string');
import {isEqual} from 'lodash';

class Company extends Component {
    static propTypes = {
        estates: PropTypes.array,
        errors: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object
        ]),
        manager: PropTypes.object.isRequired,

        getUsers: PropTypes.func.isRequired,
        removeUser: PropTypes.func.isRequired,
        resetCompanyStore: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.companyID = props.match.params.companyID;
        this.state = {
            userAction: null,
            locationKey: '',
            preloader: false,
            userActionData: null
        };
    }

    componentDidMount() {
        const {key: locationKey, search} = this.props.location;
        this.setState({preloader: true, locationKey});

        const parsed = queryString.parse(search);
        parsed.filterUsers = 1;
        this.requestUsersHandler(parsed);
    }

    componentWillUnmount() {
        this.props.resetCompanyStore();
    }

    componentDidUpdate(prevProps, prevState) {
        const {preloader, locationKey: stateLocationKey} = this.state;
        const {key: locationKey, search} = this.props.location;

        const {
            errors,
            alert: {error}
        } = this.props;

        if (errors && errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_NOTIFICATION_MESSAGES'});
        }


        if ((!stateLocationKey || stateLocationKey !== locationKey) && locationKey) {
            this.setState({locationKey});

            const parsed = queryString.parse(search);
            parsed.filterUsers = 1;
            this.requestUsersHandler(parsed);
        }

        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false});
        }
    }

    requestUsersHandler = (query) => {
        this.props.getUsers({id: this.companyID}, query);
    };

    onRemove = (itemType, itemId, user, estateId) => {
        const itemName = user['display_name'];
        this.setUserAction(UserAction.CONFIRM_REMOVE_ITEM, {itemType, itemId, itemName, estateId});
    };

    removeHandler = (data) => {
        const {selectedFilters, removeUser} = this.props;

        const company_id = this.companyID;
        const filters = Object.assign({}, selectedFilters, {company_id});
        const itemId = data.itemId;
        const estateId = data.estateId;

        removeUser({filters, userId: itemId, estateId}, {id: itemId});

        this.setUserAction(null);
        this.setState({preloader: true});
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

    render() {
        const {userActionData, userAction, preloader} = this.state;
        const {estates} = this.props;
        const companyId = this.companyID;

        return (
            <React.Fragment>
                <DialogList
                    userAction={userAction}
                    userActionData={userActionData}
                    removeHandler={this.removeHandler}
                    setUserAction={this.setUserAction}
                />
                {preloader && <LoadingSpinner className={'overlay'}/>}
                {
                    estates &&
                    <EstateList
                        estates={estates}
                        onUserRemove={this.onRemove}
                        setUserAction={(action, actionData) => this.setUserAction(action, {...actionData, companyId})}
                    />
                }
            </React.Fragment>
        );
    }
}

export default withAlert(withRouter(connect(
    (state => ({
        estates: state.estate.estates,
        errors: state.estate.errors,
        manager: state.catalogue.user
    })), actions
)(Company)));