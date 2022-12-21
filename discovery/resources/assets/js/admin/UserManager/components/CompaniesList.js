import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import * as actions from '../store/catalogue/actions';
import AddCompanyModal from './popups/AddCompanyModal';
import store from '../store';
import {LoadingSpinner} from '~/helpers';

const pluralize = require('pluralize');
const queryString = require('query-string');

class CompaniesList extends Component {
    static componentUrl = '/landspot/user-manager';
    static propTypes = {
        catalogue: PropTypes.object.isRequired,
        getSelectedFilters: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: true,
            locationKey: null,
        };
    }

    componentDidMount() {
        const {
            location: {key: locationKey = null},
            newCompaniesCatalogue,
            location: {search}
        } = this.props;

        if (search) {
            this.getLocationCompanies();
        } else {
            newCompaniesCatalogue();
        }

        this.setState({locationKey});
    }

    componentWillUnmount() {
        store.dispatch({type: 'RESET_COMPANIES_STATE'});
    }

    componentDidUpdate(prevProps, prevState) {
        const {locationKey} = this.state;

        if (prevState.locationKey !== locationKey) {
            this.getLocationCompanies();
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {
            catalogue: {COMPANIES_UPDATED},
            location: {key: locationKey = ''}
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (COMPANIES_UPDATED) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_COMPANIES_UPDATED'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    getLocationCompanies = () => {
        const {
            filterCompaniesCatalogue,
            getSelectedFilters
        } = this.props;

        filterCompaniesCatalogue(getSelectedFilters());
        this.setState({preloader: true});
    };

    onCompanySelect = (companyId) => {
        const {
            history: {push},
            getSelectedFilters
        } = this.props;
        const query = queryString.stringify(getSelectedFilters());

        push(`/landspot/user-manager/company/${companyId}?${query}`);
    };

    render() {
        const {
            catalogue: {companies},
            user: {isGlobalAdmin = false},
            addCompany
        } = this.props;
        const {preloader} = this.state;
        return (
            <Fragment>
                <Cards>
                    {
                        companies !== null &&
                        companies.map(company =>
                            <CardImageItem key={company.id}
                                           bgSize='contain'
                                           bgImage={`url('${company['company_logo']}')`}
                                           onClick={() => this.onCompanySelect(company.id)}
                                           title={company['name']}
                                           attrList={
                                               <li>{pluralize('User', company['users_count'], true)} Available</li>}
                            />
                        )
                    }
                </Cards>
                {preloader && <LoadingSpinner className={'overlay'}/>}
                {isGlobalAdmin && <AddCompanyModal addCompany={addCompany}/>}
            </Fragment>
        );
    }
}

export default withRouter(connect((state) => ({
    user: state.catalogue.user,
    catalogue: state.catalogue,
}), actions)(CompaniesList));