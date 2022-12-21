import EventBase from "../../events/EventBase";

export default class TransformEvent extends EventBase {

	static get TRANSLATE() {return "TransformEvent.TRANSLATE"; }
	static get ROTATE() {return "TransformEvent.ROTATE"; }
	static get SHAPE() {return "TransformEvent.SHAPE"; }

	/**
	 * @param type {string}
	 * @param transform {*}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, transform, dispatcher=null, bubbles=false, cancelable=false )
	{
		super(type, dispatcher, bubbles, cancelable);

		/**
		 * @type {*}
		 * @private
		 */
		this._transform = transform;
	}

	/**
	 * @return {Object}
	 */
	get transform()
	{
		return this._transform;
	}

	/**
	 * @return {number}
	 */
	get dx()
	{
		return this._transform.dx;
	}
	/**
	 * @return {number}
	 */
	get dy()
	{
		return this._transform.dy;
	}
	/**
	 * @return {number}
	 */
	get rotation()
	{
		return this._transform.rotation;
	}

	/**
	 * @return {*}
	 */
	get model()
	{
		return this._transform.model;
	}
}