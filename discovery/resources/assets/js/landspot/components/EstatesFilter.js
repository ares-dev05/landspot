import PropTypes from 'prop-types';
import React from 'react';
import PriceSlider from '~/helpers/PriceSlider';
import {ToggleSwitch, clickHandler} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';

const EstatesFilter = ({
                           filters, onFilterChange, selectedFilters,
                           isBuilder, displayMap, setMapState, resetFilter
                       }) => {
    const maxPrice = parseInt(filters.price_max) || 1e8;
    const minPrice = parseInt(filters.price_min) || 0;
    return (
        <React.Fragment>
            <header>My Estates</header>
            <div className="filter-bar">
                <div className="filter-form">
                    <nav className='filter-nav' role="navigation">
                        <a className={displayMap ? null : 'active'}
                           onClick={e => clickHandler(e, () => setMapState(false))}>
                            <i className="landspot-icon bars"/>Image
                        </a>
                        <a className={displayMap ? 'active' : null}
                           onClick={e => clickHandler(e, () => setMapState(true))}>
                            <i className="landspot-icon map-marker"/>Map view
                        </a>
                    </nav>
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
                                       placeholder="Estate name"
                                       value={selectedFilters.estate_name}
                                       onChange={e => onFilterChange({estate_name: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="left-item">Suburb</label>

                            <div className="right-item landspot-input">
                                <input type="text"
                                       placeholder="Suburb"
                                       onChange={e => onFilterChange({suburb: e.target.value})}
                                       value={selectedFilters.suburb}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="left-item">Area range (m<sup>2</sup>)</label>

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
                            <label className="left-item">Status</label>

                            <NiceDropdown
                                itemClass='right-item'
                                defaultValue=''
                                defaultItem='Status'
                                items={
                                    filters.status.map(status => ({
                                        text: status,
                                        value: status
                                    }))
                                }
                                onChange={status => onFilterChange({status})}
                                value={selectedFilters.status}
                            />
                        </div>

                        <div className="form-row">
                            <label className="left-item">Dimensions (m)</label>

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

                        {
                            isBuilder &&
                            <div className="form-row">
                                <ToggleSwitch
                                    labelPosition="left"
                                    onClick={() => onFilterChange({unsold_lots: selectedFilters.unsold_lots ? null : 1})}
                                    text={{on: 'Show available', off: 'Show all'}}
                                    label={{on: 'Y', off: 'N'}}
                                    state={selectedFilters.unsold_lots}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </React.Fragment>
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