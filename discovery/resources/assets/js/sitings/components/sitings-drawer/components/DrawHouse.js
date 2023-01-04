import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {ToggleSwitch} from '~sitings~/helpers/ToggleSwitch';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import {DrawerContext} from '../DrawerContainer';
import * as actions from '../store/details/actions';
import StepNavigation from './StepNavigation';
import LotHouses from './sidebar/LotHouses';
import {CompanyDataContext} from './CompanyDataContainer';
import ModelEvent from '~/sitings-sdk/src/sitings/events/ModelEvent';

import CanvasModel from './CanvasModel';
import classnames from 'classnames';
import AccountMgr from '../../../../sitings-sdk/src/sitings/data/AccountMgr';


class DrawHouse extends Component {
    static componentUrl = '/sitings/drawer/:sitingId/houses';

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
        loadHouseData: PropTypes.func.isRequired
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
            loadSitingDrawer({sitingId}, {step: 'house'});
        }

        setCurrentStep('DRAW_HOUSE');
        setApplicationStep(ApplicationStep.IMPORT_FLOOR_PLAN);
    }

    componentWillUnmount() {
        this.removeMultiHouseListener();
    }

    componentDidUpdate(prevProps) {
        const {
            companyLoaded,
        } = this.props;
        if (companyLoaded && !prevProps.companyLoaded) {
            this.addMultiHouseListener();
        }
    }

    addMultiHouseListener = () => {
        const canvasModel   = CanvasModel.getModel();

        if (canvasModel && canvasModel.multiFloors) {
            canvasModel.multiFloors.addEventListener(ModelEvent.SELECT, this.newHouseModelSelected, this);
        }
    };

    removeMultiHouseListener = () => {
        const canvasModel   = CanvasModel.getModel();

        if (canvasModel && canvasModel.multiFloors) {
            canvasModel.multiFloors.removeEventListener(ModelEvent.SELECT, this.newHouseModelSelected, this);
        }
    };

    newHouseModelSelected = () => {
        // We must update the current floor selection
        this.forceUpdate();
    };

    selectFloor = (index) => {
        const floorsModel = CanvasModel.getModel().multiFloors;

        if (floorsModel) {
            floorsModel.selectFloorByIndex(index);
        }

        this.forceUpdate();
    };

    addFloor = () => {
        const floorsModel = CanvasModel.getModel().multiFloors;

        if (floorsModel) {
            floorsModel.addFloor();
        }

        this.forceUpdate();
    };

    deleteCurrentFloor = () => {
        const floorsModel = CanvasModel.getModel().multiFloors;

        if (floorsModel && floorsModel.crtFloor.canDelete) {
            floorsModel.crtFloor.deleteFloor();
        }

        this.forceUpdate();
    };

    render() {
        const {
            drawerData: {restored, mirrored},
            companyLoaded,
            loadHouseData
        } = this.props;

        let hasDualOcc = false;
        let canvasModel = null;
        let canDeleteFloor = false;

        if (companyLoaded) {
            canvasModel = CanvasModel.getModel();
            hasDualOcc  = AccountMgr.i.multihouse;

            if (hasDualOcc) {
                canDeleteFloor = canvasModel.multiFloors.crtFloor && canvasModel.multiFloors.crtFloor.canDelete;
            }
        }

        return (
            <React.Fragment>
                <div className="filter-bar">
                    <div className='sitting-header'>
                        <p className='letter'>Base Siting&nbsp;/&nbsp;</p>
                        <p className='letter-bold'>Step 3</p>
                        <div className='bar'></div>
                    </div>
                    <div className="filter-form">
                        <div className='first-row has-nav'>
                            <span className='filters-header'>House selection</span>
                        </div>

                        {hasDualOcc &&
                        <div className='btn-group-dual-occ'>
                            {
                                canvasModel.multiFloors.floors.map(
                                    (floor, index) =>
                                        <button type="button" key={index}
                                                className={classnames('button', (canvasModel.multiFloors.crtFloor === floor) ? 'primary' : 'default')}
                                                onClick={() => this.selectFloor(index)}>
                                            Floorplan {index + 1}
                                        </button>
                                )
                            }

                            <button type="button"
                                    className={classnames('button', 'default')}
                                    onClick={() => this.addFloor()}>
                                <i className="landconnect-icon plus"/> Add
                            </button>

                            <button type="button"
                                    className="button default"
                                    onClick={() => this.deleteCurrentFloor()}
                                    disabled={!canDeleteFloor}>
                                <i className="landconnect-icon times"/> Delete
                            </button>
                        </div>
                        }

                        <div className="step-note"/>

                        <LotHouses companyLoaded={restored} loadHouseData={loadHouseData}
                                   floorModel={canvasModel ? canvasModel.multiFloors.crtFloor : null} mirrored={mirrored} />
                    </div>
                </div>
                <StepNavigation saveState={true}/>
            </React.Fragment>
        );
    }
}

const DrawHouseConsumer = (props) => (
    <CompanyDataContext.Consumer>
        {
            ({setApplicationStep, companyLoaded, loadHouseData}) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData}, setCurrentStep, setDrawerData
                         }) => <DrawHouse  {...props} {...{
                            drawerData,
                            setCurrentStep,
                            setDrawerData,
                            setApplicationStep,
                            companyLoaded,
                            loadHouseData
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const DrawHouseInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), actions)(DrawHouseConsumer);

export {DrawHouseInstance};

export default DrawHouse;