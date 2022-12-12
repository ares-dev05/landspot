import IMeasurement from "./IMeasurement";
import EventBase from "../../../events/EventBase";
import ModelEvent from "../../events/ModelEvent";
import Segment from "../../../geom/Segment";

/**
 * House to house measurement used for dual occupancy
 */
export default class FloorMeasurementModel extends IMeasurement {

	static get TYPE() { return "floor_2_floor"; }

	/**
	 * @param origin {LotPointModel}
	 * @param edgeModel {HouseEdgeModel}
	 * @param floorFrom {HouseModel}
	 * @param context {Object}
	 */
	constructor(origin, edgeModel, floorFrom, context=null)
	{
		super(origin, edgeModel, context);

		/**
		 * The house this measurement starts from
		 * @type {HouseModel}
		 * @private
		 */
		this._floorFrom = floorFrom;
		this._floorFrom.addEventListener(ModelEvent.DELETE, this._onReferenceDelete, this);
		this._floorFrom.addEventListener(EventBase.CHANGE, this._onParametersChange, this);
		this._floorFrom.addEventListener("changeStructure", this._onReferenceDelete, this);
		this._floorFrom.addEventListener("changeHousePlan", this._onReferenceDelete, this);

		this._onParametersChange();
	}

	/**
	 * @returns {string}
	 */
	get type() { return FloorMeasurementModel.TYPE; }

	/**
	 * @returns {HouseModel}
	 */
	get floorFrom()	{ return this._floorFrom; }

	/**
	 * @returns {Segment}
	 * @override
	 */
	get edgeGlobalSpace()
	{
		return new Segment(
			this._floorFrom.localToGlobal(this._edge.a.x, this._edge.a.y),
			this._floorFrom.localToGlobal(this._edge.b.x, this._edge.b.y)
		);
	}

	/**
	 * House <-> House measurements are invalid between the walls of the same house
	 *
	 * @returns {boolean}
	 * @override
	 */
	get invalidMeasurement()		{ return this._target === this._floorFrom; }

	/**
	 * @param snapInfo {SnapInfo}
	 */
	hookStartPoint(snapInfo)
	{
		super.hookStartPoint(snapInfo);

		// Delete invalid measurements
		if (this._distance === 0) {
			this.deleteMeasurement();
		}
	}

	/**
	 * Deletes this measurement model
	 * @override
	 */
	deleteMeasurement()
	{
		if (this._floorFrom) {
			this._floorFrom.removeEventListener(ModelEvent.DELETE, this._onReferenceDelete, this);
			this._floorFrom.removeEventListener(EventBase.CHANGE, this._onParametersChange, this);
			this._floorFrom.removeEventListener("changeStructure", this._onReferenceDelete, this);
			this._floorFrom.removeEventListener("changeHousePlan", this._onReferenceDelete, this);
			this._floorFrom = null;
		}

		super.deleteMeasurement();
	}
}