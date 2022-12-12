import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import ModelEvent from '../../../events/ModelEvent';
import TransformationModel from '../../../model/house/transform/TransformationModel';
import m from '../../../../utils/DisplayManager';
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';
import Utils from '../../../../utils/Utils';
import TransformationMeasurementView from './TransformationMeasurementView';
import Render from '../../../global/Render';


export default class TransformationView extends PIXI.Sprite {

	/**
	 * @param model {TransformationModel}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {TransformationModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(ModelEvent.DELETE, this.onModelDelete, this);
		this._model.addEventListener(TransformationModel.APPLIED_CHANGED, this.onModelChange, this);

		/**
		 * @type {Sprite}
		 * @private
		 */
		this._transformation = new PIXI.Sprite();

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._shape			 = new PIXI.Graphics();

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._arrowsLayer	 = new PIXI.Sprite();

		/**
		 * @type {Array}
		 * @private
		 */
		this._arrows		 = [];

		// Add transformation arrows
		for (let i=0; i<4; ++i) {
			const arrow = new TransformArrow();
			arrow.addListener(EventBase.CLICK, this.directionalArrowSelected, this);
			this._arrows.push(arrow);
			this._arrowsLayer.addChild(arrow);
		}

		// draw the base extension shape
		this._shape.lineStyle(1, 0xBB0000, .8, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		this._shape.beginFill(0xBB0000, .4);
		this._shape.drawRect (0, 0, 10, 10);
		this._shape.endFill	 ();

		// build display list
		this.addChild(this._transformation);
		this.addChild(this._arrowsLayer);

		this._transformation.addChild(this._shape);

		/**
		 * Add-On anchor measurements
		 * @type {TransformationMeasurementView[]}
		 * @private
		 */
		this._anchorViews = [];
		// if(this._model.addonAnchors) {
			for (let i = 0; i < this._model.addonAnchors.length; ++i) {
				// This measurement anchors the Add-On to one side of the house
				const anchorView = new TransformationMeasurementView(this._model.addonAnchors[i]);
				this._anchorViews.push(anchorView);
				this.addChild(anchorView);
			// }
		}

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);

		// Interaction
		this._transformation.interactive 		 = true;
		this._transformation.interactiveChildren = false;
		this._transformation.buttonMode			 = true;

		this._arrowsLayer.interactive			 = true;
		this._arrowsLayer.interactiveChildren	 = true;

		this.render();
	}

	/**
	 * @return {TransformationModel}
	 */
	get model()		{ return this._model; }

	/**
	 * @return {Sprite}
	 */
	get clickArea()	{ return this._transformation; }

	/**
	 * @param interactionEvent {PIXI.interaction.InteractionEvent}
	 */
	directionalArrowSelected(interactionEvent)
	{
		this._model.direction = (this._arrows.indexOf(interactionEvent.target) + 1);
	}

	/**
	 * @return {number}
	 * @private
	 */
	get currentColor()
	{
		if (this._model.type===TransformationModel.EXTENSION && !this._model.isAddition) {
			return 0x00BB00;
		}	else {
			return 0xBB0000;
		}
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onModelChange(e=null)		{ this.render(); }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	onModelDelete(e=null)		{ this.cleanup(); }

	/**
	 * @param e {MeasurementPointEvent}
	 */
	measureEdit(e)	{ this.dispatchEvent(e); }

	/**
	 * @private
	 */
	render()
	{
		this.clickArea.cacheAsBitmap = false;
		this._shape.clear();

		if (this._model.width && this._model.height) {
			// Draw the transformation body
			this._shape.lineStyle(1, this.currentColor, .8, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
			this._shape.beginFill(this.currentColor, .4 );
			this._shape.drawRect (0, 0, m.px(this._model.width), m.px(this._model.height));
			this._shape.endFill	 ();
			// this._shape.hitArea	= new PIXI.Rectangle(0, 0, m.px(this._model.width), m.px(this._model.height));

			if (this._model.isAddition === false) {
				// Draw a line indicating the intersection where the transformation will be applied
				this._shape.lineStyle(3, this.currentColor, .8, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

				switch (this.model.direction) {
					case TransformationModel.DIR_LEFT:
						this._shape.moveTo(m.px(this._model.width), 0);
						this._shape.lineTo(m.px(this._model.width), m.px(this._model.height));
						break;

					case TransformationModel.DIR_TOP:
						this._shape.moveTo(0, m.px( this._model.height));
						this._shape.lineTo(m.px(this._model.width), m.px(this._model.height));
						break;

					case TransformationModel.DIR_RIGHT:
						this._shape.moveTo(0, 0);
						this._shape.lineTo(0, m.px(this._model.height));
						break;

					case TransformationModel.DIR_BOTTOM:
						this._shape.moveTo(0, 0);
						this._shape.lineTo(m.px(this._model.width), 0);
						break;

					default:
						// N/A
						break;
				}
			}
		}

		this._arrowsLayer.x = this._transformation.x = m.px(this._model.x);
		this._arrowsLayer.y = this._transformation.y = m.px(this._model.y);

		if (this._model.isAddition) {
			this._arrowsLayer.visible = false;
		}	else {
			for (let i=0, arrow; i<this._arrows.length; ++i)
			{
				arrow = this._arrows[i];
				arrow.draw(this._model.type);

				switch ( i+1 )
				{
					case TransformationModel.DIR_LEFT:
						arrow.x = -10;
						arrow.y = this._shape.height * .5;
						arrow.rotation = 0;
					break;

					case TransformationModel.DIR_RIGHT:
						arrow.x = this._shape.width + 10;
						arrow.y = this._shape.height * .5;
						arrow.rotation = Math.PI;
					break;

					case TransformationModel.DIR_TOP:
						arrow.x = this._shape.width * .5;
						arrow.y = -10;
						arrow.rotation = Math.PI/2;
					break;

					case TransformationModel.DIR_BOTTOM:
						arrow.x = this._shape.width * .5;
						arrow.y = this._shape.height + 10;
						arrow.rotation = Math.PI*3/2;
					break;
				}

				if (this._model.direction===i+1 ) {
					arrow.alpha = 1;
				}	else {
					arrow.alpha = .35;
				}
			}

			this._arrowsLayer.visible	 = this._model.width > 0 && this._model.height > 0;

			// hide the view once the transformation has been applied
			this._arrowsLayer.visible = this._transformation.visible = !this._model.applied;
		}

		// cache
		this.clickArea.cacheAsBitmap = true;
	}

	/**
	 * Automatic view cleanup when the model is deleted
	 */
	cleanup()
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.onModelDelete, this);
			this._model.removeEventListener(TransformationModel.APPLIED_CHANGED, this.onModelChange, this);
			this._model = null;
		}

		while (this._anchorViews && this._anchorViews.length) {
			this._anchorViews.pop().removeListener(MeasurementPointEvent.EDIT, this.measureEdit, this);
		}

		this._anchorViews = null;

		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);

		Utils.removeParentOfChild(this);
	}
}

class TransformArrow extends PIXI.Sprite{

	constructor() {
		super();

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		this._type = -1;
	}

	draw(type) {
		if (type === this._type) {
			return;
		}

		this._type = type;
		this.cacheAsBitmap = false;

		const isReduction = type===TransformationModel.REDUCTION;
		this._graphics.clear();

		const SZ = 12;
		// hit area
		this._graphics.beginFill(0xFF0000, 0);
		this._graphics.drawCircle(SZ/2, 0, SZ);

		// draw a red arrow
		this._graphics.lineStyle(
			2,
			isReduction ? 0xCC0000 : 0x168D66,
			1, false, Render.LINE_ALIGNMENT, Render.LINE_NATIVE
		);

		this._graphics.moveTo(0, 0);
		this._graphics.lineTo(SZ, 0);
		this._graphics.moveTo(0, 0);
		this._graphics.lineTo(SZ/2, -SZ/2);
		this._graphics.moveTo(0, 0);
		this._graphics.lineTo(SZ/2, SZ/2);

		this._graphics.x = isReduction ? 0 : -SZ;

		this.interactive = true;
		this.buttonMode = true;
		this.interactiveChildren = false;

		this.cacheAsBitmap = true;
	}
}