import * as PIXI from 'pixi.js';
import EventBase from "../../../events/EventBase";
import EasementEvent from "../../events/EasementEvent";
import Utils from "../../../utils/Utils";
import m from "../../../utils/DisplayManager";
import Render from "../../global/Render";


export default class InnerEdgeView extends PIXI.Sprite {

	/**
	 * @return {InnerEdgeModel}
	 */
	get model() { return this._model; }

	/**
	 * @param model {InnerEdgeModel}
	 * @param renderer {IPathRenderer}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, renderer, theme)
	{
		super();

		/**
		 * @type {InnerEdgeModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(EasementEvent.DELETE, this.onModelDelete, this);

		/**
		 * @type {IPathRenderer}
		 * @private
		 */
		this._renderer = renderer;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme = theme;
		this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

		/**
		 * @type {PIXI.Graphics}
		 * @protected
		 */
		this._graphics	= new PIXI.Graphics();
		this.addChild(this._graphics);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);

		this.render();
	}

	/**
	 * @param e
	 * @private
	 */
	onModelChange(e)
	{
		this.render();
	}
	onModelDelete(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(EasementEvent.DELETE, this.onModelDelete, this);
			this._model = null;
		}
		if (this._theme) {
			this._theme.removeEventListener(EventBase.CHANGE, this.onThemeChanged, this);
			this._theme = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);

		Utils.removeParentOfChild(this);
	}

	/**
	 * @param event {DataEvent}
	 */
	onThemeChanged(event)
	{
		if (event.data.prop==="lineThickness" || event.data.prop==="lineColor") {
			this.render();
		}
	}

	/**
	 * @returns {PIXI.Rectangle}
	 */
	get displayBounds() { return this._graphics.getBounds(); }

	/**
	 * @protected
	 */
	render()
	{
		this._graphics.clear();
		this._graphics.lineStyle(this._theme.lineThickness, this._theme.lineColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		this._renderer.render(this._graphics, this._model.pieces);

		if (this._model.splayed && this._model.splayedInDistances) {
			this._renderer.render(this._graphics, [this._model.connection], true);
		}

		/*
		this._graphics.beginFill(0.1, 0.1);
		this._graphics.lineStyle(0, 0, 0);
		const area = this._model.exclusionArea;
		this._graphics.moveTo(m.px(area.a.x), m.px(area.a.y));
		this._graphics.lineTo(m.px(area.b.x), m.px(area.b.y));
		this._graphics.lineTo(m.px(area.c.x), m.px(area.c.y));
		this._graphics.lineTo(m.px(area.d.x), m.px(area.d.y));
		this._graphics.endFill();
		 */
	}
}