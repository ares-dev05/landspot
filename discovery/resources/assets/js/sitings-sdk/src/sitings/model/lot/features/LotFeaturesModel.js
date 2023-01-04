import RestoreDispatcher from '../../../../events/RestoreDispatcher';
import LotEasementModel from './LotEasementModel';
import EasementEvent from '../../../events/EasementEvent';
import EventBase from '../../../../events/EventBase';
import LotDrivewayModel from './LotDrivewayModel';
import DrivewayEvent from '../../../events/DrivewayEvent';
import LotPointModel from '../LotPointModel';
import Geom from '../../../../utils/Geom';
import InnerPathModel from '../../easement/InnerPathModel';
import DataEvent from '../../../../events/DataEvent';
import LotTruncationModel from './LotTruncationModel';


/**
 * This model groups together the following Lot Features:
 *
 * - Angled Easements
 * - Block Easements
 * - Driveways
 */
export default class LotFeaturesModel extends RestoreDispatcher {

	static get MODE_ANGLED_EASEMENT() { return 1; }
	static get MODE_PARALLEL_EASEMENT() { return 2; }
	static get MODE_BLOCK_EASEMENT() { return 3; }
	static get MODE_EXTERNAL_EASEMENT() { return 7; }
	static get MODE_DRIVEWAY() { return 4; }

	// envelopes have a separate model
	static get MODE_ENVELOPE() { return 5; }

	// edge intersections have a separate model
	static get MODE_EDGE_INTERSECTION() { return 6; }

	// corner truncation mode
	static get MODE_TRUNCATION() { return 8; }


	/**
	 * @return {number}
	 */
	get mode() { return this._mode; }

	/**
	 * @param value {number}
	 */
	set mode(value) { this._mode = value; }

	/**
	 * @param lotModel {LotPathModel}
	 * @param context {*}
	 */
	constructor(lotModel, context=null)
	{
		super(context);

		this._mode = LotFeaturesModel.MODE_PARALLEL_EASEMENT;

		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._lotModel	 = lotModel;

		/**
		 * @type {LotEasementModel[]}
		 * @private
		 */
		this._specialEasements	 = [];

		/**
		 * @type {LotDrivewayModel[]}
		 */
		this._driveways	 = [];

		/**
		 * @type {InnerPathModel} Parallel Easements
		 * @private
		 */
		this._parallelEasements	= new InnerPathModel(this._lotModel);

		/**
		 * @type {InnerPathModel} Build envelopes
		 * @private
		 */
		this._envelopes		= new InnerPathModel(this._lotModel);

		/**
		 * @type {LotTruncationModel[]}
		 * @private
		 */
		this._truncations	= [];
	}

	/**
	 * @return {Array<LotEasementModel>}
	 */
	get specialEasements() { return this._specialEasements; }

	/**
	 * @return {LotEasementModel}
	 */
	get lastEasement() { return this._specialEasements[ this._specialEasements.length-1 ]; }

	/**
	 * @return {InnerPathModel}
	 */
	get parallelEasements() { return this._parallelEasements; }

	/**
	 * @return {InnerPathModel}
	 */
	get envelopes() { return this._envelopes; }

	/**
	 * @return {Array<LotDrivewayModel>}
	 */
	get driveways() { return this._driveways; }

	/**
	 * @return {LotDrivewayModel}
	 */
	get lastDriveway() { return this._driveways[ this._driveways.length-1 ]; }

	/**
	 * @returns {LotTruncationModel[]}
	 */
	get truncations() { return this._truncations; }

	/**
	 * @returns {LotTruncationModel}
	 */
	get lastTruncation() {
		return this._truncations.length===0 ? null : this._truncations[this._truncations.length-1];
	}

	/**
	 * @param edge {LotEdgeModel}
	 * @return {LotEasementModel}
	 */
	getEasementFor(edge)
	{
		for (let i=0; i<this._specialEasements.length; ++i) {
			if (this._specialEasements[i].reference === edge) {
				return this._specialEasements[i];
			}
		}

		return null;
	}

	/**
	 * @protected
	 */
	clearTruncations() {
		while (this._truncations.length) {
			this._truncations[0].deleteTruncation();
		}
	}
	/**
	 * @protected
	 */
	clearDriveways() {
		while (this._driveways.length) {
			this._driveways[0].deleteDriveway();
		}
	}
	/**
	 * @protected
	 */
	clearSpecialEasements() {
		while (this._specialEasements.length) {
			this._specialEasements[0].deleteEasement();
		}
	}

	/**
	 * Clear all models
	 * @public
	 */
	clear()
	{
		this.clearSpecialEasements();
		this.clearDriveways();
		this.clearTruncations();

		this._parallelEasements.clear();
		this._envelopes.clear();
	}

	/**
	 * @param edge {LotCurveModel}
	 * @param distance {number}
	 * @return {boolean}
	 */
	addEasementToEdge(edge, distance)
	{
		if (this.mode === LotFeaturesModel.MODE_PARALLEL_EASEMENT) {
			// Parallel Easement Mode. No curved easements allowed
			this._parallelEasements.addParallelEdge(edge, distance, false);
		}
		else if (this._mode===LotFeaturesModel.MODE_ANGLED_EASEMENT ||
                 this._mode===LotFeaturesModel.MODE_BLOCK_EASEMENT||
                 this._mode===LotFeaturesModel.MODE_EXTERNAL_EASEMENT) {
			// Special Easements
			return this._addSpecialEasement(
				edge,
				distance,
				this._mode===LotFeaturesModel.MODE_ANGLED_EASEMENT ? LotEasementModel.ANGLED :
                    (this._mode===LotFeaturesModel.MODE_BLOCK_EASEMENT ? LotEasementModel.BLOCK : LotEasementModel.EXTERNAL)
			);
		}
		else if ( this._mode===LotFeaturesModel.MODE_ENVELOPE ) {
			this._envelopes.addParallelEdge(edge, distance, true);
		}
		else if (this._mode===LotFeaturesModel.MODE_TRUNCATION) {
			this._selectEdgeForTruncation(edge);
		}

		return true;
	}

    toggleParallelEasement(easement)
	{
		const reference = easement.reference;
		const distance  = easement.distance;

		if (easement.type === LotEasementModel.EXTERNAL) {
            this._parallelEasements.addParallelEdge(reference, distance, false);
            easement.deleteEasement();
		} else {
            this._addSpecialEasement(
                reference,
                distance,
                LotEasementModel.EXTERNAL
            );
            easement.deleteEdge();
		}

		return true;
	}

	setParallelEasement(easement, type)
	{
		const reference = easement.reference;
		const distance  = easement.distance;

		if (type == 0) {  // LotEasementModel.EXTERNAL
            this._parallelEasements.addParallelEdge(reference, distance, false);
            easement.deleteEasement();
		} else {
            this._addSpecialEasement(
                reference,
                distance,
                LotEasementModel.EXTERNAL
            );
            easement.deleteEdge();
		}

		return true;
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	addDriveway(x=0, y=0)
	{
		if (this._mode === LotFeaturesModel.MODE_DRIVEWAY) {
			let driveway = new LotDrivewayModel(x, y);

			driveway.addEventListener(DrivewayEvent.DELETE, this.drivewayDeleteEvent, this);
			driveway.addEventListener('snapToPlan', this.snapDrivewayEvt, this);

			this.snapDrivewayToLot(driveway);
			this._driveways.push(driveway);

			this.dispatchEvent(new DataEvent(EventBase.ADDED, this, false, false, driveway));
		}
	}

	/**
	 * @param e {EventBase}
	 */
	snapDrivewayEvt(e)
	{
		this.snapDrivewayToLot(e.dispatcher);
	}

	/**
	 * @param driveway {LotDrivewayModel}
	 */
	snapDrivewayToLot(driveway)
	{
		let i, snapEdge, iPoint, iDist, drivePos, bestPoint, bestDist=Infinity;
		drivePos = new LotPointModel(driveway.x, driveway.y);

		for (i=0; i<this._lotModel.edges.length; ++i) {
			iPoint = this._lotModel.edges[i].getIntersectionPoint(drivePos.x, drivePos.y);
			iDist  = Geom.segmentLength( iPoint.x, iPoint.y, driveway.x, driveway.y );

			if (iDist < bestDist) {
				bestDist	= iDist;
				bestPoint	= iPoint;
				snapEdge	= this._lotModel.edges[i];
			}
		}

		// snap threshold = 5 meters
		if (bestDist<5) {
			driveway.x			= bestPoint.x;
			driveway.y			= bestPoint.y;
			driveway.boundary   = snapEdge;

			if (snapEdge.isCurve) {
				driveway.rotation	= Geom.rad2deg( Geom.angleBetween(
					snapEdge.curveCenter.x, snapEdge.curveCenter.y,
					bestPoint.x, bestPoint.y
				)	- Math.PI / 2 );

				// check if it's an inner curve
				if ( Geom.segmentLength(
						snapEdge.curveCenter.x, snapEdge.curveCenter.y,
						snapEdge.outNormal.b.x, snapEdge.outNormal.b.y
					)	<
					Geom.segmentLength(
						snapEdge.curveCenter.x, snapEdge.curveCenter.y,
						snapEdge.inNormal.b.x, snapEdge.inNormal.b.y
					)) {
					driveway.rotation += 180;
				}
			}	else {
				driveway.rotation	= Geom.rad2deg(snapEdge.outNormal.angle) - 90;
			}
		}
	}

	/**
	 * @param edge {LotCurveModel}
	 * @param distance {number}
	 * @param type {number}
	 * @return {boolean}
	 * @private
	 */
	_addSpecialEasement(edge, distance, type)
	{
		// add a special easement
		let edgeIndex = this._lotModel.edges.indexOf(edge);
		if (edgeIndex === -1) {
			return false;
		}

		let easement = new LotEasementModel(edge, distance, this._lotModel, type);
		this._specialEasements.push(easement);
		easement.addEventListener(EasementEvent.DELETE, this.easementDeleteEvent, this);
		this.dispatchEvent(new DataEvent(EventBase.ADDED, this, false, false, easement));

		return true;
	}

	/**
	 * @param edge {LotCurveModel}
	 * @private
	 */
	_selectEdgeForTruncation(edge) {
		const current = this.lastTruncation;

		if (current && !current.valid) {
			current.rightEdge = edge;
		}	else {
			this._addLotTruncation(
				new LotTruncationModel(
					// use size of previous truncation
					current ? current.size : LotTruncationModel.DEFAULT_SIZE,
					// Set initial, left edge
					edge
				)
			);
		}
	}

	/**
	 * @param truncation
	 * @private
	 */
	_addLotTruncation(truncation) {
		this._truncations.push(truncation);

		truncation.addEventListener(EasementEvent.DELETE, this.truncationDeleteEvent, this);
		truncation.addEventListener(EventBase.CHANGE, this.truncationChanged, this);

		this.dispatchEvent(new DataEvent(EventBase.ADDED, this, false, false, truncation));

		return true;
	}

	/**
	 * @param e {DrivewayEvent}
	 */
	drivewayDeleteEvent(e)
	{
		let index = this._driveways.indexOf(e.driveway);
		e.driveway.removeEventListener(DrivewayEvent.DELETE, this.drivewayDeleteEvent, this);
		e.driveway.removeEventListener('snapToPlan', this.snapDrivewayEvt, this);

		if (index !== -1) {
			this._driveways.splice(index, 1);
		}
	}

	/**
	 * @param e {EasementEvent}
	 */
	easementDeleteEvent(e)
	{
		let index = this._specialEasements.indexOf(e.easement);
		e.easement.removeEventListener(EasementEvent.DELETE, this.easementDeleteEvent, this);

		if (index !== -1) {
			this._specialEasements.splice(index, 1);
		}
	}

	/**
	 * @param e {EasementEvent}
	 */
	truncationDeleteEvent(e)
	{
		let index = this._truncations.indexOf(e.easement);
		e.easement.removeEventListener(EasementEvent.DELETE, this.truncationDeleteEvent, this);
		e.easement.removeEventListener(EventBase.CHANGE, this.truncationChanged, this);

		if (index !== -1) {
			this._truncations.splice(index, 1);
		}
	}

	/**
	 * dispatch a model change
	 */
	truncationChanged()
	{
		this.dispatchEvent(new EventBase(EventBase.CHANGE));
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @return {{specialEasements: Array, driveways: Array}}
	 */
	recordState()
	{
		let drivewayStates=[], easeStates=[], truncationStates=[], i;

		for (i=0; i<this._driveways.length; ++i) {
			drivewayStates.push(
				this._driveways[i].recordState()
			);
		}
		for (i=0; i<this._specialEasements.length; ++i) {
			easeStates.push(
				this._specialEasements[i].recordState()
			);
		}
		for (i=0; i<this._truncations.length; ++i) {
			truncationStates.push(
				this._truncations[i].recordState(this._lotModel)
			);
		}

		return {
			driveways: drivewayStates,
			easements: easeStates,
			truncations: truncationStates,
			mode: this._mode
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		let i, easeState, newDriveways=state.driveways, newEasements=state.easements, newTruncations=state.truncations;

		this._mode	= LotFeaturesModel.MODE_DRIVEWAY;

		// restore existing driveways
		for (i=0; i<newDriveways.length && i<this._driveways.length; ++i) {
			this._driveways[i].restoreState( newDriveways[i] );
		}
		// add missing driveways
		for (; i<newDriveways.length; ++i) {
			this.addDriveway(newDriveways[i].x, newDriveways[i].y);
			this.lastDriveway.restoreState( newDriveways[i] );
		}
		// delete extra driveways
		while ( i<this._driveways.length ) {
			this._driveways[i].deleteDriveway();
		}

		this._mode = LotFeaturesModel.MODE_BLOCK_EASEMENT;

		// Delete all the specialEasements, to make sure that the icons are Correctly built
		this.clearSpecialEasements();

		// Add New specialEasements
		for (i=0; i<newEasements.length; ++i) {
			easeState	= newEasements[i];
			this._addSpecialEasement(
				this._lotModel.edges[easeState.refIndx],
				easeState.distance,
				easeState.type
			);
			this.lastEasement.restoreState(easeState);
		}

		if (state.hasOwnProperty('truncations')) {
			this._mode = LotFeaturesModel.MODE_TRUNCATION;

			// Delete all truncations and add them back
			this.clearTruncations();

			// Add New Lot Truncations
			for (i = 0; newTruncations && i < newTruncations.length; ++i) {
				const state = newTruncations[i];
				const truncation = new LotTruncationModel(state.size);

				truncation.restoreState(state, this._lotModel);

				this._addLotTruncation(truncation);
			}
		}

		if (state.hasOwnProperty('mode')) {
			this._mode = state.mode;
		}	else {
			this._mode = LotFeaturesModel.MODE_PARALLEL_EASEMENT;
		}

		this.onRestored();
	}
}