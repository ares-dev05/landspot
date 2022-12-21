import XMLStructureReader from './XMLStructureReader';
import XMLHouseOption from './XMLHouseOption';
import XMLHouseFacade from './XMLHouseFacade';
import XMLHouseStructure from './XMLHouseStructure';
import AreaData from '../../../data/AreaData';
import HouseData from '../../data/HouseData';
import Geom from '../../../utils/Geom';

export default class XMLHouseData extends HouseData {

	/**
	 * @param element {Element}
	 * @param meta {HouseMetaData}
	 * @param logoId {string}
	 */
	constructor(element, meta, logoId)
	{
		super(null);

		/**
		 * @type {HouseMetaData}
		 */
		this.metaData	 = meta;
		/**
		 * @type {Element}
		 */
		this.data		 = element;

		/**
		 * @type {string}
		 */
		this.id			 = this.metaData.id;
		/**
		 * @type {string}
		 */
		this.name		 = this.metaData.name;
		/**
		 * @type {string}
		 */
		this.rangeLogoId = logoId;

		/**
		 * @type {XMLHouseFacade[]}
		 */
		this.xmlFacades	 = [];

		/**
		 * @type {XMLHouseOption[]}
		 */
		this.xmlOptions	 = [];

		/**
		 * @type {{}}
		 */
		this.facadeNameMap = {};

		// First we need to parse the XML format so that the facade/options/garages are fetched
		this.parseFormat();

		/**
		 * We initialize the reader,
		 * @type {XMLStructureReader}
		 */
		this.reader		= new XMLStructureReader(this, this.metaData);
	}

	// no parsing is needed for the XML format houses
	get parseFinished() 	{ return true; }
	get isXMLFormat()		{ return true; }

	/**
	 * @param group {SVGG}
	 * @return {AreaData}
	 */
	getFacadeArea(group)	{ return new AreaData(); }
	/**
	 * @param group {SVGG}
	 * @return {AreaData}
	 */
	getOptionArea(group)	{ return new AreaData(); }

	/**
	 * @protected
	 */
	parseFormat()
	{
		this.xmlFacades		= [];
		this.xmlOptions		= [];
		this.facadeNameMap	= {};

		// start by parsing the options
		const optionList = this.data.getElementsByTagName('option');
		for (let i=0; i<optionList.length; ++i) {
			this.xmlOptions.push(
				new XMLHouseOption(optionList[i])
			);
		}

		// Parse the facade outlines
		const facadeList = this.data.getElementsByTagName('outline');
		for (let i=0; i<facadeList.length; ++i) {
			let facadeName = facadeList[i].getAttribute('facade'), facade;

			// confirm that the metadata allows this facade
			if (this.metaData.hasFacade(facadeName)) {
				// if a facade with this name doesn't exist yet, create it
				if (this.facadeNameMap.hasOwnProperty(facadeName.toLowerCase()) ) {
					// facade already exists, fetch it
					facade = this.facadeNameMap[facadeName.toLowerCase()];
				}	else {
					// create it now
					facade = this.facadeNameMap[facadeName.toLowerCase()] = new XMLHouseFacade(facadeName);
					// add it to our facade list
					this.xmlFacades.push(facade);
				}

				facade.stories.push( new XMLHouseStructure(facadeList[i]) );
			}
		}

		// parse the facade garages; by this point, all the facades should have been loaded
		const garageList = this.data.getElementsByTagName('garage');
		for (let i=0; i<garageList.length; ++i) {
			if (garageList[i] && garageList[i].getAttribute('facade')) {
				let facadeName = garageList[i].getAttribute('facade').toLowerCase();

				if (this.facadeNameMap.hasOwnProperty(facadeName)) {
					(this.facadeNameMap[facadeName]).garage = new XMLHouseStructure(garageList[i]);
				}
			}
		}

		// calculate the bounds for all the facades, and also for the overall house
		let	left=Infinity, top=Infinity, right=-Infinity, bottom=-Infinity;

		this.xmlFacades.forEach((facade) => {
			facade.calculateBounds();

			left	= Math.min(left  , facade.left);
			top		= Math.min(top   , facade.top);
			right	= Math.max(right , facade.right);
			bottom	= Math.max(bottom, facade.bottom);
		});

		// determine if this house is vertical
		if (Math.abs(bottom-top) > Math.abs(right-left)) {

			// rotate the facades & the options 90 degrees
			this.xmlFacades.forEach((facade) => {
				facade.rotate(Geom.origin, Math.PI/2);
				facade.calculateBounds();
			});
			this.xmlOptions.forEach((option) => {
				option.rotate(Geom.origin, Math.PI/2);
			});
		}
	}

	/**
	 * @param name {string}
	 * @returns {null|XMLHouseFacade}
	 */
	getXmlFacade(name)
	{
		for (let i=0; i<this.xmlFacades.length; ++i) {
			if (this.xmlFacades[i].name===name) {
				return this.xmlFacades[i];
			}
		}
		return null;
	}

	/**
	 * @param name {string}
	 * @returns {null|XMLHouseOption}
	 */
	getXmlOption(name)
	{
		for (let i=0; i<this.xmlOptions.length; ++i) {
			if (this.xmlOptions[i].name===name) {
				return this.xmlOptions[i];
			}
		}
		return null;
	}

	/**
	 * @protected
	 */
	onAfterParse()
	{
		console.log('\tHouse.Parsing '+this.name);
		super.onAfterParse();
	}
}