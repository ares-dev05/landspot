import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import {withAlert} from 'react-alert';

import * as actions from './store/drawer/actions';
import StageLots, {StageLotsInstance} from './components/StageLots';
import PosPages, {PosPagesInstance} from './components/PosPages';
import LotDrawer, {LotDrawerInstance} from './components/LotDrawer';
import LotDetails, {LotDetailsInstance} from './components/LotDetails';
import {LoadingSpinner} from '~/helpers';
import store from './store';

export const LotDrawerContext = React.createContext();

import DisplayManager from '~/sitings-sdk/src/utils/DisplayManager';

// 1. Setup the rendering scale by calling DisplayManager.init
// the workPpm parameter indicates the pixels-per-meter value that will be used to render the lot.
//
// If this value is 50, a 1 meter edge will have 50 pixels, a 1.5 meter edge will have 75 pixels etc.
DisplayManager.init(
    // util function that calculates the PPM from the Display scale (e.g. 1m:100m) and DPI of the screen (e.g. 72, 144 etc.)
    DisplayManager.getPpm(
        // The default display scale is 1:200
        DisplayManager.DEFAULT_SCALE,
        // The default DPI of the screen (72 dots per inch)
        DisplayManager.DEFAULT_DPI
    )
);

const lotDrawerSteps = Object.freeze({
    STAGE_LOT_SELECT: {id: 0, path: StageLots.componentUrl, args: ['estateId']},
    PAGE_POS_SELECT: {id: 1, path: PosPages.componentUrl, args: ['lotId']},
    DRAW_LOT: {id: 2, path: LotDrawer.componentUrl, args: ['lotId']},
    LOT_DETAILS: {id: 3, path: LotDetails.componentUrl, args: ['lotId']},
});

class LotDrawerContainer extends Component {
    static componentUrl = '/landspot/lot-drawer';
    static propTypes = {
        lotDrawer: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.defaultDrawerData = {
            stageId: null,
            estateId: null,
            lotId: null,
            pageId: null,
        };

        this.state = {
            currentStep: lotDrawerSteps.STAGE_LOT_SELECT.id,
            locationKey: null,
            preloader: true,
            drawerData: {...this.defaultDrawerData}
        };
    }

    componentDidUpdate(prevProps) {
        const {
            lotDrawer: {nextStep, EXPORT_COMPLETE},
        } = this.props;

        if (nextStep || nextStep === 0) {
            this.setNextStep(nextStep);
        }

        if (!EXPORT_COMPLETE && prevProps.lotDrawer.EXPORT_COMPLETE) {
            this.setState({preloader: false});
        }
    }

    getStepUrl = (stepName) => {
        let url = lotDrawerSteps[stepName].path;
        if (lotDrawerSteps[stepName].args) {
            url = lotDrawerSteps[stepName].args.reduce((url, argName) => {
                const varName = this.state.drawerData[argName];
                if (!varName || !url) {
                    return null;
                }
                return url.replace(`:${argName}`, encodeURIComponent(varName));
            }, url);
        }
        return url;
    };

    saveDrawerData = (nextStep, complete = false) => {
        const {drawerData}     = this.state;
        const {saveLotRawData} = this.props;
        if (drawerData.lotId) {
            saveLotRawData({...drawerData, nextStep, complete}, {id: drawerData.lotId});
            this.setState({preloader: true});
        }
    };

    setNextStep = (nextStep, withState = false) => {
        Object.keys(lotDrawerSteps).some(stepName => {
            if (lotDrawerSteps[stepName].id === nextStep) {
                const pathname = this.getStepUrl(stepName);
                if (pathname && nextStep !== this.state.currentStep) {
                    const state = withState ? this.state : null;
                    this.props.history.push({
                        pathname,
                        state
                    });
                    this.resetDrawerData();
                    this.setState({preloader: true});
                    store.dispatch({type: 'RESET_DRAWER_STATE'});
                }
            }
        });
    };

    setCurrentStep = (stepName) => {
        if (lotDrawerSteps.hasOwnProperty(stepName)) {
            this.setState({currentStep: lotDrawerSteps[stepName].id});
        }
    };

    setDrawerData = (data, callback) => {
        const drawerData = {...this.state.drawerData, ...data};
        this.setState({drawerData}, callback);
    };

    resetDrawerData = () => {
        this.setState({drawerData: {...this.defaultDrawerData}});
    };

    static showErrors = (propsErrors, error) => {
        let errors = [];
        typeof propsErrors === 'object'
            ? Object.keys(propsErrors).forEach((error, i) => {
                const message = propsErrors[error];
                errors[i] = {
                    message,
                };
            })
            : errors.push(propsErrors);

        if (errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
        }

        store.dispatch({type: actions.RESET_DRAWER_MESSAGES});
    };

    static getDerivedStateFromProps(props, state) {
        const {
            location: {key: locationKey = ''},
            lotDrawer: {DRAWER_UPDATED, EXPORT_COMPLETE, errors, nextStep},
            alert: {error}
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (errors) {
            LotDrawerContainer.showErrors(errors, error);
            newState.preloader = false;
        }

        if (DRAWER_UPDATED) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_DRAWER_UPDATED'});
        }

        if (EXPORT_COMPLETE) {
            newState.preloader = true;
        }

        if (nextStep) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_STEP_FROM_STORE'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    render() {
        const {
            preloader, drawerData: {estateId}
        } = this.state;

        const lotDrawerContextValues = {
            state: this.state,
            setCurrentStep: this.setCurrentStep,
            setNextStep: this.setNextStep,
            setDrawerData: this.setDrawerData,
            resetDrawerData: this.resetDrawerData,
            saveDrawerData: this.saveDrawerData,
        };
        return (
            <React.Fragment>
                {preloader && <LoadingSpinner className={'overlay'}/>}

                <LotDrawerContext.Provider value={lotDrawerContextValues}>
                    <Switch>
                        <Route exact path={StageLots.componentUrl} component={StageLotsInstance}/>
                        <Route exact path={PosPages.componentUrl} component={PosPagesInstance}/>
                        <Route exact path={LotDrawer.componentUrl} component={LotDrawerInstance}/>
                        <Route exact path={LotDetails.componentUrl} component={LotDetailsInstance}/>
                    </Switch>
                </LotDrawerContext.Provider>

                {estateId &&
                <a href={`/landspot/estate/${estateId}`}
                   className='button transparent exit-button'>
                    Exit Lot Drawer
                </a>
                }
            </React.Fragment>
        );
    }
}

const LotDrawerContainerInstance = withAlert(connect((state) => ({
    lotDrawer: state.lotDrawer,
}), actions)(LotDrawerContainer));

export {LotDrawerContainerInstance, LotDrawerContainer};