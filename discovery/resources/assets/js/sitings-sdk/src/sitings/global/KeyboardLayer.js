import EventDispatcher from '../../events/EventDispatcher';
import KeyboardEventWrapper from '../events/KeyboardEventWrapper';

let _instanceKey = Symbol();

export default class KeyboardLayer extends EventDispatcher {

	/**
	 * @return {KeyboardLayer}
	 */
	static get instance() {
		if (!this[_instanceKey]) {
			this[_instanceKey] = new KeyboardLayer(_instanceKey);
		}

		return this[_instanceKey];
	}

	/**
	 * @return {KeyboardLayer}
	 */
	static get i() { return this.instance; }


	constructor(constructKey)
	{
		super();

		if (_instanceKey!==constructKey) {
			console.log('The class \'KeyboardLayer\' is a singleton.');
		}

		/**
		 * @type {boolean}
		 * @private
		 */
		this._altPressed   = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._ctrlPressed  = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._shiftPressed = false;

		document.addEventListener('keydown', this.keyHandler.bind(this), false);
		document.addEventListener('keyup', this.keyHandler.bind(this), false);
	}

	/**
	 * @return {boolean}
	 */
	get   altPressed() { return this._altPressed; }
	/**
	 * @return {boolean}
	 */
	get  ctrlPressed() { return this._ctrlPressed; }
	/**
	 * @return {boolean}
	 */
	get shiftPressed() { return this._shiftPressed; }

	/**
	 * @param event {KeyboardEvent}
	 * @private
	 */
	keyHandler(event)
	{
		this._altPressed	= event.altKey;
		this._ctrlPressed 	= event.ctrlKey;
		this._shiftPressed	= event.shiftKey;

		this.dispatchEvent(new KeyboardEventWrapper(
			event.type==='keydown' ? KeyboardEventWrapper.KEY_DOWN : KeyboardEventWrapper.KEY_UP,
			event
		));
	}
}