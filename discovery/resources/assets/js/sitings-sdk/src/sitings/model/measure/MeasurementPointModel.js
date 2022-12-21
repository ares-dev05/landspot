import IMeasurement from './IMeasurement';

/**
 * Measurement between a lot boundary and a house wall
 */
export default class MeasurementPointModel extends IMeasurement {

	static get TYPE_2() { return 'lot_2_floor'; }
	static get TYPE()	{ return 'lot_2_target'; }

	/**
	 * @param origin {LotPointModel}
	 * @param edgeModel {LotEdgeModel}
	 * @param context {Object}
	 * @constructor
	 */
	constructor(origin, edgeModel, context=null)
	{
		super(origin, edgeModel, context);

		// calculate the measurement
		this._onParametersChange();
	}

	/**
	 * @returns {string}
	 */
	get type() { return MeasurementPointModel.TYPE; }
}