import * as PIXI from 'pixi.js';
import m from "../../../../utils/DisplayManager";
import Render from "../../../global/Render";

export default class TransformationCutView extends PIXI.Sprite {

	/**
	 * @param model {TransformationCutModel}
	 */
	constructor(model) {
		super();

		/**
		 * @type {TransformationCutModel}
		 * @private
		 */
		this._model = model;

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		this.render();
	}

	/**
	 * @return {TransformationCutModel}
	 */
	get model() { return this._model; }

	/**
	 * @private
	 */
	render() {
		if (this.model.isExtension) {
			// Overlay the extension onto the house wall
			this._graphics.lineStyle(2, 0xCCCCCC, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
			this._graphics.alpha = 1;
			this._graphics.moveTo( m.px(this.model.a.x), m.px(this.model.a.y) );
			this._graphics.lineTo( m.px(this.model.b.x), m.px(this.model.b.y) );
		}	else {
			// Draw a line to use for bounds calculations
			this._graphics.lineStyle(1, 0);
			this._graphics.alpha = 0;
			this._graphics.drawCircle(m.px(this.model.a.x), m.px(this.model.a.y), 1);

			// Create a reduction symbol at the respective position
			const reduction = TransformationCutView._createReductionSymbol();

			this.addChild(reduction);
			reduction.x = m.px(this.model.a.x);
			reduction.y = m.px(this.model.a.y);

			// if reduction is vertical => rotate the symbol 90 degrees
			if ( this.model.a.x === this.model.b.x ) {
				reduction.rotation = Math.PI/2;
			}
		}
	}

	/**
	 * @private
	 * @return {PIXI.Graphics}
	 */
	static _createReductionSymbol()
	{
		const reduction = new PIXI.Graphics();
		const size		= m.px(0.15);

		// cover the house edge with white
		reduction.clear();
		reduction.lineStyle(2, 0xFFFFFF, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		reduction.moveTo(-size, 0);
		reduction.lineTo( size, 0);

		// Draw the two wiggles
		reduction.lineStyle(2, 0, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		TransformationCutView._renderReductionWiggle(reduction, -size, 0);
		TransformationCutView._renderReductionWiggle(reduction,  size, 0);

		return reduction;
	}

	/**
	 * @returns {PIXI.Rectangle}
	 */
	get displayBounds() {
		return this._graphics.getBounds();
	}

	/**
	 * @param g {PIXI.Graphics}
	 * @param x {number}
	 * @param y {number}
	 *
	 * @private
	 */
	static _renderReductionWiggle(g, x, y)
	{
		const size = m.px(0.2);

		g.moveTo(x, y);
		g.quadraticCurveTo(x-size, y-size, x, y-size*2);
		g.moveTo(x, y);
		g.quadraticCurveTo(x+size, y+size, x, y+size*2);
	}
}