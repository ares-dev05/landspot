import RestoreDispatcher from '../../../events/RestoreDispatcher';
import TransformEvent from '../../events/TransformEvent';
import ModelEvent from '../../events/ModelEvent';
import HouseModel from './HouseModel';
import Geom from '../../../utils/Geom';
import EventBase from '../../../events/EventBase';
import SnapInfo from '../measure/SnapInfo';
import Point from '../../../geom/Point';


export class MultiHouseModel extends RestoreDispatcher {
	
	
	/**
	 * @param transforms {MultiFloorsTransforms}
	 */
	constructor(transforms)
	{
		super();

		/**
		 * The transformations applied to all the floorplans
		 * @type {MultiFloorsTransforms}
		 * @private
		 */
		this._multiTransforms	= transforms;

		/**
		 * @type {number}
		 * @private
		 */
		this._crtFloorIndx		= -1;

		/**
		 * The measurements between the lot boundaries and the floor plans
		 * @type {MeasurementsLayerModel}
		 * @private
		 */
		this._measureLayer		= null;

		/**
		 * @type {HouseModel[]}
		 * @private
		 */
		this._floors = [];
	}

	/**
	 * @return {HouseModel[]}
	 */
	get floors() { return this._floors; }

	/**
	 * @param floor {HouseModel|RestoreDispatcher}
	 * @returns {number}
	 */
	indexOf(floor) {
		return this._floors.indexOf(floor);
	}

	/**
	 * @return {number}
	 */
	get count() { return this._floors.length; }

	/**
	 * @return {HouseModel}
	 */
	get latestFloor() { return this._floors[this._floors.length-1]; }

	/**
	 * @return {HouseModel}
	 */
	get crtFloor() { return this._crtFloorIndx<0 ? null : this._floors[this._crtFloorIndx]; }

	/**
	 * @param v {MeasurementsLayerModel}
	 */
	set measureLayer(v) { this._measureLayer = v; }


	/**
	 * @return {string}
	 */
	get houseStructureDetails()
	{
		if ( !this._floors.length ) {
			return '';
		}

		if ( this._floors.length === 1 ) {
			return this._floors[0].houseStructureDetails;
		}
		
		let details = [], i;
		for (i=0; i<this._floors.length; ++i) {
			details.push( 'House '+(i+1)+': '+this._floors[i].houseStructureDetails );
		}
		return details.join('\n');
	}

	/**
	 * @return {string}
	 */
	get houseOptionsDetails()
	{
		if ( !this._floors.length ) {
			return '';
		}

		if (this._floors.length === 1) {
			return this._floors[0].houseOptionsDetails();
		}
		
		let details = [], i;
		for (i=0; i<this._floors.length; ++i) {
			details.push( 'House '+(i+1)+': '+this._floors[i].houseOptionsDetails() );
		}
		return details.join('\n');
	}

	/**
	 * @param canDelete
	 */
	addFloor(canDelete=true)
	{
		// add a transformations layer for the new floor
		this._multiTransforms.addLayer();

		let floor = new HouseModel(this._multiTransforms.latestLayer, canDelete);
		
		floor.addEventListener(ModelEvent.DELETE, this.onFloorDeleted, this);
		floor.addEventListener(ModelEvent.SELECT, this.onFloorSelected, this);
		
		// manage floor rotations & translations here.
		floor.addEventListener(TransformEvent.TRANSLATE, this.onFloorTranslate, this);
		floor.addEventListener(TransformEvent.ROTATE   , this.onFloorRotate, this);
		
		// dispatched for the measurements layer
		floor.addEventListener( 'changeHousePlan', this.onFloorRestructured, this );
		floor.addEventListener( 'changeStructure', this.onFloorRestructured, this );
		floor.addEventListener(   'changeOutline', this.onFloorRestructured, this );
		floor.addEventListener(   'floorMirrored', this.onFloorMirrored, this);

		this._floors.push( floor );
		this.onAdded();
		
		// select this floor
		floor.selectFloor();
	}

	/**
	 * @param e {EventBase}
	 */
	onFloorMirrored(e)
	{
		if (this._measureLayer) {
			// @TODO
			this._measureLayer.clearByTarget(e.dispatcher);
		}
	}

	/**
	 * @param e {EventBase}
	 */
	onFloorRestructured(e)
	{
		if (this._measureLayer) {
			this._measureLayer.clearByTarget(e.dispatcher);
		}
	}

	/**
	 * @param e {ModelEvent}
	 */
	onFloorSelected(e)
	{
		this._crtFloorIndx = this._floors.indexOf(e.model);

		// make sure to mark all others as unselected
		for (let i=0; i<this._floors.length; ++i) {
			this._floors[i].activelySelected = ( i === this._crtFloorIndx );
		}
		
		// let all listeners know that a new floor has been selected!
		this.onSelect();
	}

	/**
	 * @param e {TransformEvent}
	 */
	onFloorTranslate(e)
	{
		this.dragFloor(e.dx, e.dy, e.dispatcher);
	}

	/**
	 * @param e {TransformEvent}
	 */
	onFloorRotate(e)
	{
		let targetFloor = e.dispatcher;
		this.setFloorRotation( targetFloor.rotation + e.rotation, targetFloor );

		// dispatched for the controls, to make the rotation scrollbar update
		this.dispatchEvent(new EventBase('floorRotated', this));
	}

	/**
	 * @param e {ModelEvent}
	 */
	onFloorDeleted(e)
	{
		let floor = e.model;
		
		floor.removeEventListener(ModelEvent.DELETE, this.onFloorDeleted , this);
		floor.removeEventListener(ModelEvent.SELECT, this.onFloorSelected, this);
		floor.removeEventListener(TransformEvent.TRANSLATE, this.onFloorTranslate, this);
		floor.removeEventListener(TransformEvent.ROTATE   , this.onFloorRotate, this);
		
		this._floors.splice(this._floors.indexOf(floor), 1);

		// select a remaining floor
		if (this._floors.length) {
			this.selectFloorByIndex(0);
		}
	}

	/**
	 * @param v {boolean}
	 */
	set renderAddons(v)
	{
		for (let i=0; i<this._floors.length; ++i) {
			this._floors[i].renderAddons = v;
		}
		
		this.onChange();
	}
	
	clear()
	{
		for (let i=this._floors.length-1; i+1; --i) {
			if (this._floors[i].canDelete) {
				// calling 'deleteFloor' manages the floor deletion automatically
				// it also triggers the deletion of the associated transformations layer
				this._floors[i].deleteFloor();
			} 	else {
				this._floors[i].clear();
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// measurement functionality

	/**
	 * @param px {number}
	 * @param py {number}
	 * @returns {SnapInfo}
	 */
	getSnapCorner(px, py)
	{
		let i, bestFloor=null, bestSnap=null, bestDistance=Infinity, snapPoint, distance;
		
		for (i=0; i<this._floors.length; ++i) {
			if (null !== (snapPoint = this._floors[i]._getExistingSnapCorner(px, py))) {
				distance = Geom.segmentLength(px, py, snapPoint.x, snapPoint.y);
				
				if (distance < bestDistance) {
					bestDistance = distance;
					bestSnap  	 = snapPoint;
					/**
					 * @type {HouseModel}
					 */
					bestFloor 	 = this._floors[i];
				}
			}
		}

		/**
		 * @TODO - Henley: include the corner edges in the snap info
		 * @type {Array}
		 */
		let cornerEdges = [];
		if (bestSnap) {
			cornerEdges = bestFloor.getSnapCornerEdges(bestSnap);
		}

		return new SnapInfo(
			bestSnap ? bestSnap : new Point(px, py),
			bestFloor ? bestFloor : this.crtFloor,
			bestSnap!=null,
			true,
			false,
			cornerEdges
		);
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @param startPoint {Point}
	 * @param snapToRoofs {boolean}
	 * @return {SnapInfo}
	 */
	getSnapPosition(px, py, startPoint=null, snapToRoofs=false )
	{
		let i, bestFloor=null, bestSnap=null, bestDist=Infinity, crtSnap, crtDist;
		
		for (i=0; i<this._floors.length; ++i)
		{
			crtSnap = this._floors[i].getExistingSnapPosition(px, py, startPoint, snapToRoofs);
			
			if ( crtSnap ) {
				crtDist = Geom.segmentLength( px, py, crtSnap.x, crtSnap.y );
				
				if ( crtDist < bestDist ) {
					bestDist  =  crtDist;
					bestSnap  =  crtSnap;
					bestFloor = this._floors[i];
				}
			}
		}
		
		if ( bestSnap ) {
			return new SnapInfo( bestSnap, bestFloor, true, false, snapToRoofs);
		}	else {
			return new SnapInfo( new Point(px, py), this.crtFloor, false);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// transform functionality
	//

	/**
	 * @param dx {number}
	 * @param dy {number}
	 * @param targetFloor {HouseModel}
	 */
	dragFloor(dx, dy, targetFloor=null)
	{
		if ( !targetFloor ) {
			targetFloor = this.crtFloor;
		}
		
		// translate the floor
		targetFloor.translate(dx, dy);
		// translate the corresponding transformations layer
		targetFloor.transformations.translate(dx, dy);

		// translate corresponding measurement points
		if (this._measureLayer) {
			this._measureLayer.translateForTarget(dx, dy, targetFloor);
		}
	}

	dropFloor(dx, dy, targetFloor=null )
    {
        if ( !targetFloor ) {
            targetFloor = this.crtFloor;
        }

        targetFloor.dispatchEvent(new EventBase(EventBase.DROP, this.crtFloor));
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @param targetFloor {HouseModel}
	 */
	setFloorPosition(x, y, targetFloor=null)
	{
		if ( !targetFloor ) {
			targetFloor = this.crtFloor;
		}
		
		this.dragFloor( x-targetFloor.center.x, y-targetFloor.center.y, targetFloor );
	}

	/**
	 * @param degrees {number}
	 * @param targetFloor {HouseModel}
	 */
	setFloorRotation(degrees, targetFloor=null)
	{
		if ( !targetFloor ) {
			targetFloor = this.crtFloor;
		}
		
		let angle = Geom.deg2rad( degrees - targetFloor.rotation);
		
		// rotate the target floor
		targetFloor.rotation   = degrees;

		// rotate the corresponding measurement points
		if (this._measureLayer) {
			this._measureLayer.rotateForTarget(angle, targetFloor.center.x, targetFloor.center.y, targetFloor);
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 */
	get floorsData()
	{
		let layers=[], i;
		for (i=0; i<this._floors.length; ++i) {
			layers.push(this._floors[i].recordState());
		}
		return layers;
	}
	
	/**
	 * returns a data structure containing all the parameters representing this object's state
	 * @return {{layers: Array, crtFloor: number}}
	 */
	recordState ()
	{
		return {
			layers		: this.floorsData,
			crtFloor	: this._crtFloorIndx
		};
	}
	
	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		let i, layers = state.layers, houseData, companyData;
		
		companyData	  = state.companyData;
		
		// REMOVE all existing layers, including the ones that can't be deleted
		// @INFO: this also deletes all the existing transformation layers
		for (i=this._floors.length-1; i+1; --i) {
			// force delete!
			this._floors[i].deleteFloor(true);
		}
		
		// restore layers
		// @INFO: the process of restoring the layers will re-create the transformation layers
		// this means that we won't delete and re-create the transformation layers!
		for (i=0; i<layers.length; ++i)
		{
			// adding a new floor adds a transformations layer associated to it
			this.addFloor( i>0 );
			
			// find the house data for this floor
			houseData = companyData ? companyData.getHouseData(parseInt(layers[i].houseId)) : {};

			// load the floor's house data, without actually parsing it
			this.latestFloor.loadHouse( houseData, false );

			// fully restore the floor's state
			this.latestFloor.restoreState( layers[i] );
		}
		
		// select the active floor
		this._crtFloorIndx	= state.crtFloor;
		this.crtFloor.selectFloor();
		
		// restore complete
		this.onRestored();
	}

	/**
	 * Selects a new floor by index. Used in dual-occupancy sitings
	 * @param index
	 */
	selectFloorByIndex(index) {
		if (index !== this._crtFloorIndx && index < this._floors.length) {
			this._crtFloorIndx = index;
			this.crtFloor.selectFloor();
		}
	}

	/**
	 * restoreSingleLayer
	 * @LEGACY-SUPPORT: used to restore from the legacy single-floor setup;
	 * builds the restoration data into a format that is recognizable by the new restoration code
	 * @param state {{}} the state to be restored
	 * @param companyData {CompanyData}
	 */
	restoreSingleLayer(state, companyData)
	{
		this.restoreState( {layers: [state], crtFloor:0, companyData:companyData} );
	}
	
	/**
	 * getRestoringHouseIDs
	 * returns a list with the uIDs of all the houses that need to be parsed before restoring the state
	 * @param state {{}} the state to be restored
	 */
	getRestoringHouseIDs(state)
	{
		let list=[], i, layers = state.layers;
		for (i=0; i<layers.length; ++i) {
			if (layers[i].houseId !== -1) {
				list.push( layers[i].houseId );
			}
		}
		
		return list;
	}
}