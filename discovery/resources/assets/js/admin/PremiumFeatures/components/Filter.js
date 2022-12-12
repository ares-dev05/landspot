import PropTypes from 'prop-types';
import React from 'react';
import {clickHandler} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';

const Filter = ({onFilterChange, companies, estates, selectedCompany, resetFilter, estateId}) => {
    return (
        <React.Fragment>
            <header>Manage Premium Features</header>
            <div className="filter-bar">
                <div className="filter-form">
                    <div className="landspot-input magnify">
                        <NiceDropdown onChange={companyID => onFilterChange({companyID})}
                                      defaultItem='Please select a developer company'
                                      value={selectedCompany}
                                      items={companies.map(company => ({text: company.name, value: company.id}))}
                        />
                    </div>

                    <div className="first-row">
                        <span className="filters-header">Refine by</span>

                        <a href="#" onClick={(e) => {
                            clickHandler(e, resetFilter);
                        }} className="clear-filters">Clear all</a>
                    </div>
                    <div className='form-rows'>
                        {
                            selectedCompany && estates &&
                            <div className="form-row">
                                <label className="left-item">Estate</label>
                                <NiceDropdown
                                    itemClass='right-item'
                                    defaultValue={null}
                                    items={
                                        estates.map(estate => ({
                                            text: estate.name,
                                            value: estate.id
                                        }))
                                    }
                                    onChange={estateId => onFilterChange({companyID: selectedCompany, estateId})}
                                    value={estateId}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

Filter.propTypes = {
    selectedCompany: PropTypes.string,
    estateId: PropTypes.string,
    companies: PropTypes.array.isRequired,
    estates: PropTypes.array,
    resetFilter: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default Filter;