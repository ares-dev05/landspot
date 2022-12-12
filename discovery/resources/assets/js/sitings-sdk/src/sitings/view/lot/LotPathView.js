import * as PIXI from 'pixi.js';
import EventBase from "../../../events/EventBase";
import LotCurveView from "./LotCurveView";
import m from "../../../utils/DisplayManager";
import LineDrawer from "../../render/LineDrawer";
import Point from "../../../geom/Point";
import Geom from "../../../utils/Geom";
import LotEdgeView from "./LotEdgeView";
import RestoreEvent from '../../events/RestoreEvent';

export default class LotPathView extends PIXI.Sprite {


	/**
	 * @param model {LotPathModel}
	 * @param theme {LabeledPolygonTheme}
	 * @param allowManualControl {Boolean}
	 */
	constructor(model, theme, allowManualControl=false)
	{
		super();

		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._model		= model;
		this._model.addEventListener(RestoreEvent.RESTORE_COMPLETE, this.onModelRestored, this)

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._theme		= theme;
		this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._fill		= new PIXI.Graphics();
		this.addChild(this._fill);

		/**
		 * @type {Array.<LotCurveView>}
		 * @private
		 */
		this._edgeViews	= [];

		/**
		 * @type {Boolean}
		 * @private
		 */
		this._allowManualControl = allowManualControl;

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._nextLineView = new PIXI.Graphics();
		this.addChild(this._nextLineView);

		this._model.addEventListener(EventBase.ADDED, this.onEdgeAdded, this);

		// Add existing edges to the view
		for (let i=0; i<this._model.edges.length; ++i) {
			this.addEdgeView(this._model.edges[i]);
		}

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.viewScaleChanged, this);

		this.renderNextLineView();
		this.renderFill();
	}

	/**
	 * @return {Array<LotCurveView>}
	 */
	get edges() { return this._edgeViews; }

	/**
	 * @return {LotPathModel}
	 */
	get model() { return this._model; }

	/**
	 * @return {LabeledPolygonTheme}
	 */
	get theme() { return this._theme; }

	/**
	 * @param model {LotEdgeModel}
	 * @return {LotCurveView}
	 */
	viewOf(model)
	{
		for (let i=0; i<this.edges.length; ++i) {
			if ( this.edges[i].model === model ) {
				return this.edges[i];
			}
		}
		return null;
	}

	onEdgeAdded(e)
	{
		this.addEdgeView(this._model.lastEdge);
	}

	/**
	 * Creates a view for the newly added edge. By default, all edges are of type LotCurveModel
	 * @param model {LotCurveModel}
	 */
	addEdgeView(model)
	{
		/**
		 * @type {LotCurveView}
		 */
		let view = new LotCurveView(model, this._theme, this._allowManualControl);

		view.interactive = true;
		view.addListener(EventBase.CHANGE, this.edgeViewChange, this);
		view.addListener(EventBase.REMOVED, this.deleteEdge, this);
		view.addListener(EventBase.CLICK, this.edgeClick, this);

		this._edgeViews.push(view);
		this.addChild(view);

		this.renderNextLineView();
		this.renderFill();
	}

	/**
	 * @param emitter {LotCurveView}
	 */
	deleteEdge(emitter)
	{
		this.removeView(emitter);
	}

	/**
	 * @param view {LotCurveView}
	 */
	removeView(view)
	{
		if ( !view )
			return;

		view.removeListener(EventBase.CHANGE, this.edgeViewChange, this);
		view.removeListener(EventBase.REMOVED, this.deleteEdge, this);
		view.removeListener(EventBase.CLICK, this.edgeClick, this);

		this._edgeViews.splice(this._edgeViews.indexOf(view), 1);

		this.renderNextLineView();
		this.renderFill();
	}

	/**
	 */
	edgeViewChange()
	{
		this.renderNextLineView();
		this.renderFill();
		this.emit(EventBase.CHANGE, this);
	}

	/**
	 * @param edge
	 */
	edgeClick(edge)
	{
		this.emit(EventBase.CLICK, edge);
	}

	renderNextLineView()
	{
		const g = this._nextLineView, p = this._model.pathEnd;
		g.clear();
		g.lineStyle(1, 0x333333);
		g.drawCircle(m.px(p.x), m.px(p.y), 6);
	}

	onModelRestored() {
		this._edgeViews.forEach((edge) => edge.updateLabel());
	}

	displayEdgeLabels(display=true) {
		this._edgeViews.forEach((edge)=> edge.displayLabel(display));
	}

	/**
	 * @param event {DataEvent}
	 */
	onThemeChanged(event) {
		if (event.data.prop==="fillAlpha" || event.data.prop==="fillColor") {
			this.renderFill();
		}
	}

	viewScaleChanged() {
		this.renderFill();
		this.renderNextLineView();
	}

	/**
	 */
	renderFill()
	{
		this._fill.clear();

		// no need to render if the fill is transparent
		if (this._theme.fillAlpha===0 || this._model.edges.length < 3) {
			return;
		}

		this._fill.beginFill(this._theme.fillColor, this._theme.fillAlpha);

		let edge = this._model.edges[0], i, prev, STEPS=10;
		prev = new Point(m.px(edge.a.x), m.px(edge.a.y));

		this._fill.moveTo(prev.x, prev.y);

		for (i=0; i<this._model.edges.length; ++i) {
			edge = this._model.edges[i];

			if (edge.isCurve && !edge.isInvalidCurve) {
				let points = LineDrawer.getCurvePoints(
					m.px(edge.curveCenter.x),
					m.px(edge.curveCenter.y),
					m.px(edge.radius),
					edge.aAngle,
					edge.bAngle,
					STEPS
				);

				if (Geom.segmentLength(prev.x, prev.y, points[0].x, points[0].y) <
					Geom.segmentLength(prev.x, prev.y, points[STEPS-1].x, points[STEPS-1].y)) {
					for (let j=0; j<points.length; ++j) {
						this._fill.lineTo(
							points[j].x,
							points[j].y
						);
					}

					prev.x = points[STEPS-1].x;
					prev.y = points[STEPS-1].y;
				}	else {
					for (let j=points.length-1; j>=0; --j) {
						this._fill.lineTo(
							points[j].x,
							points[j].y
						);
					}

					prev.x = points[0].x;
					prev.y = points[0].y;
				}
			}	else {
				prev.x = m.px(edge.b.x);
				prev.y = m.px(edge.b.y);

				this._fill.lineTo(prev.x, prev.y);
			}
		}

		this._fill.endFill();
	}

	stopDrawing()
	{
		this._edgeViews.forEach(function(edgeView) {
			edgeView.mode = LotEdgeView.MODE_VIEW;
		});
		this._nextLineView.visible = false;
	}
	startDrawing()
	{
		this._edgeViews.forEach(function(edgeView) {
			edgeView.mode = LotEdgeView.MODE_DRAW;
		});
		this._nextLineView.visible = true;
	}
}
