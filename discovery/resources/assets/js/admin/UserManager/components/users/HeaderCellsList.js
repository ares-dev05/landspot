import React from 'react';
import PropTypes from 'prop-types';

const HeaderCellsList = ({isBuilder, isGlobalAdmin, isBuilderAdmin}) => {
    return (
        <thead>
        <tr>
            <th title="Name" colSpan='2'>
                NAME
            </th>
            <th title="Email" colSpan='2'>
                CONTACT DETAILS
            </th>
            {
                (isGlobalAdmin || isBuilderAdmin) &&
                <th title="Password">
                    PASSWORD
                </th>
            }

            <th title="Group Builder Admins">
                ACCESS
            </th>

            {
                isGlobalAdmin &&
                    <th title="Log In As">
                        LOG IN AS
                    </th>
            }

            {
                (isGlobalAdmin || isBuilderAdmin) &&
                    <th>
                        <div title={'ENABLED'} className='ellipsis'>ENABLED</div>
                    </th>

            }

            {
                AdminHeaderCells(isBuilder).map((item, index) =>
                    <th key={index}>
                        <div title={item} className="ellipsis">{item}</div>
                    </th>)
            }

        </tr>
        </thead>
    );
};

HeaderCellsList.propTypes = {
    isGlobalAdmin: PropTypes.bool.isRequired,
    isBuilder: PropTypes.func.isRequired,
    isBuilderAdmin: PropTypes.bool
};

const AdminHeaderCells = (isBuilder) => {
    return isBuilder() ? ['ACTION'] : ['ESTATE PERMISSIONS', 'ACTION'];
};

AdminHeaderCells.propTypes = {
    isBuilder: PropTypes.func.isRequired
};

export default HeaderCellsList;