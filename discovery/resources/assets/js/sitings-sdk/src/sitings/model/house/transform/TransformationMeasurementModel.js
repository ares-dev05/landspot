import ChangeDispatcher from '../../../../events/ChangeDispatcher';
import Point from '../../../../geom/Point';
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';
import Geom from '../../../../utils/Geom';

export default class TransformationMeasurementModel extends ChangeDispatcher {
	
	static get DIR_HORIZ() { return 1; }
	static get DIR_VERT () { return 2; }

	static get TYPE()	   { return 'addon_anchor'; }

	constructor()
	{
		super();

		/**
		 * The anchor that is placed on one of the transformation's edges
		 * @type {Point}
		 * @private
		 */
		this._extensionAnchor = new Point();

		/**
		 * The end of the segment to which the measurement is done
		 * @type {Point}
		 * @private
		 */
		this._segmentAnchor	  = new Point();

		/**
		 * @type {boolean}
		 * @private
		 */
		this._visible		  = false;

		/**
		 * Distance between the two anchors
		 * @type {number}
		 * @private
		 */
		this._distance		  = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._direction		  = 0;
	}

	/**
	 * @returns {string}
	 */
	get type() { return TransformationMeasurementModel.TYPE; }

	/**
	 * @return {number}
	 */
	get direction(){ return this._direction; }

	/**
	 * @param v {number}
	 */
	set direction(v) { this._direction=v; }

	/**
	 * @return {Point}
	 */
	get extensionAnchor() { return this._extensionAnchor; }

	/**
	 * @return {Point}
	 */
	get segmentAnchor  () { return this._segmentAnchor; }

	/**
	 * @return {number}
	 */
	get distance() { return this._distance; }

	/**
	 * @param value {number}
	 */
	set distance(value)
	{
		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.RESIZING, this, value));
	}

	/**
	 * @public
	 */
	dispatchEditEvent() {
		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.EDIT, this));
	}

	/**
	 * @return {string}
	 */
	getDisplayDistance() { return this._distance.toPrecision(3); }

	/**
	 * @return {boolean}
	 */
	get visible() { return this._visible; }

	/**
	 * @param v {boolean}
	 */
	set visible(v) {
		if (v !== this._visible) {
			this._visible = v;
			this.onChange();
		}
	}

	/**
	 * @param distance {number}
	 * @return {Point}
	 */
	getResizeDelta(distance)
	{
		if (this._direction===TransformationMeasurementModel.DIR_HORIZ) {
			return new Point(
				(distance-this._distance) * (this._segmentAnchor.x<this._extensionAnchor.x ? 1 : -1),
				0
			);
		}	else {
			return new Point(
				0,
				(distance-this._distance) * (this._segmentAnchor.y<this._extensionAnchor.y ? 1 : -1 )
			);
		}
	}

	/**
	 * Translates the entire measurement point; used when the floorplan moves together with the extension
	 *
	 * @param dx {number}
	 * @param dy {number}
	 */
	translate(dx, dy)
	{
		this._extensionAnchor.x += dx;
		this._extensionAnchor.y += dy;

		this._segmentAnchor.x	+= dx;
		this._segmentAnchor.y	+= dy;
		
		this.recalculate();
	}

	/**
	 * Translates the extension while keeping the anchor fixed
	 *
	 * @param dx {number}
	 * @param dy {number}
	 */
	moveExtension(dx, dy)
	{
		this._extensionAnchor.x += dx;
		this._extensionAnchor.y += dy;

		if (this._direction===TransformationMeasurementModel.DIR_VERT){
			this._segmentAnchor.x += dx;
		}	else {
			this._segmentAnchor.y += dy;
		}

		this.recalculate();
	}
	
	recalculate()
	{
		this._distance = Geom.segmentLength(
			this._extensionAnchor.x, this._extensionAnchor.y,
			this._segmentAnchor.x, this._segmentAnchor.y
		);
		this.onChange();
	}
	
	deleteMeasurement()
	{
		this.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.DELETE, this));
	}
}