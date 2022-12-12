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
import PosView from '../pos/PosView';
import KeyboardLayer from '../../global/KeyboardLayer';
import KeyboardEventWrapper from '../../events/KeyboardEventWrapper';
import DisplayManager from '../../../utils/DisplayManager';
import FallTopologyView from '../levels/fall/FallTopologyView';
import LabelsView from '../LabelsView';
import MapLayerView from './MapLayerView';
import NearmapModel from '../../model/nearmap/NearmapModel';
import Geom from '../../../utils/Geom';
import ThemeManager from '../theme/ThemeManager';
import AccountMgr from '../../data/AccountMgr';


export default class NearmapOverlayView extends TransformableViewBase {

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

		this._model.nearmapModel.addEventListener(EventBase.CHANGE, this.onNearmapChange, this);
		this._model.nearmapModel.addEventListener(NearmapModel.LOCATION_CHANGE, this.onNearmapLocationChange, this);

		/**
		 * @type {PIXI.Application}
		 * @private
		 */
		this._application = application;
		const interaction = application ? application.renderer.plugins.interaction : null;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isOpen = false;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._workspace	= new PIXI.Sprite();

		// const lineColor = ThemeManager.i.theme.getColor('color_class_2');
		// const houseColor = AccountMgr.i.builder.usesXMLFormat ? 0x8FB5FF : 0xFFFFFF;
		const lineColor  = 0xFF3E40;
		const houseColor = 0x8FB5FF;

		// Create views for all the elements of the siting
		this._pathView			= new LotPathView(
			this.model.pathModel,
			new LabeledPolygonTheme(4, lineColor, 0xFFFFFF, 0.2, 'Arial', 14, lineColor)
		);
		this._pathView.stopDrawing();
		this._lotFeaturesView	= new LotFeaturesView(
			this._model.lotFeaturesModel,
			this._pathView,
			new LabeledPolygonTheme(3, lineColor, 0, 0, 'Arial', 13, 0xEEEEEE),
			new LabeledPolygonTheme(3, lineColor, 0, 0, 'Arial', 13, 0xEEEEEE)
		);
		this._multiFloors		= new MultiHouseView(
			this._model.multiFloors,
			false,
			new LabeledPolygonTheme(3, houseColor, 0, 0, 'Arial', 24, houseColor),
		);
		this._multiTransforms	= new MultiTransformsView(this._model.multiTransforms);
		this._structuresView	= new StructuresLayerView(this._model.structures);
		this._measurementsView	= new MeasurementsLayerView(this._model.measurementsModel);
		this._posView			= new PosView(this._model.posModel);
		this._fallLevelsView    = new FallTopologyView(this._model.fallTopologyModel);
		this._labelsView		= new LabelsView(this);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._autoCenterContent	= false;

		/**
		 * @type {InteractiveCanvas}
		 * @private
		 */
		this._iCanvas			= new InteractiveCanvas(
			ViewSettings.WIDTH,
			ViewSettings.HEIGHT,
			interaction
		);
		this._iCanvas.mode		= InteractiveCanvas.DRAG;
		this._iCanvas.addListener(InteractiveCanvasEvent.DRAG , this.dragView, this);

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._areaPlanHolder	= new PIXI.Sprite();

		console.log('attribution position ', this._application.renderer.width, ViewSettings.HEIGHT);

		/**
		 * @type {MapLayerView}
		 * @private
		 */
		this._mapView			= new MapLayerView(
			this._model.nearmapModel,
			this._application.renderer.width,
			ViewSettings.HEIGHT,
			// ViewSettings.WIDTH,
			// ViewSettings.HEIGHT
		);

		// add the views to the display list
		this.addChild(this._iCanvas);
		this.addChild(this._workspace);

		Utils.removeParentOfChild(this._transformLayer);
		this._workspace.addChild(this._transformLayer);
		this._workspace.addChild(this._labelsView);

		// Create the display list
		// this._transformLayer.addChildAt(this._areaPlanHolder, 0);
		this._workspace.addChildAt(this._areaPlanHolder, 0);
		this._areaPlanHolder.addChild(this._mapView);
		this._iCanvas.listenTo(this._areaPlanHolder);

		// Add all views to the screen
		this._contentLayer.addChild(this._multiFloors);
		this._contentLayer.addChild(this._multiTransforms );
		this._contentLayer.addChild(this._structuresView );
		this._contentLayer.addChild(this._lotFeaturesView);
		this._contentLayer.addChild(this._posView );
		this._contentLayer.addChild(this._measurementsView);
		this._contentLayer.addChild(this._pathView);
		this._contentLayer.addChild(this._fallLevelsView);

		this._contentLayer.visible = false;
		this._labelsView.visible = false;

		this.moveSiting = false;

		if (this._model.nearmapModel.location) {
			this.onNearmapLocationChange();
			this.onNearmapChange();
		}
	}

	/**
	 * Remove all event listeners
	 */
	cleanup() {
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);

			if (this._model.nearmapModel) {
				this._model.nearmapModel.removeEventListener(EventBase.CHANGE, this.onNearmapChange, this);
				this._model.nearmapModel.removeEventListener(NearmapModel.LOCATION_CHANGE, this.onNearmapLocationChange, this);
			}

			this._model = null;
		}
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

	/**
	 * Location Item format:
	 * "results": [{
        "title": "Melbourne",
        "highlightedTitle": "<b>Melbourne</b>",
        "vicinity": "Victoria",
        "highlightedVicinity": "Victoria",
        "position": [-37.81739, 144.96752],
        "category": "city-town-village",
        "categoryTitle": "City, Town or Village",
        "bbox": [144.55318, -38.22504, 145.54978, -37.5113],
        "href": "https://places.sit.ls.hereapi.com/places/v1/places/loc-dmVyc2lvbj0xO3RpdGxlPU1lbGJvdXJuZTtsYW5nPWVuO2xhdD0tMzcuODE3Mzk7bG9uPTE0NC45Njc1MjtjaXR5PU1lbGJvdXJuZTtjb3VudHJ5PUFVUztzdGF0ZT1WaWN0b3JpYTtzdGF0ZUNvZGU9VklDO2NhdGVnb3J5SWQ9Y2l0eS10b3duLXZpbGxhZ2U7c291cmNlU3lzdGVtPWludGVybmFsO3Bkc0NhdGVnb3J5SWQ9OTAwLTkxMDAtMDAwMA;context=Zmxvdy1pZD0wOWIyMTNkYS1iMTM2LTU0YWItOTY1OC0xZWFiZjJiOTRmMWJfMTY2MDY0Mjg2NTMxN18zMTU5XzYyMzUmYmJveD0xNDQuNTUzMTglMkMtMzguMjI1MDQlMkMxNDUuNTQ5NzglMkMtMzcuNTExMyZyYW5rPTA?app_id=MXtCW347CROeo0YIrbkW&app_code=oks4fF_Q5KnO_rVK-yscOw&tf=plain",
        "type": "urn:nlp-types:place",
        "resultType": "address",
        "id": "loc-dmVyc2lvbj0xO3RpdGxlPU1lbGJvdXJuZTtsYW5nPWVuO2xhdD0tMzcuODE3Mzk7bG9uPTE0NC45Njc1MjtjaXR5PU1lbGJvdXJuZTtjb3VudHJ5PUFVUztzdGF0ZT1WaWN0b3JpYTtzdGF0ZUNvZGU9VklDO2NhdGVnb3J5SWQ9Y2l0eS10b3duLXZpbGxhZ2U7c291cmNlU3lzdGVtPWludGVybmFsO3Bkc0NhdGVnb3J5SWQ9OTAwLTkxMDAtMDAwMA"
    }

	 NEARMAPS KEY:

	 */

	/**
	 * @returns {SitingsModel}
	 */
	get model()		 		{ return this._model; }

	/**
	 * @return {NearmapModel}
	 */
	get nearmapModel()		{ return this._model.nearmapModel; }

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
	 * @returns {PosView}
	 */
	get posView()			{ return this._posView; }

	/**
	 */
	onModelChange() {
		this.visible = true;

		// Always update the labels on a step change
		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	onNearmapChange() {
		// set the view scale so that the siting has the same scale as the map
		this.viewScale = this.nearmapModel.ppm / DisplayManager.ppm;

		// the siting position is stored in absolute longitude / latitude coordinates.
		if (this.nearmapModel.selectedCoordinates) {
			const offset = this.nearmapModel.selectedCenterOffset;

			this._transformLayer.x = m.px(offset.x);
			this._transformLayer.y = m.px(offset.y);
		}

		// when in auto placement mode, rotation is calculated automatically
		if (this.nearmapModel.autoPlacement && this.nearmapModel.selectedArea) {
			const rotation = this.model.pathModel.matchRotationWith(this.nearmapModel.selectedArea);
			this.viewRotation = Geom.rad2deg(rotation) + (this.model.nearmapModel.flipSiting ? 180 : 0);
		}

		this.updateVisible();
	}

	onNearmapLocationChange() {
		this.updateVisible();

		this._transformLayer.x = 0;
		this._transformLayer.y = 0;
	}

	updateVisible() {
		const sitingVisible = this._model.nearmapModel.location !== null && this._model.nearmapModel.zoom >= 19;

		this._contentLayer.visible = sitingVisible;
		this._labelsView.visible = sitingVisible;
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
		if (this._isOpen) {
			return;
		}

		this._isOpen = true;

		if (!this.centerOnce) {
			this.centerOnce = true;
			this.centerContentLayer();
		}

		this.setViewScale();

		// Listen to keyboard events
		KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_DOWN, this.onKeyboardEvent, this);
	}

	setViewScale() {
		// set the view scale so that the siting has the same scale as the map
		this.viewScale = this.nearmapModel.ppm / DisplayManager.ppm;
	}

	onExit() {
		if (!this._isOpen) {
			return;
		}

		this._isOpen = false;

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

		/**
		 * @type {number}
		 */
		this.sizedWidth  = w;

		/**
		 * @type {number}
		 */
		this.sizedHeight = h;

		this.saveEngineeringState();
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
		// this.viewScale = scale;
		this.centerContentLayer();
	}

	/**
	 * @param event {InteractiveCanvasEvent}
	 */
	dragView(event) {
		this._translateSiting(event.x, event.y);
	}

	/**
	 * @param dx {number}
	 * @param dy {number}
	 * @private
	 */
	_translateSiting(dx, dy) {
		// in automatic placement, the siting either remains at the center of the workspace (when no lot is selected),
		// or it moves automatically
		if (this.nearmapModel.autoPlacement === false) {
			// translate the entire workspace
			// this.translate(dx, dy);
			if (this.moveSiting) {
				this._mapView.translateSiting(dx, dy);
			}	else {
				this._mapView.translateSiting(0, 0);
			}

			if (this._labelsView) {
				this._labelsView.update();
			}
		}

		if (this.nearmapModel.autoPlacement || !this.moveSiting) {
			this._mapView.translate(-dx, -dy);
		}

		this.saveEngineeringState();
	}

	/**
	 * Centers the content within the view
	 */
	centerContentLayer()
	{
		// Center the content layer around the lot's centroid
		const center = this._pathView.model.centroid;

		this._contentLayer.x = -m.px(center.x);
		this._contentLayer.y = -m.px(center.y);

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	/**
	 * Save on every update
	 */
	saveEngineeringState() {
		return;

		/**
		 * @type {{view: AlignEngineeringView, sitingDelta: {r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *, page: (Object.image|null), pageHeight: (Object.height|number), pageWidth: (Object.width|number)}}}
		 */
		this._model.engineeringState = {
			sitingDelta: {
				ax: this._mapView.x,
				ay: this._mapView.y,
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
		/*
		if (!state) {
			state = this.engineeringState;
		}
		if (state) {
			//this._mapView.x = state.ax;
			//this._mapView.y = state.ay;
			this._contentLayer.x = state.cx;
			this._contentLayer.y = state.cy;
			this._transformLayer.x = state.tx;
			this._transformLayer.y = state.ty;

			this.viewScale = state.s;
			this.planScale = state.hasOwnProperty('ps') ? state.ps : 1;
			this.viewRotation = state.r;
		}
		 */
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