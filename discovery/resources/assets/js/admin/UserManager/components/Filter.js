import React from 'react';
import {NiceCheckbox, clickHandler} from '~/helpers';
import PropTypes from 'prop-types';

const Filter = ({onFilterChange, selectedFilters, selectedCompany, resetFilter}) => {
    const checkCompany = () => {
        if (selectedCompany === null) {
            return true;
        } else if (selectedCompany.type === 'builder') {
            return false;
        } else {
            return true;
        }
    };

    return (
        <React.Fragment>
            <header>Manage Users</header>
            <div className="filter-bar">
                <div className="filter-form">
                    <div className="landspot-input magnify">
                        <input type="text"
                               placeholder="Search users"
                               value={selectedFilters.name}
                               autoComplete="off"
                               onChange={(e) => onFilterChange({name: e.target.value})}
                        />
                    </div>

                    <div className="first-row">
                        <span className="filters-header">Refine by</span>

                        <a href="#" onClick={(e) => {
                            clickHandler(e, resetFilter);
                        }} className="clear-filters">Clear all</a>
                    </div>

                    {checkCompany() &&
                    <div className="form-rows">
                        <div className="form-row">
                            <div className="filters-checkbox">
                                <NiceCheckbox
                                    checked={parseInt(selectedFilters.userManager) === 1}
                                    label="Users with edit permissions"
                                    name="edit-permissions"
                                    onChange={() => onFilterChange({userManager: parseInt(selectedFilters.userManager) ? 0 : 1})}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="filters-checkbox">
                                <NiceCheckbox
                                    checked={parseInt(selectedFilters.globalEstateManager) === 1}
                                    label="Global managers"
                                    name="global-managers"
                                    onChange={() => onFilterChange({globalEstateManager: parseInt(selectedFilters.globalEstateManager) ? 0 : 1})}
                                />
                            </div>
                        </div>
                    </div>
                    }
                </div>
            </div>
        </React.Fragment>
    );
};

Filter.propTypes = {
    selectedCompany: PropTypes.oneOfType([
        PropTypes.object,
    ]),
    selectedFilters: PropTypes.shape({
        userManager: PropTypes.number,
        globalEstateManager: PropTypes.number,
        name: PropTypes.string,
    }).isRequired,
    resetFilter: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default Filter;