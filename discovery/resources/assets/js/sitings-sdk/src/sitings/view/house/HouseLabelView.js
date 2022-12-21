import * as PIXI from "pixi.js";
import EventBase from "../../../events/EventBase";
import ModelEvent from "../../events/ModelEvent";
import Point from "../../../geom/Point";
import m from "../../../utils/DisplayManager";
import Utils from "../../../utils/Utils";

/**
 * @type {PIXI.TextStyle}
 * @private
 */
const labelStyle = new PIXI.TextStyle({
	fontFamily	: 'Arial',
	fontSize	: 24,
	fill		: 0x000000,
	align		: 'center'
});


export default class HouseLabelView extends PIXI.Sprite {

	/**
	 * @param model {HouseLabelModel}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, theme=null)
	{
		super();

		/**
		 * @type {HouseLabelModel}
		 * @private
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.CHANGE , this.onModelChanged, this);
		this._model.addEventListener(ModelEvent.DELETE, this.onModelDeleted, this);

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme = theme;

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._label = new PIXI.Text(this._model.text, theme ? theme.labelStyle : labelStyle);
		this.addChild(this._label);

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._lblHolder = new PIXI.Sprite();

		this.addChild(this._lblHolder);
		this._lblHolder.addChild(this._label);

		this.onModelChanged();

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.onModelChanged, this);
	}

	/**
	 * @returns {HouseLabelModel}
	 */
	get model() { return this._model; }

	/**
	 * @private
	 */
	onModelChanged()
	{
		this._label.text	=  this._model.text;
		this._label.y		= -this._label.height;

		if (this._model.trans) {
			// https://pixijs.download/dev/docs/PIXI.Sprite.html#setTransform
			/**
			 * Matrix
			 * @param {number} [a=1] - x scale
			 * @param {number} [b=0] - x skew
			 * @param {number} [c=0] - y skew
			 * @param {number} [d=1] - y scale
			 * @param {number} [tx=0] - x translation
			 * @param {number} [ty=0] - y translation
			 */
			this.setTransform(
				this._model.trans.tx,	// X
				this._model.trans.ty,	// Y
				this._model.trans.a,	// scaleX
				this._model.trans.d,	// scaleY,
				this._model.trans.b,	// skewX
				this._model.trans.c		// skewY
			);
		}	else {
			this.rotation	= -this._model.rotation;
		}

		this.x = m.px(this._model.x);
		this.y = m.px(this._model.y);

		this._lblHolder.scale = new Point(0.5 * m.i.viewScale, 0.5 * m.i.viewScale);
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onModelDeleted(e=null)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChanged, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.onModelDeleted, this);
			this._model = null;
		}

		// unListen to app zoom level changes
		m.instance.removeEventListener(EventBase.CHANGE, this.onModelChanged, this);

		Utils.removeParentOfChild( this );
	}
}