import * as PIXI from "pixi.js";
import EventBase from "../../../events/EventBase";
import ModelEvent from "../../events/ModelEvent";
import Utils from "../../../utils/Utils";
import HouseEdgeEvent from "../../events/HouseEdgeEvent";
import m from "../../../utils/DisplayManager";
import LineDrawer from "../../render/LineDrawer";
import KeyboardLayer from "../../global/KeyboardLayer";
import KeyboardEventWrapper from "../../events/KeyboardEventWrapper";
import Render from "../../global/Render";


export default class HouseEdgeView extends PIXI.Sprite {

	/**
	 * @param model {HouseEdgeModel}
	 * @param dashed {boolean}
	 * @param thickness {number}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, dashed=false, thickness=2, theme=null)
	{
		super();

		/**
		 * @type {HouseEdgeModel}
		 * @private
		 */
		this._model		= model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(ModelEvent.DELETE, this.onEdgeDelete, this);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._dashed	= dashed;

		/**
		 * @type {number}
		 * @private
		 */
		this._thickness = thickness;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme = theme;

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._edgeGraphics = new PIXI.Graphics();
		this._edgeGraphics.interactive = true;
		this.addChild(this._edgeGraphics);
		this._edgeGraphics.addListener(EventBase.ROLL_OVER, this.edgeRollOver, this);
		this._edgeGraphics.addListener(EventBase.ROLL_OUT , this.edgeRollOut , this);
		this._edgeGraphics.addListener(EventBase.CLICK	  , this.edgeClick   , this);

		KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_DOWN, this.kbChange, this);
		KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_UP  , this.kbChange, this);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);

		this.render();
	}


	/**
	 * @return {HouseEdgeModel}
	 */
	get edgeModel() { return this._model; }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onModelChange(e)
	{
		this.render();
		// this.dispatchEvent(e);	// is this needed?
	}

	/**
	 * @param e
	 * @private
	 */
	kbChange(e)
	{
		this.render();
	}

	/**
	 * @param e {EventBase}
	 */
	onEdgeDelete(e)
	{
		KeyboardLayer.i.removeEventListener(KeyboardEventWrapper.KEY_DOWN, this.kbChange, this);
		KeyboardLayer.i.removeEventListener(KeyboardEventWrapper.KEY_UP  , this.kbChange, this);

		if (this._edgeGraphics) {
			this._edgeGraphics.removeListener(EventBase.ROLL_OVER, this.edgeRollOver, this);
			this._edgeGraphics.removeListener(EventBase.ROLL_OUT , this.edgeRollOut , this);
			this._edgeGraphics.removeListener(EventBase.CLICK	  , this.edgeClick   , this);
			Utils.removeParentOfChild(this._edgeGraphics);
			this._edgeGraphics = null;
		}
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.onEdgeDelete, this);
			this._model = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);

		Utils.removeParentOfChild(this);
	}

	/**
	 * @param e
	 */
	edgeRollOver(e)	{ this._model.highlight = true; }
	/**
	 * @param e
	 */
	edgeRollOut(e)	{ this._model.highlight = false; }
	/**
	 * @param e
	 */
	edgeClick(e)	{
		this.emit(
			HouseEdgeEvent.CLICK,
			new HouseEdgeEvent(
				HouseEdgeEvent.CLICK,
				this._model,
				this,
				null,
				e.data.global
			)
		);
	}

	/**
	 * @return {number}
	 */
	get currentThickness()
	{
		if (this._theme) {
			return this._theme.lineThickness;
		}

		if (this._dashed) {
			return KeyboardLayer.i.shiftPressed ? this._thickness : 1;
		}

		return KeyboardLayer.i.shiftPressed ? 1 : this._thickness;
	}

	/**
	 * @return {number}
	 */
	get currentColor()
	{
		if (this._theme) {
			return this._theme.lineColor;
		}

		if (!this._model) {
			return 0;
		}

		if (this._model.highlight) {
			return 0x00BBFF;
		}

		if (this._dashed) {
			return KeyboardLayer.i.shiftPressed ? 0x004466 : 0;
		}

		return KeyboardLayer.i.shiftPressed ? 0x333333 : 0x111111;
	}

	/**
	 * @public
	 */
	render()
	{
		// Delete previous view
		this._edgeGraphics.clear();

		// Set the line style / draw it
		this._edgeGraphics.lineStyle(this.currentThickness, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		// Draw a straight line
		LineDrawer.drawDashedLine(
			this._edgeGraphics,
			m.px(this._model.a.x), m.px(this._model.a.y),
			m.px(this._model.b.x), m.px(this._model.b.y),
			this._dashed ? 3 : 0,
			LineDrawer.LINE_HIT_THICKNESS
		);
	}
}