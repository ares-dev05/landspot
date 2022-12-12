import Point from '../../../geom/Point';
import Segment from '../../../geom/Segment';

export default class FacadeSegment extends Segment{

	/**
	 * @param a {Point}
	 * @param b {Point}
	 * @param isWall {boolean}
	 */
	constructor (a, b, isWall = false) {
		super(a, b);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isWall = isWall;

		/**
		 * @type {null|Point}
		 * @private
		 */
		this._da = null;

		/**
		 * @type {null|Point}
		 * @private
		 */
		this._db = null;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isHit = false;

		this.fix();
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get isWall() {
		return this._isWall;
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
		if (this._isHit !== v) {
			this._isHit = v;
			this.onChange();
		}
	}

	/**
	 * @public
	 */
	fix()
	{
		// store the defaults
		this._da = this.a.clone();
		this._db = this.b.clone();
	}

	/**
	 * set back to original values
	 * @public
	 */
	reset()
	{
		this.a = this._da.clone();
		this.b = this._db.clone();
		this.onChange();
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @public
	 */
	translate(x, y)
	{
		super.translate(x, y);
		this.onChange();
	}

	/**
	 * extend this segment if needed
	 * @param transform {TransformationPoint}
	 * @public
	 */
	applyTransform(transform)
	{
		let changed = false;
		if(this.a.y <= transform.position) {
			this.a.y -= transform.extension;
			changed = true;
		}
		if(this.b.y <= transform.position) {
			this.b.y -= transform.extension;
			changed = true;
		}

		changed && this.onChange();
	}

	/**
	 * create a new segment from an object
	 * @param data {Object}
	 * @param scx {number}
	 * @param scy {number}
	 * @returns FacadeSegment
	 * @public
	 */
	static fromObject(data, scx = 1, scy = 1)
	{
		return new FacadeSegment(
			new Point(data.ax * scx, data.ay * scy),
			new Point(data.bx * scx, data.by * scy),
			data.hasOwnProperty('isWall') && data.isWall
		);
	}
}