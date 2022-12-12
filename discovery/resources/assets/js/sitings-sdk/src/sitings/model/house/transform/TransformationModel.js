import HighlightableModel from '../../../../events/HighlightableModel';
import TransformationMeasurementModel from './TransformationMeasurementModel';
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';
import EventBase from '../../../../events/EventBase';
import Point from '../../../../geom/Point';
import Geom from '../../../../utils/Geom';
import Rectangle from '../../../../geom/Rectangle';
import Segment from '../../../../geom/Segment';

/**
 * @type {string[]}
const dirLabels = [ "no direction", "left", "top", "right", "bottom" ];
 */

/**
 * Use 10KM as the far-distance that we use to calculate what area of the house plan is affected by the transformation
 *
 * @type {number}
 */
const FAR_DISTANCE = 10000;

/**
 * A Single house transformation that extends / reduces the floorplan, or adds a new rectangular element
 *
 * @DISPATCHES 'applied.changed'
 */
export default class TransformationModel extends HighlightableModel {

	static get APPLIED_CHANGED() { return 'applied.changed'; }

	static get REDUCTION()		 { return 1; }
	static get EXTENSION()		 { return 2; }
	static get ADDON()		 	 { return 3; }

	// possible directions
	static get DIR_LEFT()		 { return 1; }
	static get DIR_TOP()		 { return 2; }
	static get DIR_RIGHT()		 { return 3; }
	static get DIR_BOTTOM() 	 { return 4; }

	/**
	 * @param isAddition {boolean}
	 * @param type {number}
	 * @param context {*}
	 */
	constructor(isAddition=false, type=1, context=null)
	{
		super(context);

		/**
		 * True if this transformation is an addition (classic extension) to the floor
		 *
		 * @type {boolean}
		 * @private
		 */
		this._isAddition = isAddition;

		/**
		 * @type {number}
		 * @private
		 */
		this._x = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._y = 0;

		/**
		 * We must accept the width as a string to allow values with multiple 0 decimals
		 * @type {string}
		 * @private
		 */
		this._widthString = '0';

		/**
		 * @type {number}
		 * @private
		 */
		this._width = 0;

		/**
		 * We must accept the height as a string to allow values with multiple 0 decimals
		 * @type {string}
		 * @private
		 */
		this._heightString = '0';

		/**
		 * @type {number}
		 * @private
		 */
		this._height = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._type = type;

		/**
		 * For additions, this indicates the direction of connection with a segment of the floor plan
		 *
		 * @type {number}
		 * @private
		 */
		this._direction = TransformationModel.DIR_LEFT;

		/**
		 * True when the user selects to apply the transformation to the floor
		 *
		 * @type {boolean}
		 * @private
		 */
		this._applied = false;

		/**
		 * The segment to which the addition has snapped
		 *
		 * @type {Segment}
		 */
		this._addonSnapSegment	= null;

		/**
		 * First add-on measurement
		 *
		 * @type {TransformationMeasurementModel}
		 * @private
		 */
		this._addonAnchorA	= new TransformationMeasurementModel();

		/**
		 * Second add-on measurement
		 *
		 * @type {TransformationMeasurementModel}
		 * @private
		 */
		this._addonAnchorB	= new TransformationMeasurementModel();

		/**
		 * @type {TransformationMeasurementModel[]}
		 * @private
		 */
		this._addonAnchors	= [this._addonAnchorA, this._addonAnchorB];

		// Hide both measurements until the transformation is created
		this._addonAnchorA.visible =
		this._addonAnchorB.visible = false;

		this._addonAnchorA.addEventListener(MeasurementPointEvent.RESIZING, this.onMeasurementResize, this);
		this._addonAnchorB.addEventListener(MeasurementPointEvent.RESIZING, this.onMeasurementResize, this);

		this._addonAnchorA.addEventListener(MeasurementPointEvent.EDIT, this.onMeasurementEdit, this);
		this._addonAnchorB.addEventListener(MeasurementPointEvent.EDIT, this.onMeasurementEdit, this);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Getters / Setters

	/**
	 * @param value {number}
	 */
	set x(value) {
		this._addonAnchorA.moveExtension( value-this._x, 0 );
		this._addonAnchorB.moveExtension( value-this._x, 0 );
		this._x = value;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get x() { return this._x; }

	/**
	 * @param value {number}
	 */
	set y(value) {
		this._addonAnchorA.moveExtension( 0, value-this._y );
		this._addonAnchorB.moveExtension( 0, value-this._y );
		this._y = value;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get y() { return this._y; }

	/**
	 * @param v {string}
	 */
	set widthString(v) {
		this._widthString = v;
		const asNumber = Number.parseFloat(v);
		if (!Number.isNaN(asNumber)) {
			this.width = asNumber;
		}
	}

	/**
	 * @returns {string}
	 */
	get widthString() {
		return this._widthString;
	}

	/**
	 * @param v {number}
	 * @private
	 */
	set width(v) { this._width = v; this.onChange(); }

	/**
	 * @return {number}
	 */
	get width() { return this._width; }

	/**
	 * @param v {string}
	 */
	set heightString(v) {
		this._heightString = v;
		const asNumber = Number.parseFloat(v);
		if (!Number.isNaN(asNumber)) {
			this.height = asNumber;
		}
	}

	/**
	 * @returns {string}
	 */
	get heightString() {
		return this._heightString;
	}

	/**
	 * @param v {number}
	 */
	set height(v) { this._height = v; this.onChange(); }

	/**
	 * @return {number}
	 */
	get height() { return this._height; }

	/**
	 * @param v {number}
	 */
	set type(v)		 { this._type = v; this.onChange(); }

	/**
	 * @return {number}
	 */
	get type()		 { return this._type; }

	/**
	 * @param v {number}
	 */
	set direction(v) { this._direction = v; this.onChange(); }

	/**
	 * @return {number}
	 */
	get direction()	 { return this._direction; }

	/**
	 * @return {boolean}
	 */
	isHorizontal() {
		return this._direction === TransformationModel.DIR_LEFT ||
			   this._direction === TransformationModel.DIR_RIGHT;
	}

	/**
	 * @return {boolean}
	 */
	isVertical() {
		return this._direction === TransformationModel.DIR_TOP ||
			   this._direction === TransformationModel.DIR_BOTTOM;
	}

	/**
	 * @TODO @RENAME transformAngle
	 * @return {number}
	 */
	get tAngle() { return this.isHorizontal() ? 0 : Math.PI/2; }

	/**
	 * @return {boolean}
	 */
	get applied() { return this._applied; }

	/**
	 * @param value {boolean}
	 */
	set applied(value) {
		if (value!==this._applied) {
			this._applied=value;
			this.dispatchEvent(new EventBase(TransformationModel.APPLIED_CHANGED, this));
		}
	}

	/**
	 * @return {boolean}
	 */
	get isAddition() { return this._isAddition; }

	/**
	 * @return {TransformationMeasurementModel[]}
	 */
	get addonAnchors() { return this._addonAnchors; }

	/**
	 * @return {number}
	 */
	get addonArea() { return this._isAddition ? (this.width*this.height ) : 0; }


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Transformation Regions

	/**
	 * Returns a rectangle that defines which area of the house plan is affected by the transformation
	 *
	 * @return {Rectangle}
	 */
	get transformBounds()
	{
		if (this.isAddition) {
			return null;
		}

		switch (this.direction) {
			case TransformationModel.DIR_LEFT:
				return new Rectangle(
					this.x+this.width-FAR_DISTANCE, this.y, FAR_DISTANCE, this.height
				);

			case TransformationModel.DIR_RIGHT:
				return new Rectangle(
					this.x, this.y, FAR_DISTANCE, this.height
				);

			case TransformationModel.DIR_TOP:
				return new Rectangle(
					this.x, this.y+this.height-FAR_DISTANCE, this.width, FAR_DISTANCE
				);

			case TransformationModel.DIR_BOTTOM:
				return new Rectangle(
					this.x, this.y, this.width, FAR_DISTANCE
				);

			default:
				return null;
		}
	}

	/**
	 * A line that indicates where the house plan is 'cut' and the transformation applied
	 *
	 * @return {Segment|null}
	 */
	get transformLine()
	{
		if (this.isAddition) {
			return null;
		}

		switch (this.direction) {
			case TransformationModel.DIR_LEFT:
				return new Segment(new Point(this.x+this.width, this.y), new Point(this.x+this.width, this.y+this.height));

			case TransformationModel.DIR_RIGHT:
				return new Segment(new Point(this.x, this.y), new Point(this.x, this.y+this.height));

			case TransformationModel.DIR_TOP:
				return new Segment(new Point(this.x, this.y+this.height), new Point(this.x+this.width, this.y+this.height));

			case TransformationModel.DIR_BOTTOM:
				return new Segment(new Point(this.x, this.y), new Point(this.x+this.width, this.y));
		}

		return null;
	}

	/**
	 * The translation amount applied to edges/vertices of the house plan that are within the affected area
	 *
	 * @return {Point}
	 */
	get transformDelta()
	{
		if (this.isAddition) {
			return null;
		}

		// Delta is reversed for reductions
		const K = this.type===TransformationModel.REDUCTION ? -1 : 1;

		switch (this.direction) {
			case TransformationModel.DIR_LEFT:
				return new Point(-this.width * K, 0);

			case TransformationModel.DIR_RIGHT:
				return new Point( this.width * K, 0);

			case TransformationModel.DIR_TOP:
				return new Point(0, -this.height * K);

			case TransformationModel.DIR_BOTTOM:
				return new Point(0,  this.height * K);

			default:
				return null;
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Operations

	/**
	 * @param e {MeasurementPointEvent}
	 */
	onMeasurementResize(e)
	{
		let delta = e.point.getResizeDelta(e.distance);

		this._x += delta.x;
		this._y += delta.y;
		this._addonAnchorA.moveExtension( delta.x, delta.y );
		this._addonAnchorB.moveExtension( delta.x, delta.y );

		this.onChange();
	}

	/**
	 * Propagate edit events
	 * @param e
	 */
	onMeasurementEdit(e)	{ this.dispatchEvent(e); }

	/**
	 * Delete & cleanup
	 */
	deleteTransformation()
	{
		if (this._addonAnchorA) {
			this._addonAnchorA.removeEventListener(MeasurementPointEvent.RESIZING, this.onMeasurementResize, this);
			this._addonAnchorA.removeEventListener(MeasurementPointEvent.EDIT, this.onMeasurementEdit, this);
			this._addonAnchorA.deleteMeasurement();
			this._addonAnchorA = null;
		}
		if (this._addonAnchorB) {
			this._addonAnchorB.removeEventListener(MeasurementPointEvent.RESIZING, this.onMeasurementResize, this);
			this._addonAnchorB.removeEventListener(MeasurementPointEvent.EDIT, this.onMeasurementEdit, this);
			this._addonAnchorB.deleteMeasurement();
			this._addonAnchorB = null;
		}

		this.onDelete();
	}

	/**
	 * @param dx {number}
	 * @param dy {number}
	 */
	translate(dx, dy)
	{
		this._x += dx;
		this._y += dy;

		this._addonAnchorA.translate( dx, dy );
		this._addonAnchorB.translate( dx, dy );

		this.onChange();
	}

	/**
	 * @return {Point[]}
	 */
	get edgeCenters()
	{
		return new [
			new Point(this.x+this.width/2, this.y 		 		),
			new Point(this.x+this.width	 , this.y+this.height/2 ),
			new Point(this.x+this.width/2, this.y+this.height 	),
			new Point(this.x			 , this.y+this.height/2 )
		];
	}

	/**
	 * @param floor {HouseModel}
	 */
	snapToFloor(floor)
	{
		if (!floor || this.isAddition===false) {
			return;
		}

		let cornerIndx, dirIndx, crtx, crty, hitPoint, hitDistance, bestPoint, bestDistance=Infinity, snapPosition;

		for (cornerIndx=0; cornerIndx<4; ++cornerIndx) {
			crtx = this.x + this.width * (cornerIndx &  1);
			crty = this.y + this.height* (cornerIndx >> 1);

			// go over the two possible directions: H / V
			for (dirIndx=1; dirIndx<=2; ++dirIndx) {
				hitPoint = floor.getSnapPosition(crtx, crty);

				if ( hitPoint ) {
					hitDistance = Geom.segmentLength(crtx, crty, hitPoint.x, hitPoint.y);

					if (hitDistance < bestDistance) {
						bestDistance	= hitDistance;
						bestPoint		= new Point( crtx, crty );
						snapPosition	= hitPoint;
						// @UNUSED
						// snapDirection	= (dirIndx===1 ? AddonMeasurementModel.DIR_VERT : AddonMeasurementModel.DIR_HORIZ);
					}
				}
			}
		}

		if (bestPoint) {
			this._addonSnapSegment = floor.getClosestMetricSegmentTo(snapPosition.x, snapPosition.y);

			if (this._addonSnapSegment) {
				// verify if the add-on is closer to the segment on the horizontal or vertical
				if (Math.abs(this._addonSnapSegment.a.x - this._addonSnapSegment.b.x) <
					Math.abs(this._addonSnapSegment.a.y - this._addonSnapSegment.b.y)) {
					this._direction = TransformationMeasurementModel.DIR_VERT;
				} else {
					this._direction = TransformationMeasurementModel.DIR_HORIZ;
				}

				this._x += (snapPosition.x - bestPoint.x);
				this._y += (snapPosition.y - bestPoint.y);
			}	else {
				this._direction = 0;
			}
		}	else {
			this._addonSnapSegment = null;
			this._direction = 0;
		}

		// update the snap measurement points
		this.updateAddOnMeasurements();
		this.onChange();
	}

	/**
	 * update the add-on measurements
	 * @private
	 */
	updateAddOnMeasurements()
	{
		if ( this._addonSnapSegment )
		{
			this._addonAnchorA.direction =
			this._addonAnchorB.direction = this._direction;

			// create two perpendicular edges for measurements
			switch (this._direction)
			{
				case TransformationMeasurementModel.DIR_VERT:
					this._addonAnchorA.extensionAnchor.y = this.y;
					this._addonAnchorB.extensionAnchor.y = this.y + this.height;

					this._addonAnchorA.segmentAnchor.y	 = Math.min(this._addonSnapSegment.a.y, this._addonSnapSegment.b.y);
					this._addonAnchorB.segmentAnchor.y	 = Math.max(this._addonSnapSegment.a.y, this._addonSnapSegment.b.y);

					this._addonAnchorB.segmentAnchor.x	 = this._addonAnchorB.extensionAnchor.x =
					this._addonAnchorA.segmentAnchor.x	 = this._addonAnchorA.extensionAnchor.x = this.x + this.width/2;
					break;

				case TransformationMeasurementModel.DIR_HORIZ:
					this._addonAnchorA.extensionAnchor.x = this.x;
					this._addonAnchorB.extensionAnchor.x = this.x + this.width;

					this._addonAnchorA.segmentAnchor.x	 = Math.min(this._addonSnapSegment.a.x, this._addonSnapSegment.b.x);
					this._addonAnchorB.segmentAnchor.x	 = Math.max(this._addonSnapSegment.a.x, this._addonSnapSegment.b.x);

					this._addonAnchorB.segmentAnchor.y	 = this._addonAnchorB.extensionAnchor.y =
					this._addonAnchorA.segmentAnchor.y	 = this._addonAnchorA.extensionAnchor.y = this.y + this.height / 2;
					break;

				default:
					return;
			}
		}	else {
			// remove the snap measurements
			this._addonAnchorA.visible = this._addonAnchorB.visible = false;
		}

		// make sure the two measurement points are updated & visible
		this._addonAnchorA.visible = this._addonAnchorB.visible = true;
		this._addonAnchorA.recalculate();
		this._addonAnchorB.recalculate();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @return {{}}
	 */
	recordState ()
	{
		return {
			x			: this._x,
			y			: this._y,
			width		: this._width,
			height		: this._height,
			type		: this._type,
			direction	: this._direction,
			applied		: this._applied,
			isAddition	: this._isAddition
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {{}}
	 */
	restoreState( state )
	{
		this._x			   = state.x;
		this._y			   = state.y;
		this._width		   = state.width;
		this._widthString  = this._width + "";
		this._height	   = state.height;
		this._heightString = this._height + "";
		this._type		   = state.type;
		this._direction	   = state.direction;
		this._applied	   = state.applied;
		this._isAddition   = state.isAddition;
		this._addonSnapSegment= null;

		if (this.isAddition) {
			this.updateAddOnMeasurements();
		}

		this.onRestored();
	}
}