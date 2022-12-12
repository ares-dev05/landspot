import * as PIXI from 'pixi.js';
import EventBase from "../../../../events/EventBase";
import LabelFactory from "../../theme/LabelFactory";
import Geom from "../../../../utils/Geom";
import Utils from "../../../../utils/Utils";
import Render from "../../../global/Render";

export default class TransformationCutLabelView extends PIXI.Sprite {

	/**
	 * @param view {TransformationCutView}
	 */
	constructor(view)
	{
		super();

		/**
		 * @type {TransformationCutView}
		 * @private
		 */
		this._view = view;
		this._view.addListener(EventBase.REMOVED, this.viewDelete, this);

		/**
		 * @type {TransformationCutModel}
		 * @private
		 */
		this._model = view.model;

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._distanceLabel	= LabelFactory.getLabel("", 11);
		this.addChild(this._distanceLabel);

		this.update();
	}

	/**
	 * Reposition the label after a view scale /
	 */
	update()
	{
		this._distanceLabel.text = this._model.labelString;

		const r		= this._view.displayBounds,
			WIDTH	= this._distanceLabel.width  * this.scaleX,
			HEIGHT	= this._distanceLabel.height * this.scaleY,
			extension = this._model.isExtension;

		if (Geom.equal(this._model.a.x, this._model.b.x )) {
			// Extension/Reduction done on a horizontal edge
			this.x = r.x - WIDTH - 5 + (extension ? r.width/2 : 0);
			this.y = r.y + r.height / 2 - HEIGHT / 2;
		}
		else {
			// Extension/Reduction done on a vertical edge
			this.x	 = r.x + r.width /2 - WIDTH/2;
			this.y	 = r.y + r.height/2 - HEIGHT - 5 - (extension ? 0 : 5 * this.scaleY);
		}

		Render.labelMoved(this);
	}

	/**
	 * @param container
	 */
	viewDelete(container)
	{
		this._view.removeListener(EventBase.REMOVED, this.viewDelete, this);
		Utils.removeParentOfChild(this);
	}
}