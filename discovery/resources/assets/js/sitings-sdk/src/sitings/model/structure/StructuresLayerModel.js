import RestoreDispatcher from "../../../events/RestoreDispatcher";
import ModelEvent from "../../events/ModelEvent";
import TransformEvent from "../../events/TransformEvent";
import Geom from "../../../utils/Geom";
import SnapInfo from "../measure/SnapInfo";
import Point from "../../../geom/Point";
import StructurePoint from "./StructurePoint";
import StructureRectangle from "./StructureRectangle";

export default class StructuresLayerModel extends RestoreDispatcher {

	constructor(context=null)
	{
		super(context);

		/**
		 * @type StructurePoint[]
		 * @private
		 */
		this._structures = [];
	}

	/**
	 * @return {StructurePoint[]}
	 */
	get structures() { return this._structures; }

	/**
	 * @param structure {StructurePoint|RestoreDispatcher}
	 * @returns {number}
	 */
	indexOf(structure) {
		return this._structures.indexOf(structure);
	}

	/**
	 * @return {StructurePoint|StructureRectangle}
	 */
	get lastStructure() {
		if (this._structures && this._structures.length) {
			return this._structures[this._structures.length-1];
		}

		return null;
	}

	/**
	 * @param structure {StructurePoint }
	 */
	addStructure(structure)
	{
		if (structure) {
			structure.addEventListener(ModelEvent.DELETE,		 this.structureDeleted, this);
			structure.addEventListener(TransformEvent.TRANSLATE, this.structureTransformed, this);
			structure.addEventListener(TransformEvent.ROTATE,	 this.structureTransformed, this);
			structure.addEventListener(TransformEvent.SHAPE,	 this.structureTransformed, this);

			this.structures.push(structure);
			this.onAdded();
		}
	}

	/**
	 * @param e {TransformEvent}
	 * @private
	 */
	structureTransformed(e) {
		this.dispatchEvent(e);
	}

	/**
	 * @param e {ModelEvent}
	 */
	structureDeleted(e)
	{
		// bubble up to the measurements layer
		this.dispatchEvent(e);

		/**
		 * @type {StructurePoint}
		 */
		const structure = e.model;

		if (structure) {
			structure.removeEventListener(ModelEvent.DELETE,		this.structureDeleted,	   this);
			structure.removeEventListener(TransformEvent.TRANSLATE, this.structureTransformed, this);
			structure.removeEventListener(TransformEvent.ROTATE,	this.structureTransformed, this);
			structure.removeEventListener(TransformEvent.SHAPE,	    this.structureTransformed, this);

			this.structures.splice(this.structures.indexOf(structure), 1);
		}
	}

	/**
	 * Try to snap to the closest structure and return the snap information
	 *
	 * @param px {number}
	 * @param py {number}
	 * @param startPoint {Point}
	 * @return {SnapInfo}
	 */
	getSnapPosition(px, py, startPoint=null)
	{
		let i, structure, bestStructure=null, bestSnap=null, bestDist=Infinity, crtSnap, crtDist;

		for (i=0; i<this.structures.length; ++i) {
			structure	= this.structures[i];
			crtSnap	 	= structure.getExistingSnapPosition(px, py, startPoint);

			if ( crtSnap ) {
				crtDist	= Geom.segmentLength(px, py, crtSnap.x, crtSnap.y);
				if ( crtDist < bestDist ) {
					bestDist  	  =  crtDist;
					bestSnap  	  =  crtSnap;
					bestStructure = structure;
				}
			}
		}

		if ( bestSnap ) {
			return new SnapInfo(bestSnap, bestStructure, true);
		}	else {
			return new SnapInfo(new Point(px, py), null, false);
		}
	}

	/**
	 * remove all existing structures
	 */
	clear()
	{
		while (this.structures && this.structures.length) {
			this.structures[0].remove();
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 * @private
	 */
	get structuresState()
	{
		const state = [];
		for (let i=0; i<this.structures.length; ++i) {
			state.push(this.structures[i].recordState());
		}
		return state;
	}

	/**
	 * @return {{}} a data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			structures : this.structuresState
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {Object}
	 */
	restoreState(state)
	{
		this.clear();

		if (state && state.hasOwnProperty("structures")) {
			for (let i=0, structureList = state.structures; i<structureList.length; ++i) {
				this.addStructure(StructuresLayerModel.fromData(state.structures[i]));
			}
		}
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// static

	/**
	 * @param data {Object}
	 * @return {StructurePoint|null|StructureRectangle}
	 */
	static fromData(data)
	{
		switch (data.dataType) {
			case StructurePoint.DATA_TYPE:
				return StructurePoint.fromRestoreData(data);

			case StructureRectangle.DATA_TYPE:
				return StructureRectangle.fromRestoreData(data);

			default:
				return null;
		}
	}
}