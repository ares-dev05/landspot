import EventBase from "../../events/EventBase";

export default class HouseEdgeEvent extends EventBase {

	static get ROLL_OVER()	{ return "FloorEdgeEvent.RollOver";	}
	static get ROLL_OUT()	{ return "FloorEdgeEvent.RollOut";	}
	static get CLICK() 		{ return "FloorEdgeEvent.Click";	}
	static get EDIT() 		{ return "FloorEdgeEvent.Edit";		}

	/**
	 * @param type {string}
	 * @param model {HouseEdgeModel}
	 * @param view {HouseEdgeView}
	 * @param floor {HouseModel}
	 * @param mousePosition {PIXI.Point}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, model=null, view=null, floor=null, mousePosition=null, bubbles=false, cancelable=false)
	{
		super(type, bubbles, cancelable);

		/**
		 * @type {HouseEdgeModel}
		 * @private
		 */
		this._model = model;
		/**
		 * @type {HouseEdgeView}
		 * @private
		 */
		this._view  = view;
		/**
		 * @type {HouseModel}
		 * @private
		 */
		this._floor = floor;
		/**
		 * @type {PIXI.Point}
		 * @private
		 */
		this._mousePosition = mousePosition;
	}

	/**
	 * @return {HouseModel}
	 */
	get floor()	{ return this._floor; }
	/**
	 * @param v {HouseModel}
	 */
	set floor(v) { this._floor=v; }

	/**
	 * @return {HouseEdgeModel}
	 */
	get model()	{ return this._model; }
	/**
	 * @return {HouseEdgeView}
	 */
	get view ()	{ return this._view ; }
	/**
	 * @returns {PIXI.Point}
	 */
	get mousePosition() { return this._mousePosition; }

	/**
	 * @return {HouseEdgeEvent}
	 */
	clone()		{ return new HouseEdgeEvent(this.type, this._model, this._view, this._floor, this._mousePosition, this.bubbles, this.cancelable); }
}