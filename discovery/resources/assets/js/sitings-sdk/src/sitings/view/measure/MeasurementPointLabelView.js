import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import Utils from '../../../utils/Utils';
import ThemeManager from '../theme/ThemeManager';
import LabelFactory from '../theme/LabelFactory';
import Render from '../../global/Render';
import MeasurementPointModel from '../../model/measure/MeasurementPointModel';


export default class MeasurementPointLabelView extends PIXI.Sprite {

	/**
	 * @param view {MeasurementPointView}
	 */
	constructor(view)
	{
		super();

		/**
		 * @type {MeasurementPointView}
		 * @private
		 */
		this._view		= view;
		this._view.addListener(EventBase.REMOVED, this.modelDelete, this);

		/**
		 * @type {IMeasurement}
		 * @private
		 */
		this._model		= this._view.model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChange, this);

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._labelBack	= ThemeManager.i.themedColorBlock(100,100);
		this.addChild(this._labelBack);

		let textColor = ThemeManager.i.theme.measurementLabel;

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._distanceLabel = LabelFactory.getLabel('',13, textColor);
		this._distanceLabel.interactive = true;
		this._distanceLabel.addListener(EventBase.CLICK, this.onLabelClick, this);
		this.addChild(this._distanceLabel);

		this.update();
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	modelChange(e)	{ this.update(); }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	modelDelete(e)
	{
		this._model.removeEventListener(EventBase.CHANGE, this.modelChange, this);
		this._view.removeListener(EventBase.REMOVED, this.modelDelete, this);
		Utils.removeParentOfChild(this);
	}

	/**
	 * @param e {InteractionEvent}
	 * @private
	 */
	onLabelClick(e)		{ this._model.dispatchEditEvent(); }

	/**
	 * Position the label correctly either in the middle of the measurement line, or to the outside of the lot when
	 * there isn't enough space for the label body
	 *
	 * @private
	 */
	update()
	{
		const r = this._view.displayBounds;
		let mpm;
		let fillColor = 'color_class_2';
		let lineColor = 'color_class_4';

		if (this._view.model instanceof MeasurementPointModel) {
			mpm = this._view.model;
		}

		if (mpm && mpm.isHenleyOMP) {
			fillColor = lineColor = ThemeManager.i.theme.eaveMeasurement;
		}

		if (mpm && mpm.isPlantationOMP) {
			// show both the brickwall and OMP measurements
			this._distanceLabel.text = mpm.getAccurateDistance() + 'm / ' + mpm.getOMPDistance() + 'm OMP';
		}	else if (mpm && mpm.isHenleyOMP) {
			this._distanceLabel.text = mpm.getAccurateDistance() + 'm';
		}	else {
			this._distanceLabel.text = this._model.description;
		}

		// Redraw the background
		ThemeManager.i.themedColorBlock(
			Math.ceil(this._distanceLabel.width  + 6),
			Math.ceil(this._distanceLabel.height + 3),
			fillColor,
			lineColor,
			this._labelBack
		);

		this._distanceLabel.x	= 3;
		this._distanceLabel.y	= 1;

		const WIDTH  = this._labelBack.width;
		const HEIGHT = this._labelBack.height;

		// default positioning
		this.x	= r.x + (r.width  - WIDTH ) * .5;
		this.y	= r.y + (r.height - HEIGHT) * .5;

		// Get the display positions for the anchor and the projection
		let a = this._view.viewIntersection,
			b = this._view.viewOrigin;

		// check if the label is wider/taller than the measurement line
		if (Math.abs(a.x-b.x) > Math.abs(a.y-b.y)) {
			// ~horizontal
			if (this._labelBack.width > r.width) {
				// if the width of the label is larger than the width of the line
				if (a.x < b.x) {
					this.x	= a.x - WIDTH;
					this.y	= a.y - HEIGHT/2;
				}	else {
					this.x	= a.x;
					this.y	= a.y - HEIGHT/2;
				}
			}
		}	else {
			// ~vertical
			if (this._labelBack.height > r.height) {
				// if the label is taller than the height of the line
				if ( a.y < b.y ) {
					this.x	= a.x - WIDTH/2;
					this.y	= a.y - HEIGHT;
				}	else {
					this.x	= a.x - HEIGHT/2;
					this.y	= a.y;
				}
			}
		}

		Render.labelMoved(this, true);
	}
}