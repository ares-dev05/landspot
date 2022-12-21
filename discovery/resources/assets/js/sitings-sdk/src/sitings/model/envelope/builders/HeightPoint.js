import RestoreDispatcher from '../../../../events/RestoreDispatcher';


export default class HeightPoint extends RestoreDispatcher {

	/**
	 * @param w {number}
	 * @param h {number}
	 */
	constructor(w, h) {
		super();

		/**
		 * @type {number}
		 * @private
		 */
		this._width = w;

		/**
		 * @type {number}
		 * @private
		 */
		this._height = h;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get width() {
		return this._width;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set width(v) {
		if (this._width !== v) {
			this._width = v;
			this.onChange();
		}
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
		if (this._height !== v) {
			this._height = v;
			this.onChange();
		}
	}

	/**
	 * @public
	 */
	remove() {
		this.onDelete();
	}

	/**
	 * recordState
	 * @returns {{w: number, h: number}} data structure containing all the parameters representing this object's state
	 */
	recordState() {
		return {w: this.width, h: this.height};
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 * @public
	 */
	restoreState(state) {
		this._width		= state.w;
		this._height	= state.h;
		// onRestored also dispatches a CHANGE event
		this.onRestored();
	}

	/**
	 * @param state {Object}
	 * @return {HeightPoint}
	 */
	static fromState(state) {
		return new HeightPoint(state.w, state.h);
	}

	/**
	 * @param a {HeightPoint}
	 * @param b {HeightPoint}
	 * @return {number}
	 */
	static sortWidth(a, b) {
		return a.width - b.width;
	}

	/**
	 * @param a {HeightPoint}
	 * @param b {HeightPoint}
	 * @return {number}
	 */
	static sortWidthDesc(a, b) {
		return b.width - a.width;
	}
}