import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import Media from 'react-media';
import {formatNumber, NiceCheckbox} from '~/helpers';
import SearchBarAutocomplete from '~/helpers/SearchBarAutocomplete';
import {withRouter} from 'react-router';
import {Route, Switch} from 'react-router-dom';
import PriceSlider from '~/helpers/PriceSlider';
import classnames from 'classnames';

const Filter = ({onFilterChange, selectedFilters, titles, filters}) => {
    const [showFilters, setShowFilters] = useState(false);

    let selectedHouse = titles
        ? titles.find(house => house.id === parseInt(selectedFilters.house))
        : null;

    if (!selectedHouse) {
        selectedHouse = selectedFilters['title'] ? {name: selectedFilters['title']} : null;
    }
    const maxPrice = Math.ceil(filters.price.max / 1000) * 1000;

    return (
        <div className="filter">
            <Media query="(min-width: 761px)"
                   render={() => (
                       titles
                           ? <Fragment>
                               <header>Floorplans</header>
                               <div className="search-bar">
                                   <div className='search-autocomplete'>
                                       <SearchBarAutocomplete
                                           onSearchInputChange={houseName => {
                                               if (houseName.length > 0) {
                                                   const house = titles.find(house => house.name === houseName).id;
                                                   onFilterChange({house});
                                               } else {
                                                   onFilterChange({title: null, house: null});
                                               }
                                           }}
                                           items={titles}
                                           value={
                                               selectedHouse
                                                   ? selectedHouse.name
                                                   : ''
                                           }
                                           itemType={'designs'}
                                           placeholder={'Search designs'}
                                       />
                                   </div>
                               </div>
                           </Fragment>
                           : null
                   )}
            />

            <p className="filter-mobile-button"
               onClick={() => setShowFilters(!showFilters)}>
                Show Filters (5) {showFilters ? (<i className="fas fa-angle-up"/>) : (
                <i className="fas fa-angle-down"/>)}
            </p>

            <Media query="(min-width: 761px)"
                   render={() => (
                       <Fragment>
                           <Switch>
                               <Route exact path={'/floorplans'}>
                                   <div className={'search-bar'}>
                                       <div className={'search-autocomplete'}>
                                           <div className={'autocomplete-dropdown landspot-input'}>
                                               <input
                                                   type={'text'}
                                                   placeholder={'Search designs'}
                                                   onChange={(e) => onFilterChange({title: e.target.value})}
                                               />
                                           </div>
                                       </div>
                                   </div>
                               </Route>
                           </Switch>
                       </Fragment>
                   )}
            />
            <div className={classnames('filter-bar', showFilters ? 'open' : '')}>
                <div className="filter-form">
                    <div className="form-rows">

                        <div className="form-row">
                            <label className="left-item">No. Beds</label>

                            <div className="right-item landspot-input">
                                <input type="text"
                                       placeholder="Any"
                                       value={selectedFilters.beds}
                                       onChange={e => onFilterChange({beds: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="left-item">No. Bathrooms</label>
                            <div className="right-item landspot-input">
                                <input type="text"
                                       placeholder="Any"
                                       value={selectedFilters.bathrooms}
                                       onChange={e => onFilterChange({bathrooms: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="left-item">Lot Dimensions <span className="gray-color">(m)</span></label>

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
                        <div className="form-row checkbox-row">
                            <NiceCheckbox
                                checkboxClass='checkbox-input'
                                checked={parseInt(selectedFilters.single) === 1}
                                label="Single Story"
                                name="single-story"
                                onChange={() => onFilterChange({single: selectedFilters.single ? 0 : 1})}
                            />

                            <NiceCheckbox
                                checkboxClass='checkbox-input'
                                checked={parseInt(selectedFilters.double) === 2}
                                label="Double Story"
                                name="double-story"
                                onChange={() => onFilterChange({double: selectedFilters.double ? 0 : 2})}
                            />
                        </div>
                        <div className="form-row price-row">
                            <div className="price-info">
                                <label>Price range</label>
                                <span>${formatNumber(selectedFilters.min ? selectedFilters.min : 0)} - ${(selectedFilters.max && selectedFilters.max !== Infinity) ? selectedFilters.max : maxPrice}</span>
                            </div>

                            <PriceSlider
                                max={maxPrice}
                                min={0}
                                step={1e3}
                                hidePriceText
                                valueMin={selectedFilters.min ? selectedFilters.min : 0}
                                valueMax={(selectedFilters.max && selectedFilters.max !== Infinity) ? selectedFilters.max : maxPrice}
                                onChange={values => onFilterChange({
                                    min: parseInt(values[0]),
                                    max: parseInt(values[1])
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Filter.propTypes = {
    companies: PropTypes.array.isRequired,
    titles: PropTypes.array,
    filters: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    resetFilter: PropTypes.func.isRequired,
    selectedFilters: PropTypes.object.isRequired,
};

export default withRouter(Filter);