import React, {Component} from 'react';
import {connect} from 'react-redux';
import Pagination from 'react-js-pagination';
import {Link} from 'react-router-dom';
import {withAlert} from 'react-alert';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import FeatureItem from './FeatureItem';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';
import * as actions from '../store/Features/actions';
import store from '../store/index';

class FeaturesTable extends Component {
    static propTypes = {
        fetchFeatureNotifications: PropTypes.func.isRequired,
        removeFeatureNotification: PropTypes.func.isRequired,
        sendFeatureNotification: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false,
            showConfirmDialog: false,
            notificationId: null,
            locationKey: null
        };
    }

    filterChangeHandler = (query) => {
        const {history, location} = this.props;
        const url = `${location.pathname}?${query}`;

        history.push(url);
    };

    onPageSelect = (page) => {
        const newQuery = queryString.stringify({page});
        this.filterChangeHandler(newQuery);
    };

    componentDidMount() {
        const {location: {key: locationKey, search}, fetchFeatureNotifications} = this.props;

        const parsed = queryString.parse(search);

        fetchFeatureNotifications(parsed.page ? {page: parsed.page} : null);

        this.setState({locationKey});
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        const {locationKey} = this.state;
        const {location: {search}, fetchFeatureNotifications} = this.props;

        if (prevState.locationKey !== locationKey) {
            fetchFeatureNotifications(queryString.parse(search));
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {featureNotificationMessage: message, alert: {show}, location: {key: locationKey = ''}} = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (message && message !== null) {
            show(
                message,
                {
                    type: 'success',
                }
            );

            store.dispatch({type: 'RESET_MESSAGE'});

            newState.preloader = false;
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    removeNotification = (notificationId) => {
        this.props.removeFeatureNotification({...notificationId.notificationId});
        this.setState({
            preloader: true
        });
    };

    sendNotification = (notificationId) => {
        this.props.sendFeatureNotification({notificationId});
        this.setState({
            preloader: true
        });
    };

    onRemove = (showConfirmDialog, notificationId) => {
        this.setState({showConfirmDialog, notificationId});
    };

    removeHandler = (remove) => {
        this.setState({
            showConfirmDialog: false
        });

        if (remove) {
            const {notificationId} = this.state;
            this.removeNotification({notificationId});
        }
    };

    render() {
        const {featureNotifications} = this.props;
        const {showConfirmDialog, notificationId} = this.state;

        return (
            <React.Fragment>
                <header className="notification-header">
                    Feature notifications

                    <div>
                        <Link to="/landspot/notifications/features/create" className="button default">
                            <i className="landspot-icon plus"></i> Add
                        </Link>
                    </div>
                </header>

                {this.state.preloader && <LoadingSpinner className={'overlay'}/>}

                {featureNotifications !== null
                    ? <React.Fragment>
                        {showConfirmDialog &&
                        <ConfirmDeleteDialog
                            onConfirm={this.removeHandler}
                            userActionData={{itemName: 'this notification', notificationId}}
                            onCancel={() => {
                                this.removeHandler(false);
                            }}
                        />
                        }
                        <table className="table">
                            <thead>
                            <tr>
                                <th>TITLE</th>
                                <th>CREATED AT</th>
                                <th>SENT AT</th>
                                <th className="companies">COMPANIES</th>
                                <th>ACTION</th>
                            </tr>
                            </thead>
                            <tbody>
                            {featureNotifications.data.length !== 0
                                ? featureNotifications.data.map(
                                    notification => <FeatureItem
                                        key={notification.id}
                                        {...notification}
                                        removeNotification={this.onRemove}
                                        sendNotification={this.sendNotification}
                                    />
                                )
                                : <tr>
                                    <td colSpan={5}>No feature notifications found!</td>
                                </tr>}
                            </tbody>
                        </table>
                        <Pagination
                            totalItemsCount={featureNotifications.total}
                            activePage={featureNotifications.current_page}
                            itemsCountPerPage={featureNotifications.per_page}
                            hideDisabled={true}
                            onChange={this.onPageSelect}
                        />
                    </React.Fragment>
                    : <LoadingSpinner className={'overlay'}/>}
            </React.Fragment>
        );
    }
}

export default withAlert(connect((state) => ({
    featureNotifications: state.notifications.featureNotifications,
    featureNotificationMessage: state.notifications.message,
}), actions)(FeaturesTable));