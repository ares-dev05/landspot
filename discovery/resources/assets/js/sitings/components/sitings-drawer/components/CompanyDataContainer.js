import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import {LeftPanel, RightPanel} from '~sitings~/helpers/Panels';
import {LoadingSpinner} from '~sitings~/helpers';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import Builder from '~/sitings-sdk/src/sitings/data/Builder';
import LotPathModel from '~/sitings-sdk/src/sitings/model/lot/LotPathModel';
import {DrawerContext, tabs} from '../DrawerContainer';
import * as actions from '../store/details/actions';
import LotView from './canvas-view/LotView';
import PagePreview from './page/PagePreview';

import {
    ExportSiting, ExportSitingInstance, DrawHouseDetails, DrawHouseDetailsInstance,
    DrawAnnotations, DrawAnnotationsInstance, DrawEdges, DrawEdgesInstance,
    DrawEasements, DrawEasementsInstance, DrawHouse, DrawHouseInstance, ReferencePlan, ReferencePlanInstance
} from './index';

import CompanyData from './CompanyData';
import CanvasModel from './CanvasModel';
import CanvasView from '~/sitings-sdk/src/sitings/view/SitingsView';

export const CompanyDataContext = React.createContext();

class CompanyDataContainer extends Component {
    static propTypes = {
        userProfile: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this.state = {
            houseModel: null,
            preloader: false,
            applicationStep: ApplicationStep.IMPORT_FLOOR_PLAN,
            companyLoaded: false,
            traceEnabled: false,
            engineeringEnabled: false,
            heightVisualisationEnabled: false,
            threeDVisualisationEnabled: false,
            nearmapsVisualisationEnabled: false,
            metric: true,
            oldViewScale: null,
        };
    }

    componentDidMount() {
        const {
            setupDrawerCallback,
        } = this.props;
        setupDrawerCallback(this.initCompanyData);
    }

    componentDidUpdate(prevProps, prevState) {
        // const {
        //     drawerData: {sitingSession},
        // } = this.props;

        const {
            companyLoaded,
            engineeringEnabled,
        } = this.state;

        // if (companyLoaded) {
        //     const houseId     = _.get(sitingSession, 'multiFloors.layers.0.houseId', null);
        //     const prevHouseId = _.get(prevProps, 'sitingSession.drawerData.multiFloors.layers.0.houseId', null);
        //
        //     if (houseId || houseId !== prevHouseId) {
        //         const canvasModel = CanvasModel.getModel();
        //         const houseModel  = canvasModel.multiFloors.crtFloor;
        //         if (houseModel) {
        //             houseModel.addEventListener(ModelEvent.DROP, this.recordState, this);
        //         }
        //     }
        // }

        if (companyLoaded && !prevState.companyLoaded) {
            this.setDrawerData();
        }
        if (!this.state.oldViewScale && engineeringEnabled) {
            const canvasModel = CanvasModel.getModel();
            const canvasView = new CanvasView(canvasModel);
            const viewScale = parseFloat(parseFloat(canvasView.viewScale)).toFixed(1)
            this.setState({oldViewScale: {viewScale}});
        }

    }

    componentWillUnmount() {
        // const canvasModel = CanvasModel.getModel();
        // const houseModel  = canvasModel.multiFloors.crtFloor;

        // if (houseModel) {
        //     houseModel.removeEventListener(ModelEvent.DROP, this.recordState, this);
        // }
        CanvasModel.resetModel();
        this.props.resetDrawerData();
    }

    setDrawerData = () => {
        const {
            drawerDetails: {
                drawerData,
                siting
            },
            setDrawerData
        } = this.props;

        // Check if any house data needs to be loaded from the server
        const canvasModel = CanvasModel.getModel();
        const sitingSession = JSON.parse(drawerData.sitingSession || null);
        const restoringHouses = canvasModel.getRestoringHouseDatas(sitingSession);

        if (restoringHouses.length > 0) {
            // Load the data for all the houses in the siting that we're restoring.
            const loadingDatas = restoringHouses.map(
                houseData => this.loadHouseData(houseData)
            );

            Promise.all(loadingDatas).then(
                () => {
                    // Once the house data is loaded, continue the model restoration
                    setDrawerData({
                        sitingId: siting.id,
                        rotation: drawerData.rotation,
                        mirrored: drawerData.mirrored,
                        sitingSession: sitingSession,
                        viewScale: drawerData.view_scale,
                        northRotation: drawerData.north_rotation,
                        siting,
                    });
                }
            );
        } else {
            // no houses to load
            setDrawerData({
                sitingId: siting.id,
                rotation: drawerData.rotation,
                mirrored: drawerData.mirrored,
                sitingSession: sitingSession,
                viewScale: drawerData.view_scale,
                northRotation: drawerData.north_rotation,
                siting,
            });
        }
    };

    initCompanyData = () => {
        if (!this.state.companyLoaded) {
            const {
                drawerDetails: {
                    siting
                },
            } = this.props;

            console.log('initCompanyData', this.state)
            console.log('siting', siting)
            
            const {
                userSettings: {
                    state, builder, multihouse,
                    has_nearmap, nearmap_api_key
                }
            } = siting;
            this.setState({
                companyLoaded: false,
                themeLoaded: false,
                preloader: true
            });

            console.log('user settings: ', siting.userSettings);

            // Update the Account Manager with the current user settings
            AccountMgr.instance.update(
                state,
                !!parseInt(multihouse),
                Builder.fromName(builder),
                !!parseInt(has_nearmap),
                nearmap_api_key
            );

            CompanyData.resetModel();
            CompanyData.loadThemeFile(siting.themeURL)
                .then(() => {
                    this.setState({
                        companyLoaded: false,
                        themeLoaded: true,
                        preloader: true
                    });

                    CompanyData.loadCompanyFile(siting.xmlURL)
                        .then((companyData) => {
                            // Set the company data in the model in case it was created before the data was available
                            CanvasModel.getModel().companyData = companyData;
                            this.setState({
                                companyLoaded: true,
                                preloader: false
                            });
                        });
                });
            CompanyData.loadEnvelopeCatalogue(siting.envelopeURL)
                .then(catalogue => CanvasModel.getEnvelopeModel().envelopeCatalogue = catalogue);

            // @TODO @UNUSED
            // CompanyData.loadFacadeCatalogue(siting.facadeURL)
            //    .then(catalogue => CanvasModel.getEnvelopeModel().facadeCatalogue = catalogue);
        }
    };

    /**
     * @param houseData {HouseData}
     */
    loadHouseData = (houseData) => {
        if (houseData && houseData.id) {
            let {
                drawerDetails: {
                    siting: {
                        houseURL
                    }
                },
            } = this.props;

            houseURL = houseURL.replace('house-id', houseData.id);

            return CompanyData.loadHouseData(houseData, houseURL);
        }
    };

    setApplicationStep = (applicationStep) => {
        this.setState({applicationStep});
    };

    /**
     * Set the current trace mode for companies that have trace enabled
     * @param traceEnabled
     */
    setTraceMode = (traceEnabled) => {
        CanvasModel.getModel().pathModel.inputMode =
            traceEnabled ? LotPathModel.MODE_TRACING : LotPathModel.MODE_DATA_ENTRY;

        this.setState({traceEnabled});
    };

    /**
     * Enable / disable engineering overlay mode, for companies that have it enabled
     * @param engineeringEnabled
     */
    setEngineeringMode = (engineeringEnabled) => {
        if (engineeringEnabled) {
            const {setTab} = this.props;
            setTab(tabs.ENGINEERING.id);
        }

        this.setState({engineeringEnabled});
    };

    setHeightVisualisationMode = (heightVisualisationEnabled) => {
        if (heightVisualisationEnabled) {
            const {setTab} = this.props;
            setTab(tabs.HEIGHT_VISUALISATION.id);
        }
        this.setState({heightVisualisationEnabled});
        this.props.setHeightVisualisationMode(heightVisualisationEnabled);
    };

    setThreeDVisualisationMode = (threeDVisualisationEnabled) => {
        if (threeDVisualisationEnabled) {
            const {setTab} = this.props;
            setTab(tabs.THREE_D_VISUALISATION.id);
        }
        this.setState({threeDVisualisationEnabled});
        this.props.setThreeDVisualisationMode(threeDVisualisationEnabled);
    };

    setNearmapsVisualisationMode = (nearmapsVisualisationEnabled) => {
        if (nearmapsVisualisationEnabled) {
            const {setTab} = this.props;
            setTab(tabs.NEARMAPS_VISUALISATION.id);
        }
        this.setState({nearmapsVisualisationEnabled});
        this.props.setNearmapsVisualisationMode(nearmapsVisualisationEnabled);
    };

    /**
     * Sets the input mode for lot edges, envelopes, easements. Can be either metric or imperial.
     * @param metric
     */
    setMetric = (metric) => {
        this.setState({metric});
    };

    recordState = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    /**
     * Get the back navigation tab
     * @returns {string}
     */
    fetchBackTab = () => {
        const {drawerData: {referencePage, engineeringPage}} = this.props;
        const {heightVisualisationEnabled, threeDVisualisationEnabled, nearmapsVisualisationEnabled} = this.state;

        if (referencePage) {
            return tabs.REFERENCE.id;
        }
        if (engineeringPage) {
            return tabs.ENGINEERING.id;
        }
        if (heightVisualisationEnabled) {
            return tabs.HEIGHT_VISUALISATION.id;
        }
        if (threeDVisualisationEnabled) {
            return tabs.THREE_D_VISUALISATION.id;
        }
        if (nearmapsVisualisationEnabled) {
            return tabs.NEARMAPS_VISUALISATION.id;
        }

        return tabs.REFERENCE.id;
    };

    showEngineeringMode = () => {
        // if ()
    };

    /**
     * Height Envelopes
     */
    showTestEnvelope = () => {
        this.recordState();
        const {
            setPreviewWidth,
            saveDrawerData,
            setTab
        } = this.props;
        const {
            heightVisualisationEnabled,
        } = this.state;

        const newMode = !heightVisualisationEnabled;
        const backTab = this.fetchBackTab();

        if (newMode) {
            saveDrawerData(ApplicationStep.ADD_MEASUREMENTS);
            setTimeout(this.props.setDrawerData, 1, {viewScale: '2'});
        } else {
            setTimeout(this.props.setDrawerData, 1, this.state.oldViewScale);
        }

        this.setThreeDVisualisationMode(false);
        this.setNearmapsVisualisationMode(false);
        this.setHeightVisualisationMode(newMode);
        setTab(newMode ? tabs.HEIGHT_VISUALISATION.id : backTab);

        this.setEngineeringMode(!newMode);

        setPreviewWidth(9999);
    };

    /**
     * 3D Land Survey
     */
    show3DLandSurvey = () => {
        // save state before switching to 3D
        this.recordState();
        const {
            saveDrawerData,
            setTab
        } = this.props;
        const {
            threeDVisualisationEnabled,
        } = this.state;

        const newMode = !threeDVisualisationEnabled;
        const backTab = this.fetchBackTab();

        if (newMode) {
            saveDrawerData(ApplicationStep.ADD_MEASUREMENTS);
        }

        this.setHeightVisualisationMode(false);
        this.setNearmapsVisualisationMode(false);
        this.setThreeDVisualisationMode(newMode);
        setTab(newMode ? tabs.THREE_D_VISUALISATION.id : backTab);

        this.setEngineeringMode(!newMode);
    };

    /**
     * 3D Land Survey
     */
    showNearmapsOverlay = () => {
        // save state before switching to 3D
        this.recordState();
        const {
            saveDrawerData,
            setTab
        } = this.props;
        const {
            nearmapsVisualisationEnabled,
        } = this.state;

        const newMode = !nearmapsVisualisationEnabled;
        const backTab = this.fetchBackTab();

        if (newMode) {
            saveDrawerData(ApplicationStep.ADD_MEASUREMENTS);
        }

        this.setHeightVisualisationMode(false);
        this.setThreeDVisualisationMode(false);
        this.setNearmapsVisualisationMode(newMode);
        setTab(newMode ? tabs.NEARMAPS_VISUALISATION.id : backTab);

        this.setEngineeringMode(!newMode);
    };

    render() {
        const {
            preloader,
            companyLoaded,
            applicationStep,
            traceEnabled,
            engineeringEnabled,
            heightVisualisationEnabled,
            threeDVisualisationEnabled,
            nearmapsVisualisationEnabled,
            oldViewScale,
            metric
        } = this.state;

        return (
            <React.Fragment>
                {preloader && <LoadingSpinner className={'overlay'}/>}

                <CompanyDataContext.Provider value={{
                    setApplicationStep: this.setApplicationStep,
                    loadHouseData: this.loadHouseData,
                    setTraceMode: this.setTraceMode,
                    setEngineeringMode: this.setEngineeringMode,
                    showTestEnvelope: this.showTestEnvelope,
                    show3DLandSurvey: this.show3DLandSurvey,

                    setHeightVisualisationMode: this.setHeightVisualisationMode,
                    setThreeDVisualisationMode: this.setThreeDVisualisationMode,
                    setNearmapsVisualisationMode: this.setNearmapsVisualisationMode,

                    setMetric: this.setMetric,
                    recordState: this.recordState,
                    oldViewScale,
                    metric,
                    companyLoaded: false,
                    traceEnabled,
                    engineeringEnabled,
                    heightVisualisationEnabled,
                    threeDVisualisationEnabled,
                    nearmapsVisualisationEnabled,
                }}>
                    <LeftPanel className='sidebar'>
                        <Switch>
                            <Route exact path={ReferencePlan.componentUrl} component={ReferencePlanInstance}/>
                            <Route exact path={DrawEdges.componentUrl} component={ReferencePlanInstance}/>
                            <Route exact path={DrawEasements.componentUrl} component={DrawEasementsInstance}/>
                            <Route exact path={DrawHouse.componentUrl} component={DrawHouseInstance}/>
                            <Route exact path={DrawHouseDetails.componentUrl} component={DrawHouseDetailsInstance}/>
                            <Route exact path={DrawAnnotations.componentUrl} component={DrawAnnotationsInstance}/>
                            <Route exact path={ExportSiting.componentUrl} component={ExportSitingInstance}/>
                        </Switch>
                    </LeftPanel>
                </CompanyDataContext.Provider>

                <RightPanel className='flex-column drawer'>
                    {
                        (
                            (applicationStep === ApplicationStep.TRACE_OUTLINE)
                        ) &&
                        <PagePreview
                            oldViewScale={this.state.oldViewScale}
                            traceEnabled={traceEnabled}
                            engineeringEnabled={engineeringEnabled}
                            setEngineeringMode={this.setEngineeringMode}
                            showTestEnvelope={this.showTestEnvelope}
                            show3DLandSurvey={this.show3DLandSurvey}
                            showNearmapsOverlay={this.showNearmapsOverlay}
                            heightVisualisationEnabled={heightVisualisationEnabled}
                            threeDVisualisationEnabled={threeDVisualisationEnabled}
                            nearmapsVisualisationEnabled={nearmapsVisualisationEnabled}
                        />
                    }
                    
                    {companyLoaded &&
                        <LotView step={applicationStep}
                                engineeringEnabled={engineeringEnabled}
                                heightVisualisationEnabled={heightVisualisationEnabled}
                                threeDVisualisationEnabled={threeDVisualisationEnabled}
                                nearmapsVisualisationEnabled={nearmapsVisualisationEnabled}/>
                    }
                </RightPanel>
            </React.Fragment>
        );
    }
}

const CompanyDataContainerConsumer = (props) => (
    <DrawerContext.Consumer>
        {
            ({
                 state: {drawerData, locationKey, currentTab},
                 setTab,
                 setDrawerData,
                 resetDrawerData,
                 setupDrawerCallback,
                 setPreviewWidth,
                 saveDrawerData,
                 getPage,
                 setHeightVisualisationMode,
                 setThreeDVisualisationMode,
                 setNearmapsVisualisationMode,
        }) => <CompanyDataContainer  {...props} {...{
                drawerData,
                locationKey,
                setPreviewWidth,
                setDrawerData,
                saveDrawerData,
                resetDrawerData,
                setupDrawerCallback,
                getPage,
                currentTab,
                setHeightVisualisationMode,
                setThreeDVisualisationMode,
                setNearmapsVisualisationMode,
                setTab
            }}/>
        }
    </DrawerContext.Consumer>
);

const CompanyDataContainerInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
    userProfile: state.userProfile,
}), actions)(CompanyDataContainerConsumer);

export default CompanyDataContainerInstance;