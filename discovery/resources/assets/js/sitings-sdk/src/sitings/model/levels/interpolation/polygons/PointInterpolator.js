import AbstractInterpolator from './AbstractInterpolator';

export default class PointInterpolator extends AbstractInterpolator{

	/**
	 * @param points {LevelPointModel[]}
	 */
	constructor (points) {
		super(points);
	}

	/**
	 * Interpolates on the existing points and returns the value at position (x,y)
	 * @param x Number X coordinate of the point to interpolate
	 * @param y Number Y coordinate of the point to interpolate
	 * @return Number the interpolated value at the indicated position
	 * @public
	 */
	interpolate(x, y) {
		return this.points[0].height;
	}

	/**
	 * Containment detection; what value should we return by default ?
	 * @param x Number X coordinate of the point
	 * @param y Number Y coordonate of the point
	 * @returns Boolean true if the point is a part of this polygon.
	 * @public
	 */
	contains(x, y) {
		return false;
	}
}