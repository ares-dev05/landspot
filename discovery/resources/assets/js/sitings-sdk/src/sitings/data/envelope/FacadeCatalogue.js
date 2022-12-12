import ChangeDispatcher from '../../../events/ChangeDispatcher';
import FacadeSvgData from './FacadeSvgData';
import KeyboardLayer from '../../global/KeyboardLayer';
import EventBase from '../../../events/EventBase';

export default class FacadeCatalogue extends ChangeDispatcher {

	/**
	 * @param node {XMLDocument}
	 */
	constructor (node) {
		super();

		/**
		 * @type {[FacadeSvgData]}
		 * @public
		 */
		this.houses = [];

		/**
		 * @type {boolean}
		 * @private
		 */
		this._manualParsing = false;

		/**
		 * @type {[]}
		 * @private
		 */
		this._loading = [];

		const hList = node.getElementsByTagName('house');

		let houseData;

		for (let hNode of hList) {
			this.houses.push(houseData = new FacadeSvgData(hNode));
			this._loading.push(houseData);
			houseData.addEventListener( EventBase.COMPLETE, this.houseDataComplete, this);
		}
	}

	/**
	 * @return {boolean}
	 * @public
	 */
	get manualParsing() {
		return this._manualParsing;
	}

	/**
	 * @param v {boolean}
	 * @public
	 */
	set manualParsing(v) {
		this._manualParsing = v;
	}

	/**
	 * @param id {number}
	 * @return {null|FacadeSvgData}
	 * @public
	 */
	getHouseData(id) {
		return this.houses.find(house => Number(house.id) === id) || null;
	}

	/**
	 * @public
	 */
	parse() {
		this.loadNextHouse();
	}

	/**
	 * @public
	 * @return {number}
	 */
	get percentDone() {
		return this.houses.length ? ((this.houses.length - this._loading.length) / this.houses.length) : 1;
	}

	/**
	 * @public
	 * @return {boolean}
	 */
	get loaded() {
		return !this._loading.length;
	}

	/**
	 * @public
	 * @return {number}
	 */
	get loadedHouses() {
		return this.houses.length - this._loading.length;
	}

	/**
	 * @public
	 * @return {number}
	 */
	get totalHouses() {
		return this.houses.length;
	}

	/**
	 * @private
	 */
	houseDataComplete() {
		if (!this._loading.length)
		{
			dispatchEvent(new EventBase(EventBase.COMPLETE, this));
		}
		else {
			if (!this._manualParsing || KeyboardLayer.i.altPressed) {
				this.loadNextHouse();
			}
		}
	}

	/**
	 * @private
	 */
	loadNextHouse() {
		while (this._loading.length && this._loading[0].parseFinished){
			this._loading.shift();
		}

		if (!this._loading.length) {
			this.houseDataComplete();
		}	else {
			this._loading.shift().parse();
		}
	}
}
