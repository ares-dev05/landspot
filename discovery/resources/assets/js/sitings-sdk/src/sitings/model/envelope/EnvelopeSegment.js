import Segment from '../../../geom/Segment';

export default class EnvelopeSegment extends Segment {
	/**
	 *
	 * @param a {Point}
	 * @param b {Point}
	 * @param isGround {boolean}
	 * @param isRetainingWall {boolean}
	 * @param isVirtual {boolean}
	 */
	constructor (a, b, isGround=false, isRetainingWall=false, isVirtual=false) {
		super(a, b);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isHit = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isGround = isGround;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isRetainingWall = isRetainingWall;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isVirtual = isVirtual;
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get isHit() {
		return this._isHit;
	}

	/**
	 * @param v {boolean}
	 * @public
	 */
	set isHit(v) {
		this._isHit = v;
		this.onChange();
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get isGround() {
		return this._isGround;
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get isRetainingWall() {
		return this._isRetainingWall;
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get isVirtual() {
		return this._isVirtual;
	}
}