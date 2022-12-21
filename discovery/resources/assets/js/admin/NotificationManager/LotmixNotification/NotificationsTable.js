import React, {Component} from 'react';
import {connect} from 'react-redux';
import Pagination from 'react-js-pagination';
import {Link} from 'react-router-dom';
import {withAlert} from 'react-alert';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import NotificationItem from './NotificationItem';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';
import * as actions from '../store/LotmixNotification/actions';
import store from '../store/index';

class NotificationsTable extends Component {
    static propTypes = {
        fetchLotmixNotifications: PropTypes.func.isRequired,
        removeLotmixNotification: PropTypes.func.isRequired,
        sendLotmixNotification: PropTypes.func.isRequired,
    };

    state = {
        preloader: false,
        showConfirmDialog: false,
        notificationId: null,
        locationKey: null
    };

    filterChangeHandler = query => {
        const {history, location} = this.props;
        const url = `${location.pathname}?${query}`;

        history.push(url);
    };

    onPageSelect = page => {
        const newQuery = queryString.stringify({page});
        this.filterChangeHandler(newQuery);
    };

    componentDidMount() {
        const {location: {key: locationKey, search}, fetchLotmixNotifications} = this.props;

        const parsed = queryString.parse(search);

        fetchLotmixNotifications(parsed.page ? {page: parsed.page} : null);

        this.setState({locationKey});
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        const {locationKey} = this.state;
        const {location: {search}, fetchLotmixNotifications} = this.props;

        if (prevState.locationKey !== locationKey) {
            fetchLotmixNotifications(queryString.parse(search));
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {lotmixNotificationMessage: message, alert: {show}, location: {key: locationKey = ''}} = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (message) {
            show(
                message,
                {
                    type: 'success',
                }
            );

            store.dispatch({type: 'RESET_LOTMIX_MESSAGE'});

            newState.preloader = false;
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    removeNotification = notificationId => {
        this.props.removeLotmixNotification({...notificationId.notificationId});
        this.setState({
            preloader: true
        });
    };

    sendNotification = notificationId => {
        this.props.sendLotmixNotification({notificationId});
        this.setState({
            preloader: true
        });
    };

    onRemove = (showConfirmDialog, notificationId) => {
        this.setState({showConfirmDialog, notificationId});
    };

    removeHandler = remove => {
        this.setState({
            showConfirmDialog: false
        });

        if (remove) {
            const {notificationId} = this.state;
            this.removeNotification({notificationId});
        }
    };

    render() {
        const {lotmixNotifications} = this.props;
        const {showConfirmDialog, notificationId} = this.state;

        return (
            <React.Fragment>
                <header className="notification-header">
                    Lotmix notifications
                    <div>
                        <Link to="/landspot/notifications/lotmix-notification/create" className="button default">
                            <i className="landspot-icon plus"></i> Add
                        </Link>
                    </div>
                </header>

                {this.state.preloader && <LoadingSpinner className={'overlay'}/>}

                {lotmixNotifications
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
                                <th>ACTION</th>
                            </tr>
                            </thead>
                            <tbody>
                            {lotmixNotifications.data.length !== 0
                                ? lotmixNotifications.data.map(
                                    notification => <NotificationItem
                                        key={notification.id}
                                        {...notification}
                                        removeNotification={this.onRemove}
                                        sendNotification={this.sendNotification}
                                    />
                                )
                                : <tr>
                                    <td colSpan={5}>No lotmix notifications found!</td>
                                </tr>}
                            </tbody>
                        </table>
                        <Pagination
                            totalItemsCount={lotmixNotifications.total}
                            activePage={lotmixNotifications.current_page}
                            itemsCountPerPage={lotmixNotifications.per_page}
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
    lotmixNotifications: state.lotmixNotification.lotmixNotifications,
    lotmixNotificationMessage: state.lotmixNotification.message,
}), actions)(NotificationsTable));