import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import HousesList from '~/discovery/components/catalogue/HousesList';
import {LoadingSpinner, PathNavLink} from '~/helpers';
import * as companyActions from '../../store/company/actions';
import OptionHeader from './OptionHeader';

import {CompaniesDataContext, MobileTabModeContext} from '../../CompaniesCatalogue';
import CompanyCard from './CompanyCard';
import Media from 'react-media';

class Company extends Component {

    static propTypes = {
        resetCompanyData: PropTypes.func.isRequired,
        switchHouseToShortlist: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
    }

    componentWillUnmount() {
        this.props.resetCompanyData();
    }

    onHouseSelect = (house) => {
        const {pathname, search} = this.props.location;
        this.props.history.push(this.props.catalogue.basePath + '/overview/' + house.id + '/', {resultsUrl: pathname + search});
    };

    getCompanyData = () => {
        const {slug} = this.props.match.params;
        const {companies} = this.props.catalogue;

        if (slug && companies) {
            return companies.find(company => company.slug === slug);
        }
        return null;
    };

    render() {
        const {company, switchHouseToShortlist} = this.props;
        const {houses, shortlistHouseIds} = company;
        const {basePath} = this.props.catalogue;
        const companyData = this.getCompanyData();

        return (
            houses
                ? <CompaniesDataContext.Consumer>
                    {
                        ({selectedFilters, priceFilters, onPageSelect}) =>
                            <React.Fragment>
                                <Media query="(min-width: 761px)">
                                    <React.Fragment>
                                        <div className='back-nav-wrapper'>
                                            <PathNavLink className="back-nav"
                                                         to={basePath}>
                                                <i className="fal fa-arrow-left"/>
                                                <span>Back to all builders</span>
                                            </PathNavLink>
                                        </div>
                                        <CompanyCard
                                            setUserAction={this.props.setUserAction}
                                            company={companyData}
                                        />
                                        <HousesList
                                            appliedFilters={
                                                <OptionHeader
                                                    selectedCompany={company}
                                                    selectedFilters={selectedFilters}
                                                    defaultPropsFilters={priceFilters}
                                                />
                                            }
                                            switchToShortList={switchHouseToShortlist}
                                            isShortListed={true}
                                            shortListIds={shortlistHouseIds}
                                            houses={houses}
                                            sortOrder={''}
                                            onPageSelect={onPageSelect}
                                            onHouseSelect={this.onHouseSelect}
                                            showPrice={true}
                                            hideNaPrice={true}
                                        />
                                    </React.Fragment>
                                </Media>
                                <Media query="(max-width: 760px)">
                                    <MobileTabModeContext>
                                        {
                                            ({state}) => (
                                                state && <HousesList
                                                    appliedFilters={
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
                                                    showPrice={true}
                                                />
                                            )
                                        }
                                    </MobileTabModeContext>
                                </Media>
                            </React.Fragment>
                    }
                </CompaniesDataContext.Consumer>
                : <LoadingSpinner/>
        );
    }
}


export default connect((state => ({
    company: state.discoveryCompany,
    catalogue: state.discoveryCatalogue
})), companyActions)(withRouter(Company));