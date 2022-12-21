import * as PIXI from 'pixi.js';
import TransformableViewBase from '../base/TransformableViewBase';
import EventBase from '../../../events/EventBase';
import LotPathView from '../lot/LotPathView';
import m from '../../../utils/DisplayManager';
import ApplicationStep from '../../model/ApplicationStep';
import LabeledPolygonTheme from '../theme/LabeledPolygonTheme';
import ViewSettings from '../../global/ViewSettings';
import InteractiveCanvas from '../base/InteractiveCanvas';
import Utils from '../../../utils/Utils';
import ManipulationManager from '../../model/lot/trace/ManipulationManager';
import InteractiveCanvasEvent from '../../events/InteractiveCanvasEvent';


/**
 * @TODO @REFACTOR As a canvas view, this class shares a lot of functionality with SitingsView and LotDrawer View.
 */
export default class SitingsTraceView extends TransformableViewBase {

	/**
	 * @param model {SitingsModel}
	 * @param application {PIXI.Application}
	 */
	constructor(model, application)
	{
		super();

		/**
		 * @type {SitingsModel}
		 * @private
		 */
		this._model		= model;
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
		 * @type {LotPathView} View for the lot boundaries
		 * @private
		 */
		this._pathView	= new LotPathView(this.model.pathModel, new LabeledPolygonTheme(2, 0, 0xEEEEEE, 0.3), true);
		this._pathView.addListener(EventBase.CHANGE, this.onBorderViewChange, this);
		this._pathView.addListener(EventBase.CLICK, this.onOutlineEdgeClick, this);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._autoCenterContent	= false;

		/**
		 * @type {InteractiveCanvas}
		 * @private
		 */
		this._iCanvas			= new InteractiveCanvas(ViewSettings.WIDTH, ViewSettings.HEIGHT, interaction);
		this._iCanvas.mode		= InteractiveCanvas.DRAG;
		this._iCanvas.addListener(InteractiveCanvasEvent.DRAG , this.dragView, this);
		this._iCanvas.addListener(InteractiveCanvasEvent.CLICK, this.canvasClick, this);

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._areaPlanHolder	= new PIXI.Sprite();

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._areaPlanView		= new PIXI.Sprite(PIXI.Texture.WHITE);
		this._areaPlanView.tint = 0xFFFFFF;

		// add the views to the display list
		this.addChild(this._iCanvas);
		this.addChild(this._workspace);

		Utils.removeParentOfChild(this._transformLayer);
		this._workspace.addChild(this._transformLayer);

		// Create the display list
		this._contentLayer.addChild(this._areaPlanHolder);
		this._areaPlanHolder.addChild(this._areaPlanView);
		this._areaPlanHolder.alpha = .7;
		this._iCanvas.listenTo(this._areaPlanHolder);
		this._contentLayer.addChild(this._pathView);

		/**
		 * @type {Object}
		 * @private
		 */
		this._pdfPage	= null;

		ManipulationManager.i.listen(this.manipulateScale, this);
	}

	/**
	 * @returns {Object}
	 */
	get pdfPage() { return this._pdfPage; }

	/**
	 * @param v {Object}
	 */
	set pdfPage(v) {
		if (this._pdfPage!==v) {
			this._pdfPage = v;

			this._areaPlanView.texture = this._pdfPage ? PIXI.Texture.from(this._pdfPage.image) : PIXI.Texture.WHITE;
			this._areaPlanView.width   = this._pdfPage.width;
			this._areaPlanView.height  = this._pdfPage.height;

			this._areaPlanView.x = -this._areaPlanView.width *.5;
			this._areaPlanView.y = -this._areaPlanView.height*.5;
		}
	}

	/**
	 * @returns {SitingsModel}
	 */
	get model()		 { return this._model; }

	/**
	 * @returns {LotPathView}
	 */
	get pathView()	 { return this._pathView; }

	/**
	 * @param e {EventBase}
	 */
	onModelChange()
	{
		if (this._model.step === ApplicationStep.TRACE_OUTLINE) {
			this._pathView.startDrawing();
		}	else {
			this._pathView.stopDrawing();
		}

		this.visible = true;
	}

	/**
	 * @param v {Number}
	 * @param origin {Point}
	 */
	manipulateScale(v, origin)
	{
		this._areaPlanHolder.scale.x *= v;
		this._areaPlanHolder.scale.y *= v;

		this._areaPlanHolder.x -= ((m.px(origin.x) - this._areaPlanHolder.x) * (v-1));
		this._areaPlanHolder.y -= ((m.px(origin.y) - this._areaPlanHolder.y) * (v-1));
	}

	/**
	 * @public
	 * Call this when the trace starts
	 */
	onOpen()	{
		/*
		_areaPlanView.bitmapData = _controls.areaPlanHelper.planBitmapData;
		_areaPlanView.smoothing  = true;

		// center the area plan view
		_areaPlanView.x = -_areaPlanView.width *.5;
		_areaPlanView.y = -_areaPlanView.height*.5;
		 */

		this.centerContentLayer();
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
	 * @param delta {number}
	processScroll(delta)
	{
		var newScale:Number = ViewSettings.i.fixedZoomRange(
			scale + delta * .02
		),	scaleDelta:Number, dx:Number, dy:Number;

		// difference in scale
		scaleDelta = scale - newScale;

		// translate to cancel the scaling effect
		translate(
			_transformLayer.mouseX * scaleDelta,
			_transformLayer.mouseY * scaleDelta
		);

		// set the new scale
		this.scale = newScale;

		dispatchEvent( new EventBase(EventBase.CHANGE) );
	}
	 */

	/**
	 * @param v {number}
	 */
	set viewScale(v)
	{
		// Because we're scaling vectors, we have to redraw everything
		m.instance.viewScale = v;
	}

	/**
	 * @return {number}
	 */
	get viewScale()
	{
		return m.instance.viewScale;
	}

	/**
	 * Scales the view
	 * @param scale {number}
	 */
	scaleAndCenter(scale)
	{
		this.viewScale = scale;
		this.centerContentLayer();
	}

	/**
	 * @param event {InteractiveCanvasEvent}
	 */
	dragView(event)
	{
		this.translate(event.x, event.y);
	}

	/**
	 * Receive click events from the background of the workspace; the canvas is the bottom-most layer,
	 * and only clicks that get there are received; i.e. clicking on any active element in the workspace
	 * will not trigger this; use this function for normal-priority elements
	 *
	 * @param event {InteractiveCanvasEvent}
	 */
	canvasClick(event)
	{
		// Get the local mouse position
		const position = this._contentLayer.toLocal(new PIXI.Point(event.x, event.y));

		if (this.model.step===ApplicationStep.TRACE_OUTLINE ) {
			this.addEdgeToCrtPos(position);
		}
	}

	/**
	 * @param position {PIXI.Point}
	 * @private
	 */
	addEdgeToCrtPos(position)
	{
		this.model.pathModel.addAtPosition(
			m.toMeters(position.x),
			m.toMeters(position.y)
		);
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onBorderViewChange(e)
	{
		if (this._autoCenterContent) {
			this.centerContentLayer();
		}
	}

	/**
	 * Centers the content within the view
	 */
	centerContentLayer()
	{
		let bounds = this._pathView.getLocalBounds();
		this._contentLayer.x = -bounds.width *.5 - bounds.x;
		this._contentLayer.y = -bounds.height*.5 - bounds.y;
	}

	/**
	 * @param event {PIXI.InteractionEvent}
	 * @private
	 */
	onOutlineEdgeClick(event)
	{
		if (this._model.step === ApplicationStep.TRACE_OUTLINE) {
			try {
				const edgeModel = event.target.model;
				edgeModel.manipulate();
			} catch (e) {
			}
		}
	}
}