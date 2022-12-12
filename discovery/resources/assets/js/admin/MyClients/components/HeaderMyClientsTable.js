import React from 'react';
import PropTypes from 'prop-types';

const HeaderMyClientsTable = ({isBuilder, chasLotmix, allSitings}) => (
    <thead>
    <tr>
        {allSitings && (
            <th title='CONSULTANT' colSpan='2'>
                CONSULTANT
            </th>
        )}
        <th title="First Name" colSpan="2">
            FIRST NAME.
        </th>
        <th title="Last Name" colSpan="2">
            LAST NAME
        </th>
        {!isBuilder && (
            <th title="Estates" colSpan="2">
                ESTATES
            </th>
        )}
        {isBuilder &&
        <th title="details" colSpan="2">
            DETAILS
        </th>
        }
        {!isBuilder && chasLotmix &&
        <th title="Short List" colSpan="2">
            SHORT LIST
        </th>
        }
        {chasLotmix &&

        <th title="Invite Status" colSpan="2">
            TYPE
        </th>

        }
        {isBuilder && (
            <th title="Access">
                ACCESS
            </th>
        )}
        <th title="Action">ACTION</th>
    </tr>
    </thead>
);

HeaderMyClientsTable.propTypes = {
    isBuilder: PropTypes.bool.isRequired,
    chasLotmix: PropTypes.bool.isRequired,
    allSitings: PropTypes.bool
};

export default HeaderMyClientsTable;
