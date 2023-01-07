import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import _ from 'lodash';
import CompoundSlider from '~sitings~/helpers/CompoundSlider';
import HouseSlider from '~sitings~/helpers/HouseSlider';
import {NiceCheckbox} from '~sitings~/helpers';
import {DrawerContext} from '../../DrawerContainer';
import CanvasModel from '../CanvasModel';
import StructurePoint from '~/sitings-sdk/src/sitings/model/structure/StructurePoint';
import StructureRectangle from '~/sitings-sdk/src/sitings/model/structure/StructureRectangle';
import TransformationModel from '~/sitings-sdk/src/sitings/model/house/transform/TransformationModel';
import MeasurementPointEvent from '~/sitings-sdk/src/sitings/events/MeasurementPointEvent';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import UserAction from '../consts';
import Builder from '~/sitings-sdk/src/sitings/data/Builder';
import {HouseRadio} from '~sitings~/helpers/HouseRadio';
import TrashPng from '~/../img/Trash.svg';

function rotationFormatter(d) {
    return `ROTATION ${d}°`;
}

const modelModes = Object.freeze({
    MODE_EXTENSION: 1,
    MODE_REDUCTION: 2,
    MODE_ADD_ON: 3,
    MODE_TREE: 4,
    MODE_STRUCTURE: 5,
    MODE_RAINWATER: 6,
});

class HouseDetails extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired,
        companyLoaded: PropTypes.bool.isRequired,
        setUserAction: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            modelMode: null
        };
    }

    componentDidMount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.multiTransforms.addEventListener(MeasurementPointEvent.EDIT, this.editMeasurement, this);
    }

    componentWillUnmount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.multiTransforms.removeEventListener(MeasurementPointEvent.EDIT, this.editMeasurement, this);
    }

    componentDidUpdate(prevProps) {
    }

    editMeasurement = (e) => {
        const {setUserAction} = this.props;
        /**
         * @type {IMeasurement}
         */
        let measurementModel = e.point;

        setUserAction(UserAction.EDIT_MEASUREMENT, {measurementModel});
    };

    addModification = (modelMode) => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();

        switch (modelMode) {
            case modelModes.MODE_STRUCTURE: {
                const pool = new StructureRectangle(
                    StructureRectangle.POOL,
                    0,  // X coordinate in Meters; 0 by default
                    0,  // Y Coordinate in Meters; 0 by default,
                    10, // Width in meters
                    5   // Height in meters
                );
                // rotate the pool 90 degrees;
                pool.rotation = 90;
                canvasModel.structures.addStructure(pool);
                break;
            }
            case modelModes.MODE_RAINWATER: {
                const rainwaterPad = new StructureRectangle(
                    StructureRectangle.RWT_PAD,
                    0,
                    0,
                    3,
                    0.9
                );
                canvasModel.structures.addStructure(rainwaterPad);
                break;
            }
            case modelModes.MODE_TREE: {
                let tree = new StructurePoint(
                    StructurePoint.TREE,
                    0, // X coordinate in Meters; 0 by default
                    0, // Y coordinate in Meters; 0 by default,
                    1.5, // Tree Radius, in Meters
                );
                canvasModel.structures.addStructure(tree);
                break;
            }
            case modelModes.MODE_EXTENSION: {
                const extension = new TransformationModel(false, TransformationModel.EXTENSION);
                extension.widthString  = '4';
                extension.heightString = '20';
                // add the transformation to the currently selected floor
                canvasModel.multiFloors.crtFloor.transformations.addTransformation(extension);
                break;
            }
            case modelModes.MODE_ADD_ON: {
                const addOn = new TransformationModel(true, TransformationModel.ADDON);
                addOn.widthString  = '7';
                addOn.heightString = '2';
                canvasModel.multiFloors.crtFloor.transformations.addTransformation(addOn);
                break;
            }
            case modelModes.MODE_REDUCTION: {
                const reduction = new TransformationModel(false, TransformationModel.REDUCTION);
                reduction.widthString  = '2.2';
                reduction.heightString = '20';
                // add the transformation to the currently selected floor
                canvasModel.multiFloors.crtFloor.transformations.addTransformation(reduction);
                break;
            }
            default: {
                break;
            }
        }

        this.setState({modelMode});

        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    onModificationChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    render() {
        const {modelMode} = this.state;
        let {companyLoaded} = this.props;
        const houseRotation = _.get(this.props, 'drawerData.sitingSession.multiFloors.layers.0.rotation', null);
        const canvasRotation = _.get(this.props, 'drawerData.rotation', null);
        const rotation = canvasRotation + houseRotation;
        const hasModifications = AccountMgr.i.builder ? AccountMgr.i.builder.hasExtendReduce : false;

        let trees = [];
        let structures = [];
        let transformations = [];

        companyLoaded = true;

        if (companyLoaded) {
            const canvasModel = CanvasModel.getModel();
            const {
                structures: {
                    structures: modelStructures
                },
                multiFloors: {crtFloor}
            } = canvasModel;
            trees = modelStructures.filter(structure => structure.type === StructurePoint.TREE);
            structures = modelStructures.filter(structure => structure.dataType === StructureRectangle.DATA_TYPE);
            transformations = crtFloor ? crtFloor.transformations.transformations : [];
        }

        return (
            <div className='lot-settings'>
                {hasModifications &&
                <React.Fragment>
                    <div className='header'>House modifications</div>
                    <div className="easements">
                        <div className="btn-group flex-start">
                            <div
                                    className={classnames('btn-primary', modelMode === modelModes.MODE_EXTENSION ? 'primary' : 'default')}
                                    onClick={() => this.addModification(modelModes.MODE_EXTENSION)}>
                                <i className="landconnect-icon plus"/> Extension
                            </div>
                            <div
                                    className={classnames('btn-primary', modelMode === modelModes.MODE_REDUCTION ? 'primary' : 'default')}
                                    onClick={() => this.addModification(modelModes.MODE_REDUCTION)}>
                                <i className="landconnect-icon plus"/> Reduction
                            </div>
                            <div
                                    className={classnames('btn-primary', modelMode === modelModes.MODE_ADD_ON ? 'primary' : 'default')}
                                    onClick={() => this.addModification(modelModes.MODE_ADD_ON)}>
                                <i className="landconnect-icon plus"/> Add on
                            </div>

                            {
                                (
                                    modelMode === modelModes.MODE_EXTENSION ||
                                    modelMode === modelModes.MODE_REDUCTION ||
                                    modelMode === modelModes.MODE_ADD_ON
                                ) &&
                                <div className="note">
                                    <i className="fal fa-exclamation-circle"/>
                                    Click to place onto the siting
                                </div>
                            }
                        </div>

                        <div className="easement">
                            <div className="blocks">
                                {
                                    transformations.map(
                                        (modification, modificationIndex) =>
                                            <Modification key={modificationIndex}
                                                          modification={modification}
                                                          modificationNo={modificationIndex + 1}
                                                          rotation={rotation}
                                                          modificationTitle={
                                                              (modification.type === TransformationModel.EXTENSION)
                                                                  ? 'Extension'
                                                                  : modification.type === TransformationModel.REDUCTION
                                                                  ? 'Reduction'
                                                                  : 'Add on'
                                                          }
                                                          onModificationChange={this.onModificationChange}
                                            />
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </React.Fragment>
                }

                <div className='header no-margin-bottom'>
                    <p>Trees</p>
                    <div
                        className={classnames('btn-primary', modelMode === modelModes.MODE_TREE ? 'primary' : 'default')}
                        onClick={() => this.addModification(modelModes.MODE_TREE)}>
                        <i className="landconnect-icon plus"/> Tree
                    </div>
                </div>
                <div className="easements">
                    <div className="btn-group">
                        {
                            modelMode === modelModes.MODE_TREE &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                Click to place onto the siting
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {
                                trees.map(
                                    (modification, modificationIndex) =>
                                        <Modification key={modificationIndex}
                                                      modification={modification}
                                                      modificationNo={modificationIndex + 1}
                                                      rotation={rotation}
                                                      modificationTitle={'Tree'}
                                                      onModificationChange={this.onModificationChange}
                                        />
                                )
                            }
                        </div>
                    </div>
                </div>


                <div className='header no-margin-bottom'>
                    <p>Pools / Sheds / Other</p>
                    <div
                        className={classnames('btn-primary', modelMode === modelModes.MODE_STRUCTURE ? 'primary' : 'default')}
                        onClick={() => this.addModification(modelModes.MODE_STRUCTURE)}>
                        <i className="landconnect-icon plus"/> Structure
                    </div>
                </div>
                <div className="easements">
                    <div className="btn-group">
                        {   AccountMgr.i.builder === Builder.ARLI_HOMES &&
                            <div
                                    className={classnames('btn-primary', modelMode === modelModes.MODE_RAINWATER ? 'primary' : 'default')}
                                    onClick={() => this.addModification(modelModes.MODE_RAINWATER)}>
                                <i className="landconnect-icon plus"/>Rainwater Pad
                            </div>
                        }

                        {
                            (false && modelMode === modelModes.MODE_STRUCTURE || modelMode === modelModes.MODE_RAINWATER) &&
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                Click to place onto the siting
                            </div>
                        }
                    </div>

                    <div className="easement">
                        <div className="blocks">
                            {
                                structures.map(
                                    (modification, modificationIndex) =>
                                        <Modification key={modificationIndex}
                                                      modification={modification}
                                                      modificationNo={modificationIndex + 1}
                                                      rotation={rotation}
                                                      modificationTitle={'Structure'}
                                                      onModificationChange={this.onModificationChange}
                                        />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const Modification = ({modification, onModificationChange, modificationNo, modificationTitle, rotation}) => {
    const type = modification.type;
    const isStructure = modification.dataType === StructureRectangle.DATA_TYPE;
    const isPool = type === StructureRectangle.POOL;
    const isRainwater = type === StructureRectangle.RWT_PAD;
    const isTree = modification instanceof StructurePoint && type === StructurePoint.TREE;
    const isAddOn = modification instanceof TransformationModel && modification.isAddition;
    const inSiteCoverage = (isStructure || isTree) ? modification.includeInSiteCoverage : false;
    const isTransformation = modification instanceof TransformationModel;

    return (
        <div className="block">
            <div className="easement-number">
                {modificationNo}
            </div>
            <div className='wrap'>
                <div className='row'>
                    <div className="easement-type">
                        {isStructure
                            ? <div className='landconnect-input offset-meter-input long'>
                                <input type='text'
                                    autoComplete="off"
                                    onChange={e => {
                                        modification.labelText = e.target.value;
                                        onModificationChange();
                                    }}
                                    disabled={!isPool}
                                    onFocus={(event) => event.target.select()}
                                    placeholder=''
                                    value={modification.labelText || ''}
                                />
                                <span className='left-placeholder'>Label</span>
                                <span className='right-placeholder'>Text</span>
                            </div>
                            : !isTree ? modificationTitle: null
                        }
                        {isTree &&
                            <div className='landconnect-input offset-meter-input'>
                                <input type='number'
                                    autoComplete="off"
                                    onChange={(e) => {
                                        modification.radius = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        onModificationChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    placeholder=''
                                    value={modification.radius || ''}
                                />
                                <span className='left-placeholder'>Radius</span>
                                <span className='right-placeholder'>m</span>
                            </div>
                        }
                    </div>

                    <div className='house-control-wrap'>
                        {(!isStructure && !isTree && !isAddOn) &&
                        <div className='button transparent'
                                onClick={() => {
                                    modification.applied = !modification.applied;
                                    onModificationChange();
                                }}>
                            <i className={classnames('landconnect-icon', modification.applied ? 'eye' : 'eye-slash')}/>
                        </div>
                        }

                        <div className='button transparent delete-btn'
                                onClick={() => {
                                    (isStructure || isTree)
                                        ? modification.remove()
                                        : modification.deleteTransformation();
                                    onModificationChange();
                                }}>
                             <img src={TrashPng} />
                        </div>
                    </div>
                </div>
                <div className='easement-dimension double-inputs gap'>
                    {!isTree &&
                        <React.Fragment>
                            <div className='landconnect-input offset-meter-input'>
                                <input type='number'
                                    autoComplete="off"
                                    onChange={(e) => {
                                        if (isTransformation) {
                                            modification.widthString = e.target.value.slice(0, e.target.maxLength);
                                        }   else {
                                            modification.width = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        }

                                        onModificationChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    disabled={isRainwater}
                                    placeholder=''
                                    value={isTransformation ? modification.widthString : (modification.width || '')}
                                />
                                <span className='left-placeholder'>Width</span>
                                <span className='right-placeholder'>m</span>
                            </div>
                            <div className='landconnect-input offset-meter-input'>
                                <input type='number'
                                    autoComplete="off"
                                    onChange={(e) => {
                                        if (isTransformation) {
                                            modification.heightString = e.target.value.slice(0, e.target.maxLength);
                                        }   else {
                                            modification.height = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                        }

                                        onModificationChange();
                                    }}
                                    onFocus={(event) => event.target.select()}
                                    maxLength={5}
                                    disabled={isRainwater}
                                    placeholder=''
                                    value={isTransformation ? modification.heightString : (modification.height || '')}
                                />
                                <span className='left-placeholder'>Height</span>
                                <span className='right-placeholder'>m</span>
                            </div>
                        </React.Fragment>
                    }

                    {isStructure &&
                        <div className='house-detail slider'>
                            <HouseSlider min={-180} max={180} step={1}
                                            values={[modification.rotation || 0]}
                                            formatter={rotationFormatter}
                                            onUpdate={values => {
                                                modification.rotation = parseFloat(values[0]);
                                                onModificationChange();
                                            }}/>
                        </div>
                    }

                    {isStructure && !isRainwater &&
                        <div className="landconnect-input checkbox">
                            <HouseRadio
                                checked={inSiteCoverage}
                                label={`structure-${modificationNo}`}
                                name='Include in Site Coverage'
                                onChange={(value) => {
                                    modification.includeInSiteCoverage = !modification.includeInSiteCoverage;
                                    onModificationChange();
                                }}
                            />
                        </div>
                    }

                    {(!isStructure && !isTree && !isAddOn) &&
                        <div className='btn-group transformations gap'>
                            <div    
                                className={
                                    classnames(
                                        'transparent direction',
                                        modification.direction === TransformationModel.DIR_LEFT ? 'active' : ''
                                    )
                                }
                                style={{
                                    // transform: `rotate(${rotation}deg)`
                                }}
                                onClick={() => {
                                    modification.direction = TransformationModel.DIR_LEFT;
                                    onModificationChange();
                                }}>
                                <i className='landconnect-icon boundary-arrow-left'/>
                            </div>
                            <div    
                                className={
                                    classnames(
                                        'transparent direction',
                                        modification.direction === TransformationModel.DIR_RIGHT ? 'active' : ''
                                    )
                                }
                                style={{
                                    // transform: `rotate(${rotation}deg)`
                                }}
                                onClick={() => {
                                    modification.direction = TransformationModel.DIR_RIGHT;
                                    onModificationChange();
                                }}>
                                <i className='landconnect-icon boundary-arrow-right'/>
                            </div>
                            <div    
                                className={
                                    classnames(
                                        'transparent direction',
                                        modification.direction === TransformationModel.DIR_TOP ? 'active' : ''
                                    )
                                }
                                style={{
                                    // transform: `rotate(${rotation}deg)`
                                }}
                                onClick={() => {
                                    modification.direction = TransformationModel.DIR_TOP;
                                    onModificationChange();
                                }}>
                                <i className='landconnect-icon boundary-arrow-up'/>
                            </div>
                            <div    
                                className={
                                    classnames(
                                        'transparent direction',
                                        modification.direction === TransformationModel.DIR_BOTTOM ? 'active' : ''
                                    )
                                }
                                style={{
                                    // transform: `rotate(${rotation}deg)`
                                }}
                                onClick={() => {
                                    modification.direction = TransformationModel.DIR_BOTTOM;
                                    onModificationChange();
                                }}>
                                <i className='landconnect-icon boundary-arrow-down'/>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

const HouseDetailsConsumer = (props) => (
    <DrawerContext.Consumer>
        {
            ({
                 state: {drawerData}, setDrawerData, setUserAction
             }) => <HouseDetails  {...props} {...{
                drawerData, setDrawerData, setUserAction
            }}/>
        }
    </DrawerContext.Consumer>
);

const HouseDetailsInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), null)(HouseDetailsConsumer);

export default HouseDetailsInstance;