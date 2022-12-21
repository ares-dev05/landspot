import * as PIXI from "pixi.js";
import ModelEvent from "../../events/ModelEvent";
import EventBase from "../../../events/EventBase";
import RestoreEvent from "../../events/RestoreEvent";
import HouseEdgeView from "./HouseEdgeView";
import HouseLayerType from "../../model/house/HouseLayerType";
import HouseEdgeEvent from "../../events/HouseEdgeEvent";
import HouseLabelView from "./HouseLabelView";
import Utils from "../../../utils/Utils";


export default class HouseLayerView extends PIXI.Sprite {

	/**
	 * @param model {HouseLayerModel}
	 * @param thickness {number}
	 * @param theme {LabeledPolygonTheme}
	 * @constructor
	 */
	constructor(model, thickness=1.5, theme=null)
	{
		super();

		/**
		 * @type {HouseLayerModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(ModelEvent.DELETE, this.modelDelete, this);
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(EventBase.ADDED , this.onEdgeAdded, this);
		this._model.addEventListener(RestoreEvent.RESTORE_COMPLETE, this.onModelRestored, this);

		/**
		 * @type {number}
		 * @private
		 */
		this._thickness = thickness;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme = theme;

		/**
		 * @type {HouseEdgeView[]}
		 * @private
		 */
		this._edges		= [];

		/**
		 * @type {HouseLabelView[]}
		 * @private
		 */
		this._labels	= [];

		this.buildEdgeViews();
		this.buildLabelViews();

		this.onModelChange();
	}

	/**
	 * @return {HouseLayerModel}
	 */
	get model()				{ return this._model; }

	/**
	 * @param e {EventBase}
	 */
	onModelChange(e=null)	{ this.visible = this._model.visible; }


	/**
	 * @param e {EventBase}
	 */
	onEdgeAdded(e)
	{
		const view = new HouseEdgeView(
			this._model.lastEdge,
			this._model.type===HouseLayerType.ROOF,
			this._thickness,
			this._theme
		);

		view.addListener(EventBase.REMOVED, this.edgeViewRemoved, this);
		view.addListener(HouseEdgeEvent.CLICK, this.edgeViewClicked, this);

		this.addChild(view);
		this._edges.push(view);
	}

	/**
	 * @param e {HouseEdgeEvent}
	 * @private
	 */
	edgeViewClicked(e)		{ this.emit(e.type, e); }

	/**
	 * @private
	 */
	buildEdgeViews()
	{
		this._edges = [];

		for (let i=0; i<this._model.edges.length; ++i) {
			let view = new HouseEdgeView(
				this._model.edges[i],
				this._model.type===HouseLayerType.ROOF,
				this._thickness,
				this._theme
			);

			view.addListener(EventBase.REMOVED, this.edgeViewRemoved, this);
			view.addListener(HouseEdgeEvent.CLICK, this.edgeViewClicked, this);

			this.addChild(view);
			this._edges.push(view);
		}
	}

	/**
	 * @private
	 */
	buildLabelViews()
	{
		this._labels = [];

		for (let i=0; i<this._model.labels.length; ++i) {
			const label = new HouseLabelView(this._model.labels[i], this._theme);

			label.addListener(EventBase.REMOVED, this.labelViewRemoved, this);

			this.addChild(label);
			this._labels.push(label);
		}
	}

	/**
	 * @param e
	 * @private
	 */
	onModelRestored(e)
	{
		this.buildLabelViews();
	}

	/**
	 * @param e {EventBase}
	 */
	edgeViewRemoved(e)
	{
		let v = e.dispatcher;
		v.removeListener(EventBase.REMOVED, this.edgeViewRemoved, this);
		v.removeListener(HouseEdgeEvent.CLICK, this.edgeViewClicked, this);
		this._edges.splice(this._edges.indexOf(v), 1);
	}

	/**
	 * @param e {EventBase}
	 */
	labelViewRemoved(e)
	{
		let l = e.dispatcher;
		l.removeListener(EventBase.REMOVED, this.labelViewRemoved, this);
		this._labels.splice(this._labels.indexOf(l), 1);
	}

	/**
	 * @param e {EventBase}
	 */
	modelDelete(e)
	{
		if (this._model) {
			this._model.removeEventListener(ModelEvent.DELETE, this.modelDelete, this);
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(EventBase.ADDED , this.onEdgeAdded, this);
			this._model.removeEventListener(RestoreEvent.RESTORE_COMPLETE, this.onModelRestored, this);
			this._model = null;
		}

		Utils.removeParentOfChild(this);
	}
}