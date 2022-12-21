import * as PIXI from 'pixi.js';
import LabelFactory from '../theme/LabelFactory';
import EventBase from '../../../events/EventBase';

export default class PosLabelView extends PIXI.Sprite {

	/**
	 * @param view {PosView}
	 */
	constructor(view)
	{
		super();

		/**
		 * @type {PosCalculator}
		 * @private
		 */
		this._model = view.model;
		this._model.addEventListener(EventBase.CHANGE, this.update, this);

		/**
		 * @type {PosView}
		 * @private
		 */
		this._view  = view;

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._label	= LabelFactory.getLabel( '' );
		this.addChild(this._label);
	}

	/**
	 */
	update()
	{
		this.x	= this._view.viewCenter.x;
		this.y	= this._view.viewCenter.y;

		if (this._model.area > 0) {
			this._label.visible = true;
			this._label.text = this._model.area.toFixed(3) + ' m²';

			this._label.x = -this._label.width  * .5;
			this._label.y = -this._label.height * .5;
		}	else {
			this._label.visible = false;
		}
	}
}