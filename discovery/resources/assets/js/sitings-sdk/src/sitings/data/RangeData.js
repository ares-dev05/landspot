import HouseData from './HouseData';
import ChangeDispatcher from '../../events/ChangeDispatcher';
import EventBase from '../../events/EventBase';
import AccountMgr from './AccountMgr';

export class RangeData extends ChangeDispatcher {

	/**
	 * @returns {number}
	 */
	static get ORBIT_URBANE_HOMES_ID() { return 196; }

	/**
	 * @returns {string}
	 */
	static get ORBIT_URBANE_HOMES_LOGO() { return 'company_logos/urbane-homes-logo.svg';}

	/**
	 * @param rangeNode {Node}
	 * @param asynchronous {boolean} If synchronous, the full house data is loaded at the beginning for the entire catalogue.
	 * 		 If asynchronous, only the house ID and names are loaded at the beginning,
	 * 		 the house SVG and area data are loaded when needed.
	 * @param context {*}
	 */
	constructor(rangeNode, asynchronous= false, context=null)
	{
		super(context);

		/**
		 * @type {number}
		 */
		this.id = 0;

		/**
		 * @type {string}
		 */
		this.name = '';

		/**
		 * @type {boolean} If synchronous, the full house data is loaded at the beginning for the entire catalogue.
		 *         If asynchronous, only the house ID and names are loaded at the beginning,
		 *         the house SVG and area data are loaded when needed.
		 * @private
		 */
		this._asynchronous = asynchronous;

		/**
		 * @type {Array<HouseData>}
		 */
		this.houses = [];

		/**
		 * @type {Array<HouseData>}
		 */
		this._loading = [];

		// Henley ranges are processed in the CompanyData; rangeNode will be null
		if (rangeNode) {
			this.id = parseInt(rangeNode.getAttribute('id'));
			this.name = rangeNode.getAttribute('name').toString().toUpperCase();

			// Fetch the entire list of houses in this range
			const houseList = rangeNode.getElementsByTagName('house');

			for (let i = 0; i < houseList.length; ++i) {
				/**
				 * @type {Element}
				 */
				let element = houseList[i];

				let svgContent, areaContent;

				// fetch the house & area data from the XML node
				if (element.getElementsByTagName('svg').length > 0) {
					svgContent = element.getElementsByTagName('svg')[0].textContent;
				}
				if (element.getElementsByTagName('area').length > 0) {
					areaContent = element.getElementsByTagName('area')[0].textContent;
				}

				// Skip Empty houses when in synchronous mode (i.e. the house data should be available now)
				if (this.synchronous && (!svgContent || svgContent.length === 0)) {
					continue;
				}

				/**
				 * The HouseData object will parse the SVG file and will group all of the available facades, options and rooflines.
				 * The parsed layers will contain all of the SVG elements read from the file.
				 *
				 * @type {HouseData}
				 */
				const houseData = new HouseData(
					element.getAttribute('id'),
					element.getAttribute('name'),
					svgContent,
					areaContent,
					asynchronous,
					// @hardcoded: For Orbit's Urbane Homes range, we want to use its specific logo
					this.id === RangeData.ORBIT_URBANE_HOMES_ID ? RangeData.ORBIT_URBANE_HOMES_LOGO : null
				);

				this.houses.push(houseData);

				// If this range is loaded at the beginning, add loading handling
				if (this.synchronous) {
					houseData.addEventListener(EventBase.COMPLETE, this.houseDataComplete, this);
					this._loading.push(houseData);
				}
			}
		}
	}

	/**
	 * @returns {string}
	 */
	get displayName() {
		return this.name + (
			AccountMgr.i.builder.usesXMLFormat ?
				' ('+this.houses.length+' plans)' :
				''
		);
	}

	/**
	 * @returns {boolean}
	 */
	get asynchronous() { return this._asynchronous; }

	/**
	 * @returns {boolean}
	 */
	get synchronous() { return !this._asynchronous; }

	/**
	 * @param id {number}
	 * @return {HouseData}
	 */
	getHouseData(id)
	{
		for (let hIndx=0; hIndx<this.houses.length; ++hIndx)
		{
			if (parseInt(this.houses[hIndx].id) === id )
				return this.houses[hIndx];
		}

		return null;
	}

	parse()
	{
		if (this.synchronous) {
			this.loadNextHouse();
		}
	}

	/**
	 * @return {number}
	 */
	get percentDone()
	{
		return this.houses.length ? ( ( this.houses.length-this._loading.length ) / this.houses.length ) : 1;
	}

	/**
	 * @return {boolean}
	 */
	get loaded()  { return !this._loading.length; }

	/**
	 * @return {number}
	 */
	get loadedHouses()  { return (this.houses.length - this._loading.length); }

	/**
	 * @return {number}
	 */
	get totalHouses()  { return this.houses.length; }

	/**
	 * @private
	 */
	houseDataComplete()
	{
		if (!this._loading.length) {
			this.dispatchEvent(new EventBase(EventBase.COMPLETE, this));
		} 	else {
			if (this.synchronous) {
				this.loadNextHouse();
			}
		}
	}

	loadNextHouse()
	{
		while (this._loading.length && this._loading[0].parseFinished) {
			this._loading.shift();
		}

		if (!this._loading.length) {
			this.houseDataComplete();
		} 	else {
			this._loading.shift().parse();
		}
	}
}
