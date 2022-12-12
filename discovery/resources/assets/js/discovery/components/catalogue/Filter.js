import React from 'react';
import PropTypes from 'prop-types';
import {clickHandler, NiceCheckbox, formatNumber} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';
import PriceSlider from '~/helpers/PriceSlider';

const Filter = ({filters, titles, onFilterChange, selectedFilters, resetFilter}) => {
    const fit = parseInt(selectedFilters.fit);

    return (
        <React.Fragment>
            <header>Discovery</header>
            <div className="filter-bar">
                <div className="filter-form">
                    {/*<div className="landspot-input magnify">
                    <input type="text" placeholder="Search designs"/>
                </div>*/}

                    <div className="first-row">
                        <span className="filters-header">Refine by</span>
                        <a href="#"
                           className="clear-filters"
                           onClick={e => clickHandler(e, resetFilter)}
                        >Clear all</a>
                    </div>

                    <div className="form-rows">
                        <div className="form-row">
                            <label className="left-item">Design Range</label>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem='Design Range'
                                defaultValue={0}
                                items={filters.ranges.map(range => ({value: range.id, text: range.name}))}
                                onChange={range => onFilterChange({range})}
                                value={selectedFilters.range}
                            />
                        </div>


                        <div className="form-row">
                            <label className="left-item">Available Houses</label>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem='Available Houses'
                                defaultValue={0}
                                items={titles.map(house => ({value: house.id, text: house.title}))}
                                onChange={house => onFilterChange({house})}
                                value={selectedFilters.house}
                            />
                        </div>

                        <div className="form-row">
                            <label className="left-item">No. of Beds</label>
                            <NiceDropdown
                                itemClass='right-item'
                                defaultItem='No. of Beds'
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
                                defaultItem='No. of Bathrooms'
                                defaultValue={0}
                                items={filters.bathrooms.map(value => ({value, text: value ? value : 'Show all'}))}
                                onChange={bathrooms => onFilterChange({bathrooms})}
                                value={selectedFilters.bathrooms}
                            />
                        </div>

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

                        {/*<PriceSlider
                            max={filters.price.max}
                            min={filters.price.min}
                            step={1}
                            valueMin={parseInt(selectedFilters.min)}
                            valueMax={parseInt(selectedFilters.max)}
                            onChange={values => onFilterChange({min: parseInt(values[0]), max: parseInt(values[1])})}
                        />*/}

                        <NiceCheckbox
                            checkboxClass='form-row'
                            checked={parseInt(selectedFilters.single) === 1}
                            label="Single Story"
                            name="single-story"
                            onChange={() => onFilterChange({single: parseInt(selectedFilters.single) ? 0 : 1})}
                        />

                        <NiceCheckbox
                            checkboxClass='form-row'
                            checked={parseInt(selectedFilters.double) === 2}
                            label="Double Story"
                            name="double-story"
                            onChange={() => onFilterChange({double: parseInt(selectedFilters.double) ? 0 : 2})}
                        />

                        {/*{
                            document.getElementById('footprints') &&
                            <NiceCheckbox
                                checkboxClass='form-row'
                                checked={fit > 0}
                                label="Show designs that may fit"
                                name="fit-only-designs"
                                onChange={() => onFilterChange({fit: fit ? 0 : undefined})}
                            />
                        }*/}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

Filter.propTypes = {
    filters: PropTypes.object.isRequired,
    titles: PropTypes.array.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    selectedFilters: PropTypes.object.isRequired,
    resetFilter: PropTypes.func.isRequired,
};

export default Filter;
