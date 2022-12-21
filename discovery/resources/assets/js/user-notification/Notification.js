import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';

import * as actions from './store/notification/actions';
import store from './store';
import ReactDOM from 'react-dom';

class Notification extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        if (!this.props.user) {
            this.props.getUser();
        }
    }

    componentDidUpdate() {
        const {errors: propsErrors, popupMessage: {message}, alert: {show,error}} = this.props;
        if (propsErrors && propsErrors.length)
        {

          error(propsErrors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));

          this.props.resetMessages();

        }

        if (message && message.success) {
            show(
                message.success,
                {
                    type: 'success',
                }
            );
            store.dispatch({type: 'RESET_MESSAGE'});
        }
    }


    setUserDecision = (type) => {
        const id = this.props.user.id;
        this.props.setUserDecision({type}, {id});
    };

    closeNotification = (id) => {
        this.props.closeNotification({id});
    };

    render() {
        const {closedSupportSession, supportRequest, userNotifications = []} = this.props;
        return (
            <React.Fragment>
                {userNotifications.length
                    ? ReactDOM.createPortal(
                        <React.Fragment>
                            <div className="fullpage-notification">
                                {
                                    userNotifications.map(notification =>
                                        <React.Fragment key={notification.id}>
                                            <div className="content">
                                                <div className="notification-text ql-editor"
                                                    dangerouslySetInnerHTML={{__html: notification.notification.content}}/>
                                                <button type="button"
                                                        onClick={() => this.closeNotification(notification.id)}
                                                        className="button primary">Go Forward
                                                </button>
                                            </div>
                                        </React.Fragment>
                                    )
                                }
                            </div>
                        </React.Fragment>,
                        document.getElementById('fullpage-notification')
                    )
                    : null
                }
                {closedSupportSession &&
                <div className="notification-content">
                    <p>Admin has left your account</p>
                    <div className="notification-btn-group">
                        <button type="button"
                                onClick={() => this.setUserDecision('close')}
                                className="button primary">Ok
                        </button>
                    </div>
                </div>
                }
                {supportRequest
                    ? <div className="notification-content">
                        <p>Grant Support Access</p>
                        <div className="notification-btn-group">
                            <button type="button"
                                    onClick={() => this.setUserDecision('accept')}
                                    className="button primary">Yes
                            </button>
                            <button type="button"
                                    onClick={() => this.setUserDecision('abort')}
                                    className="button default">No
                            </button>
                        </div>
                    </div>
                    : <div/>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.notification.user,
        supportRequest: state.notification.supportRequest,
        closedSupportSession: state.notification.closedSupportSession,
        userNotifications: state.notification.userNotifications,
        popupMessage: state.popupMessage,
        errors: state.notification.errors
    };
};

export default withAlert(connect(mapStateToProps, actions)(Notification));