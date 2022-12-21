import TransformationsLayerModel from "./TransformationsLayerModel";
import ModelEvent from "../../../events/ModelEvent";
import EventBase from "../../../../events/EventBase";
import RestoreDispatcher from "../../../../events/RestoreDispatcher";
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';

export default class MultiFloorsTransforms extends RestoreDispatcher {

	/**
	 * @return {string}
	 * @constructor
	 */
	static get EVT_LAYER_ELEMENT_ADDED() { return "mft.layerElementAdded"; }

	
	constructor()
	{
		super();
		
		/**
		 * @type {TransformationsLayerModel[]}
		 * @private
		 */
		this._tLayers = [];
	}

	/**
	 * @return {TransformationsLayerModel[]}
	 */
	get layers() { return this._tLayers; }

	/**
	 * @return {TransformationsLayerModel}
	 */
	get latestLayer() { return this._tLayers[this._tLayers.length-1]; }

	/**
	 * @return {null|TransformationsLayerModel}
	 */
	get currentLayer() {
		for (let i=0; i<this._tLayers.length; ++i) {
			if (this._tLayers[i].floorModel.activelySelected) {
				return this._tLayers[i];
			}
		}
		
		return null;
	}

	/**
	 * @param house {HouseModel}
	 * @returns {TransformationsLayerModel}
	 */
	getLayerOf(house) {
		for (let i=0; i<this._tLayers.length; ++i) {
			if (this._tLayers[i].floorModel === house) {
				return this._tLayers[i];
			}
		}

		return null;
	}

	/**
	 * @return {number}
	 */
	get totalArea()
	{
		let i, total=0;
		for (i=0; i<this._tLayers.length; ++i) {
			total += this._tLayers[i].totalArea;
		}
		return total;
	}

	/**
	 * @param house {HouseModel}
	 * @returns {number}
	 */
	getTransformationAreaFor(house) {
		const  transforms = this.getLayerOf(house);
		return transforms ? transforms.totalArea : 0;
	}

	addLayer()
	{
		const layer = new TransformationsLayerModel();
		this._tLayers.push( layer );
		layer.addEventListener(EventBase.ADDED, this.layerTransformAdded, this);
		layer.addEventListener(MeasurementPointEvent.EDIT, this.transformationMeasurementEdit, this);
		layer.addEventListener(ModelEvent.DELETE, this.onLayerDeleted, this);
		this.onAdded();
	}

	/**
	 * @param e {ModelEvent}
	 */
	onLayerDeleted(e)
	{
		let layer = e.model, indx;
		if ((indx = this._tLayers.indexOf(layer)) !== -1) {
			layer.removeEventListener(ModelEvent.DELETE, this.onLayerDeleted, this);
			layer.removeEventListener(MeasurementPointEvent.EDIT, this.transformationMeasurementEdit, this);
			layer.removeEventListener(EventBase.ADDED, this.layerTransformAdded, this);
			this._tLayers.splice( indx, 1 );
		}
	}

	/**
	 * Propagate the measurement edit event
	 *
	 * @param e {MeasurementPointEvent}
	 */
	transformationMeasurementEdit(e)	{ this.dispatchEvent(e); }

	/**
	 * @param e
	 */
	layerTransformAdded(e)
	{
		this.dispatchEvent(new EventBase(MultiFloorsTransforms.EVT_LAYER_ELEMENT_ADDED));
	}
	
	get hasTransforms()
	{
		for (let i=0; i<this._tLayers.length; ++i) {
			if (this._tLayers[i].transformations.length > 0) {
				return true;
			}
		}
		
		return false;
	}
	
	clear()
	{
		for (let i=0; i<this._tLayers.length; ++i) {
			this._tLayers[i].clear();
		}
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 */
	get tLayersData()
	{
		let layers=[], i;
		for (i=0; i<this._tLayers.length; ++i) {
			layers.push(this._tLayers[i].recordState());
		}
		return layers;
	}
	
	/**
	 * returns a data structure containing all the parameters representing this object's state
	 * @return {{layers: Array}}
	 */
	recordState()
	{
		return {
			layers		: this.tLayersData
		};
	}
	
	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		let i, layers = state.layers;

		for (i=0; i<layers.length; ++i) {
			this._tLayers[i].restoreState( layers[i] );
		}
		
		// onRestored dispatches EventBase.CHANGE automatically
		this.onRestored();
	}
	
	/**
	 * restoreSingleLayer
	 * @LEGACY-SUPPORT: used to restore from the legacy single-floor setup;
	 * builds the restoration data into a format that is recognizable by the new restoration code
	 * @param state {{}} the state to be restored
	 */
	restoreSingleLayer(state)
	{
		this.restoreState( { layers: [ state ] } );
	}
}