import * as PIXI from 'pixi.js';
import StreetPointView from "./StreetPointView";
import StreetViewLabel from "./StreetViewLabel";

export default class StreetsDisplayView extends PIXI.Sprite
{
	/**
	 * @param model {StreetsModel}
	 * @param lotView {LotPathView}
	 */
	constructor(model, lotView)
	{
		super();

		/**
		 * @type {StreetsModel}
		 * @private
		 */
		this._model = model;

		/**
		 * Point views for the streets. These need to be in the same coordinate system as the lot
		 *
		 * @type {StreetPointView[]}
		 * @private
		 */
		this._views		= [];

		/**
		 * Label views for the streets. These will be in the lot-independent coordinate system of the Labels
		 *
		 * @type {StreetViewLabel[]}
		 * @private
		 */
		this._labels	= [];

		for (let i=0, street; i<this._model.streets.length; ++i) {
			street = this._model.streets[i];

			// Create the street view and add it to the display list; The street view itself will be empty,
			// but we're using to easily calculate transformations between the lot and the label coordinate systems
			const view  = new StreetPointView(street);
			this.addChild(view);
			this._views.push(view);

			// Create a street label view; this will be attached to the LabelViews instance of SitingsView
			this._labels.push(new StreetViewLabel(street, view, lotView));
		}
	}

	/**
	 * @returns {StreetViewLabel[]}
	 */
	get labels() { return this._labels; }
}