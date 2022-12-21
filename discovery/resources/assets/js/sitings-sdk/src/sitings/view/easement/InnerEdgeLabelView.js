import * as PIXI from 'pixi.js';
import EventBase from "../../../events/EventBase";
import ModelEvent from "../../events/ModelEvent";
import Utils from "../../../utils/Utils";
import Render from "../../global/Render";
import EasementEvent from "../../events/EasementEvent";

export default class InnerEdgeLabelView extends PIXI.Sprite {

	/**
	 * @param view {InnerEdgeView}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(view, theme)
	{
		super();

		/**
		 * @type {InnerEdgeView}
		 * @private
		 */
		this._view = view;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme	= theme;
		this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

		/**
		 * @type {InnerEdgeModel}
		 * @private
		 */
		this._model = this._view.model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChange, this);
		this._model.addEventListener(EasementEvent.DELETE, this.modelDelete, this);

		/**
		 * @type {PIXI.TextStyle}
		 * @private
		 */
		this._labelStyle = new PIXI.TextStyle({
			fontFamily : this._theme.labelFontFamily,
			fontSize: this._theme.labelFontSize,
			fontWeight: 'normal',
			fill : this._theme.labelColor,
			align : 'center'
		});

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._easeLabel = new PIXI.Text('', this._labelStyle);
		this._easeLabel.resolution = Render.FONT_RESOLUTION;

		this.addChild(this._easeLabel);
		this.update();
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	modelChange(e)		{ this.update(); }

	/**
	 * @param e {ModelEvent}
	 * @private
	 */
	modelDelete(e)
	{
		this._cleanedUp = true;
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.modelChange, this);
			this._model.removeEventListener(EasementEvent.DELETE, this.modelDelete, this);
			this._model = null;
		}

		if (this._theme) {
			this._theme.removeEventListener(EventBase.CHANGE, this.onThemeChanged, this);
			this._theme = null;
		}

		Utils.removeParentOfChild(this);
	}

	/**
	 * @param event {DataEvent}
	 */
	onThemeChanged(event)
	{
		if (event.data.prop==="labelFontFamily") {
			this._labelStyle.fontFamily = this._theme.labelFontFamily;
		}	else
		if (event.data.prop==="labelColor") {
			this._labelStyle.fill = this._theme.labelColor;
		}	else
		if (event.data.prop==="labelFontSize") {
			this._labelStyle.fontSize =  this._theme.labelFontSize;
			this.update();
		}
	}

	/**
	 * @public
	 */
	update()
	{
		this._easeLabel.text = this._view.model.description;

		const splayed = this._model.splayed && this._model.splayedInDistances;
		const r = this._view.displayBounds,
		  WIDTH = this._easeLabel.width  * this.scaleX,
		 HEIGHT = this._easeLabel.height * this.scaleY;

		if (r.width > r.height) {
			// the edge is horizontal. position the label on top of the edge
			this.x	= r.x + r.width /2 + ( splayed ? WIDTH/4 : -WIDTH/2 );
			this.y	= r.y + r.height/2 - HEIGHT - 5;
		}	else {
			// the edge is vertical. position the label to the right of the edge
			this.x	= r.x + r.width /2 + 5;
			this.y	= r.y + r.height/2 + ( splayed ? HEIGHT/2 : -HEIGHT/2 );
		}

		Render.labelMoved(this, true);
	}
}