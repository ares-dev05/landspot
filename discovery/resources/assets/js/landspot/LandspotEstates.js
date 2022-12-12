import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '../helpers';
import {LeftPanel, RightPanel} from '../helpers/Panels';
import EstatesFilter from './components/EstatesFilter';

import EstateLotsHeader from './components/EstateLotsHeader';
import EstateList from './components/EstateList';

import * as actions from '../landspot/store/catalogue/actions';
import EstatesMap from './components/catalogue/EstatesMap';

import queryString from 'query-string';
import store from './store';

class LandspotEstates extends Component {
    static componentUrl = '/landspot/my-estates';
    static propTypes = {
        filterEstatesList: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.defaultPropsFilters = {
            estate_name: '',
            suburb: '',
            area: '',
            max_area: '',
            width: '',
            depth: '',
            orientation: '',
            status: '',
            // order: '',
            // order_type: '',
            max: 0,
            min: 0,
            unsold_lots: null,
            from_house: null
        };

        this.state = {
            displayMap: false,
            preloader: false,
            selectedFilters: Object.assign({}, this.defaultPropsFilters),
        };
    }

    componentWillMount() {
        if (!this.props.catalogue.estates) {
            if (this.props.location.search) {
                this.getLocationFilters();
            } else {
                this.props.filterEstatesList(this.getSelectedFilters(this.state.selectedFilters, true));
            }
        } else if (this.props.location.search) {
            this.getLocationFilters();
        }
    }

    componentWillReceiveProps(nextProps) {
        const {filters} = nextProps.catalogue;

        if (filters) {
            let price_max = filters.price_max;
            let price_min = filters.price_min;
            if (price_max > 0) {
                if (this.defaultPropsFilters.min === 0 &&
                    this.defaultPropsFilters.max === 0) {
                    this.defaultPropsFilters.min = price_min;
                    this.defaultPropsFilters.max = price_max;
                }

                if (this.state.selectedFilters.min === 0 && this.state.selectedFilters.max === 0) {
                    this.setState(
                        {
                            selectedFilters: Object.assign({}, this.state.selectedFilters,
                                {
                                    max: price_max,
                                    min: price_min
                                }
                            )
                        });
                }
            }
        }

        if (this.props.catalogue.selected_house && nextProps.history.action === 'POP') {
            window.location = '/landspot/discovery/overview/' + this.props.catalogue.selected_house.id;
        }

        if (nextProps.catalogue.ADDED_NEW_ESTATE) {
            store.dispatch({type: 'RESET_NEW_ESTATE_MSG'});
            this.setState({
                selectedFilters: {...this.defaultPropsFilters}
            });
            this.filterChangeHandler('', 'filter', false);
        }
    }

    getLocationFilters = () => {
        let query = this.props.location.search;
        const parsed = queryString.parse(query);
        let selectedFilters = Object.assign({}, this.defaultPropsFilters);

        for (let i in parsed) {
            let v = parsed[i];
            if (this.defaultPropsFilters.hasOwnProperty(i)) {
                if (typeof this.defaultPropsFilters[i] === 'number') {
                    v = parseInt(v);
                    if (isNaN(v)) {
                        continue;
                    }
                }
                selectedFilters[i] = v;
            }
        }

        this.setState({selectedFilters});

        this.filterChangeHandler(this.getSelectedFilters(selectedFilters, true), 'filter', false);
    };

    getSelectedFilters(filters, asQuery) {
        let params = {};
        for (let key in this.defaultPropsFilters) {
            if (this.defaultPropsFilters.hasOwnProperty(key) && this.defaultPropsFilters[key] !== filters[key]) {
                params[key] = filters[key];
            }
        }
        return asQuery ? queryString.stringify(params) : params;
    }

    onFilterChange = (data) => {
        const selectedFilters = Object.assign({}, this.state.selectedFilters, data);
        this.setState({selectedFilters: selectedFilters});

        const query = this.getSelectedFilters(selectedFilters, true);

        // if (this.props.match.params.estateId) {
        //     this.filterChangeHandler(query, 'lots', false);
        //     return query;
        // }

        this.filterChangeHandler(query, 'filter', true);
    };

    filterChangeHandler(query, type, toHistory) {
        let url = this.props.catalogue.basePath + '?' + query;
        if (type === 'filter') {
            this.props.filterEstatesList(query);
        } /*else if (type === 'lots') {
            const lotsPath = this.props.location.pathname + '?' + query;
            this.props.history.push(lotsPath);
        }*/

        if (toHistory) {
            this.props.history.push(url);
        }
    }

    resetFilter = () => {
        const {
            location: {pathname},
            history: {push},
            filterEstatesList
        } = this.props;

        this.setState({
            selectedFilters: {...this.defaultPropsFilters}
        });

        filterEstatesList('');
        push(pathname);
    };

    backToResults = () => {
        let query = this.props.location.search;

        // this.setState({selectedEstate: null});
        query = query.replace('?', '');
        this.filterChangeHandler(query, 'filter', true);
    };

    onEstateSelect = (estateId) => {
        const {
            catalogue: {can_approve, estates},
            history: {push},
            alert: {info}
        } = this.props;

        const estate = estates.find(estate => estate.id === estateId);
        if (estate && (estate.approved || can_approve)) {
            const query = this.getSelectedFilters(this.state.selectedFilters, true);
            push({
                pathname: `/landspot/estate/${estateId}`,
                search: `?${query}`,
                state: {
                    estatesFilters: `?${query}`,
                }
            });
        } else {
            info('This estate is not approved');
        }
    };

    currentFilters = () => {
        const selectedFilters = this.state.selectedFilters;
        const {selected_house} = this.props.catalogue;

        let labels = [];
        let priceAdded = false;

        for (let key in selectedFilters) {
            if (!selectedFilters.hasOwnProperty(key)) {
                continue;
            }
            if ((selectedFilters[key] !== this.defaultPropsFilters[key])) {
                switch (key) {
                    case 'max':
                    case 'min':
                        if (!priceAdded) {
                            labels.push({
                                name: 'between',
                                value: `between $${selectedFilters.min} and $${selectedFilters.max}`
                            });
                            priceAdded = true;
                        }
                        break;

                    case 'from_house':
                        break;

                    default:
                        labels.push({
                            'name': key,
                            'value': selectedFilters[key]
                        });
                        break;
                }
            }
        }

        // if (this.props.match.params.estateId && this.state.selectedEstate.name) {
        //     labels.push({
        //         name: 'estate',
        //         value: this.state.selectedEstate.name
        //     });
        // }

        if (selectedFilters['from_house'] && selected_house) {
            labels.unshift({
                name: 'from_house',
                value: selected_house
            });
        }

        return labels;
    };

    onShowMap = () => {
        this.estatesMapCallbacks.drawMap();
    };

    estatesMapMounted = (callbacks) => {
        this.estatesMapCallbacks = callbacks;
    };

    setMapState = (displayMap) => {
        this.setState({displayMap});
    };

    render() {
        const {filters, isBuilder} = this.props.catalogue;
        const {selectedFilters, displayMap} = this.state;
        return (
            filters
                ?
                <React.Fragment>
                    <LeftPanel>
                        <EstatesFilter {...{
                            isBuilder,
                            displayMap,
                            selectedFilters,
                            filters,
                            setMapState: this.setMapState,
                            onFilterChange: this.onFilterChange,
                            resetFilter: this.resetFilter
                        }}/>
                    </LeftPanel>
                    <RightPanel>
                        {
                            window['google'] &&
                            <EstatesMap onMounted={this.estatesMapMounted}
                                        displayMap={displayMap}
                                        setMapState={this.setMapState}
                                        onEstateSelect={this.onEstateSelect}
                            />
                        }

                        <EstateLotsHeader
                            currentFilters={this.currentFilters}
                            isBuilder={isBuilder}
                        />

                        <EstateList
                            displayMap={displayMap}
                            resetFilter={this.resetFilter}
                            onEstateSelect={this.onEstateSelect}
                        />
                    </RightPanel>
                </React.Fragment>
                :
                <LoadingSpinner/>
        );
    }
}

const LandspotEstatesInstance = withAlert(connect((state => ({
    catalogue: state.catalogue,
    estate: state.estate
})), actions)(LandspotEstates));

export {LandspotEstatesInstance, LandspotEstates};