import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import LabelFactory from '../../theme/LabelFactory';
import m from '../../../../utils/DisplayManager';
import Utils from '../../../../utils/Utils';
import Render from '../../../global/Render';
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';

export default class TransformationMeasurementView extends PIXI.Sprite {

	/**
	 * @param model {TransformationMeasurementModel}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {TransformationMeasurementModel}
		 * @private
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(MeasurementPointEvent.DELETE, this.deletePoint, this);

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._graphics		= new PIXI.Graphics();
		this.addChild(this._graphics);

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._measureLength = LabelFactory.getLabel('');
		this._measureLength.interactive	= true;
		this._measureLength.addListener(EventBase.CLICK, this.onClick, this);

		this.addChild(this._measureLength);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);
	}

	/**
	 * @return {TransformationMeasurementModel}
	 */
	get model()			{ return this._model; }

	/**
	 * @private
	 */
	onModelChange()		{ this.render(); }

	/**
	 * @private
	 */
	onClick() 			{ this._model.dispatchEditEvent(); }

	/**
	 * @private
	 */
	deletePoint()
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(MeasurementPointEvent.DELETE, this.deletePoint, this);
			this._model = null;
		}

		if (this._measureLength) {
			this._measureLength.removeListener(EventBase.CLICK, this.onClick, this);
			this._measureLength = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);
		Utils.removeParentOfChild(this);
	}

	/**
	 * @private
	 */
	render()
	{
		this._graphics.clear();
		this._graphics.lineStyle(this.currentThickness, this.currentColor, .7, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		this._graphics.moveTo(m.px(this._model.extensionAnchor.x), m.px(this._model.extensionAnchor.y));
		this._graphics.lineTo(m.px(this._model.segmentAnchor.x  ), m.px(this._model.segmentAnchor.y  ));

		// Centre the label horizontally on the measurement line, and position it on top of it
		this._measureLength.text = Utils.fx3( this._model.distance);
		this._measureLength.x	 = m.px((this._model.extensionAnchor.x + this._model.segmentAnchor.x)*.5) - this._measureLength.width/2;
		this._measureLength.y	 = m.px((this._model.extensionAnchor.y + this._model.segmentAnchor.y)*.5) - this._measureLength.height;

		this.visible			 = this._model.visible && this._model.distance!==0;
	}

	/**
	 * @return {number}
	 */
	get currentThickness() { return 2; }

	/**
	 * @return {number}
	 */
	get currentColor()	   { return 0xBB4591; }
}