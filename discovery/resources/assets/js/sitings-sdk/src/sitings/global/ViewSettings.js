import * as PIXI from 'pixi.js';
import EventBase from "../../events/EventBase";

let _instanceKey = Symbol();

export default class ViewSettings extends PIXI.DisplayObject {

	// static shortcuts for accessing the view settings
	static get WIDTH() { return this.i.WIDTH; }
	static get HEIGHT() { return this.i.HEIGHT; }

	/**
	 * @return {ViewSettings}
	 */
	static get instance() {
		if (!this[_instanceKey]) {
			this[_instanceKey] = new ViewSettings(_instanceKey);
		}

		return this[_instanceKey];
	}

	/**
	 * @return {ViewSettings}
	 */
	static get i() { return this.instance; }

	/**
	 * @param constructKey {*}
	 */
	constructor(constructKey)
	{
		super();

		if (_instanceKey!==constructKey) {
			throw new Error("The class 'ViewSettings' is a singleton.");
		}

		/**
		 * @type {PIXI.Application}
		 * @private
		 */
		this._application	= null;
		/**
		 * @type {PIXI.Container}
		 * @private
		 */
		this._stage			= null;
		/**
		 * @type {PIXI.Renderer|PIXI.CanvasRenderer}
		 * @private
		 */
		this._renderer		= null;
		/**
		 * @type {PIXI.interaction.InteractionManager}
		 * @private
		 */
		this._interaction	= null;

		this._WIDTH			= 968;
		this._HEIGHT		= 768;
		this._MIN_SCALE		= .03;
		this._MAX_SCALE		= 2;

		// the root element of the application.
		// all bounds in the application need to be determined relative to this element
		/**
		 * @type {PIXI.DisplayObject}
		 * @private
		 */
		this._rootElement	= null;
	}

	/**
	 * @param application {PIXI.Application}
	 */
	set application(application) {
		if (!application) {
			return;
		}

		this._application	= application;
		this._stage			= application.stage;
		this._renderer		= application.renderer;
		this._interaction	= application.renderer.plugins.interaction;

		this._renderer.addListener(EventBase.RESIZE, this.stageResize, this);

		this.stageResize(this._renderer.width, this._renderer.height);
	}

	/**
	 * @return {PIXI.Application}
	 */
	get application() { return this._application; }

	/**
	 * @return {PIXI.Container}
	 */
	get stage() { return this._stage; }

	/**
	 * @return {PIXI.Renderer|PIXI.CanvasRenderer}
	 */
	get renderer() { return this._renderer; }

	/**
	 * @return {PIXI.interaction.InteractionManager}
	 */
	get interaction() { return this._interaction; }

	get WIDTH() { return this._WIDTH; }
	get HEIGHT() { return this._HEIGHT; }

	set rootElement(v) { this._rootElement = v; }
	get rootElement() { return this._rootElement ? this._rootElement : this._stage; }

	get minZoomLevel() { return this._MIN_SCALE; }
	get maxZoomLevel() { return this._MAX_SCALE; }

	fixedZoomRange(v) {
		return Math.min( Math.max( this._MIN_SCALE, v ), this._MAX_SCALE );
	}

	/**
	 * @param screenWidth {number}
	 * @param screenHeight {number}
	 */
	stageResize(screenWidth, screenHeight)
	{
		if (this._WIDTH === screenWidth && this._HEIGHT === screenHeight) {
			return;
		}

		this._WIDTH		= screenWidth;
		this._HEIGHT	= screenHeight;

		this.emit(EventBase.RESIZE, screenWidth, screenHeight);
	}
}