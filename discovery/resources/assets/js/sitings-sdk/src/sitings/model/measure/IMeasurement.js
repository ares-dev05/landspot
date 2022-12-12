import RestoreDispatcher from '../../../events/RestoreDispatcher';
import Utils from '../../../utils/Utils';
import MeasurementPointEvent from '../../events/MeasurementPointEvent';
import EventBase from '../../../events/EventBase';
import ModelEvent from '../../events/ModelEvent';
import Geom from '../../../utils/Geom';
import Point from '../../../geom/Point';
import Segment from '../../../geom/Segment';
import AccountMgr from '../../data/AccountMgr';
import Builder from '../../data/Builder';
import HouseModel from '../house/HouseModel';
import LotPointModel from '../lot/LotPointModel';

/**
 * Common interface that all measurements should extend from
 *
 * @REFACTOR - rename properties to better represent what they are in the measurement
 */
export default class IMeasurement extends RestoreDispatcher {

	static get TYPE() { return 'base_measurement'; }

	/**
	 * @param origin {LotPointModel}
	 * @param edgeModel {Segment}
	 * @param context {Object}
	 */
	constructor(origin, edgeModel, context=null)
	{
		super(context);

		/**
		 * The position the measurement starts from. While the measurement is being taken, this will track the
		 * position of the house cursor. Once the measurement completes, this will be fixed on a house wall
		 *
		 * @type {LotPointModel}
		 * @protected
		 * @TODO @REFACTOR: the origin can be a simple Point
		 */
		this._origin = origin;
		this._origin.addEventListener(EventBase.CHANGE, this._onParametersChange, this);

		/**
		 * Straight or Curved segment that the measurement is done to
		 *
		 * @type {Segment}
		 * @protected
		 */
		this._edge	 = edgeModel;
		this._edge.addEventListener(EventBase.CHANGE, this._onParametersChange, this);
		this._edge.addEventListener(ModelEvent.DELETE, this._onReferenceDelete, this);

		/**
		 * The target that this measurement is fixed on (e.g. house, structure etc.)
		 *
		 * @type {RestoreDispatcher}
		 * @protected
		 */
		this._target	= null;

		/**
		 * Closest point on the segment from the start of the measurement (i.e. origin)
		 *
		 * @type {Point}
		 * @protected
		 */
		this._intersection	= null;

		/**
		 * Closest distance between the anchor and the measure segment
		 *
		 * @type {number}
		 * @protected
		 */
		this._distance		= 0;

		/**
		 * Indicates if the measurement has completed and it's been hooked to a house wall
		 *
		 * @type {boolean}
		 * @protected
		 * @TODO @RENAME isAnchored
		 */
		this._isHooked		= false;

		/**
		 * True if the measurement anchor is fixed on a structural corner
		 *
		 * @type {boolean}
		 * @protected
		 */
		this._isOnCorner 	= false;

		/**
		 * True if the measurement anchor is fixed on a house roofline
		 *
		 * @type {boolean}
		 * @protected
		 */
		this._isRoofline 	= false;

		/**
		 * @type {*[]}
		 * @private
		 */
		this._cornerEdges	= [];

		/**
		 * When _ompValue < 0, it is inherited from the house
		 * In all other cases, it indicates the exact distance from the brickwall to the roofline/OMP
		 *
		 * ompWidth -> goes to _cornerEdges[0]
		 */
		this._ompWidth		= -1;

		/**
		 * When _ompValue < 0, it is inherited from the house
		 * In all other cases, it indicates the exact distance from the brickwall to the roofline/OMP
		 *
		 * ompHeight -> goes to _cornerEdges[1]
		 */
		this._ompHeight		= -1;

		/**
		 * @type {Point}
		 */
		this.cornerPos		= null;

		/**
		 * @type {Point}
		 */
		this.cornerIntersection = null;

		/**
		 * @type {Segment}
		 */
		this.extA			= null;

		/**
		 * @type {Segment}
		 */
		this.extB			= null;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Getters / Setters

	/**
	 * @returns {string}
	 */
	get type()					{ return IMeasurement.TYPE; }

	/**
	 * Metric distance between a lot edge and the measurement's origin (usually fixed on the house)
	 * @returns {number}
	 */
	get distance()				{ return this._distance; }

	/**
	 * To resize the measurement, we have to translate the anchor target along the direction of the measurement line.
	 *
	 * @param v {number}
	 */
	set distance(v)
	{
		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.RESIZING, this, v));
	}

	/**
	 * Indicates if this measurement is done to the OMP (outer-most-projection); used for Henley QLD
	 */
	get isOMP()
	{
		return AccountMgr.i.builder.usesXMLFormat && AccountMgr.i.builder.ompEnabled && this.target != null;
	}

	/**
	 * @return {boolean}
	 */
	get isPlantationOMP() { return this.isOMP && AccountMgr.i.builder===Builder.PLANTATION; }

	/**
	 * @return {boolean}
	 */
	get isHenleyOMP() {
		return this.isOMP && this.isRoofline;
	}

	/**
	 * @param v {number}
	 */
	set ompDistance(v) {
		if (this.isPlantationOMP) {
			this.distance = Math.max(0, v) + this.distance - this.distanceToOMP;
		}
	}

	/**
	 * @returns {LotPointModel}
	 */
	get origin()				{ return this._origin; }

	/**
	 * @returns {Segment}
	 */
	get edge()					{ return this._edge; }

	/**
	 * Because the edge that we're measuring to might have the coordinates in a local space (e.g. when it's inside a
	 * floor plan), we convert its coordinates to the global geometric space before taking a measurement to it.
	 *
	 * @returns {Segment}
	 */
	get edgeGlobalSpace()		{ return this._edge; }

	/**
	 * @returns {Point}
	 */
	get intersection() 			{ return this._intersection; }

	/**
	 * @returns {boolean}
	 */
	get isHooked()				{ return this._isHooked; }

	/**
	 * @returns {boolean}
	 */
	get isOnCorner()			{ return this._isOnCorner; }

	/**
	 * @returns {boolean}
	 */
	get isRoofline()			{ return this._isRoofline; }
	/**
	 * @param v {boolean}
	 */
	set isRoofline(v)	{ this._isRoofline=v; }

	/**
	 * @returns {RestoreDispatcher}
	 */
	get target()				{ return this._target; }
	/**
	 * @param v {RestoreDispatcher}
	 */
	set target(v){
		if (this._target instanceof HouseModel) {
			this._target.removeEventListener(HouseModel.OMP_CHANGED, this.targetOmpChanged);
		}

		this._target = v;

		if  (this._target instanceof HouseModel) {
			this._target.addEventListener(HouseModel.OMP_CHANGED, this.targetOmpChanged);
		}

		if  (this._target != null) {
			this.onChange();
		}
	}

	/**
	 * @returns {boolean}
	 */
	get invalidMeasurement()	{ return !this; }

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Plantation -> OMP implementation

	/**
	 * current omp width on this measurement point model;
	 * @return {number} Either its own value (when specified), or the omp width inherited from the measurement target
	 */
	get ompWidth() {
		return this._ompWidth >= 0 ? this._ompWidth : this.targetOmpWidth;
	}
	set ompWidth(v) {
		if (!isNaN(v)) {
			this._ompWidth = v;
			const refresh = this.distanceToOMP;
			this.onChange();
		}
	}

	/**
	 * @returns {number}
	 */
	get ompHeight() {
		return this._ompHeight >= 0 ? this._ompHeight : this.targetOmpWidth;
	}
	set ompHeight(v) {
		if (!isNaN(v)) {
			this._ompHeight = v;
			const refresh = this.distanceToOMP;
			this.onChange();
		}
	}

	/**
	 * @returns {Segment}
	 */
	get ompHeightParallelEdge()
	{
		if (!this.isPlantationOMP || !(this.target instanceof HouseModel) || !this._cornerEdges || this._cornerEdges.length!==2) {
			return null;
		}

		// return segment B as the one that's extended paralelly with the OMP height
		return new Segment(
			this.target.localToGlobal(this._cornerEdges[1].a.x, this._cornerEdges[1].a.y),
			this.target.localToGlobal(this._cornerEdges[1].b.x, this._cornerEdges[1].b.y)
		);
	}

	/**
	 * @returns {Segment}
	 */
	get ompWidthParallelEdge()
	{
		if (!this.isPlantationOMP || !(this.target instanceof HouseModel) || !this._cornerEdges || this._cornerEdges.length!==2) {
			return null;
		}

		// return segment A as the one that's extended paralelly with the OMP width
		return new Segment(
			this.target.localToGlobal(this._cornerEdges[0].a.x, this._cornerEdges[0].a.y),
			this.target.localToGlobal(this._cornerEdges[0].b.x, this._cornerEdges[0].b.y)
		);
	}

	/**
	 * @returns {HouseEdgeModel}
	 */
	get ompHeightEdge() {
		if (!this.isPlantationOMP || !(this.target instanceof HouseModel) || !this._cornerEdges || this._cornerEdges.length!==2) {
			return null;
		}

		return this._cornerEdges[1];
	}

	/**
	 * @returns {HouseEdgeModel}
	 */
	get opmWidthEdge() {
		if (!this.isPlantationOMP || !(this.target instanceof HouseModel) || !this._cornerEdges || this._cornerEdges.length!==2) {
			return null;
		}

		return this._cornerEdges[0];
	}

	/**
	 * width of the OMP (measured from the brickwall) of the measurement target, i.e. the house
	 * @return Number
	 */
	get targetOmpWidth()
	{
		return ('ompWidth' in this._target || this._target.hasOwnProperty('ompWidth')) ? this._target.ompWidth : 0;
	}

	/**
	 * Distance to the house's Outer Most Projection, when available
	 * @return Number
	 *
	 Details for how we calculate the OMP corner [X]:

	 :      |
	 :      |
	 : OMP  |
	 :Width | < segment A
	 :      |
	 :      |        segment B
	 :      |			V
	 :      x--------------------------
	 :				OMP
	 :			   Height
	 [X] . . . . . . . . . . . . . . . .

	 */
	get distanceToOMP()
	{
		if (this.isPlantationOMP && this.isOnCorner && this._cornerEdges && this._cornerEdges.length===2) {
			// Calculate the distance to the corner now.
			const A = this.ompWidthParallelEdge, B = this.ompHeightParallelEdge;

			if (!A || !B) {
				return 0;
			}

			/*
            // no need - this is included in the calculation
            if (Geom.segmentsParallel(_origin.x, _origin.y, _intersection.x, _intersection.y, A.a.x, A.a.y, A.b.x, A.b.y)) {
                return Math.max(0, _distance - this.ompHeight);
            }

            if (Geom.segmentsParallel(_origin.x, _origin.y, _intersection.x, _intersection.y, B.a.x, B.a.y, B.b.x, B.b.y)) {
                return Math.max(0, _distance - this.ompWidth);
            }
            */

			// otherwise, it's a custom distance
			let eaveCorner = this._origin.clone(), eaveTranslate = new Point(), normal;

			// 1. displace the eave corner with the ompHeight ( = extension along A)
			if (Geom.pointDistance(eaveCorner, A.a) < Geom.pointDistance(eaveCorner, A.b)) {
				// Segment A's corner vertex is (a). We move the OMP on the a -> b direction
				normal = new Segment(A.b, A.a);
			}	else {
				normal = new Segment(A.a, A.b);
			}
			normal.normalize(normal.length + this.ompHeight);
			eaveTranslate.offset(
				normal.b.x - eaveCorner.x,
				normal.b.y - eaveCorner.y
			);
			this.extA = normal;

			// 2. displace the eave corner with the ompWidth ( = extension along B)
			if (Geom.pointDistance(eaveCorner, B.a) < Geom.pointDistance(eaveCorner, B.b)) {
				// Segment A's corner vertex is (a). We move the OMP on the a -> b direction
				normal = new Segment(B.b, B.a);
			}	else {
				normal = new Segment(B.a, B.b);
			}
			normal.normalize(normal.length + this.ompWidth);
			eaveTranslate.offset(
				normal.b.x - eaveCorner.x,
				normal.b.y - eaveCorner.y
			);
			this.extB = normal;

			// 3. add the eave offset to the corner point
			eaveCorner.offset(eaveTranslate.x, eaveTranslate.y);

			// @TODO: include this in the model
			this.cornerPos 			= eaveCorner;

			// project the eaveCorner onto the target
			this.cornerIntersection	= this._edge.getIntersectionPoint(this.cornerPos.x, this.cornerPos.y);

			const wrongDistance = Geom.segmentLength(eaveCorner.x, eaveCorner.y, this._intersection.x, this._intersection.y);
			const goodDistance = Geom.pointDistance(this.cornerPos, this.cornerIntersection);

			console.log('calculations: W='+wrongDistance+', G='+goodDistance);

			return goodDistance;
		}

		return Math.max(0, this._distance - (this.isPlantationOMP ? this.ompWidth : 0));
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Actions

	/**
	 * @returns {String}
	 */
	getAccurateDistance()	{ return this.getFormattedDistance(this.distance); }

	/**
	 * @INFO: Roofline measurements show the distance to the house OMP (outer-most-projection)
	 */
	getOMPDistance()		{ return this.getFormattedDistance(this.distanceToOMP); }

	/**
	 * @INFO:
	 *	1. In QLD, everyone gets distances displayed to the 3rd decimal.
	 * 	2. Burbank wants distances displayed to the 3rd decimal everywhere.
	 *
	 *	3. In all other cases, they are displayed to the 2nd decimal
	 */
	getFormattedDistance(distance)
	{
		const precision = (AccountMgr.i.userRegion===4 || AccountMgr.i.builder===Builder.BURBANK) ? 1000 : 100;
		return ( Math.round( distance * precision ) / precision ) + '';
	}

	/**
	 * Limits the measurement distance to a fixed number of decimals
	 * @returns {string}
	 */
	getDisplayDistance(decimals=3)
	{
		const precision = Math.pow(10, Utils.minmax(decimals, 1, 6));
		return Math.round(this._distance*precision) / precision + '';
	}

	/**
	 * @returns {string} Text description for the measurement, with 2 decimals
	 */
	get description() {
		return this.getDisplayDistance(
			AccountMgr.i.userRegion===4 || AccountMgr.i.builder===Builder.BURBANK ?
				3 : 2
		) + 'm' + ( this.isRoofline ? ' OMP' : '' );
	}

	/**
	 * Moves the measurement anchor a certain distance. Should be called when the house translates,
	 * with the exact displacement values
	 *
	 * @param dx {number}
	 * @param dy {number}
	 */
	translate(dx, dy)			{ this._origin.translate(dx, dy); }

	/**
	 * Moves the measurement anchor to the indicated position
	 *
	 * @param px {number}
	 * @param py {number}
	 * @param isOnCorner {boolean}
	 * @param isRoofline {boolean}
	 *
	 * @TODO @RENAME updateAnchorPoint
	 */
	updateStartPoint(px, py, isOnCorner=false, isRoofline=false)
	{
		this._origin.x	 = px;
		this._origin.y	 = py;
		this._isOnCorner = isOnCorner;
		this._isRoofline = isRoofline;
	}

	/**
	 * @param snapInfo {SnapInfo}
	 */
	hookStartPoint(snapInfo)
	{
		this.updateStartPoint(snapInfo.point.x, snapInfo.point.y, snapInfo.isOnCorner, snapInfo.isRoofline);
		this._isHooked	  = true;
		this.target		  = snapInfo.target;
		this._cornerEdges = snapInfo.cornerEdges;

		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.HOOKED, this));
		this.onChange();
	}

	/**
	 * Deletes this measurement model
	 */
	deleteMeasurement()
	{
		if (this._origin) {
			this._origin.removeEventListener(EventBase.CHANGE, this._onParametersChange, this);
			this._origin = null;
		}
		if (this._edge) {
			this._edge.removeEventListener(EventBase.CHANGE, this._onParametersChange, this);
			this._edge.removeEventListener(ModelEvent.DELETE, this._onReferenceDelete, this);
			this._edge = null;
		}

		// reset the measure target
		this.target = null;

		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.DELETE, this));
	}

	targetOmpChanged() { this.onChange(); }

	/**
	 * @public
	 */
	dispatchEditEvent() {
		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.EDIT, this));
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Protected event listeners

	/**
	 * Recalculate the measurement distance
	 *
	 * @param e {EventBase}
	 * @protected
	 */
	_onParametersChange(e=null)
	{
		// Retake the measurement to the edge
		this._intersection	= this.edgeGlobalSpace.getIntersectionPoint(this._origin.x, this._origin.y);
		this._distance		= Geom.segmentLength(this._origin.x, this._origin.y, this._intersection.x, this._intersection.y);
		const refresh = this.distanceToOMP;

		this.onChange();
	}

	/**
	 * @param e {EventBase}
	 * @protected
	 */
	_onReferenceDelete(e)
	{
		this.deleteMeasurement();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	storeCornerEdges() {
		const result = [];
		if (this._cornerEdges && this._cornerEdges.length===2) {
			result.push(
				this.target.findEdgePosition(this._cornerEdges[0]),
				this.target.findEdgePosition(this._cornerEdges[1])
			);
		}
		return result;
	}

	/**
	 * recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			type		: this.type,
			ox			: this._origin.x ,
			oy			: this._origin.y ,
			onCorner	: this.isOnCorner,
			roofline 	: this.isRoofline,
			ompWidth	: this._ompWidth,
			ompHeight	: this._ompHeight,
			edges		: this.storeCornerEdges()
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		this._origin.x	 = state.ox;
		this._origin.y	 = state.oy;
		this._isOnCorner = state.hasOwnProperty('onCorner') ? state.onCorner : false;
		this._isRoofline = state.hasOwnProperty('roofline') ? state.roofline : false;

		this._ompWidth	= state.hasOwnProperty('ompWidth')  ? state.ompWidth  : -1;
		this._ompHeight	= state.hasOwnProperty('ompHeight') ? state.ompHeight : -1;

		if (state.hasOwnProperty('edges') && (state.edges instanceof Array) && this.target instanceof HouseModel) {
			this._cornerEdges = [
				this.target.edgeFromPosition(state.edges[0]),
				this.target.edgeFromPosition(state.edges[1])
			];
		}

		if (this.isPlantationOMP) {
			// refresh calc
			const refresh = this.distanceToOMP;
		}

		this._isHooked	 = true;
		this.onRestored();
	}
}