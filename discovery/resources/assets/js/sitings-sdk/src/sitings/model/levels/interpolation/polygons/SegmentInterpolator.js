import AbstractInterpolator from './AbstractInterpolator';
import Geom from '../../../../../utils/Geom';

export default class SegmentInterpolator extends AbstractInterpolator {

	/**
	 * @param points {LevelPointModel[]}
	 */
	constructor (points) {
		super(points);
	}

	/**
	 * Interpolates on the existing points and returns the value at position (x,y)
	 * @param x {number} X coordinate of the point to interpolate
	 * @param y {number} Y coordinate of the point to interpolate
	 * @return {number} the interpolated value at the indicated position
	 * @public
	 */
	interpolate(x, y) {
		// project the point on the segment
		const p = Geom.pointToSegmentIntersection(x, y, this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y);

		// calculate the 3 distances
		const D = Geom.segmentLength(this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y);
		const dA = Geom.segmentLength(p.x, p.y, this.points[0].x, this.points[0].y);
		const dB = Geom.segmentLength(p.x, p.y, this.points[1].x, this.points[1].y);

		const A	= this.points[0].height;
		const B = this.points[1].height;

		// check if the projection falls inside the segment, or to the right / left of it
		if (dA <= D && dB <= D) {
			// case 1: the projection is inside the segment
			return (dB * A + dA * B) / D;
		}	else
		if (dB > D) {
			// case 2: the projection is to the left of A
			return (dB * A - dA * B) / D;
		}	else {
			// case 3: the projection is to the right of B
			return (dA * B - dB *A) / D;
		}
	}

	/**
	 * Containment detection; what value should we return by default ?
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordinate of the point
	 * @returns {boolean} true if the point is a part of this polygon.
	 */
	contains(x, y){
		return false;
	}
}