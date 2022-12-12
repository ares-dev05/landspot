import EventBase from '../../../events/EventBase';
import HighlightableModel from '../../../events/HighlightableModel';
import Segment from '../../../geom/Segment';

export default class HeightEnvelopeModel extends HighlightableModel{

	// Rebuilt event name
	static get REBUILT()	{ return 'envelope.Rebuilt';}

	/**
	 * @param measurements {MeasurementsLayerModel}
	 * @param topography {LotTopographyModel}
	 * @param floorPosition {FloorPositionModel}
	 */
	constructor (measurements, topography, floorPosition) {
		super();

		/**
		 * @type {EnvelopeBuilder}
		 * @private
		 */
		this._builder 		= null;

		/**
		 * @type {number}
		 * @private
		 */
		this._lotWidth 		= 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._leftHeight 	= 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._rightHeight 	= 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._leftSlope 	= 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._rightSlope 	= 0;

		/**
		 * @type {EnvelopeSegment[]}
		 * @private
		 */
		this._segments		= [];

		/**
		 * @type {MeasurementsLayerModel}
		 * @private
		 */
		this._measurements	= measurements;

		/**
		 * @type {LotTopographyModel}
		 * @private
		 */
		this._topography		= topography;

		/**
		 * @type {FloorPositionModel}
		 * @private
		 */
		this._floorPosition	= floorPosition;
	}

	/**
	 * the measurements from Sitings, containing the two setbacks
	 * @return {MeasurementsLayerModel}
	 * @public
	 */
	get measurements() {
		return this._measurements;
	}

	/**
	 * height levels layer from Sitings
	 * @return {LotTopographyModel}
	 * @public
	 */
	get topography() {
		return this._topography;
	}

	/**
	 * the segments that make up this envelope
	 * @return {EnvelopeSegment[]}
	 * @public
	 */
	get segments() {
		return this._segments;
	}

	/**
	 * stores data on the floor's positioning (horizontally and vertically)
	 * @return {FloorPositionModel}
	 * @public
	 */
	get floorPosition() {
		return this._floorPosition;
	}

	/**
	 * setting lotWidth triggers the re-calculation of the entire envelope.
	 * @return {number}
	 * @public
	 */
	get lotWidth() {
		return this._lotWidth;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set lotWidth(v) {
		this._lotWidth = v;
		this._builder.rebuild();
	}

	/**
	 * relative height of the lot at the left & right sides, measured from the base (lowest height in the lot)
	 * @return {number}
	 * @public
	 */
	get leftHeight() {
		return  this._leftHeight;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get rightHeight() {
		return this._rightHeight;
	}

	/**
	 * slopes on the left & right sides of the lot
	 * @return {number}
	 * @public
	 */
	get leftSlope() {
		return  this._leftSlope;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get rightSlope() {
		return this._rightSlope;
	}

	/**
	 * worker that builds the envelope pieces using the currently selected settings
	 * @return {null|EnvelopeBuilder}
	 * @public
	 */
	get builder() {
		return this._builder;
	}

	/**
	 * @param v {EnvelopeBuilder}
	 * @public
	 */
	set builder(v) {
		if (this.builder) {
			this.builder.removeEventListener(EventBase.CHANGE, this.onRebuilt, this);
			this.builder.envelope = null;
		}

		this._builder = v;
		if (this._builder) {
			this._builder.addEventListener(EventBase.CHANGE, this.onRebuilt, this);
			this._builder.envelope = this;
		}
	}

	/**
	 * @private
	 */
	onRebuilt() {
		this.dispatchEvent(new EventBase(HeightEnvelopeModel.REBUILT, this));
	}

	/**
	 * @public
	 */
	rebuild() {
		if (this._builder) {
			this._builder.rebuild();
		}
	}

	/**
	 * @public
	 */
	rebuildGround() {
		if (this._builder) {
			this._builder.rebuildGround();
		}
	}

	/**
	 * remove all of the envelope's segments
	 * @public
	 */
	clear() {
		this._segments.splice(0, this._segments.length);
	}

	/**
	 * remove all the ground segments
	 * @public
	 */
	clearGround() {
		for (let index = this._segments.length - 1; index >= 0; --index) {
			if (this._segments[index].isGround) {
				this._segments.splice(index, 1);
			}
		}
	}

	/**
	 * add a new segment to the envelope structure
	 * @param segment {EnvelopeSegment}
	 * @public
	 */
	add(segment) {
		this._segments.push(segment);
	}

	/**
	 * determine the height of the lot on both the left & right sides (i.e. the points where the setback measurements are attached to the boundaries)
	 * determine the slopes of the left & right sides
	 * @return {boolean} true if the lot was analysed successfully, false if some mandatory data is missing
	 * @public
	 */
	analyseLot() {
		// make sure we have both setbacks
		if (!this.measurements.leftSetback || !this.measurements.rightSetback)
			return false;

		/** @Details for each side:
				1. clone the setback (or an inwards-pointed normal with length=1m if setback=0)
				2. determine the slope of the setback & height at the start.
				3. using the height & slope, determine the height along the way by interpolating from levels
		 */

		/** @General : determine the lowest level in the lot */
		const baseLevel = this.topography.baseLevel;

		/** @LeftSide: determine parameters for the left side */
		let leftNormal;
		if (this.measurements.leftSetback.distance > 0.01) {
			leftNormal = new Segment(
				this.measurements.leftSetback.intersection.clone(),
				this.measurements.leftSetback.origin.clone()
			);
		}	else {
			// fetch the inwards-pointing normal
			leftNormal = this.measurements.leftSetback.edge.inNormal.clone();
			leftNormal.normalize(1);
		}

		// fetch the starting height of the envelope
		this._leftHeight = this.topography.heightLevel(leftNormal.a.x, leftNormal.a.y) - baseLevel;

		// determine the slope, as the tangent between the length of the normal, and the height difference along the normal
		this._leftSlope = Math.atan2(
			// Y difference
			this.topography.heightLevel(leftNormal.b.x, leftNormal.b.y) - baseLevel - this.leftHeight,
			// X difference
			leftNormal.length
		);

		/** @RightSide: determine parameters for the left side */
		let rightNormal;
		if (this.measurements.rightSetback.distance) {
			rightNormal	= new Segment(
				this.measurements.rightSetback.intersection.clone(),
				this.measurements.rightSetback.origin.clone()
			);

		}	else {
			// fetch the inwards-pointing normal
			rightNormal	= this.measurements.rightSetback.edge.inNormal.clone();
			rightNormal.normalize( 1 );
		}

		// fetch the starting height of the envelope
		this._rightHeight	= this.topography.heightLevel(rightNormal.a.x, rightNormal.a.y) - baseLevel;

		// determine the slope, as the tangent between the length of the normal, and the height difference along the normal
		this._rightSlope		= Math.atan2(
			// Y difference
			this.topography.heightLevel(rightNormal.b.x, rightNormal.b.y) - baseLevel - this.rightHeight,
			// X difference
			rightNormal.length
		);

		/** @HouseLevels: determine the height of the lot at the sides of the house (-the house padding) */
		if (this.measurements.leftSetback.distance > this.floorPosition.housePadding) {
			// re-create the normal - it may have been resized
			leftNormal = new Segment(this.measurements.leftSetback.intersection.clone(), this.measurements.leftSetback.origin.clone());
			// remove the padding from the left setback
			leftNormal.normalize(leftNormal.length - this.floorPosition.housePadding);
			// determine the ground level at the left of the house
			this.floorPosition.groundLeftLevel	= this.topography.heightLevel(leftNormal.b.x, leftNormal.b.y) - baseLevel;
			this.floorPosition.padLeftDistance	= leftNormal.length;
		}	else {
			// determine the ground level at the start of the left setback, on the boundary
			this.floorPosition.groundLeftLevel	= this.topography.heightLevel(
				this.measurements.leftSetback.intersection.x,
				this.measurements.leftSetback.intersection.y
			) - baseLevel;
			this.floorPosition.padLeftDistance	= 0;
		}

		/** @HouseLevels - right side */
		if (this.measurements.rightSetback.distance > this.floorPosition.housePadding) {
			// re-create the normal - it may have been resized
			rightNormal = new Segment(this.measurements.rightSetback.intersection.clone(), this.measurements.rightSetback.origin.clone());
			// remove the padding from the left setback
			rightNormal.normalize(rightNormal.length - this.floorPosition.housePadding);
			// determine the ground level at the left of the house
			this.floorPosition.groundRightLevel	= this.topography.heightLevel(rightNormal.b.x, rightNormal.b.y) - baseLevel;
			this.floorPosition.padRightDistance	= rightNormal.length;
		}	else {
			// determine the ground level at the start of the left setback, on the boundary
			this.floorPosition.groundRightLevel	= this.topography.heightLevel(
				this.measurements.rightSetback.intersection.x,
				this.measurements.rightSetback.intersection.y
			) - baseLevel;
			this.floorPosition.padRightDistance	= 0;
		}

		/** @HouseLevels - calculate the average house pad level */
		let analysis = this.topography.getHouseAverageLevel(this.floorPosition.housePadding);
		this.floorPosition.padLowLevel = analysis.low - baseLevel;
		this.floorPosition.padHighLevel	= analysis.high - baseLevel;
		// @INFO: set the pad level last because this triggers an update in the Cut&Fill controls
		this.floorPosition.padLevel = (this.floorPosition._userChangedPad + analysis.level) - baseLevel - this.topography.vegScrape;

		// the lot was successfully analysed
		return true;
	}

	/**
	 * @TODO recordState
	 * returns a data structure containing all the parameters representing this object's state
	 * @public
	 */
	recordState() {
		return {};
	}

	/**
	 * @TODO restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 * @public
	 */
	restoreState(state) {
	}

}
