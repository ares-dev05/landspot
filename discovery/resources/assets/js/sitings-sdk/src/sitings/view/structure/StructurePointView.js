import * as PIXI from 'pixi.js';
import EventBase from "../../../events/EventBase";
import ModelEvent from "../../events/ModelEvent";
import ViewSettings from "../../global/ViewSettings";
import m from "../../../utils/DisplayManager";
import Utils from "../../../utils/Utils";
import Render from "../../global/Render";
import Geom from '../../../utils/Geom';

export default class StructurePointView extends PIXI.Sprite {

	/**
	 * @param model {StructurePoint}
	 */
	constructor(model)
	{
		super();

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
		 * @type {PIXI.Graphics}
		 * @protected
		 */
		this._graphic = null;
		this._graphic2 = null;

		/**
		 * @type {StructurePoint|StructureRectangle}
		 * @protected
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);
		this._model.addEventListener(ModelEvent.DELETE, this.modelDeleted, this);

		// create the view
		this.render();

		this.interactive	= true;
		this.buttonMode		= true;

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.modelChanged, this);

		// Mouse interaction for drag & drop functionality
		this.addListener(EventBase.MOUSE_DOWN, this.mouseDown, this);

		// Trigger a model change event to position the structure correctly
		this.modelChanged();

		/**
		 * @TODO: Implement highlighting on mouse hover
		 */
	}

	/**
	 * create the graphic representation for this structure
	 * @OVERRIDE in sub-classes
	 */
	render()
	{
		// this.cacheAsBitmap = false;
		if(!this._graphic) {
			this._graphic = new PIXI.Graphics();
			this.addChild(this._graphic);
			this._graphic2 = new PIXI.Graphics();
			this.addChild(this._graphic2);
			this._graphic2.rotation = Geom.deg2rad(15);
		}

		const R = m.px(this._model.radius);

		// Redraw the circle
		this._graphic.clear();
		this._graphic2.clear();
		this._graphic.beginFill(0, 0);
		this._graphic.lineStyle(2, 0, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		this._graphic.drawCircle(0, 0, R);
		this._graphic.endFill();

		if (R > 8) {
			const C = m.px(0.1);
			this._graphic.drawCircle(0, 0, m.px(0.1));
			const D = 0.05;
			this._graphic.drawEllipse(-C/1.8, C/2.6, R*(1+D), R*(1-D));
			this._graphic2.lineStyle(2, 0, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
			this._graphic2.drawEllipse(C/3, -C/2, R*(1-D), R*(1+D*1.3));
		}
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	mouseDown(event)
	{
		const position = this.parent.toLocal(event.data.global);

		this._prevX = position.x;
		this._prevY = position.y;

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,		   this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE,	   this.mouseMove, this);
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	mouseMove(event)
	{
		const position = this.parent.toLocal(event.data.global);

		this._model.translate(
			m.tr(position.x - this._prevX),
			m.tr(position.y - this._prevY)
		);

		this._prevX = position.x;
		this._prevY = position.y;
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	mouseUp(event)
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP,		  this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE,		  this.mouseMove, this);
	}

	/**
	 * @param e {EventBase}
	 * @protected
	 */
	modelChanged(e=null)
	{
		this.x = m.px(this._model.x);
		this.y = m.px(this._model.y);
		this.render();
	}

	/**
	 * @param e {ModelEvent}
	 * @protected
	 */
	modelDeleted(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE,  this.modelChanged, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.modelDeleted, this);
			this._model = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
		this.removeListener(EventBase.MOUSE_DOWN, this.mouseDown, this);

		Utils.removeParentOfChild(this);
	}
}