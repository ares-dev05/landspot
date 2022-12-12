import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import {ToggleSwitch} from '~sitings~/helpers/ToggleSwitch';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import {DrawerContext} from '../DrawerContainer';
import * as actions from '../store/details/actions';
import StepNavigation from './StepNavigation';
import LotEdges from './sidebar/LotEdges';
import {CompanyDataContext} from './CompanyDataContainer';


class DrawEdges extends Component {
    static componentUrl = '/sitings/drawer/:sitingId/edges';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                sitingId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        companyLoaded: PropTypes.bool.isRequired,
        traceEnabled: PropTypes.bool.isRequired,
        loadSitingDrawer: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        resetDrawerStore: PropTypes.func.isRequired,
        setApplicationStep: PropTypes.func.isRequired,
        setTraceMode: PropTypes.func.isRequired,
        setMetric: PropTypes.func.isRequired,
        metric: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const {
            match: {
                params: {sitingId}
            },
            loadSitingDrawer,
            setCurrentStep,
            setApplicationStep,
            drawerData: {sitingSession},
            drawerDetails: {drawerData}
        } = this.props;
        const page = drawerData ? drawerData.page : null;

        if (!sitingSession || !page) {
            loadSitingDrawer({sitingId}, {step: 'edges'});
        }

        setCurrentStep('DRAW_EDGES');
        setApplicationStep(ApplicationStep.TRACE_OUTLINE);
    }

    toggleTraceMode() {
        const {setTraceMode, traceEnabled} = this.props;

        setTraceMode(!traceEnabled);
    }

    componentDidUpdate(prevProps) {
    }

    componentWillUnmount() {
    }

    render() {
        const {
            companyLoaded,
            traceEnabled,
            metric,
            setMetric
        } = this.props;

        const hasTrace = AccountMgr.i.builder ? AccountMgr.i.builder.hasManualTracing : false;

        return (
            <React.Fragment>
                <div className="filter-bar">
                    <div className="filter-form">
                        <div>STEP 2</div>
                        <div className="first-row has-nav">
                            <span className="filters-header">Create lot boundaries</span>

                            {!hasTrace &&
                            <div className='toggle-metric'>
                                <ToggleSwitch
                                    labelPosition="left"
                                    onClick={() => setMetric(!metric)}
                                    text={{on: 'Metric', off: 'Imperial'}}
                                    label={{on: '', off: ''}}
                                    state={metric}
                                />
                            </div>
                            }

                            {hasTrace &&
                            <button type="button" className='button default'
                                    onClick={() => this.toggleTraceMode()}>
                                {traceEnabled ? 'Complete Trace' : 'Trace Lot'}
                            </button>
                            }
                        </div>

                        <div className="step-note">
                            <p>
                                Enter the details of each boundary line below, and they will
                                automatically be created on your siting.
                            </p>
                        </div>

                        <LotEdges companyLoaded={companyLoaded} traceEnabled={traceEnabled} metric={metric}/>
                    </div>
                </div>
                <StepNavigation saveState={true}/>
            </React.Fragment>
        );
    }
}

const DrawerConsumer = (props) => (
    <CompanyDataContext.Consumer>
        {
            ({setApplicationStep, setTraceMode, companyLoaded, traceEnabled, setMetric, metric}) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData}, setCurrentStep
                         }) => <DrawEdges  {...props} {...{
                            drawerData,
                            setCurrentStep,
                            setApplicationStep,
                            setTraceMode,
                            companyLoaded,
                            traceEnabled,
                            setMetric,
                            metric
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const DrawEdgesInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), actions)(DrawerConsumer);

export {DrawEdgesInstance};

export default DrawEdges;