import * as PIXI from 'pixi.js';
import EventBase from "../../../events/EventBase";
import EasementEvent from "../../events/EasementEvent";
import InnerEdgeView from "./InnerEdgeView";

export default class InnerPathView extends PIXI.Sprite {


	/**
	 * @param model {InnerPathModel}
	 * @param renderer {IPathRenderer}
	 * @param theme {LabeledPolygonTheme}
	 */
	constructor(model, renderer, theme)
	{
		super();

		/**
		 * @type {InnerPathModel}
		 * @private
		 */
		this._model		= model;

		/**
		 * @type {IPathRenderer}
		 * @private
		 */
		this._renderer	= renderer;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme		= theme;

		/**
		 * @type {Array.<InnerEdgeView>}
		 * @private
		 */
		this._edges		= [];

		/**
		 * @type {PIXI.Graphics}
		 * @protected
		 */
		this._graphics	= new PIXI.Graphics();
		this.addChild(this._graphics);

		/**
		 * listen to model events
		 */
		this._model.addEventListener(EventBase.ADDED, this.onEdgeAdded, this);
		this._model.addEventListener(EasementEvent.RECALCULATE, this.innerPathRecalculated, this);

		/**
		 * Listen to interaction events on this PIXI.Sprite
		 * @type {boolean}
		 */
		this.interactive = true;
	}

	/**
	 * @return {InnerPathModel}
	 */
	get model() { return this._model; }

	/**
	 * @return {Array<InnerEdgeView>}
	 */
	get edges() { return this._edges; }

	/**
	 * @returns {InnerEdgeView}
	 */
	get lastEdge() { return this._edges && this._edges.length ? this._edges[this._edges.length-1] : null; }

	/**
	 * @returns {LabeledPolygonTheme}
	 */
	get theme() { return this._theme; }

	/**
	 * @param e {EventBase}
	 */
	innerPathRecalculated(e)
	{
		this._renderer.renderFill(this._graphics, this._model.lotModel, this._model);
	}

	onEdgeAdded()
	{
		let view = new InnerEdgeView(this._model.lastEdge, this._renderer, this._theme);
		view.addListener(EventBase.REMOVED, this.onEdgeRemoved);
		this._edges.push(view);
		this.addChild(view);
	}

	onEdgeRemoved(container)
	{
		container._removeEdge(this);
	}

	_removeEdge(edge) {
		edge.removeListener(EventBase.REMOVED, this.onEdgeRemoved);
		this._edges.splice(this._edges.indexOf(edge), 1);
	}
}