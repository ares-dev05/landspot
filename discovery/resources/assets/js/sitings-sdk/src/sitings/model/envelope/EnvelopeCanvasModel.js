import EventBase from '../../../events/EventBase';
import RestoreDispatcher from '../../../events/RestoreDispatcher';
import FacadeModel from './FacadeModel';
import TransformationsModel from './TransformationsModel';
import FloorPositionModel from './FloorPositionModel';
import HeightEnvelopeModel from './HeightEnvelopeModel';
import DualBuilder from './builders/DualBuilder';
import LotSurfaceBuilder from '../levels/3d/LotSurfaceBuilder';
import SiteWorksModel from '../levels/works/SiteWorksModel';
import SiteCostsModel from '../levels/costs/SiteCostsModel';
import CostProfile from '../levels/profiles/CostProfile';

/**
 * @TODO: refactor and make this obsolette. Use it instead for the advanced siting / engineering + 3D overlay model
 */
export default class EnvelopeCanvasModel extends RestoreDispatcher{

	// setup the building envelope
	static get SETUP_ENVELOPE() {return 1;}

	// load facade, transform it
	static get SETUP_FACADE() {return 2;}

	/**
	 * @param sitingModel {SitingsModel}
	 */
	constructor(sitingModel) {
		super();

		/**
		 * @type {number}
		 * @private
		 */
		this._step = -1;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isRestoring = false;

		/**
		 * @type {Object}
		 * @private
		 */
		this._pendingRestoreObject = {};

		/**
		 * @type {HouseData[]}
		 * @private
		 */
		this._restoreHouses = [];

		/**
		 * @type {boolean}
		 * @private
		 */
		this._collisionsInvalid = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._transformsInvalid = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._envelopeInvalid = false;

		/**
		 *
		 * @type {boolean}
		 * @private
		 */
		this._groundInvalid = false;

		/**
		 * @type {EnvelopeCatalogue}
		 * @private
		 */
		this._envelopeCatalogue	= null;

		/**
		 * @type {FacadeCatalogue}
		 * @private
		 */
		this._facadeCatalogue = null;

		/**
		 * @type {SitingsModel}
		 * @private
		 */
		this._sitingModel = sitingModel;

		// the facade is automatically positioned on the ground level
		/**
		 * @type {FacadeModel}
		 * @private
		 */
		this._facade = new FacadeModel();

		// height extensions
		/**
		 * @type {TransformationsModel}
		 * @private
		 */
		this._transformations = new TransformationsModel(this._facade);

		// setback measurements model
		/**
		 * @type {FloorPositionModel}
		 * @private
		 */
		this._floorPosition = new FloorPositionModel(this._sitingModel.pathModel, this._sitingModel.measurementsModel, this._facade);

		this._floorPosition.addEventListener(EventBase.CHANGE, this.floorPositionChanged, this);
		this._floorPosition.addEventListener(FloorPositionModel.VCHANGE, this.floorPositionChangedVertically, this);

		// the Height envelope Model will also include the ground layer ? it needs to have access to:
		//	- setbacks
		//	- lot levels
		/**
		 * @type {HeightEnvelopeModel}
		 * @private
		 */
		this._envelope = new HeightEnvelopeModel(this._sitingModel.measurementsModel, this._sitingModel.lotTopographyModel, this._floorPosition);

		/**
		 * Envelope builder that receives the two sides of the height envelope and build a continuous envelope structure
		 *
		 * @type {DualBuilder}
		 * @private
		 */
		this._envelope.builder	= new DualBuilder();

		// add event listeners
		this._envelope.addEventListener(HeightEnvelopeModel.REBUILT, this.envelopeRebuilt, this);

		this._facade.addEventListener(EventBase.CHANGE, this.facadeChanged, this);
		this._facade.addEventListener(FacadeModel.FACADE_CHANGED, this.facadeStructureChanged, this);

		this._transformations.addEventListener(EventBase.CHANGE, this.transformationsChanged, this);

		this._validateLoopID = setInterval(() => this.validate(), 30);

		/**
		 * @type {SiteWorksModel}
		 * @private
		 */
		this._siteWorksModel	= new SiteWorksModel(
			this._sitingModel.lotTopographyModel,
			this.floorPosition,
			this.facade,
			this._sitingModel.lotFeaturesModel.driveways
		);

		/**
		 * @type {SiteCostsModel}
		 * @private
		 */
		this._siteCostsModel	= new SiteCostsModel(
			this._siteWorksModel,
			// @TODO @TEMP: Create a default cost profile to use while testing
			new CostProfile()
		);

		/**
		 * @type {LotSurfaceBuilder}
		 * @private
		 */
		this._surfaces = new LotSurfaceBuilder(
			this._siteWorksModel,
			this._sitingModel.lotTopographyModel,
			this.floorPosition,
			this._sitingModel.fallTopologyModel,
			this.facade,
			this._sitingModel.lotFeaturesModel.driveways,
		);
	}

	/**
	 * @return {SiteWorksModel}
	 */
	get siteWorks() {
		return this._siteWorksModel;
	}

	/**
	 * @return {SiteCostsModel}
	 */
	get siteCosts() {
		return this._siteCostsModel;
	}

	/**
	 * @returns {LotSurfaceBuilder}
	 */
	get surfaces() {
		return this._surfaces;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get step() {
		return this._step;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set step(v) {
		if (v !== this._step && v >= EnvelopeCanvasModel.SETUP_ENVELOPE && v <= EnvelopeCanvasModel.SETUP_FACADE) {
			this.onBeforeStepChange(this._step, v);
			this._step = v;
			this.onChange();
		}
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	advanceStep() {
		if (this._step < EnvelopeCanvasModel.SETUP_FACADE) {
			++this._step;
			return true;
		}
		return false;
	}

	/**
	 * @public
	 */
	reverseStep() {
		if (this._step > 0) {
			this._step = this._step - 1;
		}
	}

	// envelopes catalogue, organized by estate
	/**
	 * @return {EnvelopeCatalogue}
	 * @public
	 */
	get envelopeCatalogue() {
		return this._envelopeCatalogue;
	}

	/**
	 * @param v {EnvelopeCatalogue}
	 */
	set envelopeCatalogue(v) {
		this._envelopeCatalogue = v;
	}

	/**
	 * @param v {FacadeCatalogue}
	 */
	set facadeCatalogue(v) {
		this._facadeCatalogue = v;
	}

	// building envelope
	/**
	 * @return {HeightEnvelopeModel}
	 * @public
	 */
	get envelope() {
		return this._envelope;
	}

	// facade
	/**
	 * @return {FacadeModel}
	 * @public
	 */
	get facade() {
		return this._facade;
	}

	// facade transformations
	/**
	 * @return {TransformationsModel}
	 * @public
	 */
	get transformations() {
		return this._transformations;
	}

	// facade setback measurements
	/**
	 * @return {FloorPositionModel}
	 * @public
	 */
	get floorPosition() {
		return this._floorPosition;
	}

	// called when the application is entered and it goes to the foreground; can happen multiple times
	/**
	 * @public
	 */
	enter() {
		// reset to first step
		this._step	= EnvelopeCanvasModel.SETUP_ENVELOPE;

		// update measurements; this will lead to the envelope size being updated
		this._floorPosition.measure();

		// load the floor model
		const floor = this._sitingModel.measurementsModel.leftSetback.target;

		if (floor) {
			const floorId	= floor.houseData.id;
			const facadeId	= floor.selectedFacadeId;

			let success = false;

			if (this._facadeCatalogue) {
				// search for this floor's facade in the catalogue
				const houseData = this._facadeCatalogue.getHouseData(Number(floorId));

				if (houseData) {
					const facade = houseData.getFacade(facadeId);

					if (facade) {
						// load it in!
						this._facade.loadFacade(floor.getHouseStructDetails(' '), facade, houseData.toMm );
						success = true;
					}	else {
						console.log('	> couldn\'t find facade...');
					}
				}
			}	else {
				console.log('facade catalogue doesn\'t exist...');
			}

			// @TODO @TEMP
			if (!success) {
				// load a test facade;
				this._facade.loadTestFacade(floor.getHouseStructDetails(' '), this._floorPosition.houseWidth);
			}
		}	else {
			// @TODO: show an error; invalid setbacks selected! should never happen
		}
	}

	// called when the application is exited and it goes to the background; can happen multiple times
	exit() {
		// @TODO: suspend processes
	}

	/**
	 * @private
	 */
	floorPositionChanged() {
		// changes to the setback measurements leads to a different lot width
		this.invalidateEnvelope();
		// this can also change the vertical position of the house - applied as a transformation
		this.invalidateTransformations();
		// changes to setback measurements can also lead to a different facade position
		this.invalidateCollisions();
	}

	/**
	 * @private
	 */
	floorPositionChangedVertically() {
		// invalidate the ground structure
		this.invalidateGround();
		// this changes the vertical position of the house - applied as a transformation
		this.invalidateTransformations();
		// changes to setback measurements can also lead to a different facade position
		this.invalidateCollisions();
	}

	/**
	 * @private
	 */
	envelopeRebuilt() {
		this.invalidateCollisions();
	}

	/**
	 * @private
	 */
	facadeChanged() {
		// the facade translated; don't reapply the transforms, just the collisions
		this.invalidateCollisions();
	}

	/**
	 * @private
	 */
	facadeStructureChanged() {
		// facade reloaded; invalidate both transforms and collisions
		this.invalidateTransformations();
		this.invalidateCollisions();
	}

	/**
	 * @private
	 */
	transformationsChanged() {
		this.invalidateCollisions();
		this.invalidateTransformations();
	}

	/**
	 * @private
	 */
	validate() {
		if (this._envelopeInvalid) {
			// the envelope structure is updated first
			this.rebuildHeightEnvelope();
		}	else
		if (this._groundInvalid) {
			// rebuild the envelope ground, if needed (and if the full envelope structure wasn't already rebuilt)
			this.rebuildLotGround();
		}

		// transformations are always applied first
		if (this._transformsInvalid) {
			this.applyTransformations();
		}

		// collisions are applied last
		if (this._collisionsInvalid) {
			this.runCollisionsTest();
		}

		this._groundInvalid = false;
		this._transformsInvalid = false;
		this._collisionsInvalid = false;
		this._envelopeInvalid = false;
		this._groundInvalid = false;	// this also rebuilds the ground
	}

	/**
	 * @private
	 */
	invalidateCollisions() {
		this._collisionsInvalid = true;
	}

	/**
	 * @private
	 */
	runCollisionsTest() {
		this.envelope.segments.forEach(border => border.isHit = false);

		this.facade.edges.forEach(wall => {
			wall.isHit = false;

			// intersect with all borders
			this.envelope.segments.forEach(border => {
				if (border.isGround)
					return;

				// the facade's position is dependent on the left setback, as its position by itself is static
				if (border.hitTest(wall, this.floorPosition.leftDistance)) {
					border.isHit = true;
					wall.isHit = true;
				}
			});
		});
	}

	/**
	 * @private
	 */
	invalidateTransformations() {
		this._transformsInvalid = true;
	}

	/**
	 * @private
	 */
	applyTransformations() {
		// reload the untransformed facade state
		this._facade.reload();

		// apply the transformations from the highest to the lowest
		for (let index = this.transformations.transformations.length-1; index >= 0; --index) {
			if (this.transformations.transformations[index].enabled &&
				this.transformations.transformations[index].extension > 0) {
				this.facade.applyTransform(this.transformations.transformations[index]);
			}
		}

		// move the house vertically to the level of the pad
		if (!isNaN(this.floorPosition.padLevel)) {
			this.facade.setHouseLevel(this.floorPosition.padLevel);
		}
	}

	/**
	 * @private
	 */
	invalidateEnvelope() {
		this._envelopeInvalid = true;
	}

	/**
	 * @private
	 */
	rebuildHeightEnvelope() {
		this._envelope.lotWidth = this._floorPosition.lotWidth;
	}

	/**
	 * @private
	 */
	invalidateGround() {
		this._groundInvalid = true;
	}

	/**
	 * @private
	 */
	rebuildLotGround() {
		this._envelope.rebuildGround();
	}

	/**
	 * @private
	 */
	clearAllModels() {
		this._envelope.clear();
		this._facade.clear();
		this._transformations.clear();
		this._floorPosition.clear();
	}

	/**
	 * @private
	 */
	clearStep() {
		switch (this._step)
		{
			case EnvelopeCanvasModel.SETUP_ENVELOPE:
				this._envelope.clear();
				break;

			case EnvelopeCanvasModel.SETUP_FACADE:
				this._facade.clear();
				break;
		}
	}

	/**
	 * @param step {number}
	 * @return {string}
	 */
	static getStepName(step) {
		switch (step) {
			case EnvelopeCanvasModel.SETUP_ENVELOPE:
				return 'BUILDING ENVELOPE';

			case EnvelopeCanvasModel.SETUP_FACADE:
				return 'FACADE DETAILS';
		}
		return '';
	}

	/**
	 * @TODO recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState() {
		return {};
	}

	/**
	 * @TODO restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {Object} the state to be restored
	 */
	restoreState(state) {
	}
}