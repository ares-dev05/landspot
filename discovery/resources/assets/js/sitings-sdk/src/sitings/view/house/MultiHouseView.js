import * as PIXI from "pixi.js";
import HouseView from "./HouseView";
import ViewDragEvent from "../../events/ViewDragEvent";
import EventBase from "../../../events/EventBase";
import HouseEdgeEvent from "../../events/HouseEdgeEvent";

export default class MultiHouseView extends PIXI.Sprite
{
	/**
	 * @param model {MultiHouseModel}
	 * @param interactive {boolean}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, interactive=true, theme=null)
	{
		super();

		/**
		 * @type {boolean}
		 * @private
		 */
		this._interactive = interactive;

		/**
		 * @type {MultiHouseModel}
		 * @private
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.ADDED, this.newFloorAdded, this);

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme = theme;

		/**
		 * @type {HouseView[]}
		 * @private
		 */
		this._floors = [];
		if (this._model.count > 0) {
			this.newFloorAdded();
		}
	}

	/**
	 * @return {MultiHouseModel}
	 */
	get model() { return this._model; }

	/**
	 * @private
	 */
	newFloorAdded()
	{
		const fView = new HouseView(this._model.latestFloor, this._interactive, this._theme);

		if (this._interactive) {
			fView.addListener(ViewDragEvent.DRAG, this.onFloorDrag, this);
			fView.addListener(ViewDragEvent.DROP, this.onFloorDrop, this);
			fView.addListener(ViewDragEvent.CLICK, this.onFloorClick, this);
			fView.addListener(EventBase.REMOVED, this.onFloorRemoved);
			fView.addListener(HouseEdgeEvent.CLICK, this.floorEdgeClicked, this);
		}

		this._floors.push(fView);
		this.addChild(fView);
	}

	/**
	 * @param e {HouseEdgeEvent}
	 * @private
	 */
	floorEdgeClicked(e)
	{
		// forward the event
		this.emit(e.type, e);
	}

	/**
	 * @param e {ViewDragEvent}
	 * @private
	 */
	onFloorDrag(e)
	{
		this._model.dragFloor(e.dx, e.dy, e.dispatcher.model);
	}

	/**
	 * @param e {ViewDragEvent}
	 * @private
	 */
	onFloorDrop(e)
	{
        this._model.dropFloor(e.dx, e.dy, e.dispatcher.model);
	}

	/**
	 * @param e {ViewDragEvent}
	 * @private
	 */
	onFloorClick(e)
	{
		this.emit(e.type, e);
	}

	/**
	 * @param container
	 * @private
	 */
	onFloorRemoved(container) {
		container.removeFloor(this);
	}

	/**
	 * @param fView {HouseView}
	 * @private
	 */
	removeFloor(fView) {
		fView.removeListener(ViewDragEvent.DRAG,  this.onFloorDrag,  this);
        fView.removeListener(ViewDragEvent.DROP,  this.onFloorDrop,  this);
		fView.removeListener(ViewDragEvent.CLICK, this.onFloorClick, this);
		fView.removeListener(EventBase.REMOVED, this.onFloorRemoved);
		fView.removeListener(HouseEdgeEvent.CLICK, this.floorEdgeClicked, this);

		this._floors.splice(this._floors.indexOf(fView), 1);
	}

	/**
	 * @public
	 */
	showForExport()
	{
		for (let i=0; i<this._floors.length; ++i) {
			this._floors[i].showForExport();
		}
	}

	/**
	 * @public
	 */
	exportFinished()
	{
		for (let i=0; i<this._floors.length; ++i) {
			this._floors[i].exportFinished();
		}
	}
}