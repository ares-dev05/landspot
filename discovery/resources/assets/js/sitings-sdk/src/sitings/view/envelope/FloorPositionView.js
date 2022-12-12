import m from '../../../utils/DisplayManager';
import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import FloorPositionModel from '../../model/envelope/FloorPositionModel';
import Utils from '../../../utils/Utils';
import LineDrawer from '../../render/LineDrawer';
import MeasurementPointEvent from '../../events/MeasurementPointEvent';
import ThemeManager from '../theme/ThemeManager';
import LabelFactory from '../theme/LabelFactory';
import Render from '../../global/Render';


export default class FloorPositionView extends PIXI.Container {

	static get MEASURE_Y() { return -1; }

	/**
	 * @param model {FloorPositionModel}
	 */
	constructor (model) {
		super();

		/**
		 * @type {FloorPositionModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);
		this._model.addEventListener(FloorPositionModel.VCHANGE, this.modelChanged, this);

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		/**
		 * @type {SetbackMeasurementView}
		 * @private
		 */
		this._leftLabel = new SetbackMeasurementView();
		this._leftLabel.addListener(EventBase.CLICK, this.editLeftSetback, this);

		/**
		 * @type {SetbackMeasurementView}
		 * @private
		 */
		this._rightLabel = new SetbackMeasurementView();
		this._rightLabel.addListener(EventBase.CLICK, this.editRightSetback, this);

		this.addChild(this._leftLabel);
		this.addChild(this._rightLabel);

		this.render();

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);
	}

	/**
	 * @private
	 */
	editLeftSetback() {
		if (Number(Utils.fx3(this._model.leftDistance)) > 0) {
			this._model.measurements.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.EDIT, this._model.leftSetback));
		}
	}

	/**
	 * @private
	 */
	editRightSetback() {
		if (Number(Utils.fx3(this._model.rightDistance)) > 0) {
			this._model.measurements.dispatchEvent(new MeasurementPointEvent(MeasurementPointEvent.EDIT, this._model.rightSetback));
		}
	}

	/**
	 * @private
	 */
	modelChanged() {
		this.render();
	}

	/**
	 * @private
	 */
	render()
	{
		this._graphics.clear();
		this._graphics.lineStyle(1, 0x222222, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		// position the measurements vertically
		this._rightLabel.y	=
		this._leftLabel.y	= m.px( FloorPositionView.MEASURE_Y - (isNaN(this._model.padLevel) ? 0 : this._model.padLevel) );

		this._leftLabel.visible = true;
		this._leftLabel.update(this._model.leftDistance);

		this._rightLabel.visible = true;
		this._rightLabel.update(this._model.rightDistance, false);
		this._rightLabel.x = m.px(this._model.lotWidth);
	}

	/**
	 * @param x1 {number}
	 * @param x2 {number}
	 * @param distance {number}
	 * @param tf {TextField}
	 * @param pos {number}
	renderDistance(x1, x2, distance, tf, pos) {
		if (distance > 0) {
			tf.visible = true;
			tf.width = 300;
			tf.text = Utils.fx3(distance) + 'm';
			tf.width = tf.textWidth + 5;
			if (pos === 0)
				tf.x = m.px(x1) - (10 + tf.width);
			else
				tf.x	= m.px(x2) + 10;
			// tf.x		= m.px((x1+x2)/2) - tf.width / 2;
				tf.y		= m.px(this.MEASURE_Y) - tf.textHeight / 2;

				LineDrawer.drawDashedLine(
					new Graphics(),
					m.px(x1), m.px(this.MEASURE_Y),
					m.px(x2), m.px(this.MEASURE_Y),
					3
				);
		}
	}
	 */
}

class SetbackMeasurementView extends PIXI.Sprite {

	static get LABEL_PAD() {return 30;}
	static get DASH_SIZE() {return 2;}

	constructor () {
		super();

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._labelBack = ThemeManager.i.themedColorBlock(100,100);

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._label = LabelFactory.getLabel('', 13, ThemeManager.i.theme.getColor('color_class_1'));
		this._label.mouseEnabled = false;

		this.addChild(this._graphics);
		this.addChild(this._labelBack);
		this.addChild(this._label);

		this.interactive = true;
		this.mouseEnabled = this.buttonMode = true;
	}

	/**
	 * @param distance {Number}
	 * @param ltor {boolean}
	 */
	update(distance, ltor = true) {
		this._label.text = Utils.fx3(distance) + 'm';
		this._labelBack.height = this._label.height - 1;
		this._labelBack.width = this._label.width + 2;
		this._label.y = -1;
		this._labelBack.y = -this._labelBack.height / 2;
		this._label.y += this._labelBack.y;

		this._graphics.clear();
		this._graphics.lineStyle(1, ThemeManager.i.theme.getColor('color_class_2'), 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		if (ltor) {
			// position the label further to the left
			this._labelBack.x = -this._labelBack.width-1 - SetbackMeasurementView.LABEL_PAD;
			this._label.x = 2 + this._labelBack.x;

			// add the measurement line
			LineDrawer.drawLine(this._graphics, 0, 0, m.px(distance), 0);

			// connect the label to the measurement line
			this._graphics.lineStyle(1, ThemeManager.i.theme.getColor('color_class_2'), .4, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

			LineDrawer.drawDashedLine(this._graphics, 0, 0, -SetbackMeasurementView.LABEL_PAD, 0, SetbackMeasurementView.DASH_SIZE);
		}	else {
			// position the label further to the right
			this._labelBack.x = 1 + SetbackMeasurementView.LABEL_PAD;
			this._label.x = 2 + this._labelBack.x;

			// add the measurement line
			LineDrawer.drawLine(this._graphics, 0, 0, -m.px(distance), 0);

			// connect the label to the measurement line
			this._graphics.lineStyle(1, ThemeManager.i.theme.getColor('color_class_2'), .4, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

			// this.graphics.lineStyle(1, ThemeManager.i.theme.getColor("color_class_2"), .4, false, LineScaleMode.NONE);
			LineDrawer.drawDashedLine(this._graphics, 0, 0, SetbackMeasurementView.LABEL_PAD, 0, SetbackMeasurementView.DASH_SIZE);
		}
	}
}