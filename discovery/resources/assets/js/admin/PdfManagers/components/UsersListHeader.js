import React from 'react';
import PropTypes from 'prop-types';
import {clickHandler} from '~/helpers';

const UsersListHeader = ({currentFilters, selectedCompany, backToResults, isGlobalAdmin}) => {

    const filters = currentFilters();
    let activeFilters = [];
    filters.forEach((item, index) => {
        activeFilters.push(<span key={index} className="options-header">{item.value}</span>);
    });

    if (activeFilters.length) {
        activeFilters.unshift(<span key={'search-results'} className="options-header filter-enabled">Search result for</span>);
    }

    return (
        <div className="header">
            {activeFilters}

            {selectedCompany && isGlobalAdmin &&
            <React.Fragment>
                <span className='options-header filter-enabled'>Builder company</span>
                <span className='options-header'>{selectedCompany.name}</span>
                <a className="back-nav" href="#" onClick={(e) => clickHandler(e, backToResults)}>
                    <i className="landspot-icon arrow-left"/>
                    <span>Back to Companies List</span>
                </a>
            </React.Fragment>
            }
        </div>
    );
};

UsersListHeader.propTypes = {
    selectedCompany: PropTypes.oneOfType([
        PropTypes.object
    ]),
    currentFilters: PropTypes.func.isRequired,
    backToResults: PropTypes.func.isRequired,
    isGlobalAdmin: PropTypes.bool
};

export default UsersListHeader;