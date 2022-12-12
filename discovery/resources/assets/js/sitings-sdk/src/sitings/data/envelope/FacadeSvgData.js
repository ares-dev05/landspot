import FacadeSvgParser from './FacadeSvgParser';
import HouseModel from '../../model/house/HouseModel';
import HouseLayerType from '../../model/house/HouseLayerType';


export default class FacadeSvgData extends FacadeSvgParser {

	/**
	 * the ruler has 10 meters = 10000 mm
	 * @returns {number}
	 */
	static get RULER_LENGTH_MM() { return 10000; }

	/**
	 *
	 * @param node {Element}
	 */
	constructor (node) {
		super(node.getElementsByTagName('svg')[0].textContent);

		/**
		 * @type {string}
		 * @public
		 */
		this.id = node.getAttribute('id');

		/**
		 * @type {string}
		 * @public
		 */
		this.name = node.getAttribute('name').toUpperCase();

		/**
		 * @type {number}
		 * @private
		 */
		this._toMm = 200;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get toMm() {
		return this._toMm;
	}

	/**
	 * @param id {string}
	 * @return {null|*}
	 * @public
	 */
	getFacade(id) {
		return this.facades.find(facade => facade.id === id) || null;
	}

	onAfterParse() {
		super.onAfterParse();
		if (this.ruler) {
			// find the toMm constant by processing the ruler
			//TODO: FLASH PLAYER - requires other variables in the constructor
			const rulerLayer = new HouseModel(this.ruler, HouseLayerType.FACADE, 1000);

			// warning messages
			if (rulerLayer.edges.length > 1) {

			}	else if (!rulerLayer.edges.length) {
				this._toMm = 200;
			}

			if (rulerLayer.edges.length) {
				this._toMm = FacadeSvgData.RULER_LENGTH_MM / rulerLayer.edges[0].length;
			}
		}	else {
			this._toMm = 200;
		}
	}
}