import React, {Component} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {DrawerContext} from '../../DrawerContainer';
import LotEdgeAngle from '~/sitings-sdk/src/sitings/model/lot/LotEdgeAngle';
import LotPointModel from '~/sitings-sdk/src/sitings/model/lot/LotPointModel';
import LotCurveModel from '~/sitings-sdk/src/sitings/model/lot/LotCurveModel';
import LotEdgeEvent from '~/sitings-sdk/src/sitings/events/LotEdgeEvent';
import CanvasModel from '../CanvasModel';
import UserAction from '../consts';
import ManipulationManager from '../../../../../sitings-sdk/src/sitings/model/lot/trace/ManipulationManager';

class LotEdges extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired,
        setUserAction: PropTypes.func.isRequired,
        companyLoaded: PropTypes.bool.isRequired,
        traceEnabled: PropTypes.bool.isRequired,
        metric: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {};
        this.pathModel = null;
    }

    componentDidMount() {
        const canvasModel = CanvasModel.getModel();
        canvasModel.pathModel.addEventListener(LotEdgeEvent.MANIPULATE, this.calibrateEdge, this);
        this.pathModel = canvasModel.pathModel;

        ManipulationManager.i.listen(this.manipulationComplete, this);
    }

    componentWillUnmount() {
        if (this.pathModel) {
            this.pathModel.removeEventListener(LotEdgeEvent.MANIPULATE, this.calibrateEdge, this);
            this.pathModel = null;
        }
        ManipulationManager.i.unlisten(this.manipulationComplete);
    }

    manipulationComplete = () => {
        this.forceUpdate();
    };

    /**
     * @param e {LotEdgeEvent}
     */
    calibrateEdge = (e) => {
        const {setUserAction, traceEnabled} = this.props;

        if (traceEnabled) {
            /**
             * @type {LotEdgeModel}
             */
            let lotEdgeModel = e.model;
            setUserAction(UserAction.CALIBRATE_EDGE, {lotEdgeModel});
        }
    };

    onEdgeChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    addEdge = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        const lotModel    = canvasModel.pathModel;

        lotModel.addEdge(
            new LotCurveModel(
                // The starting point of the edge. It can always be left with the default coordinates (0, 0), because when
                //  `connectToPreviousEdge` below is true, this point will be replaced with the Ending point of the
                //  previous edge in the Lot
                new LotPointModel(),
                // length, in meters
                0,
                // Angle, with degrees, minutes, seconds as the values. Minutes and Seconds should be restricted to between 0 and 59
                new LotEdgeAngle(0, 0, 0),
                // Arc length. Only used for Curves, can be left as 0 because it's calculated automatically from Chord length and Radius
                0,
                // Radius. Only used for Curves.
                0,
                // flag that indicates if this edge is a curve
                false
            ),
            // connectToPreviousEdge should always be true for the Lot Drawer so that we have a continuous polygon
            true
        );

        setDrawerData({sitingSession: canvasModel.recordState()});
    };

    render() {
        const {companyLoaded, traceEnabled, metric} = this.props;

        let edges = [];
        if (companyLoaded) {
            const canvasModel = CanvasModel.getModel();
            const {pathModel} = canvasModel;
            edges = pathModel.edges;
        }

        return (
            <div className={classnames('lot-settings edges-list', traceEnabled && 'disabled')}>
                {
                    edges.map(
                        (edge, edgeIndex) => <Edge key={edgeIndex}
                                                   onEdgeChange={this.onEdgeChange}
                                                   edge={edge}
                                                   edgeNo={edgeIndex + 1}
                                                   metric={metric}
                        />
                    )
                }

                <div>
                    <button type="button" className='button default'
                            onClick={() => this.addEdge()}>
                        <i className="landconnect-icon plus"/> Add boundary
                    </button>
                </div>
            </div>
        );
    }

}

/**
 * @param onEdgeChange
 * @param edge {LotCurveModel}
 * @param edgeNo
 * @param metric {boolean}
 * @returns {*}
 * @constructor
 */
const Edge = ({onEdgeChange, edge, edgeNo, metric}) => {
    let tabIndex = edgeNo * (metric ? 5 : 6);

    return <div className='edge'
         onMouseEnter={() => edge.highlight = true}
         onMouseLeave={() => edge.highlight = false}
    >
        <div className='edge-shape'>
            <span>{edgeNo}</span>
            <button type="button" className='button transparent edge-type'
                    onClick={() => {
                        edge.isCurve = !edge.isCurve;
                        onEdgeChange();
                    }}>
                {
                    edge.isCurve
                        ? <span>
                        <i className="landconnect-icon curve"/> Curved
                    </span>
                        : <span>
                        <i className="landconnect-icon straight"/> Straight
                    </span>
                }
            </button>
            <button type="button" className='button transparent direction'
                    onClick={() => {
                        edge.angleController.flip = !edge.angleController.flip;
                        onEdgeChange();
                    }}>
                <i className={classnames('landconnect-icon boundary-arrow-left', edge.angleController.flip && 'active')}/>
                <i className={classnames('landconnect-icon boundary-arrow-right', !edge.angleController.flip && 'active')}/>
            </button>

            {edge.isCurve &&
            <React.Fragment>
                <button type="button" className='button transparent direction'
                        onClick={() => {
                            edge.flipCurveDirection = !edge.flipCurveDirection;
                            onEdgeChange();
                        }}>
                    <i className={classnames('landconnect-icon curve-direction-left', edge.flipCurveDirection && 'active')}/>
                    <i className={classnames('landconnect-icon curve-direction-right', !edge.flipCurveDirection && 'active')}/>
                </button>
                <div className='landconnect-input'>
                    <input type='number'
                           tabIndex={tabIndex++}
                           autoComplete="off"
                           onChange={(e) => {
                               const value = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                               metric ? (edge.radius = value) : (edge.radiusFt = value);
                               onEdgeChange();
                           }}
                           onFocus={(event) => event.target.select()}
                           maxLength={7}
                           placeholder='Radius'
                           value={(metric ? edge.radius : edge.radiusFt) || ''}
                    />
                </div>
            </React.Fragment>
            }
        </div>

        {metric &&
        <div className="edge-dimension">
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.length = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={7}
                       placeholder='Meters'
                       value={edge.length || ''}
                />
            </div>
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.degrees = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={5}
                       placeholder='Deg'
                       value={typeof edge.angleController.degrees === 'undefined' ? '' : edge.angleController.degrees}
                />
            </div>
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.minutes = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={5}
                       placeholder='Min'
                       value={typeof edge.angleController.minutes === 'undefined' ? '' : edge.angleController.minutes}
                />
            </div>
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.seconds = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={5}
                       placeholder='Sec'
                       value={typeof edge.angleController.seconds === 'undefined' ? '' : edge.angleController.seconds}
                />
            </div>
        </div>
        }

        {!metric &&
        <div className="edge-dimension">
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.feet = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={7}
                       placeholder='Feet'
                       value={edge.feet || ''}
                />
            </div>
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.inches = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={7}
                       placeholder='Inches'
                       value={edge.inches || ''}
                />
            </div>
        </div>
        }

        {!metric &&
        <div className="edge-dimension">
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.degrees = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={5}
                       placeholder='Deg'
                       value={edge.angleController.degrees || ''}
                />
            </div>
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.minutes = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={5}
                       placeholder='Min'
                       value={edge.angleController.minutes || ''}
                />
            </div>
            <div className='landconnect-input'>
                <input type='number'
                       tabIndex={tabIndex++}
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.seconds = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       onFocus={(event) => event.target.select()}
                       maxLength={5}
                       placeholder='Sec'
                       value={edge.angleController.seconds || ''}
                />
            </div>
        </div>
        }

        {
            edge.canDelete && <button type="button" className='button transparent delete-btn'
                                      onClick={() => {
                                          edge.deleteEdge();
                                          onEdgeChange();
                                      }}>
                <i className='landconnect-icon trash'/>
            </button>
        }
    </div>
};

Edge.propTypes = {
    edge: PropTypes.object.isRequired,
    edgeNo: PropTypes.number.isRequired,
    onEdgeChange: PropTypes.func.isRequired,
};

const LotEdgesConsumer = (props) => (
    <DrawerContext.Consumer>
        {
            ({
                 setDrawerData, setUserAction
             }) => <LotEdges  {...props} {...{
                setDrawerData, setUserAction
            }}/>
        }
    </DrawerContext.Consumer>
);

export default LotEdgesConsumer;