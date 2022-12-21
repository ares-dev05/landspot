/**
 * OutlineCurveModel
 *
 * defines a cubic Bezier curve that represents one edge of a path
 */
import LotEdgeModel from './LotEdgeModel';
import DisplayManager from '../../../utils/DisplayManager';
import Point from '../../../geom/Point';
import Geom from '../../../utils/Geom';
import LineDrawer from '../../render/LineDrawer';
import Utils from '../../../utils/Utils';
import Segment from '../../../geom/Segment';
import LotEdgeManipulator from './trace/LotEdgeManipulator';

export default class LotCurveModel extends LotEdgeModel {

	/**
	 * @param a {LotPointModel}
	 * @param length {number}
	 * @param angle {LotEdgeAngle}
	 * @param arcLength {number}
	 * @param radius {number}
	 * @param isCurve {boolean}
	 * @param canDelete {boolean}
	 * @param context {*}
	 */
	constructor(a, length, angle, arcLength, radius, isCurve, canDelete=true, context=null) {
		super(a, length, angle, canDelete, context);

		/**
		 * Calculated from the Chord meters and Radius
		 * @type {number}
		 * @private
		 */
		this._arcLength		= arcLength;
		/**
		 * radius in meters
		 * @type {number}
		 * @private
		 */
		this._radius		= radius;
		/**
		 * @type {number}
		 * @private
		 */
		this._radiusFt	= 0;

		/**
		 * Flag that indicates if the curve should be flipped
		 * @type {boolean}
		 * @private
		 */
		this._flipCurveDirection			= false;

		/**
		 * Center of the circle that this curve is defined on
		 * @type {Point}
		 * @private
		 */
		this._circleCenter	= new Point();

		/**
		 * The middle of the arc
		 * @type {Point}
		 * @private
		 */
		this._arcCenter		= new Point();

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isCurve		= isCurve;

		/**
		 * @type {LotEdgeModel}
		 * @private
		 */
		this._previousEdge	= null;

		/**
		 * Start angle from this curve, in radians.
		 * i.e. angle of the OA segment (where O is the centre of the circle this curve is on
		 * @type {number}
		 * @private
		 */
		this._startAngle	= 0;

		/**
		 * End angle from this curve, in radians.
		 * i.e. angle of the OB segment (where O is the centre of the circle this curve is on
		 * @type {number}
		 * @private
		 */
		this._endAngle		= 0;

		/**
		 * Flag that indicates if the edge is curved towards the inside or outside of the lot
		 * @type {boolean}
		 * @private
		 */
		this._curvedInwards	= false;

		this.recalculateParams();
	}

	get curveMidpoint() { return this._arcCenter; }

	get isCurve() { return this._isCurve; }
	set isCurve(v) { this._isCurve=v; this.onChange(); }

	/**
	 * For the curve to be valid, the diameter of the circle cannot be smaller than the Chord length,
	 * 	  because that creates an impossible curve on the respective circle
	 * @return {boolean}
	 */
	get isInvalidCurve() { return this.radius * 2 < this.length; }

	/**
	 * @return {boolean}
	 */
	get curvedInwards() { return this._curvedInwards; }

	/**
	 * the arc meters for the curve
	 */
	get arcLength() { return this._arcLength; }

	/**
	 * the radius of the circle that this curve is a part of
	 */
	get radius() { return this._radius; }
	set radius(v) {
		this._radius	= v;
		this._radiusFt	= DisplayManager.metersToFeet(this._radius);

		this.onChange();
	}

	get radiusFt() { return this._radiusFt; }
	set radiusFt(feet) {
		this._radiusFt	= feet;
		this._radius	= DisplayManager.feetToMeters(this._radiusFt);

		this.onChange();
	}

	/**
	 * Flip the orientation of the curve. This toggles the centre of the circle this Curve
	 * 	is a part of to opposite sides of the segment
	 */
	get flipCurveDirection() { return this._flipCurveDirection; }
	set flipCurveDirection(v) { this._flipCurveDirection=v; this.onChange(); }


	manipulateScale(scale)
	{
		this.radius *= scale;
		super.manipulateScale(scale);
	}

	/**
	 * @return {Point} the center of the Curve, as defined from the radius, end points (a+b) and distance
	 */
	get curveCenter()	{ return this._circleCenter; }

	/**
	 * The start angle of the curve, in radians
	 * @return {number}
	 */
	get aAngle()		{ return this._startAngle; }

	/**
	 * The end angle of the curve, in radians
	 * @return {number}
	 */
	get bAngle()		{ return this._endAngle; }

	/**
	 * @returns {Point}
	 */
	getSegmentCenter() {
		if ( !this.isCurve || this.isInvalidCurve ) {
			return super.getSegmentCenter();
		}	else {
			return this._arcCenter;
		}
	}

	// called automatically during every call of onChange()
	recalculateParams()
	{
		super.recalculateParams();

		if ( !this.isCurve ) return;

		let // c is the center of circle that this curve is on
			c		= new Point(),
			// p -> half perimeter of the triangle formed by the center of the circle and the two ends of the curve
			p		= ( this.radius+this.radius+this.length) * .5,
			// area of the ABC triangle. Heron's formula is used
			area	= Math.sqrt( p * (p-this.radius) * (p-this.radius) * (p-this.length) ),
			// distance between the the center of the circle and the AB segment
			cHeight	= Math.abs(2 * area / this.length);

		// C's coordinates in a system where A is the origin, and AB is the 0X axis
		c.x	= this.length / 2;
		c.y	= this._flipCurveDirection ? -cHeight : cHeight;

		// rotate C around the origin
		c = Geom.rotatePointCoords(0, 0, c.x, c.y, this.angleController.radians);

		// displace C with A
		c.x += this.a.x;
		c.y += this.a.y;

		// save the new coordinates to the center
		this._circleCenter.x = c.x;
		this._circleCenter.y = c.y;

		// calculate the A & B angles
		this._startAngle = Geom.norm( Geom.angleBetween( c.x, c.y, this.a.x, this.a.y ) );
		this._endAngle   = Geom.norm( Geom.angleBetween( c.x, c.y, this.b.x, this.b.y ) );

		if ( this._startAngle > this._endAngle ) {
			let aux		 = this._startAngle;
			this._startAngle = this._endAngle;
			this._endAngle = aux;
		}
		if ( this._endAngle - this._startAngle > Math.PI ) {
			this._endAngle -= Math.PI * 2;
		}

		// calculate the midpoint
		let midAngle = ( this.bAngle + this.aAngle ) * .5;

		this._arcCenter.x = this.curveCenter.x + Math.cos( midAngle ) * this.radius;
		this._arcCenter.y = this.curveCenter.y + Math.sin( midAngle ) * this.radius;

		// calculate the arc meters
		let curveOpening = Math.abs( this._endAngle-this._startAngle );
		if ( curveOpening > Geom.TOLERANCE ) {
			this._arcLength = this.radius * curveOpening;
		}
	}

	/**
	 * roughTriangleSurface
	 * 	- returns the surface of the (A,B,mid(ARC)) triangle
	 *  - this is a parametric calculation of the A,B,mid(ARC) triangle's area, and
	 *		it continues the parametric polygon calculation that is ran in LotPathModel
	 *	  * from the sign of this surface we can determine if the actual surface of the segment
	 *		( getSegmentSurface() ) has to be added or substracted.
	 */
	roughTriangleSurface()
	{
		let midAngle = ( this._startAngle + this._endAngle ) / 2,
			midArc	 = new Point(
				this.curveCenter.x + Math.cos( midAngle ) * this.radius,
				this.curveCenter.y + Math.sin( midAngle ) * this.radius
			);

				// a->mid EDGE
		return	this.a.x * midArc.y - this.a.y * midArc.x +
				// mid->b EDGE
				midArc.x * this.b.y - midArc.y * this.b.x +
				// b->a EDGE
				this.b.x * this.a.y - this.b.y * this.a.x;
	}

	/**
	 * getSegmentSurface
	 * calculates the surface of circle segment [AB] defined by this curve
	 = (area between the straight AB edge and the curve's border)
	 * formula =
	 CIRCLE_SURFACE * SECTOR_ANGLE / 2PI  	#area of the sector that has ARC_ANGLE degrees
	 - AREA( A, B, C )					#area of the ABC triangle
	 simplified formula =
	 R^2 / 2 * ( α - sin α )
	 http://en.wikipedia.org/wiki/Circular_segment
	 */
	getSegmentSurface()
	{
		let alpha = this._endAngle - this._startAngle;
		return Math.abs( this._radius * this._radius / 2 * ( alpha - Math.sin( alpha ) ) );
	}

	/**
	 * @return {boolean}
	 */
	get isABDirection()
	{
		if ( !this.isCurve ) return super.isABDirection;

		let ax, ay;

		ax = this.curveCenter.x + Math.cos( this.aAngle ) * this.radius;
		ay = this.curveCenter.y + Math.sin( this.aAngle ) * this.radius;

		return Geom.segmentLength( ax, ay, this.a.x, this.a.y ) < Geom.segmentLength( ax, ay, this.b.x, this.b.y );
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @return {Point}
	 */
	getIntersectionPoint(px, py)
	{
		if ( !this.isCurve )
			return super.getIntersectionPoint(px, py);

		let i, numSteps=128, angle, nextAngle, bestDistance, bestPoint, crtPoint, crtDistance;

		for (i=0; i<numSteps; ++i) {
			// calculate the angles of the current portion
			angle		= this.aAngle +   i  /(numSteps)*(this.bAngle-this.aAngle);
			nextAngle	= this.aAngle + (i+1)/(numSteps)*(this.bAngle-this.aAngle);

			crtPoint	= Geom.pointToSegmentIntersection(
				px,
				py,
				this.curveCenter.x + Math.cos(angle)*this.radius,
				this.curveCenter.y + Math.sin(angle)*this.radius,
				this.curveCenter.x + Math.cos(nextAngle)*this.radius,
				this.curveCenter.y + Math.sin(nextAngle)*this.radius
			);
			crtDistance	= Geom.vectorLength(
				px-crtPoint.x,
				py-crtPoint.y
			);

			if ( i===0 || ( crtDistance<bestDistance ) )
			{
				bestDistance	= crtDistance;
				bestPoint		= crtPoint;
			}
		}

		return bestPoint;
	}

	/**
	 * @param pathEdges {Array}
	 */
	updateNormals(pathEdges)
	{
		super.updateNormals( pathEdges );

		// determine if this edge is curved inwards or outwards
		if (!this._isCurve ||
			Geom.segmentLength( this._circleCenter.x, this._circleCenter.y,  this.inNormal.b.x,  this.inNormal.b.y ) <
			Geom.segmentLength( this._circleCenter.x, this._circleCenter.y, this.outNormal.b.x, this.outNormal.b.y ) ) {
			this._curvedInwards = false;
		}	else {
            this._curvedInwards = true;
		}
	}

    /**
     * @return {Array.<Segment>}
     */
	get excludingSegments()
	{
		if (!this.isCurve) {
			return super.excludingSegments;
		}

		if (!this._excludingSegments) {
			this._excludingSegments = this.pieceWiseSplit();
		}

		return this._excludingSegments;
	}

	/**
	 * @param steps {number}
	 */
	pieceWiseSplit(steps = 64) {
		const pieces = [];
		const points = [];

		// use the graphic LineDrawer to create the curve pieces
		const path = LineDrawer.getCurveCommands(this._circleCenter.x, this._circleCenter.y, this._radius, this._startAngle, this._endAngle, steps);

		// map the coordinates to points
		for (let i=0; i<path.points.length; i+=2) {
			points.push(new Point(path.points[i], path.points[i+1]));
		}

		// make sure we created the curve pieces in the correct order
		if (!Geom.equalPoint(this.a, points[0])) {
			points.reverse();
		}

		for (let i=0; i<points.length-1; i++) {
			pieces.push(new Segment(points[i], points[i+1], null, this));
		}

		return pieces;
	}

	/**
	 * @return {string}
	 */
	toString()
	{
		if ( this.isCurve )
			return '[curve ('+this.a+')->('+this.b+')\n\t\tNORMAL='+this.outNormal+'\n\t\tEX='+this.exclusionArea+']';
		else
			return super.toString();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @param a {LotPointModel}
	 */
	setupManipulator(a=null)
	{
		this._manipulator = new LotEdgeManipulator(this, a);
	}

	/**
	 * returns a data structure containing all the parameters representing this object's state
	 * @return {*}
	 */
	recordState()
	{
		let state		= super.recordState();

		state.arcLength	= this._arcLength;
		state.radius	= this._radius;
		state.flip		= this._flipCurveDirection;
		state.isCurve	= this._isCurve;

		return state;
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {*} the state to be restored
	 */
	restoreState(state)
	{
		this._arcLength				= state.arcLength;
		// use setter for radius so we also set the value in feet
		this.radius					= state.radius;
		this._flipCurveDirection	= state.flip;
		this._isCurve				= state.isCurve;

		super.restoreState(state);
	}

	get description()
	{
		if ( !this._isCurve ) return super.description;

		// curve display
		// r-a-c-angle
		return	'R'+this._radius+'\n'+
			'A'+Utils.fx3(this._arcLength)+'\n'+
			'C'+Utils.fx3(this._length)+
			(this.showAngleInEdgeLabels ? '\n'+this.angleDescription : '');
	}

	/**
	 * Use the straight edge label for all labels (straight segments or curves)
	 * @returns {string}
	 */
	get simpleDescription()
	{
		return super.description;
	}
}