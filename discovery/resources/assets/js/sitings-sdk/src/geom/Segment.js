import Point from './Point';
import Geom from '../utils/Geom';
import HighlightableModel from '../events/HighlightableModel';

/**
 * The Graphics class contains methods used to draw primitive shapes such as lines, circles and
 * rectangles to the display, and to color and fill them.
 *
 * @class
 */
export default class Segment extends HighlightableModel
{
    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return 'Segment'; }

    /**
     * @return {string}
     */
    static get CURVE_CLASS_TYPE() { return 'CurvedSegment'; }

    /**
     * @param type {string}
     * @return {boolean}
     */
    isType(type) { return type === Segment.CLASS_TYPE; }

    /**
     * @param {Point} [a] - vertex A of the segment
     * @param {Point} [b] - vertex B of the segment
     * @param {*} context
     * @param {LotCurveModel} parentCurve
     */
    constructor(a, b, context=null, parentCurve=null)
    {
        super(context);
        /**
         * @type {Point}
         * @protected
         */
        this._a = a;

        /**
         * @type {Point}
		 * @protected
         */
        this._b = b;

        /**
		 * Indicates if the Segment properties have been calculated since the last coordinate change on at least one of the vertices
		 *
         * @type {boolean}
         * @private
		 * @default false
         */
        this._propertiesValid = false;

        /**
		 * Indicates if the segment bounding box calculation is current
		 *
         * @type {boolean}
         * @private
		 * @default false
         */
        this._minMaxValid = false;

        /**
         * Flag that indicates if the segment's vertices have the same Y coordinate
         *
         * @type {boolean}
         * @private
         * @default false
         */
        this._isHorizontal = false;

        /**
         * Flag that indicates if the segment's vertices have the same X coordinate
         *
         * @type {boolean}
         * @private
         * @default false
         */
        this._isVertical = false;

        /**
         * Ratio between the height and the width of the segment
         *
         * @type {number}
         * @private
         */
        this._slope = 0;

        /**
         * LotEdgeAngle of the slope (and of the segment), in radians, measured between the low and high point of the segment
         *
         * @type {number}
         * @private
         */
        this._slopeAngle = 0;

        /**
         * @type {Point}
         * @private
         */
        this._low = null;

        /**
         * @type {Point}
         * @private
         */
        this._high = null;

        /**
         * @type {Point}
         * @private
         */
        this._center = null;

        /**
		 * bounding box properties
		 *
         * @type {number}
         * @private
         */
        this._minx = 0;
        this._miny = 0;
        this._maxx = 0;
        this._maxy = 0;

        /**
		 * segment angle, measured between A -> B, in radians
         * @type {number}
         * @private
         */
        this._angle = 0;

        /**
		 * liniar distance between A and B
		 *
         * @type {number}
         * @private
         */
        this._length = 0;

        // Normals inside of a polygon, when set by the parent polygon

        /**
         * @type {Segment}
         * @private
         */
        this._inNormal = null;

        /**
         * @type {Segment}
         * @private
         */
        this._outNormal = null;

        /**
         * @type {LotCurveModel} Indicates if this segment is created as a piecewise segmentation of a curve
         * @private
         */
        this._parentCurve = parentCurve;

        this.invalidate();
    }

    /**
     * @returns {Point}
     */
    get a() { return this._a; }

    /**
     * @returns {Point}
     */
    get b() { return this._b; }

    /**
     * @param v {Point}
     */
    set a(v) { this._a=v.clone(); this.invalidate(); }

    /**
     * Chain-able start setter
     * @param v {Point}
     * @return {Segment}
     */
    setA(v) { this.a = v; return this; }

    /**
     * @param v {Point}
     */
    set b(v) { this._b=v.clone(); this.invalidate(); }

    /**
     * Chain-able end setter
     * @param v {Point}
     * @return {Segment}
     */
    setB(v) { this.b = v; return this; }

    /**
     * @return {Segment}
     */
    get inNormal() { return this._inNormal; }

    /**
     * @param v {Segment}
     */
    set inNormal(v) { this._inNormal=v; }

    /**
     * @return {Segment}
     */
    get outNormal() { return this._outNormal; }

    /**
     * @param v {Segment}
     */
    set outNormal(v) { this._outNormal=v; }

    /**
     * @return {LotCurveModel}
     */
    get parentCurve() { return this._parentCurve; }

    /**
     * @param v {LotCurveModel}
     */
    set parentCurve(v) { this._parentCurve = v; }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Queries

    /**
     * @param p {Point}
     * @returns {boolean}
     */
    contains(p) { return this._a.equals(p) || this._b.equals(p); }

    /**
     * @param p {Point}
     * @returns {Point}
     */
    oppositePoint(p) { return this._a.equals(p) ? this._b : this._b.equals(p) ? this._a : null; }

    /**
     * @param p {Point}
     * @returns {Point}
     */
    farPoint(p) { return Geom.pointsClose(this.a, p) ? this.b : Geom.pointsClose(this.b, p) ? this.a : null; }

    /**
     * @param B {Segment}
     * @return {boolean}
     */
    containsSegment(B) {
        // If both points of segment B are at distance=0 from this segment, then we return success
        return Geom.equal(0, Geom.pointToSegmentDistance(B.a.x, B.a.y, this.a.x, this.a.y, this.b.x, this.b.y)) &&
            Geom.equal(0, Geom.pointToSegmentDistance(B.b.x, B.b.y, this.a.x, this.a.y, this.b.x, this.b.y));
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Properties

    /**
     * @returns {boolean}
     */
    get isHorizontal()	{ this.validateProperties(); return this._isHorizontal; }

    /**
     * @returns {boolean}
     */
    get isVertical()	{ this.validateProperties(); return this._isVertical; }

    /**
     * @returns {number}
     */
    get slope()			{ this.validateProperties(); return this._slope; }

    /**
     * @returns {number}
     */
    get slopeAngle()	{ this.validateProperties(); return this._slopeAngle; }

    /**
     * @returns {Point}
     */
    get low()			{ this.validateProperties(); return this._low; }

    /**
     * @returns {Point}
     */
    get high()			{ this.validateProperties(); return this._high; }

    /**
     * @returns {Point}
     */
    get center()		{ this.validateProperties(); return this._center; }

    /**
     * @returns {number}
     */
    get maxy()			{ this.validateMinMax(); return this._maxy; }

    /**
     * @returns {number}
     */
    get maxx()			{ this.validateMinMax(); return this._maxx; }

    /**
     * @returns {number}
     */
    get miny()			{ this.validateMinMax(); return this._miny; }

    /**
     * @returns {number}
     */
    get minx()			{ this.validateMinMax(); return this._minx; }

    /**
     * @returns {number}
     */
    get length()		{ this.validateProperties(); return this._length; }

    /**
     * @returns {number} angle in radians
     */
    get angle()			{ this.validateProperties(); return this._angle; }

    /**
     * @param v {number} angle in radians
     */
    set angle(v)		{ this.b = Geom.rotatePointCoords( this.a.x, this.a.y, this.b.x, this.b.y, v-this.angle ); }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Validation / Property Caching

    /**
     * Invalidate cached properties after a change in the vertices' coordinates
     */
    invalidate()
    {
        this._propertiesValid = false;
        this._minMaxValid = false;
        delete this.vx;
    }

    markDirty()
    {
        this.invalidate();
    }

    /**
	 * Cache all the segment's properties
     * @param forceValidate {boolean}
     */
    validateProperties(forceValidate=false)
    {
        this.validateMinMax();
        if (this._propertiesValid && !forceValidate)
            return;

        if ( this._a.y <= this._b.y ) {
            this._low	= this._a;
            this._high	= this._b;
        }	else {
            this._low	= this._b;
            this._high	= this._a;
        }
        this._center	= new Point( (this.a.x+this.b.x)*.5, (this.a.y+this.b.y)*.5 );

        this._isVertical   =
		this._isHorizontal = false;

        if ( Geom.epsilonEqual(this._minx, this._maxx) ) {
            this._isVertical = true;
            this._slope = Infinity;
        }	else
		if ( Geom.epsilonEqual(this._miny, this._maxy) ) {
			this._isHorizontal = true;
			this._slope = 0;
        }	else {
            this._slope = ( this._high.y-this._low.y ) / ( this._high.x-this._low.x );
        }

        this._slopeAngle = Math.atan2( this._high.y-this._low.y, this._high.x-this._low.x );
        this._length	 = Geom.segmentLength( this.a.x, this.a.y, this.b.x, this.b.y );
        this._angle		 = Math.atan2( this.b.y-this.a.y, this.b.x-this.a.x );

        this._propertiesValid = true;
    }

    /**
	 * Cache the segment's bounding box coordinates
     */
    validateMinMax()
    {
        if ( this._minMaxValid )
            return;

        this._minx	= Math.min(this.a.x, this.b.x);
        this._miny	= Math.min(this.a.y, this.b.y);
        this._maxx	= Math.max(this.a.x, this.b.x);
        this._maxy	= Math.max(this.a.y, this.b.y);
        this._minMaxValid = true;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Actions

    /**
     * @param B {Segment}
     * @return {boolean}
     */
    equals(B) {
        return (Geom.equalPoint(this.a, B.a) && Geom.equalPoint(this.b, B.b)) ||
               (Geom.equalPoint(this.a, B.b) && Geom.equalPoint(this.b, B.a));
    }

    /**
     * @param B {Segment}
     * @returns {boolean}
     */
    intersects(B)
    {
        // make sure to run the correct intersection test when one of the segments is a curve
        if (B.isType(Segment.CURVE_CLASS_TYPE)) {
			return B.intersects(this);
		}

        return !!this._intersectWith( B );
    }

    /**
     * @param B {Segment}
     * @returns {Point}
     */
    getIntersection(B)
    {
        // make sure to run the correct intersection test when one of the segments is a curve
        if (B.isType(Segment.CURVE_CLASS_TYPE)) {
			return B.getIntersection(this);
        }

        let result=this._intersectWith(B, true);
        if (result===false) {
            return null;
        }

        return result;
    }

    /**
     * @TODO @REFACTOR rename this to getProjection
     * @param px {number}
     * @param py {number}
     * @return {Point}
     */
    getIntersectionPoint(px, py)
    {
        return Geom.pointToSegmentIntersection(
            px, py, this.a.x, this.a.y, this.b.x, this.b.y
        );
    }

    /**
     * run a hit test against another segment, optionally displaced by a given position
     * @param test {Segment} the segment that we're running the intersection against
     * @param dx {number} test segment displacement on 0x
     * @param dy {number} test segment displacement on 0y
     */
    hitTest( test, dx=0, dy=0 )
    {
        return Geom.segmentIntersectionCoords(
            this.a.x, this.a.y, this.b.x, this.b.y,
            dx+test.a.x, dy+test.a.y, dx+test.b.x, dy+test.b.y
        ) != null;
    }

    /**
	 * calculate vector dimension on both axes
     */
    calc()
    {
        if ( !this.hasOwnProperty('vx') ) {
            this.vx = this.b.x - this.a.x;
            this.vy = this.b.y - this.a.y;
        }
    }

    /**
     * @param B Segment
     * @param returnPoint boolean
     * @returns {Point|boolean}
     * @private
     */
    _intersectWith( B, returnPoint=false )
    {
        /**
         * @MD 25APR18 - adding bounding box test actually slows down the algorithm;
         * 	> if we want to be pessimistic and assume that an intersection exists, this test is actually faster
         B.validateMinMax();
         validateMinMax();
         if ( _maxx < B._minx || _minx > B._maxx ||
         	_maxy < B._miny || _miny > B._maxy )
         return false;
         **/

        this.calc();
        B.calc();

        let d = this.vx * B.vy - this.vy * B.vx;
        // if the edges are parallel, they don't intersect
        if ( !d ) {
            return false;
        }

        let m = B.a.x - this.a.x;
        let n = B.a.y - this.a.y;

        let t = (m * B.vy - n * B.vx) / d;
        let s = (n * this.vx - m * this.vy) / -d;

        if (t < 0 || t > 1 || s < 0 || s > 1) {
            return false;
        }	else if ( returnPoint ) {
            return new Point(this.a.x + this.vx * t, this.a.y + this.vy * t);
        }	else {
            return true;
        }
    }

    /**
     * Ray-casting test using the algorithm described at https://rosettacode.org/wiki/Ray-casting_algorithm
     * 	We extend a ray from the given point to the right, on the horizontal, all the way to Positive Infinity
     * Knowing that we'll perform these tests multiple times, we optimize the calculations (is this really needed?)
     *
     *  P : the point from which the ray starts
     *	A : the end-point of the segment with the smallest y coordinate
     *		(A must be "below" B)
     *	B : the end-point of the segment with the greatest y coordinate
     *		(B must be "above" A)
     *
     * @param P Point the point to test against
     * @return boolean indicating if the segment intersects the ray cast from point P to the right, to positive infinity
     */
    testRayCast(P) {
        // validate once - at the beginning, then use direct variable access
        this.validateProperties();

        const x = P.x;
        const y = (Geom.epsilonEqual(P.y, this._miny) || Geom.epsilonEqual(P.y, this._maxy)) ? P.y + Geom.EPSILON : P.y;

        if (y <= this._low.y || y > this._high.y || x >= this._maxx) {
            return false;
        }   else if (x < this._minx) {
            return true;
        }   else {
            return (y - this._low.y) / (x - this._low.x) > this._slope;
        }
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Transformations

    /**
     * Applies a matrix transformation to the point
	 *
	 * @param matrix {Matrix}
     * @return {Segment}
     */
    transform( matrix )
    {
        this._a = matrix.transformPoint(this._a);
        this._b = matrix.transformPoint(this._b);
        this.invalidate();
        
        return this;
    }

    /**
	 * mirror the vertices horizontally, relative to the indicated X coordinate
     * @param xRef {number}
     * @return {Segment}
     */
    mirrorHorizontally(xRef)
    {
        this._a.mirrorHorizontally(xRef);
        this._b.mirrorHorizontally(xRef);
        this.invalidate();

        return this;
    }

    /**
     * mirror the vertices vertically relative to a horizontal axis placed at the Y coordinate
     * @param yRef {number}
     * @return {Segment}
     */
    mirrorVertically(yRef)
    {
        this._a.mirrorVertically(yRef);
        this._b.mirrorVertically(yRef);
        this.invalidate();

        return this;
    }

    /**
     * moves the segment by the specified distance
	 * @param x {number}
	 * @param y {number}
     * @return {Segment}
     */
    translate( x, y )
    {
        this._a.x += x;
        this._a.y += y;
        this._b.x += x;
        this._b.y += y;
        this.invalidate();

        return this;
    }

    /**
     * translate along the Ox axis
	 * @param x {number}
     * @return {Segment}
     */
    translateX(x)
    {
        this._a.x += x;
        this._b.x += x;
        this.invalidate();

        return this;
    }

    /**
     * translate along the OY axis
	 * @param y {number}
     * @return {Segment}
     */
    translateY(y)
    {
        this._a.y += y;
        this._b.y += y;
        this.invalidate();

        return this;
    }

    /**
	 * Rotates the entire segment a certain angle relative to the given origin
     * @param angle {number}
     * @param origin {Point}
     * @return {Segment}
     */
    rotate(angle, origin)
    {
        this._a = Geom.rotatePoint( origin, this._a, angle );
        this._b = Geom.rotatePoint( origin, this._b, angle );
        this.invalidate();

        return this;
    }

    /**
	 * reposition the start of the Segment to the given coordinates
     * @param x {number}
     * @param y {number}
     * @return {Segment}
     */
    startFrom(x, y)		{
        this.translate( x-this.a.x, y-this.a.y );
        return this;
    }

    /**
     * @param p {Point}
     * @return {Segment}
     */
    startFromPoint(p)	{
        this.startFrom( p.x, p.y );
        return this;
    }

    /**
     * change the length of the segment while keeping A in the same position
	 * @param toLength {number}
     */
    normalize( toLength=1 )
    {
        let k = toLength / this.length;
        this.b.x = this.a.x + ( this.b.x - this.a.x ) * k;
        this.b.y = this.a.y + ( this.b.y - this.a.y ) * k;
        this.invalidate();

        return this;
    }
    /**
     * change the length of the segment while keeping B in the same position
     */
    normalizeStart(toLength=1)
    {
        let k = toLength / this.length;
        this.a.x = this.b.x + ( this.a.x - this.b.x ) * k;
        this.a.y = this.b.y + ( this.a.y - this.b.y ) * k;
        this.invalidate();

        return this;
    }

    /**
     * Reverse the ray direction
     */
    reverse() {
        const tmp = this._a;
        this._a = this._b;
        this._b = tmp;

        return this;
    }

    /**
     * sort so that A < B, when the segment is horizontal
     */
    sortHoriz() {
        if (this.isHorizontal && this._a.x>this._b.x) {
            const tmp = this._a;
            this._a = this._b;
            this._b = tmp;
        }
    }

    /**
     * sort so that A < B, when the segment is vertical
     */
    sortVert() {
        if (this.isVertical && this._a.y>this._b.y) {
            const tmp = this._a;
            this._a = this._b;
            this._b = tmp;
        }
    }


    /**
     * @return {Segment}
     */
    clone(includeNormals=true)
    {
        if (this.isType(Segment.CURVE_CLASS_TYPE)) {
            throw new Error('Can\'t call CurvedSegment.clone() directly in the super class.');
        }

        const copy = new Segment( new Point(this.a.x, this.a.y), new Point(this.b.x, this.b.y) );

        if (includeNormals && this._inNormal && this._outNormal) {
            copy._inNormal  = this._inNormal.clone(false);
            copy._outNormal = this._outNormal.clone(false);
        }

        return copy;
    }

    /**
     * @return {string}
     */
    toString()
    {
        return 'Segment['+this._a+', '+this._b+']=('+this.length.toFixed(2)+'m)';
    }

    /**
     * @param v {Array.<Segment>}
     * @return {Array.<Segment>}
     */
    static deepCopy(v) {
        if ( !v )
            return null;
        
        let copy=[], i;
        for (i=0; i<v.length; ++i) {
            copy.push( v[i].clone() );
        }

        return copy;
    }
}