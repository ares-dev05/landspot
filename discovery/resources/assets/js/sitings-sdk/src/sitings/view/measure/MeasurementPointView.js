import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import MeasurementPointEvent from '../../events/MeasurementPointEvent';
import m from '../../../utils/DisplayManager';
import Utils from '../../../utils/Utils';
import LineDrawer from '../../render/LineDrawer';
import Render from '../../global/Render';
import ThemeManager from '../theme/ThemeManager';

export default class MeasurementPointView extends PIXI.Sprite {

	/**
	 * @param model {IMeasurement}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {IMeasurement}
		 * @private
		 */
		this._model					= model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChanged, this);
		this._model.addEventListener(MeasurementPointEvent.DELETE, this.deletePoint, this);
		this._model.addEventListener(MeasurementPointEvent.HOOKED, this.onModelChanged, this);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isAlignMeasurement	= false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._firstClick			= true;

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._graphics				= new PIXI.Graphics();
		this.addChild(this._graphics);

		// listen to mouse clicks
		this.interactive			= true;
		this.addListener(EventBase.CLICK, this.onViewClick, this);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);
	}

	/**
	 * @returns {IMeasurement}
	 */
	get model() { return this._model; }

	/**
	 * @returns {boolean}
	 */
	get isAlignMeasurement() { return this._isAlignMeasurement; }

	/**
	 * @param v
	 */
	set isAlignMeasurement(v) {
		this._isAlignMeasurement = v;
		this.render();
	}

	/**
	 * @param e {InteractionEvent}
	 * @private
	 */
	onViewClick(e)
	{
		// Click received when the measurement is hooked
		if (this._firstClick) {
			this._firstClick = false;
			return;
		}

		this._model.dispatchEditEvent();
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	deletePoint(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChanged, this);
			this._model.removeEventListener(MeasurementPointEvent.DELETE, this.deletePoint, this);
			this._model.removeEventListener(MeasurementPointEvent.HOOKED, this.onModelChanged, this);
			this._model = null;
		}

		this.removeListener(EventBase.CLICK, this.onViewClick, this);
		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);

		Utils.removeParentOfChild(this);
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onModelChanged(e=null) { this.render(); }

	/**
	 * Redraws the measurement line
	 */
	render()
	{
		this._graphics.clear();

		if (this._model.origin && this._model.intersection) {
			let ox = m.px(this._model.origin.x),	   oy = m.px(this._model.origin.y),
				ix = m.px(this._model.intersection.x), iy = m.px(this._model.intersection.y);

			if (Math.abs(ox-ix) < 1 && Math.abs(oy-iy) < 1) {
				// length=0. Draw something otherwise label bounds calculation will be messed up
				iy += 1;
			}

			// draw a square on corner setbacks
			if (this._model.isOnCorner) {
				this._graphics.lineStyle(1, 0x00BBDD, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
				this._graphics.drawRect( ox-5, oy-5, 10, 10 );
			}

			// Draw the measurement line, with a hit area
			this._graphics.lineStyle(this.currentThickness, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

			LineDrawer.drawLine(this._graphics, ox, oy, ix, iy, 10);
		}
	}

	/**
	 * @returns {PIXI.Point}
	 */
	get viewOrigin()
	{
		return this.toGlobal(new PIXI.Point(
			m.px(this._model.origin.x),
			m.px(this._model.origin.y)
		));
	}

	/**
	 * @returns {PIXI.Point}
	 */
	get viewIntersection()
	{
		if (this._model.intersection ) {
			return this.toGlobal(new PIXI.Point(
				m.px(this._model.intersection.x),
				m.px(this._model.intersection.y)
			));
		}	else {
			return this.viewOrigin;
		}
	}

	/**
	 * @returns {PIXI.Rectangle}
	 */
	get displayBounds() { return this._graphics.getBounds(); }

	/**
	 * @returns {number}
	 * @private
	 */
	get currentThickness()	{ return 2; }

	/**
	 * @returns {number}
	 * @private
	 */
	get currentColor()		{
		return this.isAlignMeasurement ? 0x00CC19 :
			this.model.isHenleyOMP ? ThemeManager.i.theme.eaveMeasurement:
			ThemeManager.i.theme.primary;
	}
}