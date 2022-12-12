import * as PIXI from 'pixi.js';
import EventBase from '../../../../events/EventBase';
import TransformationsLayerView from './TransformationsLayerView';
import MeasurementPointEvent from '../../../events/MeasurementPointEvent';


export default class MultiTransformsView extends PIXI.Sprite {

	/**
	 * @param model {MultiFloorsTransforms}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {MultiFloorsTransforms}
		 * @private
		 */
		this._model	 = model;
		this._model.addEventListener(EventBase.ADDED, this.transformsLayerAdded, this);

		/**
		 * @type {TransformationsLayerView[]}
		 * @private
		 */
		this._layers = [];

		// add default layers
		if (this._model.layers.length) {
			this.transformsLayerAdded();
		}
	}

	/**
	 * @return {MultiFloorsTransforms}
	 */
	get model()		{ return this._model; }

	/**
	 * @return {TransformationsLayerView[]}
	 */
	get layers()	{ return this._layers; }

	/**
	 * @param v {boolean}
	 */
	set showTransforms(v) {
		for (let i=0; i<this._layers.length; ++i) {
			this._layers[i].showTransforms = v;
		}
	}

	/**
	 * @param e {EventBase}
	 */
	transformsLayerAdded(e=null)
	{
		const tView = new TransformationsLayerView(this._model.latestLayer);

		tView.addListener(EventBase.REMOVED, this.transformsLayerDeleted, this);
		tView.addListener(TransformationsLayerView.EVT_CUTS_RENDERED,  this.propagateEvent, this);
		tView.addListener(MeasurementPointEvent.EDIT,					  this.propagateEvent, this);

		this.addChild(tView);
		this._layers.push(tView);
	}

	/**
	 * @param container {PIXI.DisplayObjectContainer}
	 */
	transformsLayerDeleted(container) {
		container.removeLayer(this);
	}

	/**
	 * @param tView {TransformationsLayerView}
	 */
	removeLayer(tView) {
		tView.removeListener(EventBase.REMOVED,								this.transformsLayerDeleted, this);
		tView.removeListener(TransformationsLayerView.EVT_CUTS_RENDERED,	this.propagateEvent, this);
		tView.removeListener(MeasurementPointEvent.EDIT,					this.propagateEvent, this);

		this._layers.splice(this._layers.indexOf(tView), 1 );
	}

	/**
	 * @param e {EventBase}
	 */
	propagateEvent(e)	{ this.emit(e.type, e); }

	/**
	 */
	showForExport()
	{
		for (let i=0; i<this._layers.length; ++i) {
			this._layers[i].showForExport();
		}
	}

	/**
	 */
	exportFinished()
	{
		for (let i=0; i<this._layers.length; ++i) {
			this._layers[i].exportFinished();
		}
	}
}