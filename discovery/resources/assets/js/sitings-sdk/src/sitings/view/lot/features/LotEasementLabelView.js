import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import Utils from '../../../../utils/Utils';
import Render from '../../../global/Render';
import EasementEvent from '../../../events/EasementEvent';


export default class EasementEdgeLabelView extends PIXI.Sprite {

	/**
	 * @param view {LotEasementView}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(view, theme)
	{
		super();

		/**
		 * @type {LotEasementView}
		 * @private
		 */
		this._view  = view;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme	= theme;
		this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

		/**
		 * @type {LotEasementModel}
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
	 * @param e
	 * @private
	 */
	modelChange(e)	{ this.update(); }

	/**
	 * @param e
	 * @private
	 */
	modelDelete(e)
	{
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
		if (event.data.prop==='labelFontFamily') {
			this._labelStyle.fontFamily = this._theme.labelFontFamily;
		}	else
		if (event.data.prop==='labelColor') {
			this._labelStyle.fill = this._theme.labelColor;
		}	else
		if (event.data.prop==='labelFontSize') {
			this._labelStyle.fontSize =  this._theme.labelFontSize;
			this.update();
		}
	}

	/**
	 * @public
	 */
	update()
	{
		this._easeLabel.text = this._model.description;

		const r = this._view.displayBounds,
		  WIDTH = this._easeLabel.width  * this.scaleX,
		 HEIGHT = this._easeLabel.height * this.scaleY;

		if (r.width > r.height) {
			let hk = (WIDTH < r.width) ? (r.width-WIDTH) / r.width : 0;

			if (this._model.normal.y < this._model.mid.y) {
				this.x = r.x + r.width /2 - WIDTH/2;
				this.y = r.y + r.height/2 * hk - HEIGHT - 5;
			}	else {
				this.x = r.x + r.width/2 - WIDTH/2;
				this.y = r.y + r.height - r.height/2 * hk + 5;
			}
		}	else {
			if (this._model.normal.x > this._model.mid.x) {
				this.x = r.x + r.width /2 + 5;
				this.y = r.y + r.height/2 - HEIGHT/2;
			}	else {
				this.x = r.x + r.width /2 - WIDTH - 10;
				this.y = r.y + r.height/2 - HEIGHT/2;
			}
		}

		Render.labelMoved(this, true);
	}
}