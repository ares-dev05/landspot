import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {DrawerContext, tabs} from '../../DrawerContainer';
import CanvasModel from '../CanvasModel';
import MeasurementsLayerModel from '~/sitings-sdk/src/sitings/model/measure/MeasurementsLayerModel';
import MeasurementPointEvent from '~/sitings-sdk/src/sitings/events/MeasurementPointEvent';
import StreetModel from '~/sitings-sdk/src/sitings/model/lot/street/StreetModel';
import UserAction from '../consts';
import {CompanyDataContext} from '../CompanyDataContainer';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import HeightEnvelope from './HeightEnvelope';
import EventBase from '~/sitings-sdk/src/events/EventBase';
import {withAlert} from 'react-alert';
import AdvancedSiting from './AdvancedSiting';
import ThreeDControls from './ThreeDControls';
import NearmapControls from './NearmapControls';
import CanvasView from '~/sitings-sdk/src/sitings/view/SitingsView';
import SegmentationModel from '~/sitings-sdk/src/sitings/model/levels/segmentation/SegmentationModel';
import HomePng from '~/../img/Home.svg';
import FilePng from '~/../img/File.svg';

class Annotations extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired,
        setUserAction: PropTypes.func.isRequired,
        setEngineeringMode: PropTypes.func.isRequired,
        engineeringEnabled: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            currentMode: null,
        };
    }

    componentDidMount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.measurementsModel.addEventListener(MeasurementPointEvent.EDIT, this.editMeasurement, this);
        canvasModel.streetsModel.addEventListener(StreetModel.SNAP, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.addEventListener(EventBase.ADDED, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.segmentation.addEventListener(EventBase.CHANGE, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.segmentation.addEventListener(SegmentationModel.ADDED_BATTER, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.segmentation.addEventListener(SegmentationModel.ADDED_RETAINING, this.onCanvasModelChange, this);
        canvasModel.multiFloors.addEventListener('floorRotated', this.onCanvasModelChange, this, 100);
    }

    componentWillUnmount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.measurementsModel.removeEventListener(MeasurementPointEvent.EDIT, this.editMeasurement, this);
        canvasModel.streetsModel.removeEventListener(StreetModel.SNAP, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.removeEventListener(EventBase.ADDED, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.segmentation.removeEventListener(EventBase.CHANGE, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.segmentation.removeEventListener(SegmentationModel.ADDED_BATTER, this.onCanvasModelChange, this);
        canvasModel.lotTopographyModel.segmentation.removeEventListener(SegmentationModel.ADDED_RETAINING, this.onCanvasModelChange, this);
        canvasModel.multiFloors.removeEventListener('floorRotated', this.onCanvasModelChange, this);
    }

    componentDidUpdate() {
        const {
            heightVisualisationEnabled,
        } = this.props;
        if (heightVisualisationEnabled
            && (this.state.currentMode === MeasurementsLayerModel.MODE_SETBACK_RIGHT
            || this.state.currentMode === MeasurementsLayerModel.MODE_SETBACK_LEFT)){
            this.setCurrentMode(MeasurementsLayerModel.MODE_ENGINEERING_ALIGNMENT);
        }
    }

    editMeasurement = (e) => {
        const {measurementsModel} = CanvasModel.getModel();
        const {setUserAction} = this.props;
        const {currentMode} = this.state;

        switch (currentMode) {
            case MeasurementsLayerModel.MODE_SETBACK_LEFT: {
                measurementsModel.leftSetback = e.point;
                this.onCanvasModelChange();
                break;
            }
            case MeasurementsLayerModel.MODE_SETBACK_RIGHT: {
                measurementsModel.rightSetback = e.point;
                this.onCanvasModelChange();
                break;
            }
            default: {
                setUserAction(UserAction.EDIT_MEASUREMENT, {measurementModel: e.point});
                break;
            }
        }
    };

    setCurrentMode = (currentMode) => {
        this.setState({currentMode});
    };

    onCanvasModelChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    showAlignEngineering = () => {
        const {
            setEngineeringMode,
            engineeringEnabled,
            setPreviewWidth
        } = this.props;

        const newMode = !engineeringEnabled;

        // Toggle the engineering mode
        setEngineeringMode(newMode);
        this.setCurrentMode(newMode ? MeasurementsLayerModel.MODE_ENGINEERING_ALIGNMENT : null);
        setPreviewWidth(newMode === false ? 0 : 9999);
    };

    showNearmapsOverlay = () => {
        const {
            setNearmapsVisualisationMode,
            nearmapsVisualisationEnabled,
            setPreviewWidth
        } = this.props;

        const newMode = !nearmapsVisualisationEnabled;

        setNearmapsVisualisationMode(newMode);
        this.setCurrentMode(newMode ? MeasurementsLayerModel.MODE_NEARMAPS_ALIGNMENT : null);
        setPreviewWidth(newMode === false ? 0 : 9999);
    };

    exitToSiting = () => {
        const {
            setHeightVisualisationMode,
            setNearmapsVisualisationMode,
            setEngineeringMode,
            setPreviewWidth,
            setTab,
            drawerData: {engineeringPage},
            oldViewScale,
            setDrawerData,
        } = this.props;

        setHeightVisualisationMode(false);
        setTab(engineeringPage ? tabs.ENGINEERING.id : tabs.REFERENCE.id);

        this.setCurrentMode(null);

        const canvasModel = CanvasModel.getModel();
        const canvasView = new CanvasView(canvasModel);
        const viewScale = parseFloat(parseFloat(canvasView.viewScale)).toFixed(1)
        if (oldViewScale && oldViewScale.viewScale !== viewScale){
            setTimeout(setDrawerData, 1 ,oldViewScale );
        }

        setNearmapsVisualisationMode(false);
        setEngineeringMode(false);
        setPreviewWidth(0);
    };

    render() {
        const {currentMode: modelMode} = this.state;
        const canvasModel = CanvasModel.getModel();
        const {currentMode} = canvasModel.measurementsModel;
        const {
            engineeringEnabled,
            heightVisualisationEnabled,
            threeDVisualisationEnabled,
            nearmapsVisualisationEnabled,
            drawerData,
            showTestEnvelope
        } = this.props;

        const props = {...this.props, ...this, ...this.state};
        const {
            streetsModel: {streets},
        } = canvasModel;

        if (AccountMgr.i.builder && AccountMgr.i.builder.hasAdvancedFeatures) {
            if (AccountMgr.i.builder.hasHeightEnvelope && heightVisualisationEnabled) {
                // This is actually the Height Envelope Module
                return <HeightEnvelope showTestEnvelope={this.exitToSiting}/>;
            }

            if (AccountMgr.i.builder.hasEngineering && engineeringEnabled) {
                return <AdvancedSiting {...props} modelMode={modelMode} testEnvelope={showTestEnvelope}/>;
            }

            if (threeDVisualisationEnabled) {
                return <ThreeDControls />;
            }
        }

        if (AccountMgr.i.builder.hasNearmapOverlay && nearmapsVisualisationEnabled) {
            return <NearmapControls exitToSiting={this.exitToSiting} />;
        }

        const engineeringAvailable = AccountMgr.i.builder.hasEngineering && (drawerData.engineeringPlan || drawerData.engineeringPage);
        const nearmapAvailable     = AccountMgr.i.builder.hasNearmapOverlay;

        return (
            <div className={classnames('lot-settings', engineeringEnabled && 'disabled')}>
                <div className='header no-margin-bottom'>
                    <p>Measurements</p>
                    <div
                        className={classnames('btn-primary', (modelMode && currentMode === MeasurementsLayerModel.MODE_MEASUREMENT) ? 'primary' : 'default')}
                        onClick={() => {
                            canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_MEASUREMENT;
                            this.setCurrentMode(MeasurementsLayerModel.MODE_MEASUREMENT);
                        }}>
                        <i className="landconnect-icon plus"/> Add
                    </div>
                </div>
                <div className="easements">
                    <div className="btn-group">
                        {
                            (
                                modelMode === MeasurementsLayerModel.MODE_MEASUREMENT
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                Select a lot boundary and then click on a house wall
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks"/>
                    </div>
                </div>

                <div className='header'>Align</div>
                <div className="easements">
                    <div className="btn-group">
                        <div
                                className={classnames('btn-primary', (modelMode && currentMode === MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT) ? 'primary' : 'default')}
                                onClick={() => {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT;
                                    this.setCurrentMode(MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT);
                                }}>
                            <i className="landconnect-icon plus"/> Align wall to boundary
                        </div>
                        <div
                                className={classnames('btn-primary', (modelMode && currentMode === MeasurementsLayerModel.MODE_PAGE_ALIGNMENT) ? 'primary' : 'default')}
                                onClick={() => {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_PAGE_ALIGNMENT;
                                    this.setCurrentMode(MeasurementsLayerModel.MODE_PAGE_ALIGNMENT);
                                }}>
                            <i className="landconnect-icon plus"/> Align to page
                        </div>

                        {
                            (
                                modelMode === MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT ||
                                modelMode === MeasurementsLayerModel.MODE_PAGE_ALIGNMENT
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                {modelMode === MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT ?
                                    'Select a lot boundary and then click on a house wall' :
                                    'Select a lot boundary and then click on the align direction'
                                }
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks"/>
                    </div>
                </div>

                <div className='header'>Private open space</div>
                <div className="easements">
                    <div className="btn-group">
                        <button type="button"
                                className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE) ? 'primary' : 'default')}
                                onClick={() => {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE;
                                    this.setCurrentMode(MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE);
                                }}>
                            <i className="landconnect-icon plus"/> Draw open space area
                        </button>

                        <button type="button" className="button transparent"
                                onClick={() => {
                                    canvasModel.posModel.clear();
                                }}>
                            <i className="landconnect-icon times"/> Clear Points
                        </button>

                        {
                            (
                                modelMode === MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                Click points on the siting to draw open space
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks"/>
                    </div>
                </div>


                <div className='header'>Street names</div>
                <div className="easements">
                    <div className="btn-group">
                        <button type="button"
                                className={classnames('button', currentMode === false ? 'primary' : 'default')}
                                onClick={() => {

                                }}>
                            <i className="landconnect-icon plus"/> Add street name
                        </button>

                        {
                            (
                                currentMode === false
                            ) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                Click to add to the siting
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {streets.map((annotation, annotationIndex) =>
                                <Annotation
                                    key={annotationIndex}
                                    annotation={annotation}
                                    annotationNo={annotationIndex + 1}
                                    onCanvasModelChange={this.onCanvasModelChange}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {(engineeringAvailable || nearmapAvailable) &&
                    <React.Fragment>
                        <div className='header'>Advanced Siting</div>
                        <div className="easements">
                            <div className="btn-group">
                                {drawerData.siting &&
                                    <button type="button"
                                            className={classnames('button', (currentMode === MeasurementsLayerModel.MODE_ENGINEERING_ALIGNMENT) ? 'primary' : 'default')}
                                            onClick={engineeringAvailable ? this.showAlignEngineering : this.showNearmapsOverlay}>
                                        Create Advanced Siting
                                    </button>
                                }
                            </div>
                        </div>
                    </React.Fragment>
                }
            </div>
        );
    }
}

const Annotation = ({annotation, onCanvasModelChange, annotationNo}) => {
    return (
        <div className="block street-names">
            <div className="easement-number street-names-number">
                {annotationNo}
            </div>

            <div className='easement-dimension street-names-input'>
                <div className='landconnect-input'>
                    <input type='text'
                           autoComplete="off"
                           onChange={(e) => {
                               annotation.text = e.target.value;
                               onCanvasModelChange();
                           }}
                           onFocus={(event) => event.target.select()}
                           placeholder='Street name'
                           value={annotation.text || ''}
                    />
                </div>
            </div>

            <button type="button" className='button transparent delete-btn'>
                <i className='landconnect-icon times'/>
            </button>
        </div>
    );
};


const AnnotationsConsumer = (props) => (
    <CompanyDataContext.Consumer>
        {
            ({setEngineeringMode, engineeringEnabled,
                 setHeightVisualisationMode, heightVisualisationEnabled,
                 threeDVisualisationEnabled,
                 setNearmapsVisualisationMode, nearmapsVisualisationEnabled,
                 showTestEnvelope, oldViewScale,
            }) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData, currentTab, previewWidth},
                             setDrawerData,
                             setUserAction,
                             setPreviewWidth,
                             setTab
                         }) => <Annotations  {...props} {...{
                            drawerData, setDrawerData, setUserAction, previewWidth, setPreviewWidth,
                            setEngineeringMode, engineeringEnabled, currentTab, setTab, heightVisualisationEnabled,
                            threeDVisualisationEnabled, setHeightVisualisationMode,
                            setNearmapsVisualisationMode, nearmapsVisualisationEnabled,
                            showTestEnvelope, oldViewScale,
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const AnnotationsInstance = withAlert(connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), null)(AnnotationsConsumer));

export default AnnotationsInstance;