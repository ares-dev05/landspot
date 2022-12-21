import RestoreDispatcher from "../../../../events/RestoreDispatcher";
import EventBase from "../../../../events/EventBase";
import HighlightableModel from "../../../../events/HighlightableModel";
import ModelEvent from "../../../events/ModelEvent";
import TransformationModel from "./TransformationModel";
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';
import Point from "../../../../geom/Point";
import HouseLayerType from "../HouseLayerType";
import CutBlock from "./CutBlock";
import Geom from "../../../../utils/Geom";

/**
 * Contains a set of all the transformations that are applied to a single house model
 *
 * @RENAME HouseTransformationSet
 * @DISPATCHES 'updateView'
 */
export default class TransformationsLayerModel extends RestoreDispatcher
{
	/**
	 * @param context {*}
	 */
	constructor(context=null)
	{
		super(context);

		/**
		 * @type {TransformationModel[]}
		 * @private
		 */
		this._transformations = [];

		/**
		 * @type {number}
		 * @private
		 */
		this._x = 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._y = 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._rotation = 0;

		/**
		 * @type {HouseModel}
		 * @private
		 */
		this._floorModel = null;

		/**
		 * Contains all of the extended/reduced edge pieces of the house plan
		 *
		 * @type {TransformationCutModel[]}
		 * @private
		 */
		this._cutSegments = [];

		/**
		 * Contains all of the extended/reduced areas of the house plan. We use them to calculate
		 * 	the area difference in the house plan due to the extension/reductions
		 *
		 * @type {CutBlock[]}
		 * @private
		 */
		this._cutBlocks = [];
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Getters/Setters

	/**
	 * @return {number}
	 */
	get x() { return this._x; }

	/**
	 * @return {number}
	 */
	get y() { return this._y; }

	/**
	 * @return {number}
	 */
	get rotation() { return this._rotation; }

	/**
	 * @param v {number}
	 */
	set rotation(v) {
		this._rotation=v;
		this.dispatchEvent(new EventBase("updateView", this));
	}

	/**
	 * @param v {HouseModel}
	 */
	set floorModel(v)
	{
		this._floorModel = v;
		this._floorModel.addEventListener("changeHousePlan", this.onNewHouseSelected, this);
		this._floorModel.addEventListener("changeStructure", this.onFloorRestructured, this);
		this._floorModel.addEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.onFloorHighlightChange, this);

		// When the floor assigned to this transformations layer is deleted, we automatically delete this.
		this._floorModel.addEventListener(ModelEvent.DELETE, this.deleteSelf, this);
	}

	/**
	 * @return {HouseModel}
	 */
	get floorModel() { return this._floorModel; }

	/**
	 * @return {TransformationModel[]}
	 */
	get transformations() { return this._transformations; }

	/**
	 * @return {TransformationModel}
	 */
	get lastTransformation() {
		if (!this._transformations.length)
			return null;

		return this._transformations[this._transformations.length - 1];
	}

	/**
	 * @return {TransformationCutModel[]}
	 */
	get cutSegments() { return this._cutSegments; }

	/**
	 * @return {CutBlock[]}
	 */
	get cutBlocks() { return this._cutBlocks; }

	/**
	 * Calculates the area-delta from all of the applied transformations
	 *
	 * @return {number}
	 */
	get totalArea()
	{
		let area=0, i, j, validBlock;

		// Area from extensions/reductions
		for (i=0; i<this._cutBlocks.length; ++i) {
			// for (validBlock=true, j=0; j<i && validBlock; ++j) {
			// 	validBlock = validBlock && this._cutBlocks[i].isDifferent(this._cutBlocks[j]);
			// }

			//if (validBlock) {
				area += this._cutBlocks[i].coveredArea;
			//}
		}

		// Area from Add-ons
		for (i=0; i<this._transformations.length; ++i) {
			if (this._transformations[i].isAddition) {
				area += this._transformations[i].addonArea;
			}
		}

		return area;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Floorplan Events

	/**
	 * @param e
	 * @private
	 */
	onFloorHighlightChange(e) { this.dispatchEvent(e); }

	/**
	 * @private
	 */
	onNewHouseSelected(e)
	{
		this.clear();
		this.dispatchEvent(new EventBase("updateView", this));
	}
	/**
	 * @private
	 */
	onFloorRestructured(e)
	{
		this.disableAll();
		this.dispatchEvent(new EventBase("updateView", this));
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Operations

	/**
	 * @param dx {number} delta-x
	 * @param dy {number} delta-y
	 */
	translate(dx, dy)
	{
		this._x += dx;
		this._y += dy;
		this.dispatchEvent(new EventBase("updateView", this));
	}

	/**
	 * Removes all of the transformations in the set
	 * @param resetPosition {boolean}
	 */
	clear(resetPosition=false)
	{
		// delete all of the transformations
		while (this._transformations.length) {
			this._transformations[0].deleteTransformation();
		}

		// reset the cuts & blocks
		this._cutSegments = [];
		this._cutBlocks	  = [];

		if (resetPosition) {
			this._x = this._y = 0;
		}

		this.dispatchEvent(new EventBase("updateView", this));
	}

	/**
	 * Disables all of the transformations that have been applied to the house model
	 */
	disableAll()
	{
		// un-apply all transformations; no need to delete them
		for (let i=0; i<this._transformations.length; ++i) {
			this._transformations[i].applied = false;
		}

		// reset the cuts & blocks
		this._cutSegments = [];
		this._cutBlocks	  = [];

		this.dispatchEvent(new EventBase("updateView", this));
	}

	/**
	 * @param model {TransformationModel}
	 */
	addTransformation(model)
	{
		this._transformations.push(model);

		model.addEventListener(TransformationModel.APPLIED_CHANGED, this.transformAppliedChanged, this);
		model.addEventListener(MeasurementPointEvent.EDIT, this.transformationMeasurementEdit, this);
		model.addEventListener(ModelEvent.DELETE, this.transformationRemoved, this);

		this.onAdded();
	}

	/**
	 * Triggered when a transformation is applied or disabled
	 *
	 * @param e {EventBase}
	 */
	transformAppliedChanged(e)			{ this.onChange(); }

	/**
	 * Propagate the measurement edit event
	 *
	 * @param e {MeasurementPointEvent}
	 */
	transformationMeasurementEdit(e)	{ this.dispatchEvent(e); }

	/**
	 * Triggered when a transformation is deleted
	 *
	 * @param e {ModelEvent}
	 */
	transformationRemoved(e)
	{
		/**
		 * @type {TransformationModel}
		 */
		let model = e.model;

		model.removeEventListener(TransformationModel.APPLIED_CHANGED, this.transformAppliedChanged, this);
		model.removeEventListener(MeasurementPointEvent.EDIT, this.transformationMeasurementEdit, this);
		model.removeEventListener(ModelEvent.DELETE, this.transformationRemoved, this);

		this._transformations.splice(this._transformations.indexOf(model),1);

		this.onChange();
	}

	/**
	 * Starting with the un-transformed house plan, it applies all of the transformations to it one by one
	 *
	 * @RENAME: applyTransformations
	 */
	apply()
	{
		/**
		 * @type {HouseLayerModel}
		 */
		let houseLayer;
		let i, t, transformation, transformBounds, transformDelta, transformLine, layerCuts, floorDelta;

		// determine the floor centering delta
		floorDelta	 = new Point(this._floorModel.fullWidth/2, this._floorModel.fullHeight/2);

		// reset the cuts & blocks
		this._cutSegments = [];
		this._cutBlocks	  = [];

		// Undo all the transformations that have been applied on the house layers
		for (i=0; i<this._floorModel.layers.length; ++i) {
			this._floorModel.layers[i].undoTransforms();
		}
		for (i=0; i<this._floorModel.metaLayers.length; ++i) {
			this._floorModel.metaLayers[i].undoTransforms();
		}

		/**
		 * Calculate the parameters for each transformation
		 *
		 * @INFO: transformations are always applied in the order in which they were created and NOT in the order in which
		 * 		  they were applied
 		 */
		for (t=0; t<this._transformations.length; ++t) {
			transformation	= this._transformations[t];

			// Skip Add-ons
			if (transformation.isAddition===true) {
				continue;
			}

			// Only Applied transformations change the house plan
			if (transformation.applied===true) {
				transformBounds = transformation.transformBounds;
				transformLine	= transformation.transformLine;
				transformDelta	= transformation.transformDelta;

				// Move the transformation to the floor's coordinate system
				transformBounds.translate(floorDelta.x, floorDelta.y);
				transformLine.translate(floorDelta.x, floorDelta.y);

				// Apply the transformation to previous cuts
				for (i=0; i<this._cutSegments.length; ++i) {
					this._cutSegments[i].applyTransformation(transformBounds, transformDelta);
				}

				// Create a new 'Cut Block' for this transformation. It will contain changes from all layers
				let cutBlock = new CutBlock([], transformation);

				// Apply the transformation to the house layers
				for (i=0; i<this._floorModel.layers.length; ++i) {
					houseLayer = this._floorModel.layers[i];

					// apply this transformation to the current layer and add the cuts to a list to be displayed
					layerCuts = houseLayer.applyTransformation(transformBounds, transformDelta, transformLine);

					// make sure that we only display cuts for visible layers
					// also, make sure we don't consider roofs
					if (houseLayer.visible && houseLayer.type !== HouseLayerType.ROOF) {
						if ( transformation.type===TransformationModel.REDUCTION ) {
							// set all segments as reductions
							for (let j=0; j<layerCuts.length; ++j) {
								layerCuts[j].isExtension = false;
							}
						}

						// this._cutBlocks.push(new CutBlock(layerCuts, transformation));
						cutBlock.concat(layerCuts);
						this._cutSegments = this._cutSegments.concat(layerCuts);
					}
				}

				// Also apply the transformation to the house meta layers
				for (i=0; i<this._floorModel.metaLayers.length; ++i) {
					this._floorModel.metaLayers[i].applyTransformation(transformBounds, transformDelta, transformLine);
				}

				if (cutBlock.segments.length) {
					this._cutBlocks.push(cutBlock);
				}
			}
		}

		// update the cut segments with the floor delta
		for (i=0; i<this._cutSegments.length; ++i) {
			this._cutSegments[i].translate( -floorDelta.x, -floorDelta.y );
		}

		// redraw all the cut segments
		this.dispatchEvent(new EventBase("updateView"));
	}

	/**
	 * Creates the Add-ons that have been applied as structures in the supplied layer
	 *
	 * @param layer {HouseLayerModel}
	 */
	buildAdditionsOn(layer)
	{
		let i, j, t, dx, dy, cw, ch;

		// Factors to use for the width/height of the addon when creating the 4 walled structure
		cw = [0, 1, 1, 0];
		ch = [0, 0, 1, 1];

		dx = this._floorModel.fullWidth  / 2;
		dy = this._floorModel.fullHeight / 2;

		for (i=0; i<this._transformations.length; ++i) {
			if (this._transformations[i].isAddition) {
				t = this._transformations[i];

				for (j=0; j<cw.length; ++j) {
					layer.addEdgeFromPoints(
						dx + t.x + cw[j]*t.width,
						dy + t.y + ch[j]*t.height,
						dx + t.x + cw[(j+1)%cw.length]*t.width ,
						dy + t.y + ch[(j+1)%cw.length]*t.height
					);
				}
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Multilayer functionality

	/**
	 * @param e {EventBase}
	 */
	deleteSelf(e)
	{
		if (this._floorModel) {
			this._floorModel.removeEventListener("changeHousePlan", this.onNewHouseSelected, this);
			this._floorModel.removeEventListener("changeStructure", this.onFloorRestructured, this);
			this._floorModel.removeEventListener(HighlightableModel.HIGHLIGHT_CHANGE, this.onFloorHighlightChange, this);
			this._floorModel.removeEventListener(ModelEvent.DELETE, this.deleteSelf, this);
			this._floorModel = null;
		}

		if (this._transformations) {
			while (this._transformations.length) {
				this._transformations[0].deleteTransformation();
			}

			this._transformations = null;
		}

		this._cutSegments = null;
		this._cutBlocks = null;

		this.onDelete();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 * @private
	 */
	get transformsStateData()
	{
		let tData = [];

		for (let i=0; i<this._transformations.length; ++i) {
			tData.push(this._transformations[i].recordState());
		}

		return tData;
	}

	/**
	 * @return {{}} Data structure containing all the parameters representing this object's state
	 */
	recordState()
	{
		return {
			x			: this._x,
			y			: this._y,
			rotation	: this._rotation,
			transforms	: this.transformsStateData
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */

	/**
	 * @param state {{}}
	 */
	restoreState(state)
	{
		// delete all existing transforms
		this.clear();

		this._x			= state.x;
		this._y			= state.y;
		this._rotation	= state.rotation;

		// reload the transforms vector
		let transforms  = state.transforms, i, trans;

		// add state transforms back
		for (i=0; i<transforms.length; ++i) {
			trans		= new TransformationModel();
			trans.restoreState(transforms[i]);

			this.addTransformation(trans);
		}

		this.fixPositionRestoreSynch();

		// FloorPlanModel listens to EventBase.CHANGE on this and calls back apply(), which will rebuild
		// _cutSegments & _cutBlocks
		this.onRestored();
	}

	/**
	 * @private
	 */
	fixPositionRestoreSynch() {
		let dx = this._floorModel.center.x-this._x,
			dy = this._floorModel.center.y-this._y, i, cosR, sinR;

		cosR = Math.cos(Geom.deg2rad(this._rotation));
		sinR = Math.sin(Geom.deg2rad(this._rotation));

		// fix the position if we have a discrepancy higher than 0.1mm
		if ( dx > 0.0001 || dy > 0.0001 ) {
			const tdx = -dy*sinR-dx*cosR;
			const tdy =  dx*sinR-dy*cosR;

			for (i=0; i<this.transformations.length; ++i) {
				this.transformations[i].translate(tdx, tdy);
			}
		}

		// set the correct position
		this._x	+= dx;
		this._y	+= dy;
	}
}