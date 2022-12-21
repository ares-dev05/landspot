import Geom from '../utils/Geom';

export default class Triangle
{
	get a() { return this._a; }
	get b() { return this._b; }
	get c() { return this._c; }

	/**
	 * @param a {Point}
	 * @param b {Point}
	 * @param c {Point}
	 * @param calculateArea {boolean}
	 * @constructor
	 */
	constructor( a, b, c, calculateArea=true)
	{
		this._a = a;
		this._b = b;
		this._c = c;
		this._area = 0;

		if (calculateArea) {
			this.updateArea();
		}
	}

	get area() { return this._area; }

	updateArea()
	{
		if (this.a && this.b && this.c) {
			this._area = Math.abs(
				this.a.x * (this.b.y - this.c.y) +
				this.b.x * (this.c.y - this.a.y) +
				this.c.x * (this.a.y - this.b.y)
			) / 2;
		}	else {
			this._area = 0;
		}
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @returns {number}
	 */
	distanceFromCoords(x, y) {
		return Math.min(
			Geom.pointToSegmentDistance(x, y, this.a.x, this.a.y, this.b.x, this.b.y),
			Geom.pointToSegmentDistance(x, y, this.a.x, this.a.y, this.c.x, this.c.y),
			Geom.pointToSegmentDistance(x, y, this.b.x, this.b.y, this.c.x, this.c.y),
		);
	}

	/**
	 * @private
	 */
	_cacheBarycentricConstants() {
		if (typeof this.bdenom !== 'undefined') {
			return;
		}

		/**
		 * @type {number}
		 * @private
		 */
		this.left = Math.min(this.a.x, Math.min(this.b.x, this.c.x)) - Geom.TOLERANCE;

		/**
		 * @type {number}
		 * @private
		 */
		this.right = Math.max(this.a.x, Math.max(this.b.x, this.c.x)) + Geom.TOLERANCE;

		/**
		 * @type {number}
		 * @private
		 */
		this.top = Math.min(this.a.y, Math.min(this.b.y, this.c.y)) - Geom.TOLERANCE;

		/**
		 * @type {number}
		 * @private
		 */
		this.bottom = Math.max(this.a.y, Math.max(this.b.y, this.c.y)) + Geom.TOLERANCE;

		/**
		 * @type {number}
		 * @private
		 */
		this.bcy = this.b.y - this.c.y;

		/**
		 * @type {number}
		 * @private
		 */
		this.cbx = this.c.x - this.b.x;

		/**
		 * @type {number}
		 * @private
		 */
		this.cay = this.c.y - this.a.y;

		/**
		 * @type {number}
		 * @private
		 */
		this.acx = this.a.x - this.c.x;

		/**
		 * @type {number}
		 * @private
		 */
		this.bdenom	= this.bcy * this.acx - this.cbx * this.cay;	// sign reversed because we use (c-a).y instead of (a-c).
	}

	/**
	 * @param x
	 * @param y
	 * @returns {number[]}
	 * @private
	 */
	_getBarycentricParameters(x, y) {
		this._cacheBarycentricConstants();
		const a = (this.bcy * (x - this.c.x) + this.cbx * (y - this.c.y)) / this.bdenom;
		const b = (this.cay * (x - this.c.x) + this.acx * (y - this.c.y) ) / this.bdenom;
		return [a, b, 1 - a - b];
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @returns {boolean}
	 */
	contains(x, y) {
		// run a bounding box test to rule out far points
		if (x < this.left || x > this.right || y < this.top || y > this.bottom) {
			return false;
		}

		// get the barycentric parameters/weights, if they're not already available
		const w = this._getBarycentricParameters(x, y);

		// check that they are all sub-unitary and positive
		return 0 <= w[0] && w[0] <= 1 && 0 <= w[1] && w[1] <= 1 && 0 <= w[2] && w[2] <= 1;
	}

	/**		   __________________
	 * Area	= √ p (p−a)(p−b)(p−c)
	 * @param a {number}
	 * @param b {number}
	 * @param c {number}
	 */
	static areaFromSides(a, b, c) {
		const p = (a+b+c)/2;
		return Math.sqrt( p * (p-a) * (p-b) * (p-c) );
	}
}