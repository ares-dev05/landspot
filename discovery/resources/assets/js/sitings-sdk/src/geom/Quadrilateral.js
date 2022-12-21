import ChangeDispatcher from "../events/ChangeDispatcher";
import Geom from "../utils/Geom";
import Triangle from "./Triangle";
import Point from "./Point";


export default class Quadrilateral extends ChangeDispatcher {

	/**
	 * @param a {Point}
	 * @param b {Point}
	 * @param c {Point}
	 * @param d {Point}
	 * @param isRectangle {boolean}
	 * @param context {*}
	 */
	constructor(a, b, c, d, isRectangle=false, context=null)
	{
		super(context);

		/**
		 * @type {Point}
		 * @private
		 */
		this._a = a;
		/**
		 * @type {Point}
		 * @private
		 */
		this._b = b;
		/**
		 * @type {Point}
		 * @private
		 */
		this._c = c;
		/**
		 * @type {Point}
		 * @private
		 */
		this._d = d;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isRectangle = false;

		/**
		 * @type {number}
		 */
		this._area = 0;

		this.updateArea();
	}

	get a() { return this._a; }
	get b() { return this._b; }
	get c() { return this._c; }
	get d() { return this._d; }

	/**
	 * width is considered to be the a->b(=c->d) meters, even if a->c(=b->d) is longer
	 */
	get width () { return Geom.segmentLength( this.a.x, this.a.y, this.b.x, this.b.y ); }
	get height() { return Geom.segmentLength( this.a.x, this.a.y, this.c.x, this.c.y ); }

	get ab() { return this.width ; }
	get cd() { return this.width ; }
	get ac() { return this.height; }
	get bd() { return this.height; }

	get area() { return this._area; }

	/**
	 * @param delta {Point}
	 */
	translate( delta )
	{
		this._a = this._a.add( delta );
		this._b = this._b.add( delta );
		this._c = this._c.add( delta );
		this._d = this._d.add( delta );
	}

	updateArea()
	{
		if ( this._isRectangle ) {
			this._area = this.ab * this.cd;
		}	else {
			this._area = ( new Triangle( this.a, this.b, this.c ) ).area +
				( new Triangle( this.a, this.c, this.d ) ).area;
		}
	}

	/**
	 * contains
	 * returns true if the <p> point is contained in the rectangle
	 * @param p {Point} the point for which the test is ran
	 * @return {boolean}
	 */
	contains(p)
	{
		// for faster debugging, run just one test -> the area test, which is universal
		return this._containsAreaTest(p);
	}

	/**
	 * _containsDistanceTest
	 * returns true if the <p> point is contained in the rectangle. runs the distance test
	 * @param p {Point} the point for which the test is ran
	 * @return {boolean}
	 */
	_containsDistanceTest( p )
	{
		// will return false on the first distance that places the point outside the rectangle
		return (
			Geom.pointToSegmentDistance( p.x, p.y, this.a.x, this.a.y, this.b.x, this.b.y ) <= this.ac &&
			Geom.pointToSegmentDistance( p.x, p.y, this.c.x, this.c.y, this.d.x, this.d.y ) <= this.ac &&
			Geom.pointToSegmentDistance( p.x, p.y, this.a.x, this.a.y, this.c.x, this.c.y ) <= this.ab &&
			Geom.pointToSegmentDistance( p.x, p.y, this.b.x, this.b.y, this.d.x, this.d.y ) <= this.ab
		);
	}

	/**
	 * returns true if the <p> point is contained in the rectangle. runs the quadrilater area test
	 * @param p {Point}
	 * @return {boolean}
	 * @private
	 */
	_containsAreaTest(p)
	{
		let pArea =
			( new Triangle( p, this.a, this.b ) ).area +
			( new Triangle( p, this.b, this.c ) ).area +
			( new Triangle( p, this.c, this.d ) ).area +
			( new Triangle( p, this.d, this.a ) ).area;

		// if the area of the triangles defined by P is smaller than or equal to the area of the quadrilater,
		// the point is inside of it. Otherwise, it is outside
		return pArea <= this.area + Geom.TOLERANCE;
	}

	toString()
	{
		return "Q("+this.a+","+this.b+","+this.c+","+this.d+")";
	}

	/**
	 * getLineNormalExclusionArea
	 * @param m {Point} the first point of the delimiting line
	 * @param n {Point} the second point of the delimiting line
	 * @param normal {Segment} the normal on the semiline that indicates the direction of the exclusion area
	 * @param areaSize {number} the size to be used in generating the (width/height) of the rectangle
	 * @return {Quadrilateral} a pseudo-semiplane demilited by the [a,b] line and containing the normal
	 */
	static getLineNormalExclusionArea(m, n, normal, areaSize=5000.0, extendA=true, extendB=true)
	{
		// throw new Error("X");
		// Logger.log("Quadrilater.getRectFrom:\n\t"+m+","+n+","+normal);

		let a, b, c, d,
			mn = Geom.segmentLength( m.x, m.y, n.x, n.y ),
			wk = areaSize/mn*.5,
			ncopy;

		a = extendA ? Geom.interpolatePoints(m, n, -wk + .5) : m;
		b = extendB ? Geom.interpolatePoints(m, n, +wk + .5) : n;

		// calculate C as normal[meters=areaSize] from A
		// normal.a does not have to be on [MN]; the only condition is that [normal.a,normal.b] is perpendicular on [MN]
		ncopy = normal.clone();
		ncopy.startFrom( b.x, b.y );
		ncopy.normalize( areaSize );
		c = ncopy.b.clone();

		// calculate D as normal[meters=areaSize] from B
		// normal.a does not have to be on [MN]; the only condition is that [normal.a,normal.b] is perpendicular on [MN]
		ncopy.startFrom( a.x, a.y );

		// no need to normalize as meters is already
		d = ncopy.b.clone();

		// the returned quadrilater is a rectangle
		return new Quadrilateral( a, b, c, d, true );
	}

	/**
	 * @param o {Point}
	 * @param m {Point}
	 * @param n {Point}
	 * @return {Quadrilateral}
	 */
	static getRectangleExclusionArea( o, m, n )
	{
		// @TODO
		return null;
	}
}