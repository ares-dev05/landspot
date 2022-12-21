import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Media from 'react-media';
import {LoadingSpinner} from '~/helpers';

import {LeftPanel, RightPanel} from '~/helpers/Panels';
import CompaniesList from './components/catalogue/CompaniesList';
import Company from './components/catalogue/Company';
import Filter from './components/catalogue/Filter';

import * as catalogueActions from './store/catalogue/actions';
import {PathNavLink} from '~/helpers';
import CompanyTabs from '../my-lotmix/components/CompanyTabs';
import CompanyCard from '~/lotmix/components/discovery/components/catalogue/CompanyCard';
import DialogList from '~/lotmix/components/discovery/components/popups/DialogList';
import {isEqual} from 'lodash';

export const companyBasePath = '/floorplans/homebuilder';

export const CompaniesDataContext = React.createContext();
export const MobileTabModeContext = React.createContext();

const getLocationFilters = (props) => {
    let parsed = queryString.parse(props.location.search);

    const filters = {...defaultPropsFilters};

    Object.keys(parsed).forEach(key => {
        let v = parsed[key];
        if (defaultPropsFilters.hasOwnProperty(key)) {
            if (typeof defaultPropsFilters[key] === 'number') {
                v = parseFloat(v);
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
    bathrooms: 0,
    single: 0,
    double: 0,
    width: '',
    depth: '',
    house: '',
    title: '',
    max: Infinity,
    min: -Infinity,
    page: 1
});

class CompaniesCatalogue extends Component {
    static componentUrl = '/floorplans';
    static title = 'Floorplans';

    static propTypes = {
        filterCompaniesCatalogue: PropTypes.func.isRequired,
        filterCompanyHouses: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            userAction: null,
            userActionData: null,
            locationKey: '',
            selectedFilters: {...defaultPropsFilters},
            mobileGlobalSwitch: true
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
        const {slug} = this.props.match.params;

        if (slug) {
            if (!this.props.companies) {
                this.props.filterCompaniesCatalogue(query);
            }
            this.props.filterCompanyHouses({slug}, query);
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
                    v = parseFloat(v);
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

    findCompanyBySlug(slug) {
        if (slug) {
            return this.props.companies && this.props.companies.find(company => company.slug === slug);
        }
    }

    resetFilter = () => {
        const url = this.props.basePath;
        this.props.history.push(url);
    };

    onFilterChange = (data) => {
        const {slug} = data;
        Object.keys(data).forEach(key => {
            if (typeof defaultPropsFilters[key] === 'number') {
                let v = parseFloat(data[key]);
                data[key] = isNaN(v) ? 0 : v;
            }
        });
        delete data.slug;
        if (slug) {
            data.page = defaultPropsFilters.page;
        }
        const selectedAssignedFilters = {...this.state.selectedFilters, ...data};
        const selectedFilters = Object.keys(selectedAssignedFilters).reduce((obj, key) => {
            if (selectedAssignedFilters[key] != null) {
                obj[key] = selectedAssignedFilters[key];
            }
            return obj;
        }, {});

        this.setState({selectedFilters});

        const filters = this.getSelectedFilters(selectedFilters, this.props.filters.price);
        const query = queryString.stringify(filters);

        if (slug) {
            const companyUrl = companyBasePath + '/' + slug;
            this.props.history.push(companyUrl + '/?' + query);
        } else {
            const catalogueUrl = this.props.location.pathname;
            this.props.history.push(catalogueUrl + '?' + query);
        }
    };

    onCompanySelect = (slug) => {
        this.onFilterChange({
            slug,
            page: defaultPropsFilters.page
        });
    };

    getCompanyData = () => {
        const {slug} = this.props.match.params || '';
        const {companies} = this.props;

        if (slug && companies) {
            return companies.find(company => company.slug === slug);
        }
        return null;
    };

    onPageSelect = page => {
        this.onFilterChange({
            page
        });
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

    componentDidUpdate(prevProps, prevState) {
        const {selectedFilters, locationKey} = this.state;
        if (prevState.locationKey !== locationKey) {
            this.filterChangeHandler(selectedFilters);
        }
    }

    render() {
        const {filters, companies, company, basePath} = this.props;
        const {selectedFilters} = this.state;
        const {slug} = this.props.match.params || '';
        const {showTabs} = this.props.location.state || {};
        const companyData = this.getCompanyData();
        const {userAction, userActionData} = this.state;


        const {titles} = company;

        const selectedCompany = companies
            ? companies.find(company => company.slug === slug)
            : null;
        const contextValues = {
            selectedCompany: this.findCompanyBySlug(slug),
            onPageSelect: this.onPageSelect,
            defaultPropsFilters,
            selectedFilters,
            titles,
            priceFilters: filters.price
        };
        return (
            <div className={'primary-container responsive-container find-land-page'}>
                {
                    companies
                        ? <React.Fragment>
                            <DialogList userAction={userAction} userActionData={userActionData}
                                        setUserAction={this.setUserAction}/>
                            <MobileTabModeContext.Provider value={
                                {
                                    state: this.state.mobileGlobalSwitch,
                                    changeState: (value) => {
                                        this.setState({
                                            mobileGlobalSwitch: value
                                        });
                                    }
                                }
                            }>
                                <LeftPanel className={'company-sidebar discovery-sidebar'}>
                                    {slug &&
                                    <MobileTabModeContext.Consumer>
                                        {
                                            ({state, changeState}) => (
                                                <Media query="(max-width: 760px)">
                                                    <React.Fragment>
                                                        <PathNavLink className="back-nav"
                                                                     to={basePath}>
                                                            <i className="fal fa-arrow-left"/>
                                                            <span>Back</span>
                                                        </PathNavLink>
                                                        <CompanyCard
                                                            setUserAction={this.setUserAction}
                                                            globalSwitch={state}
                                                            setGlobalSwitch={(state) => {
                                                                changeState(state);
                                                            }}
                                                            company={companyData}
                                                        />
                                                    </React.Fragment>
                                                </Media>
                                            )
                                        }
                                    </MobileTabModeContext.Consumer>
                                    }
                                    {!selectedCompany
                                     && <p className="filter-title">Find a Floorplan</p>
                                    }

                                    {(selectedCompany && showTabs) &&
                                    <CompanyTabs tab={''}
                                                 setTab={() => console.log('tab')}
                                                 slug={slug}/>
                                    }

                                    <Filter
                                        resetFilter={this.resetFilter}
                                        onFilterChange={this.onFilterChange}
                                        {...{filters, companies, selectedFilters, titles, selectedCompany}}
                                    />
                                </LeftPanel>

                                <RightPanel className={'discovery'}>
                                    <CompaniesDataContext.Provider value={contextValues}>
                                        {
                                            slug
                                                ? <Company
                                                    setUserAction={this.setUserAction}
                                                    key={slug}
                                                    onPageSelect={this.onPageSelect}
                                                />
                                                : <CompaniesList onCompanySelect={this.onCompanySelect}/>
                                        }
                                    </CompaniesDataContext.Provider>
                                </RightPanel>
                            </MobileTabModeContext.Provider>
                        </React.Fragment>
                        : <LoadingSpinner/>
                }
            </div>
        );
    }
}

export default connect((state => ({
    basePath: state.discoveryCatalogue.basePath,
    filters: state.discoveryCatalogue.filters,
    companies: state.discoveryCatalogue.companies,
    company: state.discoveryCompany,
})), catalogueActions)(CompaniesCatalogue);