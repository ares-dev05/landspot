import * as PIXI from 'pixi.js';
import ModelEvent from '../../events/ModelEvent';
import EventBase from '../../../events/EventBase';
import HighlightableModel from '../../../events/HighlightableModel';
import TransformableViewBase from '../base/TransformableViewBase';
import DisplayManager from '../../../utils/DisplayManager';
import Utils from '../../../utils/Utils';
import HouseLayerView from './HouseLayerView';
import HouseEdgeEvent from '../../events/HouseEdgeEvent';
import ViewSettings from '../../global/ViewSettings';
import ViewDragEvent from '../../events/ViewDragEvent';
import m from '../../../utils/DisplayManager';


export default class HouseView extends TransformableViewBase {

	/**
	 * @param model {HouseModel}
	 * @param interactive {boolean}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, interactive=true, theme=null)
	{
		super();

		/**
		 * @type {HouseModel}
		 * @private
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.ADDED, this.newLayersAdded, this);
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(ModelEvent.DELETE, this.onModelDeleted, this);
		this._model.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.onHighlightChange, this);

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme = theme;

		/**
		 * @type {HouseLayerView[]}
		 * @private
		 */
		this._layers	= [];

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._hitArea	= new PIXI.Graphics();
		this._hitArea.beginFill(0, 0);
		this._hitArea.alpha = 0;
		this._hitArea.visible = false;
		this._hitArea.drawRect(0, 0, 100, 100);
		this._hitArea.endFill();
		this.addContent(this._hitArea, false);

		/**
		 * @type {number}
		 * @private
		 */
		this._prevX = 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._prevY = 0;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._dragging = false;

		if (interactive) {
			this.addListener(EventBase.MOUSE_DOWN, this.startDragFloor, this);
		}

		this.interactive = interactive;
		this.buttonMode = interactive;

		// Set the house to the correct position & values.
		this.newLayersAdded();
		this.onModelChange();

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.onModelChange, this);
	}

	/**
	 * @return {HouseModel}
	 */
	get model() { return this._model; }

	showForExport()  { this.alpha = 1; }
	exportFinished() { this.onHighlightChange(); }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onHighlightChange(e) { this.alpha	= this._model.activelySelected ? 1 : .5; }

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 */
	startDragFloor(event)
	{
		const position = this.parent.toLocal(event.data.global);

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,	 	   this.stopDragFloor, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.stopDragFloor, this);
		ViewSettings.i.interaction.addListener(EventBase.CLICK,		 	   this.stopDragState, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE, 	   this.updateDrag, this);

		this._dragging = false;
		this._prevX = position.x;
		this._prevY = position.y;

		// select the model
		this._model.selectFloor();
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	updateDrag(event)
	{
		const position = this.parent.toLocal(event.data.global);

		const dx = position.x - this._prevX;
		const dy = position.y - this._prevY;

		if (dx!==0 || dy!==0) {
			this._dragging = true;
		}

		this.emit(
			ViewDragEvent.DRAG,
			new ViewDragEvent(
				ViewDragEvent.DRAG, m.tr(dx), m.tr(dy), this
			)
		);

		this._prevX = position.x;
		this._prevY = position.y;
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	stopDragFloor(event)
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP,	this.stopDragFloor, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.stopDragFloor, this);
		ViewSettings.i.interaction.removeListener(EventBase.CLICK,		this.stopDragState, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE, this.updateDrag, this);

        const position = this.parent.toLocal(event.data.global);

        const dx = position.x - this._prevX;
        const dy = position.y - this._prevY;

        if (this._dragging) {
			this.emit(
				ViewDragEvent.DROP,
				new ViewDragEvent(
					ViewDragEvent.DROP, m.tr(dx), m.tr(dy), this
				)
			);
		}	else {
			this.emit(
				ViewDragEvent.CLICK,
				new ViewDragEvent(
					ViewDragEvent.CLICK, position.x, position.y, this
				)
			);
		}
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	stopDragState(event)
	{
		ViewSettings.i.interaction.removeListener(EventBase.CLICK,		this.stopDragState, this);
		this._dragging = false;
	}

	/**
	 * @param e {EventBase}
	 */
	onModelChange(e)
	{
		// move the house to the new position
		this.setTranslation(
			m.px(this._model.center.x),
			m.px(this._model.center.y)
		);

		// apply rotation (if any)
		this.viewRotation = this._model.rotation;

		// update hit area & position
		this.updateHitArea();
	}

	/**
	 * @param e {ModelEvent}
	 */
	onModelDeleted(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.ADDED, this.newLayersAdded, this);
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.onModelDeleted, this);
			this._model = null;
		}

		this.removeListener(EventBase.MOUSE_DOWN, this.startDragFloor, this);

		m.instance.removeEventListener(EventBase.CHANGE, this.onModelChange, this);

		Utils.removeParentOfChild(this);
		Utils.removeChildrenOfParent(this);
	}

	/**
	 * @param e {EventBase}
	 */
	newLayersAdded(e) {
		for(let i = 0; i < this._model.layers.length; ++i) {
			let j = 0, hasLayer = false;
			for (; j < this._layers.length && !hasLayer; ++j) {
				hasLayer = (this._model.layers[i] === this._layers[j].model);
			}

			if (!hasLayer) {
				const layerView = new HouseLayerView(this._model.layers[i], 1.5, this._theme);

				layerView.addListener(EventBase.REMOVED, this.deleteLayerView, this);
				layerView.addListener(HouseEdgeEvent.CLICK, this.edgeClicked, this);

				this.addContent(layerView, false);
				this._layers.push(layerView);
			}
		}

		this.updateHitArea();
	}

	/**
	 * @private
	 */
	updateHitArea() {
		// scale the hit area correctly
		this._hitArea.x = 0;
		this._hitArea.y = 0;
		this._hitArea.width  = DisplayManager.px(this._model.fullWidth);
		this._hitArea.height = DisplayManager.px(this._model.fullHeight);
		this._hitArea.visible = true;

		this.contentLayer.x = -this._hitArea.width /2;
		this.contentLayer.y = -this._hitArea.height/2;
	}

	/**
	 * @param e {HouseEdgeEvent}
	 */
	edgeClicked(e)
	{
		if (this._dragging) return;
		e.floor = this._model;

		this.emit(e.type, e);
	}

	/**
	 * @param e {ModelEvent}
	 */
	deleteLayerView(e)
	{
		const layerView = e.dispatcher;

		layerView.removeEventListener(EventBase.REMOVED, this.deleteLayerView, this);
		layerView.removeEventListener(HouseEdgeEvent.CLICK, this.edgeClicked, this);

		this._layers.splice(this._layers.indexOf(layerView), 1);
	}
}