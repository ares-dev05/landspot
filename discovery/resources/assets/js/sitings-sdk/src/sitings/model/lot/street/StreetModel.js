import LotPointModel from "../LotPointModel";
import Geom from "../../../../utils/Geom";
import LotCurveModel from "../LotCurveModel";
import LotEdgeAngle from "../LotEdgeAngle";
import Point from "../../../../geom/Point";
import EventBase from '../../../../events/EventBase';

export default class StreetModel extends LotPointModel {

	/**
	 * @return {string}
	 */
	static get SNAP() { return 'streetModel.Snap'; }

	// snaps at 7 meters
	static get SNAP_DIST() {return 7;}

	/**
	 * @param lotModel {LotPathModel}
	 * @param x {number}
	 * @param y {number}
	 * @param text {string}
	 */
	constructor(lotModel, x=0, y=0, text="")
	{
		super(x, y);

		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._lotModel = lotModel;

		/**
		 * @type {string}
		 * @private
		 */
		this._text		= text;

		/**
		 * @type {LotCurveModel}
		 * @private
		 */
		this._snapEdge	= null;
		this._snapEdgeIndex = -1;

		/**
		 * @type {number}
		 * @private
		 */
		this._labelRotation = 0;

		/**
		 * @type {Point}
		 * @private
		 */
		this._labelDelta = new Point();
	}

	/**
	 * @returns {LotCurveModel}
	 */
	get snapEdge() { return this._snapEdge; }

	/**
	 * @returns {string}
	 */
	get text() { return this._text; }

	/**
	 * @returns {number}
	 */
	get labelRotation() { return this._labelRotation; }

	/**
	 * @param v {number}
	 */
	set labelRotation(v) { this._labelRotation = v; }

	/**
	 * @returns {Point}
	 */
	get labelDelta() { return this._labelDelta; }

	/**
	 * @param v {Point}
	 */
	set labelDelta(v) { this._labelDelta = v; }

	/**
	 * @param v {string}
	 */
	set text(v) {
		this._text = v;
		this.onChange();
	}

	/**
	 * @public
	 */
	snap()
	{
		let i, bestEdge = null, bestDist = 2 * StreetModel.SNAP_DIST, crtDist, crtPoint, bestEdgeIndex=-1;
		
		for (i=0; i<this._lotModel.edges.length; ++i) {
			crtPoint	 = this._lotModel.edges[i].getIntersectionPoint(this.x, this.y);
			crtDist		 = Geom.segmentLength(this.x, this.y, crtPoint.x, crtPoint.y);

			if (crtDist < bestDist) {
				bestEdgeIndex = i;
				bestEdge = this._lotModel.edges[i];
				bestDist = crtDist;
			}
		}
		
		if ( bestEdge ) {
			this._snapEdge = bestEdge;
			this._snapEdgeIndex = bestEdgeIndex;

			// place the street label 7 meters away from the boundary
			let normal = this._snapEdge.outNormal.clone();
			normal.normalize(StreetModel.SNAP_DIST);

			this.x = normal.b.x;
			this.y = normal.b.y;
		}	else {
			this._snapEdge = null;
			this._snapEdgeIndex = -1;
		}
		
		this.onChange();
		this.dispatchEvent(new EventBase(StreetModel.SNAP, this));
	}

	/**
	 * releases the street model from snapping to a lot boundary
	 */
	unsnap()
	{
		this._snapEdge = null;
		this._snapEdgeIndex = -1;
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 *
	 * @return {{}}
	 */
	recordState()
	{
		const state			= super.recordState();

		state.text 			= this.text;
		state.snapEdgeIndex	= this._snapEdgeIndex;

		return state;
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 *
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		this.text		= state.text;

		// Restore the snap edge
		if (!state.hasOwnProperty('snapEdgeIndex') || !this._lotModel || state.snapEdgeIndex<0 || state.snapEdgeIndex>=this._lotModel.edges.length) {
			this._snapEdge = null;
			this._snapEdgeIndex = -1;
		}	else {
			this._snapEdgeIndex = state.snapEdgeIndex;
			this._snapEdge		= this._lotModel.edges[state.snapEdgeIndex];
		}

		// Restore position
		super.restoreState(state);
	}
}