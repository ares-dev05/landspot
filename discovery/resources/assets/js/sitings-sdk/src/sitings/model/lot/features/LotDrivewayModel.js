import LotPointModel from '../LotPointModel';
import DrivewayEvent from '../../../events/DrivewayEvent';
import EventBase from '../../../../events/EventBase';

export default class LotDrivewayModel extends LotPointModel {

	static get TYPE()			{return 'LotDrivewayModel';}

	static get SCALE_SMALL()	{ return  .3; }
	static get SCALE_NORMAL()	{ return .65; }
	static get SCALE_LARGE()	{ return   1; }

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	constructor(x=0, y=0)
	{
		super(x, y);

		/**
		 * @type {number}
		 * @private
		 */
		this._viewScale = 0;

		/**
		 * @type {number}
		 * @private
		 */
		this._rotation  = 0;

		/**
		 * @type {LotCurveModel}
		 * @private
		 */
		this._boundary  = null;
	}

	/**
	 * @return {LotCurveModel}
	 */
	get boundary() { return this._boundary; }

	/**
	 * @param b {LotCurveModel}
	 */
	set boundary(b) { this._boundary = b; }

	/**
	 * @return string
	 */
	get type() { return this ? LotDrivewayModel.TYPE : null; }

	/**
	 * @return {number}
	 */
	get viewScale() { return this._viewScale; }

	/**
	 * @param v {number}
	 */
	set viewScale(v) {
		this._viewScale=v;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get rotation() { return this._rotation; }

	/**
	 * @param v {number}
	 */
	set rotation(v) {
		this._rotation=v;
		this.onChange();
	}

	deleteDriveway()
	{
		this.dispatchEvent(new DrivewayEvent(DrivewayEvent.DELETE, this, this));
	}
	snapToPlan()
	{
		this.dispatchEvent(new EventBase('snapToPlan', this) );
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * recordState
	 * @return {Object} A data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		let state = super.recordState();

		state.viewScale	= this._viewScale;
		state.rotation	= this._rotation;

		return state;
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		this._viewScale	= state.viewScale;
		this._rotation	= state.rotation;

		super.restoreState( state );
	}
}