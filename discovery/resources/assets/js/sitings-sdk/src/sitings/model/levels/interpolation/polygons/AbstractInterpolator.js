/**
 *	[Abstract Class]
 *	Contains the basic data for polygon interpolation. This class doesn't actually implement any interpolation functionality,
 *	the classes that extend upon this one are responsible with
 */
export default class AbstractInterpolator {

	/**
	 * @param points {LevelPointModel[]}
	 */
	constructor (points) {
		this._points = points.concat();
	}

	/**
	 * @return {LevelPointModel[]} this point's vertices
	 * @public
	 */
	get points() { return this._points; }

	/**
	 * @param p {LevelPointModel[]}
	 */
	set points(p) { this._points = p; }

	/**
	 * @return {number} the index of a point inside this polygon
	 * @public
	 */
	indexOf(p) { return this._points.indexOf(p); }

	/**
	 * @param p {LevelPointModel} the vertex to test
	 * @return {boolean} indicates if this polgon has the indicated point as one of its vertices
	 * @public
	 */
	hasPoint(p) { return this._points.indexOf(p) >= 0; }

	/**
	 * Analyzes a point's position relative to the polygon, and interpolates it if the point is contained within the polygon.
	 *	We use this function because the quad & triangle interpolators share most of the functionality in the interpolation & containment tests.
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordinate of the point
	 * @return {InterpolateResult|null}
	 * @public
	 */
	analyze(x, y) {
		return null;
	}

	/**
	 * @param p {Point}
	 * @return {*}
	 * @public
	 */
	analyzePoint(p) {
		return this.analyze(p.x, p.y);
	}

	/**
	 * Detects if a point is contained in the current polygon
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordonate of the point
	 * @returns Boolean true if the point is a part of this polygon.
	 * @public
	 */
	contains(x, y) {
		return false;
	}

	/**
	 * @param p {Point}
	 * @return {boolean}
	 * @public
	 */
	containsPoint(p) {
		return this.contains(p.x, p.y);
	}

	/**
	 * Interpolates on the existing points and returns the value at position (x,y)
	 * @param x {number} X coordinate of the point to interpolate
	 * @param y {number} Y coordinate of the point to interpolate
	 * @return {number} the interpolated value at the indicated position
	 * @public
	 */
	interpolate(x, y) {
		return 0;
	}

	/**
	 * @param p
	 * @return {number}
	 * @public
	 */
	interpolatePoint(p) {
		return this.interpolate(p.x, p.y);
	}
}