import PropTypes from 'prop-types';
import React from 'react';
import {clickHandler, formatNumber, NiceCheckbox} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';

const Filter = ({filters, companies, companyID, onFilterChange, selectedFilters, resetFilter}) => {
    return (
        <React.Fragment>
            <header>Discovery</header>
            <div className="filter-bar">
                <div className="filter-form">
                    <div className="first-row">
                        <span className="filters-header">Refine by</span>
                        <a href="#"
                           className="link clear-filters"
                           onClick={e => clickHandler(e, resetFilter)}
                        >Clear all</a>
                    </div>

                    <div className="form-rows">
                        <div className="form-row">
                            <label className="left-item">Builder</label>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem={companyID ? null : 'Show all'}
                                defaultValue={0}
                                items={companies.map(company => ({value: company.id, text: company.name}))}
                                onChange={company_id => onFilterChange({company_id})}
                                value={companyID}
                            />
                        </div>


                        <div className="form-row">
                            <label className="left-item">No. of Beds</label>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem='Show all'
                                defaultValue={0}
                                items={filters.beds.map(value => ({value, text: value ? value : 'Show all'}))}
                                onChange={beds => onFilterChange({beds})}
                                value={selectedFilters.beds}
                            />
                        </div>

                        <div className="form-row">
                            <label className="left-item">No. of Bathrooms</label>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem='Show all'
                                defaultValue={0}
                                items={filters.bathrooms.map(value => ({value, text: value ? value : 'Show all'}))}
                                onChange={bathrooms => onFilterChange({bathrooms})}
                                value={selectedFilters.bathrooms}
                            />
                        </div>


                        {/*<PriceSlider
                            max={filters.price.max}
                            min={filters.price.min}
                            step={1}
                            valueMin={selectedFilters.min !== -Infinity ? selectedFilters.min : 0}
                            valueMax={selectedFilters.max !== Infinity ? selectedFilters.max : 0}
                            onChange={values => onFilterChange({min: parseInt(values[0]), max: parseInt(values[1])})}
                        />*/}

                        <div className="form-row">
                            <label className="left-item">Lot Dimensions</label>

                            <div className="landspot-input two-inputs right-item">
                                <input type="number"
                                       placeholder="Width (m)"
                                       value={selectedFilters.width > 0 ? selectedFilters.width : ''}
                                       onChange={(e) => onFilterChange({width: e.target.value})}
                                />
                                <input type="number"
                                       placeholder="Depth (m)"
                                       value={selectedFilters.depth > 0 ? selectedFilters.depth : ''}
                                       onChange={(e) => onFilterChange({depth: e.target.value})}
                                />
                            </div>
                        </div>

                        <NiceCheckbox
                            checkboxClass='form-row'
                            checked={parseInt(selectedFilters.single) === 1}
                            label="Single Story"
                            name="single-story"
                            onChange={() => onFilterChange({single: selectedFilters.single ? 0 : 1})}
                        />

                        <NiceCheckbox
                            checkboxClass='form-row'
                            checked={parseInt(selectedFilters.double) === 2}
                            label="Double Story"
                            name="double-story"
                            onChange={() => onFilterChange({double: selectedFilters.double ? 0 : 2})}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

Filter.propTypes = {
    companies: PropTypes.array.isRequired,
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired,
    selectedFilters: PropTypes.object.isRequired,
};

export default Filter;
