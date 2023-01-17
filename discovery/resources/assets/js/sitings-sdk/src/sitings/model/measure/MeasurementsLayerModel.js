import RestoreDispatcher from '../../../events/RestoreDispatcher';
import TransformEvent from '../../events/TransformEvent';
import ModelEvent from '../../events/ModelEvent';
import FloorMeasurementModel from './FloorMeasurementModel';
import LotPointModel from '../lot/LotPointModel';
import MeasurementPointModel from './MeasurementPointModel';
import MeasurementPointEvent from '../../events/MeasurementPointEvent';
import EventBase from '../../../events/EventBase';
import DataEvent from '../../../events/DataEvent';
import KeyboardLayer from '../../global/KeyboardLayer';
import m from '../../../utils/DisplayManager';
import Geom from '../../../utils/Geom';
import HouseModel from '../house/HouseModel';
import { CompressedPixelFormat } from 'three';


export default class MeasurementsLayerModel extends RestoreDispatcher {

	// Possible mode for measurements
	static get MODE_MEASUREMENT()		 	{ return 1;  }
	static get MODE_HOUSE_ALIGNMENT()	 	{ return 2;  }
	static get MODE_PAGE_ALIGNMENT()	 	{ return 3;  }
	static get MODE_PRIVATE_OPEN_SPACE() 	{ return 4;  }
	static get MODE_ENGINEERING_ALIGNMENT() { return 5;  }

	static get MODE_NEARMAPS_ALIGNMENT()	{ return 101; }

	// Setback modes
	static get MODE_SETBACK_LEFT() 			{ return 6;  }
	static get MODE_SETBACK_RIGHT() 		{ return 7;  }
	static get MODE_LEVELS() 				{ return 8;  }
	static get MODE_BATTER()				{ return 9;  }
	static get MODE_RETAINING()				{ return 10; }
	static get MODE_DEVELOPER_FILL()		{ return 11; }

	// Alignment Directions used when mode=MODE_PAGE_ALIGN
	static get DIRECTION_LEFT()	 		 	{ return 0; }
	static get DIRECTION_UP()	 		 	{ return 1; }
	static get DIRECTION_RIGHT()	 	 	{ return 2; }
	static get DIRECTION_DOWN()	 		 	{ return 3; }

	static get SETBACK_CHANGE()				{ return 'mlm.setbackChange'; }

	/**
	 * @param lotModel {LotPathModel}
	 * @param multiFloors {MultiHouseModel}
	 * @param structures {StructuresLayerModel}
	 * @param context {Object}
	 */
	constructor(lotModel, multiFloors, structures, context=null) {
		super(context);

		/**
		 * @type {number}
		 * @private
		 * .change.subscribe(this.onModeChanged);
		 */
		this._currentMode	 = MeasurementsLayerModel.MODE_MEASUREMENT;

		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._pathModel	 = lotModel;

		/**
		 * @type {MultiHouseModel}
		 * @private
		 */
		this._multiFloor = multiFloors;
		this._multiFloor.measureLayer = this;

		/**
		 * @type {StructuresLayerModel}
		 * @private
		 */
		this._structures = structures;
		this._structures.addEventListener(TransformEvent.TRANSLATE, this.targetTranslated, this);
		this._structures.addEventListener(TransformEvent.ROTATE,	this.targetRotated,	   this);
		this._structures.addEventListener(TransformEvent.SHAPE,		this.targetAltered,	   this);
		this._structures.addEventListener(ModelEvent.DELETE,		this.targetDeleted,	   this);
		// @UPGRADE: fetch transformation events from the house layer in a similar manner

		/**
		 * All the measurements
		 *
		 * @type {IMeasurement[]}
		 * @private
		 */
		this._points		= [];

		/**
		 * @type {IMeasurement} the current measurement
		 * @private
		 */
		this._currentPoint	= null;

		/**
		 * @type {MeasurementPointModel}
		 * @private
		 */
		this._leftSetback	= null;

		/**
		 * @type {MeasurementPointModel}
		 * @private
		 */
		this._rightSetback	= null;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Setbacks

	/**
	 * @returns {MeasurementPointModel}
	 */
	get leftSetback() { return this._leftSetback; }

	/**
	 * @param v {MeasurementPointModel}
	 */
	set leftSetback(v) {
		if ( v !== this._leftSetback ) {
			if ( this._rightSetback === v ) {
				// remove the right setback
				this._rightSetback = null;
			}
			this._leftSetback = v;
			this.dispatchEvent( new EventBase(MeasurementsLayerModel.SETBACK_CHANGE, this) );
		}
	}

	/**
	 * @returns {MeasurementPointModel}
	 */
	get rightSetback() { return this._rightSetback; }

	/**
	 * @param v {MeasurementPointModel}
	 */
	set rightSetback(v) {
		if ( v !== this._rightSetback ) {
			if ( this._leftSetback === v ) {
				// remove the left setback
				this._leftSetback = null;
			}
			this._rightSetback = v;
			this.dispatchEvent( new EventBase(MeasurementsLayerModel.SETBACK_CHANGE, this) );
		}
	}

	/**
	 * @returns {boolean}
	 */
	get isSetbackMode() {
		return this.currentMode === MeasurementsLayerModel.MODE_SETBACK_LEFT || this.currentMode === MeasurementsLayerModel.MODE_SETBACK_RIGHT;
	}

	/**
	 * @param v {MeasurementPointModel}
	 */
	set setback(v) {
		if ( this.currentMode === MeasurementsLayerModel.MODE_SETBACK_LEFT ) {
			this.leftSetback = v;
			// switch back to measurement mode
			this.currentMode = MeasurementsLayerModel.MODE_MEASUREMENT;
		}	else
		if ( this.currentMode === MeasurementsLayerModel.MODE_SETBACK_RIGHT ) {
			this.rightSetback = v;
			// switch back to measurement mode
			this.currentMode  = MeasurementsLayerModel.MODE_MEASUREMENT;
		}
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Measurement points

	/**
	 * @returns {IMeasurement[]|MeasurementPointModel[]}
	 */
	get points()		{ return this._points; }

	/**
	 * @returns {number}
	 */
	get currentMode()	{ return this._currentMode; }

	/**
	 * @param mode {number}
	 */
	set currentMode(mode) {
		if (mode!==this._currentMode) {
			this._currentMode = mode;
		}

		// If we have a pending (incomplete) measurement, delete it
		this.cancelCurrentPoint();
		this.onChange();
	}

	/**
	 * @returns {IMeasurement}
	 */
	get currentPoint()			{ return this._currentPoint; }

	/**
	 * @returns {IMeasurement}
	 */
	get latestPoint()			{ return this._points[this._points.length-1]; }

	/**
	 * the floors model that this measurement layer uses
	 */
	get floors()				{ return this._multiFloor; }

	/**
	 * @param e {TransformEvent}
	 * @private
	 */
	targetTranslated(e)			{ this.translateForTarget(e.dx, e.dy, e.model); }

	/**
	 * @param e {TransformEvent}
	 * @private
	 */
	targetRotated(e)			{ this.rotateForTarget(e.rotation, e.dx, e.dy, e.model); }

	/**
	 * @param e {TransformEvent}
	 * @private
	 */
	targetAltered(e)			{ this.clearByTarget( e.model); }

	/**
	 * @param e {TransformEvent}
	 * @private
	 */
	targetDeleted(e)			{ this.clearByTarget(e.model); }


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Measurement point updates

	/**
	 * Translate all the measurements that are done to a certain target (e.g. floor, structure etc.)
	 *
	 * @param dx {number}
	 * @param dy {number}
	 * @param target {RestoreDispatcher}
	 *
	 * @public
	 */
	translateForTarget(dx, dy, target)
	{
		for (let i=0, measurement; i<this.points.length; ++i) {
			measurement = this.points[i];
			if (measurement.target === target) {
				measurement.translate(dx, dy);
			}
		}
	}

	/**
	 * Rotate all the measurements that are done to a certain target (e.g. floor, structure etc.)
	 *
	 * @param angle {number}
	 * @param ox {number}
	 * @param oy {number}
	 * @param target {RestoreDispatcher}
	 *
	 * @public
	 */
	rotateForTarget(angle, ox, oy, target)
	{
		console.log('okay, rotating you now');
		for (let i=0, measurement; i<this.points.length; ++i) {
			measurement = this.points[i];
			if (measurement.target === target) {
				measurement.origin.rotate(angle, ox, oy);
			}
		}
	}

	/**
	 * Delete all the measurements that are done to a certain target (e.g. floor, structure etc.)
	 *
	 * @param target {RestoreDispatcher}
	 * @public
	 */
	clearByTarget(target)
	{
		for (let i=this.points.length-1, measurement; i>=0; --i) {
			measurement = this.points[i];
			if (measurement.target === target) {
				measurement.deleteMeasurement();
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Measurement Additions / Deletions

	/**
	 * Delete all existing measurements
	 */
	clear()
	{
		while (this.points.length) {
			this.points[0].deleteMeasurement();
		}
	}

	/**
	 * Add a house -> house measurement (only used in dual occupancy)
	 *
	 * @param edge {HouseEdgeModel}
	 * @param floor {HouseModel}
	 * @param px {number}
	 * @param py {number}
	 */
	addFloorsMeasurement(edge, floor, px, py)
	{
		if (this._currentPoint) {
			this.endCurrentPoint(px, py);
		}	else {
			this.prepareNewPoint(new FloorMeasurementModel(new LotPointModel(px, py), edge, floor));
		}
	}

	/**
	 * Add a lot -> house measurement
	 *
	 * @param edge {LotEdgeModel}
	 * @param px {number}
	 * @param py {number}
	 */
	addMeasurementTo(edge, px, py)
	{
		if (this._currentPoint) {
			this.endCurrentPoint(px, py);
		}	else {
			this.prepareNewPoint(new MeasurementPointModel(new LotPointModel(px, py), edge));
		}
	}

	/**
	 * @param p {IMeasurement}
	 * @private
	 */
	prepareNewPoint(p)
	{
		if (this._currentMode.value===MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE) {
			return;
		}

		this._currentPoint	= p;
		this._points.push(this._currentPoint);
		this._currentPoint.addEventListener(MeasurementPointEvent.HOOKED,	this.onCurrentPointHooked,	this);
		this._currentPoint.addEventListener(MeasurementPointEvent.DELETE,	this.measurementDeleted,	this);
		this._currentPoint.addEventListener(MeasurementPointEvent.RESIZING,	this.measurementResizing,	this);
		this._currentPoint.addEventListener(MeasurementPointEvent.EDIT,		this.measurementEdit,		this);

		this.dispatchEvent(new DataEvent(EventBase.ADDED, this, false, false, this._currentPoint));
	}

	/**
	 * Update the anchor position for the active measurement
	 *
	 * @param px {number}
	 * @param py {number}
	 */
	updateCurrentPoint(px, py)
	{
		if (this._currentPoint) {
			// ReleaseManager.i.isHigherThan("1.01") &&
			if (KeyboardLayer.i.ctrlPressed && this._currentMode === MeasurementsLayerModel.MODE_MEASUREMENT) {
				// Look for the closest corner
				const snapInfo = this._multiFloor.getSnapCorner(px, py);
				this._currentPoint.updateStartPoint(snapInfo.point.x, snapInfo.point.y, true);
			}	else	{
				this._currentPoint.updateStartPoint(px, py);
			}
		}
	}

	/**
	 * Cancels the active measurement point (if any)
	 */
	cancelCurrentPoint()
	{
		if (this._currentPoint) {
			this._currentPoint.deleteMeasurement();
			this._currentPoint = null;
		}
	}

	/**
	 * Anchor the active measurement to a house or structure wall
	 * @public
	 *
	 * @param px {number}
	 * @param py {number}
	 *
	 * @returns {boolean}
	 */
	endCurrentPoint(px, py)
	{
		if (this._currentPoint === null) {
			// returning True here will end the active measurement process in the view, which is what we want
			return true;
		}

		// Move the measurement anchor to the new position
		this._currentPoint.updateStartPoint( px, py );

		// Complete either a measurement or a house to house alignment
		switch (this._currentMode) {
			case MeasurementsLayerModel.MODE_MEASUREMENT:
				// Take a measurement
				return this._completeMeasurement(px, py);

			case MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT:
				// Rotate a house to align it to another reference house
				this._currentMode	= null;

				return this._completeHouseAlignment(px, py);

			default:
				return false;
		}
	}

	/**
	 * @param direction {int} must be one of the MeasurementsLayerModel.DIRECTION_ constants
	 * @public
	 */
	alignDirectionSelected(direction)
	{
		if (this._currentPoint) {
			// only align if the correct mode is selected
			if (this._currentMode === MeasurementsLayerModel.MODE_PAGE_ALIGNMENT) {
				this._pathModel.alignEdgeToDirection(
					this._currentPoint.edge,
					direction
				);
			}

			// Delete the unused measurement
			this.cancelCurrentPoint();
			this._currentMode	 = null;
		}
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @returns {boolean}
	 * @private
	 */
	_completeMeasurement(px, py)
	{
		if (this._currentMode !== MeasurementsLayerModel.MODE_MEASUREMENT) {
			return false;
		}

		/**
		 * @type {SnapInfo}
		 */
		let measurementAnchor;

		// Add a corner measurement when CTRL is pressed
		if (KeyboardLayer.i.ctrlPressed) {
			measurementAnchor = this._multiFloor.getSnapCorner(px, py);
		}	else {
			let houseAnchor, structureAnchor, houseDistance, structureDistance;

			// Take a measurement to the structures layer
			structureAnchor		= this._structures.getSnapPosition(px, py, this._currentPoint.intersection);
			structureDistance	= Geom.segmentLength(px, py, structureAnchor.point.x, structureAnchor.point.y);

			// Take a measurement to the house layer; m.ompEnabled indicates if the measurement should be taken to the roof line
			houseAnchor 		= this._multiFloor.getSnapPosition(px, py, this._currentPoint.intersection, m.ompEnabled);
			houseDistance		= Geom.segmentLength(px, py, houseAnchor.point.x, houseAnchor.point.y);

			// we snap to the structure if we found a snap to it and we either couldn't snap to a house, or the house snap position is further
			if (structureAnchor && structureAnchor.found && (!houseAnchor.found || structureDistance < houseDistance)) {
				measurementAnchor = structureAnchor;
			}	else {
				measurementAnchor = houseAnchor;
			}
		}

		if (!measurementAnchor.found) {
			// Don't keep measurements that didn't snap to an element
			this._currentPoint.deleteMeasurement();
		}	else {
			// Anchor the measurement to the calculated snap parameters
			this._currentPoint.hookStartPoint(measurementAnchor);
		}

		// Deselect the active point
		this._currentPoint = null;

		return true;
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @returns {boolean}
	 * @private
	 */
	_completeHouseAlignment(px, py)
	{
		// Anchor the measurement to a house wall
		let measurementAnchor = this._multiFloor.getSnapPosition(px, py, this._currentPoint.intersection);

		if (!measurementAnchor.found) {
			measurementAnchor = this._structures.getSnapPosition(px, py, this._currentPoint.intersection);
		}

		// measurementAnchor.point && measurementAnchor.target) {
		if (measurementAnchor.found) {
			// We don't want the current point to deselect automatically
			this._currentPoint.removeEventListener(MeasurementPointEvent.HOOKED, this.onCurrentPointHooked, this);

			// Anchor the measurement to the found house
			this._currentPoint.hookStartPoint(measurementAnchor);

			// if this is a floor to floor alignment, check that we aren't trying to align edges from the same floor
			if (this._currentPoint.invalidMeasurement) {
				this.cancelCurrentPoint();

				return false;
			}

			try {
				// Rotate the house that the measurement is anchored on, to have its wall parallel with the one that the
				// measurement starts from
				measurementAnchor.target.rotateToAlignWithSegmentAt(
					this._currentPoint.edgeGlobalSpace,
					measurementAnchor.point.x,
					measurementAnchor.point.y,
					/** @DEBUG @TESTING: we used `intersection` here before */
					this._currentPoint.intersection
				);
			}	catch (e) {}
		}

		// Delete unused measurement point
		this.cancelCurrentPoint();
		this._currentMode	= null;

		return false;
	}

	/**
	 * @param event {MeasurementPointEvent}
	 * @private
	 */
	onCurrentPointHooked(event)
	{
		if (this._currentPoint) {
			this._currentPoint.removeEventListener(MeasurementPointEvent.HOOKED, this.onCurrentPointHooked, this);
			this._currentPoint = null;
		}	else {
			event.point.removeEventListener(MeasurementPointEvent.HOOKED, this.onCurrentPointHooked, this);
		}
	}

	/**
	 * @param e {MeasurementPointEvent}
	 * @private
	 */
	measurementResizing(e)
	{
		if (this && e.point && e.point.target) {
			// Translate the house/structure a certain distance along the direction of the measurement
			e.point.target.moveOnSegment(
				e.point.intersection,
				e.point.origin,
				e.distance
			);
		}
	}

	/**
	 * @param e {MeasurementPointEvent}
	 */
	measurementEdit(e)
	{
		// check if we're in setback mode
		if ( this.isSetbackMode ) {
			// check if this measurement point could be a setback
			if (e.point instanceof MeasurementPointModel && e.point.target instanceof HouseModel) {
				// set the current setback
				this.setback = e.point;
				// edit event does not need to be dispatched anymore
				return;
			}
		}

		// Propagate the event
		this.dispatchEvent(e);
	}

	/**
	 * @param event {MeasurementPointEvent}
	 * @private
	 */
	measurementDeleted(event)
	{
		const point  = event.point;

		point.removeEventListener(MeasurementPointEvent.HOOKED, this.onCurrentPointHooked, this);
		point.removeEventListener(MeasurementPointEvent.DELETE, this.measurementDeleted, this);
		point.removeEventListener(MeasurementPointEvent.RESIZING, this.measurementResizing, this);
		point.removeEventListener(MeasurementPointEvent.EDIT, this.measurementEdit, this);

		this._points.splice(this._points.indexOf(point), 1);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @returns {{points: Array}}
	 */
	recordState()
	{
		let pointsStates=[], i;

		for (i=0; i<this._points.length; ++i) {
			let point		= this._points[i];
			let pointState	= point.recordState();

			// Check if the target is a floor or a structure
			let floorIndex	= this._multiFloor.indexOf(point.target);
			let structIndex	= this._structures.indexOf(point.target);

			// Store the index of the floorplan / structure
			if (floorIndex>=0) {
				pointState.fIndx	= floorIndex;
			}	else if (structIndex>=0) {
				pointState.sIndx	= structIndex;
			}	else {
				// Unknown target type; Shouldn't happen
			}

			// Store Measurement-specific details
			if (point.type === MeasurementPointModel.TYPE) {
				// pointState.type		= MeasurementPointModel.TYPE;
				pointState.edgeIndx	= this._pathModel.edges.indexOf(point.edge);
			}	else if (point.type===FloorMeasurementModel.TYPE) {
				// pointState.type		= FloorMeasurementModel.TYPE;
				pointState.fFromIndx= this._multiFloor.indexOf(point.floorFrom);
				pointState.edgeInfo = point.floorFrom.getEdgeInfo(point.edge);
			}	else {
				// UNKNOWN measurement type. shouldn't happen;
			}

			// @DEBUG @TESTING
			if (point.type !== pointState.type) {
				throw new Error('Point state saved with incorrect type');
			}

			pointsStates.push( pointState );
		}

		return {
			points: pointsStates,
			left	: this.points.indexOf(this._leftSetback),
			right	: this.points.indexOf(this._rightSetback)
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 *
	 * @param state {{points: Array}}
	 */
	restoreState(state)
	{
		let i, newPoints = state.points, pState, measurement, type;

		// delete all existing points
		this.clear();

		// make sure we're adding measurements, not rotating the floor plan
		this._currentMode	= MeasurementsLayerModel.MODE_MEASUREMENT;
		this._currentPoint	= null;

		// add all the measurements back
		for (i=0; i<newPoints.length; ++i)
		{
			pState	= newPoints[i];
			type	= pState.hasOwnProperty('type') ? pState.type : MeasurementPointModel.TYPE;

			if (type === FloorMeasurementModel.TYPE) {
				// Add a floor to floor measurement
				let floorFrom = this._multiFloor.floors[pState.fFromIndx], edge;

				if (floorFrom && (edge=floorFrom.getEdgeFromInfo(pState.edgeInfo)) != null ) {
					measurement	= new FloorMeasurementModel(
						new LotPointModel(pState.ox, pState.oy),
						edge,
						floorFrom
					);
				}
			}	else if (pState.hasOwnProperty('edgeIndx')) {
				// Add a lot to floor measurement
				if (this._pathModel && this._pathModel.edges[pState.edgeIndx]) {
					measurement    = new MeasurementPointModel(
						new LotPointModel( pState.ox, pState.oy ),
						this._pathModel.edges[pState.edgeIndx]
					);
				}
			}

			if (measurement) {
				if (pState.hasOwnProperty('fIndx')) {
					// this measurement is done to a floor; assign the correct floorTo on this measurement point
					measurement.target = this._multiFloor.floors[pState.fIndx];
				}	else
				if ( pState.hasOwnProperty('sIndx') ) {
					measurement.target = this._structures.structures[pState.sIndx];
				}	else {
					// Unsupported measurement target
				}

				// Add listeners
				measurement.addEventListener(MeasurementPointEvent.DELETE,   this.measurementDeleted,  this);
				measurement.addEventListener(MeasurementPointEvent.RESIZING, this.measurementResizing, this);
				measurement.addEventListener(MeasurementPointEvent.EDIT,	 this.measurementEdit,	   this);

				this._points.push(measurement);

				// dispatch ADDED before hooking the start point, to make sure a proper render is triggered
				this.dispatchEvent(new DataEvent(EventBase.ADDED, this, false, false, measurement));

				// restore state -> hooks the point to the correct origin.
				measurement.restoreState(pState);
			}
		}

		// restore the setbacks, if they are specified
		if ( state.hasOwnProperty('left') && state.left >= 0 ) {
			this.leftSetback  = this.points[state.left];
		}
		if ( state.hasOwnProperty('right') && state.right >= 0 ) {
			this.rightSetback = this.points[state.right];
		}

		this.onRestored();
	}
}