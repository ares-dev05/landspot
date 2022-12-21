import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import StructureRectangleView from './StructureRectangleView';
import StructurePointView from './StructurePointView';
import StructureRectangle from '../../model/structure/StructureRectangle';

export default class StructuresView extends PIXI.Sprite {

	/**
	 * @param model {StructuresLayerModel}
	 */
	constructor(model)
	{
		super();

		/**
		 * @type {StructuresLayerModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.ADDED, this.structureAdded, this);
	}

	/**
	 * @param e {EventBase}
	 */
	structureAdded(e)
	{
		const model = this._model.lastStructure;
		let   view;
		if ( !model ) {
			return;
		}

		if (model.dataType===StructureRectangle.DATA_TYPE) {
			view = new StructureRectangleView(model);
		}	else {
			view = new StructurePointView(model);
		}

		if (view) {
			this.addChild(view);
		}
	}
}