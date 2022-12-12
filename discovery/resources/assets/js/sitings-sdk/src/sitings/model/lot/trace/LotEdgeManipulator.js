// used for manual tracing
import ChangeDispatcher from "../../../../events/ChangeDispatcher";
import EventBase from "../../../../events/EventBase";
import LotPointModel from "../LotPointModel";
import Geom from "../../../../utils/Geom";
import ManipulationManager from "./ManipulationManager";
import RestoreEvent from "../../../events/RestoreEvent";

/**
 * Used for controlling the lod edges during manual trace mode
 */
export default class LotEdgeManipulator extends ChangeDispatcher {

	/**
	 * @param target {LotCurveModel}
	 * @param a {LotPointModel}
	 * @param context {Object}
	 * @constructor
	 */
	constructor(target, a, context=null)
	{
		super(context);

		/**
		 * @type {LotCurveModel}
		 * @private
		 */
		this._target = target;
		this._target.addEventListener(EventBase.CHANGE, this.onTargetChanged, this);
		this._target.addEventListener(RestoreEvent.RESTORE_COMPLETE, this.onTargetRestored, this);

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._a = a || new LotPointModel(this._target.a.x, this._target.a.y);
		this._a.addEventListener(EventBase.CHANGE, this.onSelfOriginChanged, this);

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._b = new LotPointModel(this._target.b.x, this._target.b.y);
		this._b.addEventListener(EventBase.CHANGE, this.onSelfDestinationChanged, this);

		/**
		 * Control point, used for curving the edge
		 * @type {LotPointModel}
		 * @private
		 */
		this._c = new LotPointModel(
			(this._target.a.x+this._target.b.x)*.5,
			(this._target.a.y+this._target.b.y)*.5,
			true
		);
		this._c.addEventListener(EventBase.CHANGE, this.onCircleParamsChanged, this);

		/**
		 * Manual Tracing is disabled by default
		 * @type {boolean}
		 * @private
		 */
		this._enabled = false;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._copying = false;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._feeding = false;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._updatingControl = false;
		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._path = null;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._lengthEdited = false;
		/**
		 * @type {number}
		 * @private
		 */
		this._ppmFactor = 1;

		// _meters = _target.meters;
		ManipulationManager.i.add(this);
	}

	/**
	 * @return {number} pixels-per-meter
	 */
	get ppmFactor() { return this._ppmFactor; }

	/**
	 * @return {number}
	 */
	get length() { return Number((this._target.length*this._ppmFactor).toFixed(3)); }

	/**
	 * @param v {number}
	 */
	set length(v)
	{
		this._ppmFactor = v / this._target.length;
		this._lengthEdited = true;
		this.dispatchEvent(new EventBase(EventBase.CHANGE));
	}

	/**
	 * @returns {boolean}
	 */
	get enabled() { return this._enabled; }

	/**
	 * @param v {boolean}
	 */
	set enabled(v) {
		if (this._enabled !== v) {
			this._enabled = v;
			// this.updateSelfParameters();
		}
	}

	/**
	 * @return {LotPointModel}
	 */
	get a() { return this._a; }
	/**
	 * @return {LotPointModel}
	 */
	get b() { return this._b; }
	/**
	 * @return {LotPointModel}
	 */
	get c() { return this._c; }

	/**
	 * commits the length/rotation/curvature manipulations to the model
	 */
	apply()
	{
		this._target.manipulateScale(this._ppmFactor);
		this._target.fixPrecision();
	}

	/**
	 * resets the manipulator
	 */
	reset()
	{
		this._ppmFactor = 1;
		// This triggers the target to dispatch a RESTORE_COMPLETE event, which in turn will call this.onTargetRestored
		this._target.manipulationComplete();
	}

	/**
	 * updates the view by dispatching change vents
	 */
	fixate()
	{
		this._copying = true;
		this._a.translate(0,0);
		this._b.translate(0,0);
		this._c.translate(0,0);
		this._copying = false;
	}

	/**
	 * Snaps the end of the manipulated edge to the indicated position
	 * @param v {LotPointModel}
	 */
	snapEndTo(v)
	{
		if (this._enabled && !this._copying) {
			this._b.x = v.x;
			this._b.y = v.y;

			this._target.fixPrecision();
			this._target.manipulationComplete();

			this.updateSelfParameters();
		}	else {
			// skip snapping
		}
	}

	targetDeleted()
	{
		if (this._target) {
			this._target.removeEventListener(EventBase.CHANGE, this.onTargetChanged, this);
			this._target = null;
		}

		if (this._a) {
			this._a.removeEventListener(EventBase.CHANGE, this.onSelfOriginChanged, this);
			this._a = null;
		}
		if (this._b) {
			this._b.removeEventListener(EventBase.CHANGE, this.onSelfDestinationChanged, this);
			this._b = null;
		}
		if (this._c) {
			this._c.removeEventListener(EventBase.CHANGE, this.onCircleParamsChanged, this);
			this._c = null;
		}

		// remove self from the manipulation manager
		ManipulationManager.i.remove(this);
	}

	/**
	 * Copy the parameters from the edge if it is changed /outside/ of manual tracing. This can happen if the user e.g.
	 * edits the length/angle of the edge directly by inputting the values.
	 *
	 * @param e {EventBase}
	 */
	onTargetChanged(e=null)
	{
		if (!this._enabled && !this._feeding) {
			this._copying = true;
			this._a.x = this._target.a.x;
			this._a.y = this._target.a.y;
			this._b.x = this._target.b.x;
			this._b.y = this._target.b.y;
			this._copying = false;
		}	else {
			// skipping
		}
	}

	/**
	 * Copy the values from the edge when it gets restored
	 *
	 * @param e {EventBase}
	 */
	onTargetRestored(e=null)
	{
		this._copying = true;

		this._a.moveTo(this._target.a.x, this._target.a.y, false );
		this._b.moveTo(this._target.b.x, this._target.b.y, false );

		if ( this._target.isCurve ) {
			this._c.moveTo(
				this._target.curveMidpoint.x,
				this._target.curveMidpoint.y,
				false
			);
		}	else {
			this._c.moveTo(
				this._target.middle.x,
				this._target.middle.y,
				false
			);
		}

		this._copying = false;
	}

	updateSelfParameters()
	{
		if (!this._feeding) {
			// feed the parameters into the target
			this._feeding    = true;

			this._target.a.x = this.a.x;
			this._target.a.y = this.a.y;

			this._target.length = Geom.segmentLength(this.a.x, this.a.y, this.b.x, this.b.y );
			this._target.angleController.radians = Geom.angleBetween(this.a.x, this.a.y, this.b.x, this.b.y);

			this._updatingControl = true;
			if ( this._target.isCurve ) {
				this._c.x = this._target.curveMidpoint.x;
				this._c.y = this._target.curveMidpoint.y;
			}	else {
				this._c.x = this._target.middle.x;
				this._c.y = this._target.middle.y;
			}
			this._updatingControl = false;
			this._feeding = false;
		}
	}

	/**
	 * @param e {EventBase}
	 */
	onSelfOriginChanged(e=null)
	{
		if (this._enabled && !this._copying) {
			this.updateSelfParameters();
		}
	}

	/**
	 * @param e {EventBase}
	 */
	onSelfDestinationChanged(e=null)
	{
		if (this._enabled && !this._copying) {
			this.updateSelfParameters();
		}
	}

	/**1
	 * @param e {EventBase}
	 */
	onCircleParamsChanged(e=null)
	{
		if (this._enabled && !this._copying && !this._updatingControl ) {
			this._updatingControl = true;

			// move it on one of the normals
			let inNormal, outNormal, inHit, outHit, inLen, outLen;

			if (this._target.areNormalsCW) {
				inNormal	= this._target.inNormal.clone();
				outNormal	= this._target.outNormal.clone();
			}	else {
				inNormal	= this._target.outNormal.clone();
				outNormal	= this._target.inNormal.clone();
			}

			// arc height cannot be more than half arc width
			inNormal.normalize( this._target.length * .5 );
			outNormal.normalize( this._target.length * .5 );

			inHit		= Geom.pointToSegmentIntersection( this._c.x, this._c.y, inNormal.a.x, inNormal.a.y, inNormal.b.x, inNormal.b.y );
			outHit		= Geom.pointToSegmentIntersection( this._c.x, this._c.y, outNormal.a.x, outNormal.a.y, outNormal.b.x, outNormal.b.y );

			inLen		= Geom.segmentLength( this._c.x, this._c.y,  inHit.x,  inHit.y );
			outLen		= Geom.segmentLength( this._c.x, this._c.y, outHit.x, outHit.y );

			if ( inLen < outLen ) {
				// we must place C on the inward normal
				this._c.x	= inHit.x;
				this._c.y	= inHit.y;
				this._target.flipCurveDirection	= true;
			}	else {
				this._c.x	= outHit.x;
				this._c.y	= outHit.y;
				this._target.flipCurveDirection	= false;
			}

			// calculate the height & width of the arc
			let arcHeight = Geom.pointToSegmentDistance( this._c.x, this._c.y, this.a.x, this.a.y, this.b.x, this.b.y ),
				arcWidth  = this._target.length;

			/**
			 * calculate the radius using the intersecting chords theorem
			 * http://en.wikipedia.org/wiki/Arc_%28geometry%29#Arc_radius
			 */
			this._target.isCurve = true;
			// _target.radius	 = arcWidth * arcWidth / ( 8 * arcHeight ) + arcHeight * .5;
			// Limit the radius to 3 decimals
			this._target.radius	 = Math.floor( ( arcWidth*arcWidth / ( 8*arcHeight ) + arcHeight/2 ) * 1000 )/1000.0;

			this._updatingControl = false;
		}
	}

	/**
	 * @param ax {number}
	 * @param ay {number}
	 * @param bx {number}
	 * @param by {number}
	 * @return {{length: number, radians: number}}
	 */
	static edgeParamsFromCoords(ax, ay, bx, by)
	{
		return {
			length  : Geom.segmentLength( ax, ay, bx, by ),
			radians : Geom.angleBetween ( ax, ay, bx, by )
		};
	}
}