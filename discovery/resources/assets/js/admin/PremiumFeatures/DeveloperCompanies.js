import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {LoadingSpinner} from '~/helpers';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import {Company, CompanyInstance} from './components/Company';

import Filter from './components/Filter';
import * as actions from './store/companies/actions';

class DeveloperCompanies extends Component {
    static componentUrl = '/landspot/admin/developers-features';
    static propTypes = {
        companies: PropTypes.array,
        getDeveloperCompanies: PropTypes.func.isRequired,
        resetCompaniesState: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedCompany: null,
            estateId: null,
            locationKey: null,
        };
    }

    componentDidMount() {
        this.props.getDeveloperCompanies();
    }

    componentWillUnmount() {
        this.props.resetCompaniesState();
    }

    onFilterChange = ({companyID, estateId}) => {
        if (companyID) {
            const url = {pathname: Company.componentUrl.replace(':companyID', companyID)};
            if (estateId) {
                url.search = `estateId=${estateId}`;
            }
            this.props.history.push(url);
        }
    };

    static getDerivedStateFromProps(props, state) {
        const {location: {key, search}} = props;
        const newState = {};
        const locationKey = key || null;

        if (search) {
            const query = queryString.parse(search);
            newState.estateId = query['estateId'] || null;
        } else {
            newState.estateId = null;
        }

        if (locationKey !== state.locationKey) {
            newState.locationKey = locationKey;
        }
        return Object.keys(newState).length > 0 ? newState : null;
    }


    resetFilter = () => {
        this.props.history.push(DeveloperCompanies.componentUrl);
    };

    render() {
        const {companies, estates, match: {params: {companyID}}} = this.props;
        const company = (companies && companyID) ? companies.find(company => companyID === company.id.toString()) : null;
        const {estateId} = this.state;

        return (
            companies
                ?
                <React.Fragment>
                    <LeftPanel>
                        <Filter onFilterChange={this.onFilterChange}
                                selectedCompany={companyID || ''}
                                companies={companies}
                                estates={estates}
                                estateId={estateId}
                                resetFilter={this.resetFilter}
                        />
                    </LeftPanel>
                    <RightPanel className='flex-column'>
                        {
                            company
                                ? <CompanyInstance key={companyID}
                                                   estateId={estateId}
                                                   company={company}
                                />
                                : 'Select a company first'
                        }
                    </RightPanel>
                </React.Fragment>
                :
                <LoadingSpinner/>
        );
    }
}

const DeveloperCompaniesInstance = connect(state => ({
    companies: state.companiesData.companies,
    estates: state.companyData.estates,
}), actions)(DeveloperCompanies);

export {DeveloperCompanies, DeveloperCompaniesInstance}