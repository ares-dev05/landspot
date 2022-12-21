import React, {useState, Component} from 'react';
import {get} from 'lodash';
import classnames from 'classnames';
import CanvasModel from '../CanvasModel';
import {NiceCheckbox} from '~sitings~/helpers';
import RetainingWall from '~/sitings-sdk/src/sitings/model/levels/works/RetainingWall';
import LotSurfaceBuilder from '~/sitings-sdk/src/sitings/model/levels/3d/LotSurfaceBuilder';
import NiceDropdown from '~sitings~/helpers/NiceDropdown';
import SitePiering from '../../../../../sitings-sdk/src/sitings/model/levels/works/SitePiering';

/**
 * @type {EnvelopeCanvasModel}
 */
const envelopeModel = CanvasModel.getEnvelopeModel();
const canvasModel = CanvasModel.getModel();
const siteWorks = envelopeModel.siteWorks;
const siteCosts = envelopeModel.siteCosts;

const cutFillRatios = new Array(21).fill().map(
    (item, index) => {
        const cut = 1-index * 0.05, fill = 1-cut;
        return {
            text: Math.round(cut*100) + '% / ' + Math.round(fill*100) + '%',
            value: cut
        };
    }
);

class ThreeDControls extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mode: get(envelopeModel, 'surfaces.currentMode', 0),
            showSiteWorks: true,
            showCutArea: false,
            cutRatio: get(canvasModel, 'lotTopographyModel.cutRatio', 0)
        };
    }

    updateState = (data) => {
        this.setState({...this.state, ...data});

        // also set the mode in the surface model
        if ('mode' in data) {
            envelopeModel.surfaces.currentMode = data.mode;
        }

        if ('showCutArea' in data) {
            envelopeModel.surfaces.showCutSurface = data.showCutArea;
        }

        if ('cutRatio' in data) {
            canvasModel.lotTopographyModel.cutRatio = data.cutRatio;
            envelopeModel.surfaces.recalculate(LotSurfaceBuilder.DEFAULT_SCALE_UP);
            envelopeModel.surfaces.onChange();

            this.forceUpdate();
        }
    };

    fmt = (val) => val.toFixed(2);
    fmt100 = (val) => (val*100).toFixed(2);

    render() {
        const {mode, showCutArea, showSiteWorks, cutRatio} = this.state;

        return (
            <div className='lot-settings'>
                <div className='header'>3D Mode</div>
                <div className='header'>Select the land state</div>
                <div className="easements">
                    <div className="btn-group">
                        <button type="button"
                                className={classnames('button', mode === 0 ? 'primary' : 'default')}
                                disabled={!!showCutArea}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => {
                                    this.updateState({mode: 0});
                                }}>
                            Initial Lot
                        </button>

                        <button type="button"
                                className={classnames('button', mode === 1 ? 'primary' : 'default')}
                                disabled={!!showCutArea}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => {
                                    this.updateState({mode: 1});
                                }}>
                            Cut & Fill
                        </button>

                        <button type="button"
                                className={classnames('button', mode === 2 ? 'primary' : 'default')}
                                disabled={!!showCutArea}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => {
                                    this.updateState({mode: 2});
                                }}>
                            Retaining Walls
                        </button>

                        <button type="button"
                                className={classnames('button', mode === 3 ? 'primary' : 'default')}
                                disabled={!!showCutArea}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => {
                                    this.updateState({mode: 3});
                                }}>
                            House Slab
                        </button>

                        <button type="button"
                                className={classnames('button', mode === 4 ? 'primary' : 'default')}
                                disabled={!!showCutArea}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => {
                                    this.updateState({mode: 4});
                                }}>
                            Driveway
                        </button>

                        <button type="button"
                                className={classnames('button', mode === 5 ? 'primary' : 'default')}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => {
                                    this.updateState({mode: 5});
                                }}>
                            House Demo
                        </button>
                    </div>
                </div>

                <div className='header'>View results</div>
                <div className="easements">
                    <div className="btn-group">
                        <button type="button"
                                className={classnames('button', showSiteWorks === true ? 'primary' : 'default')}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => this.updateState({showSiteWorks: true})}>
                            Site Works
                        </button>

                        <button type="button"
                                className={classnames('button', showSiteWorks === false ? 'primary' : 'default')}
                                style={{
                                    marginLeft: '0px',
                                    marginRight: '10px'
                                }}
                                onClick={() => this.updateState({showSiteWorks: false})}>
                            Site Costs
                        </button>
                    </div>
                </div>

                <div className="easements">
                    {siteWorks && siteWorks.cutFillResult && showSiteWorks &&
                    <div className="btn-group column">

                        {(mode === LotSurfaceBuilder.SURFACE_CUT_FILL || mode === LotSurfaceBuilder.SURFACE_RETAINING) &&
                        <div className="button-wrapper">
                            <div className="landconnect-input checkbox">
                                <NiceCheckbox
                                    checked={showCutArea}
                                    label='Edit Cut Perimeter'
                                    name='edit-cut-perimeter'
                                    onChange={() => {
                                        this.updateState({showCutArea: !showCutArea});
                                    }}
                                />
                            </div>
                        </div>
                        }

                        {
                            showCutArea &&
                            <React.Fragment>
                                <div className="button-wrapper">
                                    <div className="header button-label">Cut/Fill Ratio</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <NiceDropdown
                                                itemClass='right-item'
                                                defaultValue=''
                                                defaultItem='Cut/Fill Ratio'
                                                items={cutFillRatios}
                                                onChange={cutRatio => this.updateState({cutRatio: cutRatio})}
                                                value={canvasModel.lotTopographyModel.cutRatio}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        {
                            !showCutArea &&
                            <React.Fragment>
                                <div className="button-wrapper">
                                    <div className="header button-label">Cut/Fill Ratio</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type="text"
                                                   readOnly={true}
                                                   value={this.fmt100(siteWorks.cutFillResult.cutRatio) + ' / ' + this.fmt100(1 - siteWorks.cutFillResult.cutRatio)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                        <div className="button-wrapper">
                            <div className="header button-label">Platform Level</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.cutFillResult.level) + ' m'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="button-wrapper">
                            <div className="header button-label">Platform surface</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.cutFillResult.surface) + ' m²'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="button-wrapper">
                            <div className="header button-label">Excess Soil</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.cutFillVolume) + ' m³'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="button-wrapper">
                            <div className="header button-label">Batter volume requirement</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.batterVolume) + ' m³'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="button-wrapper">
                            <div className="header button-label">Retained length</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.retainedLength) + ' m'}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="button-wrapper">
                            <div className="header button-label">Retaining wall surface</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.retainedSurface) + ' m²'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="button-wrapper">
                            <div
                                className="header button-label">{'Beam count (' + RetainingWall.BEAM_LENGTH + 'm x ' + RetainingWall.BEAM_HEIGHT + 'm beams)'}</div>
                            <div className='btn-group-input'>
                                <div className='landconnect-input'>
                                    <input type="text"
                                           readOnly={true}
                                           value={this.fmt(siteWorks.retainedBeamLength)}
                                    />
                                </div>
                            </div>
                        </div>

                        {
                            siteWorks.sitePiering && siteWorks.sitePiering.pierLocations && siteWorks.sitePiering.pierLocations.length &&
                            <React.Fragment>
                                <div className="button-wrapper">
                                    <div className="header button-label">{'Pier count (' + SitePiering.PIER_RADIUS*2 + 'm ⌀, ' + this.fmt(siteWorks.sitePiering.pierHeight) + 'm H)'}</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type="text"
                                                   readOnly={true}
                                                   value={this.fmt(siteWorks.sitePiering.pierLocations.length)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="button-wrapper">
                                    <div className="header button-label">{'Pier volume'}</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type="text"
                                                   readOnly={true}
                                                   value={this.fmt(siteWorks.sitePiering.pierVolume) + ' m³'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }

                        {
                            siteWorks.driveway &&
                            <React.Fragment>
                                <div className="button-wrapper">
                                    <div className="header button-label">Driveway Width</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type="text"
                                                   readOnly={true}
                                                   value={this.fmt(siteWorks.driveway.width) + ' m'}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="button-wrapper">
                                    <div className="header button-label">Driveway Length</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type="text"
                                                   readOnly={true}
                                                   value={this.fmt(siteWorks.driveway.length) + ' m'}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="button-wrapper">
                                    <div className="header button-label">Driveway Gradient</div>
                                    <div className='btn-group-input'>
                                        <div className='landconnect-input'>
                                            <input type="text"
                                                   readOnly={true}
                                                   value={'1 : ' + this.fmt(siteWorks.driveway.gradient)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    </div>
                    }

                    {siteCosts && siteWorks && siteWorks.cutFillResult && showSiteWorks===false &&
                    <div className="btn-group column">
                        {
                            siteCosts.costGroups.map(
                                (costGroup, index) => <React.Fragment key={costGroup.name}>
                                    <div className="button-wrapper">
                                        <div className="header button-label">Platform Level</div>
                                        <div className='btn-group-input'>
                                            <div className='landconnect-input'>
                                                <input type="text"
                                                       readOnly={true}
                                                       value={this.fmt(siteWorks.cutFillResult.level) + ' m'}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )
                        }
                    </div>
                    }
                </div>
            </div>
        );
    }
}

export default ThreeDControls;