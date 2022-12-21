import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import PriceSlider from '~/helpers/PriceSlider';
import {clickHandler, formatNumber} from '~/helpers';
import {Route, Switch} from 'react-router-dom';
import {Estate} from './Estate';
import classnames from 'classnames';
import {LandspotEstates} from '../LandspotEstates';

const EstatesFilter = ({filters, onFilterChange, selectedFilters, resetFilter}) => {
    const [showFilters, setShowFilters] = useState(false);
    const oneMillion = 1000000;
    let maxPrice = parseInt(filters.price_max) || oneMillion;
    maxPrice = maxPrice > oneMillion ? oneMillion : maxPrice;
    const minPrice = parseInt(filters.price_min) || 0;

    return (
        <Fragment>
            <p className="filter-title">
                Find Land
            </p>
            <div className="filter">
                <p className="filter-mobile-button"
                   onClick={() => setShowFilters(!showFilters)}>
                    Show Filters (5) {showFilters ? (<i className="fas fa-angle-up"></i>) : (
                    <i className="fas fa-angle-down"></i>)}
                </p>
                <div className={classnames('filter-bar', showFilters ? 'open' : '')}>
                    <div className="filter-form">
                        <Switch>
                            <Route exact path={Estate.componentUrl}>
                                <React.Fragment>
                                    <div className="first-row has-nav">
                                        <span className="filters-header">Refine by</span>
                                        <a href="#"
                                           onClick={e => clickHandler(e, resetFilter)}
                                           className="clear-filters">Clear all</a>
                                    </div>

                                    <div className="form-rows">
                                        <div className="form-row">
                                            <label className="left-item">Area range <span
                                                className="gray-color">(m<sup>2</sup>)</span></label>

                                            <div className="landspot-input two-inputs right-item">
                                                <input type="number"
                                                       placeholder="Min. area"
                                                       onChange={e => onFilterChange({area: e.target.value})}
                                                       value={selectedFilters.area}
                                                />
                                                <input type="number"
                                                       placeholder="Max. area"
                                                       onChange={e => onFilterChange({max_area: e.target.value})}
                                                       value={selectedFilters.max_area}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <label className="left-item">Dimensions <span
                                                className="gray-color">(m)</span></label>

                                            <div className="landspot-input two-inputs right-item">
                                                <input type="number"
                                                       placeholder="Width"
                                                       value={selectedFilters.width}
                                                       onChange={e => onFilterChange({width: e.target.value})}
                                                />
                                                <input type="number"
                                                       placeholder="Depth"
                                                       onChange={e => onFilterChange({depth: e.target.value})}
                                                       value={selectedFilters.depth}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row price-row">
                                            <label>Price range</label>

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
                                    </div>
                                </React.Fragment>
                            </Route>
                            <Route exact path={LandspotEstates.componentUrl}>
                                <React.Fragment>
                                    <div className="first-row has-nav">
                                        <span className="filters-header">Refine by</span>
                                        <a href="#"
                                           onClick={e => clickHandler(e, resetFilter)}
                                           className="clear-filters">Clear all</a>
                                    </div>

                                    <div className="form-rows">
                                        <div className="form-row">
                                            <label className="left-item">Estate name</label>

                                            <div className="right-item landspot-input">
                                                <input type="text"
                                                       placeholder="Write your estate name..."
                                                       value={selectedFilters.estate_name}
                                                       onChange={e => onFilterChange({estate_name: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <label className="left-item">Suburb</label>

                                            <div className="right-item landspot-input">
                                                <input type="text"
                                                       placeholder="Write your estate suburb..."
                                                       onChange={e => onFilterChange({suburb: e.target.value})}
                                                       value={selectedFilters.suburb}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <label className="left-item">Area range <span
                                                className="gray-color">(m<sup>2</sup>)</span></label>

                                            <div className="landspot-input two-inputs right-item">
                                                <input type="number"
                                                       placeholder="Min. area"
                                                       onChange={e => onFilterChange({area: e.target.value})}
                                                       value={selectedFilters.area}
                                                />
                                                <input type="number"
                                                       placeholder="Max. area"
                                                       onChange={e => onFilterChange({max_area: e.target.value})}
                                                       value={selectedFilters.max_area}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <label className="left-item">Dimensions <span
                                                className="gray-color">(m)</span></label>

                                            <div className="landspot-input two-inputs right-item">
                                                <input type="number"
                                                       placeholder="Width"
                                                       value={selectedFilters.width}
                                                       onChange={e => onFilterChange({width: e.target.value})}
                                                />
                                                <input type="number"
                                                       placeholder="Depth"
                                                       onChange={e => onFilterChange({depth: e.target.value})}
                                                       value={selectedFilters.depth}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row price-row">
                                            <div className="price-info">
                                                <label>Price range</label>
                                                <span>${formatNumber(selectedFilters.min || minPrice)} - ${formatNumber(selectedFilters.max || maxPrice)}</span>
                                            </div>

                                            <PriceSlider
                                                max={maxPrice}
                                                min={minPrice}
                                                step={1e3}
                                                hidePriceText
                                                valueMin={selectedFilters.min || minPrice}
                                                valueMax={selectedFilters.max || maxPrice}
                                                onChange={values => onFilterChange({
                                                    min: parseInt(values[0]),
                                                    max: parseInt(values[1])
                                                })}
                                            />
                                        </div>
                                    </div>
                                </React.Fragment>
                            </Route>
                        </Switch>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};


export default EstatesFilter;

EstatesFilter.propTypes = {
    filters: PropTypes.object.isRequired,
    displayMap: PropTypes.bool.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    setMapState: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired,
    selectedFilters: PropTypes.object.isRequired
};