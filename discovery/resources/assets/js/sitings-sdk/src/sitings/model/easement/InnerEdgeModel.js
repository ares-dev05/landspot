import HighlightableModel from '../../../events/HighlightableModel';
import EventBase from '../../../events/EventBase';
import EasementEvent from '../../events/EasementEvent';
import UnitSystemController from '../lot/UnitSystemController';

export default class InnerEdgeModel extends HighlightableModel {

	static get TYPE() {return 'InnerEdgeModel';}

	/**
	 * @param reference {LotEdgeModel}
	 * @param boundingPath {LotPathModel}
	 * @param distance {number}
	 * @param context {*}
	 */
	constructor(reference, boundingPath, distance=3, context=null)
	{
		super(context);

		/**
		 * @type {LotPathModel}
		 * @protected
		 */
		this._boundingPath	= boundingPath;

		/**
		 * @type {LotEdgeModel}
		 * @protected
		 */
		this._reference		= reference;
		this._reference.addEventListener(EventBase.CHANGE, this.onReferenceChanged, this);

		/**
		 * @type {UnitSystemController}
		 * @private
		 */
		this._distanceController = new UnitSystemController();
		this._distanceController.meters = distance;

		/**
		 * @type {Array.<InnerSegment>}
		 * @protected
		 */
		this._pieces		= [];

		// IExcludingEdge implementation
		/**
		 * @type {Array.<Segment>}
		 * @protected
		 */
		this._excludingSegments = null;

		/**
		 * @type {Quadrilateral}
		 * @protected
		 */
		this._exclusionArea = null;
	}

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
	get feet() {
		return this._distanceController.feet;
	}

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


	/**
	 * @return {Array<InnerSegment>}
	 */
	get pieces() { return this._pieces; }

	/**
	 * @return {LotEdgeModel}
	 */
	get reference() { return this._reference; }

	/**
	 * @return {string}
	 */
	get description() { return this.distance + 'm E'; }

	onReferenceChanged(event=null)
	{
		this.recalculate();
	}

	deleteEdge()
	{
		if (this._reference) {
			this._reference.removeEventListener(EventBase.CHANGE, this.onReferenceChanged, this);
			this._reference = null;
		}

		this.dispatchEvent(new EasementEvent(EasementEvent.DELETE, this));
	}

	/**
	 * @public
	 */
	deleteEasement()  { this.deleteEdge(); }

	recalculate()
	{
		this.calculateParameters();
		this.applyBoundaryExclusions();

		this.dispatchEvent(new EasementEvent(EasementEvent.RECALCULATE, this));
		this.onChange();
	}

	calculateParameters()
	{
		// this has to be overwritten by child classes
	}

	//////////////////////////////////////////////////////////////////////////////
	// exclusion functions
	applyBoundaryExclusions()
	{
		// applies and commits the boundary exclusions to the given edge
		this.resetExclusions();

		for (let i=0; i<this._boundingPath.edges.length; ++i) {
			this._applyInnerExclusion(this._boundingPath.edges[i]);
		}

		this.commitExclusions();
	}

	resetExclusions()
	{
		for (let i=0; i<this._pieces.length; ++i) {
			this._pieces[i].resetExclusions();
		}
	}

	commitExclusions()
	{
		for (let i=0; i<this._pieces.length; ++i) {
			this._pieces[i].commitExclusions();
		}
	}

	/**
	 * @param edge {*} type IExcludingEdge
	 * @param isConcaveCb {Function}
	 * @param context {*}
	 * @return {boolean} true if the exclusion had any effect on the edge
	 */
	applyExclusionOf(edge, isConcaveCb=null, context=null)
	{
		return this._applyInnerExclusion(edge, isConcaveCb, context);
	}

	/**
	 * @private
	 * @internal
	 * @param edge {*} type IExcludingEdge
	 * @param isConcaveCb {Function}
	 * @param context {*}
	 * @return {boolean} true if the exclusion had any effect on the edge
	 */
	_applyInnerExclusion(edge, isConcaveCb=null, context=null) {
		let i=0, reduced=false;

		for (; i<this._pieces.length; ++i) {
			reduced = ( this._pieces[i].applyExclusion(edge, isConcaveCb, context) || reduced );
		}

		return reduced;
	}

	/**
	 * @param edge {*} type IExcludingEdge
	 */
	applyLeftExclusion(edge)
	{
		for (let i=0; i<this._pieces.length; ++i) {
			this._pieces[i].applyLeftExclusion( edge );
		}
	}
	/**
	 * @param edge {*} type IExcludingEdge
	 */
	applyRightExclusion(edge)
	{
		for (let i=0; i<this._pieces.length; ++i) {
			this._pieces[i].applyRightExclusion( edge );
		}
	}
	/**
	 * @param edge {*} type IExcludingEdge
	 */
	removePiecesExcludedBy(edge)
	{
		for (let i=0; i<this._pieces.length; ++i) {
			this._pieces[i].removeIfExcludedBy( edge );
		}
	}

	exclusionsSet()
	{
		this.onChange();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IExcludingEdge implementation

	/**
	 * @return {boolean}
	 */
	get hasExclusions() {
		return this._exclusionArea !== null && this._excludingSegments !== null && this._excludingSegments.length > 0;
	}

	/**
	 * @return {Quadrilateral}
	 */
	get exclusionArea()
	{
		if ( !this._exclusionArea ) {
			// the exclusion area has to be built by each class
			this.buildExclusionParams();
		}

		return this._exclusionArea;
	}

	/**
	 * @return {Array<Segment>}
	 */
	get excludingSegments()
	{
		if ( !this._excludingSegments ) {
			this.buildExclusionParams();
		}

		return this._excludingSegments;
	}

	buildExclusionParams()
	{
	}

	rebuildExclusionParams()
	{
		this.buildExclusionParams();
	}

	/**
	 * @return {number}
	 */
	get exclusionAngle()
	{
		return this._reference.angleController.radians;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * returns a data structure containing all the parameters representing this object's state
	 * @return {{}}
	 */
	recordState ()
	{
		return {
			type		: InnerEdgeModel.TYPE,
			// the reference is recorded by indx
			refIndx		: this._boundingPath.edges.indexOf(this._reference),
			distance	: this.distance
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		this._reference			= this._boundingPath.edges[state.refIndx];

		if (this._reference) {
			this._reference.addEventListener(EventBase.CHANGE, this.onReferenceChanged, this);
		}	else {
			// Invalid restoration of this object
			this.deleteEdge();
			return;
		}

		this.distance			= state.distance;
		// reset the pieces vector to make sure that it's rebuilt
		this._pieces			= [];

		// reset the exclusion area
		this._excludingSegments	= null;
		this._exclusionArea		= null;

		this.recalculate();
		this.onRestored();
	}
}