import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {LotDrawerContext} from '../../LotDrawerContainer';
import LotEdgeAngle from '~/sitings-sdk/src/sitings/model/lot/LotEdgeAngle';
import LotPointModel from '~/sitings-sdk/src/sitings/model/lot/LotPointModel';
import LotCurveModel from '~/sitings-sdk/src/sitings/model/lot/LotCurveModel';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import CanvasModel from './CanvasModel';

class LotEdges extends Component {
    static propTypes = {
        setDrawerData: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            showConfirmDialog: false,
            edgeIndex: null
        }
    }

    componentDidMount() {
    }

    onEdgeChange = () => {
        const {
            setDrawerData
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        const lotModel    = canvasModel.pathModel;
        const edges       = lotModel.recordState().edges;

        setDrawerData({edges});
    };

    deleteHandler = (remove) => {
        this.setState({
            showConfirmDialog: false,
            edgeIndex: null
        });

        if (remove) {
            const canvasModel   = CanvasModel.getModel();
            const {edgeIndex}   = this.state;
            const lotModel      = canvasModel.pathModel;
            const edge          = lotModel.edges[edgeIndex];

            if (edge) {
                edge.deleteEdge();
                this.onEdgeChange();
            }
        }
    };

    onDelete = (edgeIndex) => {
        this.setState({showConfirmDialog: true, edgeIndex});
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

        setDrawerData({edges: lotModel.recordState().edges});
    };

    render() {
        const canvasModel = CanvasModel.getModel();
        const {pathModel} = canvasModel;
        const {showConfirmDialog} = this.state;
        const edges = pathModel.edges;

        return (
            <div className='edges-list'>
                {showConfirmDialog && <ConfirmDeleteDialog
                    onConfirm={this.deleteHandler}
                    userActionData={{itemName: 'this edge'}}
                    onCancel={() => {
                        this.deleteHandler(false);
                    }}
                />
                }
                {
                    edges.map(
                        (edge, edgeIndex) => <Edge key={edgeIndex}
                                                   onEdgeChange={this.onEdgeChange}
                                                   onDelete={() => this.onDelete(edgeIndex)}
                                                   edge={edge}
                                                   edgeNo={edgeIndex + 1}
                        />
                    )
                }

                <button type="button" className='button default'
                        onClick={() => this.addEdge()}>
                    <i className="landspot-icon plus"/> Add boundary
                </button>
            </div>
        );
    }

}

const Edge = ({onEdgeChange, edge, edgeNo, onDelete}) => (
    <div className='edge'
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
                        <i className="landspot-icon curve"/> Curved
                    </span>
                        : <span>
                        <i className="landspot-icon straight"/> Straight
                    </span>
                }
            </button>
            <button type="button" className='button transparent direction'
                    onClick={() => {
                        edge.angleController.flip = !edge.angleController.flip;
                        onEdgeChange();
                    }}>
                <i className={classnames('landspot-icon boundary-arrow-left', edge.angleController.flip && 'active')}/>
                <i className={classnames('landspot-icon boundary-arrow-right', !edge.angleController.flip && 'active')}/>
            </button>

            {
                edge.isCurve &&
                <React.Fragment>
                    <button type="button" className='button transparent direction'
                            onClick={() => {
                                edge.flipCurveDirection = !edge.flipCurveDirection;
                                onEdgeChange();
                            }}>
                        <i className={classnames('landspot-icon curve-direction-left', edge.flipCurveDirection && 'active')}/>
                        <i className={classnames('landspot-icon curve-direction-right', !edge.flipCurveDirection && 'active')}/>
                    </button>
                    <div className='landspot-input'>
                        <input type='number'
                               autoComplete="off"
                               onChange={(e) => {
                                   edge.radius = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                                   onEdgeChange();
                               }}
                               maxLength={5}
                               placeholder='Radius'
                               value={edge.radius || ''}
                        />
                    </div>
                </React.Fragment>
            }
        </div>
        <div className="edge-dimension">
            <div className='landspot-input'>
                <input type='number'
                       autoComplete="off"
                       onChange={(e) => {
                           edge.length = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       maxLength={5}
                       placeholder='Meters'
                       value={edge.length || ''}
                />
            </div>
            <div className='landspot-input'>
                <input type='number'
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.degrees = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       maxLength={5}
                       placeholder='Deg'
                       value={edge.angleController.degrees || ''}
                />
            </div>
            <div className='landspot-input'>
                <input type='number'
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.minutes = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       maxLength={5}
                       placeholder='Min'
                       value={edge.angleController.minutes || ''}
                />
            </div>
            <div className='landspot-input'>
                <input type='number'
                       autoComplete="off"
                       onChange={(e) => {
                           edge.angleController.seconds = parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0;
                           onEdgeChange();
                       }}
                       maxLength={5}
                       placeholder='Sec'
                       value={edge.angleController.seconds || ''}
                />
            </div>
        </div>

        {
            edge.canDelete && <button type="button" className='button transparent delete-btn'
                                      onClick={onDelete}>
                <i className='landspot-icon trash'/>
            </button>
        }
    </div>
);

Edge.propTypes = {
    edge: PropTypes.object.isRequired,
    edgeNo: PropTypes.number.isRequired,
    onEdgeChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

const LotEdgesConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 setDrawerData
             }) => <LotEdges  {...props} {...{
                setDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const LotEdgesInstance = connect((state) => ({
    lotDrawer: state.lotDrawer,
}), null)(LotEdgesConsumer);

export default LotEdgesInstance;