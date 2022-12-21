import classnames from 'classnames';
import LevelPoints from '../page/LevelPoints';
import BatterLine from '../page/BatterLine';
import RetainingWall from '../page/RetainingWall';
import React, {useEffect, useState} from 'react';
import {ToggleSwitch} from '~sitings~/helpers/ToggleSwitch';
import CanvasModel from '../CanvasModel';
import MeasurementsLayerModel from '~/sitings-sdk/src/sitings/model/measure/MeasurementsLayerModel';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import NiceDropdown from '~sitings~/helpers/NiceDropdown';
import FacadeSettingsFactory from '../../../../../sitings-sdk/src/sitings/data/envelope/FacadeSettingsFactory';

const canvasModel   = CanvasModel.getModel();
const envelopeModel = CanvasModel.getEnvelopeModel();


const onLevelsPointDelete = (point, onCanvasModelChange) => {
    point.deletePoint();
    onCanvasModelChange();

    const {lotTopographyModel: {pointLevels}, fallTopologyModel} = canvasModel;
    if (pointLevels.length <= 1) {
        fallTopologyModel.enabled = false;
    }
};

/**
 * @param batter {SegmentationPath}
 * @param onCanvasModelChange
 */
const onLevelsPathDelete = (batter, onCanvasModelChange) => {
    batter.deletePath();
    onCanvasModelChange();
};

/**
 * @param wall {ExistingRetainingWall}
 * @param onCanvasModelChange
 */
const onRetainingWallDelete = (wall, onCanvasModelChange) => {
    wall.deleteWall();
    onCanvasModelChange();
};

const AdvancedSiting = (props) => {
    const [state, setState] = useState({
        slabHeight: 0,
        garageDropdown: 0,
        // porchDropdown: 0,
        // alfrescoDropdown: 0,
        vegScrape: 0,
        developerFill: 0,
    });

    useEffect(() => {
        // const defaultSlab = envelopeModel.transformations.transformations.find(point => point.isSlab).data;
        updateState({
            slabHeight: envelopeModel.facade.slab.height,
            garageDropdown: envelopeModel.facade.slab.garageDropdown,
            // porchDropdown: envelopeModel.facade.slab.porchDropdown,
            // alfrescoDropdown: envelopeModel.facade.slab.alfrescoDropdown,
            vegScrape: envelopeModel.siteWorks.topography.vegScrape,
            developerFill: envelopeModel.siteWorks.topography.developerFill.height*1000,
        });
        return () => {};
    }, []);

    const updateState = (data) => {
        setState({...state, ...data});
    };
    const setSlabHeight = value => {
        // envelopeModel.transformations.transformations.find(point => point.isSlab).data = x;
        envelopeModel.facade.slab.height = value;
        updateState({slabHeight: value});
    };
    const setGarageDropdown = value => {
        envelopeModel.facade.slab.garageDropdown = value;
        updateState({garageDropdown: value});
    };
    const setDeveloperFill = value => {
        envelopeModel.siteWorks.topography.developerFill.height = value/1000;
        updateState({developerFill: value});
    };
    /*
    const setPorchDropdown = value => {
        envelopeModel.facade.slab.porchDropdown = value;
        updateState({porchDropdown: value});
    };
    const setAlfrescoDropdown = value => {
        envelopeModel.facade.slab.alfrescoDropdown = value;
        updateState({alfrescoDropdown: value});
    };
     */
    const setVegScrape = value => {
        envelopeModel.siteWorks.topography.vegScrape = value;
        updateState({vegScrape: value});
    };

    const {modelMode, currentMode, testEnvelope} = props;
    const {lotTopographyModel: {pointLevels, allLevelPoints, segmentation: {batters, retaining}}} = canvasModel;

    return (
        <div className='lot-settings'>
            <div className='header'>Height levels</div>
            <div className="easements">
                <div className="btn-group">
                    <button type="button"
                            className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_LEVELS) ? 'primary' : 'default')}
                            onClick={() => {
                                if (canvasModel.measurementsModel.currentMode !== MeasurementsLayerModel.MODE_LEVELS) {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_LEVELS;
                                    props.setCurrentMode(MeasurementsLayerModel.MODE_LEVELS);
                                } else {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_ENGINEERING_ALIGNMENT;
                                    props.setCurrentMode(MeasurementsLayerModel.MODE_ENGINEERING_ALIGNMENT);
                                }
                            }}>
                        <i className="landconnect-icon plus"/> Add height level
                    </button>

                    {(modelMode === MeasurementsLayerModel.MODE_LEVELS && !pointLevels.length) &&
                    <div className="note">
                        <i className="fal fa-exclamation-circle"/>
                        Click points on the lot boundary
                    </div>
                    }
                </div>
                <div className="easement">
                    <div className="blocks">
                        {pointLevels.map((point, i) =>
                            <LevelPoints
                                key={i}
                                point={point}
                                pointNo={i + 1}
                                onCanvasModelChange={props.onCanvasModelChange}
                                onPointDelete={(point) => onLevelsPointDelete(point, props.onCanvasModelChange)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className='header'>Batter Lines</div>
            <div className="easements">
                <div className="btn-group">
                    <button type="button"
                            className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_BATTER) ? 'primary' : 'default')}
                            onClick={() => {
                                if (canvasModel.measurementsModel.currentMode !== MeasurementsLayerModel.MODE_BATTER) {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_BATTER;
                                    props.setCurrentMode(MeasurementsLayerModel.MODE_BATTER);
                                }
                            }}>
                        <i className="landconnect-icon plus"/> Add Batter Line
                    </button>

                    {(modelMode === MeasurementsLayerModel.MODE_BATTER && !batters.length) &&
                    <div className="note">
                        <i className="fal fa-exclamation-circle"/>
                        Select two or more level points to add a batter line between then.
                    </div>
                    }
                </div>
                <div className="lot-settings edges-list">
                    <div className="blocks">
                        {batters.map((batter, i) =>
                            <BatterLine
                                key={i}
                                batter={batter}
                                pathNo={i + 1}
                                onPathDelete={(batter) => onLevelsPathDelete(batter, props.onCanvasModelChange)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className='header'>Proposed Retaining Walls</div>
            <div className='easements'>
                <div className="btn-group">
                    <button type="button"
                            className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_RETAINING) ? 'primary' : 'default')}
                            onClick={() => {
                                if (canvasModel.measurementsModel.currentMode !== MeasurementsLayerModel.MODE_RETAINING) {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_RETAINING;
                                    props.setCurrentMode(MeasurementsLayerModel.MODE_RETAINING);
                                }
                            }}>
                        <i className="landconnect-icon plus"/> Add retaining wall
                    </button>

                    {(modelMode === MeasurementsLayerModel.MODE_RETAINING && !pointLevels.length) &&
                    <div className="note">
                        <i className="fal fa-exclamation-circle"/>
                        Select a lot boundary to retain
                    </div>
                    }
                </div>
                <div className="easement">
                    <div className="blocks">
                        {retaining.map((wall, i) =>
                            <RetainingWall
                                key={i}
                                wall={wall}
                                wallNo={i + 1}
                                onCanvasModelChange={props.onCanvasModelChange}
                                onWallDelete={(wall) => onRetainingWallDelete(wall, props.onCanvasModelChange)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className='header'>Developer Fill</div>
            <div className='easements'>
                <div className="btn-group column">
                    <button type="button"
                            className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_DEVELOPER_FILL) ? 'primary' : 'default')}
                            onClick={() => {
                                if (canvasModel.measurementsModel.currentMode !== MeasurementsLayerModel.MODE_DEVELOPER_FILL) {
                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_DEVELOPER_FILL;
                                    props.setCurrentMode(MeasurementsLayerModel.MODE_DEVELOPER_FILL);
                                }
                            }}>
                        <i className="landconnect-icon plus"/> Developer Fill
                    </button>

                    <button type="button" className="button transparent"
                            onClick={() => canvasModel.lotTopographyModel.developerFill.clear()}>
                        <i className="landconnect-icon times"/> Clear Fill
                    </button>

                    <div className="button-wrapper one-third-basis">
                        <div className="header button-label">Fill Height</div>
                        <div className='landconnect-input'>
                            <input type='number'
                                   autoComplete="off"
                                   onChange={(e) => {
                                       setDeveloperFill(Number(e.currentTarget.value));
                                       props.onCanvasModelChange();
                                   }}
                                   placeholder='Millimeters'
                                   value={state.developerFill || ''}
                            />
                        </div>
                    </div>

                    {modelMode === MeasurementsLayerModel.MODE_DEVELOPER_FILL &&
                        <div className="note">
                            <i className="fal fa-exclamation-circle"/>
                            Click points on the siting to draw open space
                        </div>
                    }
                </div>
            </div>

            <div className="first-row has-nav fall-levels">
                <span className="filters-header">Fall Levels</span>

                <div className='toggle-metric fall-levels-checkbox'>
                    <ToggleSwitch
                        labelPosition="left"
                        disabled={allLevelPoints.length <= 1}
                        onClick={() => {
                            canvasModel.fallTopologyModel.enabled = !canvasModel.fallTopologyModel.enabled;
                            props.onCanvasModelChange();
                        }}
                        text={{on: 'Off', off: 'On'}}
                        label={{on: '', off: ''}}
                        state={canvasModel.fallTopologyModel.enabled}
                    />
                </div>
            </div>

            <div className='header'>Construction</div>
            <div className="easements">
                <div className="btn-group column">
                    <div className="button-wrapper one-third-basis compact">
                        <div className="header button-label">Slab height</div>
                        <NiceDropdown
                            itemClass='right-item'
                            defaultItem='Select type'
                            defaultValue={0.435}
                            items={FacadeSettingsFactory.slabHeights}
                            onChange={(slabValue) => setSlabHeight(slabValue)}
                            value={state.slabHeight}
                        />
                    </div>
                    <div className="button-wrapper one-third-basis compact">
                        <div className="header button-label">Garage dropdown</div>
                        <NiceDropdown
                            itemClass=''
                            defaultItem='Custom height'
                            defaultValue={'custom'}
                            items={FacadeSettingsFactory.garageDropdowns}
                            onChange={(garageDropdown) => setGarageDropdown(garageDropdown)}
                            value={state.garageDropdown}
                        />
                    </div>
                    <div className="button-wrapper one-third-basis compact">
                        <div className="header button-label">Vegetation Scrape</div>
                        <NiceDropdown
                            itemClass=''
                            defaultItem='Custom height'
                            defaultValue={'custom'}
                            items={FacadeSettingsFactory.vegScrapeLevels}
                            onChange={(vegScrape) => setVegScrape(vegScrape)}
                            value={state.vegScrape}
                        />
                    </div>
                    <div className="button-wrapper one-third-basis compact">
                        <div className="header button-label">Cut/Fill Ratio</div>
                        <NiceDropdown
                            itemClass='right-item'
                            defaultValue=''
                            defaultItem='Cut/Fill Ratio'
                            items={
                                [
                                    {
                                        text: '70% /30%',
                                        value: 0.7
                                    },
                                    {
                                        text: '65% / 35%',
                                        value: 0.65
                                    },
                                    {
                                        text: '60% / 40%',
                                        value: 0.6
                                    },
                                    {
                                        text: '55% / 45%',
                                        value: 0.55
                                    },
                                    {
                                        text: '50% / 50%',
                                        value: 0.5
                                    },
                                ]
                            }
                            onChange={cutRatio => {
                                canvasModel.lotTopographyModel.cutRatio = cutRatio;
                                props.onCanvasModelChange();
                            }}
                            value={canvasModel.lotTopographyModel.cutRatio}
                        />
                    </div>
                </div>
            </div>

            {
                AccountMgr.i.builder.hasHeightEnvelope &&
                    <React.Fragment>
                        <div className='header'>Height envelope</div>
                        <div className="easements">
                            <div className="btn-group column">
                                <div className="button-wrapper">
                                    <div className="header button-label">Left setback</div>
                                    {!canvasModel.measurementsModel.leftSetback
                                        ? <button type="button"
                                                  className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_SETBACK_LEFT) ? 'primary' : 'default')}
                                                  onClick={() => {
                                                      canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_SETBACK_LEFT;
                                                      props.setCurrentMode(MeasurementsLayerModel.MODE_SETBACK_LEFT);
                                                      props.onCanvasModelChange();
                                                  }}>
                                            Select
                                        </button>
                                        : <div className='btn-group-input'>
                                            <div className='landconnect-input'>
                                                <input type='number'
                                                       tabIndex={0}
                                                       autoComplete="off"
                                                       onChange={(e) => {
                                                           canvasModel.measurementsModel.leftSetback.distance = Number(e.currentTarget.value).toFixed(2);
                                                           props.onCanvasModelChange();
                                                       }}
                                                       onFocus={(event) => event.target.select()}
                                                       placeholder='Metres'
                                                       step={0.01}
                                                       value={canvasModel.measurementsModel.leftSetback.distance.toFixed(2)}
                                                />
                                            </div>
                                            <button type="button"
                                                    className='button transparent delete-btn'
                                                    onClick={() => {
                                                        canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_MEASUREMENT;
                                                        canvasModel.measurementsModel.leftSetback = null;
                                                        props.setCurrentMode(MeasurementsLayerModel.MODE_MEASUREMENT);
                                                    }}>
                                                <i className="landconnect-icon times"/>
                                            </button>
                                        </div>
                                    }
                                    {(modelMode === MeasurementsLayerModel.MODE_SETBACK_LEFT &&
                                        !canvasModel.measurementsModel.leftSetback) &&
                                    <div className="note">
                                        <i className="fal fa-exclamation-circle"/>
                                        Select the measurement line
                                    </div>
                                    }

                                </div>
                                <div className="button-wrapper">
                                    <div className="header button-label">Right setback</div>
                                    {!canvasModel.measurementsModel.rightSetback &&
                                    <button type="button"
                                            className={classnames('button', (modelMode && currentMode === MeasurementsLayerModel.MODE_SETBACK_RIGHT) ? 'primary' : 'default')}
                                            onClick={() => {
                                                canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_SETBACK_RIGHT;
                                                props.setCurrentMode(MeasurementsLayerModel.MODE_SETBACK_RIGHT);
                                            }}>
                                        Select
                                    </button>
                                    }
                                    {canvasModel.measurementsModel.rightSetback &&
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type='number'
                                                   tabIndex={0}
                                                   autoComplete="off"
                                                   onChange={(e) => {
                                                       canvasModel.measurementsModel.rightSetback.distance = Number(e.currentTarget.value).toFixed(2);
                                                       props.onCanvasModelChange();
                                                   }}
                                                   onFocus={(event) => event.target.select()}
                                                   step={0.01}
                                                   placeholder='Metres'
                                                   value={canvasModel.measurementsModel.rightSetback.distance.toFixed(2)}
                                            />
                                        </div>
                                        <button type="button"
                                                className='button transparent delete-btn'
                                                onClick={() => {
                                                    canvasModel.measurementsModel.currentMode = MeasurementsLayerModel.MODE_MEASUREMENT;
                                                    canvasModel.measurementsModel.rightSetback = null;
                                                    props.setCurrentMode(MeasurementsLayerModel.MODE_MEASUREMENT);
                                                }}>
                                            <i className="landconnect-icon times"/>
                                        </button>
                                    </div>
                                    }
                                    {(modelMode === MeasurementsLayerModel.MODE_SETBACK_RIGHT &&
                                        !canvasModel.measurementsModel.rightSetback) &&
                                    <div className="note">
                                        <i className="fal fa-exclamation-circle"/>
                                        Select the measurement line
                                    </div>
                                    }
                                </div>
                            </div>
                        </div>

                        {canvasModel.measurementsModel.leftSetback && canvasModel.measurementsModel.rightSetback &&
                        <div className="easements">
                            <div className="btn-group">
                                <button type="button"
                                        className={classnames('button default')}
                                        onClick={testEnvelope}>
                                    Test Envelope
                                </button>
                            </div>
                        </div>
                        }
                    </React.Fragment>
            }
        </div>
    );
};

export default AdvancedSiting;