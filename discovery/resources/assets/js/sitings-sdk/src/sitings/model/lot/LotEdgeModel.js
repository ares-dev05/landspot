/**
 * OutlineEdgeModel
 * model for an edge of the lot
 */
import LotPointModel from "./LotPointModel";
import UnitSystemController from "./UnitSystemController";
import Point from "../../../geom/Point";
import Segment from "../../../geom/Segment";
import EventBase from "../../../events/EventBase";
import Geom from "../../../utils/Geom";
import DataEvent from "../../../events/DataEvent";
import LotEdgeEvent from "../../events/LotEdgeEvent";
import Quadrilateral from "../../../geom/Quadrilateral";


export default class LotEdgeModel extends Segment {

	// the length of the far normal = 10KM
	static get FAR_NORMAL() { return 10000; }
	// the length of the close normal = 1m
	static get CLOSE_NORMAL() { return 1; }

	
	/**
	 * @param a {LotPointModel}
	 * @param length {number}
	 * @param angle {LotEdgeAngle}
	 * @param canDelete {boolean}
     * @param context {*}
	 */
	constructor(a, length, angle, canDelete, context=null)
	{
		super(null, null, context);

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._canDelete	= canDelete;

		/**
		 * Indicates if the this lot edge has been aligned to one of the page sides (i.e. left/top/right/bottom)
		 * @type {boolean}
		 * @private
		 */
		this._alignedToPage = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isRestoring	= false;

		/**
		 * @type {Angle}
		 * @private
		 */
		this._angleController		= angle;
		this._angleController.addEventListener(EventBase.CHANGE, this.onChange, this);

		/**
		 * @type {UnitSystemController}
		 * @private
		 */
		this._lengthController		= null;
		this.length					= length;

		/**
		 * manipulator for manual drawing
		 * type {LotEdgeManipulator}
		 * @protected
		 */
		this._manipulator	= null;

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._a			= null;
		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._b			= new LotPointModel();

		/**
		 * The lot that this edge is a part of
		 * @type {LotPathModel}
		 * @private
		 */
		this._path		= null;

		/**
		 * Middle point of the segment, used for the two normals
		 * @type {Point}
		 * @private
		 */
		this._middle	= new Point();
		/**
		 * Normal that points from the middle of the segment to the inside of the lot
		 * @type {Segment}
		 * @private
		 */
		this._inNormal	= new Segment( this._middle, new Point() );
		/**
		 * Normal that points from the middle of the segment to the outside of the lot
		 * @type {Segment}
		 * @private
		 */
		this._outNormal	= new Segment( this._middle, new Point() );
		/**
		 * Flag that indicates if the order of the points (a, OUT, b, IN) are sorted in a clockwise order,
		 * where OUT is the end of the outwards normal and IN is the end of the inwards normal
		 * @type {boolean}
		 * @private
		 */
		this._areNormalsCW = true;

		/**
		 * @type {Quadrilateral}
		 * @private
		 */
		this._exclusionArea	= null;

		/**
		 * @type {Array.<Segment>}
		 * @protected
		 */
		this._excludingSegments = null;

		/**
		 * Set the origin point through the setter to keep track of the number of segments that are connected to it
 		 */
		this.a			= a;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._constructFlag		= true;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._showAngleInEdgeLabels = true;
	}

	/**
	 * Overwrite the length property
	 * @return {number}
	 * @protected
	 */
	get _length() { return this._lengthController.meters; }

	/**
	 * Overwrite the _length setter
	 * @param v
	 */
	set _length(v) { this.length = v; }

	/**
	 * @return {number}
	 */
	get length() { return this._lengthController.meters; }

	/**
	 * @param v
	 */
	set length(v)
	{
		if(!this._lengthController) {
			this._lengthController = new UnitSystemController(v);
		}

		this._lengthController.meters = v;
		this.onChange();
	}

    /**
     * @return {Angle}
     */
    get angleController() { return this._angleController; }

    /**
     * @override
     * @return {number}
     */
    get angle()		 {
        throw new Error("Use the 'angleController' instead of the 'angle' getter on the LotEdgeModel object");
        // return this._angleController;
    }

	/**
	 * @return {number}
	 */
	get feet() { return this._lengthController.feet; }

	/**
	 * @param feet {number}
	 */
	set feet(feet) {
		this._lengthController.feet = feet;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get inches() { return this._lengthController.inches; }

	/**
	 * @param inches {number}
	 */
	set inches(inches) {
		this._lengthController.inches = inches;
		this.onChange();
	}

	/**
	 * @param feet {number}
	 * @param inches {number}
	 */
	setLengthImperial(feet, inches)
	{
		this._lengthController.setImperial(feet, inches);
		this.onChange();
	}

	/**
	 * @return {boolean}
	 */
	get canDelete() { return this._canDelete; }

	/**
	 * @return {boolean}
	 */
	get alignedToPage() { return this._alignedToPage; }

	/**
	 * @param v {boolean}
	 */
	set alignedToPage(v) {
		if (this._alignedToPage !== v) {
			this._alignedToPage = v;
			this.onChange();
		}
	}

	/**
	 * @return {UnitSystemController}
	 */
	get controller	()  { return this._lengthController; }

	/**
	 * @return {Point}
	 */
	get middle	 	()	{
		this._middle.x  = ( this.a.x + this.b.x ) * .5;
		this._middle.y  = ( this.a.y + this.b.y ) * .5;
		return this._middle;
	}

	/**
	 * @return {Segment}
	 */
	get outNormal	()	{ return this._outNormal; }

	/**
	 * @return {Segment}
	 */
	get inNormal 	()	{ return this._inNormal; }

	/**
	 * @return {boolean}
	 */
	get areNormalsCW()	{ return this._areNormalsCW; }

	/**
	 * @return {LotPointModel}
	 */
	get a() { return this._a; }

	/**
	 * @param origin {LotPointModel}
	 */
	set a(origin)
	{
		if (this.a) {
			this.a.numParents--;
			this.a.removeEventListener(EventBase.CHANGE, this.onChange, this);
		}

		this._a = origin;

		if (this.a) {
			this.a.numParents++;
			this.a.addEventListener(EventBase.CHANGE, this.onChange, this);
			this.onChange();
		}
	}

	/**
	 * @return {LotPointModel}
	 */
	get b() { return this._b; }

	/**
	 * @param d
	 */
	alignToDirection( d )
	{
		this.dispatchEvent( new DataEvent( "alignToDirection", null, false, false, d.toString() ) );
	}

	/**
	 * @param v {LotPathModel}
	 */
	set path(v)
	{
		this._path = v;
		this.setupManipulator();
	}

	/**
	 * @returns {boolean}
	 */
	get showAngleInEdgeLabels() { return this._showAngleInEdgeLabels; }

	/**
	 * @param v {boolean}
	 */
	set showAngleInEdgeLabels(v) { this._showAngleInEdgeLabels = v; }

	onChange()
	{
		// don't dispatch 'change' during init.
		if (typeof this._constructFlag === 'undefined')
			return;

		this.recalculateParams();
		super.onChange();
	}

	recalculateParams()
	{
		if (this._a !== null && this._b !== null) {
			this._b.moveTo(
				this._a.x + Math.cos(this._angleController.radians) * this.length,
				this._a.y + Math.sin(this._angleController.radians) * this.length
			);
		}
	}

	/**
	 * @return {Point}
	 */
	getSegmentCenter() { return this.center; }

	manipulationComplete()
	{
		this.onRestored();
	}

	/**
	 * @param forceDelete {boolean} overrides the canDelete flag when set to true
	 */
	deleteEdge( forceDelete=false )
	{
		// if we can't delete this edge and deletion isn't forced, ignore the call
		if ( !this.canDelete && !forceDelete )
			return;

		this.a = null;

		if (this._b) {
			this._b.removeEventListener(EventBase.CHANGE, this.onChange, this);
			this._b.numParents--;
			this._b = null;
		}

		if (this._manipulator) {
			try {
				this._manipulator.targetDeleted();
				this._manipulator = null;
			}	catch(e) { }
		}

		// dispatch the DELETE event to the view
		this.onDelete();
	}

	/**
	 * @REFACTOR: move this functionality to the Lot
	 * @param pathEdges {Array}
	 */
	updateNormals( pathEdges )
	{
		// reset the normals
		let ray1 = new Point(), ray2 = new Point();
        
		// recalculate the starting point of the normals
        this._middle.x  = (this.a.x + this.b.x) * .5;
        this._middle.y  = (this.a.y + this.b.y) * .5;

		if (!this.a.equals(this.b)) {
			ray1.x		= this._middle.x + Math.cos( this._angleController.radians + Math.PI/2 ) * LotEdgeModel.FAR_NORMAL;
			ray1.y		= this._middle.y + Math.sin( this._angleController.radians + Math.PI/2 ) * LotEdgeModel.FAR_NORMAL;
			ray2.x		= this._middle.x + Math.cos( this._angleController.radians - Math.PI/2 ) * LotEdgeModel.FAR_NORMAL;
			ray2.y		= this._middle.y + Math.sin( this._angleController.radians - Math.PI/2 ) * LotEdgeModel.FAR_NORMAL;
		}	else {
			ray1.x		= this._middle.x;
			ray1.y		= this._middle.y-10;
			ray2.x		= this._middle.x;
			ray2.y		= this._middle.y+10;
		}

		// find out which ray goes inward and which goes outwards
		let i, numIntersections=0, edge;

		for (i=0; i<pathEdges.length; ++i) {
			edge = pathEdges[i];
			if ( edge === this ) {
				continue;
			}

			// count the number of intersections with ray1
			if ( Geom.segmentIntersectionCoords(
				edge.a.x, edge.a.y, edge.b.x, edge.b.y,
				this._middle.x, this._middle.y, ray1.x, ray1.y
			) ) {
				++numIntersections;
			}
		}

		if ( numIntersections%2 ) {
			// we have an odd number of intersections. for any type of polygon, ray1 starts inwards
			this._inNormal.b	= ray1;
			this._outNormal.b	= ray2;
			this._areNormalsCW	= true;
		}	else {
			// we have an even number of intersections. for any type of polygon, ray1 starts outwards
			this._inNormal.b	= ray2;
			this._outNormal.b	= ray1;
			this._areNormalsCW	= false;
		}

		// normalize the normals to close distance
		// this is done to give higher accuracy in calculations (i.e. easement/envelope positioning)
		this._inNormal.normalize(LotEdgeModel.CLOSE_NORMAL);
		this._outNormal.normalize(LotEdgeModel.CLOSE_NORMAL);

		this.resetExclusionParams();
		this.dispatchEvent(new LotEdgeEvent(LotEdgeEvent.UPDATE_NORMALS, this));
	}

	/**
	 * @return {boolean}
	 */
	get isABDirection()
	{
		return true;
	}

    /**
     * @return {string}
     * @protected
     */
	get angleDescription()
	{
		return this._angleController.degrees+"° "+
			   this._angleController.minutes+"' "+
			   this._angleController.seconds+"''";
	}

	/**
	 * Returns a string that indicates the meters & angle of this edge
	 * @return {string}
	 */
	get description()
	{
		return (this.showAngleInEdgeLabels ? this.angleDescription + " - ": '') +
			   (Math.round(this.length*100)/100.0 )+"m";
	}

	/**
	 * @return {string}
	 */
	toString()
	{
		return "[edge ("+this.a+")->("+this.b+")\n\t\tNORMAL="+this._outNormal+"\n\t\tEX="+this.exclusionArea+"]";
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Manipulation implementation

	manipulate()
	{
		this.dispatchEvent( new LotEdgeEvent(LotEdgeEvent.MANIPULATE, this) );
	}

	/**
	 * return {LotEdgeManipulator}
	 */
	get manipulator() { return this._manipulator; }

	/**
	 * @param a {LotPointModel}
	 */
	setupManipulator( a=null )
	{
		// Must be created in subclasses
	}

	/**
	 * @param scale {number}
	 */
	manipulateScale(scale)
	{
		this.length *= scale;
	}

	/**
	 * Fixes the meters to a maximum of 6 decimal places
	 */
	fixPrecision()
	{
		this._lengthController.fixPrecision();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IExcludingEdge implementation

	/**
	 * Returns a semi-plane that starts from the boundary of this edge and extends indefinitely towards the
	 * outside of the lot that this edge is a part of.
	 *
	 * @return {Quadrilateral}
	 */
	get exclusionArea()
	{
		if ( !this._exclusionArea )
		{
			this._exclusionArea = Quadrilateral.getLineNormalExclusionArea(
				new Point( this.a.x, this.a.y ), new Point( this.b.x, this.b.y ), this._outNormal
			);
		}
		return this._exclusionArea;
	}

	/**
	 * Since this is a single segment, it defines the exclusion area by itself
	 * @return {Array<Segment>}
	 */
	get excludingSegments()
	{
		if (!this._excludingSegments) {
			 this._excludingSegments = [ new Segment(new Point(this.a.x, this.a.y), new Point(this.b.x, this.b.y)) ];
		}
		return this._excludingSegments;
	}

	/**
	 * LotEdgeAngle of the exclusion segment
	 * @return {number}
	 */
	get exclusionAngle()
	{
		return this._angleController.radians;
	}

	/**
	 * Resets cached exclusion parameters
	 */
	resetExclusionParams()
	{
		this._exclusionArea = null;
		this._excludingSegments = null;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @return {*}
	 */
	recordState()
	{
		return {
			a			: this._a.recordState(),
			length		: this._lengthController.meters,
			angle		: this._angleController.recordState()
		};
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {*}
	 */
	restoreState(state)
	{
		// don't validate any variables until restoration completes
		this._isRestoring = true;

		this._a.restoreState(state.a);
		this._angleController.restoreState(state.angle);
		this._lengthController.meters = state.length;

		// make sure the exclusion data is rebuilt
		this.resetExclusionParams();

		// data restoration has completed
		this._isRestoring = false;
		this.onRestored();
	}
}