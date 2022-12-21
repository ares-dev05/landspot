import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import {DrawerContext} from '../DrawerContainer';
import * as actions from '../store/details/actions';
import StepNavigation from './StepNavigation';
import Export from './sidebar/Export';
import {CompanyDataContext} from './CompanyDataContainer';


class ExportSiting extends Component {
    static componentUrl = '/sitings/drawer/:sitingId/export';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                sitingId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        setDrawerData: PropTypes.func.isRequired,
        companyLoaded: PropTypes.bool.isRequired,
        loadSitingWithRef: PropTypes.func.isRequired,
        loadSitingDrawer: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        resetDrawerStore: PropTypes.func.isRequired,
        setApplicationStep: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {};
        this.loadingDrawerData = false;
    }

    componentDidMount() {
        const {
            match: {
                params: {sitingId}
            },
            loadSitingDrawer,
            setCurrentStep,
            setApplicationStep,
            drawerData: {sitingSession}
        } = this.props;

        if (!sitingSession) {
            loadSitingDrawer({sitingId}, {step: 'export'});
            this.loadingDrawerData = true;
        }

        setCurrentStep('EXPORT_SITING');
        setApplicationStep(ApplicationStep.EXPORT_PDF);
    }

    componentDidUpdate(prevProps) {
        const {
            match: {
                params: {sitingId}
            },
            loadSitingWithRef,
            drawerData: {sitingSession},
        }   = this.props;

        if (sitingSession && this.loadingDrawerData) {
            this.loadingDrawerData = false;
            loadSitingWithRef({sitingId: sitingId});
        }
    }

    componentWillUnmount() {
    }

    render() {
        const {companyLoaded} = this.props;

        return (
            <React.Fragment>
                <div className="filter-bar">
                    <div className="filter-form">
                        <div>STEP 7</div>
                        <div className="first-row has-nav">
                            <span className="filters-header">Export</span>
                        </div>
                        <div className="step-note"/>

                        {companyLoaded &&
                            <Export/>
                        }
                    </div>
                </div>
                <StepNavigation hideNext={true} saveState={true}/>
            </React.Fragment>
        );
    }
}

const ExportSitingConsumer = (props) => (

    <CompanyDataContext.Consumer>
        {
            ({setApplicationStep, companyLoaded}) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData},
                             setCurrentStep,
                             setDrawerData
                         }) => <ExportSiting  {...props} {...{
                            drawerData,
                            setCurrentStep,
                            setDrawerData,
                            setApplicationStep,
                            companyLoaded
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const ExportSitingInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), actions)(ExportSitingConsumer);

export {ExportSitingInstance};

export default ExportSiting;