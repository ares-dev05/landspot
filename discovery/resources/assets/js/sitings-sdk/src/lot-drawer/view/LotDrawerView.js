import * as PIXI from 'pixi.js';
import EventBase from "../../events/EventBase";
import m from "../../utils/DisplayManager";
import ApplicationStep from "../../sitings/model/ApplicationStep";
import LotPathView from "../../sitings/view/lot/LotPathView";
import LotDrawerModel from "../model/LotDrawerModel";
import Utils from "../../utils/Utils";
import LotFeaturesView from "../../sitings/view/lot/features/LotFeaturesView";
import LabeledPolygonTheme from "../../sitings/view/theme/LabeledPolygonTheme";
import TransformableViewBase from "../../sitings/view/base/TransformableViewBase";
import LabelsView from "../../sitings/view/LabelsView";
import ViewSettings from "../../sitings/global/ViewSettings";
import LotTitleView from "./LotTitleView";

export default class LotDrawerView extends TransformableViewBase {

	/**
	 * @param model {LotDrawerModel}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {LotDrawerModel}
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
		 * @type {boolean}
		 * @private
		 */
		this._autoCenterContent = true;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._workspace = null;

		this.init();
	}

	/**
	 * @return {LotDrawerModel}
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
	 * @return {LabeledPolygonTheme}
	 */
	get theme() { return this._theme; }

	/**
	 * @returns {LabeledPolygonTheme}
	 */
	get titleTheme() { return this._titleTheme; }

	/**
	 * @param event
	 */
	onModelChange(event)
	{
		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	init()
	{
		// visual theme to apply to the lot and features
		this._theme				= new LabeledPolygonTheme();
		this._theme.renderLineEnds	= true;

		this._titleTheme		= new LabeledPolygonTheme();

		// build the views
		this._pathView			= new LotPathView(this._model.pathModel, this._theme);
		this._pathView.addListener(EventBase.CHANGE, this.onBorderViewChange, this);
		this._pathView.addListener(EventBase.CLICK, this.onOutlineEdgeClick, this);

		/**
		 * @type {LotFeaturesView}
		 * @private
		 */
		this._lotFeaturesView	= new LotFeaturesView(this._model.lotFeaturesModel, this._pathView, this._theme, this._theme);

		/**
		 * @type {LotTitleView}
		 * @private
		 */
		this._titleLabel		= new LotTitleView(this._pathView, this._titleTheme);

		this._labelsView		= new LabelsView(this);

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._workspace = new PIXI.Sprite();
		this.addChild(this._workspace);

		Utils.removeParentOfChild(this._transformLayer);
		this._workspace.addChild(this._transformLayer);
		this._workspace.addChild(this._labelsView);
		this._workspace.addChild(this._titleLabel);

		this._contentLayer.addChild(this._pathView);
		this._contentLayer.addChild(this._lotFeaturesView);

		ViewSettings.instance.addListener(EventBase.RESIZE, this.resize, this);

		this.resize(ViewSettings.WIDTH, ViewSettings.HEIGHT);
	}

	/**
	 * Called when the available display space changes its size
	 * @param w
	 * @param h
	 */
	resize(w, h)
	{
		const centerX = w / 2 / PIXI.settings.RESOLUTION;
		const centerY = h / 2 / PIXI.settings.RESOLUTION;

		this._labelsView.x = -centerX;
		this._labelsView.y = -centerY;
		this._labelsView.update();

		this.x = centerX;
		this.y = centerY;
	}

	/**
	 * @returns {number}
	 */
	get viewRotation() { return super.viewRotation; }

	/**
	 * @param v {number}
	 */
	set viewRotation(v)
	{
		super.viewRotation = v;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

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

	onBorderViewChange(event)
	{
		if (this._autoCenterContent) {
			this.centerContentLayer();
		}
	}

	/**
	 * Centres the content within the view
	 */
	centerContentLayer()
	{
		let bounds = this._pathView.getLocalBounds();
		this._contentLayer.x = -bounds.width *.5 - bounds.x;
		this._contentLayer.y = -bounds.height*.5 - bounds.y;

		if (this._labelsView) {
			this._labelsView.update();
		}
	}

	onOutlineEdgeClick(event)
	{
		let edgeModel = null;

		try {
			edgeModel = event.target.model;
		}	catch (e) {
			// ignore
		}

		if (edgeModel) {
			if (this._model.step === ApplicationStep.TRACE_OUTLINE) {
				// e.model.dispatchEvent( new OutlineEdgeEvent(OutlineEdgeEvent.EDIT, e.model) );
			}	else
			if (this._model.step === ApplicationStep.ADD_EASEMENT) {
				this._model.addOrEditEasementToEdge(edgeModel);
			}
		}
	}
}