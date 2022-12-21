import EventBase from '../../../events/EventBase';
import RestoreDispatcher from '../../../events/RestoreDispatcher';
import MeasurementsLayerModel from '../measure/MeasurementsLayerModel';
import Geom from '../../../utils/Geom';

/**
 * facade/floor placement model contains all the details about the floor's position within the lot
 */
export default class FloorPositionModel extends RestoreDispatcher{

	/**
	 * @returns {string}
	 * @constructor
	 */
	static get VCHANGE() { return 'v.change'; }

	/**
	 * @param lot {LotPointModel}
	 * @param measurements {MeasurementsLayerModel}
	 * @param facadeModel {FacadeModel}
	 */
	constructor (lot, measurements, facadeModel) {
		super();

		// keep a copy of the left setback so we can add/remove events to/from it
		/**
		 * @type {null|MeasurementPointModel}
		 * @private
		 */
		this._leftSetback = null;

		/**
		 * @type {null|MeasurementPointModel}
		 * @private
		 */
		this._rightSetback = null;

		// the calculated left & right walls of the house / facade
		/**
		 * @type {null|Segment}
		 * @private
		 */
		this._leftWall = null;

		/**
		 * @type {null|Segment}
		 * @private
		 */
		this._rightWall = null;

		// calculated facade width from the setbacks
		/**
		 * @type {number}
		 * @private
		 */
		this._houseWidth = NaN;

		/**
		 * padding to add around the house, in meters
		 * make this customizable. E.g., for burbank, they are: Single 1.2m and 1.8m on double for working platform.
		 *
		 * @type {number}
		 * @private
		 */
		this._housePadding = 0.8;

		// retaining wall height threshold
		// @TODO: make this customizable. e.g., for burbank,
		// 300mm is when retaining walls kick in for Burbank placed at a minimum setback of 1.2m on singles and 1.8m on doubles.
		/**
		 * @type {number}
		 * @private
		 */
		this._retainingWallThreshold = 0.3;

		// info on the cut & fill levels, and the levels of the PAD
		/**
		 * @type {number}
		 * @private
		 */
		this._groundLeftLevel = NaN;

		/**
		 * @type {number}
		 * @private
		 */
		this._groundRightLevel = NaN;

		/**
		 * @type {number}
		 * @private
		 */
		this._padLevel = NaN;

		/**
		 * @type {number}
		 * @private
		 */
		this._userChangedPad = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._padLowLevel = NaN;

		/**
		 * @type {number}
		 * @private
		 */
		this._padHighLevel = NaN;

		// distance from the left side of the lot to the left side of the pad
		/**
		 * @type {number}
		 * @private
		 */
		this._padLeftDistance = NaN;
		// distance from the right side of the lot
		/**
		 * @type {number}
		 * @private
		 */
		this._padRightDistance = NaN;

		// the lot that the house is positioned in
		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._lot = lot;

		// siting measurements
		/**
		 * @type {MeasurementsLayerModel}
		 * @private
		 */
		this._measurements = measurements;
		this._measurements.addEventListener(MeasurementsLayerModel.SETBACK_CHANGE, this.onSetbackChanged, this);

		/**
		 * @type {FacadeModel}
		 * @private
		 */
		this._facadeModel = facadeModel;
	}

	/**
	 * @return {MeasurementsLayerModel}
	 * @public
	 */
	get measurements() {
		return this._measurements;
	}

	/**
	 * @return {FacadeModel}
	 * @public
	 */
	get facade() {
		return this._facadeModel;
	}

	/**
	 * @return {*}
	 * @public
	 */
	get  leftSetback() {
		return this._measurements.leftSetback;
	}

	/**
	 * @return {*}
	 * @public
	 */
	get rightSetback() {
		return this._measurements.rightSetback;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get houseWidth() {
		return this._houseWidth;
	}

	/**
	 * Padding to add around the house for the cut & fill area
	 * @return {number}
	 * @public
	 */
	get housePadding() {
		return this._housePadding;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set housePadding(v) {
		this._housePadding = v;
	}

	/**
	 * @return {number} the minimum height of a retaining wall
	 * @public
	 */
	get retainingWallThreshold() {
		return this._retainingWallThreshold;
	}

	/**
	 * @param v {number} the minimum height of a retaining wall
	 */
	set retainingWallThreshold(v) { this._retainingWallThreshold=v; }

	/**
	 * Levels of the ground at the left & right sides of the pad, before cutting & filling
	 * @return {number}
	 * @public
	 */
	get groundLeftLevel() {
		return this._groundLeftLevel;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set groundLeftLevel(v) {
		this._groundLeftLevel = v;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get groundRightLevel() {
		return this._groundRightLevel;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set groundRightLevel(v) {
		this._groundRightLevel = v;
	}

	/**
	 * Level of the pad, after the ground is cut & filled + padded
	 * @return {number}
	 * @public
	 */
	get padLevel() {
		return this._padLevel;
	}

	/**
	 * Level of the pad change.
	 * @return {number}
	 * @public
	 */
	get userChangedPad() {
		return this._userChangedPad;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set padLevel(v) {
		this._padLevel = v;
		this.dispatchEvent(new EventBase(FloorPositionModel.VCHANGE, this));
	}

	/**
	 * pad positioning
	 * @return {number}
	 * @public
	 */
	get padLeftDistance() {
		return this._padLeftDistance;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set padLeftDistance(v) {
		this._padLeftDistance = v;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get padRightDistance() {
		return this._padRightDistance;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set padRightDistance(v) {
		this._padRightDistance = v;
	}

	/**
	 * Cut & Fill calculations: lowest & highest levels of the land along the lot
	 * @return {number}
	 * @public
	 */
	get padLowLevel() {
		return this._padLowLevel;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set padLowLevel(v) {
		this._padLowLevel = v;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get padHighLevel() {
		return this._padHighLevel;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set padHighLevel(v) {
		this._padHighLevel = v;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get cutHeight() {
		return this.padHighLevel - this.padLevel;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get fillHeight() {
		return this.padLevel - this.padLowLevel;
	}

	// we're cutting from the high level
	/**
	 * @param v {number}
	 * @public
	 */
	set cutHeight(v) {
		const oldPadLevel = this.padLevel;
		this.padLevel = this.padHighLevel - v;
		this._userChangedPad = this._userChangedPad - (oldPadLevel - this.padLevel);
	}

	// we're filling the low level
	/**
	 * @param v {number}
	 * @public
	 */
	set fillHeight(v) {
		const oldPadLevel = this.padLevel;
		this.padLevel = this.padLowLevel  + v;
		this._userChangedPad = this._userChangedPad - (oldPadLevel - this.padLevel);
	}

	/**
	 * @return {number} distance between the left of the house & the boundary
	 * @public
	 */
	get  leftDistance() {
		// left is ALWAYS positive; we don't allow the house to be dragged anywhere further
		if (this.leftSetback) {
			if (this._lot.contains(this.leftSetback.origin.clone())) {
				return this.leftSetback.distance;
			}
			return 0;
		}
		return 0;
	}

	/**
	 * @return {number|number}
	 * @public
	 */
	get rightDistance() {
		if (this.rightSetback) {
			if (this._lot.contains(this.rightSetback.origin.clone())) {
				return this.rightSetback.distance;
			}
			return 0;
		}
		return 0;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set width(v) {
		// @TODO
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set height(v) {
		// @TODO
	}

	// the floor to which measurements are taken
	/**
	 * @return {*|null}
	 * @public
	 */
	get floor() {
		return this.leftSetback ? this.leftSetback.target : null;
	}

	// the wall that the left setback is attached to
	/**
	 * @return {Segment}
	 * @public
	 */
	get leftWall() {
		return this._leftWall;
	}

	// the wall that the right setback is attached to
	/**
	 * @return {Segment}
	 * @public
	 */
	get rightWall() {
		return this._rightWall;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get lotWidth() {
		return this.leftDistance + this.houseWidth + this.rightDistance;
	}

	/**
	 * update the measurements
	 * @public
	 */
	measure() {
		this.onSetbackChanged();
	}

	/**
	 * translate the floor along the facade by the indicated value
	 * @param dx {number}
	 * @public
	 */
	translateFloor(dx) {
		let a;
		let b;

		// translate the floor on the segment from the left wall to the right setback origin
		if (this.leftWall) {
			b = this.rightSetback.origin.clone();
			a = Geom.pointToSegmentIntersection(b.x, b.y, this.leftWall.a.x, this.leftWall.a.y, this.leftWall.b.x, this.leftWall.b.y);
		}	else {
			a = this.leftSetback.origin.clone();
			b = Geom.pointToSegmentIntersection(a.x, a.y, this.rightWall.a.x, this.rightWall.a.y, this.rightWall.b.x, this.rightWall.b.y);
		}

		// don't let the house go out too much to the left
		if (this.leftDistance + dx < 0) {
			dx = -this.leftDistance;
		}
		if (this.rightDistance + (-dx) < 0) {
			dx = this.rightDistance;
		}
		// @TODO: when the house goes to the right, we should keep the lot width fixed.
		// determine this by seeing if the measurement point is outside of the lot.

		this.floor.translateOnSegment(a, b, dx);
	}

	/**
	 * @private
	 */
	onSetbackChanged() {
		// exit if we don't have both setbacks set
		if (!this.leftSetback || !this.rightSetback)
			return;

		// we only listen to size changes on the left setback, because when one measurement changes, so does the other
		if (this._leftSetback) {
			this._leftSetback.removeEventListener(EventBase.CHANGE, this.leftSetbackSizeChanged, this);
			this._leftSetback = null;
		}
		this._leftSetback = this.leftSetback;
		if (this._leftSetback) {
			this._leftSetback.addEventListener(EventBase.CHANGE, this.leftSetbackSizeChanged, this);
			this._leftSetback = null;
		}

		if (this._rightSetback) {
			this._rightSetback.removeEventListener(EventBase.CHANGE, this.leftSetbackSizeChanged, this);
			this._rightSetback = null;
		}
		this._rightSetback = this.rightSetback;
		if (this._rightSetback) {
			this._rightSetback.addEventListener(EventBase.CHANGE, this.leftSetbackSizeChanged, this);
			this._rightSetback = null;
		}

		this._leftWall = this._rightWall = null;

		// determine the left & right walls
		if (this.floor && this.leftSetback && !this.leftSetback.isOnCorner) {
			this._leftWall = this.floor.getClosestMetricSegmentTo(this.leftSetback.origin.x, this.leftSetback.origin.y);
		}
		if (this.floor && this.leftSetback && !this.leftSetback.isOnCorner) {
			this._rightWall = this.floor.getClosestMetricSegmentTo(this.rightSetback.origin.x, this.rightSetback.origin.y);
		}

		// @TODO: determine the facade direction here (as a left->right segment) and cache it

		// recalculate the facade width
		this.calculateFacadeWidth();

		this.onChange();
	}

	/**
	 * @private
	 */
	leftSetbackSizeChanged() {
		// @TODO: cache left & right measurements
		this.onChange();
	}

	/**
	 * @private
	 */
	calculateFacadeWidth() {
		if (this.leftSetback && this.rightSetback) {
			if (this.leftWall) {
				this._houseWidth = Geom.pointToSegmentDistance(
					// right setback to the left wall
					this.rightSetback.origin.x, this.rightSetback.origin.y,
					this.leftWall.a.x, this.leftWall.a.y, this.leftWall.b.x, this.leftWall.b.y
				);
			}	else
			if (this.rightWall) {
				this._houseWidth = Geom.pointToSegmentDistance(
					// right setback to the left wall
					this.leftSetback.origin.x, this.leftSetback.origin.y,
					this.rightWall.a.x, this.rightWall.a.y, this.rightWall.b.x, this.rightWall.b.y
				);
			}	else
			if (this._facadeModel) {
				// unable to calculate the facade size;
				this._houseWidth = this._facadeModel.width;
			}
		}	else {
			this._houseWidth = 0;
		}
	}

	/**
	 * @public
	 */
	clear() {
		// @TODO
	}

	/**
	 * @TODO recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState() {
		return {};
	}

	/**
	 * @TODO restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state) {
	}
}








