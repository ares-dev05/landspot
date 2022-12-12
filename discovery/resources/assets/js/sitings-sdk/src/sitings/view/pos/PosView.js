import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import HashPattern from './HashPattern';
import LotPointView from '../lot/LotPointView';
import m from '../../../utils/DisplayManager';
import Render from '../../global/Render';

const DISPLAY_BACKGROUND = false;

export default class PosView extends PIXI.Sprite {

	/**
	 * @param model {PosCalculator}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {PosCalculator}
		 * @private
		 */
		this._model			= model;
		this._model.addEventListener(EventBase.ADDED , this.onPointAdded,	  this);
		this._model.addEventListener(EventBase.CHANGE, this.onPosAreaChanged, this);

		/**
		 * POS Graphics: background and outline
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._graphics		= new PIXI.Sprite();

		/**
		 * @type {HashPattern}
		 * @private
		 */
		if (DISPLAY_BACKGROUND) {
			this._backPattern = new HashPattern();
		}

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._outline		= new PIXI.Graphics();

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		if (DISPLAY_BACKGROUND) {
			this._backMask = new PIXI.Graphics();
		}

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._pointsView	= new PIXI.Sprite();

		/**
		 * @type {PIXI.Point}
		 * @private
		 */
		this._viewCenter	= new PIXI.Point();

		// Create the display list
		if (DISPLAY_BACKGROUND) {
			this._backPattern.mask = this._backMask;
			this._graphics.addChild(this._backPattern);
			this._graphics.addChild(this._backMask);
		}

		this._graphics.addChild(this._outline);

		this.addChild(this._graphics);
		this.addChild(this._pointsView);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.onZoomLevelChange, this);

		// add existing points
		this._model.points.forEach(point => this._pointsView.addChild(new LotPointView(point)));
	}

	/**
	 * @returns {PosCalculator}
	 */
	get model() { return this._model; }

	/**
	 * @returns {PIXI.Point}
	 */
	get viewCenter() {
		this._viewCenter.x = 0;
		this._viewCenter.y = 0;

		if (this._model.points && this._model.points.length > 0 ) {
			for (let i=0, p; i<this._model.points.length; ++i) {
				p  = this._model.points[i % this._model.points.length];
				this._viewCenter.x += p.x;
				this._viewCenter.y += p.y;
			}

			this._viewCenter.x = m.px(this._viewCenter.x) / this._model.points.length;
			this._viewCenter.y = m.px(this._viewCenter.y) / this._model.points.length;
			this._viewCenter = this.toGlobal(this._viewCenter);
		}

		return this._viewCenter;
	}

	onPointAdded()
	{
		// add a self-managed point view
		this._pointsView.addChild(
			new LotPointView(this._model.lastPoint)
		);
	}

	showForExport()  { this._pointsView.visible = false; }
	exportFinished() { this._pointsView.visible = true;  }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onPosAreaChanged(e)	{ this.render(); }

	/**
	 * @param e {EventBase}
	 */
	onZoomLevelChange(e) { this.render(); }

	/**
	 * @return {number}
	 * @protected
	 */
	get lineColor() { return 0x006644; }

	/**
	 * @return {number}
	 * @protected
	 */
	get lineAlpha() { return 0.7; }

	/**
	 * @private
	 */
	render() {
		this._graphics.cacheAsBitmap = false;

		// redraw the mask & the outline
		if (DISPLAY_BACKGROUND) {
			this._backMask.clear();
		}

		this._outline.clear();

		if (DISPLAY_BACKGROUND) {
			this._backMask.beginFill(0, .1);
		}

		this._outline.lineStyle(2, this.lineColor, this.lineAlpha, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		let minx =  Infinity,
			miny =  Infinity,
			maxx = -Infinity,
			maxy = -Infinity;

		if (this._model.points && this._model.points.length > 0 ) {
			for (let i=0, p, cx, cy; i<=this._model.points.length; ++i) {
				p  = this._model.points[i % this._model.points.length];
				cx = m.px(p.x);
				cy = m.px(p.y);

				minx = Math.min(minx, cx);
				miny = Math.min(miny, cy);
				maxx = Math.max(maxx, cx);
				maxy = Math.max(maxy, cy);

				if (i===0) {
					if (DISPLAY_BACKGROUND) {
						this._backMask.moveTo(cx, cy);
					}
					this._outline.moveTo(cx, cy);
				}	else {
					if (DISPLAY_BACKGROUND) {
						this._backMask.lineTo(cx, cy);
					}
					this._outline.lineTo(cx, cy);
				}
			}
		}

		if (DISPLAY_BACKGROUND) {
			this._backMask.endFill();
			this._backPattern.draw(minx, miny, maxx, maxy);
		}

		this._graphics.cacheAsBitmap = true;
	}
}