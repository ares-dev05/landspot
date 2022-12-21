import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import {withAlert} from 'react-alert';
import {isEqual, get, unset} from 'lodash';

import * as actions from './store/details/actions';
import ReferencePlan, {ReferencePlanInstance} from './components/ReferencePlan';
import {
    DrawEdges, DrawEasements, DrawHouse, DrawHouseDetails, DrawAnnotations, ExportSiting,
    CompanyDataContainer
} from './components';
import {LoadingSpinner} from '~sitings~/helpers';
import DisplayManager from '~/sitings-sdk/src/utils/DisplayManager';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import CanvasModel from './components/CanvasModel';
import UserAction from './components/consts';
import DialogList from './components/dialogs/DialogList';

import store from '~sitings~/store';

export const DrawerContext = React.createContext();

function initializeDM() {
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
}

const drawerSteps = Object.freeze({
    REF_PLAN_SELECT: {id: 1, path: ReferencePlan.componentUrl},
    DRAW_EDGES: {id: ApplicationStep.TRACE_OUTLINE, path: DrawEdges.componentUrl, args: ['sitingId']},
    DRAW_EASEMENTS: {id: ApplicationStep.ADD_EASEMENT, path: DrawEasements.componentUrl, args: ['sitingId']},
    DRAW_HOUSE: {id: ApplicationStep.IMPORT_FLOOR_PLAN, path: DrawHouse.componentUrl, args: ['sitingId']},
    DRAW_HOUSE_DETAILS: {id: ApplicationStep.ADD_EXTENSIONS, path: DrawHouseDetails.componentUrl, args: ['sitingId']},
    DRAW_ANNOTATIONS: {id: ApplicationStep.ADD_MEASUREMENTS, path: DrawAnnotations.componentUrl, args: ['sitingId']},
    EXPORT_SITING: {id: ApplicationStep.EXPORT_PDF, path: ExportSiting.componentUrl, args: ['sitingId']},
});

export const tabs = Object.freeze({
    REFERENCE: {id: 'referencePlan', label: 'PLAN OF SUB'},
    ENGINEERING: {id: 'engineeringPlan', label: 'ENGINEERING'},
    HEIGHT_VISUALISATION: {id: 'heightVisualisation', label: 'HEIGHT VISUALISATION'},
    THREE_D_VISUALISATION: {id: 'threeDVisualisation', label: '3D MODE'},
    NEARMAPS_VISUALISATION: {id: 'nearmapsVisualisation', label: 'NEARMAP'},
});

class DrawerContainer extends Component {
    static componentUrl = '/sitings/drawer';
    static alert = null;

    static propTypes = {
        drawerDetails: PropTypes.object.isRequired,
        resetDrawerStore: PropTypes.func.isRequired,
        resetExportComplete: PropTypes.func.isRequired,
        resetMesages: PropTypes.func.isRequired,
        resetStepFromStore: PropTypes.func.isRequired,
        resetDrawerUpdated: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.drawerCallback = null;

        this.defaultDrawerData = {
            sitingId: null,
            importId: null,
            previewWidth: 300,
            zoom: 100,
            referencePage: null,
            engineeringPage: null,
            referencePlan: null,
            engineeringPlan: null,
            heightVisualisationEnabled: false,
            threeDVisualisationEnabled: false,
            nearmapsVisualisationEnabled: false,
        };

        this.state = {
            currentStep: drawerSteps.REF_PLAN_SELECT.id,
            locationKey: null,
            preloader: true,
            drawerData: {...this.defaultDrawerData},
            userAction: null,
            userActionData: null,
            currentTab: tabs.REFERENCE.id
        };

        initializeDM();
    }

    componentDidMount() {
        DrawerContainer.alert = this.props.alert;
    }

    componentDidUpdate(prevProps) {
        const {
            drawerDetails: {
                nextStep,
                DRAWER_UPDATED,
                OPEN_DIALOG,
                EXPORT_PDF,
            },
        } = this.props;

        if (nextStep !== undefined) {
            this.setNextStep(nextStep);
        }

        if (DRAWER_UPDATED && nextStep === undefined) {
            if (this.drawerCallback) {
                this.drawerCallback();
            }
        }

        if (!prevProps.drawerDetails.EXPORT_PDF && EXPORT_PDF) {
            const url = `/sitings/drawer/download/pdf/${this.state.drawerData.sitingId}`;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'file.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            store.dispatch({type: 'RESET_EXPORT_PDF'});
        }
        if (!prevProps.drawerDetails.OPEN_DIALOG && OPEN_DIALOG) {
            this.setUserAction(UserAction.OPEN_PROCEED_DIALOG);
            store.dispatch({type: 'RESET_OPEN_DIALOG'});
        }


        if (this.props.drawerDetails.drawerData !== prevProps.drawerDetails.drawerData && this.props.drawerDetails.drawerData) {
            const {
                drawerData: {page: referencePage, engineering_page: engineeringPage, siting_id, ...propDrawerData},
                siting
            } = this.props.drawerDetails;

            delete propDrawerData.sitingSession;

            const currentTab = referencePage
                ? tabs.REFERENCE.id
                : engineeringPage
                    ? tabs.ENGINEERING.id
                    : this.state.currentTab;

            const drawerData = {
                ...this.state.drawerData,
                ...propDrawerData,
                referencePage,
                engineeringPage,
                sitingId: get(siting, 'id', siting_id)
            };
            this.setState({drawerData, currentTab});
        }
    }

    componentWillUnmount() {
        DrawerContainer.alert = null;
        this.props.resetDrawerStore();
    }

    getStepUrl = (stepName) => {
        let url = drawerSteps[stepName].path;
        if (drawerSteps[stepName].args) {
            url = drawerSteps[stepName].args.reduce((url, argName) => {
                const varName = this.state.drawerData[argName];
                if (!varName || !url) {
                    return null;
                }
                return url.replace(`:${argName}`, encodeURIComponent(varName));
            }, url);
        }
        return url;
    };

    saveDrawerData = (nextStep, exportType = null) => {
        const {drawerData} = this.state;
        const {saveRawData} = this.props;

        if (drawerData.sitingId) {
            unset(drawerData, 'sitingSession.multiFloors.companyData');
            if (drawerData.restored) {
                const canvasModel = CanvasModel.getModel();
                drawerData.sitingSession = canvasModel.recordState();
            }

            const data = {
                ...drawerData,
                pageId: get(drawerData, 'referencePage.id', null),
                pageIdEngineering: get(drawerData, 'engineeringPage.id', null)
            }

            saveRawData(
                {
                    ...data,
                    nextStep,
                    exportType
                },
                {...data}
            );

            if (exportType) {
                this.setState({preloader: true});
            }
        }
    };

    setNextStep = (nextStep, withState = false) => {
        Object.keys(drawerSteps).some(stepName => {
            if (drawerSteps[stepName].id === nextStep) {
                const pathname = this.getStepUrl(stepName);
                if (pathname && nextStep !== this.state.currentStep) {
                    const state = (withState || nextStep === drawerSteps['REF_PLAN_SELECT'].id) ? this.state : null;

                    this.props.history.push({
                        pathname,
                        state
                    });
                }
            }
            return false;
        });
    };

    setCurrentStep = (stepName) => {
        if (drawerSteps.hasOwnProperty(stepName)) {
            this.setState({currentStep: drawerSteps[stepName].id});
        }
    };

    setHeightVisualisationMode = (heightVisualisationEnabled) => {
        this.setState({heightVisualisationEnabled});
    };

    setThreeDVisualisationMode = (threeDVisualisationEnabled) => {
        this.setState({threeDVisualisationEnabled});
    };

    setNearmapsVisualisationMode = (nearmapsVisualisationEnabled) => {
        this.setState({nearmapsVisualisationEnabled});
    };

    setDrawerData = (data, callback) => {
        const drawerData = {...this.state.drawerData, ...data};
        this.setState({drawerData}, callback);
    };

    resetDrawerData = () => {
        this.setState({drawerData: {...this.defaultDrawerData}});
    };

    setupDrawerCallback = (callback) => this.drawerCallback = callback;

    static showErrors = (propsErrors) => {
        const {error} = DrawerContainer.alert;
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
                (error, errorIndex) => <div key={errorIndex}>{error
                    ? typeof error.message === 'string'
                        ? error.message
                        : ''
                    : 'Something went wrong'}
                </div>
            ));
        }
    };

    static getDerivedStateFromProps(props, state) {
        const {
            location: {key: locationKey = ''},
            drawerDetails: {
                DRAWER_UPDATED,
                EXPORT_COMPLETE,
                errors,
                exportType,
                ajax_success,
                nextStep,
            },
        } = props;
        let newState = {};

        if (state.locationKey !== locationKey) {
            newState.locationKey = locationKey;
        }

        if (errors) {
            DrawerContainer.showErrors(errors);
            newState.preloader = false;
            props.resetMesages();
        }

        if (ajax_success) {
            const {success} = DrawerContainer.alert;
            success(ajax_success);
            newState.preloader = false;
            props.resetMesages();
        }

        if (EXPORT_COMPLETE) {
            if (exportType && (exportType === UserAction.SAVE_AND_EXPORT)) {
                DrawerContainer.downloadPDF(state);
            }
            props.resetExportComplete();
        }

        if (DRAWER_UPDATED) {
            newState.preloader = false;
            props.resetDrawerUpdated();
        }

        if (nextStep) {
            newState.preloader = false;
            props.resetStepFromStore();
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    static downloadPDF = (state) => {
        const {siting} = state.drawerData;

        let a = document.createElement('a');
        document.body.append(a);
        a.href = `/sitings/drawer/download/pdf/${siting.id}`;
        a.click();
        a.remove();
    };

    setUserAction = (action, actionData, noActionToggle) => {
        console.log(
            'ACTION: ' + (action ? action.toString() : 'none'),
            actionData
        );

        const {userAction, userActionData} = this.state;
        const actionChanged =
            action !== userAction ||
            (actionData != null && !isEqual(actionData, userActionData));

        if (actionChanged) {
            this.setState({
                userAction: action,
                userActionData: actionData || null
            });
        } else if (!noActionToggle) {
            this.setState({
                userAction: null,
                userActionData: null

            });
        }
    };

    resiteLot = () => {
        const {drawerData} = this.state;
        const {resiteLot} = this.props;

        if (drawerData.sitingId) {
            unset(drawerData, 'sitingSession.multiFloors.companyData');
            if (drawerData.restored) {
                const canvasModel = CanvasModel.getModel();
                drawerData.sitingSession = canvasModel.recordLotState();
            }

            resiteLot(
                {
                    ...drawerData,
                    nextStep: ApplicationStep.IMPORT_FLOOR_PLAN
                },
                {
                    ...drawerData
                },
            );

            this.setState({preloader: true});
        }

        this.setupDrawerCallback(this.setResiteDrawerData);
    };

    setResiteDrawerData = () => {
        const {
            drawerDetails: {
                resiteSiting: {
                    resiteUrl
                }
            },
        } = this.props;

        if (resiteUrl) {
            window.location.replace(resiteUrl);
        }
    };

    setTab = (tab) => {
        const {currentTab} = this.state;
        if (currentTab !== tab) {
            this.setState({
                currentTab: tab
            });
        }
    }

    setPreviewWidth = (previewWidth) => {
        this.setState({drawerData: {...this.state.drawerData, previewWidth}});
    }

    getPage = () => {
        const {drawerData: {referencePage, engineeringPage}, currentTab} = this.state;

        switch (currentTab) {
            case tabs.REFERENCE.id: {
                return referencePage;
            }
            case tabs.ENGINEERING.id: {
                return engineeringPage;
            }
        }

        return null;
    }

    render() {
        const {
            preloader, drawerData: {currentStep}
        } = this.state;

        const drawerContextValues = {
            state: this.state,
            setCurrentStep: this.setCurrentStep,
            setNextStep: this.setNextStep,
            setDrawerData: this.setDrawerData,
            resetDrawerData: this.resetDrawerData,
            saveDrawerData: this.saveDrawerData,
            showErrors: DrawerContainer.showErrors,
            setupDrawerCallback: this.setupDrawerCallback,
            setUserAction: this.setUserAction,
            resiteLot: this.resiteLot,
            setTab: this.setTab,
            getPage: this.getPage,
            setPreviewWidth: this.setPreviewWidth,
            setHeightVisualisationMode: this.setHeightVisualisationMode,
            setThreeDVisualisationMode: this.setThreeDVisualisationMode,
            setNearmapsVisualisationMode: this.setNearmapsVisualisationMode,
        };
        return (
            <React.Fragment>
                {preloader && <LoadingSpinner className={'overlay'}/>}

                <DrawerContext.Provider value={drawerContextValues}>
                    <DialogList/>
                    <Switch>
                        <Route exact path={ReferencePlan.componentUrl} component={ReferencePlanInstance}/>
                        <Route exact path={DrawEdges.componentUrl} component={CompanyDataContainer}/>
                        <Route exact path={DrawEasements.componentUrl} component={CompanyDataContainer}/>
                        <Route exact path={DrawHouse.componentUrl} component={CompanyDataContainer}/>
                        <Route exact path={DrawHouseDetails.componentUrl} component={CompanyDataContainer}/>
                        <Route exact path={DrawAnnotations.componentUrl} component={CompanyDataContainer}/>
                        <Route exact path={ExportSiting.componentUrl} component={CompanyDataContainer}/>
                    </Switch>
                </DrawerContext.Provider>

                {currentStep > 0 &&
                <button className='button transparent exit-button'
                        onClick={() => console.log('Save sitings')}>
                    Save sitings
                </button>
                }
            </React.Fragment>
        );
    }
}

const DrawerContainerInstance = withAlert(connect((state) => (
    {drawerDetails: state.sitingsDrawerDetails}
), actions)(DrawerContainer));

export {DrawerContainerInstance, DrawerContainer};