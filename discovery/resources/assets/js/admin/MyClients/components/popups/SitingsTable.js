import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

const dateFormat = unix =>
    moment
        .unix(unix)
        .local()
        .format('MM/DD/YY');

const nameFormat = (first, last) => {
    const pieces = [];
    if (first && first.length) {
        pieces.push(first);
    }
    if (last && last.length) {
        pieces.push(last);
    }
    return pieces.length ? pieces.join(' ') : '—';
};

const SitingsTable = ({sitings, importSiting, searchTerm}) => {

    const searchFunc = (item) => {
        if (!item || !searchTerm || !searchTerm.length) {
            return true;
        }

        // Search in all the Siting keys
        return Object.keys(item).map(key => item[key])
            .join('').toLowerCase()
            .search(searchTerm.toLowerCase()) >= 0;
    };

    return (
        <Fragment>
            <table className="table">
                <thead>
                <tr>
                    <th title="Date" colSpan="2">
                        DATE
                    </th>
                    <th title="Client" colSpan="2">
                        CLIENT
                    </th>
                    <th title="Floorplan" colSpan="2">
                        FLOORPLAN
                    </th>
                    <th title="Facade" colSpan="2">
                        FACADE
                    </th>
                    <th title="Options" colSpan="2">
                        OPTIONS
                    </th>
                    <th title="Lot no" colSpan="2">
                        LOT NO.
                    </th>
                    <th title="Street" colSpan="2">
                        STREET
                    </th>
                    <th title="Action">ACTION</th>
                </tr>
                </thead>
                <tbody>
                {sitings.length ? (
                    sitings.filter(searchFunc).map(siting => (
                            <tr key={siting.id}>
                                <td colSpan="2">
                                    {dateFormat(siting.updated_at)}
                                </td>
                                <td colSpan="2">
                                    {nameFormat(siting.first_name, siting.last_name)}
                                </td>
                                <td colSpan="2">{siting.house || '—'}</td>
                                <td colSpan="2">{siting.facade || '—'}</td>
                                <td colSpan="2">{siting.options || '—'}</td>
                                <td colSpan="2">{siting.lot_number || '—'}</td>
                                <td colSpan="2">{siting.street || '—'}</td>
                                <td className="actions">
                                    <a onClick={() => importSiting({importId: siting.id})}>
                                        <i className="landspot-icon pen"/>
                                        Import
                                    </a>
                                </td>
                            </tr>
                        )
                    )
                ) : (
                    <tr>
                        <td className="my-clients-table_one-cell">
                            Table is empty
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </Fragment>
    );
};

SitingsTable.propTypes = {
    sitings: PropTypes.array.isRequired,
    importSiting: PropTypes.func,
    onSetUserAction: PropTypes.func,
    searchTerm: PropTypes.string
};
SitingsTable.defaultProps = {
    searchTerm: '',
    importSiting: () => {
    },
    onSetUserAction: () => {
    }
};

export default SitingsTable;
