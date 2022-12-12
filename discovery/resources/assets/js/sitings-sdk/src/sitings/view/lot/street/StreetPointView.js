import * as PIXI from 'pixi.js';
import EventBase from "../../../../events/EventBase";
import m from "../../../../utils/DisplayManager";
import ViewSettings from "../../../global/ViewSettings";

export default class StreetPointView extends PIXI.Sprite {
	
	/**
	 * @param p {StreetModel}
	 */
	constructor(p)
	{
		super();

		/**
		 * @type {StreetModel}
		 * @private
		 */
		this._model = p;
		this._model.addEventListener(EventBase.CHANGE, this.update, this);

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

		// Position
		this.update();

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.update, this);
	}

	/**
	 * @param e {EventBase}
	 */
	update(e=null)
	{
		this.x	= m.px(this._model.x);
		this.y	= m.px(this._model.y);
	}

	/**
	 * @param event {InteractionEvent}
	 * @public
	 */
	startDragPoint(event)
	{
		this._model.unsnap();

		const position = this.parent.toLocal(event.data.global);

		this._prevX = position.x;
		this._prevY = position.y;

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,		   this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE,	   this.mouseMove, this);
	}

	/**
	 * @param event {InteractionEvent}
	 * @protected
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
	 * @param event {InteractionEvent}
	 * @protected
	 */
	mouseUp(event)
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP,		  this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE,		  this.mouseMove, this);
		
		this._model.snap();
	}
}