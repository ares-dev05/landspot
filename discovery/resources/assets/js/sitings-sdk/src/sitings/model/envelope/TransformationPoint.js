import RestoreDispatcher from '../../../events/RestoreDispatcher';

export default class TransformationPoint extends RestoreDispatcher{

	/**
	 *
	 * @param level {number}
	 * @param name {string}
	 * @param position {number}
	 * @param extension {number}
	 */
	constructor (level, name, position = 0, extension = 0) {
		super();

		/**
		 * @type {number}
		 * @private
		 */
		this._level = level;

		/**
		 * @type {string}
		 * @private
		 */
		this._name = name;

		/**
		 * @type {number}
		 * @private
		 */
		this._position = position;

		/**
		 * @type {number}
		 * @private
		 */
		this._extension	= extension;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._enabled = true;

		/**
		 * @type {Object}
		 * @private
		 */
		this._data = {};
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get isSlab() {
		return !this.level;
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get enabled() {
		return this._enabled;
	}

	/**
	 * @param v {boolean}
	 * @public
	 */
	set enabled(v) {
		this._enabled = v;
		this.onChange();
	}

	/**
	 * @return {number}
	 * @public
	 */
	get level() {
		return this._level;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set level(v) {
		this._level = v;
		this.onChange();
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
		this.onChange();
	}

	/**
	 * @return {number}
	 * @public
	 */
	get position() {
		return this._position;
	}

	/**
	 * @param v
	 */
	set position(v) {
		this._position = v;
		this.onChange();
	}

	/**
	 * @return {number}
	 * @public
	 */
	get extension() {
		return this._extension;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set extension(v) {
		this._extension = v;
		this.onChange();
	}

	/**
	 * @return {Object}
	 * @public
	 */
	get data() {
		return this._data;
	}

	/**
	 * @param v {Object}
	 * @public
	 */
	set data(v) {
		this._data = v;
		this.extension = Number(this._data.value);
	}

	// @TODO: offset for the extension
	/**
	 * @return {number}
	 * @public
	 */
	get offset() {
		return this.isSlab ? 0 : 2.44;
	}

	/**
	 * @param point {TransformationPoint}
	 * @public
	 */
	load(point) {
		this._level = point.level;
		this._name = point.name;
		this._position = point.position;
		this._enabled = true;
		this.onChange();
	}

	/**
	 * @param a {TransformationPoint}
	 * @param b {TransformationPoint}
	 * @return {number}
	 * @public
	 */
	static compareLevel(a, b) {
		if (a.level < b.level) return -1;
		if (a.level > b.level) return 1;
		return 0;
	}

	/**
	 * @param object {Object}
	 * @return {TransformationPoint}
	 * @public
	 */
	static fromObject(object) {
		return new TransformationPoint(object.level, object.name, object.position);
	}

	/**
	 * @TODO recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState () {
		return {};
	}

	/**
	 * @TODO restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state) {
	}
}