import HighlightableModel from '../../../../events/HighlightableModel';
import ModelEvent from '../../../events/ModelEvent';
import EventBase from '../../../../events/EventBase';
import LotEdgeAngle from '../LotEdgeAngle';
import LotPointModel from '../LotPointModel';
import Geom from '../../../../utils/Geom';
import Utils from '../../../../utils/Utils';
import EasementEvent from '../../../events/EasementEvent';
import Point from '../../../../geom/Point';
import Segment from '../../../../geom/Segment';
import UnitSystemController from '../../lot/UnitSystemController';


/**
 * A lot easement isn't associated to a single edge, but instead interacts with the whole lot (or more edges).
 * It can have one of the following two types:
 * - Block Easement
 * - Angled Easement
 * - External Easement
 */
export default class LotEasementModel extends HighlightableModel {

	static get EXTERNAL()	{ return 1; }
	static get ANGLED()		{ return 2; }
	static get BLOCK()		{ return 3; }

	/**
	 * @param reference {LotCurveModel}
	 * @param distance {number}
	 * @param pathModel {LotPathModel}
	 * @param type {int}
	 */
	constructor(reference, distance, pathModel, type)
	{
		super();

		/**
		 * @type {LotCurveModel}
		 * @private
		 */
		this._referenceEdge	= reference;

		/**
		 * @type {UnitSystemController}
		 * @private
		 */
		this._distanceController = new UnitSystemController();
		this.distance		= distance;
		
		/**
		 * @type {LotEdgeAngle}
		 * @private
		 */
		this._angle			= new LotEdgeAngle(
			reference.angleController.degrees+90,
			reference.angleController.minutes,
			reference.angleController.seconds,
			reference.angleController.flip
		);

		/**
		 * @type {number}
		 * @private
		 */
		this._type			= type;

		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._path			= pathModel;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._error			= false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._flipStart		= false;

		/**
		 * @type {number}
		 * @private
		 */
		/**
		 * @type {UnitSystemController}
		 * @private
		 */
		this._widthController = new UnitSystemController();

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._startPoint	= new LotPointModel();

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._endPoint		= new LotPointModel();

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._wStartPoint	= new LotPointModel();

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._wEndPoint		= new LotPointModel();

		// Add event listeners
		this._referenceEdge.addEventListener(ModelEvent.DELETE, this.onReferenceDeleted, this);
		this._referenceEdge.addEventListener(EventBase.CHANGE, this.modelChanged, this);
		this._angle.addEventListener(EventBase.CHANGE, this.modelChanged, this);

		this.width = (this._type === LotEasementModel.BLOCK) ? 3 : 0;
	}

	/**
	 * @return {LotEdgeAngle}
	 */
	get angle() { return this._angle; }

	/**
	 * @return {boolean}
	 */
	get error() { return this._error; }

	/**
	 * @param v
	 */
	set type(v) {
		if ( v !== this._type ) {
			this._type=v;
			this.recalculate();
		}
	}

	/**
	 * @return {number}
	 */
	get type() { return this._type; }


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Distance Getters/Setters

	/**
	 * @param v {number}
	 */
	set distance(v) {
		this._distanceController.meters = v;
		this.recalculate();
	}

	/**
	 * @return {number}
	 */
	get distance() { return this._distanceController.meters; }

	/**
	 * @return {number}
	 */
	get feet() { return this._distanceController.feet; }

	/**
	 * @param feet {number}
	 */
	set feet(feet) {
		this._distanceController.feet = feet;
		this.recalculate();
	}

	/**
	 * @return {number}
	 */
	get inches() { return this._distanceController.inches; }

	/**
	 * @param inches {number}
	 */
	set inches(inches) {
		this._distanceController.inches = inches;
		this.recalculate();
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Width getters/setters

	/**
	 * @param v {number}
	 */
	set width(v) {
		this._widthController.meters = v;
		this.recalculate();
	}

	/**
	 * @return {number}
	 */
	get width() { return this._widthController.meters; }

	/**
	 * @return {number}
	 */
	get widthFeet() { return this._widthController.feet; }

	/**
	 * @param feet {number}
	 */
	set widthFeet(feet) {
		this._widthController.feet = feet;
		this.recalculate();
	}

	/**
	 * @return {number}
	 */
	get widthInches() { return this._widthController.inches; }

	/**
	 * @param inches {number}
	 */
	set widthInches(inches) {
		this._widthController.inches = inches;
		this.recalculate();
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @return {number}
	 */
	get flipStart() { return this._flipStart; }
	/**
	 * @param v {number}
	 */
	set flipStart(v) {
		if ( v !== this._flipStart ) {
			this._flipStart=v;
			this.recalculate();
		}
	}

	/**
	 * @returns {LotCurveModel} the reference edge for this easement
	 */
	get reference() { return this._referenceEdge; }

	/**
	 * @return {LotPointModel}
	 */
	get a() { return this._startPoint; }

	/**
	 * @return {LotPointModel}
	 */
	get b() { return   this._endPoint; }

	/**
	 * @returns {Point}
	 */
	get mid() {
		return new Point(
			(this.a.x + this.b.x)/2,
			(this.a.y + this.b.y)/2
		);
	}

	/**
	 * @returns {Point}
	 */
	get normal() {
		const mid = this.mid;
		return new Point(
			2 * mid.x - this.reference.middle.x,
			2 * mid.y - this.reference.middle.y
		);
	}

	/**
	 * @return {LotPointModel}
	 */
	get aw() { return this._wStartPoint; }

	/**
	 * @return {LotPointModel}
	 */
	get bw() { return this._wEndPoint  ; }

	/**
	 * @return {number}
	 */
	get length() { return Geom.segmentLength( this.a.x, this.a.y, this.b.x, this.b.y ); }

	/**
	 * @return {number}
	 */
	get wlength() { return Geom.segmentLength( this.aw.x, this.aw.y, this.bw.x, this.bw.y ); }

	/**
	 * @return {string}
	 */
	get description()
	{
		switch ( this._type )
		{
			case LotEasementModel.ANGLED:
				return Utils.fx2(this.width)+'m E';

			case LotEasementModel.EXTERNAL:
				return Utils.fx3(this.distance)+'m E';

			case LotEasementModel.BLOCK:
				return Utils.fx2(this.width)+'m x '+Utils.fx2(this.distance)+'m E';

			default:
				return '';
		}
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onReferenceDeleted(e)
	{
		this.deleteEasement();
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	modelChanged(e)
	{
		this.recalculate();
	}

	/**
	 * Delete this easement model
	 */
	deleteEasement()
	{
		if (this._angle) {
			this._angle.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
			this._angle = null;
		}

		if (this._referenceEdge) {
			this._referenceEdge.removeEventListener(ModelEvent.DELETE, this.onReferenceDeleted, this);
			this._referenceEdge.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
			this._referenceEdge = null;
		}

		this.dispatchEvent(new EasementEvent(EasementEvent.DELETE, this));
	}

	recalculate()
	{
		this.calculateEasementParameters();
		this.dispatchEvent(new EasementEvent(EasementEvent.RECALCULATE, this));
		this.onChange();
	}

	calculateEasementParameters()
	{
		let alpha, segLength, positionFactor, wPosFactor;
		this._error = false;

		if (this._type===LotEasementModel.EXTERNAL )
		{
			/**
			 * @type {Segment}
			 */
			let start = this._referenceEdge.outNormal.clone();
			let end   = this._referenceEdge.outNormal.clone();

			start.startFrom(this._referenceEdge.a.x, this._referenceEdge.a.y);
			start.normalize(this.distance);

			end.startFrom(this._referenceEdge.b.x, this._referenceEdge.b.y);
			end.normalize(this.distance);

			this._startPoint.x	= start.b.x;
			this._startPoint.y	= start.b.y;
			this._endPoint.x	= end.b.x;
			this._endPoint.y	= end.b.y;
		}
		if (this._type===LotEasementModel.ANGLED) {
			//
			let alphaCos = Math.abs(Math.sin(this._angle.radians-this._referenceEdge.angleController.radians)), widthK;
			if ( alphaCos < 0.000001 ) {
				widthK = 1;
			}	else {
				widthK = 1 / alphaCos;
			}

			// easement starts from the reference edge, at <distance> from point A
			segLength		= Geom.segmentLength(
				this._referenceEdge.a.x, this._referenceEdge.a.y,
				this._referenceEdge.b.x, this._referenceEdge.b.y
			);

			positionFactor	= (
				this._flipStart ?
					segLength-this.distance :
					this.distance
			) / segLength;
			wPosFactor		= (
				this._flipStart ?
					segLength-this.distance - this.width*widthK :
					this.distance + this.width*widthK
			) / segLength;

			this._startPoint.x	= Geom.getWeighedValue(this._referenceEdge.a.x, this._referenceEdge.b.x, positionFactor);
			this._startPoint.y	= Geom.getWeighedValue(this._referenceEdge.a.y, this._referenceEdge.b.y, positionFactor);

			this._wStartPoint.x	= Geom.getWeighedValue(this._referenceEdge.a.x, this._referenceEdge.b.x, wPosFactor);
			this._wStartPoint.y	= Geom.getWeighedValue(this._referenceEdge.a.y, this._referenceEdge.b.y, wPosFactor);

			// calculate the end point by the given angle
			let ray  = new Point(), hitPoint, i, endDefined=false,
				wray = new Point(), wHitPoint,  wEndDefined=false;

			alpha			= this._angle.radians;
			ray.x			= this._startPoint.x  + Math.cos(alpha) * 1000;
			ray.y			= this._startPoint.y  + Math.sin(alpha) * 1000;
			wray.x			= this._wStartPoint.x + Math.cos(alpha) * 1000;
			wray.y			= this._wStartPoint.y + Math.sin(alpha) * 1000;

			// intersect the ray with all other boundaries of the path
			for (i=0; i<this._path.edges.length; ++i) {
				if ( this._path.edges[i] === this._referenceEdge ) {
					continue;
				}

				hitPoint	= Geom.segmentIntersectionCoords(
					this._startPoint.x, this._startPoint.y, ray.x, ray.y,
					this._path.edges[i].a.x, this._path.edges[i].a.y, this._path.edges[i].b.x, this._path.edges[i].b.y
				);
				wHitPoint	= Geom.segmentIntersectionCoords(
					this._wStartPoint.x, this._wStartPoint.y, wray.x, wray.y,
					this._path.edges[i].a.x, this._path.edges[i].a.y, this._path.edges[i].b.x, this._path.edges[i].b.y
				);

				if (hitPoint != null) {
					if (!endDefined ||
						Geom.segmentLength( this._startPoint.x, this._startPoint.y, hitPoint.x, hitPoint.y ) <
						Geom.segmentLength( this._startPoint.x, this._startPoint.y, this._endPoint.x, this._endPoint.y )
					)	{
						this._endPoint.x = hitPoint.x;
						this._endPoint.y = hitPoint.y;
						endDefined	= true;
					}
				}	if (wHitPoint != null) {
					if (!wEndDefined ||
						Geom.segmentLength( this._wStartPoint.x, this._wStartPoint.y, wHitPoint.x, wHitPoint.y ) <
						Geom.segmentLength( this._wStartPoint.x, this._wStartPoint.y, this._wEndPoint.x, this._wEndPoint.y )
					)	{
						this._wEndPoint.x = wHitPoint.x;
						this._wEndPoint.y = wHitPoint.y;
						wEndDefined	= true;
					}
				}
			}

			if (!endDefined) {
				// create an easement of 10 meters; make it red
				this._endPoint.x = this._startPoint.x + Math.cos(alpha) * 10;
				this._endPoint.y = this._startPoint.y + Math.sin(alpha) * 10;
				this._error = true;
			}
			if ( !wEndDefined ) {
				this._wEndPoint.x = this._wStartPoint.x + Math.cos(alpha) * 10;
				this._wEndPoint.y = this._wStartPoint.y + Math.sin(alpha) * 10;
			}
		}
		else if ( this._type === LotEasementModel.BLOCK ) {
			let normal			= this.reference.inNormal.clone();

			// easement starts from the reference edge, at <distance> from point A
			segLength			= Geom.segmentLength(
				this._referenceEdge.a.x, this._referenceEdge.a.y,
				this._referenceEdge.b.x, this._referenceEdge.b.y
			);

			positionFactor		= (this._flipStart ? (segLength-this.distance) : this.distance) / segLength;
			wPosFactor			= (this._flipStart ? 1 : 0 );

			this._startPoint.x	= Geom.getWeighedValue(this._referenceEdge.a.x, this._referenceEdge.b.x, positionFactor);
			this._startPoint.y	= Geom.getWeighedValue(this._referenceEdge.a.y, this._referenceEdge.b.y, positionFactor);

			// normal.angle	= angle.radians;
			normal.normalize(this.width);
			normal.startFrom(this._startPoint.x, this._startPoint.y);

			this._endPoint.copy(normal.b);
			this._wStartPoint.copy(this._endPoint);

			let tmpPoint = new Point(), hSeg, bp, cp, bd=Infinity, cd;

			tmpPoint.x	= Geom.getWeighedValue(this._referenceEdge.a.x, this._referenceEdge.b.x, wPosFactor);
			tmpPoint.y	= Geom.getWeighedValue(this._referenceEdge.a.y, this._referenceEdge.b.y, wPosFactor);

			normal.startFrom(tmpPoint.x, tmpPoint.y);

			hSeg = new Segment(new Point(this._endPoint.x, this._endPoint.y), normal.b.clone());
			hSeg.normalize(100);

			this._wStartPoint.copy(this._endPoint);

			for (let i=0; i<this._path.edges.length; ++i) {
				cp	= Geom.segmentIntersectionCoords(
					hSeg.a.x, hSeg.a.y, hSeg.b.x, hSeg.b.y,
					this._path.edges[i].a.x, this._path.edges[i].a.y, this._path.edges[i].b.x, this._path.edges[i].b.y
				);
				if (cp) {
					cd	= Geom.segmentLength(hSeg.a.x, hSeg.a.y, cp.x, cp.y);
					if ( cd < bd ) {
						bd = cd;
						bp = cp;
					}
				}
			}

			if (bp) {
				this._wEndPoint.x = bp.x;
				this._wEndPoint.y = bp.y;
			}	else {
				hSeg.normalize(3);
				this._wEndPoint.x = hSeg.b.x;
				this._wEndPoint.y = hSeg.b.y;
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * recordState
	 * @return {{}} data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			refIndx		: this._path.edges.indexOf(this.reference),
			leftIndx	: 0,
			rightIndx	: 0,
			type		: this._type,
			angle		: this._angle.recordState(),
			distance	: this.distance,
			width		: this.width,
			flipStart	: this._flipStart
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		this._referenceEdge	= this._path.edges[state.refIndx];

		if (this._referenceEdge) {
			this._referenceEdge.addEventListener(ModelEvent.DELETE, this.onReferenceDeleted, this);
			this._referenceEdge.addEventListener(EventBase.CHANGE, this.modelChanged, this);
		}	else {
			// Invalid restoration of this object
			this.deleteEasement();
			return;
		}

		this._type			= state.type;
		this.distance		= state.distance;
		this.width			= state.width;
		this._flipStart		= state.flipStart;
		this._angle.restoreState(state.angle);

		this.recalculate();
		this.onRestored();
	}
}