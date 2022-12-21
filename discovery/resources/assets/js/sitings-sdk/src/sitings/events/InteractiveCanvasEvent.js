import EventBase from '../../events/EventBase';

export default class InteractiveCanvasEvent extends EventBase
{
	static get CLICK() { return 'ice.Click'; }
	static get DRAG()  { return 'ice.Drag';  }

	/**
	 * @param type {string}
	 * @param x {number}
	 * @param y {number}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, x, y, bubbles=false, cancelable=false)
	{
		super(type, bubbles, cancelable);

		/**
		 * @type {Number}
		 */
		this.x = x;
		/**
		 * @type {Number}
		 */
		this.y = y;
	}

	clone()
	{
		return new InteractiveCanvasEvent(this.type, this.x, this.y, this.bubbles, this.cancelable);
	}
}