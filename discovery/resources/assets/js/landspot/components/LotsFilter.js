import PropTypes from 'prop-types';
import React, {Component} from 'react';
import PriceSlider from '~/helpers/PriceSlider';
import {ToggleSwitch, clickHandler} from '~/helpers';
import NiceDropdown from '~/helpers/NiceDropdown';
import queryString from 'query-string';
import * as actions from '../store/estate/actions';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';


class LotsFilter extends Component {
    static propTypes = {
        estate: PropTypes.shape({
            filters: PropTypes.shape({
                price_max: PropTypes.number,
                price_min: PropTypes.number,
            }).isRequired,
            isBuilder: PropTypes.bool.isRequired,
        }).isRequired
    };

    static defaultPropsFilters = {
        area: '',
        max_area: '',
        width: '',
        depth: '',
        status: '',
        order: '',
        order_type: '',
        max: 0,
        min: 0,
        unsold_lots: null,
        from_house: null
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedFilters: {...LotsFilter.defaultPropsFilters}
        };
    }

    componentDidMount() {
        this.parseLocationFilters();
    }

    static getDerivedStateFromProps(props, state) {
        const {
            estate: {filters},
            location: {search}
        } = props;
        const newState = {};

        if (filters) {
            const minPrice = (isFinite(filters['price_min']) && filters['price_min'] !== null) ? parseInt(filters['price_min']) : 0;
            const maxPrice = (isFinite(filters['price_max']) && filters['price_max'] !== null) ? parseInt(filters['price_max']) : 0;
            if (LotsFilter.defaultPropsFilters.min === 0 &&
                LotsFilter.defaultPropsFilters.max === 0) {
                LotsFilter.defaultPropsFilters.min = minPrice;
                LotsFilter.defaultPropsFilters.max = maxPrice;
            }
            if (maxPrice > 0) {
                if (state.selectedFilters.min === 0 && state.selectedFilters.max === 0) {
                    newState.selectedFilters = {
                        ...state.selectedFilters,
                        ...{max: maxPrice, min: minPrice}
                    };
                }
            }
        }

        const locationFilters = LotsFilter.reduceSelectedFilters(
            LotsFilter.getFiltersFromLocation(search),
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

    static getFiltersFromLocation = (query) => {
        const parsed = queryString.parse(query);
        const selectedFilters = {...LotsFilter.defaultPropsFilters};
        Object.keys(parsed).forEach(key => {
            let v = parsed[key];
            if (typeof LotsFilter.defaultPropsFilters[key] === 'number') {
                v = parseInt(v);
                if (isNaN(v)) {
                    return;
                }
            }
            selectedFilters[key] = v;
        });

        return selectedFilters;
    };

    static reduceSelectedFilters = (filters, defaults) => {
        const params = {};
        Object.keys(defaults).forEach(key => {
            if (defaults[key] !== filters[key]) {
                params[key] = filters[key];
            }
        });
        return params;
    };

    static getSelectedFilters = (search) => {
        return LotsFilter.reduceSelectedFilters(
            LotsFilter.getFiltersFromLocation(search),
            LotsFilter.defaultPropsFilters
        );
    };

    onFilterChange = (data) => {
        const selectedFilters = {...this.state.selectedFilters, ...data};
        this.setState({selectedFilters});

        const query = LotsFilter.reduceSelectedFilters(selectedFilters, LotsFilter.defaultPropsFilters);
        this.getEstateLotsHandler(query, true);
    };

    getEstateLotsHandler = (query, toHistory) => {
        const {
            history: {push},
            location: {pathname, state}
        } = this.props;

        if (toHistory) {
            push({
                pathname,
                search: `?${queryString.stringify(query)}`,
                state
            });
        }
    };

    parseLocationFilters = () => {
        const {
            location: {search},
        } = this.props;
        const selectedFilters = LotsFilter.getFiltersFromLocation(search);
        this.setState({selectedFilters});
    };

    clearFilters = () => {
        const {
            history: {push},
            location: {pathname, state}
        } = this.props;

        this.setState({
            selectedFilters: {...LotsFilter.defaultPropsFilters}
        });

        push({
            pathname,
            state
        });
    };

    render() {
        const {estate: {filters, isBuilder}} = this.props;
        const {selectedFilters}   = this.state;
        return (
            <React.Fragment>
                <div className="filter-bar">
                    <div className="filter-form">
                        <div className="first-row has-nav">
                            <span className="filters-header">Filter lots by</span>
                            <a href="#"
                               onClick={e => clickHandler(e, this.clearFilters)}
                               className="clear-filters">Clear all</a>
                        </div>

                        <div className="form-rows">
                            <div className="form-row">
                                <label className="left-item">Area range (m<sup>2</sup>)</label>

                                <div className="landspot-input two-inputs right-item">
                                    <input type="number"
                                           placeholder="Min. area"
                                           onChange={e => this.onFilterChange({area: e.target.value})}
                                           value={selectedFilters.area}
                                    />
                                    <input type="number"
                                           placeholder="Max. area"
                                           onChange={e => this.onFilterChange({max_area: e.target.value})}
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
                                    onChange={status => this.onFilterChange({status})}
                                    value={selectedFilters.status}
                                />
                            </div>

                            <div className="form-row price-row">
                                <label>Price range</label>

                                <PriceSlider
                                    max={parseInt(filters.price_max) || 1e8}
                                    min={parseInt(filters.price_min) || 0}
                                    step={1e3}
                                    valueMin={selectedFilters.min || 0}
                                    valueMax={selectedFilters.max || 1e8}
                                    onChange={values => this.onFilterChange({
                                        min: parseInt(values[0]),
                                        max: parseInt(values[1])
                                    })}
                                />
                            </div>

                            <div className="clearfix"/>

                            <div className="form-row">
                                <label className="left-item">Dimensions (m)</label>

                                <div className="landspot-input two-inputs right-item">
                                    <input type="number"
                                           placeholder="Width"
                                           value={selectedFilters.width}
                                           onChange={e => this.onFilterChange({width: e.target.value})}
                                    />
                                    <input type="number"
                                           placeholder="Depth"
                                           onChange={e => this.onFilterChange({depth: e.target.value})}
                                           value={selectedFilters.depth}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                            {
                                isBuilder &&
                                    <ToggleSwitch
                                        labelPosition="left"
                                        onClick={() => this.onFilterChange({unsold_lots: selectedFilters.unsold_lots ? null : 1})}
                                        text={{on: 'Show available', off: 'Show all'}}
                                        label={{on: 'Y', off: 'N'}}
                                        state={selectedFilters.unsold_lots}
                                    />
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(connect((
    state => ({estate: state.estate})
), actions)(LotsFilter));