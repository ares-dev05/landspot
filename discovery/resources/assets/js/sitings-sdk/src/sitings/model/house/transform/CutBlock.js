/**
 * CutBlock
 * a cut block is the set of CutSegments resulting from an extension
 * or reduction of the house plan
 */
import TransformationModel from "./TransformationModel";
import Geom from "../../../../utils/Geom";

export default class CutBlock {


	/**
	 * @param segments {TransformationCutModel[]}
	 * @param transform {TransformationModel}
	 */
	constructor(segments, transform)
	{
		/**
		 * @type {TransformationCutModel[]}
		 * @private
		 */
		this._segments	= segments;

		/**
		 * @type {TransformationModel}
		 * @private
		 */
		this._transform	= transform;
	}

	/**
	 * @param segments {TransformationCutModel[]}
	 */
	concat(segments) {
		if (!this._segments) {
			this._segments = [];
		}
		if (segments) {
			this._segments = this._segments.concat(segments);
		}
	}

	/**
	 * @returns {TransformationCutModel[]}
	 */
	get segments() { return this._segments; }

	/**
	 * @returns {number}
	 */
	get coveredArea()
	{
		// can't calculate surface for <2 segments
		if (!this._segments || this._segments.length<2) {
			return 0;
		}

		// This is a set of parallel segments. Order the segments by the start (A) point
		this._segments.sort(CutBlock.segmentSortFunc);

		// return the area between the first and last segment
		let first = this._segments[0],
			last  = this._segments[this._segments.length-1],
			sign  = this._transform.type===TransformationModel.REDUCTION ? -1 : 1;

		return sign * Math.abs((first.a.x-last.b.x) * (first.a.y-last.b.y));
	}

	/**
	 * Returns true if the comparing blocks don't overlap
	 * @param from {CutBlock}
	 * @returns {boolean}
	 */
	isDifferent(from) {
		// can't calculate surface for <2 segments
		if (!this._segments || this._segments.length<2) {
			return true;
		}

		this._segments.sort(CutBlock.segmentSortFunc);
		from._segments.sort(CutBlock.segmentSortFunc);

		const A = this._segments[0], B = this._segments[this._segments.length-1],
			// eslint-disable-next-line no-mixed-spaces-and-tabs
			  C = from._segments[0], D = from._segments[from._segments.length-1];

		if (A.isVertical && B.isVertical && C.isVertical && D.isVertical) {
			return !(Geom.close(A.a.x, C.a.x) && Geom.close(B.a.x, D.a.x));
		}

		if (A.isHorizontal && B.isHorizontal && C.isHorizontal && D.isHorizontal) {
			return !(Geom.close(A.a.y, C.a.y) && Geom.close(B.a.y, D.a.y));
		}

		return true;
	}

	/**
	 * @param a {TransformationCutModel}
	 * @param b {TransformationCutModel}
	 * @return {number}
	 */
	static segmentSortFunc(a, b)
	{
		// Check if both segments are horizontal
		if (Geom.equal(a.a.x, b.a.x)) {
			if (Geom.equal(a.a.y, b.a.y))
				return 0;

			if (a.a.y < b.a.y)
				return -1;

			return 1;
		}

		// Both segments are vertical
		if ( a.a.x < b.a.x )
			return -1;

		return 1;
	}
}