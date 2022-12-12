import ChangeDispatcher from '../../events/ChangeDispatcher';
import StreetModel from './lot/street/StreetModel';

export default class StreetsModel extends ChangeDispatcher {
	
	/**
	 * @param lotModel {LotPathModel}
	 * @param context {Object}
	 * @constructor
	 */
	constructor(lotModel, context=null)
	{
		super(context);

		this._lotModel		= lotModel;

		/**
		 * @type {StreetModel[]}
		 * @private
		 */
		this._streets	  = [];
		this.addStreet(new StreetModel(this._lotModel, 0, 0, ''));
		this.addStreet(new StreetModel(this._lotModel, 0, 0, ''));
	}

	/**
	 * @returns {StreetModel[]}
	 */
	get streets() { return this._streets; }

	/**
	 * @param streetModel {StreetModel}
	 */
	addStreet(streetModel) {
		this._streets.push(streetModel);
		streetModel.addEventListener(StreetModel.SNAP, this.streetModelSnap, this);
	}

	/**
	 * @param event
	 */
	streetModelSnap(event) {
		this.dispatchEvent(event);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 * @private
	 */
	get streetsState()
	{
		const state = [];
		for (let i=0; i<this._streets.length; ++i) {
			state.push(this._streets[i].recordState());
		}
		return state;
	}

	/**
	 * @return {{}} a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			streets : this.streetsState
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {Object}
	 */
	restoreState(state)
	{
		if (state && state.hasOwnProperty('streets')) {
			for (let i=0, streetList = state.streets; i<streetList.length && i<this._streets.length; ++i) {
				this._streets[i].restoreState(state.streets[i]);
			}
		}
	}
}