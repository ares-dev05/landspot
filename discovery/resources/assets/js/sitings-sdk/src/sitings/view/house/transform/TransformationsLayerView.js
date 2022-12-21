import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import HighlightableModel from '../../../../events/HighlightableModel';
import ModelEvent from '../../../events/ModelEvent';
import m from '../../../../utils/DisplayManager';
import Geom from '../../../../utils/Geom';
import Utils from '../../../../utils/Utils';
import TransformationView from './TransformationView';
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';
import ViewSettings from '../../../global/ViewSettings';
import TransformationCutView from './TransformationCutView';


export default class TransformationsLayerView extends PIXI.Sprite
{
	static get EVT_CUTS_RENDERED() { return 'fptlv.cutsRendered'; }

	/**
	 * @param v {boolean}
	 */
	set showTransforms(v) { this._viewsLayer.visible = v; }

	/**
	 * @return {TransformationsLayerModel}
	 */
	get model()		{ return this._model; }

	/**
	 * @return {Array}
	 */
	get cutViews()	{ return this._cutViews; }

	/**
	 * @param model {TransformationsLayerModel}
	 * @constructor
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {TransformationsLayerModel}
		 * @private
		 */
		this._model			= model;
		this._model.addEventListener(EventBase.ADDED  , this.onTransformationAdded, this);
		this._model.addEventListener('updateView', this.onModelChange, this);
		this._model.addEventListener(ModelEvent.DELETE, this.onModelDeleted, this);
		this._model.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.onAssociatedFloorHighlight, this);

		/**
		 * @type {TransformationView[]}
		 * @private
		 */
		this._views			= [];

		/**
		 * @type {TransformationCutView[]}
		 * @private
		 */
		this._cutViews		= [];

		/**
		 * @type {TransformationView}
		 * @private
		 */
		this._draggingView	= null;

		/**
		 * @type {number}
		 * @private
		 */
		this._prevX			= 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._prevY			= 0;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._viewsLayer	= new PIXI.Sprite();

		this.addChild(this._viewsLayer);

		m.instance.addEventListener(EventBase.CHANGE, this.onModelChange, this);
	}

	/**
	 * Used for dual-occupancy sitings
	 *
	 * @param e {EventBase}
	 * @private
	 */
	onAssociatedFloorHighlight(e=null)
	{
		this.alpha = this._model.floorModel.activelySelected ? 1 : .7;
	}

	showForExport()		{ this.alpha = 1; }

	exportFinished()	{ this.onAssociatedFloorHighlight(); }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onModelChange(e)
	{
		this.x			= m.px(this._model.x);
		this.y			= m.px(this._model.y);
		this.rotation	= Geom.deg2rad(this._model.rotation);

		// render all the cut segments
		this.renderCutSegments();
	}

	/**
	 * @param e {ModelEvent}
	 * @private
	 */
	onModelDeleted(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.ADDED  , this.onTransformationAdded, this);
			this._model.removeEventListener('updateView', this.onModelChange, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.onModelDeleted, this);
			this._model.removeEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.onAssociatedFloorHighlight, this);
			this._model = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.onModelChange, this);

		Utils.removeChildrenOfParent(this);
		Utils.removeParentOfChild(this);
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onTransformationAdded(e)
	{
		const view = new TransformationView(this._model.lastTransformation);

		this._viewsLayer.addChild(view);
		this._views.push(view);

		view.clickArea.addListener(EventBase.MOUSE_DOWN, this.viewMouseDown, this);

		view.addListener(EventBase.REMOVED,	this.viewRemoved, this);
		view.addListener(MeasurementPointEvent.EDIT, this.measurementEdit, this);
		// view.buttonMode = true;
	}

	/**
	 * @param e {MeasurementPointEvent}
	 * @private
	 */
	measurementEdit(e)		{ this.emit(e); }

	/**
	 * @param container {TransformationsLayerView}
	 * @private
	 */
	viewRemoved(container) {
		container.removeView(this);
	}

	/**
	 * @param view {TransformationView}
	 * @private
	 */
	removeView(view) {
		view.clickArea.removeListener(EventBase.MOUSE_DOWN, this.viewMouseDown, this);
		view.removeListener(EventBase.REMOVED,	this.viewRemoved, this);
		view.removeListener(MeasurementPointEvent.EDIT, this.measurementEdit, this);

		this._views.splice(this._views.indexOf(view), 1);
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	viewMouseDown(event)
	{
		const position		= this.toLocal(event.data.global);

		/**
		 * @type {TransformationView}
		 */
		this._draggingView	= event.target.parent;
		this._prevX			= position.x;
		this._prevY			= position.y;

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,			this.stageMouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE,	this.stageMouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE,		this.stageMouseMove, this);
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	stageMouseUp(event)
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP,		  this.stageMouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.stageMouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE,		  this.stageMouseMove, this);

		if (this._draggingView && this._draggingView.model.isAddition) {
			this._draggingView.model.snapToFloor(this._model.floorModel);
			this._draggingView = null;
		}
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	stageMouseMove(event)
	{
		const position = this.toLocal(event.data.global);

		if (this._draggingView) {
			this._draggingView.model.x += m.tr(position.x - this._prevX);
			this._draggingView.model.y += m.tr(position.y - this._prevY);
		}
		this._prevX = position.x;
		this._prevY = position.y;
	}

	/**
	 * @private
	 */
	renderCutSegments()
	{
		// remove all existing cut views
		while (this._cutViews.length) {
			this.removeChild(this._cutViews[0]);
			this._cutViews.shift();
		}

		// add the new cut views
		for (let i=0; i<this._model.cutSegments.length; ++i) {
			const view = new TransformationCutView(this._model.cutSegments[i]);
			this.addChild(view);
			this._cutViews.push(view);
		}

		this.emit(TransformationsLayerView.EVT_CUTS_RENDERED, new EventBase(TransformationsLayerView.EVT_CUTS_RENDERED));
	}
}