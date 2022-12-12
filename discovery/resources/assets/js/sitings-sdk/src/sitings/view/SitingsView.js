import * as PIXI from 'pixi.js';
import TransformableViewBase from './base/TransformableViewBase';
import EventBase from '../../events/EventBase';
import DisplayManager from '../../utils/DisplayManager';
import m from '../../utils/DisplayManager';
import ApplicationStep from '../model/ApplicationStep';
import LotPathView from './lot/LotPathView';
import Utils from '../../utils/Utils';
import LotFeaturesView from './lot/features/LotFeaturesView';
import LabeledPolygonTheme from './theme/LabeledPolygonTheme';
import InteractiveCanvas from './base/InteractiveCanvas';
import ViewSettings from '../global/ViewSettings';
import InteractiveCanvasEvent from '../events/InteractiveCanvasEvent';
import LotFeaturesModel from '../model/lot/features/LotFeaturesModel';
import MultiHouseView from './house/MultiHouseView';
import HouseEdgeEvent from '../events/HouseEdgeEvent';
import StructuresLayerView from './structure/StructuresLayerView';
import MultiTransformsView from './house/transform/MultiTransformsView';
import MeasurementsLayerView from './measure/MeasurementsLayerView';
import MeasurementsLayerModel from '../model/measure/MeasurementsLayerModel';
import LabelsView from './LabelsView';
import PosView from './pos/PosView';
import StreetsDisplayView from './lot/street/StreetsDisplayView';
import PosLabelView from './pos/PosLabelView';
import TransformEvent from '../events/TransformEvent';
import Geom from '../../utils/Geom';
import ViewDragEvent from '../events/ViewDragEvent';
import LevelPointModel from '../model/levels/LevelPointModel';
import LevelsLayerView from './levels/LevelsLayerView';
import LotPointModel from '../model/lot/LotPointModel';
import FallTopologyView from './levels/fall/FallTopologyView';


export default class SitingsView extends TransformableViewBase {


	/**
	 * @param model {SitingsModel}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {SitingsModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);

		/**
		 * @type {LotPathView}
		 * @private
		 */
		this._pathView = null;

		/**
		 * Block/Angled Easements
		 * @type {LotFeaturesView}
		 * @private
		 */
		this._lotFeaturesView = null;

		/**
		 * Label Views for
		 * @type {LabelsView}
		 * @private
		 */
		this._labelsView = null;

		/**
		 * @type {MultiHouseView}
		 * @private
		 */
		this._multiFloors	= null;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._autoCenterContent = true;

		/**
		 * @type {InteractiveCanvas}
		 * @private
		 */
		this._iCanvas = null;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._workspace = null;

		this.init();
	}

	/**
	 * @return {SitingsModel}
	 */
	get model() { return this._model; }

	/**
	 * @return {LotPathView}
	 */
	get pathView() { return this._pathView; }

	/**
	 * @returns {LotFeaturesView}
	 */
	get lotFeaturesView() { return this._lotFeaturesView; }

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
	 * @returns {LevelsLayerView}
	get levelsLayerView()	{ return this._levelsLayerView; }
	 */

	/**
	 * @returns {FallTopologyView}
	get fallLevelsView()	{ return this._fallLevelsView; }
	 */

	/**
	 * @returns {MultiTransformsView}
	 */
	get multiTransforms()	{ return this._multiTransforms; }

	/**
	 * @returns {PosView}
	 */
	get posView()			{ return this._posView; }

	/**
	 * @returns {StreetsDisplayView}
	 */
	get streetsView()		{ return this._streetsView; }

	/**
	 * @return {LabeledPolygonTheme}
	 */
	get theme() { return this._theme; }

	/**
	 */
	onModelChange()
	{
		// Hide the transformations once we move to the measurements step
		this._multiTransforms.showTransforms = this._model.step <= ApplicationStep.ADD_EXTENSIONS;

		// Always update the labels on a step change
		if (this._labelsView) {
			this._labelsView.update();
		}

		this._model.step === ApplicationStep.TRACE_OUTLINE ?
			this._pathView.startDrawing() :
			this._pathView.stopDrawing();
	}

	init()
	{
		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme				= new LabeledPolygonTheme(2, 0, 0, 0);

		/**
		 * View for the lot
		 *
		 * @type {LotPathView}
		 * @private
		 */
		this._pathView			= new LotPathView(this._model.pathModel, this._theme);
		this._pathView.addListener(EventBase.CHANGE, this.onBorderViewChange, this);
		this._pathView.addListener(EventBase.CLICK, this.onOutlineEdgeClick, this);

		// Listen to lot rotation events (used for page alignments)
		this.model.pathModel.addEventListener(TransformEvent.ROTATE, this.onLotRotate, this);

		/**
		 * View for lot features (easements, envelopes, crossovers)
		 *
		 * @type {LotFeaturesView}
		 * @private
		 */
		this._lotFeaturesView	= new LotFeaturesView(
			this._model.lotFeaturesModel,
			this._pathView,
			// visual theme for easements
			new LabeledPolygonTheme(1, 0x000000),
			// visual theme for envelopes
			new LabeledPolygonTheme(1, 0x888888)
		);

		/**
		 * View for all the houses that are sited on the lot
		 *
		 * @type {MultiHouseView}
		 * @private
		 */
		this._multiFloors		= new MultiHouseView(this._model.multiFloors);
		this._multiFloors.addListener(HouseEdgeEvent.CLICK, this.onFloorEdgeClick, this);
		this._multiFloors.addListener(ViewDragEvent.CLICK, this.onFloorClick, this);

		/**
		 * @type {MultiTransformsView}
		 * @private
		 */
		this._multiTransforms	= new MultiTransformsView(this._model.multiTransforms);

		/**
		 * View for additional structures that are sited on the lot (e.g. pools, trees etc.)
		 *
		 * @type {StructuresView}
		 * @private
		 */
		this._structuresView	= new StructuresLayerView(this._model.structures);

		/**
		 * View for all the measurements taken in the Siting
		 * @type {MeasurementsLayerView}
		 * @private
		 */
		this._measurementsView	= new MeasurementsLayerView(this._model.measurementsModel);

		/**
		 * @type {LevelsLayerView}
		 * @private
		this._levelsLayerView	= new LevelsLayerView(this._model.lotTopographyModel);
		 */

        /**
         * @type {FallTopologyView}
         * @private
		this._fallLevelsView    = new FallTopologyView(this._model.fallTopologyModel);
		 */

		/**
		 * @type {PosView}
		 * @private
		 */
		this._posView			= new PosView(this._model.posModel);

		/**
		 * @type {StreetsDisplayView}
		 * @private
		 */
		this._streetsView		= new StreetsDisplayView(this._model.streetsModel, this._pathView);

		/**
		 * Labels view, placed in a separate coordinate system separate from the lot rotation/translation
		 * @type {LabelsView}
		 * @private
		 */
		this._labelsView		= new LabelsView(this);

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._workspace 		= new PIXI.Sprite();

		/**
		 * @type {InteractiveCanvas}
		 * @private
		 */
		this._iCanvas			= new InteractiveCanvas(ViewSettings.WIDTH, ViewSettings.HEIGHT);
		this._iCanvas.mode		= InteractiveCanvas.DRAG;

		// add the views to the display list
		this.addChild(this._iCanvas);
		this.addChild(this._workspace);

		Utils.removeParentOfChild(this._transformLayer);
		this._workspace.addChild(this._transformLayer);
		this._workspace.addChild(this._labelsView);

		// this._contentLayer.addChild(this._edgeIntersView );
		this._contentLayer.addChild(this._multiFloors);
		this._contentLayer.addChild(this._multiTransforms );
		this._contentLayer.addChild(this._structuresView );
		this._contentLayer.addChild(this._pathView);
		this._contentLayer.addChild(this._lotFeaturesView);
		this._contentLayer.addChild(this._streetsView);
		this._contentLayer.addChild(this._posView );
		this._contentLayer.addChild(this._measurementsView);
		// this._contentLayer.addChild(this._levelsLayerView);
		// this._contentLayer.addChild(this._fallLevelsView);

		this.setupLabelsView();

		// Mouse interaction
		this._iCanvas.addListener(InteractiveCanvasEvent.DRAG , this.dragView   , this);
		this._iCanvas.addListener(InteractiveCanvasEvent.CLICK, this.canvasClick, this);

		this._contentLayer.addListener(EventBase.MOUSE_DOWN, this.workspaceMouseDown, this);

		ViewSettings.instance.addListener(EventBase.RESIZE, this.resize, this);

		ViewSettings.instance.application.view.addEventListener('wheel', (event) => {
			this.processScroll(event.deltaY, event.layerX, event.layerY);
		});

		this.resize(ViewSettings.WIDTH, ViewSettings.HEIGHT);
	}

	/**
	 * @private
	 */
	setupLabelsView()
	{
		// Add Private Open Space Label
		if (this._posView) {
			this._labelsView.addLabel(new PosLabelView(this._posView));
		}

		// Add Street Labels
		if (this._streetsView && this._streetsView.labels.length) {
			for (let i=0; i<this._streetsView.labels.length; ++i) {
				this._labelsView.addLabel(
					this._streetsView.labels[i]
				);
			}
		}
	}

	/**
	 * @param event {TransformEvent}
	 * @private
	 */
	onLotRotate(event)
	{
		this.viewRotation = Geom.limit180(event.rotation);

		// Emit the transformation event so that the UI can update the rotation bar to the new value
		this.emit(TransformEvent.ROTATE, {rotation: this.viewRotation});
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

		this._labelsView.x = -centerX;
		this._labelsView.y = -centerY;
		this._labelsView.update();

		this.x = centerX;
		this.y = centerY;
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
	}

	/**
	 * @returns {number} Rotation in degrees
	 */
	get viewRotation()	{ return super.viewRotation; }

	/**
	 * @param v {number}
	 */
	set viewScale(v)
	{
		// Because we're scaling vectors, we have to redraw everything
		DisplayManager.instance.viewScale = v;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	/**
	 * @return {number}
	 */
	get viewScale()
	{
		return DisplayManager.instance.viewScale;
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
		this.emit('scaleChanged', {viewScale: newScale});
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
	 * Receive click events from the background of the workspace; the canvas is the bottom-most layer,
	 * and only clicks that get there are received; i.e. clicking on any active element in the workspace
	 * will not trigger this; use this function for normal-priority elements
	 *
	 * @param event {InteractiveCanvasEvent}
	 * @private
	 */
	canvasClick(event)
	{
		// Get the local mouse position
		const position = this._contentLayer.toLocal(new PIXI.Point(event.x, event.y));

		if (this._model.step===ApplicationStep.ADD_EASEMENT &&
			this._model.lotFeaturesModel.mode===LotFeaturesModel.MODE_DRIVEWAY) {
			this.addDrivewayAtCrtPos(position);
		}	else
		if (this._model.step===ApplicationStep.ADD_EASEMENT &&
			this._model.lotFeaturesModel.mode===LotFeaturesModel.MODE_EDGE_INTERSECTION) {
			// @TODO
			// this.addEdgeIntersectionAtCrtPos();
		}	else
		if (this._model.step===ApplicationStep.ADD_MEASUREMENTS &&
			this._model.measurementsModel.currentMode===MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE) {
			this.addPosPointAtCrtPos(position);
		}
	}

	/**
	 * @param e {InteractionEvent}
	 * @private
	 */
	workspaceMouseDown(e)
	{
		// listen to mouse interactions on the entire stage
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE, this.onMouseMoved, this);
		ViewSettings.i.interaction.addListener(EventBase.CLICK,		 this.workspaceClick, this);
	}

	/**
	 * @param e {InteractionEvent}
	 * @private
	 */
	onMouseMoved(e)	{ this.cleanWorkspaceClickEvents(); }

	/**
	 * @private
	 */
	cleanWorkspaceClickEvents()
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE, this.onMouseMoved, this);
		ViewSettings.i.interaction.removeListener(EventBase.CLICK,		this.workspaceClick, this);
	}

	/**
	 * Receive click events from the entire workspace; clicking on any position and/or element of the
	 * workspace will trigger this; use this function for high-priority elements only, as it can interact
	 * with the functionality of active elements from the workspace
	 *
	 * @param event {PIXI.InteractionEvent}
	 * @private
	 */
	workspaceClick(event)
	{
		// Get the local mouse position
		const position = this._contentLayer.toLocal(event.data.global);

		this.cleanWorkspaceClickEvents();

		if (this._model.step === ApplicationStep.ADD_MEASUREMENTS &&
			this._model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE ) {
			// stop the propagation of this click if we use it
			event.stopPropagation();
			this.addPosPointAtCrtPos(position);
		}
	}

	/**
	 * @param position {PIXI.Point}
	 * @private
	 */
	addDrivewayAtCrtPos(position)
	{
		// add a new driveway at the click position
		// convert the pixel coordinates to metric coordinates
		this._model.lotFeaturesModel.addDriveway(
			DisplayManager.toMeters(position.x),
			DisplayManager.toMeters(position.y)
		);
	}

	/**
	 * @param position {PIXI.Point}
	 * @private
	 */
	addPosPointAtCrtPos(position)
	{
		if (this._model.posModel) {
			this._model.posModel.addPoint(
				DisplayManager.toMeters(position.x),
				DisplayManager.toMeters(position.y)
			);
		}
	}

	onBorderViewChange()
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
		// centering!!
		let bounds = this._pathView.getLocalBounds();
		this._contentLayer.x = -bounds.width *.5 - bounds.x;
		this._contentLayer.y = -bounds.height*.5 - bounds.y;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	/**
	 * @param event {PIXI.InteractionEvent}
	 */
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
			switch (this._model.step) {
				case ApplicationStep.TRACE_OUTLINE:
					// e.model.dispatchEvent( new OutlineEdgeEvent(OutlineEdgeEvent.EDIT, e.model) );
					break;

				case ApplicationStep.ADD_EASEMENT:
					if (this._model.lotFeaturesModel.mode===LotFeaturesModel.MODE_DRIVEWAY) {
						this.addDrivewayAtCrtPos(position);
					}	else {
						this._model.addOrEditEasementToEdge(edgeModel);
					}
					break;

				case ApplicationStep.ADD_MEASUREMENTS:
					if (this._model.measurementsModel.currentMode===MeasurementsLayerModel.MODE_MEASUREMENT ||
						this._model.measurementsModel.currentMode===MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT ||
						this._model.measurementsModel.currentMode===MeasurementsLayerModel.MODE_PAGE_ALIGNMENT) {

						this._model.measurementsModel.addMeasurementTo(
							edgeModel,
							DisplayManager.toMeters(position.x), DisplayManager.toMeters(position.y)
						);
					}

					if (this._model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_LEVELS) {
						this._model.lotTopographyModel.addPoint(new LevelPointModel(new LotPointModel(
							DisplayManager.toMeters(position.x),
							DisplayManager.toMeters(position.y)
						)));
					}

					break;

				default:
					// N/A
					break;
			}
		}
	}

	/**
	 * @param event {HouseEdgeEvent}
	 */
	onFloorEdgeClick(event)
	{
		// Get the local mouse position
		const position = this._contentLayer.toLocal(event.mousePosition);

		if (this.model.step === ApplicationStep.ADD_MEASUREMENTS) {
			if (this.model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_MEASUREMENT ||
				this.model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT) {
				this.model.measurementsModel.addFloorsMeasurement(
					event.model,
					event.floor,
					DisplayManager.toMeters(position.x),
					DisplayManager.toMeters(position.y)
				);
			}

			if (this.model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE) {
				this.addPosPointAtCrtPos(position);
			}

			if (this.model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_LEVELS) {
				this.model.lotTopographyModel.addPoint(new LevelPointModel(new LotPointModel(position.x, position.y)));
			}
		}
	}

	/**
	 * @param event {ViewDragEvent}
	 */
	onFloorClick(event)
	{
		if (this.model.step === ApplicationStep.ADD_MEASUREMENTS &&
			this.model.measurementsModel.currentMode === MeasurementsLayerModel.MODE_PRIVATE_OPEN_SPACE) {

			this.addPosPointAtCrtPos(new PIXI.Point(event.dx, event.dy));
		}
	}
}