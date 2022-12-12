import EventBase from '../../events/EventBase';

export default class MeasurementPointEvent extends EventBase {

	// dispatched when we start
	static get START()	{ return 'mpe.Start'; }
	// dispatched when we hook the measurement point to the floor
	static get HOOKED()	{ return 'mpe.Hooked'; }
	// start to edit the measurement point
	static get EDIT()	{ return 'mpe.Edit'; }
	// delete this measurement point
	static get DELETE()	{ return 'mpe.Delete'; }
	// resize the measurement distance
	static get RESIZING()	{ return 'mpe.Resize'; }


	/**
	 * @param type {string}
	 * @param point {IMeasurement|Object}
	 * @param distance {number}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, point=null, distance=0, dispatcher=null, bubbles=false, cancelable=false )
	{
		super(type, dispatcher, bubbles, cancelable);

		/**
		 * @type {IMeasurement|Object}
		 * @private
		 */
		this._point = point || this.dispatcher;

		/**
		 * @type {number}
		 * @private
		 */
		this._distance = distance;
	}

	/**
	 * @return {IMeasurement|Object}
	 */
	get point() { return this._point; }

	/**
	 * @return {Number}
	 */
	get distance() { return this._distance; }

	/**
	 * @return {EventBase}
	 */
	clone()
	{
		return new MeasurementPointEvent(this.type, this.point, this.distance, this.dispatcher, this.bubbles, this.cancelable);
	}
}