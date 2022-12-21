import React from 'react';
import {clickHandler, NiceCheckbox} from '~/helpers';
import PropTypes from 'prop-types';

const Filter = ({onFilterChange, selectedFilters, resetFilter}) => {
    return (
        <React.Fragment>
            <header>PDF Manager</header>
            <div className="filter-bar">
                <div className="filter-form">
                    <div className="landspot-input magnify">
                        <input type="text"
                               placeholder="Search estates"
                               value={selectedFilters.estateName}
                               autoComplete="off"
                               onChange={(e) => onFilterChange({estateName: e.target.value})}
                        />
                    </div>

                    <div className="first-row">
                        <span className="filters-header">Refine by</span>

                        <a href="#" onClick={(e) => {
                            clickHandler(e, resetFilter);
                        }} className="clear-filters">Clear all</a>
                    </div>

                    <div className="form-rows">
                        <div className="form-row">
                            <NiceCheckbox
                                checked={parseInt(selectedFilters.emptyEstates) === 1}
                                label="Estates with no users"
                                name="global-managers"
                                onChange={() => onFilterChange({emptyEstates: parseInt(selectedFilters.emptyEstates) ? 0 : 1})}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};


Filter.propTypes = {
    selectedFilters: PropTypes.shape({
        emptyEstates: PropTypes.number,
        estateName: PropTypes.string,
        name: PropTypes.string,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired
};

export default Filter;