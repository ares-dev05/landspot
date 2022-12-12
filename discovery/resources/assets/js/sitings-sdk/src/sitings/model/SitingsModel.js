import RestoreDispatcher from '../../events/RestoreDispatcher';
import MultiFloorsTransforms from './house/transform/MultiFloorsTransforms';
import {MultiHouseModel} from './house/MultiHouseModel';
import StructuresLayerModel from './structure/StructuresLayerModel';
import LotPathModel from './lot/LotPathModel';
import ApplicationStep from './ApplicationStep';
import LotFeaturesModel from './lot/features/LotFeaturesModel';
import MeasurementsLayerModel from './measure/MeasurementsLayerModel';
import PosCalculator from './pos/PosCalculator';
import StreetsModel from './StreetsModel';
import SiteCoverageCalculator from './SiteCoverageCalculator';
import ClientDetailsModel from './ClientDetailsModel';
import AccountMgr from '../data/AccountMgr';
import AlignEngineeringViewProxy from '../view/engineering/AlignEngineeringViewProxy';
import LotTopographyModel from './levels/LotTopographyModel';
import FallTopologyModel from './levels/fall/FallTopologyModel';
import NearmapModel from './nearmap/NearmapModel';


export default class SitingsModel extends RestoreDispatcher {

	/**
	 * @param companyData {CompanyData}
	 * @param context {*}
	 * @constructor
	 */
	constructor(companyData, context=null)
	{
		super(context);

		/**
		 * @type {number}
		 * @private
		 */
		this._step = -1;

		/**
		 * The entire list of ranges and houses for this company
		 * @type {CompanyData}
		 * @private
		 */
		this._companyData		= companyData;

		/**
		 * classic outline model, built adhoc
		 * @type {LotPathModel}
		 * @private
		 */
		this._lotModel			= new LotPathModel();

		/**
		 * @type {LotFeaturesModel}
		 * @private
		 */
		this._lotFeaturesModel	= new LotFeaturesModel(this._lotModel);

		/**
		 * @type {MultiFloorsTransforms}
		 * @private
		 */
		this._multiTransforms	= new MultiFloorsTransforms();

		/**
		 * @type {MultiHouseModel}
		 * @private
		 */
		this._multiHouse	 	= new MultiHouseModel(this._multiTransforms);

		/**
		 * additional lot structures
		 * @type {StructuresLayerModel}
		 * @private
		 */
		this._structures		= new StructuresLayerModel();

		/**
		 * outline & floor operations
		 * type {MeasurementsLayerModel}
		 * @private
		 */
		this._measureModel		= new MeasurementsLayerModel(this._lotModel, this._multiHouse, this._structures);

		/**
		 * @type {LotTopographyModel}
		 * @private
		 */
		this._lotTopographyModel = new LotTopographyModel(this._lotModel);

		/**
		 * @type {FallTopologyModel}
		 * @private
		 */
		this._fallTopologyModel = new FallTopologyModel(this._lotTopographyModel);

		/**
		 * type {StreetsModel}
		 * @private
		 */
		this._streetsModel		= new StreetsModel(this._lotModel);

		/**
		 * private open space calculator
		 * type {PosCalculator}
		 * @private
		 */
		this._posModel			= new PosCalculator();

		/**
		 * Site coverage calculator util. Only updates values when its .calculate() method is called.
		 *
		 * @type {SiteCoverageCalculator}
		 * @private
		 */
		this._coverageCalculator	= new SiteCoverageCalculator(this);

		/**
		 * client details
		 * type {ClientDetailsModel}
		 * @private
		 */
		this._clientDetails			= new ClientDetailsModel();

		/**
		 * @type {{view: AlignEngineeringView, sitingDelta: {r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *}}}
		 * @private
		 */
		this._engineeringState		= null;

		/**
		 * @type {NearmapModel}
		 * @private
		 */
		this._nearmapModel			= null;
	}

	/**
	 * @return {number}
	 */
	get step() { return this._step; }

	/**
	 * @param v {number}
	 */
	set step(v) {
		if (v < ApplicationStep.TRACE_OUTLINE) {
			return;
		}

		this.onBeforeStepChange(this._step, v);

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
	 * @return {boolean}
	 */
	get isPrebuiltLotMode() { return false; }

	/**
	 * @return {boolean}
	 */
	get isManualLotMode() { return true; }

	/**
	 * @return {CompanyData}
	 */
	get companyData() { return this._companyData; }

	/**
	 * @param v {CompanyData}
	 */
	set companyData(v) { this._companyData = v; }

	/**
	 * @return {LotPathModel}
	 */
	get pathModel() { return this._lotModel; }

	/**
	 * @return {LotFeaturesModel}
	 */
	get lotFeaturesModel() { return this._lotFeaturesModel; }

	/**
	 * return {EdgeIntersectionsLayerModel}
	 * @UNUSED
	get edgeInterModel() { return this._edgeInterModel; }
	 */

	/**
	 * @return {MultiFloorsTransforms}
	 */
	get multiTransforms() { return this._multiTransforms; }

	/**
	 * @return {MultiHouseModel}
	 */
	get multiFloors() { return this._multiHouse; }

	/**
	 * @return {StructuresLayerModel}
	 */
	get structures() { return this._structures; }

	/**
	 * return {MeasurementsLayerModel}
	 */
	get measurementsModel() { return this._measureModel; }

	/**
	 * @returns {LotTopographyModel}
	 */
	get lotTopographyModel() { return this._lotTopographyModel;}

	/**
	 * @returns {FallTopologyModel}
	 */
	get fallTopologyModel() { return this._fallTopologyModel; }

	/**
	 * return {StreetsModel}
	 */
	get streetsModel() { return this._streetsModel; }

	/**
	 * return {PosCalculator}
	 */
	get posModel() { return this._posModel; }

	/**
	 * @returns {SiteCoverageCalculator}
	 */
	get coverageCalculator() { return this._coverageCalculator; }

	/**
	 * @returns {number}
	 */
	getSiteCoverage() {
		this._coverageCalculator.calculate();
		return this._coverageCalculator.siteCoverage;
	}

    /**
     * @returns {number}
     */
	getHouseArea() {
		this._coverageCalculator.calculate();
		return this._coverageCalculator.sitedArea;
	}

    /**
     * @returns {{}}
     */
    getLayersArea() {
		this._coverageCalculator.calculate();
		return this._coverageCalculator.getHouseAreaBreakdown(
			this.multiFloors.crtFloor
		).layers;
	}

	/**
	 * Gets the area breakdown for the sited house. @TODO: this doesn't account for dual-occ
	 *
	 * @returns {{}|{alfresco: number, porch: number, transformations: number, options: number, garage: number, facade: number, floor: number}}
	 */
	getHouseAreaBreakdown() {
		this._coverageCalculator.calculate();
		const areaBreakdown = this._coverageCalculator.getHouseAreaBreakdown(
			this.multiFloors.crtFloor
		);
		delete areaBreakdown.house;
		delete areaBreakdown.layers;
		return areaBreakdown;
	}

	/**
	 * Returns an area breakdown for all the houses. A house area breakdown has the following format:
	 * {	house: HouseModel,
	 * 		totalArea: number			// total area of the house (including facade, options and transformations)
	 * 		facade: number,				// total area of the selected facade
	 * 		options: number,			// summed area of all the options selected for the house
	 * 		transformations: number,	// added or removed area by the transformations & add-ons applied to the house
	 * 		alfresco: number,			// alfresco area (as defined in the House's area JSON)
	 * 		porch: number,				// porch area (as defined in the House's area JSON)
	 * 		garage: number,				// garage area (as defined in the House's area JSON)
	 * 		floor: number				// floor area (as defined in the House's area JSON),
	 * 		layers: {}					// mapping for the labels of selected layers to their areas
	 * }
	 *
	 * @returns {{alfresco: number, porch: number, transformations: number, options: number, layers: {}, garage: number, facade: number, floor: number, house: HouseModel}[]}
	 */
	getDualOccAreaBreakdown() {
		this._coverageCalculator.calculate();

		let houseAreas = this._coverageCalculator.houseAreas;
		for (let i=0; i<houseAreas.length; ++i) {
			houseAreas[i].houseName = houseAreas[i].house.houseName + ' ' + houseAreas[i].house.facadeName;
			delete houseAreas[i].house;
			delete houseAreas[i].layers;
		}

		return houseAreas;
	}

	/**
	 * return {ClientDetailsModel}
	 */
	get clientDetails() { return this._clientDetails; }

	/**
	 * @returns {{view: AlignEngineeringView, sitingDelta: {r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *}}}
	 */
	get engineeringState() { return this._engineeringState; }

	/**
	 * @param state {{view: AlignEngineeringView, sitingDelta: {r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *}}}
	 */
	set engineeringState(state) { this._engineeringState = state; }

	/**
	 * initialize the model defaults
	 */
	initModelState()
	{
		// setup the lot outline
		this._lotModel.setupDefaultLot();

		// create the default floor; can't be deleted; automatically selects it
		this._multiHouse.addFloor(false);

		// set the floor for the levels model
		this._lotTopographyModel.houseModel = this._multiHouse.latestFloor;
	}

	/**
	 * @param edge {LotEdgeModel|LotCurveModel}
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
		this._multiTransforms.clear();
		this._multiHouse.clear();
		this._structures.clear();
		this._posModel.clear();
		this._clientDetails.clear();
		this._lotTopographyModel.clear();
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
				break;
			case ApplicationStep.ADD_EASEMENT:
				this._lotFeaturesModel.clear();
				break;
			case ApplicationStep.IMPORT_FLOOR_PLAN:
				this._multiHouse.clear();
				break;
			case ApplicationStep.ADD_EXTENSIONS:
				this._multiTransforms.clear();
				this._structures.clear();
				break;
			case ApplicationStep.ADD_MEASUREMENTS:
				this._measureModel.clear();
				this._posModel.clear();
				this._lotTopographyModel.clear();
				break;
			default:
				break;
		}
	}

	/**
	 * @param oldStep {number}
	 * @param newStep {number}
	 */
	onBeforeStepChange(oldStep, newStep)
	{
		// if we're after the 'extension' step, we need to render the add-ons; we don't care what the previous step was because
		// we may be in a situation where we're restoring a state so we're on an arbitrary previous step
		this._multiHouse.renderAddons = newStep > ApplicationStep.ADD_EXTENSIONS;
	}

	/**
	 * move to the house selection step
	 */
	jumpToChangeHouse()
	{
		this._measureModel.clear();
		this._multiTransforms.clear();

		this._step		= ApplicationStep.IMPORT_FLOOR_PLAN;
		this._multiHouse.renderAddons = false;

		this.onChange();
	}

	resiteLot()
	{
		this._measureModel.clear();
		this._multiTransforms.clear();
		this._structures.clear();
		this._posModel.clear();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Nearmap implementation

	/**
	 * @return {NearmapModel}
	 */
	get nearmapModel() {
		return (this._nearmapModel = this._nearmapModel || new NearmapModel());
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		const areaData = {
			lotArea:		this.pathModel.totalArea,
			layersArea:		this.getLayersArea(),
			houseAreas:		this.getHouseAreaBreakdown(),
			totalHouseArea:	this.getHouseArea(),
			totalCoverage:	this.getSiteCoverage()
		};

		if (this._multiHouse && this._multiHouse.crtFloor && this._multiHouse.crtFloor.logoRange) {
			areaData.logoRange = this._multiHouse.crtFloor.logoRange;
		}

		if (this._multiHouse.count > 1) {
			areaData.dualOccArea = this.getDualOccAreaBreakdown();
		}

		return {
			step			 : this._step,
			pathModel		 : this._lotModel.recordState(),
			easeModel		 : this._lotFeaturesModel.parallelEasements.recordState(),
			easementModel	 : this._lotFeaturesModel.recordState(),
			envelopeModel	 : this._lotFeaturesModel.envelopes.recordState(),
			levelsLayerModel : this._lotTopographyModel.recordState(),
			fallTopologyModel: this._fallTopologyModel.recordState(),
			multiFloors		 : this._multiHouse.recordState(),
			multiTransforms	 : this._multiTransforms.recordState(),
			structures		 : this._structures.recordState(),
			measureModel	 : this._measureModel.recordState(),
			streets			 : this._streetsModel.recordState(),
			clientDetails	 : this._clientDetails.recordState(),
			posModel		 : this._posModel.recordState(),
			areaData 		 : areaData,
			engineeringState : this.engineeringState ? this.engineeringState.sitingDelta : null,
			nearmapState     : this.nearmapModel ? this.nearmapModel.recordState() : null,
		};
	}

	/**
	 * Records the currently sited lots and all of its associated properties (easements, envelopes, driveways)
	 * @returns {{easeModel: {edges: []}, envelopeModel: {edges: []}, pathModel: *, easementModel: {specialEasements: Array, driveways: Array}}}
	 */
	recordLotState()
	{
		return {
			pathModel		: this._lotModel.recordState(),
			easeModel		: this._lotFeaturesModel.parallelEasements.recordState(),
			easementModel	: this._lotFeaturesModel.recordState(),
			envelopeModel	: this._lotFeaturesModel.envelopes.recordState(),
		};
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {Object} the state to be restored
	 */
	restoreState(state)
	{
		// Restore the lot and its features
		this._lotModel.restoreState( state.pathModel );
		this._lotFeaturesModel.parallelEasements.restoreState(state.easeModel);
		this._lotFeaturesModel.envelopes.restoreState(state.envelopeModel);
		this._lotFeaturesModel.restoreState(state.easementModel);
		this._fallTopologyModel.restoreState(state.fallTopologyModel);

		if (state.hasOwnProperty('multiFloors')) {
			// Restore Houses
			state.multiFloors.companyData	= this._companyData;
			this._multiHouse.restoreState(state.multiFloors);
		}

		if (state.hasOwnProperty('multiTransforms')) {
			this._multiTransforms.restoreState(state.multiTransforms);
		}

		// Restore Additional Structures & Trees
		if ( state.hasOwnProperty('structures') ) {
			this._structures.restoreState(state.structures);
		}	else {
			this._structures.clear();
		}

		// Restore Measurements
		if (state.hasOwnProperty('measureModel')) {
			this._measureModel.restoreState(state.measureModel);
		}

		// restore the levels
		this._lotTopographyModel.restoreState(state.levelsLayerModel);
		// set the new floor for the levels model
		this._lotTopographyModel.houseModel = this._multiHouse.latestFloor;

		// Restore Street Labels
		if (state.hasOwnProperty('streets') && state.streets) {
			this._streetsModel.restoreState(state.streets);
		}

		// Restore client details
		if (state.hasOwnProperty('clientDetails')) {
			this._clientDetails.restoreState(state.clientDetails);
		}	else {
			this._clientDetails.clear();
		}

		if (state.hasOwnProperty('posModel')) {
			this._posModel.restoreState(state.posModel);
		}	else {
			this._posModel.clear();
		}

		// restore the engineering state, if it exists
		if (AccountMgr.i.builder.hasEngineering) {
			if (state.hasOwnProperty('engineeringState') && state.engineeringState) {
				this.engineeringState = {
					sitingDelta: state.engineeringState,
					view: new AlignEngineeringViewProxy(state.engineeringState)
				};
			}
		}

		// restore the nearmap state, if it exists
		if (AccountMgr.i.builder.hasNearmapOverlay) {
			if (state.hasOwnProperty('nearmapState') && state.nearmapState) {
				this.nearmapModel.restoreState(state.nearmapState);
			}
		}

		this.onRestored();
	}

	/**
	 * Returns the IDs of the houses that are going to be restored in the current state
	 * @param state {Object}
	 */
	getRestoringHouseDatas(state)
	{
		const houseDatas = [];
		if (state && state.multiFloors && state.multiFloors.layers) {
			state.multiFloors.layers.forEach((layer) => {
				if (parseInt(layer.houseId) > 0) {
					const houseData = this.companyData.getHouseData(parseInt(layer.houseId));

					if (houseData && houseDatas.indexOf(houseData) < 0) {
						houseDatas.push(houseData);
					}
				}
			});
		}

		return houseDatas;
	}
}