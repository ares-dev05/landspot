import m from '../../../../utils/DisplayManager';
import EventBase from '../../../../events/EventBase';
import * as PIXI from 'pixi.js';
import Segment from '../../../../geom/Segment';
import Utils from '../../../../utils/Utils';
import LabelFactory from '../../theme/LabelFactory';
import Render from '../../../global/Render';

export default class FallTopologyView extends PIXI.Sprite {

	/**
	 * @param model {FallTopologyModel}
	 */
	constructor (model) {
		super();

		/**
		 * @type {FallTopologyModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);

		this.graphics = new PIXI.Graphics();
		this.addChild(this.graphics);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);
	}

	/**
	 * @return {FallTopologyModel}
	 * @public
	 */
	get model() {
		return this._model;
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	modelChanged(e) {
		if (this.model.enabled) {
			this.render();
		}	else {
			this.clear();
		}
	}

	/**
	 * @private
	 */
	clear() {
		// clean the surface
		this.graphics.clear();
		Utils.removeChildrenOfParent(this);
		this.addChild(this.graphics);
	}

	/**
	 * @private
	 */
	render() {
		this.clear();

		this.model.lines.forEach( line => {
			this.graphics.lineStyle(1, 0x999999, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

			let first = true;
			let prev;
			let hop = false;
			let point = null;

			for (let i = 0; i < line.points.length; ++i) {
				point = line.points[i];

				if (first) {
					this.graphics.moveTo(m.px(point.x), m.px(point.y));
					first = false;
				}	else {
					if (hop) {
						this.graphics.moveTo(
							m.px((prev.x + point.x) / 2), m.px((prev.y + point.y) / 2)
						);
					}	else {
						this.graphics.quadraticCurveTo(
							m.px(prev.x),
							m.px(prev.y),
							m.px((prev.x + point.x) / 2),
							m.px((prev.y + point.y) / 2)
						);
					}

					hop = !hop;
				}
				prev = point;
			}

			if (point) {
				this.graphics.lineTo(m.px(point.x), m.px(point.y));
			}
			// displays labels for Fall levels
			// if (line.points.length >= 2) {
			// 	let labelDir;
			// 	let labelTf;
			//
			// 	labelDir = new Segment(line.points[1], line.points[0]);
			// 	labelDir.normalize(3);	// place the label 3M away
			//
			// 	labelTf = LabelFactory.getLabel(Utils.fx1(line.level) + 'm', 12);
			// 	labelTf.x = m.px(labelDir.b.x);
			// 	labelTf.y = m.px(labelDir.b.y);
			// 	this.addChild(labelTf);
			// }
		});
	}
}