import * as PIXI from 'pixi.js';
import Point from "../../../geom/Point";
import Geom from "../../../utils/Geom";

export default class TransformableViewBase extends PIXI.Sprite {


	constructor()
	{
		super();

		/**
		 * All transforms are applied to this layer (scaling, translation)
		 * 		it is originally centered on the view
		 * @type {PIXI.Sprite}
		 * @protected
		 */
		this._transformLayer = new PIXI.Sprite();

		/**
		 * Rotation is applied only to this layer
		 * @type {PIXI.Sprite}
		 * @protected
		 */
		this._rotationLayer = new PIXI.Sprite();

		/**
		 * The layer that holds all the visual content
		 * @type {PIXI.Sprite}
		 * @protected
		 */
		this._contentLayer = new PIXI.Sprite();

		// build the display list
		this.addChild(this._transformLayer);
		this._transformLayer.addChild(this._rotationLayer);
		this._rotationLayer.addChild(this._contentLayer);
	}

	/**
	 * @return {PIXI.Sprite}
	 */
	get contentLayer() { return this._contentLayer; }

	/**
	 * @param content {PIXI.DisplayObject|PIXI.Sprite}
	 * @param autoCenter {boolean}
	 */
	addContent(content, autoCenter=true)
	{
		this._contentLayer.addChild(content);

		if ( autoCenter ) {
			this.centreContent(content);
		}
	}

	/**
	 * @param content {PIXI.DisplayObject}
	 */
	centreContent(content)
	{
		let bounds = content.getLocalBounds();

		content.x = -bounds.width  * .5 - content.x;
		content.y = -bounds.height * .5 - content.y;
	}

	/**
	 * @return {Point}
	 */
	get centre() { return new Point(this._transformLayer.x, this._transformLayer.y); }


	/**
	 * @param dx {number}
	 * @param dy {number}
	 */
	translate(dx, dy)
	{
		this._transformLayer.x += dx;
		this._transformLayer.y += dy;
	}

	/**
	 * @param dx {number}
	 * @param dy {number}
	 */
	setTranslation(dx, dy)
	{
		this._transformLayer.x = dx;
		this._transformLayer.y = dy;
	}

	/**
	 * @return {number}
	 */
	get viewScale() { return this._transformLayer.scale; }

	/**
	 * @param v {number}
	 */
	set viewScale(v) { this._transformLayer.scale = v; }

	/**
	 * @return {number} Rotation in degrees
	 */
	get viewRotation() { return Geom.rad2deg(this._rotationLayer.rotation); }
	set viewRotation(v)
	{
		this._rotationLayer.rotation = Geom.deg2rad(v);
	}
}