import Point from "./Point";

/**
 * Defines a Curved Segment as a Cubic Bezier
 */
import Segment from "./Segment";
import Geom from "../utils/Geom";

/**
 * Defines a Curved Segment as a Cubic Bezier
 */
export default class CurvedSegment extends Segment
{
    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return Segment.CURVE_CLASS_TYPE; };
    /**
     * @param type {string}
     * @return {boolean}
     */
    isType(type) { return type === CurvedSegment.CLASS_TYPE || super.isType(type); }

    /**
     * @param a {Point}
     * @param b {Point}
     * @param c1 {Point}
     * @param c2 {Point}
     */
	constructor(a, b, c1, c2)
	{
		super(a, b);

        /**
         * @type {Point}
         * @private
         */
		this._c1 = c1;
        /**
         * @type {Point}
         * @private
         */
        this._c2 = c2;
	}

	get c1() { return this._c1; }
	get c2() { return this._c2; }

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Curve area calculation
	//

	/**
	 * Mathematical calculation using the bezier coordinates.
	 * Reference: https://github.com/Pomax/bezierinfo/issues/44#issue-52286521
	 * @return {number}
	 */
	get area() {
		let a = this.a, b=this.b, c1=this.c1, c2=this.c2;
		return (
			   a.x * (       - 2*c1.y -   c2.y + 3*b.y)
			+ c1.x * ( 2*a.y          -   c2.y -   b.y)
			+ c2.x * (   a.y +   c1.y          - 2*b.y)
			+  b.x * (-3*a.y +   c1.y + 2*c2.y        )
		) * 3 / 20;
	}

	/**
	 * @TESTING - computational calculation by dividing the curve into a large number of small pieces
	 */
	get computationalArea() {
		let bx = this.bezierCoeffsX(),
			by = this.bezierCoeffsY(),
			vertices = [],
			area=0, i, t, A, B,
			SAMPLES = 500;

		// sample SAMPLES+1 points from the bezier curve
		for (i=0; i<=SAMPLES; ++i)
		{
			t = i/SAMPLES;
			vertices.push(new Point(
				bx[0]*t*t*t + bx[1]*t*t + bx[2]*t + bx[3],
				by[0]*t*t*t + by[1]*t*t + by[2]*t + by[3]
			));
		}

		// now calculate the area
		for (i=0; i<vertices.length; ++i) {
			A	  = vertices[i];
			B	  = vertices[(i+1)%vertices.length];
			area += A.x*B.y - A.y*B.x;
		}

		return Math.abs(area/2);
	}


	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// @REFACTOR
	//

    /**
     * @param B
     * @return {boolean}
     */
	intersects(B)
	{
		// return super.intersects(B);
		let points = this.computeIntersections(
			[B.a.x, B.b.x],			// line X
			[B.a.y, B.b.y]			// line Y
		);

		return !!(points && points.length > 0);
	}

    /**
     * @param B {Segment}
     * @return {Point}
     */
	getIntersection(B)
	{
		// return super.intersects(B);
		let points = this.computeIntersections(
			[B.a.x, B.b.x],			// line X
			[B.a.y, B.b.y]			// line Y
		);

		return (points && points.length>0) ? points[0] : null;
	}

    /**
     * @param P {Point}
     * @return {boolean}
     */
	testRayCast(P)
	{
		// @INFO: check the number of intersections that the ray has with this curve. IF 1 or 3, consider that it intersects
		// return super.testRayCast(P);

		// return super.intersects(B);
		let points = this.computeIntersections(
			[P.x, P.x+5000],	// line X
			[P.y, P.y]			// line Y
		);

		return !!(points && (points.length === 1 || points.length === 3));
	}

    /**
     * @param P0 {number}
     * @param P1 {number}
     * @param P2 {number}
     * @param P3 {number}
     * @return {Array}
     */
	static bezierCoeffs(P0, P1, P2, P3) {
		let Z = [];
		Z[0] = -P0 + 3*P1 - 3*P2 + P3;
		Z[1] = 3*P0 - 6*P1 + 3*P2;
		Z[2] = -3*P0 + 3*P1;
		Z[3] = P0;
		return Z;
	}

    /**
     * @OPTIMIZE: we want to cache these when the curve isn't translated/rotated etc.
     * @return {Array}
     */
	bezierCoeffsX() { return CurvedSegment.bezierCoeffs(this.a.x, this.c1.x, this.c2.x, this.b.x); }

    /**
     * @return {Array}
     */
	bezierCoeffsY() { return CurvedSegment.bezierCoeffs(this.a.y, this.c1.y, this.c2.y, this.b.y); }

    /**
     * @OPTIMIZE: Refactor this
     * Based on
     * 		https://www.particleincell.com/2013/cubic-line-intersection/
     * 		https://github.com/w8r/bezier-intersect/blob/master/src/cubic.js
     * 		https://docs.sencha.com/extjs/5.1.4/api/src/PathUtil.js.html
     *
     * @param a {number}
     * @param b {number}
     * @param c {number}
     * @param d {number}
     * @return {Array}
     */
	static cubicRoots(a, b, c, d)
	{
		let A=b/a,
		    B=c/a,
		    C=d/a,
		    Q, R, D, S, T, Im, t=[];

		Q = (3*B - Math.pow(A, 2))/9;
		R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
		D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

		// complex or duplicate roots
		if (D >= 0)
		{
			S = Geom.sign(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
			T = Geom.sign(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));

			t[0] = -A/3 + (S + T);                    // real root
			t[1] = -A/3 - (S + T)/2;                  // real part of complex root
			t[2] = -A/3 - (S + T)/2;                  // real part of complex root
			Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair

			/*discard complex roots*/
			if (Im !== 0)
			{
				t[1]=-1;
				t[2]=-1;
			}

		}
		else
		{
            // distinct real roots
			let th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));

			t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
			t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
			t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;

			// Im = 0.0;
		}

		/*discard out of spec roots*/
		for (let i=0;i<3;i++)
			if (t[i]<0 || t[i]>1.0) t[i]=-1;

		/*sort but place -1 at the end*/
		// t=sortSpecial(t);

		return t;
	}

	/**
	 * Intersection calculation
	 */

    /**
	 * computes intersection between a cubic spline and a line segment
     * @OPTIMIZE by caching repeating variables
     * @param lx {Array}
     * @param ly {Array}
     * @return {Array}
     */
	computeIntersections(lx, ly)
	{
		let solutions = [];
		let X = [];
		let A = ly[1] - ly[0]; // A=y2-y1
        let B = lx[0] - lx[1]; // B=x1-x2
        let C = lx[0] * (ly[0]-ly[1]) + ly[0] * (lx[1]-lx[0]);	// C=x1*(y1-y2)+y1*(x2-x1)

		let bx = this.bezierCoeffsX();
        let by = this.bezierCoeffsY();
        let P  = [];

		P[0] = A*bx[0]+B*by[0];		/*t^3*/
		P[1] = A*bx[1]+B*by[1];		/*t^2*/
		P[2] = A*bx[2]+B*by[2];		/*t*/
		P[3] = A*bx[3]+B*by[3] + C;	/*1*/

        let r = CurvedSegment.cubicRoots(P[0], P[1], P[2], P[3]);

		/*verify the roots are in bounds of the linear segment*/
		for (let i=0; i<3; i++)
		{
            let t = r[i];
			X[0]=bx[0]*t*t*t+bx[1]*t*t+bx[2]*t+bx[3];
			X[1]=by[0]*t*t*t+by[1]*t*t+by[2]*t+by[3];

			/*above is intersection point assuming infinitely long line segment,
			make sure we are also in bounds of the line*/
            let s;
			if ((lx[1]-lx[0])!==0)           /*if not vertical line*/
				s=(X[0]-lx[0])/(lx[1]-lx[0]);
			else
				s=(X[1]-ly[0])/(ly[1]-ly[0]);

			/*in bounds?*/
			if (t<0 || t>1.0 || s<0 || s>1.0) {
				X[0]=-100;  /*move off screen*/
				X[1]=-100;
			}
			else {
				solutions.push(new Point(X[0], X[1]));
			}
		}

		return solutions;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Transformations

    /**
     * @param matrix {Matrix}
     */
	transform(matrix)
	{
		this._c1 = matrix.transformPoint(this._c1);
        this._c2 = matrix.transformPoint(this._c2);
		super.transform(matrix);
	}

    /**
	 * moves the segment by the specified distance
     * @param x {number}
     * @param y {number}
     */
	translate(x, y)
	{
		this._c1.x += x;
        this._c1.y += y;
        this._c2.x += x;
        this._c2.y += y;
		super.translate(x, y);
	}
	/**
	 * translate along the Ox axis
	 * @param x {number}
	 */
	translateX(x)
	{
        this._c1.x += x;
        this._c2.x += x;
		super.translateX(x);
	}
	/**
	 * translate along the OY axis
	 * @param y {number}
	 */
	translateY(y)
	{
        this._c1.y += y;
		this._c2.y += y;
		super.translateY(y);
	}
	/**
	 * Rotates the entire segment a certain angle relative to the given origin
	 * @param angle {number}
	 * @param origin {Point}
	 */
	rotate(angle, origin)
	{
        this._c1 = Geom.rotatePoint( origin, this._c1, angle );
        this._c2 = Geom.rotatePoint( origin, this._c2, angle );
		super.rotate(angle, origin);
	}

	/**
	 * change the meters of the segment while keeping A in the same position
	 * @param toLength {number}
	 */
	normalize(toLength)
	{
		throw new Error("not implemented");
	}
	/**
	 * change the meters of the segment while keeping B in the same position
	 * @param toLength {number}
	 */
	normalizeStart(toLength=1)
	{
		throw new Error("not implemented");
	}

    /**
     * @return {CurvedSegment}
     */
	clone()
	{
		return new CurvedSegment(
			this.a.clone(),
			this.b.clone(),
			this.c1.clone(),
			this.c2.clone()
		);
	}

    /**
     * @return {string}
     */
	toString()
	{
		return "CurvedSegment["+this.a+", "+this.b+", C1 "+this.c1+"; C2 "+this.c2+"]";
	}
}