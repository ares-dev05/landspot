import RestoreDispatcher from './RestoreDispatcher';
import EventBase from './EventBase';

export default class HighlightableModel extends RestoreDispatcher {

	static get HIGHLIGHT_CHANGE() {return 'highlight.Change'; }

	/**
	 * @param context {*}
	 */
	constructor(context=null)
	{
		super(context);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._highlight = false;
	}

	/**
	 * @param v {boolean}
	 */
	set highlight(v)
	{
		this._highlight=v;

		/**
		 * @type {EventBase}
		 * @private
		 */
		this._highlightEvent = this._highlightEvent || new EventBase(HighlightableModel.HIGHLIGHT_CHANGE);
		this.dispatchEvent(this._highlightEvent);
		// this.onChange();
	}

	/**
	 * @return {boolean}
	 */
	get highlight() { return this._highlight; }
}