import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';

import * as actions from './store/notification/actions';
import ReactDOM from 'react-dom';

class LotmixNotification extends Component {
    componentDidMount() {
        this.props.getLotmixNotification();
    }

    render() {
        const {lotmixNotifications, closeLotmixNotification} = this.props;
        return (lotmixNotifications.length
            ? ReactDOM.createPortal(
                <div className="fullpage-notification">
                    {
                        lotmixNotifications.map(({id, lotmix_notification}) =>
                            <div className="content" key={id}>
                                <div className="notification-text ql-editor"
                                     dangerouslySetInnerHTML={{__html: lotmix_notification.content}}/>
                                <button type="button"
                                        onClick={() => closeLotmixNotification({id})}
                                        className="button primary">Go Forward
                                </button>
                            </div>
                        )
                    }
                </div>,
                document.getElementById('fullpage-notification')
            )
            : null);
    }
}

LotmixNotification.propTypes = {
    lotmixNotifications: PropTypes.array.isRequired,
    getLotmixNotification: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {lotmixNotifications: state.notification.lotmixNotifications};
};

export default withAlert(connect(mapStateToProps, actions)(LotmixNotification));