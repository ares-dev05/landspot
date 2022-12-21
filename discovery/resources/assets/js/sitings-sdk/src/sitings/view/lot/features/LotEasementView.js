import * as PIXI from 'pixi.js';
import m from "../../../../utils/DisplayManager";
import EventBase from "../../../../events/EventBase";
import EasementEvent from "../../../events/EasementEvent";
import Utils from "../../../../utils/Utils";
import LineDrawer from "../../../render/LineDrawer";
import LotEasementModel from "../../../model/lot/features/LotEasementModel";
import Point from "../../../../geom/Point";
import Render from "../../../global/Render";


export class LotEasementView extends PIXI.Sprite {


	/**
	 * @param model {LotEasementModel}
	 * @param edgeView {LotEdgeView}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, edgeView, theme)
	{
		super();

		/**
		 * @type {LotEasementModel}
		 * @private
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(EasementEvent.DELETE, this.deleteView, this);

		/**
		 * @type {LotEdgeView}
		 * @private
		 */
		this._edgeView			= edgeView;
		this._edgeGraphics		= new PIXI.Graphics();

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme				= theme;
		this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

		/**
		 * @type {Point}
		 */
		this.mid				= new Point();
		/**
		 * @type {Point}
		 */
		this.normal				= new Point();

		this.addChild(this._edgeGraphics);

		m.instance.addEventListener(EventBase.CHANGE, this.render, this);

		this.render();
	}

	/**
	 * @return {PIXI.Graphics}
	 */
	get labelTarget() { return this._edgeGraphics; }

	/**
	 * @return {LotEasementModel}
	 */
	get model() { return this._model; }

	/**
	 * @param e {EventBase}
	 */
	onModelChange(e) { this.render(); }

	/**
	 * @param e
	 */
	deleteView(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(EasementEvent.DELETE, this.deleteView, this);
			this._model = null;
		}
		if (this._highController) {
			this._highController.cleanup();
			this._highController = null;
		}
		if (this._theme) {
			this._theme.removeEventListener(EventBase.CHANGE, this.onThemeChanged, this);
			this._theme = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);

		Utils.removeParentOfChild(this);
	}

	get currentColor() {
		return this.model.highlight ? 0x00AAEE : this.model.error ? 0xCC0000 : this._theme.lineColor;
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

	render()
	{
		this._edgeGraphics.clear();
		this._edgeGraphics.lineStyle(this._theme.lineThickness, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		LineDrawer.drawDashedLine(
			this._edgeGraphics,
			m.px(this._model.a.x), m.px(this._model.a.y),
			m.px(this._model.b.x), m.px(this._model.b.y),
			LineDrawer.DASH_LENGTH
		);

		if ( (this._model.type===LotEasementModel.ANGLED && this._model.width!==0) ||
			  this._model.type===LotEasementModel.BLOCK ) {

			LineDrawer.drawDashedLine(
				this._edgeGraphics,
				m.px(this._model.aw.x), m.px(this._model.aw.y),
				m.px(this._model.bw.x), m.px(this._model.bw.y),
				LineDrawer.DASH_LENGTH
			);
		}
	}

	/**
	 * @returns {PIXI.Rectangle}
	 */
	get displayBounds() { return this._edgeGraphics.getBounds(); }
}