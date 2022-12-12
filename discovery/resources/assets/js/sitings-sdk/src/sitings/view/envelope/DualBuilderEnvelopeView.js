import m from '../../../utils/DisplayManager';
import EnvelopeView from './EnvelopeView';
import * as PIXI from 'pixi.js';
import HeightPoint from '../../model/envelope/builders/HeightPoint';
import LabelFactory from '../theme/LabelFactory';
import Render from '../../global/Render';

export default class DualBuilderEnvelopeView extends EnvelopeView {

	/**
	 * @param model {EnvelopeStructure}
	 */
	constructor (model) {
		super(model);

		/**
		 * @type {null|EnvelopeSideMeasurements}
		 * @private
		 */
		this._leftSide = this._leftSide || null;

		/**
		 * @type {null|EnvelopeSideMeasurements}
		 * @private
		 */
		this._rightSide = this._rightSide || null;
	}

	/**
	 * @return {null|EnvelopeBuilder|*|null}
	 */
	get dualBuilder() {
		return this.model ? this.model.builder : null;
	}

	/**
	 * @private
	 */
	updateView() {
		if (this.dualBuilder) {
			if (!this._leftSide) {
				this._leftSide = new EnvelopeSideMeasurements();
				this.addChild(this._leftSide);
			}
			this._leftSide.update(this.dualBuilder.left, this.model.leftHeight, this.model.leftSlope);

			if (!this._rightSide) {
				this._rightSide = new EnvelopeSideMeasurements( );
				this.addChild(this._rightSide);
			}
			this._rightSide.update(this.dualBuilder.right, this.model.rightHeight, -this.model.rightSlope, this.model.lotWidth, false);
		}	else {
			this._leftSide  &&  this._leftSide.clear();
			this._rightSide && this._rightSide.clear();
		}

		super.updateView();
	}
}

class EnvelopeSideMeasurements extends PIXI.Container {

	static get BOUNDARY_HEIGHT() {return 10;}

	constructor () {
		super();

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);
	}

	/**
	 *
	 * @param model {EnvelopeSide}
	 * @param heightOffset {number}
	 * @param slope {number}
	 * @param lotWidth {number}
	 * @param ltor {boolean}
	 */
	update(model, heightOffset, slope, lotWidth = 0, ltor = true) {
		this.clear();
		this.addChild(this._graphics);
		this._graphics.clear();

		// aggregate the heights & distances
		let heights = [];
		let widths = [];
		let heightPoints = [];
		let widthPoints = [];

		for (let point of model.points) {
			// aggregate heights; don't display ground level
			if (point.height > 0 && heightPoints.indexOf(point.height) < 0) {
				heightPoints.push(point.height);
				heights.push(point);
			}

			// aggregate widths; don't display origin
			if (point.width > 0 && widthPoints.indexOf(point.width) < 0) {
				widthPoints.push(point.width);
				// add a 'reversed' height point
				widths.push(new HeightPoint(point.height, point.width));
			}
		}

		let heightLadder;
		let widthLadder;

		if (ltor) {
			heightLadder = new HeightLadder(heights, heightOffset, slope, 1, -1);
			widthLadder	 = new HeightLadder(widths, 0, 0, 1, 1, false);
			widthLadder.rotation = -Math.PI/2;
		}	else {
			heightLadder = new HeightLadder(heights, heightOffset, slope, -1, -1);
			widthLadder	 = new HeightLadder(widths, 0, 0, 1, -1, false);
			widthLadder.rotation = -Math.PI/2;
		}

		// translate the ladders' origins
		heightLadder.x =
		widthLadder.x  = m.px(lotWidth);

		this.addChild(heightLadder);
		this.addChild(widthLadder);

		// don't draw if the envelope side is not selected
		if (model || model.points.length) {
			this._graphics.lineStyle(1, 0, .2, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		}	else {
			this._graphics.lineStyle(1, 0, .5, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
		}

		// add the height pole at the boundary
		this._graphics.moveTo(m.px(lotWidth), 0);
		this._graphics.lineTo(m.px(lotWidth), -m.px(EnvelopeSideMeasurements.BOUNDARY_HEIGHT + heightOffset));
	}

	clear() {
		this.removeChildren();
	}
}

class HeightLadder extends PIXI.Container {

	static get LABEL_FONT_SIZE() {return 10;}

	static get LABEL_PAD() {return 7;}

	static get DASH_SIZE() {return 3;}

	static get LINE_PAD() {return 3;}

	static get LINE_COLOR() {return 0xAAAAAA;}

	/**
	 * @param heights {HeightPoint[]}
	 * @param offset {number}
	 * @param slope {number}
	 * @param xf {number}
	 * @param yf {number}
	 * @param fullLine {boolean}
	 */
	constructor (heights, offset, slope, xf = 1, yf = 1, fullLine = true) {
		super();

		/**
		 * @type {Graphics}
		 * @private
		 */
		this._graphics = new PIXI.Graphics();
		this.addChild(this._graphics);

		for (let point of heights) {
			// Step 1. Add labels. Labels always go on the vertical
			let label = LabelFactory.getLabel('', HeightLadder.LABEL_FONT_SIZE);
			let xpos;
			let yPos;

			label.text   = point.height + 'm';
			label.height = label.height + 4;
			label.width  = label.width  + 4;

			xpos = xf * m.px(point.width);
			yPos = yf * m.px(offset + point.height);

			if (xf > 0) {
				// flip the label's X coordinate by the X factor
				label.x	= -(label.width + HeightLadder.LABEL_PAD);
			} else {
				label.x = HeightLadder.LABEL_PAD;
			}
			// flip the label's Y position by the Y factor
			label.y = yPos - label.height/2;
			this.addChild(label);

			const yDifference = -Math.sin(slope) * HeightLadder.DASH_SIZE;

			this._graphics.lineStyle(1, 0x666666, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
			this._graphics.moveTo(-HeightLadder.DASH_SIZE, yPos-yDifference);
			this._graphics.lineTo( HeightLadder.DASH_SIZE, yPos+yDifference);
		}
	}
}