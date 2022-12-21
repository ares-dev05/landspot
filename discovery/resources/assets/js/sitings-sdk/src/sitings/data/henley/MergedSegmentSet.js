import Geom from '../../../utils/Geom';
import Segment from '../../../geom/Segment';
import Point from '../../../geom/Point';

export default class MergedSegmentSet {

	static get INTERSECT_NO()		{ return 0; }
	static get INTERSECT_PARTIAL()	{ return 1; }
	static get INTERSECT_FULL()		{ return 2; }

	/**
	 * @param storey {number}
	 */
	constructor(storey)
	{
		/**
		 * @private
		 * @type {number}
		 */
		this._storey	 = storey;

		/**
		 * @type {XMLHouseStructure[]}
		 * @private
		 */
		this._structures = [];

		/**
		 * @type {number[]}
		 * @private
		 */
		this._intersect	 = [];

		/**
		 * @type {Segment[]}
		 * @private
		 */
		this._segments	 = [];
	}

	/**
	 * @returns {number}
	 */
	get storey() { return this._storey; }

	/**
	 * @returns {Segment[]}
	 */
	get segments() { return this._segments; }

	/**
	 * @param s {XMLHouseStructure} the structure to merge
	 * @param intersect {number} flag that controls how we should check for intersections between this structure
	 *		  and the previous ones, or if its segments can just get added to the structure. One of the INTERSECT_ constants
	 */
	push(s, intersect=2)
	{
		this._structures.push(s);
		this._intersect.push(intersect);
	}

	/**
	 * Merges all the structures contained in this set into a single list of segments.
	 */
	execute()
	{
		this._segments = [];

		for (let index=0; index<this._structures.length; ++index) {
			const newSet = this.iterateSegments(this._structures[index].structure);

			if (!index || this._intersect[index] === MergedSegmentSet.INTERSECT_NO) {
				this._segments = this._segments.concat(newSet);
			}	else {
				// intersect previous segments with new ones
				this._segments = this.intersect(this._segments, newSet, this._intersect[index]);
			}
		}
	}

	/**
	 * Creates a continuous list of segments from the given coordinates.
	 *
	 * @param points {Point[]}
	 * @param closeLoop {boolean}
	 * @returns {[]}
	 * @private
	 */
	iterateSegments(points, closeLoop=true)
	{
		const results = [];
		for (let i=0, a, b; i<points.length-(closeLoop?0:1); ++i) {
			a = points[i];
			b = points[(i+1)%points.length];
			results.push(new Segment(a.clone(), b.clone()));
		}
		return results;
	}

	/**
	 * Intersects two segment sets into a single one, individually merging each segment from set A with each segment from set B
	 *
	 * @param a {Segment[]}
	 * @param b {Segment[]}
	 * @param mode {number}
	 * @returns {Segment[]}
	 */
	intersect(a, b, mode)
	{
		const result=[], exclude=[];

		for (let i=0, j, m, n; i<a.length; ++i) {
			m = a[i];

			for (j=b.length-1; j>=0 && m; --j) {
				n = b[j];

				const output = this.segmentMerge(m.clone(), n.clone());

				// the first segment in the intersection only gets removed with full intersections
				if (mode===MergedSegmentSet.INTERSECT_FULL) {
					if (output.m) {
						m.a = output.m.a;
						m.b = output.m.b;
					}	else {
						// M gets deleted
						m = null;
					}
				}

				if (output.n) {
					n.a = output.n.a;
					n.b = output.n.b;
				}	else {
					// N gets deleted
					b.splice(j, 1);
				}

				if (output.x) {
					exclude.push(output.x);
				}
			}

			if (m) {
				result.push(m);
			}
		}

		return result.concat(b);
		/*
		a = result.concat(b);
		b = exclude;

		result = new Vector.<Segment>;

		// run one more intersection round with the exclusions;
		// QUESTION: could we run just this round and not the previous one?
		for (i=0; i<a.length; ++i) {
			for (j=0; j<b.length; ++j) {
				output = segmentMerge(a[i], b[j]);
				if (output.m) {
					result.push(output.m);
				}
			}
		}

		return result;
		*/
	}

	/**
	 * @param m {Segment}
	 * @param n {Segment}
	 * @returns {{x: Segment, m: Segment, n: Segment}}
	 * @private
	 */
	segmentMerge(m, n)
	{
		let exclusion;
		if (m.isHorizontal && n.isHorizontal && Geom.equal(m.a.y, n.a.y)) {
			// try to merge the two segments;
			m.sortHoriz();
			n.sortHoriz();

			// check to see if the segments are equal
			if (Geom.equalPoint(m.a, n.a) && Geom.equalPoint(m.b, n.b)) {
				exclusion = m;
				m = null;
				n = null;
			}	else {
				// verify when the segments overlap
				if ((m.a.x <= n.a.x && n.a.x <= m.b.x) ||
					(n.a.x <= m.a.x && m.a.x <= n.b.x) ){
					// calculate the new points for the two vertices
					let ma = Math.min(m.a.x, n.a.x),
						mb = Math.max(m.a.x, n.a.x),
						na = Math.min(m.b.x, n.b.x),
						nb = Math.max(m.b.x, n.b.x);

					if (m.a.x <= n.a.x) {
						m.a.x = ma; m.b.x = mb;
						n.a.x = na; n.b.x = nb;
					}	else {
						m.a.x = na; m.b.x = nb;
						n.a.x = ma; n.b.x = mb;
					}
					exclusion = new Segment(new Point(mb,m.a.y), new Point(na,m.a.y));

					// removal conditions
					if (Geom.equal(m.a.x, m.b.x)) { m = null; }
					if (Geom.equal(n.a.x, n.b.x)) { n = null; }
				}
			}
		}	else
		if ( m.isVertical && n.isVertical && Geom.equal(m.a.x, n.a.x) ) {
			// try to merge the two segments;
			m.sortVert();
			n.sortVert();

			// check to see if the segments are equal
			if (Geom.equalPoint(m.a, n.a) && Geom.equalPoint(m.b, n.b)) {
				exclusion = m;
				m = null;
				n = null;
			}	else {
				// verify when the segments overlap
				if ((m.a.y <= n.a.y && n.a.y <= m.b.y) ||
					(n.a.y <= m.a.y && m.a.y <= n.b.y) ){
					// calculate the new points for the two vertices
					let ma = Math.min(m.a.y, n.a.y),
						mb = Math.max(m.a.y, n.a.y),
						na = Math.min(m.b.y, n.b.y),
						nb = Math.max(m.b.y, n.b.y);

					if (m.a.y <= n.a.y) {
						m.a.y = ma; m.b.y = mb;
						n.a.y = na; n.b.y = nb;
					}	else {
						m.a.y = na; m.b.y = nb;
						n.a.y = ma; n.b.y = mb;
					}

					exclusion = new Segment(new Point(m.a.x,mb), new Point(m.a.x,na));

					// removal conditions
					if (Geom.equal(m.a.y, m.b.y)) { m = null; }
					if (Geom.equal(n.a.y, n.b.y)) { n = null; }
				}
			}
		}

		return {
			m: m,
			n: n,
			x: exclusion
		};
	}
}