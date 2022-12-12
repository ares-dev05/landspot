import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {LoadingSpinner} from '~/helpers';

import Filter from './components/Filter';
import UsersListHeader from './components/UsersListHeader';
import CompaniesList from './components/CompaniesList';
import Company from './components/Company';
import {LeftPanel, RightPanel} from '~/helpers/Panels';

import * as actions from './store/catalogue/actions';

const queryString = require('query-string');

class CompaniesCatalogue extends Component {
    static propTypes = {
        company: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
        catalogue: PropTypes.shape({
            companies: PropTypes.oneOfType([
                PropTypes.array.isRequired
            ]),
            user: PropTypes.object.isRequired,
            basePath: PropTypes.string.isRequired,
        }).isRequired,

        filterCompaniesCatalogue: PropTypes.func.isRequired,
        newCompaniesCatalogue: PropTypes.func.isRequired,
        getUser: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.defaultPropsFilters = {
            name: '',
            estateName: '',
            emptyEstates: 0,
        };

        this.state = {
            locationKey: '',
            selectedFilters: Object.assign({}, this.defaultPropsFilters),
        };
    }

    componentDidMount() {
        const {user, getUser, catalogue, newCompaniesCatalogue} = this.props;
        const {search, key: locationKey} = this.props.location;
        if (!user.id) {
            getUser();
        }

        if (!catalogue.companies) {
            if (search) {
                this.getLocationFilters(search);
            } else {
                newCompaniesCatalogue();
            }
        } else if (search) {
            this.getLocationFilters(search);
        }

        this.setState({locationKey: locationKey || 0});
    }

    componentDidUpdate() {
        const {locationKey: stateLocationKey}   = this.state;
        const {key: locationKey, search}        = this.props.location;

        if ((stateLocationKey !== locationKey) && locationKey) {
            this.setState({locationKey});
            this.getLocationFilters(search);
        } else if (locationKey === undefined && stateLocationKey !== 0) {
            this.setState({locationKey: locationKey || 0});
            this.getLocationFilters(search);
        }
    }

    parsedFilters = (parsed) => {
        let selectedFilters = Object.assign({}, this.defaultPropsFilters);

        for (let i in parsed) {
            let v = parsed[i];
            if (this.defaultPropsFilters.hasOwnProperty(i)) {
                if (typeof this.defaultPropsFilters[i] === 'number') {
                    v = parseInt(v);
                    if (isNaN(v)) continue;
                }
                selectedFilters[i] = v;
            }
        }

        this.setState({selectedFilters});
    };

    getLocationFilters = (search) => {
        const parsed = queryString.parse(search);
        this.parsedFilters(parsed);

        const query = search.replace('?', '');
        this.filterChangeHandler(query);
    };

    getSelectedFilters = (filters, asQuery) => {
        let params = {};
        for (let key in this.defaultPropsFilters) {
            if (this.defaultPropsFilters.hasOwnProperty(key) && this.defaultPropsFilters[key] !== filters[key]) {
                params[key] = filters[key];
            }
        }
        return asQuery ? queryString.stringify(params) : params;
    };

    onFilterChange = (data) => {
        const selectedFilters = Object.assign({}, this.state.selectedFilters, data);
        this.setState({selectedFilters: selectedFilters});

        const query = this.getSelectedFilters(selectedFilters, true);

        const {history, location} = this.props;
        const url = location.pathname + '?' + query;
        history.push(url);
    };

    filterChangeHandler(query, isBack) {
        const {catalogue, filterCompaniesCatalogue, history, match} = this.props;
        if (!match.params.companyID || isBack) {
            filterCompaniesCatalogue(query);
        }

        if (isBack) {
            const url = catalogue.basePath + '?' + query;
            history.push(url);
        }
    }

    backToResults = () => {
        let {search} = this.props.location;
        search       = search.replace('?', '');

        this.filterChangeHandler(search, true);
    };

    resetFilter = () => {
        const {history, location} = this.props;

        this.setState(Object.assign({}, this.state, {selectedFilters: this.defaultPropsFilters}));

        history.push(location.pathname);
    };

    onCompanySelect = (companyId) => {
        const query = this.getSelectedFilters(this.state.selectedFilters, true);

        this.props.history.push('/landspot/pdf-manager/company/' + companyId + '?' + query);
    };

    currentFilters = () => {
        const selectedFilters     = this.state.selectedFilters;
        const defaultPropsFilters = this.defaultPropsFilters;
        let siting = [];

        for (let key in selectedFilters) {
            if (!selectedFilters.hasOwnProperty(key)) continue;
            if (defaultPropsFilters[key] === selectedFilters[key]) continue;
            if ((selectedFilters[key] !== '')) {
                switch (key) {
                    case 'emptyEstates':
                        siting.push({
                            'name': key,
                            'value': 'Empty Estates'
                        });

                        break;

                    case 'estateName':
                        siting.push({
                            'name': key,
                            'value': `${selectedFilters[key]}`
                        });

                        break;

                    case 'name':
                        siting.push({
                            'name': key,
                            'value': `${selectedFilters[key]}`
                        });

                        break;

                    default:
                        siting.push({
                            'name': key,
                            'value': selectedFilters[key]
                        });
                }
            }
        }
        return siting;
    };

    getSelectedCompany = () => {
        const {catalogue: {companies}, match: {params: {companyID}}} = this.props;
        if(companies && companyID) {
            const id = parseInt(companyID);
            return companies.find(company => company.id === id);
        }
    };

    render() {
        const isGlobalAdmin = this.props.user['isGlobalAdmin'];
        const {companies} = this.props.catalogue;
        const {companyID} = this.props.match.params;
        return (
            <React.Fragment>
                <LeftPanel>
                    <Filter onFilterChange={this.onFilterChange}
                            resetFilter={this.resetFilter}
                            selectedFilters={this.state.selectedFilters}/>
                </LeftPanel>
                <RightPanel>
                    <UsersListHeader
                        selectedCompany={companyID ? this.getSelectedCompany() : null}
                        backToResults={this.backToResults}
                        currentFilters={this.currentFilters}
                        isGlobalAdmin={isGlobalAdmin}/>
                    {
                        companyID
                            ? <Company key={companyID}/>
                            : (
                                companies
                                    ? <CompaniesList
                                        companies={companies}
                                        onCompanySelect={this.onCompanySelect}/>
                                    :
                                    <LoadingSpinner/>
                            )
                    }
                </RightPanel>
                <div className="modals"/>
            </React.Fragment>
        );
    }
}

export default connect(
    (state => ({
        company: state.estate.company,
        user: state.catalogue.user,
        catalogue: state.catalogue,
    })), actions
)(CompaniesCatalogue);