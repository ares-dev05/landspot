import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {LoadingSpinner, ToggleSwitch} from '~/helpers';
import * as actions from '../store/estate/actions';

class EstatePremiumFeatures extends Component {
    static propTypes = {
        availableFeatures: PropTypes.array,
        features: PropTypes.array,
        estateId: PropTypes.string.isRequired,
        getFeatures: PropTypes.func.isRequired,
        updateFeature: PropTypes.func.isRequired,
        resetEstateData: PropTypes.func.isRequired,
        resetEstatePreloader: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            preloader: true,
        };
    }

    componentDidMount() {
        this.props.getFeatures({estateID: this.props.estateId});
    }

    componentWillUnmount() {
        this.props.resetEstateData();
    }

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        const {FEATURES_UPDATED} = props;

        if (FEATURES_UPDATED && state.preloader) {
            newState.preloader = false;
            props.resetEstatePreloader();
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onFeatureClick = ({type, state}) => {
        this.setState({preloader: true});
        this.props.updateFeature({state, estateID: this.props.estateId}, {type});
    };

    render() {
        const {preloader} = this.state;
        const {features, availableFeatures} = this.props;
        return (
            <React.Fragment>
                {
                    (preloader || !features) && <LoadingSpinner/>
                }
                {
                    features && features.map(value =>
                        <Feature key={value}
                                 type={value}
                                 state={true}
                                 onClick={this.onFeatureClick}
                        />
                    )
                }
                {
                    availableFeatures && availableFeatures.map(value =>
                        <Feature key={value}
                                 type={value}
                                 state={false}
                                 onClick={this.onFeatureClick}
                        />
                    )
                }
            </React.Fragment>
        );
    }
}

const Feature = ({type, onClick, state}) => {
    const feature = FEATURES[type];
    if (!feature) {
        console.error('Feature ', type);
        return null;
    }
    return (
        <p>
            <ToggleSwitch
                labelPosition='right'
                onClick={() => onClick({type, state: !state})}
                text={{on: feature.label, off: feature.label}}
                label={{on: null, off: null}}
                state={state}
            />
            <br/>
            <small>{feature.text}</small>
        </p>
    )
};

const FEATURES = Object.freeze({
    'api-access-to-manage-lot-lists': {
        label: 'API Access to Manage Lot Lists',
        text: 'Manage your lot list from a third party application and push updates automatically. It will also allow updates that happen within Landspot in relation to your price list to be sent back to your third-party application.'
    },

    'branded-for-your-company': {
        label: 'Branded For Your Company',
        text: 'You will be able to brand the platform specific to your company colors. If you manage multiple estates this would be to your overarching brand.'
    },

    'builder-activity': {
        label: 'Builder Activity',
        text: 'Report Understand who is packaging your lots and where relationships may need to be nurtured more.'
    },

    'capture-referrals': {
        label: 'Capture Referrals',
        text: 'Capture referrals direct from the application from builder consultants on lots. If a builders sales consultant has interest in your lot. They can register interest directly in-app straight to your sales consultant.'
    },

    'changelog': {
        label: 'Changelog',
        text: 'If any information has been updated or changed, you will be able to view these changes and who made them in your changelog. Attached to each estate.'
    },

    'e-mail-information-direct-from-the-application': {
        label: 'E-mail information direct from the application',
        text: 'You will be able to e-mail brochures/lot information direct from the app to your potential individual clients.'
    },

    'estate-maps': {
        label: 'Estate Maps',
        text: 'A fully dynamic & interactive estate map. Embeddable on your own website. Will include downloading house land packages available, uploaded by the builder and can be downloaded in your estate’s template.'
    },

    'full-estate-profile': {
        label: 'Full Estate Profile',
        text: 'Upgrade your estate list into an estate profile. This will allow expanded estate information to be delivered to your building clients and for them to present from. Including image galleries, about the area and the development.'
    },

    'global-notification': {
        label: 'Global notification',
        text: 'Feed for management. One location to see the daily activity of all your estates.'
    },

    'lot-drawer': {
        label: 'Lot Drawer',
        text: 'Drawing lots of land using our existing tech, but doing a simplified version for estates.'
    },

    'lot-specific-custom-brochure-generation': {
        label: 'Lot-Specific Custom Brochure Generation',
        text: 'This will provide you with the ability to build a custom brochure for your clients. It will be 100% custom branded to your estate. Design provided by you. The brochures generated will be lot specific and as speaking to your client regarding lots you will be able to “add” potential build options for that specific lot and output all this information into a single PDF document.'
    },

    'one-click-hl-package-conversion': {
        label: 'One Click H&L Package Conversion',
        text: 'Convert H&L packages uploaded by builders into your own branded PDF for display in your sales office. In one click'
    },

    'push-to-3rd-party-realestate-platforms': {
        label: 'Push to 3rd Party Realestate platforms',
        text: 'Manage listings on landspot and push them to 3rd party listing platforms.'
    },

    'user-profiles': {
        label: 'User Profiles',
        text: 'This will give the ability to upload an Avatar and profile for each user. Put a face to your estates.'
    },

    'weekly-sales-reports': {
        label: 'Weekly Sales Reports',
        text: 'Receive daily and weekly reports, automatically emailed on status changes for your lots.'
    },

    'lotmix': {
        label: 'Lotmix',
        text: 'Add the ability to invite and manage your customers with the Lotmix app.'
    },

});

export default withAlert(withRouter(connect(state => ({
    features: state.estateData.features,
    availableFeatures: state.estateData.availableFeatures,
    FEATURES_UPDATED: state.estateData.FEATURES_UPDATED,
}), actions)(EstatePremiumFeatures)));