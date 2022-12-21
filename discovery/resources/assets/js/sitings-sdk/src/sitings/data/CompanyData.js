import ChangeDispatcher from '../../events/ChangeDispatcher';
import KeyboardLayer from '../global/KeyboardLayer';
import EventBase from '../../events/EventBase';
import {RangeData} from './RangeData';
import CatalogueMetaData from './henley/meta/CatalogueMetaData';
import XMLHouseData from './henley/XMLHouseData';

const RANGE_NAME_TYPE_SEP = ' - ';

export default class CompanyData extends ChangeDispatcher {

	/**
	 * @param data {string}
	 * @param asynchronous {boolean} If synchronous, the full house data is loaded at the beginning for the entire catalogue.
	 * 		 If asynchronous, only the house ID and names are loaded at the beginning,
	 * 		 the house SVG and area data are loaded when needed.
	 * @param context {*}
	 */
	constructor(data, asynchronous=false, context=null)
	{
		super(context);

		/**
		 * @type {Array.<RangeData>}
		 * @public
		 */
		this.ranges = [];

		/**
		 * @type {Array}
		 * @private
		 */
		this._loading = [];
		/**
		 * @type {boolean} If synchronous, the full house data is loaded at the beginning for the entire catalogue.
		 * 		 If asynchronous, only the house ID and names are loaded at the beginning,
		 * 		 the house SVG and area data are loaded when needed.
		 * @private
		 */
		this._asynchronous = asynchronous;
		/**
		 * @type {Function}
		 * @private
		 */
		this._progressCb	= null;

		/**
		 * @type {CatalogueMetaData}
		 * @private
		 */
		this._henleyMeta	= null;

		if (data) {
			/**
			 * @type {Document}
			 * @private
			 */
			this._document = new DOMParser().parseFromString(data, 'text/xml');

			const companyData = this._document.getElementsByTagName('companyData');

			if (companyData && companyData[0] && companyData[0].hasAttribute('format') && companyData[0].getAttribute('format').toString() === 'XML') {
				this.readHenleyDataFormat();
			}	else {
				this.readCompanyData();
			}
		}
	}

	readCompanyData() {
		/**
		 * <company id=""> node
		 * @type {Node}
		 * @private
		 */
		this._rootNode = this._document.getElementsByTagName('company')[0];

		/**
		 * @type {number}
		 * @public
		 */
		this.id = parseInt(this._rootNode.getAttribute('id'));

		// Fetch all the house ranges
		const ranges = this._rootNode.getElementsByTagName('range');
		for (let i = 0; i < ranges.length; ++i) {
			let rangeData = new RangeData(ranges[i], this.asynchronous);
			rangeData.addEventListener(EventBase.COMPLETE, this.rangeLoadComplete, this);

			this.ranges.push(rangeData);

			// If the company data is synchronous, it all needs to be parsed at the beginning
			if (this.synchronous) {
				this._loading.push(rangeData);
			}
		}
	}

	readHenleyDataFormat()
	{
		const metaNode = this._document.getElementsByTagName('meta')[0];

		if (metaNode) {
			this._henleyMeta = new CatalogueMetaData(metaNode.textContent);
		}	else {
			return;
		}

		let rangeIdAutoIncrement = 1;
		let addedHouses			 = [];

		// start reading the houses
		let houseList			 = this._document.getElementsByTagName('house');

		for (let i=0; i<houseList.length; ++i) {
			const houseNode = houseList[i];

			try {
				const homeCollection = houseNode.getElementsByTagName('homeCollection')[0];
				const rangeName = homeCollection.getAttribute('collectionName').toString();
				const houseName = homeCollection.getElementsByTagName('homeType')[0].getAttribute('name').toString();
				let houseRange, houseData, houseAdded = false;

				// validate that the house and its range does exist
				const rangeList = this._henleyMeta.fetchRanges(rangeName);
				for (let range=0; range<rangeList.length; ++range) {
					const rangeData = rangeList[range];
					if (rangeData.hasHouse(houseName)) {
						const rangeFullName = rangeData.name + RANGE_NAME_TYPE_SEP + rangeData.type;
						// Search for a range with this name in the list of existing ranges.
						houseRange = this.ranges.find(
							range => range.name.toLowerCase() === rangeFullName.toLowerCase()
						);

						if (!houseRange) {
							houseRange		= new RangeData(null);
							houseRange.id	= rangeIdAutoIncrement++;
							houseRange.name	= rangeFullName;

							this.ranges.push(houseRange);
						}

						// create the house and add it to its range
						houseData = new XMLHouseData(
							// XML data
							homeCollection.getElementsByTagName('homeType')[0],
							// House Metadata - indicates allowed facades
							rangeData.fetchHouse(houseName),
							// range name
							rangeData.logoId
						);

						houseRange.houses.push(houseData);
						houseAdded = true;
						addedHouses.push(houseData.name.toUpperCase());

						break;
					}
				}
			}	catch (e) {
				// there was an error parsing this house node
			}
		}

		addedHouses.sort();
		console.log('Full Houses List:\n'+addedHouses.join('\n'));

		// sort the ranges by name
		this.ranges.sort(CompanyData.rangeCompare);
	}

	/**
	 * @private
	 * @param A
	 * @param B
	 * @returns {number}
	 */
	static rangeCompare(A, B)
	{
		const pa = A.name.split(RANGE_NAME_TYPE_SEP);
		const pb = B.name.split(RANGE_NAME_TYPE_SEP);

		// ASC order for names
		if (pa[0] < pb[0]) return -1;
		if (pa[0] > pb[0]) return  1;

		// DESC order for types (so 'Single Storey' is shown before 'Double Storey' for the same range)
		if (pa[1] > pb[1]) return -1;
		if (pa[1] < pb[1]) return  1;

		return 0;
	}

	/**
	 * @return {boolean}
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
		for (let rIndx=0, hData; rIndx<this.ranges.length; ++rIndx)
		{
			hData = this.ranges[rIndx].getHouseData(id);
			if ( hData ) {
				return hData;
			}
		}

		return null;
	}

	/**
	 * @param progressCb {Function}
	 */
	parse(progressCb)
	{
		this._progressCb	= progressCb;
		this.loadNextRange();
	}

	/**
	 * @return {number}
	 */
	get percentDone()
	{
		let loaded=0, total=0, i;

		for (i=0; i<this.ranges.length; ++i)
		{
			// loaded += ranges[i].percentDone;
			loaded += this.ranges[i].loadedHouses;
			total  += this.ranges[i].totalHouses;
		}

		return total ? ( loaded / total ) : 1;
	}

	/**
	 * @param e {EventBase}
	 */
	rangeLoadComplete()
	{
		if (!this._loading.length) {
			this.dispatchEvent(new EventBase(EventBase.COMPLETE));
		}	else {
			if (!this._asynchronous || KeyboardLayer.i.altPressed) {
				this.loadNextRange();
			}
		}
	}

	loadNextRange()
	{
		while (this._loading.length && this._loading[0].loaded) {
			this._loading.shift();
		}

		if (this._loading.length) {
			this._loading.shift().parse();
		}	else {
			this.rangeLoadComplete();
		}
	}
}
