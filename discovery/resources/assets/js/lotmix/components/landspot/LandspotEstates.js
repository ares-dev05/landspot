import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import EstatesFilter from './components/EstatesFilter';
import {isEqual} from 'lodash';

import EstateLotsHeader from './components/EstateLotsHeader';
import EstateList from './components/EstateList';

import * as actions from './store/catalogue/actions';
import EstatesMap from './components/catalogue/EstatesMap';

import queryString from 'query-string';
import DialogList from '~/lotmix/components/discovery/components/popups/DialogList';

class LandspotEstates extends Component {
    static componentUrl = '/land-for-sale/communities/';
    static title = 'Find Land';
    static propTypes = {
        filterEstatesList: PropTypes.func.isRequired
    };

    defaultPropsFilters = {
        estate_name: '',
        suburb: '',
        area: '',
        max_area: '',
        width: '',
        depth: '',
        orientation: '',
        status: '',
        max: 0,
        min: 0,
        unsold_lots: null,
        from_house: null
    };

    state = {
        userAction: null,
        userActionData: null,
        displayMap: false,
        preloader: false,
        selectedFilters: {...this.defaultPropsFilters}
    };

    componentDidMount() {
        if (!this.props.catalogue.estates) {
            if (this.props.location.search) {
                this.getLocationFilters();
            } else {
                this.props.filterEstatesList(
                    this.getSelectedFilters(this.state.selectedFilters, true)
                );
            }
        } else if (this.props.location.search) {
            this.getLocationFilters();
        }
    }

    // set default and selected pricing min, max filters if it not set (=0) from storage filters data
    componentDidUpdate() {
        const {filters} = this.props.catalogue;

        if (filters) {
            const {price_max, price_min} = filters;
            if (price_max > 0) {
                if (
                    this.defaultPropsFilters.min === 0 &&
                    this.defaultPropsFilters.max === 0
                ) {
                    this.defaultPropsFilters.min = price_min;
                    this.defaultPropsFilters.max = price_max;
                }

                if (
                    this.state.selectedFilters.min === 0 &&
                    this.state.selectedFilters.max === 0
                ) {
                    this.setState({
                        selectedFilters: {
                            ...this.state.selectedFilters,
                            max: price_max,
                            min: price_min
                        }
                    });
                }
            }
        }

        if (
            this.props.catalogue.selected_house &&
            this.props.history.action === 'POP'
        ) {
            window.location =
                '/discovery/overview/' + this.props.catalogue.selected_house.id + '/';
        }
    }

    getLocationFilters = () => {
        let query = this.props.location.search;
        const parsed = queryString.parse(query);
        let selectedFilters = {...this.defaultPropsFilters};

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

        this.filterChangeHandler(
            this.getSelectedFilters(selectedFilters, true),
            'filter',
            false
        );
    };

    // generate query string including only defaultPropsFilters keys and without it default values
    // output ex: "min=100&max=10000"
    getSelectedFilters(filters, asQuery) {
        let params = {};
        for (let key in this.defaultPropsFilters) {
            if (
                this.defaultPropsFilters.hasOwnProperty(key) &&
                this.defaultPropsFilters[key] !== filters[key]
            ) {
                params[key] = filters[key];
            }
        }
        return asQuery ? queryString.stringify(params) : params;
    }

    // callback to react filter changing
    onFilterChange = data => {
        const selectedFilters = {...this.state.selectedFilters, ...data};
        this.setState({selectedFilters: selectedFilters});

        const query = this.getSelectedFilters(selectedFilters, true);

        console.log('### - `this.props.location.pathname (Line 151)`: ', this.props.location.pathname);
        if (this.props.location.pathname === '/land-for-sale/communities/') {
            this.filterChangeHandler(query, 'filter', true);
        } else {
            const estateId = this.props.estate.estate.id;
            this.props.history.push('/land-for-sale/communities/' + estateId + '?filters=1&' + query);
        }
    };

    filterChangeHandler(query, type, toHistory) {
        let url = this.props.catalogue.basePath + '?' + query;
        if (type === 'filter') {
            this.props.filterEstatesList(query);
        }

        if (toHistory) {
            this.props.history.push(url);
        }
    }

    resetFilter = () => {
        this.setState({
            selectedFilters: {...this.defaultPropsFilters}
        });

        this.props.history.push('/land-for-sale/communities/' + this.props.estate.estate.id + '/');
    };

    onEstateSelect = slug => {
        const {
            catalogue: {can_approve, estates},
            history: {push},
            alert: {info}
        } = this.props;

        const estate = estates.find(estate => estate.slug === slug);
        if (estate && (estate.approved || can_approve)) {
            const query = this.getSelectedFilters(
                this.state.selectedFilters,
                true
            );
            push({
                pathname: `/land-for-sale/communities/${slug}/`,
                search: `?${query}`,
                state: {
                    estatesFilters: `?${query}`
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
            if (selectedFilters[key] !== this.defaultPropsFilters[key]) {
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
                            name: key,
                            value: selectedFilters[key]
                        });
                        break;
                }
            }
        }

        if (selectedFilters['from_house'] && selected_house) {
            labels.unshift({
                name: 'from_house',
                value: selected_house
            });
        }

        return labels;
    };

    estatesMapMounted = callbacks => {
        this.estatesMapCallbacks = callbacks;
    };

    setMapState = displayMap => {
        this.setState({displayMap});
    };

    setUserAction = (action, actionData) => {
        console.log('ACTION: ' + (action ? action.toString() : 'none'), actionData);
        const {userAction, userActionData} = this.state;

        const actionChanged =
            action !== userAction ||
            (actionData != null && !isEqual(actionData, userActionData));

        if (actionChanged) {
            this.setState({
                userAction: action,
                userActionData: actionData || null
            });
        }
    };

    render() {
        const {filters, isBuilder, estates} = this.props.catalogue;
        const {userAction, userActionData} = this.state;
        const {selectedFilters, displayMap} = this.state;

        return filters ? (
            <React.Fragment>
                <DialogList userAction={userAction} userActionData={userActionData} setUserAction={this.setUserAction}/>
                <LeftPanel className={'company-sidebar discovery-sidebar'}>
                    <EstatesFilter
                        {...{
                            isBuilder,
                            displayMap,
                            selectedFilters,
                            filters,
                            setMapState: this.setMapState,
                            onFilterChange: this.onFilterChange,
                            resetFilter: this.resetFilter
                        }}
                    />
                </LeftPanel>
                <RightPanel className={'discovery'}>
                    <EstateLotsHeader
                        items={estates}
                        displayMap={displayMap}
                        setMapState={this.setMapState}
                        currentFilters={this.currentFilters}
                    />
                    <div className="map-estate-wrapper">
                        {window['google'] && (
                            <EstatesMap
                                onMounted={this.estatesMapMounted}
                                displayMap={displayMap}
                                estates={estates}
                                setMapState={this.setMapState}
                                onEstateSelect={this.onEstateSelect}
                            />
                        )}
                        <EstateList
                            displayMap={displayMap}
                            resetFilter={this.resetFilter}
                            onEstateSelect={this.onEstateSelect}
                        />
                    </div>
                </RightPanel>
            </React.Fragment>
        ) : (
            <LoadingSpinner/>
        );
    }
}

const LandspotEstatesInstance = withAlert(
    connect(
        state => ({
            catalogue: state.landspotCatalogue,
            estate: state.landspotEstate
        }),
        actions
    )(LandspotEstates)
);

export {LandspotEstatesInstance, LandspotEstates};
