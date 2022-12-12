import HighlightableModel from '../../../events/HighlightableModel';
import LotPointModel from '../lot/LotPointModel';
import ModelEvent from '../../events/ModelEvent';
import EventBase from '../../../events/EventBase';

export default class LevelPointModel extends HighlightableModel {

	/**
	 * @param position {LotPointModel|Point}
	 * @param height {number}
	 */
	constructor (position = null, height = 0) {
		super();

		/**
		 * @type {LotPointModel|Point}
		 * @private
		 */
		this._position = null;
		this.position = position;

		/**
		 * @type {number}
		 * @private
		 */
		this._height = height;

		/**
		 * @type {Segment[]} Half-line / Ray indicating the direction of inclusion for this level point. The half-line
		 * 		must intersect the queried perimeter an odd number of times for this level point to be included in it.
		 * @private
		 */
		this._inclusionDirections = [];
	}

	/**
	 * @return {Segment[]} half-plane or quadrilateral that this level point can be included in.
	 */
	get inclusionDirections() { return this._inclusionDirections; }

	/**
	 * @param value {Segment[]}
	 */
	set inclusionDirections(value) { this._inclusionDirections = value; }

	/**
	 * @param polygon {Polygon}
	 */
	includeIn(polygon) {
		if (this._inclusionDirections && this._inclusionDirections.length) {
			return this._inclusionDirections.findIndex(direction => polygon.containsPointWithRay(direction)) >= 0;
		}
		
		return true;
	}

	/**
	 * @return {LotPointModel|Point}
	 * @public
	 */
	get position() {
		return this._position;
	}

	/**
	 * @param v {LotPointModel|Point}
	 * @public
	 */
	set position(v) {
		if (this._position) {
			this._position.removeEventListener(EventBase.CHANGE, this.positionChanged, this);
			this._position.removeEventListener(ModelEvent.DELETE, this.positionDeleted, this);
			this._position.removeEventListener(LotPointModel.MOVE_COMPLETE, this.positionedMoveComplete, this);
		}

		this._position = v;
		if (this._position) {
			// we don't really care about movements of the point, unless they are the final position
			this._position.addEventListener(EventBase.CHANGE, this.positionChanged, this);
			this._position.addEventListener(ModelEvent.DELETE, this.positionDeleted, this);
			this._position.addEventListener(LotPointModel.MOVE_COMPLETE, this.positionedMoveComplete, this);
		}
	}

	/**
	 * @return {*}
	 * @public
	 */
	get x() {
		return this._position.x;
	}

	/**
	 * @return {*}
	 * @public
	 */
	get y() {
		return this._position.y;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get height() {
		return this._height;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set height(v) {
		this._height = v;
		this.onChange();
	}

	/**
	 * @return {string}
	 * @public
	 */
	get text() {
		return this.height + 'm';
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	translate(x, y) {
		this._position.translate(x, y);
	}

	/**
	 * @public
	 */
	deletePoint() {
		this.onDelete();
	}

	/**
	 * @protected
	 */
	positionChanged() {
		// overwrite in sub-classes
	}

	/**
	 * @protected
	 */
	positionDeleted() {
		this.deletePoint();
	}

	/**
	 * @param e {EventBase}
	 * @protected
	 */
	positionedMoveComplete(e) {
		this.dispatchEvent(e);
	}

	/**
	 * @private
	 */
	onDelete() {
		// clear the position
		super.onDelete();
		this.position = null;
	}

	/**
	 * @return {{position: {x: number, y: number}, height: number}}
	 */
	recordState() {
		return {
			position: this.position.recordState(),
			height: this._height
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 * @public
	 */
	restoreState(state) {
		this._height = state.height;

		if (!this.position) {
			this.position = new LotPointModel();
		}
		this._position.restoreState(state.position);

		this.onRestored();
	}
}