import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import LabelFactory from '../../theme/LabelFactory';
import Segment from '../../../../geom/Segment';
import Point from '../../../../geom/Point';
import m from '../../../../utils/DisplayManager';
import Geom from '../../../../utils/Geom';
import Render from '../../../global/Render';

export default class StreetViewLabel extends PIXI.Sprite {

	/**
	 * @param model {StreetModel}
	 * @param view {StreetPointView}
	 * @param lotView {LotPathView}
	 */
	constructor(model, view, lotView)
	{
		super();

		/**
		 * @type {StreetModel}
		 * @private
		 */
		this._model 	= model;
		this._model.addEventListener(EventBase.CHANGE, this.update, this);

		/**
		 * @type {StreetPointView}
		 * @private
		 */
		this._view		= view;

		/**
		 * @type {LotPathView}
		 * @private
		 */
		this._lotView	= lotView;

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._tf		= LabelFactory.getLabel(this._model.text);
		this.addChild(this._tf);

		this.interactive = true;
		this.addListener(EventBase.MOUSE_DOWN, this.startDragLabel, this);
	}

	/**
	 * @param event {InteractionEvent}
	 */
	startDragLabel(event)
	{
		this._view.startDragPoint(event);
	}

	/**
	 * @param e {EventBase}
	 * @public
	 */
	update(e=null)
	{
		// update the label
		this._tf.text = this._model.text;

		const r = this._view.getBounds();

		this._tf.x = -this._tf.width * .5;
		this._tf.y = -this._tf.height * .5;

		// the edge is horizontal. position the label on top of the edge
		this.x	= r.x + r.width  * .5;
		this.y	= r.y + r.height * .5;

		// make sure the text is always readable from the left to right
		if (this._model.snapEdge)
		{
			let edgeView  = this._lotView.viewOf(this._model.snapEdge);
			let labelDist = (this._model.snapEdge.isCurve ? 70 : 40) * this.scaleX;
			let normal	  = this._model.snapEdge.outNormal;
			let viewNormal;

			let A = edgeView.toGlobal(new PIXI.Point(m.px(normal.a.x), m.px(normal.a.y)));
			let B = edgeView.toGlobal(new PIXI.Point(m.px(normal.b.x), m.px(normal.b.y)));

			// calculate the view normal
			viewNormal = new Segment(new Point(A.x, A.y), new Point(B.x, B.y));
			viewNormal.normalize(labelDist);

			// make sure the text is always readable from the left to right
			let lblAngle = Geom.limitDegrees( Geom.rad2deg( viewNormal.angle ) + 90 );
			if (lblAngle > 45 && lblAngle < 235) {
				lblAngle += 180;
			}

			// Set the label placement properties to be used by the SVG label view
			this._model.labelDelta = m.trPoint(new Point(viewNormal.b.x-this.x, viewNormal.b.y-this.y));
			this._model.labelRotation = lblAngle;

			this.rotation = Geom.deg2rad(lblAngle);

			this.x		  =  viewNormal.b.x;
			this.y		  =  viewNormal.b.y;
		}	else {
			this.rotation = 0;
		}

		Render.labelMoved(this._tf, true);
	}
}