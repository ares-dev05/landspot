// the most basic unit of one easement. a segment cannot be divided
import Segment from "../../../geom/Segment";
import Geom from "../../../utils/Geom";

export default class InnerSegment extends Segment // implements IExcludingEdge
{
	/**
	 * @param farA {Point}
	 * @param farB {Point}
	 */
	constructor(farA, farB )
	{
		super(farA.clone(), farB.clone());

		/**
		 * @type {Point}
		 * @private
		 */
		this._farA = farA;

		/**
		 * @type {Point}
		 * @private
		 */
		this._farB = farB;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._fullExclusion = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._hasLCollision = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._hasRCollision = false;

		// flags that work in connection with applyExclusion; set to true when A or B are reduced

		/**
		 * @type {boolean}
		 * @private
		 */
		this._hideIfNotReduced = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._aReduced = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._bReduced = false;
	}

	/**
	 * @return {boolean}
	 */
	get fullExclusion() { return this._fullExclusion; }

	/**
	 * @param v {boolean}
	 */
	set fullExclusion(v) { this._fullExclusion=v; }

	/**
	 * @return {boolean}
	 */
	get aReduced() { return this._aReduced; }
	/**
	 * @return {boolean}
	 */
	get bReduced() { return this._bReduced; }

	/**
	 * @return {boolean}
	 */
	get hideIfNotReduced() { return this._hideIfNotReduced; }
	/**
	 * @param v {boolean}
	 */
	set hideIfNotReduced(v) { this._hideIfNotReduced=v; }

	/**
	 * @return {Point}
	 */
	get farA() { return this._farA; }

	/**
	 * @return {Point}
	 */
	get farB() { return this._farB; }

	/**
	 * @param v {Point}
	 */
	set farA(v) {
		this._farA	= v;
		this.a		= v.clone();
	}
	/**
	 * @param v {Point}
	 */
	set farB(v) {
		this._farB	= v;
		this.b		= v.clone();
	}

	/**
	 * @return {boolean}
	 */
	get hasLCollision() { return this._hasLCollision; }

	/**
	 * @return {boolean}
	 */
	get hasRCollision() { return this._hasRCollision; }

	/**
	 * @return {number}
	 */
	get farLength() { return Geom.segmentLength( this.farA.x, this.farA.y, this.farB.x, this.farB.y ); }


	/**
	 * @param toLength {number}
	 */
	normalize( toLength=1 )
	{
		super.normalize( toLength );

		this._farA	= this.a.clone();
		this._farB	= this.b.clone();
	}

	/**
	 * @param toLength {number}
	 */
	normalizeStart( toLength=1 )
	{
		super.normalizeStart( toLength );

		this._farA	= this.a.clone();
		this._farB	= this.b.clone();
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	translate(x,y)
	{
		this._farA.x += x;
		this._farA.y += y;
		this._farB.x += x;
		this._farB.y += y;
	}

	commitExclusions()
	{
		this._farA = this.a.clone();
		this._farB = this.b.clone();

		this._aReduced =
		this._bReduced = false;
	}

	resetExclusions()
	{
		this.a.x = this._farA.x;
		this.a.y = this._farA.y;
		this.b.x = this._farB.x;
		this.b.y = this._farB.y;

		this._aReduced =
		this._bReduced =
		this._fullExclusion = false;

		this._hasLCollision =
		this._hasRCollision = false;
	}

	/**
	 * @param edge {*}	should be of type IExcludingEdge
	 */
	applyLeftExclusion(edge)
	{
		let i, bestDist, crtp, crtDist, segment;
		bestDist = Geom.segmentLength( this.a.x, this.a.y, this.b.x, this.b.y );

		for (i=0; i<edge.excludingSegments.length; ++i) {
			segment	= edge.excludingSegments[i];
			crtp	= Geom.segmentIntersectionCoords(
				segment.a.x, segment.a.y, segment.b.x, segment.b.y,
				this.a.x, this.a.y, this.b.x, this.b.y
			);

			if (crtp) {
				crtDist = Geom.segmentLength( crtp.x, crtp.y, this.b.x, this.b.y );

				if (crtDist < bestDist) {
					this.a.x = crtp.x;
					this.a.y = crtp.y;
					bestDist = crtDist;
					this._hasLCollision = true;
				}
			}
		}
	}

	/**
	 * @param edge {*} should be of type IExcludingEdge
	 */
	applyRightExclusion(edge)
	{
		let i, bestDist, crtp, crtDist, segment;
		bestDist = Geom.segmentLength(this.a.x, this.a.y, this.b.x, this.b.y);

		for (i=0; i<edge.excludingSegments.length; ++i)
		{
			segment	= edge.excludingSegments[i];

			crtp	= Geom.segmentIntersectionCoords(
				segment.a.x, segment.a.y, segment.b.x, segment.b.y,
				this.a.x, this.a.y, this.b.x, this.b.y
			);

			if (crtp) {
				crtDist = Geom.segmentLength( crtp.x, crtp.y, this.a.x, this.a.y );

				if ( crtDist < bestDist ) {
					this.b.x = crtp.x;
					this.b.y = crtp.y;
					bestDist = crtDist;
					this._hasRCollision = true;
				}
			}
		}
	}

	/**
	 * @param edge {*} type IExcludingEdge
	 */
	removeIfExcludedBy(edge)
	{
		if (edge.exclusionArea.contains(this.a) && edge.exclusionArea.contains(this.b)) {
			this.a.x = this.b.x;
			this.a.y = this.b.y;

			this._hasLCollision =
			this._hasRCollision = true;
		}
	}

	/**
	 * @param edge {*} type IExcludingEdge
	 * @param isConcaveCb {Function}
	 * @param context {*}
	 * @return {boolean}
	 */
	applyExclusion(edge, isConcaveCb=null, context=null)
	{
//		let isConcave = isConcaveCb!=null ? isConcaveCb( this.angle, edge.exclusionAngle ) : false;
		let isConcave = false;
		if (isConcaveCb!=null && context!=null) {
			isConcave = isConcaveCb.call(context, this.angle, edge.exclusionAngle);
		}	else if (isConcaveCb!=null || context!=null) {
			throw new Error(
				'Both \'isConcaveCb\' and \'context\' have to be' +
				'either specified or NULL: isConcave=' + isConcaveCb +
				'; context=' + context
			);
		}

		// make sure to determine if A or B have to be reduced, before
		// running the exclusions on them. Otherwise, the reduction of one might determine the reduction of
		// the other point, creating excluded segments with meters=0
		let reduceA =
				( !isConcave && edge.exclusionArea.contains( this.a ) ) ||
				(  isConcave && edge.exclusionArea.contains( this.b ) ),
			reduceB =
				(  isConcave && edge.exclusionArea.contains( this.a ) ) ||
				( !isConcave && edge.exclusionArea.contains( this.b ) ),
			// flag that marks if this edge has been reduced or not by the current exclusion
			reduced = false;

		let i, bestDist, crtp, crtDist, segment;

		// check for exclusions applied to a
		if (reduceA) {
			bestDist = Geom.segmentLength( this.a.x, this.a.y, this.b.x, this.b.y );

			for (i=0; i<edge.excludingSegments.length; ++i) {
				segment	= edge.excludingSegments[i];
				crtp	= Geom.segmentIntersectionCoords(
					segment.a.x, segment.a.y, segment.b.x, segment.b.y,
					this.a.x, this.a.y, this.b.x, this.b.y
				);

				if (crtp) {
					crtDist = Geom.segmentLength( crtp.x, crtp.y, this.b.x, this.b.y );

					if ( crtDist < bestDist ) {
						this.a.x = crtp.x;
						this.a.y = crtp.y;
						bestDist = crtDist;
						reduced  = true;
						this._aReduced = true;
					}
				}
			}
		}

		// check for exclusions applied to b
		if ( reduceB ) {
			bestDist = Geom.segmentLength( this.a.x, this.a.y, this.b.x, this.b.y );

			for (i=0; i<edge.excludingSegments.length; ++i) {
				segment	= edge.excludingSegments[i];
				crtp	= Geom.segmentIntersectionCoords(
					segment.a.x, segment.a.y, segment.b.x, segment.b.y,
					this.a.x, this.a.y, this.b.x, this.b.y
				);

				if (crtp) {
					crtDist = Geom.segmentLength( crtp.x, crtp.y, this.a.x, this.a.y );
					if ( crtDist < bestDist )
					{
						this.b.x = crtp.x;
						this.b.y = crtp.y;
						bestDist = crtDist;
						reduced  = true;
						this._bReduced = true;
					}
				}
			}
		}

		return reduced;
	}
}