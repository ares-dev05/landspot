/**
 * This is a segment set that's also a closed, simple polygon (i.e. no two segments intersect)
 * Here we define all the polygon-related functions/properties
 */

import SegmentSet from './SegmentSet';
import CurvedSegment from './CurvedSegment';
import Logger from '../utils/Logger';
import Segment from './Segment';
import Point from './Point';
import Geom from '../utils/Geom';
import robustPointInPolygon from 'robust-point-in-polygon';
import Utils from '../utils/Utils';

export default class Polygon extends SegmentSet
{
	/**
	 * @return {number}
	 * @constructor
	 */
	static get CONTAINS_OR_CLOSE_THRESHOLD() { return Math.SQRT2 * Geom.CLOSE; }

    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return 'Polygon'; }
    /**
     * @param type {string}
     * @return {boolean}
     */
    isType(type) { return type === Polygon.CLASS_TYPE || super.isType(type); }


	/**
	 * @param edges {Segment[]}
	 * @param sourceVertices {Point[]}
	 */
	constructor(edges=[], sourceVertices=null) {
		super(edges);

		/**
		 * @type {Point[]}
		 * @protected
		 */
		this._sourceVertices = sourceVertices;

		/**
		 * @type {number[][]}
		 * @private
		 */
		this._vertexList = null;

        /**
         * @type {boolean}
         * @private
         */
        this._convexTestValid = false;

        /**
         * @type {boolean}
         * @private
         */
        this._isConvex = false;
    }

	/**
	 * @return {Point[]}
	 */
	get sourceVertices() { return this._sourceVertices; }

	/**
	 * @param v {Point[]}
	 */
	set sourceVertices(v) { this._sourceVertices=v; }

	/**
	 * @return {number[][]}
	 */
	get vertexList() { return this._vertexList; }

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Calculations / Properties

	/**
	 * calculate the surface
	 *
	 * @param echo {boolean}
	 * @return {number}
	 */
	getArea(echo=false)
	{
		let A, B, index, lineArea, curveArea, curvePieceArea, inwardCurve;

        /**
		 * @type {CurvedSegment}
         */
		let curve;

		lineArea  = 0;
		curveArea = 0;

		// sort the vertices clockwise following the path of the boundaries in the polygon
		this.sortVerticesClockwiseByPolyPath();

		// fetch the already-calculated vertices
		let vertices = this.getVertices();

		// calculate the area using the vertices; assume all edges are straight lines
		for (index=0; index<vertices.length; ++index) {
			A = vertices[index];
			B = vertices[(index+1)%vertices.length];

			// area when not considering curved segments
			lineArea += A.x*B.y - A.y*B.x;
		}

		// calculate the curve area
		for (index=0; index<this.edges.length; ++index) {
			if (this.edges[index].isType(CurvedSegment.CLASS_TYPE)) {
                curve = this.edges[index];

				// determine if this edge curves inwards or outwards
				inwardCurve = this.containsPoint(curve.c1) || this.containsPoint(curve.c2);

				// calculate the curve area; we'll then decide if we add it or substract it from the total line area
				curvePieceArea  = curve.area;

				echo && Logger.log('	edge '+index+' curves '+(inwardCurve?'inwards':'outwards')+' and has an area of '+curvePieceArea+
					'; computational='+curve.computationalArea);

				curveArea	   += ((inwardCurve?-1:1)*Math.abs(curvePieceArea));
			}
		}

		echo && Logger.log('  > Overall='+(Math.abs(lineArea/2)+curveArea)+'; linear area='+(lineArea/2)+'; curved area='+curveArea);

		return Math.abs(lineArea/2) + curveArea;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Containment tests; only available for polygons

    /**
     * @param object {*}
     * @return {Boolean}
     */
	contains( object )
	{
		if (object instanceof Point) {
			return this.containsPoint(object);
		}
		if (object instanceof Segment) {
			return this.containsEdge(object);
		}
		if (object instanceof SegmentSet) {
			return this.containsSegmentSet(object);
		}

        return false;
	}

	/**
	 * O(N) Containment test performed with ray-casting implemented on the Segment class;
	 * @UPGRADE @OPTIMIZE: if we calculate a generic internal Largest Rectangle, compare against that one first.
	 * @UPGRADE @OPTIMIZE: if we divide the topology of the polygon using the methods implemented for the envelopes analysis, we can test for containment
	 * 		in a simpler, quicker way, using barycentric tests for triangles (etc?)
	 * see https://rosettacode.org/wiki/Ray-casting_algorithm for the pseudo-code
	 *
	 * @OPTIMIZED (round 1- general improvemenets)
	 * 	Start:   450ms average on 100k points
	 * 	Step 1:  395ms (removed bounding box test)
	 *  Step 2:  355ms (for each -> for (i...))
	 *  Step 3: <330ms (optimized testRayCast)
     *
     * @param p (Point)
     * @return {boolean}
	 */
	containsPoint(p) {
		/**
		 * @INFO: we first test to see if the point is contained in the poly's bounding box; otherwise, it's definitely outside
		 * @OPTIMIZED: we actually see a 10% increase if we don't do the bounding box test on polys with no curves
		 * if ( !externalBoundingBox.containsPoint(p) )
		 * 	   return false;
		 */

		// count the number of times that a ray cast from P to the right intersects the polygon's edges
        let hits = 0, i;
		for (i=0; i<this._edges.length; ++i) {
			if ( this._edges[i].testRayCast(p) )
				hits++;
		}

		// the point is contained if the number of collisions is odd
		return !!(hits & 1);
	}

	/**
	 * @param p {Point}
	 */
	containsPointRobust(p) {
		return this.containsPointCoordsRobust(p.x, p.y);
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @return {boolean}
	 */
	containsPointCoordsRobust(x, y) {
		if (!this.hasValidVertices) {
			this._vertexList = null;
		}
		if (!this._vertexList) {
			if (this._sourceVertices) {
				this._vertexList = this._sourceVertices.map(point => [point.x, point.y]);
			} else {
				this._vertexList = Geom.sortPoints(this.getVertices().concat()).map(point => [point.x, point.y]);
			}
		}

		/**
		 -1 if point is contained inside loop
		 0 if point is on the boundary of loop
		 1 if point is outside loop
		 */
		return robustPointInPolygon(this._vertexList, [x, y]) <= 0;
	}

	/**
	 * O(N) Checks if a point is inside or 'close' to this polygon
	 *
	 * @param point {Point}
	 * @return {boolean}
	 */
	containsOrClose(point)
	{
		// first test for containment
		if (this.containsPointRobust(point)) {
			return true;
		}

		// otherwise, try to see if the minimum distance between this point and any edge in the lot
		// is less than the threshold we use for CLOSE objects in our geometry
		return this.distanceFrom(point) <= Polygon.CONTAINS_OR_CLOSE_THRESHOLD;
	}

	/**
	 * @param point {Point}
	 * @return {number}
	 */
	distanceFrom(point) {
		return this.distanceFromCoords(point.x, point.y);
	}

	/**
	 * @param x
	 * @param y
	 * @return {number}
	 */
	distanceFromCoords(x, y) {
		return Math.min(...this.edges.map(
			edge => Geom.pointToSegmentDistance(x, y, edge.a.x, edge.a.y, edge.b.x, edge.b.y)
		));
	}

	/**
	 * Edge Containment test
	 * @OPTIMIZE: test against
	 * @UPGRADE @CURVES
     *
     * @param edge {Segment}
     * @return {boolean}
	 */
	containsEdge(edge)
	{
		// necessary conditions: both vertices of the edge need to be contained
		if ( !this.containsPoint( edge.a ) || !this.containsPoint( edge.b ) )
			return false;

		// at this point, both segment vertices are contained. If this is a convex poly and the segment is a straight line, the entire segment is contained
		if ( this.isConvex && edge.isType(CurvedSegment.CLASS_TYPE)===false )
			return true;

		// otherwise, we have to intersect this with all the and make sure they don't intersect
		for (let i=0; i<this.edges; ++i) {
            // halt on the first segment intersection
            if (this.edges[i].intersects(edge))
				return false;
		}

		return true;
	}

	/**
	 * test if a segment set (can also be a polygon) is contained in this one
	 *
	 * @param segmentSet {SegmentSet}
	 * @return {boolean}
	 */
	containsSegmentSet(segmentSet)
	{
		/**
		 * 1. if the other polygon's bounding box doesn't fit in the current one's, the poly itself won't fit either
		 */
		if ( !this.externalBoundingBox.containsRect( segmentSet.externalBoundingBox ) )
			return false;

		/**
		 * 2. If any of the vertices are outside, it's a negative result
		 *
		 * @INFO @OPTIMIZE
		 * ------------------------------------------------------ Why we don't optimize here ------------------------------------------------------
		 * 		Normally, we should only test the vertices for convex polygons, because for concave ones, we're going to run two tests:
		 * one for the vertices AND one for the edges, which increases the execution time. However, considering that we're looking for negative results
		 * here, we run the cheapest (i.e. vertex intersection) test first.
		 * 		We know that, when this function returns true, we have found a situation where a house fits inside a lot, which will result in a
		 * successful analysis, stopping any further fit tests. What this means is that this function will disproportionately return negative results,
		 * and so we optimize with that in mind. Basically, we assume that the polygon doesn't fit and we try to find the first case that will prove that
		 */
		for (let i=0, setVertices=segmentSet.getVertices(); i<setVertices.length; ++i) {
			if ( !this.containsPoint(setVertices[i]) )
				return false;
		}

		// if this polygon is convex, and all of the segment set's vertices are contained within it, the whole set is contained too
		if ( this.isConvex )
			return true;

		// intersect all sides against each other
        for (let i=0; i<this.edges.length; ++i) {
            for (let j = 0; j < segmentSet.edges.length; ++j) {
                if (this.edges[i].intersects(segmentSet.edges[j]))
                    return false;
            }
        }

		// successful test
		return true;
	}

	/**
	 * @return {boolean}
	 */
	testCWSorting() {
		if (this._isCWSorted) {
			return true;
		}

		// use the centroid i.e. center of area of this polygon
		const mid = this.centroid;

		let cwCount = 0, ccwCount = 0;

		for (let i=0, prevAngle, currAngle; i<=this._edges.length; ++i) {
			currAngle = Geom.norm(
				Geom.angleBetweenPoints(mid, this._edges[i%this._edges.length].a)
			);

			if ( i > 0 ) {
				if ( Geom.norm( currAngle - prevAngle ) > Math.PI )
					++ccwCount;
				else
					++cwCount;
			}

			prevAngle = currAngle;
		}

		return cwCount > ccwCount;
	}

	/**
	 * @param polygon {Polygon}
	 * @param logging {boolean}
	 *
	 * @return {Polygon[]}
	 *
	 * Weiler–Atherton concave intersection implementation
	 */
	intersect(polygon, logging=false) {
		const start = Utils.now();

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// 0. List out the vertices for both polygons, sorted in the same order (CW or CCW)

		logging && console.log('[intersect][start] inner.CW=', this.testCWSorting(), 'outer.CW=', polygon.testCWSorting());

		if (!polygon.sourceVertices) {
			polygon = Polygon.from(Geom.sortPoints(polygon.getVertices(), polygon.centroid));
		}
		// both polygons need to be sorted in the same direction
		if (this.testCWSorting() !== polygon.testCWSorting()) {
			polygon = Polygon.from(polygon.sourceVertices.concat().reverse());
		}

		const inner = this.sourceVertices.concat();
		const outer = polygon.sourceVertices.concat();

		const enterPoints = [];
		const exitPoints = [];

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// 1. Determine all the intersection points between the two polygons

		logging && console.log('[intersect][after] inner.CW=', this.testCWSorting(), 'outer.CW=', polygon.testCWSorting());

		logging && console.log('[intersect] inner=', inner.map(p=>p.toString()));
		logging && console.log('[intersect] outer=', outer.map(p=>p.toString()));

		const innerIntersections = [];
		const outerIntersections = [];

		for (let i=0; i<inner.length; ++i) {
			innerIntersections[i] = [];
			const innerA = inner[i], innerB = inner[(i+1)%inner.length];

			for (let j=0; j<outer.length; ++j) {
				if (!i) outerIntersections[j] = [];
				const outerA = outer[j], outerB = outer[(j+1)%outer.length];

				// See if there is an intersection between the polygons
				const intersection = Geom.segmentIntersectionPoints(innerA, innerB, outerA, outerB);

				if (intersection) {
					// add the intersection to a list so that we can insert it back into the point lists later
					innerIntersections[i].push({
						point: intersection,
						k: Geom.getPointPosition(innerA, innerB, intersection)
					});
					outerIntersections[j].push({
						point: intersection,
						k: Geom.getPointPosition(outerA, outerB, intersection)
					});

					const ray = new Segment(innerA, intersection);
					ray.normalize(ray.length + Geom.CLOSE);
					polygon.containsPointRobust(ray.b) ? enterPoints.push(intersection) : exitPoints.push(intersection);
				}
			}
		}

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// 2. Add all the intersections to the point lists
		const sortk = (a, b) => a.k - b.k;

		[{intersections: innerIntersections, points: inner}, {intersections: outerIntersections, points: outer}].forEach(
			set => {
				for (let i = set.intersections.length - 1, list; i >= 0; --i) {
					if ((list = set.intersections[i]).length > 0) {
						set.points.splice(i + 1, 0, ...list.sort(sortk).map(p => p.point));
					}
				}
			}
		);

		const logp = point => (enterPoints.indexOf(point)>=0?'[S]':'') +
                              (exitPoints .indexOf(point)>=0?'[E]':'') + point.toString();

		logging && console.log('[intersect] inner[X]=', inner.map(logp));
		logging && console.log('[intersect] outer[X]=', outer.map(logp));

		//
		logging && console.log('[intersect] enter=', enterPoints.map(p=>p.toString()), 'exit=', exitPoints.map(p=>p.toString()));

		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// 3. Create the intersection areas (if any)

		// if there are no enter points -> no intersection
		if (enterPoints.length === 0) {
			// either the inner polygon is fully contained in the outer one, or it is fully outside of it
			if (polygon.containsPointRobust(inner[0])) {
				// fully inside -> return the original polygon
				return [Polygon.from(inner)];
			}	else {
				// fully outside -> return null
				return [];
			}
		}	else {
			const result = [];

			while (enterPoints.length) {
				// select the starting point that we enter through
				const start = enterPoints.pop();
				// build a new clipped polygon
				const polyPoints = [];

				// select the current list and index in it
				let point=start, list=inner, index=inner.indexOf(start), searchIndex;

				logging && console.log('[intersect] starting new poly loop ', result.length);

				// loop through the two polygons until we get back to the start point
				do {
					// add the current point
					polyPoints.push(point);

					logging && console.log('[intersect] adding point ', point.toString());

					// pick the next point in the list
					index = (index+1) % list.length;
					point = list[index];

					if (point === start) {
						logging && console.log('	[intersect] got back to start.');
						break;
					}

					// if this is an exit point, switch to the outer list
					if ((searchIndex = exitPoints.indexOf(point)) >= 0) {
						// remove the point from the exit list
						exitPoints.splice(searchIndex, 1);
						// we are now outside of the clipped polygon
						list  = outer;
						index = outer.indexOf(point);
						logging && console.log('	[intersect] switching to outer list');
					}	else
					if ((searchIndex = enterPoints.indexOf(point)) >= 0) {
						// remove the point from the enter list
						enterPoints.splice(searchIndex, 1);
						// we are now inside of the clipped polygon
						list  = inner;
						index = inner.indexOf(point);
						logging && console.log('	[intersect] switching to inner list');
					}

				}	while (point !== start);

				// push the new polygon to the list of results
				result.push(Polygon.from(polyPoints));
			}

			logging && console.log('[intersect] completed algorithm in ', (Utils.now()-start)+'ms');
			return result;
		}
	}

	/**
	 * @param polygon {Polygon}
	 *
	 * Clip the current polygon so that all of its resulting points will be contained within the given polygon
	 *
	 * @requires both polygons should be convex and have their vertices ordered in a CW or CCW order
	 *
	 * @see This is loosely based on the the Sutherland-Hodgam algorithm:
	 * https://en.wikipedia.org/wiki/Sutherland%E2%80%93Hodgman_algorithm
	 *
	 * @return {Polygon}
	 */
	clipConvex(polygon) {
		if (polygon.sourceVertices) {
			console.log('clipping [' + (this.testCWSorting() ? 'cw' : 'ccw') + '][' + this.sourceVertices.map(v => v.toString()) +
				'] with [' + (polygon.testCWSorting() ? 'cw' : 'ccw') + '][' + polygon.sourceVertices.map(v => v.toString()) + ']');
		}

		let vertices = this.sourceVertices ? this.sourceVertices : Geom.sortPoints(this.getVertices(), this.centroid);
		
		const isCW = polygon.testCWSorting() === this.testCWSorting();
		const isContained  = (edge, point)  => isCW ? Geom.isLeft(edge.a, edge.b, point) : Geom.isRight(edge.a, edge.b, point);

		for (let edgeIndex=0; edgeIndex<polygon.edges.length; ++edgeIndex) {
			const edge = polygon.edges[edgeIndex];

			// the new list of clipped vertices
			const clipped = [];
			const hasVertex = (v) => clipped.find(p => Geom.pointsEqual(p, v)) !== undefined;

			// Walk the vertices in their given order and see when we detect an intersection
			for (let index = 0; index < vertices.length; ++index) {
				const A = vertices[index];
				const B = vertices[(index + 1) % vertices.length];
				let C;

				// first check if A is inside the polygon
				if (isContained(edge, A)) {
					!hasVertex(A) && clipped.push(A);
				}

				// next check if we have an intersection
				C = Geom.segmentIntersectionPoints(A, B, edge.a, edge.b);

				if (C !== null) {
					!hasVertex(C) && clipped.push(C);
				}
			}

			if (vertices.length && !clipped.length) {
				console.log(' > clipping > error at this point. deleted entire polygon with ', edge.toString(),' start=', vertices.concat());
			}

			// Update the list of working vertices
			vertices = clipped;
		}

		return vertices.length >= 3 ? Polygon.from(vertices) : null;
	}

	/**
	 * Performs a union merge with another polygon. Polygons should have their edges sorted in a CW or CCW order.
	 *
	 * @param target {Polygon}
	 */
	union(target) {
		// list of all the intersections between the source and target polygons
		const intersections = [];
		// create the rebuilt perimeter, including the driveway in it
		const rebuiltPerimeter = [];

		// Search for the target entry into the current perimeter
		for (let index = 0; index < this.edges.length; index++) {
			const sourceEdge = this.edges[index];

			// Find the closest target edge that intersects the current source edge
			let entryEdge=null, entryPoint=null, closest=Infinity;

			// Check to see if the target polygons intersects the current edge
			target.edges.forEach(targetEdge => {
				let intersection = targetEdge.getIntersection(sourceEdge);

				if (intersection) {
					// add the new intersection
					intersections.push(intersection);

					// make sure the intersection isn't on one of the target ends. If it is, skip it for now.
					if (intersection.equals(targetEdge.a) || intersection.equals(targetEdge.b)) {
						intersection = null;
					}   else {
						const distance = Geom.pointDistance(sourceEdge.a, intersection);

						if (!entryEdge || distance < closest) {
							entryEdge = targetEdge;
							entryPoint = intersection;
							closest = distance;
						}
					}
				}
			});

			// If an intersection is detected, we mark that point as the entry
			if (entryEdge && entryPoint) {
				// we have found the entry point. Add the source edge up to the current point
				rebuiltPerimeter.push(
					// clipped platform edge
					sourceEdge.clone().setB(entryPoint),
					// clipped driveway edge
					entryEdge.clone().setA(entryPoint),
				);

				// continue adding the driveway edges until we re-enter the building platform
				for (let targetIndex=(target.edges.indexOf(entryEdge)+1) % target.edges.length, loop=1;
					loop<target.edges.length;
					targetIndex = (targetIndex+1) % target.edges.length, ++loop) {

					// pick the current driveway edge
					const targetEdge = target.edges[targetIndex];
					let intersection = this.intersectEdge(targetEdge);

					if (intersection && intersection.point) {
						intersections.push(intersection);
					}

					if (intersection && (intersection.point.equals(targetEdge.a) || intersection.point.equals(targetEdge.b)) ) {
						intersection = null;
					}

					if (intersection === null) {
						rebuiltPerimeter.push(targetEdge);
					}   else {
						const {edge: platformEntryEdge, index: platformEntryIndex, point: platformEntryPoint} = intersection;

						// Add the target edge up to the re-entry point and all remaining platform edges
						rebuiltPerimeter.push(
							// clipped driveway edge
							targetEdge.clone().setB(platformEntryPoint),
							// clipped platform edge
							platformEntryEdge.clone().setA(platformEntryPoint),
							// remaining edges in the building platform
							...this.edges.slice(platformEntryIndex+1)
						);

						return {
							intersections: intersections,
							polygon: new Polygon(rebuiltPerimeter, rebuiltPerimeter.map(edge => edge.a))
						};
					}
				}
				break;
			}   else {
				rebuiltPerimeter.push(sourceEdge);
			}
		}

		// If no union is performed, we return the original polygon
		return {
			intersections: intersections,
			polygon: new Polygon(rebuiltPerimeter, rebuiltPerimeter.map(edge => edge.a))
		};
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Polygon Properties

    /**
     * by calling this, we:
     * 	1. generate the vertices of the polygon
     *  2. sort the vertices & edges in clockwise order
     *  3. determine if the polygon is convex
     *  4. calculate the convex hull of the polygon
     */
    calculateProperties()
	{
		return {
			c: this.isConvex,
			h: this.convexHull
		};
	}

	/**
	 * We can't sort the vertices correctly in concave polygons.
	 * However, we can't know if a polygon is convex or concave without sorting its vertices. That's why we assume that ALL polygons are concave
	 * 	and do an edge traversation to determine the vertex angles
	 */
	sortVerticesClockwiseByPolyPath()
	{
		// refresh the vertex list and mark it as valid; @OPTIMIZE: mark it as sorted so we don't sort it again
		this._vertices		= [];
        this._verticesValid	= true;

		let edgeStack = this.edges.concat(), lastEdge, indx, A, B, edge, closest, distance, closeDistance;

		// fetch one edge from the stack; it will dictate the direction
		lastEdge = edgeStack.pop();

		// push the points of the current edge in the stack
		this._vertices.push(lastEdge.a.clone());
        this._vertices.push(lastEdge.b.clone());

		// this is the end of the loop, and where we're starting the next edge from
		A	= lastEdge.b;

		while (edgeStack.length) {
			// find the closest segment to the end of the current segment
			closeDistance	= Infinity;
			closest			= null;

			for (indx=0; indx<edgeStack.length; ++indx) {
				edge		= edgeStack[indx];

				// verify each segment end one by one so that we know its orientation
				distance	= Geom.pointDistance(A, edge.a);
				if (distance<closeDistance) {
					closeDistance	= distance;
					closest			= edge;
					B				= edge.b;
				}

				distance	= Geom.pointDistance(A, edge.b);
				if (distance<closeDistance) {
					closeDistance	= distance;
					closest			= edge;
					B				= edge.a;
				}
			}

			// we remove this segment from the list
			edgeStack.splice(edgeStack.indexOf(closest), 1);

			if ( !Geom.pointsClose(A, B) ) {
				// we only add the new point to the list if
				this._vertices.push(B);
			}

			// set the next search point as the end of this segment
			A = B;
		}

		// if the first and the last points are identical - we remove the last one
		if (this._vertices.length>1 && Geom.pointsClose(this._vertices[0], this._vertices[this._vertices.length-1])) {
            this._vertices.pop();
		}
	}

	/**
	 * @return {boolean} true if this lot is convex, false otherwise
	 */
	get isConvex()
	{
		if ( this._convexTestValid ) {
			return this._isConvex;
		}

		// sort the edges and vertices so that we can perform the test
		this.sortClockwise();

		if ( this.getVertices().length===3 ) {
			// triangles are always convex (unless the 3 points are collinear, but we don't check for that case)
			this._isConvex = true;
		}	else {
			// go over the vertices of the polygon, and see if any of the edges turns to the right
			let angles = [Geom.angleBetweenPoints(this._vertices[0], this._vertices[1])], index;

			// assume that the polygon is convex by default and stop on the first left turn
			this._isConvex = true;
			for (index=0; this._isConvex && index<this._vertices.length && this._isConvex; ++index) {
				// calculate the angle of the next edge
				angles[index+1] = Geom.angleBetweenPoints(
                    this._vertices[(index+1)%this._vertices.length],
                    this._vertices[(index+2)%this._vertices.length]
				);

				// determine the angle difference between the next edge and the current one (normalized to between 0 and 360 degrees
				let delta = Geom.norm(angles[index+1]-angles[index]);
				if ( delta > Math.PI ) {
					this._isConvex = false;
					Logger.log('Detected a left turn in the polygon -> it is concave: '+delta);
				}
			}
		}

        this._convexTestValid = true;
		return this._isConvex;
	}

	/**
	 * calculate this polygon's convex hull
     *
     * @return {Polygon}
	 */
	get convexHull()
	{
		// if the hull is already calculated, return it.
		if ( this.hasValidHull ) {
			return this._hull;
		}

		if ( this.isConvex ) {
			// convex hull of a convex poly is itself, so no need for calculations
			return this;
		}	else {
			return super.convexHull;
		}
	}

	/**
	 * Attach normals to all of the edges of this polygon
	 */
	calculateNormals() {
		this.edges.forEach(edge => {
			// We calculate the normal to have a length of 1, starting from the center of the edge
			const C = edge.center, A = edge.a.x < edge.b.x ? edge.a : edge.b, LEN = edge.length / 2;
			const N = new Point(
				// C.x - cos(alpha) * 1, where cos(alpha) = Dy(A->C) / dist(A, C)
				C.x - (C.y-A.y) / LEN,
				// C.y + sin(alpha) * 1, where sin(alpha) = Dx(A->C) / dist(A, C)
				C.y + (C.x-A.x) / LEN
			);

			// see of the end of the normal is inside or outside the polygon
			if (this.containsPoint(N)) {
				// Test point (N) is going inwards
				edge.inNormal  = new Segment(C.clone(), N.clone());
				edge.outNormal = new Segment(N.clone(), C.clone()).startFromPoint(C);
			}	else {
				// Test point (N) is going outwards
				edge.outNormal = new Segment(C.clone(), N.clone());
				edge.inNormal  = new Segment(N.clone(), C.clone()).startFromPoint(C);
			}
		});

		return this;
	}

	/**
	 * try to maximize an internal bounding box; (suggestion: do this when knowing one parameter)
	 * https://d3plus.org/blog/behind-the-scenes/2014/07/08/largest-rect/
	 * https://stackoverflow.com/questions/28717241/largest-inscribed-rectangle-in-arbitrary-polygon
	 *
	 * Calculate the Largest area, axis-aligned Rectangle here; we can then use it for all houses.
	 * This should be done lazily, so only when a house/lot orientation test is performed, and not before; The reason for this is that we may
	 * never get to need the internal bounding box for all the lot orientations; plus, like this the calculation is spread out over multiple houses -
	 * each house may reach a certain lot orientation, but not further. Algorithm: https://www.sciencedirect.com/science/article/pii/0925772195000410
	 *
	 * For convex polygons, see: https://www.sciencedirect.com/science/article/pii/S1570866712000160
     *
     * @return {Rectangle}
	get internalBoundingBox() { return null; }
     */

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Data-level Operations

	/**
	 * @return {Polygon} a deep-clone of this polygon.
	 */
	clone()
	{
		// create a new Polygon, copy all our data into it and then return it
		let newPoly = new Polygon();
		newPoly.copy( this );
		return newPoly;
	}

	/**
	 * deep-copy the given Polygon into this one
     * @param source {Polygon}
	 */
	copy(source)
	{
		super.copy(source);

		if ( source.isType(Polygon.CLASS_TYPE) ) {
			// copy the convex test details
			this._convexTestValid = source._convexTestValid;
            this._isConvex		  = source._isConvex;
		}
	}

	/**
	 * Create a convex hull polygon from the given set of clockwise ordered vertices. Also validate all properties that we do not need to recalculate
	 * @param vertices {Array.<Point>}
	 * @param boundingBox {Rectangle}
	 * @return {Polygon}
	 */
	static makeConvexHull(vertices, boundingBox=null)
	{
		let hull = new Polygon();

		// create the edges of the polygon
		for (let indx=0; indx<vertices.length; ++indx) {
			hull.edges.push( new Segment(
				vertices[indx],
				vertices[(indx+1)%vertices.length]
			) );
		}

		// we already have the vertices, no need to recalculate them
		hull._vertices			= vertices;
		hull._verticesValid		= true;

		// the hull is convex by definition
		hull._convexTestValid	= true;
		hull._isConvex			= true;

		// the points and vertices of the hull are already sorted in a CW order
		hull._isCWSorted		= true;
		hull.sourceVertices		= vertices;

		if ( boundingBox ) {
			// the hull has the same bounding box as the segment set
			hull._bboxValid		= true;
			hull._bbox			= boundingBox;
		}

		return hull;
	}

	/**
	 * Creates a new polygon from a list of CW or CCW sorted points
	 * @param points {Point[]}
	 */
	static from(points) {
		const polygon = new Polygon([], points);

		for (let index=0; index<points.length-1; ++index) {
			polygon.edges.push(new Segment(points[index], points[index+1]));
		}

		// close the polygon
		if (!Geom.pointsEqual(points[points.length-1], points[0])) {
			polygon.edges.push(new Segment(points[points.length - 1], points[0]));
		}

		// also set the calculated vertices
		polygon._verticesValid = true;
		polygon._vertices = points;

		return polygon;
	}
}
