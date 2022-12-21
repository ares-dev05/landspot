import InnerEdgeModel from './InnerEdgeModel';
import InnerSegment from './InnerSegment';
import Point from '../../../geom/Point';
import Geom from '../../../utils/Geom';
import Quadrilateral from '../../../geom/Quadrilateral';
import Segment from '../../../geom/Segment';

export default class ParallelEasement extends InnerEdgeModel{

	static get TYPE() { return 'ParallelEasement'; }
	static get FAR_LENGTH() { return 1000; }

	/**
	 * @param reference {LotEdgeModel}
	 * @param boundingPath {LotPathModel}
	 * @param distance {number}
	 * @param initialCalculate {boolean}
	 */
	constructor(reference, boundingPath, distance, initialCalculate=true)
	{
		super( reference, boundingPath, distance );

		/**
		 * @type {InnerSegment}
		 * @protected
		 */
		this._ease = null;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._splayed	= false;

		/**
		 * @type {number}
		 * @private
		 */
		this._splayDistance	= -1;

		/**
		 * @type {InnerSegment}
		 * @private
		 */
		this._splayedEase	= null;

		/**
		 * @type {InnerSegment}
		 * @private
		 */
		this._connection	= null;

		initialCalculate && this.recalculate();
	}

	/**
	 * @return {string}
	 */
	get description() {
		if (this.splayed && this.splayedInDistances) {
			return this.distance + 'm / ' + this._splayDistance + 'm E';
		}

		return super.description;
	}

	/**
	 * @returns {boolean}
	 */
	get splayed() { return this._splayed; }

	/**
	 * @param value {boolean}
	 */
	set splayed(value) {
		this._splayed=value;
		if (value && this._splayDistance < 0) {
			this._splayDistance = this.distance;
		}

		this.recalculate();
	}

	/**
	 * @returns {number}
	 */
	get splayDistance() { return this._splayDistance; }

	/**
	 * @param value
	 */
	set splayDistance(value) {
		this._splayDistance = value;
		this.recalculate();
	}

	/**
	 * Returns true if the two distances that defined a splayed envelope are different.
	 * @returns {boolean}
	 */
	get splayedInDistances() {
		return !Geom.equal(this.distance, this.splayDistance);
	}

	/**
	 * @returns {InnerSegment} The line connecting the two parts of a splayed envelope
	 */
	get connection() { return this._connection; }

	/**
	 * Updates the calculation for the parallel easement
	 */
	calculateParameters()
	{
		if (!this._ease) {
			// init call: create pieces
			this._ease = new InnerSegment(new Point(), new Point());
			this._splayedEase = new InnerSegment(new Point(), new Point());
			this._connection  = new InnerSegment(new Point(), new Point());
		}

		this._pieces = [this._ease];

		/**
		 * @type {Segment}
		 */
		let normal = this._reference.inNormal.clone();

		normal.normalize(this.distance);
		normal.startFrom(this._reference.a.x, this._reference.a.y);
		this._ease.farA.x = normal.b.x;
		this._ease.farA.y = normal.b.y;

		normal.startFrom(this._reference.b.x, this._reference.b.y);
		this._ease.farB.x = normal.b.x;
		this._ease.farB.y = normal.b.y;

		// Store the segment center
		// const splitPoint = new Point((this._ease.farA.x+this._ease.farB.x)/2, (this._ease.farA.y+this._ease.farB.y)/2);

		// extend the easement far points
		let lengthK = ParallelEasement.FAR_LENGTH / this._ease.farLength * .5, a=new Point(), b=new Point();

		a.x = Geom.getWeighedValue(this._ease.farA.x, this._ease.farB.x, -lengthK+.5);
		a.y = Geom.getWeighedValue(this._ease.farA.y, this._ease.farB.y, -lengthK+.5);
		b.x = Geom.getWeighedValue(this._ease.farA.x, this._ease.farB.x, +lengthK+.5);
		b.y = Geom.getWeighedValue(this._ease.farA.y, this._ease.farB.y, +lengthK+.5);

		this._ease.farA.x = this._ease.a.x = a.x;
		this._ease.farA.y = this._ease.a.y = a.y;

		this._ease.farB.x = this._ease.b.x = b.x;
		this._ease.farB.y = this._ease.b.y = b.y;

		// Splayed elements are split in two at the middle
		if (this.splayed && this.splayedInDistances) {
			// the split point has to be the projection of the reference's middle on the easement
			const refCenter  = this._reference.middle;
			const splitPoint = this._ease.getIntersectionPoint(refCenter.x, refCenter.y);
			// const splitPoint = this._ease.center.clone();

			// Create the secondary piece; It will cover the [Mid -> B) section of the original ease.
			// We also have to move the splayed envelope to its new position
			normal.startFrom(splitPoint.x, splitPoint.y);
			normal.normalize(this.splayDistance - this.distance);
			this._splayedEase.farA = normal.b.clone();

			normal.startFrom(b.x, b.y);
			this._splayedEase.farB = normal.b.clone();

			// Update the primary piece; It will cover the (A -> Mid] section of its original span
			this._ease.farB = splitPoint.clone();

			// Also add the connecting line between the splay
			this._connection.a = this._splayedEase.farA.clone();
			this._connection.b = this._ease.farB.clone();

			this._pieces.push(this._splayedEase);
		}

		this.buildExclusionParams();
	}

	buildExclusionParams()
	{
		if (!this._ease) {
			return;
		}

		this._exclusionArea = Quadrilateral.getLineNormalExclusionArea(
			new Point(this._ease.farA.x, this._ease.farA.y),
			new Point(this._ease.farB.x, this._ease.farB.y),
			this._reference.outNormal
		);

		this._excludingSegments = [
			new Segment( this._ease.a.clone(), this._ease.b.clone() )
		];

		if (this._splayed) {
			this._excludingSegments.push(
				new Segment(this._splayedEase.a.clone(), this._splayedEase.b.clone())
			);

			if (this._splayDistance < this.distance) {
				this._exclusionArea = Quadrilateral.getLineNormalExclusionArea(
					new Point(this._splayedEase.farA.x, this._splayedEase.farA.y),
					new Point(this._splayedEase.farB.x, this._splayedEase.farB.y),
					this._reference.outNormal
				);
			}
		}
	}

	/**
	 * @param edge {*} type IExcludingEdge
	 * @param isConcaveCb {Function}
	 * @param context {*}
	 * @param leftToRight {boolean} when true, <edge> is before <this> in the inner path model
	 * @return {boolean} true if the exclusion had any effect on the edge
	 */
	applyExclusionOf(edge, isConcaveCb=null, context=null, leftToRight=false)
	{
		if (this._splayed && this._pieces.length === 2) {
			// for Splayed envelopes, we must only reduce the closest side to the edge
			return this._pieces[leftToRight ? 0 : 1].applyExclusion(edge, isConcaveCb, context);
		}

		return super.applyExclusionOf(edge, isConcaveCb, context);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {{}}
	 */
	recordState ( )
	{
		let state 			= super.recordState();
		state.type			= ParallelEasement.TYPE;
		state.splayed		= this._splayed;
		state.splayDistance	= this.splayDistance;
		return state;
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		// reset ease to make sure it's rebuilt
		this._ease = null;

		if (state.hasOwnProperty('splayed')) {
			this._splayed = state.splayed;
		}	else {
			this._splayed = false;
		}

		if (state.hasOwnProperty('splayDistance')) {
			this._splayDistance = state.splayDistance;
		}	else {
			this._splayDistance = -1;
		}

		super.restoreState(state);
	}
}