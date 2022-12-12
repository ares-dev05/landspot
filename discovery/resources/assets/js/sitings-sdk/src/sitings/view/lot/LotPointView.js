import EventBase from '../../../events/EventBase';
import RestoreEvent from '../../events/RestoreEvent';
import ModelEvent from '../../events/ModelEvent';
import m from '../../../utils/DisplayManager';
import * as PIXI from 'pixi.js';
import ViewSettings from '../../global/ViewSettings';
import Utils from '../../../utils/Utils';
import Render from '../../global/Render';


export default class LotPointView extends PIXI.Sprite {


	/**
	 * @param model {LotPointModel} the model represented by this view
	 * @param isCurveController {boolean} indicates if this point is used in manual tracing to change the
	 * curvature of a curved segment
	 */
	constructor(model, isCurveController=false)
	{
		super();
		/**
		 * @type {boolean}
		 * @private
		 */
		this._curveController = isCurveController;

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
		 * Define the _model property, then set it through the setter
		 * @type {LotPointModel}
		 * @protected
		 */
		this._model = null;
		this.model = model;

		/**
		 * @type {PIXI.Graphics}
		 * @protected
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		// render
		this._drawControl();

		// make the view interactive
		this.interactive = true;
		this.buttonMode = true;

		this.addListener(EventBase.MOUSE_DOWN, this.mouseDown, this);

		// listen to app zoom changes
		m.instance.addEventListener(EventBase.CHANGE, this.onZoomLevelChange, this);
	}

	/**
	 * @returns {LotPointModel}
	 */
	get model() { return this._model; }

	/**
	 * @param v {LotPointModel}
	 */
	set model(v) {
		if (this._model !== v) {
			this._cleanupModel();

			if (v !== null && v !== undefined) {
				this._model = v;
				this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);
				this._model.addEventListener(RestoreEvent.RESTORE_COMPLETE, this.modelChanged, this);
				this._model.addEventListener(ModelEvent.DELETE, this.modelDeleted, this);
				this.modelChanged();
			}
		}
	}

	/**
	 * @param e {EventBase}
	 */
	onZoomLevelChange(e) { this.modelChanged(); }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	modelChanged(e=null) {
		if (this._model) {
			// convert the models's metric coordinates into pixel coordinates for display on the screen
			this.x = m.px(this._model.x);
			this.y = m.px(this._model.y);
		}
	}

	/**
	 * @param e {EventBase}
	 */
	modelDeleted(e=null) {
		this._cleanupModel();

		this.mouseUp();
		this.removeListener(EventBase.MOUSE_DOWN, this.mouseDown, this);

		m.instance.removeEventListener(EventBase.CHANGE, this.onZoomLevelChange, this);

		Utils.removeParentOfChild(this);
	}

	/**
	 * @private
	 */
	_cleanupModel()
	{
		if (this._model ) {
			this._model.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
			this._model.removeEventListener(RestoreEvent.RESTORE_COMPLETE, this.modelChanged, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.modelDeleted, this);
			this._model = null;
		}
	}

	/**
	 * @private
	 */
	_drawControl()
	{
		this._graphics.clear();

		if ( this._curveController === false ) {
			this._graphics.beginFill(0,.2);
			this._graphics.drawCircle(0,0,10);
			this._graphics.endFill();
		}	else {
			this._graphics.beginFill(0xFFFFFF);
			this._graphics.lineStyle(2, 0xEE3311, 0.8, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
			this._graphics.drawCircle(0,0,7);
			this._graphics.endFill();

			this._graphics.beginFill(0xFFAAAA);
			this._graphics.lineStyle(0, 0, 0, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
			this._graphics.drawCircle(0,0,4);
			this._graphics.endFill();
		}
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @protected
	 */
	mouseDown(event)
	{
		const position = this.parent.toLocal(event.data.global);

		event.stopPropagation();

		this._prevX = position.x;
		this._prevY = position.y;
		this._prevX = NaN;
		this._prevY = NaN;

		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,		   this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.CLICK,			   this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE,	   this.mouseMove, this);
	}

	/**
	 * @param event {InteractionEvent}
	 * @protected
	 */
	mouseMove(event)
	{
		event.stopPropagation();

		const position = this.parent.toLocal(event.data.global);

		if (!isNaN(this._prevX)) {
			this._model.translate(
				m.tr(position.x - this._prevX),
				m.tr(position.y - this._prevY)
			);
		}

		this._prevX = position.x;
		this._prevY = position.y;
	}

	/**
	 * @param event {InteractionEvent}
	 * @protected
	 */
	mouseUp(event=null) {
		if (event) {
			event.stopPropagation();
		}

		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP,		  this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.CLICK,			  this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this.mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE,		  this.mouseMove, this);

		if (this._model) {
			this._model.moveComplete();
		}
	}
}