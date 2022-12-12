import RestoreDispatcher from "../../events/RestoreDispatcher";
import ApplicationStep from "../../sitings/model/ApplicationStep";
import LotPathModel from "../../sitings/model/lot/LotPathModel";
import InnerPathModel from "../../sitings/model/easement/InnerPathModel";
import LotFeaturesModel from "../../sitings/model/lot/features/LotFeaturesModel";


export default class LotDrawerModel extends RestoreDispatcher {

	/**
	 * @param lotName {string}
	 * @param context {*}
	 * @constructor
	 */
	constructor(lotName, context=null)
	{
		super(context);

		/**
		 * @type {number}
		 * @private
		 */
		this._step = -1;

		/**
		 * classic outline model, built ad-hoc
		 * @type {LotPathModel}
		 * @private
		 */
		this._lotModel			= new LotPathModel(lotName);
		this._lotModel.showAngleInEdgeLabels	= false;

		/**
		 * @type {LotFeaturesModel}
		 * @private
		 */
		this._lotFeaturesModel	= new LotFeaturesModel(this._lotModel);

		/**
		 * restoration flag
		 * @type {boolean}
		 * @private
		 */
		this._isRestoring		= false;

		/**
		 * @type {Object}
		 * @private
		 */
		this._pendingRestoreObject	= null;
	}

	/**
	 * @return {number}
	 */
	get step() { return this._step; }

	/**
	 * @param v {number}
	 */
	set step(v) {
		if (v!==this._step && v >= ApplicationStep.TRACE_OUTLINE) {
			this._step = v;
			this.onChange();
		}
	}
	advanceStep() {
		if (this._step < ApplicationStep.EXPORT_PDF) {
			++this.step;
		}
	}
	reverseStep() {
		if (this._step > 0) {
			--this.step;
		}
	}

	/**
	 * @returns {string}
	 */
	get lotName() { return this._lotName; }

	/**
	 * @return {LotPathModel}
	 */
	get pathModel() { return this._lotModel; }

	/**
	 * @return {LotFeaturesModel}
	 */
	get lotFeaturesModel() { return this._lotFeaturesModel; }

	/**
	 * initialize the model defaults
	 */
	initModelState()
	{
		// setup the lot outline
		this._lotModel.setupDefaultLot();
	}

	/**
	 * @param edge {LotCurveModel}
	 * @param distance {number}
	 * @return {boolean}
	 */
	addOrEditEasementToEdge(edge, distance=3) {
		this._lotFeaturesModel.addEasementToEdge(edge, distance);
	}

	/**
	 * resets all models to default
	 */
	clearAllModels()
	{
		this._lotFeaturesModel.clear();
		this._lotModel.clear();
	}

	/**
	 * clears current step
	 */
	clearStep()
	{
		switch (this._step)
		{
			case ApplicationStep.TRACE_OUTLINE:
				this._lotModel.clear();
				// this.dispatchEvent( new NavigationEvent(NavigationEvent.RESTART) );
				break;
			case ApplicationStep.ADD_EASEMENT:
				this._lotFeaturesModel.clear();
				break;
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			step			 : this._step,
			pathModel		 : this._lotModel.recordState(),
			easeModel		 : this._lotFeaturesModel.parallelEasements.recordState(),
			easementModel	 : this._lotFeaturesModel.recordState()
		};
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {Object} the state to be restored
	 */
	restoreState(state)
	{
		this._lotModel		  .restoreState( state.pathModel );
		this._lotFeaturesModel.parallelEasements.restoreState(state.easeModel);
		this._lotFeaturesModel.restoreState(state.easementModel);
		this.step = state.step;

		this.onRestored();
	}
}