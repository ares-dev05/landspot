import EventBase from '../../../../events/EventBase';
import HeightPoint from './HeightPoint';
import ModelEvent from '../../../events/ModelEvent';
import RestoreDispatcher from '../../../../events/RestoreDispatcher';

export default class EnvelopeSide extends RestoreDispatcher {

	constructor() {
		super();

		/**
		 * @type {number}
		 * @private
		 */
		this._id = undefined;

		/**
		 * @type {string}
		 * @private
		 */
		this._name = '';

		/**
		 * @type {string}
		 * @private
		 */
		this._category = '';

		/**
		 * @type {HeightPoint[]}
		 * @private
		 */
		this._points = [];

		/**
		 * @type {boolean}
		 * @private
		 */
		this._sortInvalid = true;

		/**
		 * @type {HeightPoint[]}
		 * @private
		 */
		this._sortedPoints = [];
	}

	/**
	 * @return {number}
	 * @public
	 */
	get id() {
		return this._id;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set id(v) {
		this._id = v;
	}

	/**
	 * @return {string}
	 * @public
	 */
	get name() {
		return this._name;
	}

	/**
	 * @param v {string}
	 * @public
	 */
	set name(v) {
		this._name = v;
	}

	/**
	 * @return {string}
	 * @public
	 */
	get category() {
		return this._category;
	}

	/**
	 * @param v {string}
	 * @public
	 */
	set category(v) {
		this._category = v;
	}

	/**
	 * @return {HeightPoint[]}
	 * @public
	 */
	get points() {
		return this._points;
	}

	/**
	 * @return {HeightPoint|null}
	 * @public
	 */
	get lastPoint() {
		return this.points.length ? this.points[this.points.length-1] : null;
	}

	/**
	 * sort the points by their distance from the boundary and returns the new list
	 * @return {HeightPoint[]}
	 * @public
	 */
	get sortedPoints() {
		if (this._sortInvalid) {
			this._sortedPoints = this._points.concat();
			this._sortedPoints.sort(HeightPoint.sortWidth);
			this._sortInvalid = false;
		}

		return this._sortedPoints;
	}

	/**
	 * return the maximum length of this envelope side
	 * @return {number}
	 * @public
	 */
	get width() {
		return this.sortedPoints.length ? this.sortedPoints[this.sortedPoints.length-1].width : 0;
	}

	/**
	 *
	 * @param p {HeightPoint}
	 * @param dispatchChange {Boolean}
	 */
	addPoint(p, dispatchChange = true) {
		if (p) {
			p.addEventListener(EventBase.CHANGE, this.pointChanged, this);
			p.addEventListener(ModelEvent.DELETE, this.pointDeleted, this);
			this._points.push(p);
			this._sortInvalid = true;
			this.onAdded();

			if (dispatchChange) {
				this.onChange();
			}
		}
	}

	addNextPoint() {
		this.addPoint(new HeightPoint(0, this.lastPoint ? this.lastPoint.height : 0));
	}

	/**
	 * @private
	 */
	pointChanged() {
		this._sortInvalid = true;
		this.onChange();
	}

	/**
	 * @param e {ModelEvent}
	 * @param dispatchChange {boolean}
	 * @private
	 */
	pointDeleted(e, dispatchChange = true) {
		const p = e.model;
		if (p) {
			p.removeEventListener(EventBase.CHANGE, this.pointChanged, this);
			p.removeEventListener(ModelEvent.DELETE, this.pointDeleted, this);
			this._points.splice(this._points.indexOf(p), 1);
			this._sortInvalid = true;

			if (dispatchChange) {
				this.onChange();
			}
		}
	}

	/**
	 * @param dispatchChange {boolean}
	 * @public
	 */
	clear(dispatchChange = true) {
		// delete all points in a single loop so we don't dispatch 'CHANGE' for each deletion
		while (this._points && this._points.length) {
			const p = this._points.shift();
			p.removeEventListener(EventBase.CHANGE, this.pointChanged, this);
			p.removeEventListener(ModelEvent.DELETE, this.pointDeleted, this);
		}

		this._sortInvalid = true;

		if (dispatchChange){
			this.onChange();
		}
	}

	/**
	 * @return {{points: []}}
	 * @public
	 */
	recordState() {
		// serialize the points
		return {
			points: this.points.map(point => point.recordState())
		};
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{points: []}} the state to be restored
	 * @public
	 */
	restoreState(state) {
		// clear all the points without
		this.clear(false);

		// add back points without dispatching change
		state.points.forEach(point =>
			this.addPoint(HeightPoint.fromState(point))
		);

		// dispatch restored + change
		this.onRestored();
	}

	/**
	 * load an envelope from data stored on the server
	 * @param data {EnvelopeData}
	 */
	fromEnvelopeData(data) {
		this._id		= data.id;
		this._name		= data.name;
		this._category	= data.category;

		this.restoreState(data.data);
	}
}