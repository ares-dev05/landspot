import EnvelopeSegmentRenderer from './EnvelopeSegmentRenderer';
import m from '../../../utils/DisplayManager';
import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import HeightEnvelopeModel from '../../model/envelope/HeightEnvelopeModel';
import Utils from '../../../utils/Utils';

export default class EnvelopeView extends PIXI.Container {
	/**
	 * @param model {HeightEnvelopeModel}
	 */
	constructor (model) {
		super();

		/**
		 * @type {EnvelopeSegmentView[]}
		 * @private
		 */
		this._edges = [];

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._groundFill	= new PIXI.Graphics();

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._edgesLayer = new PIXI.Container();

		/**
		 * @type {HeightEnvelopeModel}
		 */
		this._model = null;

		// set model and add event listeners
		this.model = model;

		this.addChild(this._groundFill);
		this.addChild(this._edgesLayer);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.updateView, this);
	}

	/**
	 * @return {EnvelopeSegmentView[]}
	 * @public
	 */
	get edges() {
		return this._edges;
	}

	/**
	 * @return {HeightEnvelopeModel}
	 */
	get model() {
		return this._model;
	}

	/**
	 * @param v {HeightEnvelopeModel}
	 * @public
	 */
	set model(v) {
		if (this._model) {
			this._model.removeEventListener(HeightEnvelopeModel.REBUILT, this.modelRebuilt, this);
		}

		this._model = v;

		if (this._model) {
			this._model.addEventListener(HeightEnvelopeModel.REBUILT, this.modelRebuilt, this);
		}

		this.updateView();
	}

	/**
	 * @private
	 */
	modelRebuilt() {
		this.updateView();
	}

	/**
	 * @protected
	 */
	updateView() {
		// remove all
		while (this.edges && this.edges.length) {
			this.edges.pop().cleanup();
		}

		// ground edges
		let groundEdges = [];

		// add new edges
		this.model.segments.forEach(segment => {
			if (segment.isGround && !segment.isVirtual)
				groundEdges.push(segment);

			const view = new EnvelopeSegmentView(segment);
			this._edgesLayer.addChild(view);
			this.edges.push(view);
		});

		// draw the ground fill
		this._groundFill.clear();
		this._groundFill.beginFill(0, .05);
		this._groundFill.lineStyle(1, 0, 0);
		this._groundFill.moveTo(0, 0);
		groundEdges.forEach(segment => {
			this._groundFill.lineTo(m.px(segment.b.x), m.px(segment.b.y));
		});
		this._groundFill.endFill();

		// emit change
		this.emit(EventBase.CHANGE, {});
	}
}

export class EnvelopeSegmentView extends PIXI.Container {

	/**
	 * @param model {EnvelopeSegment}
	 */
	constructor (model) {
		super();

		/**
		 * @type {EnvelopeSegment}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);

		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		this.render();
	}

	/**
	 * @private
	 */
	modelChanged() {
		this.render();
	}

	/**
	 * @private
	 */
	render() {
		this._graphics.clear();
		EnvelopeSegmentRenderer.draw(this._graphics, this._model);
		this.emit(EventBase.CHANGE, {});
	}

	/**
	 * @public
	 */
	cleanup() {
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
			this._model = null;
		}
		Utils.removeParentOfChild(this);
	}
}