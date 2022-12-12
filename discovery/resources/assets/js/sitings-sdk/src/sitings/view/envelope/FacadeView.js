import EnvelopeSegmentRenderer from './EnvelopeSegmentRenderer';
import m from '../../../utils/DisplayManager';
import EventBase from '../../../events/EventBase';
import FacadeModel from '../../model/envelope/FacadeModel';
import Utils from '../../../utils/Utils';
import * as PIXI from 'pixi.js/lib/core';
import LabelFactory from '../theme/LabelFactory';
import ViewSettings from '../../global/ViewSettings';
import Render from '../../global/Render';

export default class FacadeView extends PIXI.Container {

	/**
	 * @param model {FacadeModel}
	 * @param floorPosition {FloorPositionModel}
	 */
	constructor (model, floorPosition) {
		super();

		/**
		 * @type {FacadeEdgeView[]}
		 * @private
		 */
		this._edges = [];

        this._prevX = this._prevX || NaN;

        /**
		 * @type {FacadeModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(FacadeModel.FACADE_CHANGED, this.facadeStructureChanged, this);
		this._model.addEventListener(EventBase.CHANGE, this.facadeSizeChanged, this);

		/**
		 * @type {FloorPositionModel}
		 * @private
		 */
		this._floorPosition = floorPosition;
		this._floorPosition.removeEventListener(EventBase.CHANGE, this.floorPositionChanged, this);
		this._floorPosition.addEventListener(EventBase.CHANGE, this.floorPositionChanged, this);

		this.addChild(this._hitArea = Utils.colorBlock(0, 1, 1, null, 0, 0, 0));
		this.addChild(this._facade = new PIXI.Container());
		this.addChild(this._slabLabel = new HouseSlabLabelView(this._model.slab, this._model.slab.centre));

		this.updateView();
		this.buildHitArea();

		this.interactive = true;
		this.buttonMode = true;

		this.removeListener(EventBase.MOUSE_DOWN, this.startDragFloor, this);
		this.addListener(EventBase.MOUSE_DOWN, this.startDragFloor, this);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.scaleChanged, this);
	}

	/**
	 * @param event {pixi.interaction.InteractionEvent}
	 */
	startDragFloor(event)
	{
		const position = this.parent.toLocal(event.data.global);

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,	 	   this.stopDragFloor, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.stopDragFloor, this);
		ViewSettings.i.interaction.addListener(EventBase.CLICK,		 	   this.stopDragState, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE, 	   this.updateDrag, this);

		this._prevX = position.x;
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	updateDrag(event) {
		const position = this.parent.toLocal(event.data.global);

		const dx = position.x - this._prevX;
		// Translate the floor across the horizontal axis
		this._floorPosition.translateFloor(m.tr(dx));

		// drag the model directly
		this._prevX	= position.x;
	}

	/**
	 * @private
	 */
	stopDragFloor()
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP,	this.stopDragFloor, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.stopDragFloor, this);
		ViewSettings.i.interaction.removeListener(EventBase.CLICK,		this.stopDragState, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE, this.updateDrag, this);
	}

	/**
	 * @return {FacadeEdgeView[]}
	 * @public
	 */
	get edges() {
		return this._edges;
	}

	scaleChanged() {
		this.updateView();
		this.buildHitArea();
		this.floorPositionChanged();
	}

	/**
	 * @private
	 */
	facadeStructureChanged() {
		this.updateView();
		this.buildHitArea();
	}

	/**
	 * @private
	 */
	facadeSizeChanged() {
		this.buildHitArea();
	}

	/**
	 * @private
	 */
	floorPositionChanged() {
		// displace self by the left setback
		this.x	= m.px(this._floorPosition.leftDistance);
	}

	buildHitArea() {
		const bounds 		 = this._facade.getLocalBounds();
		this._hitArea.x 	 = bounds.x;
		this._hitArea.y 	 = bounds.y;
		this._hitArea.width	 = bounds.width;
		this._hitArea.height = bounds.height;
	}

	/**
	 * @private
	 */
	updateView() {
		// remove all current edges
		while(this.edges && this.edges.length) {
			this.edges.pop().cleanup();
		}

		// Add the Facade edges
		this._model.edges.forEach((edgeModel) => {
			const edgeView = new FacadeEdgeView(edgeModel);
			this._facade.addChild(edgeView);
			this.edges.push(edgeView);
		});

		// add the SLAB edges
		this._model.slab.edges.forEach((edgeModel) => {
			const edgeView = new FacadeEdgeView(edgeModel);
			this._facade.addChild(edgeView);
			this.edges.push(edgeView);
		});
	}
}

export class FacadeEdgeView extends PIXI.Container {

	/**
	 * @param model {FacadeSegment}
	 */
	constructor (model) {
		super();

		/**
		 * @type {FacadeSegment}
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
	 * private
	 */
	render() {
		this._graphics.clear();
		this._graphics.lineStyle(
			/*weight*/ 1,
			/*color*/  this._model.isHit ? EnvelopeSegmentRenderer.HIT_COLOR : EnvelopeSegmentRenderer.NORMAL_COLOR,
			/*alpha*/  1,
			Render.LINE_ALIGNMENT,
			Render.LINE_NATIVE
		);
		this._graphics.moveTo( m.px(this._model.a.x), m.px(this._model.a.y) );
		this._graphics.lineTo( m.px(this._model.b.x), m.px(this._model.b.y) );
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

export class HouseSlabLabelView extends PIXI.Container {

	/**
	 * @param slab {HouseSlab}
	 * @param model {FacadeSegment}
	 */
	constructor (slab, model) {
		super();

		/**
		 * @type {HouseSlab}
		 * @private
		 */
		this._slab = slab;

		/**
		 * @type {FacadeSegment}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);

		this.addChild(this._slabLabel = LabelFactory.getLabel('', 10));
		this._slabLabel.visible = false;

		this.modelChanged();
	}

	/**
	 * @private
	 */
	modelChanged() {
		const pos = this._model.a;

		if (this._slab.height > 0) {
			this._slabLabel.visible = true;
			this._slabLabel.text = 'SLAB ' + Number(this._slab.height * 1000) + 'mm';
			this._slabLabel.x = -this._slabLabel.width / 2;

			this.x	= m.px(pos.x);
			this.y	= 5;
		}	else {
			this._slabLabel.visible = false;
			this._slabLabel.x = this._slabLabel.y = 0;
			this.x = this.y = 0;
		}
	}
}