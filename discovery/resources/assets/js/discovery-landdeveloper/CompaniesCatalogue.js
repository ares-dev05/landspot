import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~/helpers';

import {LeftPanel, RightPanel} from '../helpers/Panels';
import CompaniesList from './components/catalogue/CompaniesList';
import Company from './components/catalogue/Company';
import Filter from './components/catalogue/Filter';

import * as catalogueActions from './store/catalogue/actions';

export const companyBasePath = '/landspot/discovery/company';

export const CompaniesDataContext = React.createContext();

const getLocationFilters = (props) => {
    let parsed = queryString.parse(props.location.search);

    const filters = {...defaultPropsFilters};

    Object.keys(parsed).forEach(key => {
        let v = parsed[key];
        if (defaultPropsFilters.hasOwnProperty(key)) {
            if (typeof defaultPropsFilters[key] === 'number') {
                v = parseInt(v);
                if (isNaN(v)) {
                    return;
                }
            }
            filters[key] = v;
        }
    });

    return filters;
};

const defaultPropsFilters = Object.freeze({
    beds: 0,
    bathrooms: '',
    single: 0,
    double: 0,
    width: '',
    depth: '',
    max: Infinity,
    min: -Infinity,
    page: 1
});

class CompaniesCatalogue extends Component {

    static propTypes = {
        filterCompaniesCatalogue: PropTypes.func.isRequired,
        filterCompanyHouses: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            locationKey: '',
            selectedFilters: {...defaultPropsFilters}
        };
    }

    componentDidMount() {
        const filters = {...this.state.selectedFilters};
        const locationFilters = getLocationFilters(this.props);

        this.setState({
            locationKey: this.props.history.locationKey,
            selectedFilters: Object.assign(filters, locationFilters)
        });

        this.filterChangeHandler(this.getSelectedFilters(filters, this.props.filters.price));
    }

    /**
     *
     * @param query {Object}
     */
    filterChangeHandler = (query) => {
        const {companyID} = this.props.match.params;

        if (companyID) {
            if (!this.props.companies) {
                this.props.filterCompaniesCatalogue(query);
            }
            this.props.filterCompanyHouses({companyID}, query);
        } else {
            this.props.filterCompaniesCatalogue(query);
        }
    };

    getSelectedFilters = (selectedFilters, filtersPrice) => {
        const params = {};
        Object.keys(defaultPropsFilters).forEach(key => {
            let v = selectedFilters[key];
            if (key === 'min' || key === 'max') {
                if (filtersPrice) {
                    const priceLimit = filtersPrice[key];
                    if (!isFinite(priceLimit)) {
                        return;
                    }
                    if (isFinite(v) && priceLimit !== v) {
                        params[key] = v;
                    } else {
                        return;
                    }
                } else {
                    return;
                }
            }

            if (defaultPropsFilters[key] !== v) {
                if (typeof defaultPropsFilters[key] === 'number') {
                    v = parseInt(v);
                    if (!isFinite(v) || isNaN(v)) {
                        return;
                    }
                }
                params[key] = v;
            }
        });
        return params;
    };

    static getDerivedStateFromProps(props, state) {
        const {price} = props.filters;
        const stateSelectedFilters = state.selectedFilters;
        const newState = {};

        if (price) {
            const minPrice = (isFinite(price.min) && price.min !== null) ? parseInt(price.min) : 0;
            const maxPrice = (isFinite(price.max) && price.max !== null) ? parseInt(price.max) : 0;

            if (stateSelectedFilters.min === -Infinity && stateSelectedFilters.max === Infinity) {
                newState.selectedFilters = {...stateSelectedFilters, ...{max: maxPrice, min: minPrice}};
            }
        }

        const locationKey = props.location.key || '';

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
            const locationFilters = getLocationFilters(props);
            newState.selectedFilters = {...stateSelectedFilters, ...locationFilters};
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    findCompanyByID(id) {
        if (id) {
            return this.props.companies && this.props.companies.find(item => id.toString() === item.id.toString());
        }
    }

    resetFilter = () => {
        const url = this.props.basePath;
        this.props.history.push(url);
    };

    onFilterChange = (data) => {
        const {company_id: companyId} = data;
        Object.keys(data).forEach(key => {
            if (typeof defaultPropsFilters[key] === 'number') {
                let v = parseInt(data[key]);
                data[key] = isNaN(v) ? 0 : v;
            }
        });
        delete data.company_id;
        if (companyId) {
            data.page = defaultPropsFilters.page;
        }
        const selectedFilters = {...this.state.selectedFilters, ...data};
        this.setState({selectedFilters});

        const filters = this.getSelectedFilters(selectedFilters, this.props.filters.price);
        const query = queryString.stringify(filters);

        if (companyId) {
            const companyUrl = companyBasePath + '/' + companyId;
            this.props.history.push(companyUrl + '?' + query);
        } else {
            const catalogueUrl = this.props.location.pathname;
            this.props.history.push(catalogueUrl + '?' + query);
        }
    };

    onCompanySelect = (companyId) => {
        this.onFilterChange({
            company_id: companyId,
            page: defaultPropsFilters.page
        });
    };

    onPageSelect = page => {
        this.onFilterChange({
            page
        });
    };

    componentDidUpdate(prevProps, prevState) {
        const {selectedFilters, locationKey} = this.state;
        if (prevState.locationKey !== locationKey) {
            this.filterChangeHandler(selectedFilters);
        }
    }

    render() {
        const {filters, companies} = this.props;
        const {selectedFilters} = this.state;
        const {companyID} = this.props.match.params || '';
        const contextValues = {
            selectedCompany: this.findCompanyByID(companyID),
            onPageSelect: this.onPageSelect,
            defaultPropsFilters,
            selectedFilters,
            priceFilters: filters.price
        };
        return (
            <React.Fragment>
                {
                    companies
                        ? <React.Fragment>
                            <LeftPanel>
                                <Filter
                                    resetFilter={this.resetFilter}
                                    onFilterChange={this.onFilterChange}
                                    {...{filters, companies, selectedFilters, companyID}}
                                />
                            </LeftPanel>

                            <RightPanel>
                                <CompaniesDataContext.Provider value={contextValues}>
                                    {
                                        companyID
                                            ?
                                            <Company key={companyID}
                                                     onPageSelect={this.onPageSelect}
                                            />
                                            : <CompaniesList onCompanySelect={this.onCompanySelect}/>
                                    }
                                </CompaniesDataContext.Provider>
                            </RightPanel>

                        </React.Fragment>
                        : <LoadingSpinner/>
                }

            </React.Fragment>
        );
    }
}

export default connect((state => ({
    basePath: state.catalogue.basePath,
    filters: state.catalogue.filters,
    companies: state.catalogue.companies,
})), catalogueActions)(CompaniesCatalogue);