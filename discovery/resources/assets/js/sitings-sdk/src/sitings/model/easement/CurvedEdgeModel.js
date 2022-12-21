import InnerEdgeModel from './InnerEdgeModel';
import Point from '../../../geom/Point';
import Geom from '../../../utils/Geom';
import InnerSegment from './InnerSegment';
import LineDrawer from '../../render/LineDrawer';
import Quadrilateral from '../../../geom/Quadrilateral';
import Segment from '../../../geom/Segment';

export default class CurvedEdgeModel extends InnerEdgeModel {

	static get TYPE() { return 'CurvedEdgeModel'; }
	static get CURVE_D_DELTA() { return .005; }

	/**
	 * @param reference {LotCurveModel}
	 * @param boundingPath {LotPathModel}
	 * @param distance {number}
	 * @param numPieces {number}
	 */
	constructor(reference, boundingPath, distance, numPieces=16 )
	{
		super( reference, boundingPath, distance );

		/**
		 * @type {LotCurveModel}
		 * @private
		 */
		this._curveRef		= reference;

		/**
		 * @type {number}
		 * @private
		 */
		this._numPieces		= numPieces;

		/**
		 * @type {Point}
		 * @private
		 */
		this._curveCenter	= this.curve.curveCenter.clone();

		/**
		 * @type {number}
		 * @private
		 */
		this._radius		= this.curve.radius;

		/**
		 * @type {number}
		 * @private
		 */
		this._aAngle		= 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._bAngle	 = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._farAAngle	 = this.curve.aAngle;

		/**
		 * @type {number}
		 * @private
		 */
		this._farBAngle	 = this.curve.bAngle;

		this.recalculate();
	}

	get curve()
	{
		return this._curveRef;
	}
	get curveCenter()
	{
		return this._curveCenter;
	}
	get radius()
	{
		return this._radius;
	}

	get arcCenter()
	{
		return new Point(
			this._curveCenter.x + Math.cos( this.midAngle ) * this._radius,
			this._curveCenter.y + Math.sin( this.midAngle ) * this._radius
		);
	}
	get segmentCenter()
	{
		return new Point(
			( this.firstPiece.farA.x + this.lastPiece.farB.x ) / 2,
			( this.firstPiece.farA.y + this.lastPiece.farB.y ) / 2
		);
	}

	get startAngle() { return this._aAngle; }
	get endAngle() { return this._bAngle; }
	get midAngle() { return ( this._aAngle + this._bAngle ) / 2; }

	get firstPiece() { return this._pieces[0]; }

	/**
	 * @return {InnerSegment}
	 */
	get lastPiece () { return this._pieces[this._pieces.length-1]; }

	resetExclusions()
	{
		super.resetExclusions();
		this._aAngle	= this._farAAngle;
		this._bAngle	= this._farBAngle;
	}

	/**
	 * applyExclusionOf
	 * returns true if the exclusion had any effect on the edge
	 */
	/**
	 * @param edge {*}
	 * @param isConcaveCb {Function}
	 * @param context {*}
	 * @return {Boolean}
	 */
	applyExclusionOf( edge, isConcaveCb=null, context=null )
	{
		// break the loop after the first intersection!
		let i=0, reduced=false;

		for (; i<this._pieces.length && !reduced; ++i) {
			// make sure applyExclusion is still called after reduced becomes TRUE
			// if reduced was first in the OR, pieces[i].apply... wouldn't be called anymore once reduced became TRUE
			reduced = ( this._pieces[i].applyExclusion( edge, isConcaveCb, context) || reduced );
		}

		return reduced;
	}


	/**
	 * getReducedAngles
	 * update aAngle & bAngle to reflect the reduced area
	 */
	getReducedAngles()
	{
		let i;

		// find the left-most piece that has a reduction on B
		for (i=0; i<this._pieces.length; ++i) {
			if (this._pieces[i].bReduced) {
				this._bAngle = Geom.angleBetween(
					this._curveCenter.x,
					this._curveCenter.y,
					this._pieces[i].b.x,
					this._pieces[i].b.y
				);

				// all pieces after this one must be cut
				for (++i; i<this._pieces.length; ++i) {
					this._pieces[i].fullExclusion = true;
				}

				break;
			}
		}

		// find the right-most piece that has a reduction on A
		for (i=this._pieces.length-1; i+1; --i)
		{
			if (this._pieces[i].aReduced) {
				this._aAngle = Geom.angleBetween(
					this._curveCenter.x,
					this._curveCenter.y,
					this._pieces[i].a.x,
					this._pieces[i].a.y
				);

				// all pieces before this one must be cut
				for (--i; i+1; --i) {
					this._pieces[i].fullExclusion = true;
				}

				break;
			}
		}

		this.arrangeAngles();
	}

	arrangeAngles()
	{
		if (this._aAngle > this._bAngle) {
			let aux = this._aAngle;
			this._aAngle = this._bAngle;
			this._bAngle = aux;
		}

		if (this._bAngle - this._aAngle > Math.PI) {
			this._bAngle -= Math.PI * 2;
		}
	}

	commitExclusions()
	{
		// recalculate aAngle && bAngle
		this.getReducedAngles();

		// recalculate with the new angles
		this.calculateParameters();
	}

	exclusionsSet()
	{
		this.getReducedAngles();
		super.exclusionsSet();
	}

	calculateParameters()
	{
		let i, p;

		if ( !this._pieces.length ) {
			for (i=0; i<this._numPieces; ++i) {
				this._pieces.push( new InnerSegment( new Point(), new Point() ) );
			}
		}

		// the center of the curve is always fixed, the radius varies
		this._radius =  this.curve.radius + (
			this.curve.curvedInwards ?
				  this.distance+CurvedEdgeModel.CURVE_D_DELTA :
				-(this.distance+CurvedEdgeModel.CURVE_D_DELTA)
		);

		let path	 = LineDrawer.getCurveCommands(
			this._curveCenter.x,
			this._curveCenter.y,
			this._radius,
			this._farAAngle,
			this._farBAngle,
			this._pieces.length+1
		),	points = path.points;

		if (this.curve.isABDirection) {
			for (i=0; i<points.length-2; i+=2) {
				p = i / 2;
				this._pieces[p].a.x = this._pieces[p].farA.x = points[i];
				this._pieces[p].a.y = this._pieces[p].farA.y = points[i+1];
				this._pieces[p].b.x = this._pieces[p].farB.x = points[i+2];
				this._pieces[p].b.y = this._pieces[p].farB.y = points[i+3];
				this._pieces[p].markDirty();
			}
		}	else {
			// reverse direction
			for (p=0, i=points.length-4; i>=0; i-=2, ++p) {
				this._pieces[p].a.x = this._pieces[p].farA.x = points[i+2];
				this._pieces[p].a.y = this._pieces[p].farA.y = points[i+3];
				this._pieces[p].b.x = this._pieces[p].farB.x = points[i];
				this._pieces[p].b.y = this._pieces[p].farB.y = points[i+1];
				this._pieces[p].markDirty();
			}
		}

		this._pieces[0].normalizeStart(7);
		this._pieces[0].hideIfNotReduced = true;
		this.lastPiece.normalize(7);
		this.lastPiece.hideIfNotReduced = true;

		this._aAngle	= this._farAAngle;
		this._bAngle	= this._farBAngle;

		this.buildExclusionParams();
	}

	buildExclusionParams()
	{
		if ( ! this.curve.curvedInwards ) {
			this._exclusionArea = Quadrilateral.getLineNormalExclusionArea(
				new Point( this.firstPiece.farB.x, this.firstPiece.farB.y ),
				new Point(  this.lastPiece.farA.x,  this.lastPiece.farA.y ),
				this._reference.outNormal
			);
		}	else {
			this._exclusionArea = Quadrilateral.getLineNormalExclusionArea(
				new Point( this.firstPiece.farA.x, this.firstPiece.farA.y ),
				new Point(  this.lastPiece.farB.x,  this.lastPiece.farB.y ),
				this._reference.outNormal
			);

			// translate the exclusion area to make it a tangent of the centre for inward curves
			this._exclusionArea.translate( this.arcCenter.subtract( this.segmentCenter ) );
		}

		// rebuild the excluding segment
		this._excludingSegments = [];
		for (let i=0; i<this._pieces.length; ++i)
		{
			// make sure to not include invalid pieces in the exclusion set
			if ( !this._pieces[i].fullExclusion ) {
				this._excludingSegments.push(
					new Segment( this._pieces[i].a.clone(), this._pieces[i].b.clone() )
				);
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {{}} data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		let state			= super.recordState();
		state.type			= CurvedEdgeModel.TYPE;
		state.curveRefIndx	= this._boundingPath.edges.indexOf(this._curveRef);
		state.numPieces		= this._numPieces;
		return state;
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		this._curveRef		= this._boundingPath.edges[ state.curveRefIndx ];
		this._numPieces		= state.numPieces;

		super.restoreState(state);
	}
}