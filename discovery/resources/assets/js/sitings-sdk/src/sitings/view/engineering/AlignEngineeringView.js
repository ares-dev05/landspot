import * as PIXI from 'pixi.js';
import TransformableViewBase from '../base/TransformableViewBase';
import EventBase from '../../../events/EventBase';
import LotPathView from '../lot/LotPathView';
import m from '../../../utils/DisplayManager';
import LabeledPolygonTheme from '../theme/LabeledPolygonTheme';
import ViewSettings from '../../global/ViewSettings';
import InteractiveCanvas from '../base/InteractiveCanvas';
import Utils from '../../../utils/Utils';
import InteractiveCanvasEvent from '../../events/InteractiveCanvasEvent';
import LotFeaturesView from '../lot/features/LotFeaturesView';
import MultiHouseView from '../house/MultiHouseView';
import MultiTransformsView from '../house/transform/MultiTransformsView';
import StructuresLayerView from '../structure/StructuresLayerView';
import MeasurementsLayerView from '../measure/MeasurementsLayerView';
import KeyboardLayer from '../../global/KeyboardLayer';
import KeyboardEventWrapper from '../../events/KeyboardEventWrapper';
import MeasurementsLayerModel from '../../model/measure/MeasurementsLayerModel';
import DisplayManager from '../../../utils/DisplayManager';
import LevelPointModel from '../../model/levels/LevelPointModel';
import LotPointModel from '../../model/lot/LotPointModel';
import LevelsLayerView from '../levels/LevelsLayerView';
import FallTopologyView from '../levels/fall/FallTopologyView';
import LabelsView from '../LabelsView';
import DeveloperFillView from '../levels/DeveloperFillView';


export default class AlignEngineeringView extends TransformableViewBase {

	/**
	 * @param model {SitingsModel}
	 * @param application {PIXI.Application}
	 */
	constructor(model, application)
	{
		super();

		this.waitNoSave = false;

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

		// Create views for all the elements of the siting
		//this._pathView			= new LotPathView(this.model.pathModel, new LabeledPolygonTheme(3, 0, 0, 0.05));
		this._pathView			= new LotPathView(this.model.pathModel, new LabeledPolygonTheme(3, 0, 0, 0));
		this._pathView.stopDrawing();
		this._pathView.addListener(EventBase.CLICK, this.onOutlineEdgeClick, this);
		this._lotFeaturesView	= new LotFeaturesView(this._model.lotFeaturesModel, this._pathView, new LabeledPolygonTheme(2, 0x000000), new LabeledPolygonTheme(2, 0x888888));
		this._multiFloors		= new MultiHouseView(this._model.multiFloors, false);
		this._multiTransforms	= new MultiTransformsView(this._model.multiTransforms);
		this._structuresView	= new StructuresLayerView(this._model.structures);
		this._measurementsView	= new MeasurementsLayerView(this._model.measurementsModel);
		this._levelsLayerView	= new LevelsLayerView(this._model.lotTopographyModel, this._model.measurementsModel);
		this._levelsLayerView.addListener(EventBase.CLICK, this.onLevelPointClick, this);
		this._fallLevelsView    = new FallTopologyView(this._model.fallTopologyModel);
		this._labelsView		= new LabelsView(this);
		this._developerFillView	= new DeveloperFillView(this._model.lotTopographyModel.developerFill);

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
		this._workspace.addChild(this._labelsView);

		// Create the display list
		// this._contentLayer.addChild(this._areaPlanHolder);
		this._transformLayer.addChildAt(this._areaPlanHolder, 0);
		this._areaPlanHolder.addChild(this._areaPlanView);
		this._areaPlanHolder.alpha = .7;
		this._iCanvas.listenTo(this._areaPlanHolder);

		// Add all views to the screen
		this._contentLayer.addChild(this._multiFloors);
		this._contentLayer.addChild(this._multiTransforms );
		this._contentLayer.addChild(this._structuresView );
		this._contentLayer.addChild(this._lotFeaturesView);
		this._contentLayer.addChild(this._developerFillView );
		this._contentLayer.addChild(this._measurementsView);
		this._contentLayer.addChild(this._pathView);
		this._contentLayer.addChild(this._levelsLayerView);
		this._contentLayer.addChild(this._fallLevelsView);

		/**
		 * @type {Object}
		 * @private
		 */
		this._pdfPage	= null;

		this._contentLayer.addListener(EventBase.MOUSE_DOWN, this.workspaceMouseDown, this);

		this.moveSiting = false;
	}

	onKeyboardEvent(event) {
		const deltas = {
			'ArrowLeft':  {x:-1.0, y: 0.0},
			'ArrowRight': {x: 1.0, y: 0.0},
			'ArrowUp':    {x: 0.0, y:-1.0},
			'ArrowDown':  {x: 0.0, y: 1.0},
		};

		// Align to the selected direction (if any)
		if (deltas.hasOwnProperty(event.nativeEvent.key)) {
			const delta = deltas[event.nativeEvent.key];
			this._translateSiting(delta.x, delta.y);
		}
	}

	_translateSiting(dx, dy) {
		this.translate(dx, dy);

		this._areaPlanView.x -= dx / this.planScale;
		this._areaPlanView.y -= dy / this.planScale;
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
	get model()		 		{ return this._model; }

	/**
	 * @returns {LotPathView}
	 */
	get pathView()	 		{ return this._pathView; }

	/**
	 * @returns {LotFeaturesView}
	 */
	get lotFeaturesView()	{ return this._lotFeaturesView; }

	/**
	 * @return {MultiHouseView}
	 */
	get multiFloorsView()	{ return this._multiFloors; }

	/**
	 * @returns {StructuresView}
	 */
	get structures()		{ return this._structuresView; }

	/**
	 * @returns {MeasurementsLayerView}
	 */
	get measurements()		{ return this._measurementsView; }

	/**
	 * @returns {MultiTransformsView}
	 */
	get multiTransforms()	{ return this._multiTransforms; }


	/**
	 */
	onModelChange() {
		this.visible = true;

		// Always update the labels on a step change
		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	/**
	 * @param v {Number}
	 * @param origin {Point}
	 */
	manipulateScale(v, origin)
	{
		/*
		this._areaPlanHolder.scale.x *= v;
		this._areaPlanHolder.scale.y *= v;

		this._areaPlanHolder.x -= ((m.px(origin.x) - this._areaPlanHolder.x) * (v-1));
		this._areaPlanHolder.y -= ((m.px(origin.y) - this._areaPlanHolder.y) * (v-1));
		 */
	}

	/**
	 * @param v {number}
	 */
	set viewRotation(v)
	{
		super.viewRotation = v;

		if (this._labelsView) {
			this._labelsView.update();
		}

		m.instance.viewRotation = v;
		this.saveEngineeringState();
	}

	/**
	 * @returns {number} Rotation in degrees
	 */
	get viewRotation()	{ return super.viewRotation; }

	/**
	 * @public
	 * Call this when the trace starts
	 */
	onOpen()	{
		if (!this.centerOnce) {
			this.centerOnce = true;
			this.centerContentLayer();
		}

		// ManipulationManager.i.listen(this.manipulateScale, this);

		// Listen to keyboard events
		KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_DOWN, this.onKeyboardEvent, this);
	}

	onExit() {
		this.saveEngineeringState();
		// ManipulationManager.i.listen(this.manipulateScale, this);

		// Listen to keyboard events
		KeyboardLayer.i.removeEventListener(KeyboardEventWrapper.KEY_DOWN, this.onKeyboardEvent, this);
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

		if (this._labelsView) {
			this._labelsView.x = -centerX;
			this._labelsView.y = -centerY;
			this._labelsView.update();
		}

		this.x = centerX;
		this.y = centerY;

		this.saveEngineeringState();
	}

	/**
	 * @param v {number}
	 */
	set planScale(v) {
		this._areaPlanHolder.scale.x = v;
		this._areaPlanHolder.scale.y = v;
	}

	/**
	 * @return number
	 */
	get planScale() {
		return this._areaPlanHolder.scale.x;
	}

	/**
	 * @param v {number}
	 */
	set viewScale(v)
	{
		if (v !== m.instance.viewScale) {
			// Because we're scaling vectors, we have to redraw everything
			m.instance.viewScale = v;
			this.centerContentLayer();
			this.saveEngineeringState();
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

		if (this._labelsView) {
			this._labelsView.update();
		}

		if (this.moveSiting) {
			this._areaPlanView.x -= event.x / this.planScale;
			this._areaPlanView.y -= event.y / this.planScale;
		}

		this.saveEngineeringState();
	}

	/**
	 * @private
	 */
	workspaceMouseDown()
	{
		// listen to mouse interactions on the entire stage
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE, this.onMouseMoved, this);
		ViewSettings.i.interaction.addListener(EventBase.CLICK,		 this.workspaceClick, this);
	}

	/**
	 * @private
	 */
	onMouseMoved()	{ this.cleanWorkspaceClickEvents(); }

	/**
	 * @private
	 */
	cleanWorkspaceClickEvents()
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE, this.onMouseMoved, this);
		ViewSettings.i.interaction.removeListener(EventBase.CLICK,		this.workspaceClick, this);
	}

	/**
	 * @param event {PIXI.InteractionEvent}
	 * @private
	 */
	workspaceClick(event)
	{
		this.cleanWorkspaceClickEvents();
		this.processClick(event.data.global);
	}

	/**
	 * @param event {InteractiveCanvasEvent}
	 * @private
	 */
	canvasClick(event) {
		this.processClick(new PIXI.Point(event.x, event.y));
	}

	/**
	 * @param position {{x:number, y:number}}
	 */
	processClick(position) {
		// Update the position to the local space
		position = this._contentLayer.toLocal(position);

		if (this._model.measurementsModel.currentMode===MeasurementsLayerModel.MODE_DEVELOPER_FILL) {
			if (this._model.lotTopographyModel.developerFill) {
				this._model.lotTopographyModel.developerFill.addPoint(
					DisplayManager.toMeters(position.x),
					DisplayManager.toMeters(position.y)
				);
			}
		}
	}

	/**
	 * Centers the content within the view
	 */
	centerContentLayer()
	{
		this._pathView.displayEdgeLabels(false);
		let bounds = this._pathView.getLocalBounds();
		this._pathView.displayEdgeLabels(true);
		this._contentLayer.x = -bounds.width *.5 - bounds.x;
		this._contentLayer.y = -bounds.height*.5 - bounds.y;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	onOutlineEdgeClick(event)
	{
		let edgeModel = null;

		// Get the local mouse position
		const position = this._contentLayer.toLocal(event.data.global);

		try {
			edgeModel = event.target.model;
		}	catch (e) {
			// ignore errors
		}
		if (edgeModel) {
			if (this._model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_LEVELS) {
				this._model.lotTopographyModel.addPoint(new LevelPointModel(new LotPointModel(
					DisplayManager.toMeters(position.x),
					DisplayManager.toMeters(position.y)
				)));
			}	else if (this._model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_RETAINING) {
				this._model.lotTopographyModel.segmentation.addRetainingWall(edgeModel);
			}
		}
	}

	/**
	 * @param event
	 */
	onLevelPointClick(event)
	{
		let levelPoint = null;
		try {
			levelPoint = event.target.levelModel;
		}	catch (e) {
			// ignore errors
		}

		if (event) {
			if (this._model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_BATTER) {
				this._model.lotTopographyModel.segmentation.addBatterPoint(levelPoint);
			}
		}
	}

	/**
	 * Save on every update
	 */
	saveEngineeringState() {
		if (this.waitNoSave) return;

		/**
		 * @type {{view: AlignEngineeringView, sitingDelta: {r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *, page: (Object.image|null), pageHeight: (Object.height|number), pageWidth: (Object.width|number)}}}
		 */
		this._model.engineeringState = {
			sitingDelta: {
				ax: this._areaPlanView.x,
				ay: this._areaPlanView.y,
				cx: this._contentLayer.x,
				cy: this._contentLayer.y,
				tx: this._transformLayer.x,
				ty: this._transformLayer.y,
				r: this.viewRotation,
				s: this.viewScale,
				ps: this.planScale,
				page: this._pdfPage ? this.pdfPage.image : null,
				pageWidth: this._pdfPage ? this.pdfPage.width : 0,
				pageHeight: this._pdfPage ? this.pdfPage.height : 0,
			},
			view: this
		};
	}

	restoreEngineeringState(state) {
		if (!state) {
			state = this.engineeringState;
		}
		if (state) {
			this._areaPlanView.x = state.ax;
			this._areaPlanView.y = state.ay;
			this._contentLayer.x = state.cx;
			this._contentLayer.y = state.cy;
			this._transformLayer.x = state.tx;
			this._transformLayer.y = state.ty;

			this.viewScale = state.s;
			this.planScale = state.hasOwnProperty('ps') ? state.ps : 1;
			this.viewRotation = state.r;
		}
	}

	/**
	 * @returns {{r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *}|{r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: PIXI.Sprite.x, ay: PIXI.Sprite.y}|null}
	 */
	get engineeringState() {
		if (this._model && this._model.engineeringState) {
			return this._model.engineeringState.sitingDelta;
		}

		return null;
	}
}