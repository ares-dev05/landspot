import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import {DrawerContext} from '../DrawerContainer';
import * as actions from '../store/details/actions';
import StepNavigation from './StepNavigation';
import Annotations from './sidebar/Annotations';
import {CompanyDataContext} from './CompanyDataContainer';


class DrawAnnotations extends Component {
    static componentUrl = '/sitings/drawer/:sitingId/annotations';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                sitingId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        companyLoaded: PropTypes.bool.isRequired,
        loadSitingDrawer: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        resetDrawerStore: PropTypes.func.isRequired,
        setApplicationStep: PropTypes.func.isRequired,
        engineeringEnabled: PropTypes.bool,
        threeDVisualisationEnabled: PropTypes.bool,
        nearmapsVisualisationEnabled: PropTypes.bool,
    };

    constructor(props) {
        super(props);

        this.state = {};
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
            loadSitingDrawer({sitingId}, {step: 'annotations'});
        }

        setCurrentStep('DRAW_ANNOTATIONS');
        setApplicationStep(ApplicationStep.ADD_MEASUREMENTS);
    }

    componentDidUpdate(prevProps) {
    }

    componentWillUnmount() {
    }

    render() {
        const {
            companyLoaded,
            engineeringEnabled,
            threeDVisualisationEnabled,
            nearmapsVisualisationEnabled,
            heightVisualisationEnabled
        } = this.props;
        return (
            <React.Fragment>
                <div className="filter-bar">
                    <div className="filter-form">
                        <div>STEP 6{
                            engineeringEnabled ? '.1' :
                            threeDVisualisationEnabled ? '.2' :
                            nearmapsVisualisationEnabled ? '.3' :
                            heightVisualisationEnabled ? '.4' :
                                null
                        }</div>
                        <div className="first-row has-nav">
                            <span
                                className="filters-header">{
                                    engineeringEnabled ? 'Advanced Siting' :
                                    threeDVisualisationEnabled ? '3D Mode' :
                                    nearmapsVisualisationEnabled ? 'Nearmap Overlay' :
                                    heightVisualisationEnabled ? 'Height Envelope' :
                                        'Annotations'
                                }</span>
                        </div>
                        <div className="step-note"/>

                        {companyLoaded && <Annotations/>}
                    </div>
                </div>
                <StepNavigation saveState={true} disabledAll={engineeringEnabled || heightVisualisationEnabled || threeDVisualisationEnabled || nearmapsVisualisationEnabled}/>
            </React.Fragment>
        );
    }
}

const DrawAnnotationsConsumer = (props) => (
    <CompanyDataContext.Consumer>
        {
            ({setApplicationStep, companyLoaded, engineeringEnabled, threeDVisualisationEnabled, nearmapsVisualisationEnabled, heightVisualisationEnabled}) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData}, setCurrentStep
                         }) => <DrawAnnotations  {...props} {...{
                            drawerData,
                            setCurrentStep,
                            setApplicationStep,
                            companyLoaded,
                            engineeringEnabled,
                            threeDVisualisationEnabled,
                            nearmapsVisualisationEnabled,
                            heightVisualisationEnabled,
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const DrawAnnotationsInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), actions)(DrawAnnotationsConsumer);

export {DrawAnnotationsInstance};

export default DrawAnnotations;