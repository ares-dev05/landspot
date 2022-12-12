import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {LoadingSpinner} from '~/helpers';
import CardImageItem, {Cards} from '~/helpers/CardImageItem';
import * as actions from '../store/company/actions';
import CompanyHeader from './CompanyHeader';
import EstateHeader from './EstateHeader';
import EstatePremiumFeatures from './EstatePremiumFeatures';

class Company extends Component {
    static componentUrl = '/landspot/admin/developers-features/:companyID';
    static propTypes = {
        company: PropTypes.object.isRequired,
        estateId: PropTypes.string,
        getEstates: PropTypes.func.isRequired,
        resetCompanyData: PropTypes.func.isRequired,
        resetPreloader: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.companyID = props.match.params.companyID;
        this.state = {
            preloader: true,
        };
    }

    componentDidMount() {
        const {companyID} = this.props.match.params;
        this.props.getEstates({companyID});
    }

    componentWillUnmount() {
        this.props.resetCompanyData();
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        const {ESTATES_UPDATED} = props;

        if (ESTATES_UPDATED && state.preloader) {
            newState.preloader = false;
            props.resetPreloader();
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onEstateSelect = estateId => {
        this.props.history.push({search: `estateId=${estateId}`});
    };

    render() {
        const {preloader} = this.state;
        const {estates, company, estateId} = this.props;
        const estate = estateId && estates && estates.find(estate => estate.id.toString() === estateId);
        const estateSelected = estateId && estate;
        return (
            <React.Fragment>
                <CompanyHeader estateSelected={estateSelected} {...company}/>
                {
                    estateSelected && <EstateHeader {...estate}/>
                }
                {
                    estates && (
                        estates.length
                            ?
                            (
                                estateId
                                    ?
                                    <EstatePremiumFeatures key={estateId}
                                                           estateId={estateId}
                                    />
                                    :
                                    <Cards>
                                        {
                                            estateId
                                                ?
                                                <EstatePremiumFeatures key={estateId}
                                                                       estateId={estateId}
                                                />
                                                :
                                                estates.map(estate =>
                                                    <CardImageItem key={estate.id}
                                                                   bgSize='cover'
                                                                   bgImage={`url('${estate['thumbImage']}')`}
                                                                   onClick={() => this.onEstateSelect(estate.id)}
                                                                   attrList={estate.published ? null :
                                                                       <i className="fal fa-eye-slash"
                                                                          title='Unpublished'/>}
                                                                   title={estate.name}
                                                    />
                                                )

                                        }

                                    </Cards>
                            )

                            :
                            <div className='no-results'>No approved estates</div>
                    )

                }
                {
                    preloader && <LoadingSpinner/>
                }
            </React.Fragment>
        );
    }
}

const CompanyInstance = withAlert(withRouter(connect(state => ({
    estates: state.companyData.estates,
    ESTATES_UPDATED: state.companyData.ESTATES_UPDATED,
}), actions)(Company)));

export {CompanyInstance, Company};