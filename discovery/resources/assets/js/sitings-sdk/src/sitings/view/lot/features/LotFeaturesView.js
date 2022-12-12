import EventBase from '../../../../events/EventBase';
import * as PIXI from 'pixi.js';
import {LotEasementView} from './LotEasementView';
import LotDrivewayView from './LotDrivewayView';
import InnerPathView from '../../easement/InnerPathView';
import EasementRenderer from '../../easement/EasementRenderer';
import EnvelopeRenderer from '../../easement/EnvelopeRenderer';
import LotEasementModel from '../../../model/lot/features/LotEasementModel';
import LotDrivewayModel from '../../../model/lot/features/LotDrivewayModel';
import LotTruncationModel from '../../../model/lot/features/LotTruncationModel';
import LotTruncationView from './LotTruncationView';


export default class LotFeaturesView extends PIXI.Sprite {

	/**
	 * @param model {LotFeaturesModel}
	 * @param pathView {LotPathView}
	 * @param easementTheme {LabeledPolygonTheme}
	 * @param envelopeTheme {LabeledPolygonTheme}
	 */
	constructor(model, pathView, easementTheme, envelopeTheme)
	{
		super();

		/**
		 * @type {LotFeaturesModel}
		 * @private
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.ADDED, this.onFeatureAdded, this);

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._easementTheme		= easementTheme;

		/**
		 * @type {LabeledPolygonTheme}
		 * @private
		 */
		this._envelopeTheme		= envelopeTheme;

		/**
		 * @type {LotPathView}
		 * @private
		 */
		this._pathView = pathView;

		/**
		 * @type {Array<LotEasementView>}
		 * @private
		 */
		this._specialEasements	= [];

		/**
		 * @type {Array<LotDrivewayView>}
		 * @private
		 */
		this._driveways	= [];
		
		/**
		 * @type {Array<LotTruncationView>}
		 * @private
		 */
		this._truncations = [];

		/**
		 * Parallel easements
		 * @type {InnerPathView}
		 * @private
		 */
		this._parallelEasementsView	= new InnerPathView(
			this._model.parallelEasements,
			new EasementRenderer(),
			this._easementTheme
		);
		this.addChild(this._parallelEasementsView);

		/**
		 * Build Envelopes
		 * @type {InnerPathView}
		 * @private
		 */
		this._envelopeView = new InnerPathView(
			this._model.envelopes,
			new EnvelopeRenderer(),
			this._envelopeTheme
		);
		this.addChild(this._envelopeView);
	}

	/**
	 * @return {LotFeaturesModel}
	 */
	get model()		{ return this._model; }

	/**
	 * @returns {LabeledPolygonTheme}
	 */
	get easementTheme() { return this._easementTheme; }

	/**
	 * @returns {LabeledPolygonTheme}
	 */
	get envelopeTheme() { return this._envelopeTheme; }

	/**
	 * @return {Array<LotEasementView>}
	 */
	get specialEasements()	{ return this._specialEasements; }

	/**
	 * @returns {InnerPathView}
	 */
	get parallelEasements() { return this._parallelEasementsView; }

	/**
	 * @param event {DataEvent}
	 */
	onFeatureAdded(event)
	{
		let feature = event.data;

		if (feature.type === LotEasementModel.ANGLED ||
			feature.type === LotEasementModel.BLOCK ||
			feature.type === LotEasementModel.EXTERNAL) {
			const view = new LotEasementView(
				event.data,
				this._pathView.viewOf(this._model.lastEasement.reference),
				this._easementTheme
			);

			view.addListener(EventBase.REMOVED, this.easementRemoved);
			this._specialEasements.push(view);
			this.addChild(view);
		}	else if (feature.type === LotDrivewayModel.TYPE) {
			const driveway = new LotDrivewayView(
				event.data
			);

			driveway.addListener(EventBase.REMOVED, this.drivewayRemoved);
			this._driveways.push( driveway );
			this.addChild(driveway);
		}	else if (feature.type === LotTruncationModel.TYPE) {
			const truncation = new LotTruncationView(
				event.data,
				this._easementTheme
			);

			truncation.addListener(EventBase.REMOVED, this.truncationRemoved);
			this._truncations.push(truncation);
			this.addChild(truncation);
		}
	}

	easementRemoved(container) { container.removeEasement(this); }
	removeEasement(easement) {
		easement.removeListener(EventBase.REMOVED, this.easementRemoved);
		this._specialEasements.splice(this._specialEasements.indexOf(easement), 1);
	}

	drivewayRemoved(container) { container.removeDriveway(this); }
	removeDriveway(driveway) {
		driveway.removeListener(EventBase.REMOVED, this.drivewayRemoved);
		this._driveways.splice(this._driveways.indexOf(driveway), 1);
	}

	truncationRemoved(container) { container.removeTruncation(this); }
	removeTruncation(truncation) {
		truncation.removeListener(EventBase.REMOVED, this.truncationRemoved);
		this._truncations.splice(this._truncations.indexOf(truncation), 1);
	}
}