import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import PriceSlider from '~/helpers/PriceSlider';
import {clickHandler, formatNumber} from '~/helpers';
import classnames from 'classnames';

const EstateFilter = (props) => {
    const [showFilters, setShowFilters] = useState(false);
    return (
        <Fragment>
            <div className={classnames('estate-filter', showFilters ? 'show-mobile-filter' : '')}>
                <div className='show-filter'>
                    <span onClick={() => setShowFilters(!showFilters)}>
                        Show filters (5)
                        <i className={`fal fa-angle-${showFilters ? 'up' : 'down'}`}/>
                    </span>
                </div>
                <FilterBar  {...props}/>
            </div>
        </Fragment>
    );
};

const FilterBar = ({filters, onFilterChange, selectedFilters, resetFilter}) => {
    const maxPrice = parseInt(filters.price_max) || 1000000;
    const minPrice = parseInt(filters.price_min) || 0;

    return (
        <div className="estate-form">
            <div className="first-row">
                <span className="filters-header">Refine by:</span>
            </div>
            <div className="form-row">
                <label className="left-item">Area range (m<sup>2</sup>)</label>
                <div className='inputs'>
                    <input type='number'
                           className='form-input'
                           placeholder='Min'
                           onChange={e => onFilterChange({area: e.target.value})}
                           value={selectedFilters.area}
                    />
                    <input type='number'
                           className='form-input'
                           placeholder='Max'
                           onChange={e => onFilterChange({max_area: e.target.value})}
                           value={selectedFilters.max_area}
                    />
                </div>
            </div>
            <div className="form-row">
                <label className="left-item">Dimensions (m)</label>
                <div className='inputs'>
                    <input type='number'
                           className='form-input form-input__width'
                           placeholder='Width'
                           value={selectedFilters.width}
                           onChange={e => onFilterChange({width: e.target.value})}
                    />
                    <input type='number'
                           className='form-input form-input__depth'
                           placeholder='Depth'
                           onChange={e => onFilterChange({depth: e.target.value})}
                           value={selectedFilters.depth}
                    />
                </div>
            </div>

            <div className="form-row price-row">
                <label>Price range</label>
                <div className='price'>{'$' + formatNumber(minPrice) + ' - $' + formatNumber(maxPrice)}</div>
                <PriceSlider
                    max={maxPrice}
                    min={minPrice}
                    step={1e3}
                    valueMin={selectedFilters.min || minPrice}
                    valueMax={selectedFilters.max || maxPrice}
                    onChange={values => onFilterChange({
                        min: parseInt(values[0]),
                        max: parseInt(values[1])
                    })}
                />
            </div>
            <div className="clear-filters">
                <a href="#"
                   onClick={e => clickHandler(e, resetFilter)}>Clear all</a>
            </div>
        </div>);
};

export default EstateFilter;

EstateFilter.propTypes = {
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    setMapState: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired,
    selectedFilters: PropTypes.object.isRequired
};