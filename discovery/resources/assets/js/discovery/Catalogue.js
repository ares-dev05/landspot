import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {LeftPanel, RightPanel} from '../helpers/Panels';
import Filter from './components/catalogue/Filter';
import HousesList from './components/catalogue/HousesList';

import * as actions from './store/catalogue/actions';
import {CloseDiscoveryLink, LoadingSpinner} from '~/helpers';
import pluralize from 'pluralize';
import {isEqual} from 'lodash';
import queryString from 'query-string';

class Catalogue extends Component {
    static defaultFilters = {
        range: 0,
        house: 0,
        beds: 0,
        bathrooms: '',
        single: 0,
        double: 0,
        fit: 0,
        width: '',
        depth: '',
        order_by: '',
        page: 1,
        max: Infinity,
        min: -Infinity
    };

    static propTypes = {
        filterCatalogue: PropTypes.func.isRequired,
        resetCatalogue: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: false,
            locationKey: null,
            selectedFilters: {...Catalogue.defaultFilters}
        };
    }

    componentDidMount() {
        const filters = Catalogue.getFiltersFromLocation(this.props.location);
        this.setState({
            selectedFilters: {...filters}
        });
        this.requestCatalogueUpdate(filters, true);
    }

    componentWillUnmount() {
        this.props.resetCatalogue({});
    }

    static getDerivedStateFromProps(props, state) {
        const {filters} = props.catalogue;
        const newState = {};

        if (filters) {
            const price = filters.price;
            if (price && (
                state.selectedFilters.min === -Infinity || state.selectedFilters.max === Infinity
            )) {
                const minPrice = (isFinite(price.min) && price.min !== null) ? parseInt(price.min) : 0;
                const maxPrice = (isFinite(price.max) && price.max !== null) ? parseInt(price.max) : 0;

                newState.selectedFilters = {
                    ...state.selectedFilters,
                    ...{max: maxPrice, min: minPrice}
                };
            }
        }
        const locationKey = props.location.key || '';

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        const locationFilters = Catalogue.getSelectedFilters(
            Catalogue.getFiltersFromLocation(props.location),
            state.selectedFilters
        );

        if (Object.keys(locationFilters).length > 0) {
            newState.selectedFilters = {
                ...state.selectedFilters,
                ...locationFilters
            };
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    static getFiltersFromLocation = (location) => {
        let query = location.search;
        const parsed = queryString.parse(query);
        let queryFilters = {};
        Object.keys(Catalogue.defaultFilters).forEach(key => {
            let v = parsed[key];
            if (v !== undefined) {
                if (typeof Catalogue.defaultFilters[key] === 'number') {
                    v = parseInt(v);
                    if (isNaN(v) || v < 0) {
                        v = Catalogue.defaultFilters[key];
                    }
                    queryFilters[key] = v;

                    if (key === 'fit' && v > 0) {
                        Catalogue.defaultFilters.fit = v;
                    }
                } else {
                    queryFilters[key] = v;
                }
            } else {
                queryFilters[key] = Catalogue.defaultFilters[key];
            }
        });

        return queryFilters;
    };

    onPageSelect = (page) => {
        const query = this.props.location.search;

        const parsed = queryString.parse(query);
        parsed.page = page;
        const newQuery = queryString.stringify(parsed);

        this.filterChangeHandler(newQuery);
    };

    onFilterChange = (data) => {
        if ('fit' in data && data.fit === undefined) {
            data.fit = Catalogue.defaultFilters.fit;
        }
        const selectedFilters = {...this.state.selectedFilters, ...data};

        this.setState({selectedFilters});

        const query = queryString.stringify(selectedFilters);
        this.filterChangeHandler(query);
    };

    filterChangeHandler = (query) => {
        const entryUrl = this.props.catalogue.entryUrl || '/' + this.props.location.pathname.split('/')[1];
        const url = entryUrl + '?' + query;
        this.props.history.push(url);
    };

    requestCatalogueUpdate = (selectedFilters, withFilters) => {
        const filters = Catalogue.getSelectedFilters(selectedFilters, Catalogue.defaultFilters);
        if (withFilters) {
            filters.get_filters = 1;
        }
        const query = queryString.stringify(filters);
        const requestUrl = this.props.catalogue.basePath + '/filter?' + query;
        this.props.filterCatalogue(requestUrl);
    };

    resetFilter = () => {
        const url = this.props.catalogue.basePath;
        this.props.history.push(url);
    };

    static getSelectedFilters = (filters, defaults) => {
        const params = {};
        Object.keys(defaults).forEach(key => {
            if (defaults[key] !== filters[key]) {
                params[key] = filters[key];
            }
        });
        return params;
    };

    onHouseSelect = (house) => {
        const {pathname, search} = this.props.location;
        this.props.history.push(this.props.catalogue.basePath + '/overview/' + house.id, {
            resultsUrl: pathname + search
        });
    };

    appliedFilters = () => {
        const {selectedFilters} = this.state;
        const {ranges, price} = this.props.catalogue.filters;
        const houses = this.props.catalogue.titles;
        let siting = ['Designs'];
        for (let key in selectedFilters) {
            if (parseInt(selectedFilters[key])) {
                if (key === 'house') {
                    let house = houses.find(value => {
                        return value.id === parseInt(selectedFilters[key]);
                    });
                    if (house) {
                        return house.title;
                    }
                } else if (key === 'range') {
                    let range = ranges.find(value => {
                        return value.id === parseInt(selectedFilters[key]);
                    });
                    siting.push('in ' + range.name);
                } else if (key === 'beds') {
                    if (siting.length <= 1) {
                        siting.push('with ' + pluralize('bedroom', parseInt(selectedFilters[key]), true));
                    } else {
                        siting.push(pluralize('bedroom', parseInt(selectedFilters[key]), true));
                    }
                } else if (key === 'bathrooms') {
                    siting.push(pluralize('bathroom', parseFloat(selectedFilters[key]), true));
                } else if (key === 'max' && (selectedFilters.max !== price.max || selectedFilters.min !== price.min)) {
                    siting.push(`between $${selectedFilters.min} and $${selectedFilters.max}`);
                } else if (key === 'single') {
                    siting.push('Single Storey');
                } else if (key === 'double') {
                    siting.push('Double Storey');
                }
            }
        }
        if (siting.length === 1) {
            return 'All designs';
        } else if (siting.length <= 2) {
            return siting.slice(0, siting.length - 1).join(' ') + ' ' + siting.slice(-1);
        } else {
            return siting.slice(0, 1).join(' ') + ' ' + siting.slice(1, siting.length - 1).join(', ') + ' and ' + siting.slice(-1);
        }
    };

    componentDidUpdate(prevProps, prevState) {
        const {selectedFilters, locationKey} = this.state;
        if (prevState.locationKey !== locationKey) {
            this.requestCatalogueUpdate(selectedFilters);
        }
    }

    render() {
        const {filters, titles, houses} = this.props.catalogue;
        const {selectedFilters} = this.state;
        return (
            filters
                ? <React.Fragment>
                    <CloseDiscoveryLink/>
                    <LeftPanel>
                        <Filter {...{filters, titles, selectedFilters}}
                                resetFilter={this.resetFilter}
                                onFilterChange={this.onFilterChange}
                        />
                    </LeftPanel>

                    <RightPanel>
                        {
                            houses && <HousesList appliedFilters={
                                <span className="options-header">{this.appliedFilters()}</span>
                            }
                                                  houses={houses}
                                                  sortOrder={selectedFilters.order_by}
                                                  onPageSelect={this.onPageSelect}
                                                  onHouseSelect={this.onHouseSelect}
                                                  onFilterChange={this.onFilterChange}
                            />
                        }
                    </RightPanel>

                </React.Fragment>
                : <LoadingSpinner/>
        );
    }
}

export default connect((state => ({catalogue: state.catalogue})), actions)(Catalogue);