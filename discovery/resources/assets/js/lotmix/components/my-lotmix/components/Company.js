import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers';
import * as actions from '../store/company/actions';
import store from '../../../store';
import ReadMore from '~/helpers/ReadMore';
import MyDocumentsComponent from './MyDocuments/MyDocumentsComponent';
import CompanySitingsComponent from './CompanySitings/CompanySitingsComponent';
import CompanyFloorplans from './CompanyFloorplans';

class Company extends Component {
    static componentUrl = '/home/company/:companyId';
    static propTypes = {
        getCompanyData: PropTypes.func.isRequired,
        resetCompanyStore: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.companyId = props.match.params.companyId;
        this.state = {
            preloader: true
        };
    }

    componentDidMount() {
        this.props.getCompanyData({companyId: this.companyId});
    }

    componentWillUnmount() {
        this.props.resetCompanyStore();
    }

    static getDerivedStateFromProps(props) {
        const {
            companyData: {COMPANY_UPDATED, errors},
            alert: {error}
        } = props;
        let newState = {};

        if (errors && errors.length) {
            error(
                errors.map((error, errorIndex) => (
                    <div key={errorIndex}>{error.message || error}</div>
                ))
            );
            store.dispatch({type: actions.RESET_COMPANY_MESSAGES});
            newState.preloader = false;
        }

        if (COMPANY_UPDATED) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_COMPANY_UPDATED'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onHouseSelect = house => {
        const {pathname, search} = this.props.location;
        this.props.history.push(
            this.props.catalogue.basePath + '/overview/' + house.id,
            {resultsUrl: pathname + search}
        );
    };

    render() {
        const {company, sitings, documents, houses} = this.props.companyData;
        const {preloader} = this.state;

        if (preloader || !company) return <LoadingSpinner className={'overlay'}/>;

        return (
            <div className="lotmix-company-block">
                <div className="lotmix-company">
                    <div className="border-bottom-wrapper">
                        <div className="company-info">
                            <div className="company-description">
                                <p className="home-h1 dots-top-left">{company.name}</p>
                                <div className="description"><ReadMore content={company.description}/></div>
                            </div>
                            <div className="company-logo"
                                 style={{
                                     backgroundImage: `url('${company['company_logo']}')`
                                 }}/>
                        </div>
                    </div>
                    <div className="border-bottom-wrapper">
                        <div className="floorplan-block">
                            <p className="home-h1">Floor plans</p>
                            <CompanyFloorplans houses={houses} company={company} onHouseSelect={this.onHouseSelect}/>
                        </div>
                    </div>
                    <div className="border-bottom-wrapper">
                        <div className="my-sitings">
                            <p className="home-h1 dots-top-left">My sitings</p>
                            <CompanySitingsComponent sitings={sitings}/>
                        </div>
                    </div>
                    <div className="my-documents-block">
                        <p className="home-h1 dots-top-left">My Documents</p>
                        <MyDocumentsComponent documents={documents}/>
                    </
                    div>
                </div>
            </div>
        );
    }
}


const CompanyInstance = withAlert(
    connect(
        state => ({
            userProfile: state.profile,
            companyData: state.myLotmixCompany,
            catalogue: state.discoveryCatalogue
        }),
        actions
    )(Company)
);

export {CompanyInstance, Company};

