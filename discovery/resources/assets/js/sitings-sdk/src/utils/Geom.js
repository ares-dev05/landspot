import Point from '../geom/Point';

export default class Geom {

	// static 		    get LN2() {return 0.69314718056;}
    static    get TOLERANCE() {return 0.0001;		} // 0.1mm
    static        get CLOSE() {return 0.001;		} // 1mm
    static      get EPSILON() {return 0.00000001;	} // 10nm
    static get FAR_DISTANCE() {return 10000;		} // 10km; assume that we won't work with lots larger than this


    /**
     * @return {Point}
     */
	static get origin() { return new Point(); }

    /**
     * @param v {number}
     * @return {number}
     */
    static deg2rad(v)
    {
        return v * Math.PI / 180;
    }
    /**
     * @param v {number}
     * @return {number}
     */
    static rad2deg(v)
    {
        return v * 180 / Math.PI;
    }

    /**
	 * return the logarithm of X in base 2
     * @param x {number}
     * @return {number}
     */
	static log2(x) { return Math.log(x) / Math.LN2; }

    /**
     * @param v {number}
     * @param k {number}
     * @return {number}
     */
    static t(v, k) { return v * k; }

    /**
     * @param v {number}
     * @return {int}
     */
    static sign(v) { return v < 0 ? -1 : 1; }

    /**
	 * micrometer accuracy
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static equal(a, b) { return Math.abs(a-b) <= Geom.TOLERANCE; }

    /**
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static epsilonEqual(a, b) { return Math.abs(a-b) <= Geom.EPSILON; }

    /**
     * @param a {Point}
     * @param b {Point}
     * @returns {boolean}
     */
    static equalPoint(a, b) { return Geom.equal(a.x,b.x) && Geom.equal(a.y,b.y); }

    /**
     * @param a {Segment}
     * @param b {Segment}
     * @return {boolean}
     */
    static equalSegment(a, b) {
        return (Geom.equalPoint(a.a, b.a) && Geom.equalPoint(a.b, b.b));
    }

    /**
     * @param a {Segment}
     * @param b {Segment}
     * @return {boolean}
     */
    static reverseSegment(a, b) {
        return (Geom.equalPoint(a.a, b.b) && Geom.equalPoint(a.b, b.a));
    }

    /**
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static lessThan(a, b) { return a + Geom.EPSILON < b; }

    /**
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static lessThanOrEqual(a, b) { return a + Geom.EPSILON <= b; }

    /**
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static greaterThan(a, b) { return a > b + Geom.EPSILON; }

    /**
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static greaterThanOrEqual(a, b) { return a >= b + Geom.EPSILON; }

    /**
     * millimeter accuracy
     * @param a {number}
     * @param b {number}
     * @return {boolean}
     */
    static close( a, b ) { return Math.abs(a-b) <= Geom.CLOSE; }

    /**
     * @param v {number}
     * @returns {boolean} true if the number is NaN, Infinity or -Infinity
     */
    static isUndefined(v) { return isNaN(v) || v===Infinity || v===-Infinity; }

    /**
     * @param a {number}
     * @param min {number}
     * @param max {number}
     * @returns {boolean} true if the number is between the two specified limits (included)
     */
    static between(a, min, max) { return min <= a && a <= max; }


    /**
     * @param a {Point}
     * @param b {Point}
     * @return {Boolean}
     */
    static pointsEqual(a, b) { return Geom.equal(a.x, b.x) && Geom.equal(a.y, b.y); }

    /**
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @returns {boolean}
     */
    static pointsEqualCoords(ax, ay, bx, by) { return Geom.equal(ax, bx) && Geom.equal(ay, by); }

    /**
     * @param a {Point}
     * @param b {Point}
     * @return {Boolean}
     */
    static pointsClose(a, b) { return Geom.close(a.x, b.x) && Geom.close(a.y, b.y); }

    /**
     * @param m {Segment}
     * @param n {Segment}
     * @return {boolean} indicating if the two segments share a vertex
     */
    static sharedVertex(m, n)
    {
        return Geom.pointsEqual( m.a, n.a ) || Geom.pointsEqual( m.a, n.b ) ||
               Geom.pointsEqual( m.b, n.a ) || Geom.pointsEqual( m.b, n.b );
    }

    /**
	 * rounding to micrometer accuracy
     * @param v {number}
     * @return {number}
     */
    static epsilonRound( v )
	{
        return Number(v.toFixed(6));
    }

    /**
     * rounding to milimeter accuracy
     * @param v {number}
     * @return {number}
     */
    static displayRound(v)
    {
        return Number(v.toFixed(3));
    }

    /**
     * @param a {Point}
     * @param b {Point}
     * @param c {Point}
     * @return {boolean}
     */
    static isLeft(a, b, c){
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) >= -Geom.EPSILON;
    }

    /**
     * @param a {Point}
     * @param b {Point}
     * @param c {Point}
     * @return {boolean}
     */
    static isRight(a, b, c){
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) <=  Geom.EPSILON;
    }

    /**
     * @param ox {number} origin X
     * @param oy {number} origin Y
     * @param px {number} X coordinate of point to rotate
     * @param py {number} Y coordinate of point to rotate
     * @param angle {number} angle to rotate (in radians)
     * @return {Point}
     */
    static rotatePointCoords(ox, oy, px, py, angle) {
        return new Point(
            ox + (px-ox)*Math.cos(angle) - (py-oy)*Math.sin(angle),
            oy + (px-ox)*Math.sin(angle) + (py-oy)*Math.cos(angle)
        );
    }

    /**
     * @param o {Point} origin
     * @param p {Point} point to torate
     * @param angle {number} angle
     * @return {Point}
     */
    static rotatePoint(o, p, angle) {
        return new Point(
            o.x + (p.x-o.x)*Math.cos(angle) - (p.y-o.y)*Math.sin(angle),
            o.y + (p.x-o.x)*Math.sin(angle) + (p.y-o.y)*Math.cos(angle)
        );
    }

    /**
     * @param p {Point}
     * @return {number}
     */
    static pointVertexLength( p )
    {
        return Math.sqrt( p.x*p.x + p.y*p.y );
    }

    /**
     * @param vx {number}
     * @param vy {number}
     * @return {number}
     */
    static vectorLength( vx, vy )
    {
        return Math.sqrt( vx*vx + vy*vy );
    }

    /**
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     * @return {number}
     */
    static segmentLength(x1, y1, x2, y2)
    {
        return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
    }

    /**
     * @param a {Point}
     * @param b {Point}
     * @return {number}
     */
    static pointDistance( a, b )
    {
        if (!a || !b) {
            return Infinity;
        }

        return Math.sqrt( (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y) );
    }

    /**
     * @param a {Point}
     * @param b {Point}
     * @return {number}
     */
    static distanceQuad( a, b )
    {
        return (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y);
    }

    /**
     * @param x1 {number}
     * @param y1 {number}
     * @param x2 {number}
     * @param y2 {number}
     * @return {number}
     */
    static angleBetween(x1, y1, x2, y2)
    {
        return Math.atan2( y2-y1, x2-x1 );
    }

    /**
	 * indicates if point Q makes a more CCW turn with point P than point R
     *
     * @param anchor {Point}	the fixed point that we're measuring angles from
     * @param control {Point}	the control point that gives us the current CCW turn angle
     * @param test {Point}		the point that we're testing to see if it turns more to the left than the control point
     * @return {Boolean}		indicating if the test point turns more to the left (CCW) than the control, in relation to the anchor
     */
    static ccwTurn( anchor, control, test ) {
        const val = (test.y-anchor.y) * (control.x-test.x) - (test.x-anchor.x) * (control.y-test.y);

        if (Geom.equal(val, 0)) {
            // If we are within the margin of error (points are collinear), check the distance and also that
            // the control point is between the anchor and test point
            return Geom.distanceQuad(anchor,test) > Geom.distanceQuad(anchor,control) &&
                Geom.equal(Geom.pointToSegmentDistance(control.x, control.y, anchor.x, anchor.y, test.x, test.y), 0);
        }   else {
            return val > 0;
        }
    }

    /**
     * Calculate the convex hull for a set of points using the simple, O(N^2) Gift Wrapping algorithm
     * (https://en.wikipedia.org/wiki/Gift_wrapping_algorithm)
     *
     * @param vertices {Point[]}
     * @return {Point[]}
     */
    static giftWrappingHull(vertices) {
        const hullVertices = [];

        /** 1. find the left-most (& bottom-most, as we're going in a CCW direction) point */
        let indx, start, current, next, v;

        for (indx = 0; indx < vertices.length; ++indx) {
            v = vertices[indx];
            if (!start || (v.x < start.x) || (v.x === start.x && v.y < start.y)) {
                start = v;
            }
        }

        // add the start point to the hull, and make it the current one
        hullVertices.push(current = start);

        // define the pool of points that need to be wrapped inside the hull
        const pool = vertices.concat();

        /** 2. start adding points to the hull, as long as we don't get back to start. At each step we add the point that turns most to the left
         *    from the current point of the hull, which means that we're creating the hull in a clockwise order */
        do {
            // find the next point in the convex hull
            next = null;
            for (indx = 0; indx < pool.length; ++indx) {
                v = pool[indx];

                if (!next || Geom.ccwTurn(current, next, v)) {
                    next = v;
                }
            }

            // if we haven't reached the start of the convex hull yet, add this new point to the hull
            if (next !== start) {
                pool.splice(pool.indexOf(next), 1);
                hullVertices.push(current = next);
            }
        } while (next !== start && pool.length);

        return hullVertices;
    }

    /**
     * @param o {Point} the origin
     * @param p {Point} the point whose angle we're calculating
     * @return {number} The angle of the point p in radians, measured counterclockwise from a circle's x axis (where o represents the center of the circle).
     * 		The return value is between positive pi and negative pi. Note that the first parameter to atan2 is always the y coordinate.
     */
    static angleBetweenPoints(o, p)
    {
        return Math.atan2( p.y-o.y, p.x-o.x );
    }

    /**
     * @param v {number}
     * @return {number}
     */
    static limitAngle(v)
    {
        return Geom.norm(v);
    }

    /**
     * @param v {number}
     * @return {number}
     */
    static limitDegrees(v)
    {
        while ( v <    0 ) v += 360;
        while ( v >= 360 ) v -= 360;
        return v;
    }

    /**
     * @param v {number}
     * @return {number}
     */
    static limit180(v)
    {
        while ( v < -180 ) v += 360;
        while ( v >= 180 ) v -= 360;
        return v;
    }

    /**
	 * Linear 1D interpolation position K in the [start, end] interval
     * @param start {number}
     * @param end {number}
     * @param k {number}
     * @return {number}
     */
    static getWeighedValue(start, end, k)
    {
        return start + k * ( end - start );
    }

    /**
     * The inverse of the previous function. We try to find the value of K in the below equation:
     * value = start + k * ( end - start )
     *
     * @param start {number}
     * @param end {number}
     * @param value {number}
     *
     * @return {number}
     */
    static getValueWeight(start, end, value)
    {
        // Can't solve the equation if start is equal to end
        if (Geom.epsilonEqual(start, end)) {
            return Infinity;
        }

        return (value - start) / (end - start);
    }

    /**
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @param factor {number}
     * @return {Point}
     */
    static getSegmentPoint(ax, ay, bx, by, factor)
    {
        return new Point(
            Geom.getWeighedValue( ax, bx, factor ),
            Geom.getWeighedValue( ay, by, factor )
        );
    }

    /**
     * @param a {Point}
     * @param b {Point}
     * @param k {number}
     * @returns {Point}
     */
    static interpolatePoints( a, b, k )
    {
        return Geom.getSegmentPoint( a.x, a.y, b.x, b.y, k );
    }

    /**
     * Inverse of previous function. Find the value of k from three given points
     * Find where on the [a, b] segment is point placed, on a scale from 0 to 1
     *
     * @param a {Point}
     * @param b {Point}
     * @param point {Point}
     */
    static getPointPosition(a, b, point) {
        const xk = Geom.getValueWeight(a.x, b.x, point.x);
        const yk = Geom.getValueWeight(a.y, b.y, point.y);

        if (xk===Infinity) {
            if (yk===Infinity) {
                // points a and b are identical
                return Infinity;
            }

            return yk;
        }

        if (yk===Infinity) {
            return xk;
        }

        if (Geom.equal(xk, yk)) {
            return xk;
        }

        throw new Error('point ' +point+ ' is not on segment ['+a+', '+b+']');
    }

    /**
     * @param segment {Segment}
     * @param point {Point}
     * @param onLine {boolean} flag that indicates if we should try to find the point on the line defined by the segment
     */
    static isPointOnSegment(segment, point, onLine=false) {
        try {
            const position = Geom.getPointPosition(segment.a, segment.b, point);

            return onLine || (0 <= position && position <= 1);
        }   catch (error) {
            return false;
        }
    }

    /**
     * @param pointX {number}
     * @param pointY {number}
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @return {number}
     */
    static pointToSegmentDistance(pointX, pointY, ax, ay, bx, by) {
        let iPoint = Geom.pointToSegmentIntersection( pointX, pointY, ax, ay, bx, by );
        return Geom.segmentLength( pointX, pointY, iPoint.x, iPoint.y );
    }

    /**
     * @param v {number}
     * @return  {number}
     */
    static norm(v)
    {
        while ( v < 0 ) v += Math.PI * 2;
        while ( v >= Math.PI*2 ) v -= Math.PI * 2;
        return v;
    }

    /**
     * @param pointX {number}
     * @param pointY {number}
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @return {Point}
     */
    static pointToSegmentIntersection(pointX, pointY, ax, ay, bx, by) {
        // translate the points to a coordinate system where A is the origin
        let a = new Point(), b, c, dx, dy, result;

        // use as origin the left-most point
        if ( ax < bx ) {
            dx = ax; dy = ay;
            b = new Point( bx-ax, by-ay );
            c = new Point( pointX-ax, pointY-ay );
        }
        else {
            dx = bx; dy = by;
            b = new Point( ax-bx, ay-by );
            c = new Point( pointX-bx, pointY-by );
        }

        let angle = Geom.angleBetween( a.x, a.y, b.x, b.y );

        // rotate the coordinates system such that AB will be on the 0x axis
        b	= Geom.rotatePoint( a, b, -angle );
        c	= Geom.rotatePoint( a, c, -angle );

        // at this point, b.y should be ~0
        if ( c.x < 0 ) {
            result = new Point(a.x, a.y);
        }
        else if ( c.x > b.x ) {
            result = new Point(b.x, b.y);
        }
        else {
            result = new Point(c.x, a.y);
        }

        // rotate the point back
        result = Geom.rotatePoint( a, result, angle );
        // translate the point back
        result.x += dx;
        result.y += dy;

        return result;
    }

    /**
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @param cx {number}
     * @param cy {number}
     * @param dx {number}
     * @param dy {number}
     * @returns {boolean}
     */
    static segmentsParallel(
        // 1st segment definition
        ax, ay, bx, by,
        // 2nd segment definition
        cx, cy, dx, dy
    )
    {
        const angle = Geom.limitAngle(
            Geom.angleBetween(ax, ay, bx, by) - Geom.angleBetween(cx, cy, dx, dy)
        );

        return Geom.equal(angle, 0) || Geom.equal(angle, Math.PI);
    }

    /**
     * Determines the intersection point of two segments
     *
     * @param m {Segment}
     * @param n {Segment}
     * @param extendedLines {boolean} Indicates if the intersection should be checked on the lines defined by the segments, even if the actual segments don't intersect
     * @return {Point}
     */
    static segmentIntersection(m, n, extendedLines=false) {
        return Geom.segmentIntersectionCoords(
            m.a.x, m.a.y, m.b.x, m.b.y,
            n.a.x, n.a.y, n.b.x, n.b.y,
            extendedLines
        );
    }

    /**
     * Determines the intersection point of two segments, defined by their points (vertices)
     *
     * @param a {Point}
     * @param b {Point}
     * @param c {Point}
     * @param d {Point}
     * @returns {Point}
     */
    static segmentIntersectionPoints(a, b, c, d) {
        return Geom.segmentIntersectionCoords(
            a.x, a.y, b.x, b.y,
            c.x, c.y, d.x, d.y
        );
    }

    /**
     * @param ax {number} Segment 1 A.x
     * @param ay {number} Segment 1 A.y
     * @param bx {number} Segment 1 B.x
     * @param by {number} Segment 1 B.y
     * @param cx {number} Segment 2 A.x
     * @param cy {number} Segment 2 A.y
     * @param dx {number} Segment 2 B.x
     * @param dy {number} Segment 2 B.y
     * @param extendedLines {boolean} Indicates if the intersection should be checked on the lines defined by the segments, even if the actual segments don't intersect
     * @return {Point}
     */
    static segmentIntersectionCoords(ax, ay, bx, by, cx, cy, dx, dy, extendedLines=false) {
        let v1x, v1y, v2x, v2y, d, intersectPoint = new Point();

        v1x = bx - ax;
        v1y = by - ay;
        v2x = dx - cx;
        v2y = dy - cy;

        d = v1x * v2y - v1y * v2x;
        if ( !d )
        {
            //lines are parallel
            return null;
        }

        let a = cx - ax;
        let b = cy - ay;
        let t = (a * v2y - b * v2x) / d;
        let s = (b * v1x - a * v1y) / -d;

        if (extendedLines === false && (t < 0 || t > 1 || s < 0 || s > 1)) {
            //line segments don't intersect
            return null;
        }

        intersectPoint.x = ax + v1x * t;
        intersectPoint.y = ay + v1y * t;

        return intersectPoint;
    }

    /**
     * Sort all the points by their angle to the center of weight of the polygon
     *
     * @param points {*[]}
     * @param center {Point}
     * @return {*[]}
     */
    static sortPoints(points, center=null) {
        if (!points.length) {
            return [];
        }

        let cx = 0, cy = 0;

        if (center) {
            cx = center.x;
            cy = center.y;
        }   else {
            // calculate the polygon's center as the average of all the points
            for (let i = 0; i < points.length; ++i) {
                cx += points[i].x;
                cy += points[i].y;
            }
            cx /= points.length;
            cy /= points.length;
        }

        // store the angle to the center for each point
        const angles = [];
        for (let i = 0; i < points.length; ++i) {
            angles.push({
                point: points[i],
                angle: Geom.angleBetween(cx, cy, points[i].x, points[i].y)
            });
        }

        // store the points by their angle
        angles.sort((a, b) => a.angle - b.angle);

        // write in the new, ordered points
        for (let i = 0; i < points.length; ++i) {
            points[i] = angles[i].point;
        }

        return points;
    }

    /**
     * Walk all the supplied edges and extract all the unique points in the list
     * @param edges {Segment[]}
     */
    static walkSortPoints(edges) {
        if (!edges || !edges.length) {
            return [];
        }

        // make a shallow copy
        edges = edges.concat();

        /**
         * @type {Point[]}
         */
        const points = [edges[0].a, edges[0].b];

        /**
         * @type {Point}
         */
        let current = edges[0].b;
        /**
         * @type {Segment}
         */
        let currentEdge = edges[0];

        edges.shift();

        while (edges.length) {
            // find the edge that connects to the current point
            const nextEdge =
                // Either find a direct continuation from the current point
                edges.find( edge => current.equals(edge.a) || current.equals(edge.b)) ||
                // Or an overlap between the current edge and the next one
                edges.find( edge => Geom.isPointOnSegment(edge, current) && (
                    Geom.isPointOnSegment(currentEdge, edge.a) ||
                    Geom.isPointOnSegment(currentEdge, edge.b)
                ));

            if (nextEdge !== undefined) {
                if (current.equals(nextEdge.a)) {
                    points.push(current = nextEdge.b);
                }
                else if (current.equals(nextEdge.b)) {
                    points.push(current = nextEdge.a);
                }
                else {
                    // We have an overlap, not a direct continuation
                    points.push(
                        current = (Geom.isPointOnSegment(currentEdge, nextEdge.a) ? nextEdge.b : nextEdge.a)
                    );
                }

                // Set the new current edge
                currentEdge = nextEdge;

                // remove this edge from the list
                edges.splice(edges.indexOf(nextEdge), 1);
            }   else {
                break;
            }
        }

        return points;
    }

    /**
     * @param M {number[][]}
     * @return {[]}
     */
    static invertMatrix(M){
        // use Guassian Elimination to calculate the inverse:
        // (1) 'augment' the matrix (left) by the identity (on the right)
        // (2) Turn the matrix on the left into the identity by elementary row ops
        // (3) The matrix on the right is the inverse (was the identity matrix)
        // There are 3 elementary row ops: (I combine b and c in my code)
        // (a) Swap 2 elementary
        // (b) Multiply a row by a scalar
        // (c) Add 2 rows

        //if the matrix isn't square: exit (error)
        if (M.length !== M[0].length) {
            console.log('returning null because M.length !== M[0].length');
            return null;
        }

        //create the identity matrix (I), and a copy (C) of the original
        let i=0, ii=0, j=0, dim=M.length, e=0;
        let I = [], C = [];

        for(i=0; i<dim; i+=1){
            // Create the row
            I[I.length]=[];
            C[C.length]=[];

            for(j=0; j<dim; j+=1){
                //if we're on the diagonal, put a 1 (for identity)
                I[i][j] = (i===j) ? 1 : 0;

                // Also, make the copy of the original
                C[i][j] = M[i][j];
            }
        }

        // Perform elementary row operations
        for(i=0; i<dim; i+=1){
            // get the element e on the diagonal
            e = C[i][i];

            // if we have a 0 on the diagonal (we'll need to swap with a lower row)
            if(e===0){
                //look through every row below the i'th row
                for(ii=i+1; ii<dim; ii+=1){
                    //if the ii'th row has a non-0 in the i'th col
                    if(C[ii][i] !== 0){
                        //it would make the diagonal have a non-0 so swap it
                        for(j=0; j<dim; j++){
                            e = C[i][j];       //temp store i'th row
                            C[i][j] = C[ii][j];//replace i'th row by ii'th
                            C[ii][j] = e;      //replace ii'th by temp
                            e = I[i][j];       //temp store i'th row
                            I[i][j] = I[ii][j];//replace i'th row by ii'th
                            I[ii][j] = e;      //replace ii'th by temp
                        }
                        //don't bother checking other rows since we've swapped
                        break;
                    }
                }
                //get the new diagonal
                e = C[i][i];

                //if it's still 0, not invertable (error)
                if(e===0) {
                    console.log('returning null because e===0: not invertable (error)');
                    return null;
                }
            }

            // Scale this row down by e (so we have a 1 on the diagonal)
            for(j=0; j<dim; j++){
                C[i][j] = C[i][j]/e; //apply to original matrix
                I[i][j] = I[i][j]/e; //apply to identity
            }

            // Subtract this row (scaled appropriately for each row) from ALL of
            // the other rows so that there will be 0's in this column in the
            // rows above and below this one
            for(ii=0; ii<dim; ii++){
                // Only apply to other rows (we want a 1 on the diagonal)
                if(ii===i) {
                    continue;
                }

                // We want to change this element to 0
                e = C[ii][i];

                // Subtract (the row above(or below) scaled by e) from (the
                // current row) but start at the i'th column and assume all the
                // stuff left of diagonal is 0 (which it should be if we made this
                // algorithm correctly)
                for(j=0; j<dim; j++){
                    C[ii][j] -= e*C[i][j]; //apply to original matrix
                    I[ii][j] -= e*I[i][j]; //apply to identity
                }
            }
        }

        //we've done all operations, C should be the identity
        //matrix I should be the inverse:
        return I;
    }

    /**
     * @param matrix {number[][]}
     * @param factor {number}
     * @return {number[][]}
     */
    static upscaleMatrix(matrix, factor=1) {
        // We can only upscale square matrices by an integer factor (usually a power of 2)
        if (factor <= 1 || matrix.length !== matrix[0].length || !Number.isInteger(factor)) {
            return matrix;
        }

        const SIZE = matrix.length;
        const UPSIZE = matrix.length * factor;

        // determine current coefficients
        const coeffs = matrix.map((col,index) => index / (SIZE-1));
        const coeffDistance = 1 / (SIZE-1);

        const upColumns = [];
        const upFinal   = [];

        // upscale columns
        for (let x=0; x<SIZE; ++x) {
            const column   = matrix[x];
            const upColumn = [];
            // Y position in original column
            let position   = 0;

            for (let y=0; y<UPSIZE; ++y) {
                // calculate upscaling factor
                const upFactor = y / (UPSIZE-1);

                // verify if we are in the correct interval for the current matrix, or if we need to move to the next one
                if (position+1 < SIZE && upFactor >= coeffs[position+1]) {
                    ++position;
                }

                if (position === SIZE-1) {
                    upColumn[y] = column[position];
                }   else {
                    // calculate the upscaling factor
                    const K = (upFactor - coeffs[position]) / coeffDistance;
                    // determine the upscaled value for the current position
                    upColumn[y] = Geom.getWeighedValue(column[position], column[position+1], K);
                }
            }

            upColumns.push(upColumn);
        }

        // upscale rows
        for (let y=0; y<UPSIZE; ++y) {
            // X position in original row
            let position = 0;
            for (let x=0; x<UPSIZE; ++x) {
                if (!y) {
                    // fill in columns
                    upFinal[x] = [];
                }

                const upFactor = x / (UPSIZE-1);

                // verify if we are in the correct interval for the current matrix, or if we need to move to the next one
                if (position+1 < SIZE && upFactor >= coeffs[position+1]) {
                    ++position;
                }

                if (position === SIZE-1) {
                    upFinal[x][y] = upColumns[position][y];
                }   else {
                    // calculate the upscaling factor
                    const K = (upFactor - coeffs[position]) / coeffDistance;
                    // determine the upscaled value for the current position
                    upFinal[x][y] = Geom.getWeighedValue(upColumns[position][y], upColumns[position+1][y], K);
                }
            }
        }

        return upFinal;
    }

    /**
     * @param source {number[][]}
     * @param xOffset {number}
     * @param yOffset {number}
     * @param size {number}
     */
    static extractMatrix(source, xOffset, yOffset, size) {
        const result = [];

        for (let x=0; x<size; ++x) {
            result[x] = [];
            for (let y=0; y<size; ++y) {
                result[x][y] = source[x+xOffset][y+yOffset];
            }
        }

        return result;
    }

    static logArr(array) {
        return array.map(row => row.join(', ')).join('\n');
    }

}