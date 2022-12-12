import ChangeDispatcher from "../../../events/ChangeDispatcher";

export default class ColorPair extends ChangeDispatcher
{
	/**
	 * @param name {string}
	 * @param color {number}
	 * @constructor
	 */
	constructor(name, color)
	{
		super();

		/**
		 * @type {string}
		 * @private
		 */
		this._name	= name;

		/**
		 * @type {number}
		 * @private
		 */
		this._color	= color;
	}

	/**
	 * @returns {string}
	 */
	get name ()		{ return this._name; }

	/**
	 * @returns {number}
	 */
	get color()		{ return this._color; }

	/**
	 * @param v {number}
	 */
	set color(v)	{ this._color = v; this.onChange(); }
}