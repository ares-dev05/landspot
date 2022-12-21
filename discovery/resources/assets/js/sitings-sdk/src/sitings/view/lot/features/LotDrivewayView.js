import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import DrivewayEvent from '../../../events/DrivewayEvent';
import Geom from '../../../../utils/Geom';
import m from '../../../../utils/DisplayManager';
import Utils from '../../../../utils/Utils';
import ViewSettings from '../../../global/ViewSettings';
import Render from '../../../global/Render';

export default class LotDrivewayView extends PIXI.Sprite {

	static get WIDTH()  { return 1.9; }
	static get HEIGHT() { return 1.4; }
	static get CORNER() { return 0.4; }

	/**
	 * @param model {LotDrivewayModel}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {LotDrivewayModel}
		 * @private
		 */
		this._model = model;

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
		 * @private
		 */
		this._graphic = new PIXI.Graphics();
		this.addChild(this._graphic);

		this.renderDriveway();

		this._model.addEventListener(EventBase.CHANGE, this.onChange, this);
		this._model.addEventListener(DrivewayEvent.DELETE, this.onDelete, this);

		this.interactive = true;
		this.buttonMode = true;

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.onZoomLevelChange, this);

		// Mouse interaction
		this._graphic.addListener(EventBase.MOUSE_DOWN, this.mouseDown, this);
		this.onChange();
	}

	/**
	 * Draw the Driveway Graphic
	 * @private
	 */
	renderDriveway()
	{
		const W = m.px(LotDrivewayView.WIDTH), H = m.px(LotDrivewayView.HEIGHT), C = -m.px(LotDrivewayView.CORNER);
		this._graphic.clear();
		this._graphic.lineStyle(1, 0x333333, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		this._graphic.beginFill(0, 0.1);
		//this._graphic.drawRect(-W, 0, W*2, H);
		this._graphic.moveTo(-W, 0);
		this._graphic.lineTo( W, 0);
		this._graphic.lineTo(W-C, H);
		this._graphic.lineTo(-W+C, H);
		this._graphic.lineTo(-W, 0);
		this._graphic.endFill();

		this._graphic.interactive = true;
		this._graphic.moveTo(-W, 0);
		this._graphic.lineTo(W-C, H);
		this._graphic.moveTo( W, 0);
		this._graphic.lineTo(-W+C, H);

		// @TEMP @TESTING
		//this._graphic.beginFill(0x440000, 0.3);
		//this._graphic.drawCircle(0, 0, 6);
		//this._graphic.endFill();
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 */
	mouseDown(event)
	{
		const position = this.parent.toLocal(event.data.global);

		this._prevX = position.x;
		this._prevY = position.y;

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP, this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE, this.mouseMove, this);
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 */
	mouseMove(event)
	{
		const position = this.parent.toLocal(event.data.global);

		this._model.translate(
			m.toMeters(position.x - this._prevX),
			m.toMeters(position.y - this._prevY)
		);

		this._prevX = position.x;
		this._prevY = position.y;
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 */
	mouseUp(event)
	{
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP, this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE, this.mouseMove, this);

		this._model.snapToPlan();
	}

	onZoomLevelChange(e)
	{
		this.renderDriveway();
		this.onChange();
	}

	onChange(e=null)
	{
		this._graphic.rotation = Geom.deg2rad(this._model.rotation);
		this.x = m.px(this._model.x);
		this.y = m.px(this._model.y);
	}

	onDelete(e)
	{
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onChange, this);
			this._model.removeEventListener(DrivewayEvent.DELETE, this.onDelete, this);
			this._model = null;
		}

		this._graphic.removeListener(EventBase.MOUSE_DOWN, this.mouseDown, this);

		// Listen to app zoom level changes
		m.instance.removeEventListener(EventBase.CHANGE, this.onZoomLevelChange, this);

		Utils.removeParentOfChild( this );
	}
}