import React from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import PropTypes from "prop-types";

const FeatureItem = ({
    id: notificationId,
    title,
    created_at,
    sent_timestamp,
    companies,
    removeNotification,
    sendNotification,
}) => (
    <tr>
        <td>{title}</td>
        <td>{moment.unix(created_at).format("YYYY-MM-DD HH:mm")}</td>
        <td>
            {
                parseInt(sent_timestamp) !== 0
                    ? moment.unix(sent_timestamp).format("YYYY-MM-DD HH:mm")
                    : 'Not yet sent'
            }
        </td>
        <td>
            <ul className="notification-companies">
                {companies.map((company) => (
                    <li key={company.id}>
                        {company.name}
                    </li>
                ))}
            </ul>
        </td>
        <td className="actions">
            <Link to={`/landspot/notifications/features/${notificationId}/edit`} className="button transparent">
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

FeatureItem.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    updated_at: PropTypes.string.isRequired,
    companies: PropTypes.array.isRequired,
    removeNotification: PropTypes.func.isRequired,
    sendNotification: PropTypes.func.isRequired,
};

export default FeatureItem;