import StructurePointView from "./StructurePointView";
import m from "../../../utils/DisplayManager";
import * as PIXI from 'pixi.js';
import Point from "../../../geom/Point";
import Render from "../../global/Render";
import LabelFactory from "../theme/LabelFactory";

export default class StructureRectangleView extends StructurePointView {

	/**
	 * @param model {StructureRectangle}
	 */
	constructor(model)
	{
		super(model);
	}

	/**
	 * @return {StructureRectangle} the model for this view
	 */
	get rectangle() { return this._model; }

	/**
	 * create the graphic representation for this structure
	 * @protected
	 */
	render()
	{
		if (!this._graphic) {
			this.addChild(this._graphic = new PIXI.Graphics() );

			const F_SCALE = 2;

			/**
			 * @type {PIXI.Text}
			 * @private
			 */
			this._labelTf		= LabelFactory.getLabel(
				this.rectangle.labelText,
				13 * F_SCALE,
				0,
				null,
				null,
				'Arial',
				1
			);

			/**
			 * @type {PIXI.Sprite}
			 * @private
			 */
			this._lblHolder = new PIXI.Sprite();

			this.addChild(this._lblHolder);
			this._lblHolder.addChild(this._labelTf);
			this._lblHolder.scale = new Point(1.0 / F_SCALE, 1.0 / F_SCALE);

			// this.addChild(this._labelTf);
		}

		// Always cache the graphic as a bitmap, but not the label
		this._graphic.cacheAsBitmap = false;

		// Apply model rotation
		this._graphic.rotation	=  this.rectangle.radians;

		// Update Label
		this._labelTf.text		=  this.rectangle.labelText;
		this._labelTf.x		 	= -this._labelTf.width  / 2;
		this._labelTf.y			= -this._labelTf.height / 2;

		// Redraw the rectangle
		this._graphic.clear();
		this._graphic.beginFill(0, 0);
		this._graphic.lineStyle(2, 0, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		this._graphic.drawRect(
			m.px(-this.rectangle.width /2),
			m.px(-this.rectangle.height/2),
			m.px(this.rectangle.width),
			m.px(this.rectangle.height)
		);
		this._graphic.endFill();
		this._graphic.cacheAsBitmap = true;
	}
}