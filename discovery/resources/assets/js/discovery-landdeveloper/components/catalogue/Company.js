import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import HousesList from '~/discovery/components/catalogue/HousesList';
import {LoadingSpinner} from '~/helpers';
import * as companyActions from '../../store/company/actions';
import OptionHeader from './OptionHeader';

import {CompaniesDataContext} from '../../CompaniesCatalogue';

class Company extends Component {

    static propTypes = {
        resetCompanyData: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        this.props.resetCompanyData();
    }

    onHouseSelect = (house) => {
        const {pathname, search} = this.props.location;
        this.props.history.push(this.props.catalogue.basePath + '/overview/' + house.id, {resultsUrl: pathname + search});
    };

    render() {
        const {company} = this.props;
        const {houses} = company;

        return (
            houses
                ? <CompaniesDataContext.Consumer>
                    {
                        ({selectedFilters, priceFilters, onPageSelect}) =>
                            <HousesList appliedFilters={
                                <OptionHeader
                                    selectedCompany={company}
                                    selectedFilters={selectedFilters}
                                    defaultPropsFilters={priceFilters}
                                />
                            }
                                        houses={houses}
                                        sortOrder={''}
                                        onPageSelect={onPageSelect}
                                        onHouseSelect={this.onHouseSelect}
                            />
                    }
                </CompaniesDataContext.Consumer>
                : <LoadingSpinner/>

        );
    }
}


export default connect((state => ({
    company: state.company,
    catalogue: state.catalogue
})), companyActions)(withRouter(Company));