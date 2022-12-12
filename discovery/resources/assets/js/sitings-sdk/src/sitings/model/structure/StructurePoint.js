import HighlightableModel from '../../../events/HighlightableModel';
import TransformEvent from '../../events/TransformEvent';
import Geom from '../../../utils/Geom';
import Point from '../../../geom/Point';

export default class StructurePoint extends HighlightableModel {

	static get DATA_TYPE()  { return 'point'; }

	// possible point structures
	static get TREE()		{ return 1; }

	static get HIT_RADIUS() { return 1.5; }

	/**
	 * @param type {number}
	 * @param x {number}
	 * @param y {number}
	 * @param radius {number}
	 * @param includeInSiteCoverage {boolean}
	 * @param context {Object}
	 */
	constructor(type, x=0, y=0, radius=1.5, includeInSiteCoverage=false, context=null)
	{
		super(context);

		/**
		 * @type {number}
		 * @protected
		 */
		this._type	 = type;

		/**
		 * @type {number}
		 * @protected
		 */
		this._x		 = x;

		/**
		 * @type {number}
		 * @protected
		 */
		this._y		 = y;

		/**
		 * @type {number}
		 * @private
		 */
		this._radius = radius;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._includeInSiteCoverage	= includeInSiteCoverage;
	}

	/**
	 * @return {number}
	 */
	get type() { return this._type; }

	/**
	 * @return {number}
	 */
	get x() { return this._x; }

	/**
	 * @param v {number}
	 */
	set x(v) {
		this.dispatchEvent(
			new TransformEvent(
				TransformEvent.TRANSLATE, {
					dx:v - this._x,
					dy:0,
					model:this
				}
			)
		);
		this._x = v;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get y() { return this._y; }

	/**
	 * @param v {number}
	 */
	set y(v) {
		this.dispatchEvent(
			new TransformEvent(
				TransformEvent.TRANSLATE, {
					dx:0,
					dy:v - this._y,
					model:this
				}
			)
		);
		this._y = v;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get radius() { return this._radius; }

	/**
	 * @param v {number}
	 */
	set radius(v) {
		this._radius = Math.max(v, 0.1);
		this.onChange();
		this.dispatchEvent(new TransformEvent(TransformEvent.SHAPE, {model: this}));
	}

	/**
	 * @return {string}
	 */
	get typeName() {
		if (this._type === StructurePoint.TREE) {
			return 'TREE GRAPHIC';
		}

		return '';
	}

	/**
	 * @param v {boolean}
	 */
	set includeInSiteCoverage(v) {
		if (v !== this._includeInSiteCoverage) {
			this._includeInSiteCoverage = v;
			this.onChange();
		}
	}

	/**
	 * @returns {boolean}
	 */
	get includeInSiteCoverage() { return this._includeInSiteCoverage; }

	/**
	 * @return number
	 */
	get area() { return Math.PI * this._radius * this._radius; }

	/**
	 * deletes the model
	 */
	remove() {
		this.onDelete();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Transformations

	/**
	 * @param factor {number}
	 */
	scale(factor)
	{
		this._x	*= factor;
		this._y	*= factor;
		this.onChange();
	}

	/**
	 * @param tx {number}
	 * @param ty {number}
	 */
	translate(tx, ty)
	{
		this._x	+= tx;
		this._y	+= ty;
		this.dispatchEvent(
			new TransformEvent(
				TransformEvent.TRANSLATE, {
					dx:tx,
					dy:ty,
					model:this
				}
			)
		);

		this.onChange();
	}

	/**
	 * @param angle {number}
	 * @param ox {number} X coordinate of the rotation origin
	 * @param oy {number} Y coordinate of the rotation origin
	 */
	rotate(angle, ox, oy)
	{
		const newPosition = Geom.rotatePointCoords(ox, oy, this.x, this.y, angle);

		this._x	= newPosition.x;
		this._y	= newPosition.y;
		this.onChange();
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	inject(x, y)
	{
		this._x = x;
		this._y = y;
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	moveTo(x, y)
	{
		this.dispatchEvent(
			new TransformEvent(
				TransformEvent.TRANSLATE, {
					dx:x - this._x,
					dy:y - this._y,
					model:this
				}
			)
		);

		this._x = x;
		this._y = y;

		this.onChange();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IMeasureTarget implementation

	/**
	 * @param a {Point}
	 * @param b {Point}
	 * @param distance {number}
	 */
	moveOnSegment(a, b, distance)
	{
		// translate along the angle defined by A and B
		const segmentDistance = Geom.segmentLength(a.x, a.y, b.x, b.y),
			segmentAngle = Math.atan2(b.y-a.y, b.x-a.x),
			translation = distance-segmentDistance;

		this.translate(
			translation * Math.cos(segmentAngle),
			translation * Math.sin(segmentAngle)
		);
	}

	/**
	 * @param segment {Segment}
	 * @param px {number}
	 * @param py {number}
	 * @param startPoint {Point}
	 */
	rotateToAlignWithSegmentAt(segment, px, py, startPoint)
	{
		// @UNUSED: points don't rotate
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @param startPoint {Point}
	 * @param snapToRoofs {boolean}
	 * @return {Point}
	 */
	getExistingSnapPosition(px, py, startPoint=null, snapToRoofs=false)
	{
		// basic test: if the distance between px and py is smaller than the tree's radius, consider the intersection done
		if ( Geom.segmentLength(px, py, this.x, this.y) < Math.max(this.radius, StructurePoint.HIT_RADIUS) ) {
			return new Point(this.x, this.y);
		}

		return null;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {string}
	 */
	get dataType() { return StructurePoint.DATA_TYPE; }

	/**
	 * recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			x		 : this.x,
			y		 : this.y,
			type	 : this.type,
			radius	 : this.radius,
			dataType : this.dataType,
			site	 : this.includeInSiteCoverage
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		this._x		 				= state.x;
		this._y		 				= state.y;
		this._type	 				= state.type;
		this._radius				= state.hasOwnProperty('radius') ? state.radius : 1.5;
		this._includeInSiteCoverage	= state.hasOwnProperty('site') ? state.site : false;

		this.onRestored();
	}

	/**
	 * @param state {{}}
	 * @return {StructurePoint}
	 */
	static fromRestoreData(state)
	{
		let p = new StructurePoint(0);
		p.restoreState( state );
		return p;
	}
}