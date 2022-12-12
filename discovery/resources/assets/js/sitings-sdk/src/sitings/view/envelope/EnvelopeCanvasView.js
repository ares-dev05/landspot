import m from '../../../utils/DisplayManager';
import ViewSettings from '../../global/ViewSettings';
import EventBase from '../../../events/EventBase';
import FacadeView from './FacadeView';
import FloorPositionView from './FloorPositionView';
import DualBuilderEnvelopeView from './DualBuilderEnvelopeView';
import InteractiveCanvasEvent from '../../events/InteractiveCanvasEvent';
import TransformableViewBase from '../base/TransformableViewBase';
import InteractiveCanvas from '../base/InteractiveCanvas';
import Utils from '../../../utils/Utils';
import * as PIXI from 'pixi.js';

export default class EnvelopeCanvasView extends TransformableViewBase {

	/**
	 * @param model {EnvelopeCanvasModel}
	 * @param application {PIXI.Application}
	 */
	constructor (model, application) {
		super();

		/**
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);

		/**
		 * @type {PIXI.Application}
		 * @private
		 */
		this._application = application;
		const interaction = application ? application.renderer.plugins.interaction : null;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._workspace	= new PIXI.Sprite();

		/**
		 * Displays the Building Envelope
		 *
		 * @type {EnvelopeView}
		 * @private
		 */
		this._envelope = new DualBuilderEnvelopeView(this._model.envelope);
		this._envelope.addListener(EventBase.CHANGE, this.onEnvelopeChanged, true);

		/**
		 * Displays the 2D front projection of the facade
		 *
		 * @type {FacadeView}
		 * @private
		 */
		this._facade = new FacadeView(this._model.facade, this._model.floorPosition );

		/**
		 * Displays the two setbacks to the sides of the facade
		 *
		 * @type {FloorPositionView}
		 * @private
		 */
		this._floorPosition	= new FloorPositionView(this._model.floorPosition);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._autoCenterContent = true;

		/**
		 * @type {InteractiveCanvas}
		 * @private
		 */
		this._iCanvas			= new InteractiveCanvas(ViewSettings.WIDTH, ViewSettings.HEIGHT, interaction);
		this._iCanvas.mode		= InteractiveCanvas.DRAG;
		this._iCanvas.addListener(InteractiveCanvasEvent.DRAG , this.dragView, this);

		// add the views to the display list
		this.addChild(this._iCanvas);
		this.addChild(this._workspace);

		Utils.removeParentOfChild(this._transformLayer);
		this._workspace.addChild(this._transformLayer);

		this.contentLayer.addChild(this.envelope);
		this.contentLayer.addChild(this.facade);
		this.contentLayer.addChild(this.floorPosition);

		// Setup scale events
		ViewSettings.instance.addListener(EventBase.RESIZE, this.resize, this);

		if (application) {
			application.view.addEventListener('wheel', (event) => {
				this.processScroll(event.deltaY, event.layerX, event.layerY);
			});
		}

		this.resize(ViewSettings.WIDTH, ViewSettings.HEIGHT);
	}

	/**
	 * @return {null|EnvelopeCanvasModel}
	 * @public
	 */
	get model() {
		return this._model;
	}

	/**
	 * @return {*}
	 * @public
	 */
	get ppm() {
		return m.ppm;
	}

	/**
	 * @return {null|EnvelopeView}
	 * @public
	 */
	get envelope() {
		return this._envelope;
	}

	/**
	 * @return {null|FacadeView}
	 * @public
	 */
	get facade() {
		return this._facade;
	}

	/**
	 * @return {null|FloorPositionView}
	 * @public
	 */
	get floorPosition() {
		return this._floorPosition;
	}

	// set the scale for all the labels in the application
	set labelsScale(v) {
		// @TODO once we implement labels
	}

	/**
	 * @private
	 */
	onModelChange() {
		this._iCanvas.visible = true;
	}

	onEnvelopeChanged(e) {
		// stop the event from bubbling
		// e.stopPropagation();
		this._autoCenterContent && this.centerContentLayer();
	}

	/**
	 * Called when the available display space changes its size
	 * @param w {number}
	 * @param h {number}
	 */
	resize(w, h)
	{
		const centerX = w / 2 / PIXI.settings.RESOLUTION;
		const centerY = h / 2 / PIXI.settings.RESOLUTION;

		this._iCanvas.resizeTo(w, h);
		this._iCanvas.x = -centerX;
		this._iCanvas.y = -centerY;

		this.x = centerX;
		this.y = centerY;
	}

	/**
	 * @param delta {Number}
	 * @param x {Number}
	 * @param y {Number}
	 */
	processScroll(delta, x, y)
	{
		const SCROLL_FACTOR = 0.005;	// was 0.02 previously
		const newScale = ViewSettings.i.fixedZoomRange(this.viewScale - delta * SCROLL_FACTOR),
			scaleDelta = this.viewScale - newScale;

		// get local position
		let position = this._transformLayer.toLocal({x: x, y: y});
		position.x /= this.viewScale;
		position.y /= this.viewScale;

		// translate to cancel the scaling effect
		this.translate(
			position.x * scaleDelta,
			position.y * scaleDelta
		);

		// set the new scale
		this.viewScale = newScale;

		this.centerContentLayer();
	}

	/**
	 * @param v {number}
	 */
	set viewScale(v)
	{
		// Because we're scaling vectors, we have to redraw everything
		m.instance.viewScale = v;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	/**
	 * @return {number}
	 */
	get viewScale()
	{
		return m.instance.viewScale;
	}

	/**
	 * @param e {InteractiveCanvasEvent}
	 */
	dragView(e)
	{
		this.translate(e.x, e.y);

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	/**
	 * @private
	 */
	centerContentLayer() {
		let bounds = this.contentLayer.getLocalBounds();
		this.contentLayer.x = -bounds.width *.5 - bounds.x;
		this.contentLayer.y = -bounds.height*.5 - bounds.y;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	onOpen() {
		this.centerContentLayer();
		this.model && this.model.enter();
	}
}