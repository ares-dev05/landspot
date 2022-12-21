import React from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';

const NotificationItem = ({
                         id: notificationId,
                         title,
                         created_at,
                         sent_timestamp,
                         removeNotification,
                         sendNotification,
                     }) => (
    <tr>
        <td>{title}</td>
        <td>{moment.unix(created_at).format('YYYY-MM-DD HH:mm')}</td>
        <td>
            {
                parseInt(sent_timestamp) !== 0
                    ? moment.unix(sent_timestamp).format('YYYY-MM-DD HH:mm')
                    : 'Not yet sent'
            }
        </td>
        <td className="actions">
            <Link to={`/landspot/notifications/lotmix-notification/${notificationId}/edit`} className="button transparent">
                <i className="landspot-icon pen" aria-hidden="true"></i>
            </Link>

            <button className="button transparent" type="button"
                    onClick={() => removeNotification(true, {notificationId})}>
                <i className="landspot-icon trash" aria-hidden="true"></i>
            </button>

            <button className="button transparent" type="button" onClick={() => sendNotification(notificationId)}>
                <i className="fal fa-paper-plane"></i>
            </button>
        </td>
    </tr>
);

NotificationItem.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string.isRequired,
    removeNotification: PropTypes.func.isRequired,
    sendNotification: PropTypes.func.isRequired,
};

export default NotificationItem;