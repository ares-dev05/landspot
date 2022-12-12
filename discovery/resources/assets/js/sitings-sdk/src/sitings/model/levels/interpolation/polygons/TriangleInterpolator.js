import AbstractInterpolator from './AbstractInterpolator';
import InterpolateResult from '../InterpolateResult';
import Geom from '../../../../../utils/Geom';
import Triangle from '../../../../../geom/Triangle';

/**
 *	Uses Barycentric interpolation (ratios of areas) to calculate the value of a point (X,Y) inside a triangle. References:
 *	@TODO: move some of the functionality from here to com.archi.model.Triangle so we can use it for more generic cases.
 *
 *	Test if a point is inside a triangle:
 *		https://stackoverflow.com/questions/2049582/how-to-determine-if-a-point-is-in-a-2d-triangle
 *		https://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle
 *		[AS3]	http://totologic.blogspot.fr/2014/01/accurate-point-in-triangle-test.html
 *		[MATH]	https://math.stackexchange.com/questions/51326/determining-if-an-arbitrary-point-lies-inside-a-triangle-defined-by-three-points
 *
 *	Interpolation:
 *		* https://codeplea.com/triangular-interpolation
 *		https://stackoverflow.com/questions/8697521/interpolation-of-a-triangle
 *		https://classes.soe.ucsc.edu/cmps160/Fall10/resources/barycentricInterpolation.pdf
 *
 */
export default class TriangleInterpolator extends AbstractInterpolator{

	/**
	 * @param points {LevelPointModel[]}
	 */
	constructor (points) {
		super(points);

		// cache positions & values
		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this.a = this.points[0].position;

		/**
		 * @type {number}
		 * @private
		 */
		this.qa = this.points[0].height;

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this.b = this.points[1].position;

		/**
		 * @type {number}
		 * @private
		 */
		this.qb = this.points[1].height;

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this.c = this.points[2].position;

		/**
		 * @type {number}
		 * @private
		 */
		this.qc = this.points[2].height;

		// calculate the bounding box for fast tests.
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

		// pre-calculate the barycentric constants
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
	 * @return {boolean}
	 */
	get isDegenerate() { return Geom.epsilonEqual(this.bdenom, 0); }

	/**
	 * return the 3 parameters of the barymetric coordinates weighting
	 * @OPTIMIZED: cached all the known constants for faster speed
	 * @private
	 */
	getBarycentricParameters(x, y) {
		const a = (this.bcy * (x - this.c.x) + this.cbx * (y - this.c.y)) / this.bdenom;
		const b = (this.cay * (x - this.c.x) + this.acx * (y - this.c.y) ) / this.bdenom;
		return [a, b, 1 - a - b];
	}

	/**
	 * Analyzes a point's position relative to the triangle, and interpolates it if the point is contained within the triangle.
	 * @param x Number X coordinate of the point
	 * @param y Number Y coordonate of the point
	 * @return {InterpolateResult} .contained is true if the point is a part of this polygon.
	 * @public
	 */
	analyze(x, y) {
		// get the barycentric parameters/weights
		const w = this.getBarycentricParameters(x, y);
		const result = new InterpolateResult();

		/** @Interpolate: calculate the value at the point using the weights */
		result.value = w[0] * this.qa + w[1] * this.qb + w[2] * this.qc;

		/** @CollisionTest: run the barycentric containment test with the pre-calculated parameters */
		result.contained = this._containsBarycentric(x, y, w);

		return result;
	}

	/**
	 * Interpolates on the existing points and returns the value at position (x,y)
	 * @param x {number} X coordinate of the point to interpolate
	 * @param y {number} Y coordinate of the point to interpolate
	 * @return Number the interpolated value at the indicated position
	 */
	interpolate(x, y) {
		// get the barycentric parameters/weights
		const w = this.getBarycentricParameters(x, y);

		// calculate the value at the point using the weights
		return w[0] * this.qa + w[1] * this.qb + w[2] * this.qc;
	}

	/**
	 * Point-in-Triangle detection
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordonate of the point
	 * @returns Boolean true if the point is a part of this polygon.
	 * @public
	 */
	contains(x, y) {
		// because we're using barycentric interpolation, we also use it for the containment test
		// we can switch to cross product containment if the barycentric test is too slow.
		return this._containsBarycentric(x, y);
	}

	/**
	 * Performs a Barycentric test to see if the point (x,y) is contained inside the triangle
	 * @param x {number} Y coordinate of the point to test
	 * @param y {number} X coordinate of the point to test
	 * @param w Array [optional] the pre-calculated barycentric parameters
	 * @private
	 */
	_containsBarycentric(x, y, w= null) {
		// run a bounding box test to rule out far points
		if (x < this.left || x > this.right || y < this.top || y > this.bottom)
			return false;

		// get the barymetric parameters/weights, if they're not already available
		w = w || this.getBarycentricParameters(x, y);

		// check that they are all sub-unitary and positive
		return	0 <= w[0] && w[0] <= 1 &&
				0 <= w[1] && w[1] <= 1 &&
				0 <= w[2] && w[2] <= 1;
	}

	/**
	 * @param point {Point}
	 * @return {number}
	 */
	distanceFrom(point) {
		return this.distanceFromCoords(point.x, point.y);
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @return {number}
	 */
	distanceFromCoords(x, y) {
		if (!this.face) {
			this.face = new Triangle(this.a, this.b, this.c);
		}

		return this.face.distanceFromCoords(x, y);
	}
}