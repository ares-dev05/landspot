import RestoreDispatcher from '../../../events/RestoreDispatcher';
import LotPointModel from '../lot/LotPointModel';
import ModelEvent from '../../events/ModelEvent';
import EventBase from '../../../events/EventBase';


export default class PosCalculator extends RestoreDispatcher {

	/**
	 * @param context {Object}
	 */
	constructor(context=null) {
		super(context);

		/**
		 * @type {LotPointModel[]}
		 * @private
		 */
		this._points = [];
	}

	/**
	 * @returns {LotPointModel[]}
	 */
	get points()	{ return this._points; }

	/**
	 * @returns {LotPointModel}
	 */
	get lastPoint()	{ return this._points && this._points.length ? this._points[this._points.length-1] : null; }

	/**
	 * @returns {number}
	 */
	get area() {
		if (this._points && this._points.length >= 3) {
			let area = 0, crt, nxt;

			// Concave polygon area calculation
			for (crt=0; crt<this._points.length; ++crt) {
				nxt		= (crt+1) % this._points.length;
				area   += (this.p(crt).x * this.p(nxt).y - this.p(crt).y * this.p(nxt).x);
			}

			return Math.abs(area/2);
		}

		return 0;
	}

	/**
	 * @param index {number}
	 * @returns {LotPointModel}
	 * @private
	 */
	p(index) {
		if (this._points && this._points.length ) {
			return this._points[index%this._points.length];
		}
		return null;
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	addPoint(x, y) {
		this._innerAddPoint(x, y);
		this.onAdded();
		this.onChange();
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @protected
	 */
	_innerAddPoint(x, y) {
		const point = new LotPointModel(x, y);

		point.addEventListener(ModelEvent.DELETE, this.onPointDeleted, this);
		point.addEventListener(EventBase.CHANGE,  this.onChange, this);

		this._points.push(point);
	}

	/**
	 * @param e {ModelEvent}
	 */
	onPointDeleted(e)
	{
		const point = e.model;

		point.removeEventListener(ModelEvent.DELETE, this.onPointDeleted, this);
		point.removeEventListener(EventBase.CHANGE,  this.onChange, this);

		this._points.splice(this._points.indexOf(point), 1);

		this.onChange();
	}

	/**
	 * Delete all the points from the POS
	 */
	clear()
	{
		while (this._points.length) {
			this._points[0].deletePoint();
		}

		this.onChange();
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		const pointStates = [];
		for (let i=0; i<this._points.length; ++i) {
			pointStates.push(this._points[i].recordState());
		}

		return {points: pointStates};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		// clear existing points
		this.clear();

		// restore state points
		for (let i=0; i<state.points.length; ++i) {
			this.addPoint(state.points[i].x, state.points[i].y);
		}

		this.onRestored();
	}
}