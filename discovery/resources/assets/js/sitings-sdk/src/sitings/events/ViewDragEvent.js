import EventBase from '../../events/EventBase';

export default class ViewDragEvent extends EventBase {

	static get DRAG()  { return 'dragEvent.DRAG'; }
	static get DROP()  { return 'dragEvent.DROP'; }
	static get CLICK() { return 'dragEvent.CLICK'; }

	/**
	 * @param type {string}
	 * @param dx {number}
	 * @param dy {number}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, dx, dy, dispatcher=null, bubbles=false, cancelable=false)
	{
		super(type, dispatcher, bubbles, cancelable);

		/**
		 * @type {number}
		 */
		this.dx = dx;
		/**
		 * @type {number}
		 */
		this.dy = dy;
	}

	/**
	 * @return {ViewDragEvent}
	 */
	clone()
	{
		return new ViewDragEvent(this.type, this.dx, this.dy, this.dispatcher, this.bubbles, this.cancelable);
	}
}