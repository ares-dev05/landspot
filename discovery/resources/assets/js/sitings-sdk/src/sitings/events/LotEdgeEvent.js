import EventBase from "../../events/EventBase";

export default class LotEdgeEvent extends EventBase {

	static get ROLL_OVER() { return "outlineEdgeEvent.RollOver"; }
	static get ROLL_OUT() { return "outlineEdgeEvent.RollOut"; }
	static get CLICK() { return "outlineEdgeEvent.Click"; }
	static get MANIPULATE() { return "outlineEdgeEvent.Manipulate"; }
	static get NORMALS_UPDATE() { return "outlineEdgeEvent.normals"; }

	/**
	 * @return {LotEdgeModel}
	 */
	get model() { return this._model; }

	/**
	 * @return {LotEdgeView}
	 */
	get view () { return this._view ; }

	/**
	 * @param type {String}
	 * @param model {LotEdgeModel}
	 * @param view {LotEdgeView}
	 * @param dispatcher {*}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, model, view=null, dispatcher=null, bubbles=false, cancelable=false)
	{
		super(type, bubbles, cancelable);

		/**
		 * @type {LotEdgeModel}
		 * @private
		 */
		this._model = model;

		/**
		 * @type {LotEdgeView}
		 * @private
		 */
		this._view  = view;
	}
}