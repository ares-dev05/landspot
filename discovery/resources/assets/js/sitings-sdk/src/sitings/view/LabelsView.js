import * as PIXI from 'pixi.js';
import EventBase from '../../events/EventBase';
import MeasurementPointLabelView from './measure/MeasurementPointLabelView';
import Utils from '../../utils/Utils';
import InnerEdgeLabelView from './easement/InnerEdgeLabelView';
import LotFeaturesModel from '../model/lot/features/LotFeaturesModel';
import LotEasementLabelView from './lot/features/LotEasementLabelView';
import TransformationsLayerView from './house/transform/TransformationsLayerView';
import TransformationCutLabelView from './house/transform/TransformationCutLabelView';

/**
 * Labels that are in an independent coordinate system from the lot rotation/translation
 */
export default class LabelsView extends PIXI.Sprite {

	constructor(canvasView)	{
		super();

		/**
		 * @type {number}
		 * @protected
		 */
		this._labelsScale	= 1;

		/**
		 * All the displayed labels
		 * @type {Array}
		 * @protected
		 */
		this._labels	= [];

		/**
		 * @type {SitingsView}
		 * @protected
		 */
		this._canvasView	= canvasView;

		/**
		 * @type {SitingsModel}
		 * @protected
		 */
		this._canvasModel	= this._canvasView.model;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._mustUpdate	= false;

		/**
		 * Setup listeners for the creation of models that have labels
		 */
		this.setupListeners();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// EventBase Listeners + Label additions
	//

	/**
	 * @protected
	 */
	setupListeners()
	{
		const view  = this._canvasView;
		const model = this._canvasModel;

		if (model.measurementsModel) {
			model.measurementsModel.addEventListener(EventBase.ADDED, this.onMeasurementAdded, this);

			// add existing measurement labels
			for (let measurement of view.measurements.points) {
				this._addMeasurementLabel(measurement);
			}
		}

		if (model.lotFeaturesModel) {
			model.lotFeaturesModel.parallelEasements.addEventListener(EventBase.ADDED, this.onParallelEasementAdded, this);
			model.lotFeaturesModel.addEventListener(EventBase.ADDED, this.onLotFeatureAdded, this);
		}

		if (view.multiTransforms) {
			view.multiTransforms.addListener(TransformationsLayerView.EVT_CUTS_RENDERED, this.onCutsRendered, this);
		}
	}

	/**
	 * @private
	 */
	onMeasurementAdded() {
		this._addMeasurementLabel(this._canvasView.measurements.lastMeasurement);
	}

	/**
	 * @param measurement {MeasurementPointView}
	 * @private
	 */
	_addMeasurementLabel(measurement) {
		// Don't add labels for Alignment measurements (e.g. Wall to Boundary, Boundary to page etc.)
		if (measurement.isAlignMeasurement === false) {
			this.addLabel(
				new MeasurementPointLabelView(measurement)
			);
		}
	}

	/**
	 * @private
	 */
	onParallelEasementAdded()
	{
		const easements = this._canvasView.lotFeaturesView.parallelEasements;

		this.addLabel(
			new InnerEdgeLabelView(easements.lastEdge, easements.theme)
		);
	}

	/**
	 * @private
	 */
	onLotFeatureAdded()
	{
		const features = this._canvasView.model.lotFeaturesModel;

		if (features.mode === LotFeaturesModel.MODE_ANGLED_EASEMENT ||
			features.mode === LotFeaturesModel.MODE_EXTERNAL_EASEMENT ||
			features.mode === LotFeaturesModel.MODE_BLOCK_EASEMENT ) {

			const easement = this._canvasView.lotFeaturesView.specialEasements[
				this._canvasView.lotFeaturesView.specialEasements.length-1
			];

			this.addLabel(new LotEasementLabelView(easement, this._canvasView.lotFeaturesView.easementTheme));
		}
	}

	/**
	 * @private
	 */
	onCutsRendered()
	{
		const transforms = this._canvasView.multiTransforms;
		let i, j;

		for (i=0; i<transforms.layers.length; ++i) {
			const layer = transforms.layers[i];

			for (j=0; j<layer.cutViews.length; ++j) {
				this.addLabel(
					new TransformationCutLabelView(layer.cutViews[j])
				);
			}
		}
	}

	/**
	 * @param container {LabelsView}
	 * @private
	 */
	labelRemovedListener(container) {
		container.removeLabel(this);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// EventBase Listeners + Label additions
	//

	/**
	 * @returns {number}
	 */
	get labelsScale() { return this._labelsScale; }

	/**
	 * @param v {number}
	 */
	set labelsScale(v) {
		this._labelsScale = v;
		this.update(true);
	}

	/**
	 * Adds a display object as a label
	 * @public
	 */
	addLabel(label)
	{
		label.scaleX = label.scaleY = this._labelsScale;
		label.addListener(EventBase.REMOVED, this.labelRemovedListener);

		this.addChild(label);
		this._labels.push(label);

		label.update();
	}

	/**
	 * @param label {Object}
	 * @public
	 */
	removeLabel(label) {
		label.removeListener(EventBase.REMOVED, this.labelRemovedListener, this);
		this._labels.splice(this._labels.indexOf(label), 1);
		Utils.removeParentOfChild(label);
	}

	/**
	 * @param forceRedraw {boolean}
	 * public
	 */
	update(forceRedraw=true)
	{
		// @TODO: make sure we update only once per frame
		this._mustUpdate = true;

		if (forceRedraw) {
			this.updateLabels();
		}
	}

	/**
	 * @private
	 */
	updateLabels()
	{
		if (!this._mustUpdate) {
			return;
		}

		this._mustUpdate = false;

		for (let i=0; i<this._labels.length; ++i) {
			this._labels[i].scaleX = this._labels[i].scaleY = this._labelsScale;
			this._labels[i].update();
		}
	}
}