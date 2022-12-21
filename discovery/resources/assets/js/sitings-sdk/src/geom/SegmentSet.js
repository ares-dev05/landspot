/**
 * A collection of segments (including curves), that's not necessarily a polygon (e.g. the inner structure of a house plan)
 * Here we define all the functions/properties that are related to the segment/vertex set, and don't require the set to be a polygon
 *
 * @IMPORTANT: throughout the execution of the algorithm, we assume that
 */
import Point from './Point';
import Geom from '../utils/Geom';
import Rectangle from './Rectangle';
import Segment from './Segment';
import Polygon from './Polygon';

export default class SegmentSet
{
    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return 'SegmentSet'; }
    /**
     * @param type {string}
     * @return {boolean}
     */
    isType(type) { return type === SegmentSet.CLASS_TYPE; }


	/**
	 * @param edges {Segment[]}
	 */
	constructor(edges=[])
	{
        /**
         * @type {Array.<Segment>}
         * @protected
         */
		this._edges = edges;

        /**
		 * the calculated unique vertices of the segment set
         * @type {Array.<Point>}
         * @protected
         */
        this._vertices = null;

        /**
         * @type {boolean}
         * @protected
         */
        this._verticesValid=false;

        /**
		 * the convex hull for the entire segment/vertex set
         * @type {Polygon}
         * @protected
         */
        this._hull = null;

        /**
         * @type {boolean}
         * @protected
         */
        this._hullValid = false;

        /**
		 * this polygon's cartesian-oriented bounding box
         * @type {Rectangle}
         * @protected
         */
        this._bbox = null;

        /**
         * @type {boolean}
         * @protected
         */
        this._bboxValid=false;

        /**
		 * set to true once the edges of the set get sorted in a ClockWise order
         * @type {boolean}
         * @protected
         */
        this._isCWSorted = false;
	}
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Calculations / Properties
	
	calculateProperties()
	{
		/**
		 * by calling this, we:
		 * 	1. generate the vertices of the polygon
		 *  2. sort the vertices & edges in clockwise order
		 *  3. generate the convex hull
		 */
		this.sortClockwise();
        return this.convexHull;
	}
	
	/**
	 * @return {Array.<Segment>} the edges (lines or curves) that define this segment set
	 */
	get edges() { return this._edges; }
	
	/**
	 * @return {Point} with lowest X and Y coordinates in the segment set
	 */
	get origin()
	{
		return this.calculateOrigin();
	}

    /**
     * @param invertedYAxis {boolean} ==false > searches for lowest Y coordinate; ==true > searches for highest Y coordinate
     * @return {Point}
     */
	calculateOrigin(invertedYAxis=false)
	{
		let o = new Point(Infinity, Infinity), i, edge;
		
		if ( invertedYAxis ) {
			o.y = -Infinity;
			for (i=0; i<this.edges.length; ++i) {
				edge = this.edges[i];
				o.x = Math.min( o.x, edge.a.x, edge.b.x );
				o.y = Math.max( o.y, edge.a.y, edge.b.y );
			}
		}	else {
			for (i=0; i<this.edges.length; ++i) {
				edge = this.edges[i];
				o.x = Math.min( o.x, edge.a.x, edge.b.x );
				o.y = Math.min( o.y, edge.a.y, edge.b.y );
			}
		}
		
		return o;
	}
	
	/**
	 * @return {Point} The "vertex centroid" comes from considering the polygon as being empty but having equal masses at its vertices.
	 */
	get vertexCentroid()
	{
		let C = new Point();
		
		if ( this.edges.length ) {
			this.edges.forEach(function(edge){
				C.x += edge.center.x;
				C.y += edge.center.y;
			});

			C.x /= this.edges.length;
			C.y /= this.edges.length;
		}
		
		return C;
	}

	/**
	 * @return {Point} The usual center, called the centroid (center of area) comes from considering the surface of the polygon as having constant density.
	 */
	get centroid() {
		let twiceArea = 0, x=0, y=0;

		this.edges.forEach(
			edge => {
				const area = edge.a.x * edge.b.y - edge.b.x * edge.a.y;
				twiceArea += area;
				x += (edge.a.x + edge.b.x) * area;
				y += (edge.a.y + edge.b.y) * area;
			}
		);

		twiceArea *= 3;

		return new Point(x/twiceArea, y/twiceArea);
	}


    /**
     * @return {boolean}
     */
	get hasValidVertices() { return this._verticesValid && this._vertices!=null; }
	
	/**
	 * @return {Array.<Point>} all of the unique points in this poly
	 */
	getVertices() {
		if ( this.hasValidVertices ) {
			return this._vertices;
		}
		
		/**
		 * @OPTIMIZED: we're pruning vertices as we're inserting them
		 */ 
		let sizes=[], vertexSize, searchBit, index;
		
		this._vertices = [];

		for (let edgeIndex=0; edgeIndex<this.edges.length; ++edgeIndex) {
			let edgeVertices = [this.edges[edgeIndex].a, this.edges[edgeIndex].b];

			for (let vertexIndex=0; vertexIndex<edgeVertices.length; ++vertexIndex) {
                // try to add this vertex, if another one with the same coordinates (or at a distance < EPSILON from the current one) hasn't already been added
                let vertex = edgeVertices[vertexIndex];

				vertexSize = Geom.pointVertexLength(vertex);
				
				/**
				 * 0. Optimization: if the list is empty, add the vertex
				 */
				if ( !sizes.length ) {
					sizes.push( vertexSize );
					this._vertices.push( vertex.clone() );

					// skip the binary insertion
					continue;
				}
				
				/**
				 * 1. Optimization: inserting at the beginning of the queue
				 */
				if ( sizes.length && vertexSize < sizes[0] ) {
					if ( !Geom.pointsEqual( vertex, this._vertices[0] ) ) {
						sizes.unshift( vertexSize );
						this._vertices.unshift( vertex.clone() );
					}

					// skip the binary insertion
					continue;
				}
				
				/**
				 * 2. Optimization: inserting at the end of the queue
				 */
				if ( sizes.length && vertexSize >= sizes[sizes.length-1] ) {
					// only add this vertex to the list if it's not there already
					// @FIX: this can fail in some cases, e.g. when an equal point to this one exists in the list, but NOT at the end of it. Very rare, but can happen
					if ( !Geom.pointsEqual( vertex, this._vertices[this._vertices.length-1] ) ) {
						sizes.push( vertexSize );
						this._vertices.push( vertex.clone() );
					}

					// skip the binary insertion
					continue;
				}
				
				/**
				 * 3. Binary search: find the insert position for this vertex
				 */
				for (searchBit=1; searchBit<=sizes.length; searchBit<<=1) {}
				searchBit >>= 1;
				
				// search over the vertices ordered by distance from the origin; we also JUMP points that are equal,
				// so that at the end of the search, we only need to look at point at position [indx] for existence
				for (index=0; searchBit>0; searchBit>>=1) {
                    if (index + searchBit < sizes.length && (vertexSize >= sizes[index + searchBit] || Geom.pointsEqual(vertex, this._vertices[index + searchBit]))) {
                        index += searchBit;
                    }
                }

				// if this vertex isn't already in the list, add it
				if ( !Geom.pointsEqual( vertex, this._vertices[index] ) ) {
					sizes.splice( index+1, 0, vertexSize );
                    this._vertices.splice( index+1, 0, vertex.clone() );
				}
			}
		}
		
		// vertices have been validated
		this._verticesValid = true;
		
		return this._vertices;
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Data restructuring
	
	/**
	 * sorts all the edges of the segment set by angle from the geometric centre of the set,
	 *
	 * @param forceSort {boolean} indicates if the sort should be re-executed even if a valid sort is cached
	 */
    sortClockwise( forceSort=false )
	{
		// because we can add edges directly to the segment, we can never be sure if its edges are really sorted, so we include the forceSort parameter
		if ( this._isCWSorted && !forceSort ) return;
		
		// start by sorting the edges
		this.sortClockwiseEdges();
		
		// sort the vertices
        this.sortClockwiseVertices();

        this._isCWSorted = true;
	}
	
	/**
	 * sort the edges in the segment set in a clockwise order relative to the centroid
	 */
	sortClockwiseEdges()
	{
		// fetch the centroid and use it as the origin while determining edge and vertice angles
		let O = this.centroid, edgeAngles=[], indx;
		
		// determine the angles of all edges
		for (indx=0; indx<this.edges.length; ++indx) {
			let edge = this.edges[indx];
			edgeAngles.push({
				edge:	edge,
				angle:	Geom.angleBetweenPoints( O, edge.center )
			});
		}


        // sort the edges and re-write the edges array
        edgeAngles.sort( (a,b) => a.angle-b.angle );
		for (indx=0; indx<edgeAngles.length; ++indx) {
			this._edges[indx] = edgeAngles[indx].edge;
		}
	}

	/**
	 * sort the vertices in the segment set in a clockwise order relative to the centroid
	 */
	sortClockwiseVertices()
	{
		let O = this.centroid, verticeAngles=[], indx;
		
		// determine the angles of all the vertices
		this.getVertices();
		for (indx=0; indx<this._vertices.length; ++indx) {
			let vertex = this._vertices[indx];
			verticeAngles.push({
				vertex:	vertex,
				angle:	Geom.angleBetweenPoints( O, vertex )
			});
		}
		
		// sort the vertices and re-write the array
        verticeAngles.sort( (a,b) => a.angle-b.angle );
		for (indx=0; indx<verticeAngles.length; ++indx) {
			this._vertices[indx] = verticeAngles[indx].vertex;
		}
	}
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Intersection tests
	
	/**
	 * Runs an intersection test between the given segment and all of the polygon's edges.
	 *
	 * @param against {Segment}				 the edge to test for intersections
	 * @param skipExistingVertices {boolean} indicates if we should skip testing polygon edges that have a vertex in common with the tested edge
	 *
	 * @return {null|{edge: Segment, point: Point}}		the edge & point of intersection, null if no intersection is found.
	 */
	intersectEdge( against, skipExistingVertices=false )
	{
		for (let index=0; index<this.edges.length; ++index) {
			let edge = this.edges[index];
			if ( skipExistingVertices && Geom.sharedVertex( edge, against ) ) {
				// the tested edge starts from one of the polygon's vertices; skip testing against the current edge
				continue;
			}

			let p = edge.getIntersection(against);

			// @before: let p = Geom.segmentIntersection(edge, against);
			if ( p != null ) {
				return {
					edge: edge,
					index: index,
					point: p
				};
			}
		}
		
		return null;
	}
	
	/**
	 * O(N^2) collision test
	 * @param test {SegmentSet}
	 * @return {boolean}
	 */
	intersects(test)
	{
		// var ts:Number=getTimer();
		for (let mindx=0, tindx; mindx<this.edges.length; ++mindx) {
			for (tindx=0; tindx<test.edges.length; ++tindx) {
				if ( this.edges[mindx].intersects( test.edges[tindx] ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * @param segment {Segment}
	 */
	countIntersections(segment) {
		return this.edges.filter(edge => edge.getIntersection(segment) !== null).length;
	}

	/**
	 * @param pointRay {Segment}
	 * @return {boolean}
	 */
	containsPointWithRay(pointRay) {
		return !!pointRay && (this.countIntersections(pointRay) % 2 === 1);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Structure Properties

    /**
	 * @protected
     * @param v {boolean}
	 */
	set hasValidHull(v) { this._hullValid=v; }

    /**
	 * @protected
     * @return {boolean}
     */
	get hasValidHull( ) { return this._hullValid && this._hull!=null; }

    /**
	 *
	 * @INFO: we don't use a very fast algorithm here because we're working with small polygons / point sets. Plus, we only calculate the hulls in the
	 * 		pre-processing step and there we optimize/limit the number of times hulls are calculated (they should basically be calculated only for the houses)
	 * @UPGRADE: if we do want to implement the O(NlogN) Graham scan (https://en.wikipedia.org/wiki/Graham_scan), Use the Geom.direction util function,
	 * 		and this link for more details: http://www2.lawrence.edu/fast/GREGGJ/CMSC210/convex/convex.html
	 *
	 * @return {Polygon}
	 */
	get convexHull()
	{
		// if the hull is already calculated, return it.
		if ( this.hasValidHull ) {
			return this._hull;
		}
		
		/**
		 * @INFO: calculate the hull from the vertex set;
		 */
		if ( this.getVertices().length >= 3 ) {
			const hullVertices = Geom.giftWrappingHull(this._vertices);

			/** 3. create the convex hull. It will have all its properties validated, including our bounding box so it doesn't have to be recalculated.
			 *  We have to reverse the points before so that they are in the correct sorted order (clockwise) */
			this._hull		= Polygon.makeConvexHull( hullVertices.reverse(), this.externalBoundingBox );
			this._hullValid	= true;

		}	else {
			// at least 3 points are needed for the convex hull. this should never happen knowing our data
		}
		
		return this._hull;
	}

    /**
     * @protected
     * @param v {boolean}
     */
    set hasValidBBox(v) { this._bboxValid=v; }

    /**
     * @protected
     * @return {boolean}
     */
    get hasValidBBox() { return this._bboxValid && this._bbox!=null; }

    /**
	 * @return {Rectangle}
     */
	get externalBoundingBox()
	{
		// caching
		if ( this.hasValidBBox ) {
			return this._bbox;
		}
		
		// otherwise, calculate it
		let l, t, r, b;
		l = t = Infinity;
		r = b = -Infinity;

		this.getVertices().forEach(function(p){
            l = Math.min(l, p.x);
            t = Math.min(t, p.y);
            r = Math.max(r, p.x);
            b = Math.max(b, p.y);
		});

		this._bbox = new Rectangle( l, t, r-l, b-t );
		this.hasValidBBox = true;
		
		return this._bbox;
	}
	
    /**
	 * run a simple box-based containment test against a rectangle
     * @param rectangle {Rectangle}
     * @return {boolean}
     */
	fitsIn( rectangle )
	{
		return this.externalBoundingBox.width <= rectangle.width && this.externalBoundingBox.height <= rectangle.height;
	}
	
	/**
	 * test against the minimum lot diagonal
	 * @return {boolean}
	 */
	fitsInDiagonal(diagonal)
	{
		return this.externalBoundingBox.width <= diagonal && this.externalBoundingBox.height <= diagonal;
	}
	
    /**
	 * checks if the specified rectangle can be contained within the current segment set's bounding box
     * @param rectangle {Rectangle}
     * @return {boolean}
     */
	canContain(rectangle)
	{
		return rectangle.width <= this.externalBoundingBox.width && rectangle.height <= this.externalBoundingBox.height;
	}


	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Transformations
	
    /**
	 * translates the segment set so that it is left and bottom are aligned to the axes
     * @param invertedYAxis {boolean}
     * @return {Point}
     */
	normalize(invertedYAxis=false)
	{
		let o = this.calculateOrigin(invertedYAxis);
		o.x *= -1;
		o.y *= -1;
		this.translate(o.x, o.y);
		return o;
	}
	
	/**
	 * applies a matrix transformation to the segment set
	 * @param matrix {Matrix}
	 */
    transform(matrix)
	{
		// transform all the edges
		let indx, edge;
		for (indx=0; indx<this.edges.length; ++indx) {
			edge = this.edges[indx];
			edge.transform(matrix);
		}

		 // transform the vertices
		if ( this.hasValidVertices ) {
			for (indx=0; indx<this._vertices.length; ++indx) {
                this._vertices[indx] = matrix.transformPoint( this._vertices[indx] );
			}
		}
		
		// transform the hull (as long as this is not a convex hull itself)
		if ( this.hasValidHull && this._hull!==this ) {
			this._hull.transform( matrix );
		}
		
		// invalidate bounding box after this transform
		this._bboxValid = false;
	}
	
	/**
	 * mirror all the edges of this segment set horizontally
	 * @param xRef {number}
	 */
	mirrorHorizontally(xRef)
	{
		this.edges.forEach(function(edge) {
			edge.mirrorHorizontally(xRef);
		});

		this._verticesValid = false;
		this._bboxValid = false;
		this._hullValid = false;
	}
	
    /**
	 * rotate the segment set around a given origin
     * @param angle {number}
     * @param origin {Point}
     */
	rotate(angle, origin)
	{
		// rotate the edges
		let indx, edge;
		for (indx=0; indx<this.edges.length; ++indx) {
			edge = this.edges[indx];
			edge.rotate(angle, origin);
		}

		// rotate the vertices
		if ( this.hasValidVertices ) {
			for (indx=0; indx<this._vertices.length; ++indx) {
				this._vertices[indx] = Geom.rotatePoint(origin, this._vertices[indx], angle);
			}
		}
		
		// also rotate the hull
		if ( this.hasValidHull && this._hull!==this ) {
            this._hull.rotate(angle, origin);
		}
		
		// invalidate cached properties
		this._bboxValid = false;

		return this;
	}

	/**
	 * translates the edges, vertices, hull & bounding box in the polygon by the indicated distance.
	 *
	 * @param x {number} translates all segments in the set on the 0x axis by this amount
	 * @param y {number} translates all segments in the set on the 0y axis by this amount
	 */
	translate(x, y)
	{
		// translate the edges
		this.translateEdges(x,y);
		
		// translate the vertices
		if ( this.hasValidVertices ) {
			for (let indx=0; indx<this._vertices.length; ++indx) {
				this._vertices[indx].x += x;
                this._vertices[indx].y += y;
			}
		}
		
		// also translate the hull
		if ( this.hasValidHull && this._hull!==this ) {
            this._hull.translate( x, y );
		}
		
		// translate the bounding box
		if ( this.hasValidBBox ) {
            this._bbox.offset( x, y );
		}
	}

    /**
     * @param p {Point}
     */
	translatePoint(p)
	{
		p && this.translate( p.x, p.y );
	}

	/**
	 * only translate the edges; used in some fit analysis methods that don't look at the other properties of the segment set
	 *
	 * @param x {number} translates all edges in the set on the 0x axis by this amount
     * @param y {number} translates all edges in the set on the 0y axis by this amount
	 */
	translateEdges(x, y)
	{
		for (let i=0; i<this.edges.length; ++i) {
            this.edges[i].translate( x, y );
		}
	}

	/**
	 * translate the edges along the Ox axis
	 *
	 * @param x {number} translates all edges in the set on the 0x axis by this amount
	 */
	translateEdgesX(x)
	{
		for (let i=0; i<this.edges.length; ++i) {
            this.edges[i].translateX( x );
		}
	}
	
	/**
	 * translate the edges along the Oy axis
	 *
     * @param y {number} translates all edges in the set on the 0y axis by this amount
	 */
	translateEdgesY(y)
	{
		for (let i=0; i<this.edges.length; ++i) {
            this.edges[i].translateY( y );
		}
	}
	
	/**
	 * merges another segment set into this one; doesn't check for duplicate segments
	 *
	 * @param s {SegmentSet}
	 */
	merge(s)
	{
		for (let i=0; i<s.edges.length; ++i) {
			this.edges.push(s.edges[i].clone());
		}

		// invalidate all calculated properties
		this._verticesValid	= false;
        this._hullValid		= false;
        this._bboxValid		= false;
        this._isCWSorted		= false;
	}

	/**
	 * @param amount {number}
	 */
	pad(amount) {
		const center = this.centroid;
		const uniqueVertices = [...new Set(this.edges.map(edge => [edge.a, edge.b]).flat())];

		console.log('SegmentSet ', this, ' has ', uniqueVertices.length,' unique vertices');

		// go over all of them and apply the padding
		uniqueVertices.forEach(
			vertex => {
				const length = Geom.pointDistance(center, vertex);
				vertex.moveTo(Geom.interpolatePoints(center, vertex, (length + amount) / length), false);
			}
		);
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Sorting
	
	sortByLength(ascending = false)
	{
		this._isCWSorted = false;
        this._edges = this._edges.sort(
        	ascending ?
			((a, b) => a.length-b.length) :
			((a, b) => b.length-a.length)
		);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Data-level Operations
	
	/**
	 * @return {SegmentSet} a deep-clone of this polygon.
	 */
	clone()
	{
		return this.baseClone();
	}

	/**
	 * make the SegmentSet.clone() function viewable to all super-class instantiators
	 *
	 * @return {SegmentSet}
	 */
	baseClone()
	{
		// create a new segment set, copy all our data into it and then return it
		let newSet = new SegmentSet();
		newSet.copy( this );
		return newSet;
	}
	
	/*
	protected function cloneInto( clone:SegmentSet ):SegmentSet
	{
		// clone the edges
		for each ( var edge:Segment in edges ) {
			copy.edges.push( edge.clone() );
		}
		
		// clone the vertices (if they are defined)
		if ( hasValidVertices ) {
			copy._vertices = new Vector.<Point>;
			for each ( var vertex:Point in _vertices ) {
				copy._vertices.push( vertex.clone() );
			}
		}
		
		// clone the hull (if it's calculated)
		if ( hasValidHull ) {
			copy._hull		= _hull.clone();
			copy._hullValid	= true;
		}
		
		return copy;
	}
	*/
	
	/**
	 * deep-copy the given SegmentSet into this one
	 */
	copy(source)
	{
		// copy all the edges
		this._edges = Segment.deepCopy(source.edges);
		
		// copy the vertices
		if ( (this._verticesValid=source._verticesValid) === true ) {
            this._vertices = [];
            for (let i=0; i<source._vertices.length; ++i) {
            	this._vertices.push(source._vertices[i].clone());
			}
		}
		
		// copy the hull
		this._hullValid	= source._hullValid;
        this._hull		= null;
		if ( source.hasValidHull ) {
            this._hull	= source._hull.clone();
		}
	}
}