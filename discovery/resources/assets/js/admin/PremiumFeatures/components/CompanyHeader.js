import React from 'react';

const CompanyHeader = ({name, estateSelected}) => (
    <div className="header">
        {
            <span className="options-header filter-enabled">
                {estateSelected ? 'Developer company' : 'Estates of'}
            </span>
        }
        <span className="options-header">{name}</span>
    </div>
);

export default CompanyHeader;