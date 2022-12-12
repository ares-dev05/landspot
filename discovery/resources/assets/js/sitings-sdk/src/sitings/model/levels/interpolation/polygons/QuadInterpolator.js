import AbstractInterpolator from './AbstractInterpolator';
import InterpolateResult from '../InterpolateResult';
import Geom from '../../../../../utils/Geom';
import Point from '../../../../../geom/Point';
import Triangle from '../../../../../geom/Triangle';
import Polygon from '../../../../../geom/Polygon';

export default class QuadInterpolator extends AbstractInterpolator{

	/**
	 * Mapping from physical coordinates to the logical space. In the logical space, the quad becomes a square.
	 * The mapping functions are defined as:
	 *	X = α1 + α2*l + α3*m +α4*l*m
	 *	Y = β1 + β2*l + β3*m +β4*l*m
	 *	where X -> l, Y -> m
	 *
	 *			[ 1  0  0  0 ]
	 * ALPHAS = |-1  1  0  0 | * X
	 * BETAS  = |-1  0  0  1 | * Y
	 *			[ 1 -1  1 -1 ]
	 */

	static get VERBOSE() {return false;}

	constructor (points) {
		super(points);

		// cached Vertices
		/**
		 * @type {?LotPointModel}
		 * @private
		 */
		this.a = null;

		/**
		 * @type {?LotPointModel}
		 * @private
		 */
		this.b = null;

		/**
		 * @type {?LotPointModel}
		 * @private
		 */
		this.c = null;

		/**
		 * @type {?LotPointModel}
		 * @private
		 */
		this.d = null;

		// cached vertex values
		/**
		 * @type {?number}
		 * @private
		 */
		this.qa = null;

		/**
		 * @type {?number}
		 * @private
		 */
		this.qb = null;

		/**
		 * @type {?number}
		 * @private
		 */
		this.qc = null;

		/**
		 * @type {?number}
		 * @private
		 */
		this.qd = null;

		// the parameters that convert from physical to logical space. alphas for the X axis, betas for the Y axis
		/**
		 * @type {*[]}
		 * @private
		 */
		this.alpha = [];

		/**
		 * @type {*[]}
		 * @private
		 */
		this.beta = [];

		// coefficients for the quadratic equation that we use to solve the real -> logical conversion on the M axis
		/**
		 * @type {?number}
		 * @private
		 */
		this.aCoeff = null;

		/**
		 * @type {?number}
		 * @private
		 */
		this.bPartial = null;

		/**
		 * @type {?number}
		 * @private
		 */
		this.cPartial = null;

		this.cacheParameters();
	}

	/**
	 * Analyzes a point's position relative to the quad, and interpolates it if the point is contained within the quad.
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordinate of the point
	 * @return {InterpolateResult} .contained is true if the point is a part of this polygon.
	 * @public
	 */
	analyze(x, y) {
		/**	Convert to Logical coordinates. In this space, the quad is mapped to a 1 x 1 square, looking like this:
				D---C
				|	|
				A---B
		 */
		const l = this.toLogicalCoordinates(x, y);
		const result = new InterpolateResult();

		/** @Interpolate: calculate the value at the point using billinear interpolation in the 1 x 1 square */
		result.value = (1 - l.y) * (this.qa * (1 - l.x) + this.qb * l.x) + l.y * (this.qd * (1 - l.x) + this.qc * l.x);

		/** @CollisionTest: check if the point coordinates are between [0, 1] in the logical coordinate space */
		result.contained = Geom.between(l.x, 0, 1) && Geom.between(l.y, 0, 1);

		return result;
	}

	/**
	 * Interpolates from the existing points and returns the value at position (x,y)
	 * @param x {number} X coordinate of the point to interpolate
	 * @param y {number} Y coordinate of the point to interpolate
	 * @return Number the interpolated value at the indicated position
	 * @public
	 */
	interpolate(x, y) {
		/**	Convert to Logical coordinates. In this space, the quad is mapped to a 1 x 1 square, looking like this:
				D---C
				|	|
				A---B
		 */

		const l = this.toLogicalCoordinates(x, y);

		/** @Solution: Interpolate in the logical [0,1] x [0,1] space grid. Because our rectangle is unitary, the interpolation is simplified.
				We use the two-step interpolation: first interpolate to two auxiliary points (interpolates by X),
				then between these two points (interpolate by Y). The general formula used is found here:
		 * https://wikimedia.org/api/rest_v1/media/math/render/svg/e62d0c5e655663e9ddf4793005557c54b2e4f2d6
					https://en.wikipedia.org/wiki/Bilinear_interpolation
					http://expert-kits.ru/PAGE_BiLinearInterpolation.php?lang=EN
				The formula has been reduced to the 1 x 1 grid
		 */

		return (1 - l.y) * (this.qa * (1 - l.x) + this.qb * l.x) + l.y * (this.qd * (1 - l.x) + this.qc * l.x);
	}

	/**
	 * Detects if a point is contained in the current polygon
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordonate of the point
	 * @returns Boolean true if the point is a part of this polygon.
	 * @public
	 */
	contains(x, y) {
		/** Check if the logical coordinates of this point are in the 1 x 1 square */
		const l = this.toLogicalCoordinates(x, y);

		return Geom.between(l.x, 0, 1) && Geom.between(l.y, 0, 1);
	}


	/**
	 * @param point {Point}
	 * @return {number}
	 */
	distanceFrom(point) {
		return this.distanceFromCoords(point.x, point.y);
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @return {number}
	 */
	distanceFromCoords(x, y) {
		if (!this.face) {
			/**
			 * @type {Polygon}
			 */
			this.face = Polygon.from(this.points.map(point => point.position));
		}

		return this.face.distanceFromCoords(x, y);
	}

	/**
	 * prepare caches & pre-calculations
	 * @private
	 */
	cacheParameters() {
		this.a = this.points[0].position;
		this.b = this.points[1].position;
		this.c = this.points[2].position;
		this.d = this.points[3].position;
		this.qa	= this.points[0].height;
		this.qb	= this.points[1].height;
		this.qc	= this.points[2].height;
		this.qd	= this.points[3].height;

		this.alpha= [
			0,	// pad so we can have 1-indexing
			this.a.x,
			-this.a.x + this.b.x,
			-this.a.x + this.d.x,
			this.a.x - this.b.x + this.c.x - this.d.x
		];
		this.beta = [
			0,	// pad so we can have 1-indexing
			this.a.y,
			-this.a.y + this.b.y,
			-this.a.y + this.d.y,
			this.a.y - this.b.y + this.c.y - this.d.y
		];

		// calculate the coefficients (or their partial, constant values)
		// @INFO: if aCoeff=0, the equation becones B*m + C = 0
		this.aCoeff	 = this.alpha[4] * this.beta[3] - this.alpha[3] * this.beta[4];
		this.bPartial = this.alpha[4] * this.beta[1] - this.alpha[1] * this.beta[4] + this.alpha[2] * this.beta[3] - this.alpha[3] * this.beta[2];
		this.cPartial = this.alpha[2] * this.beta[1] - this.alpha[1] * this.beta[2];
	}

	/**
	 *	This function maps the irregular quad to a 1 x 1 square, so that we can perform billinear interpolation.
	 *		The general method for the mapping is taken from here:
	 *			https://www.particleincell.com/2012/quad-interpolation/
	 *		Our algorithm expands on this method by handling special cases and considering both solutions of the quadratic equation.
	 *
	 * @param x {number} the X coordinate of a point located in the same pysical space that A, B, C, D are a part of
	 * @param y {number} the Y coordinate of a point located in the same pysical space that A, B, C, D are a part of
	 * @return {Point} the (l,m) position resulted from the (x,y)->(l,m) mapping done using the A,B,C,D -> 1 x 1 mapping
	 */
	toLogicalCoordinates(x, y) {
		/** @Exception: solve the case when α2 + α4 * M = 0. Part 1. α2=α4=0 */
		if (Geom.equal(this.alpha[2], 0) && Geom.equal(this.alpha[4], 0))
			return this.toLogical_solveMdetX(x, y);

		/** @Exception: solve the case when A = 0, making M's equation linear instead of quadratic */
		if (Geom.equal(this.aCoeff, 0))
			return this.toLogical_solveMEquationLinear(x, y);

		/** @GeneralCase: solve M's quadratic equation and calculate L from it */
		return this.toLogical_solveMEquationQuadratic(x, y);
	}

	/**
	 * @INFO: solve the case when X is only determined by M and not by L (this basically leads to an axis rotation?)
	 *	i.e., when α2 + α4M = 0, cancelling out L
	 * @param x {number}
	 * @param y {number}
	 * @private
	 */
	toLogical_solveMdetX(x, y) {
		/*
			L = ( y*a3 - b1*a3 - b3*x + b3*a1 ) / ( b2*a3+b4*x-b4*a1 )
			M = ( x - a1 ) / a3
		*/

		// @TODO: do we need to check if [beta[4]*x + beta[2]*alpha[3] - beta[4]*alpha[1]] == 0 ??
		let L;
		let M;

		L = (this.alpha[3] * (y - this.beta[1]) + this.beta[3] * (this.alpha[1] - x)) / (this.beta[4] * x + this.beta[2] * this.alpha[3] - this.beta[4] * this.alpha[1]);
		M = (x - this.alpha[1]) / this.alpha[3];

		return new Point(L, M);
	}

	/**
	 * @INFO: solve the case when A (the coefficient of M^2) is 0, making the M equation linear, with M = -b / c
	 * @return Point
	 * @private
	 */
	toLogical_solveMEquationLinear(x, y) {
		/*	In	A*m^2 + B*m + C = 0, when A = 0, the equation becomes:
				B*m + C = 0, with the solution:

			M = -C / B
			L = ( x - a1 - a3*m ) / ( a2 + a4*m )
				OR
		*/
		let B;
		let C;
		let L;
		let M;

		// calculate the B & C coefficients
		B = this.bPartial + x * this.beta[4] - y * this.alpha[4];
		C = this.cPartial + x * this.beta[2] - y * this.alpha[2];

		// solve for M first
		M = -C / B;

		// check if we can solve for L from the X equation;
		//	if we can't, we don't try to solve it from Y's equation because we just used an undefined term (L) in Y's equation
		if (Geom.equal(this.alpha[2] + this.alpha[4] * M, 0))
			return this.toLogical_solveMdetX(x, y);

		// solve L
		L = (x - this.alpha[1] - this.alpha[3]*M) / (this.alpha[2] + this.alpha[4] * M);

		return new Point(L, M);
	}

	/**
	 * @INFO: solve the general case, of M's equation being quadratic
	 * @private
	 */
	toLogical_solveMEquationQuadratic(x, y) {
		/*	quadratic equation coeffs, A*m^2 + B*m + C = 0
			A = a(4)*b(3) - a(3)*b(4);
			B = a(4)*b(1) - a(1)*b(4) + a(2)*b(3) - a(3)*b(2) + x*b(4) - y*a(4);
			C = a(2)*b(1) - a(1)*b(2) + x*b(2) - y*a(2);
		*/

		// complete the coeffs and solve the quadratic equation
		let A;
		let B;
		let C;
		let DET;
		let m1;
		let m2;
		let l1;
		let l2;
		let d1;
		let d2;

		A = this.aCoeff;
		B = this.bPartial + x * this.beta[4] - y * this.alpha[4];
		C = this.cPartial + x * this.beta[2] - y * this.alpha[2];

		// calculate the equation's determinant: det = sqrt( B^2 - 4*A*C);
		DET	= Math.sqrt(B * B - 4 * A * C);

		// compute m = (-b ± sqrt(b^2-4ac)) / ( 2a )
		m1 = (-B + DET) / (2 * A);
		m2 = (-B - DET) / (2 * A);

		// compute the two options for L: L = ( x - a(1) - a(3)*m ) / ( a(2) + a(4)*m );
		l1 = (x - this.alpha[1] - this.alpha[3] * m1) / (this.alpha[2] + this.alpha[4] * m1);
		l2 = (x - this.alpha[1] - this.alpha[3] * m2) / (this.alpha[2] + this.alpha[4] * m2);

		/** @Exception: if L2 is undefined, try to return L1 */
		if (Geom.isUndefined(l2)) {
			/** @Exception: if both solutions are undefined, solve the liniar case*/
			if (Geom.isUndefined(l1))
				return this.toLogical_solveMdetX(x, y);

			/** @INFO: just return L1 in this case */
			return new Point(l1, m1);
		}

		/** @Exception: if L1 is undefined, return L2; don't check for both again as we did that already */
		if (Geom.isUndefined(l1)) {
			return new Point(l2, m2);
		}

		/** @GeneralCase - if (L1,M1) is in the [0,1] x [0,1] square, return this solution */
		if (Geom.between(m1, 0, 1) && Geom.between(l1, 0, 1)) {
			return new Point(l1, m1);
		}

		/** @GeneralCase - if (L2,M2) is in the [0,1] x [0,1] square, return this solution */
		if (Geom.between(m2, 0, 1) && Geom.between(l2, 0, 1)) {
			return new Point(l2, m2);
		}

		/** @Exception: if both points are outside of the 1x1 square, return the point that's closest to it */
		d1 = (l1 - 0.5) * (l1 - 0.5) + (m1 - 0.5) * (m1 - 0.5);
		d2 = (l2 - 0.5) * (l2 - 0.5) + (m2 - 0.5) * (m2 - 0.5);

		if (d1 < d2) {
			return new Point(l1, m1);
		}	else {
			return new Point(l2, m2);
		}
	}
}