export default class FallLineModel{

	/**
	 * @param level {number}
	 * @param start {Point}
	 * @param left {number}
	 * @param interpolator {AbstractInterpolator}
	 */
	constructor(level, start, left, interpolator) {

		/**
		 * @type {number}
		 * @private
		 */
		this._level	= level;

		/**
		 * @type {Point}
		 * @private
		 */
		this._start	= start;

		/**
		 * @type {Point[]}
		 * @private
		 */
		this._points = [];
		this._points.push( start );

		/**
		 * @type {number}
		 * @private
		 */
		this._left = left;

		/**
		 * @type {AbstractInterpolator}
		 * @private
		 */
		this._interpolator = interpolator;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get level() {
		return this._level;
	}

	/**
	 * @return {Point}
	 * @public
	 */
	get start() {
		return this._start;
	}

	/**
	 * @return {AbstractInterpolator}
	 */
	get interpolator() {
		return this._interpolator;
	}

	/**
	 * @return {Point[]}
	 * @public
	 */
	get points() {
		return this._points;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get leftDirection() {
		return this._left;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get rightDirection() {
		return this._left + Math.PI;
	}

	/**
	 * adds a point to the indicated half-plane from the fall slope that the start point is on
	 * @param p {Point}
	 * @param leftPlane {boolean}
	 */
	addHalfPlanePoint(p, leftPlane) {
		leftPlane ? this.points.unshift(p) : this.points.push(p);
	}
}