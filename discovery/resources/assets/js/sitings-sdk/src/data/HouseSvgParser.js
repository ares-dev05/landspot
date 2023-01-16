import MeasuredSvgParser from './MeasuredSvgParser';
import Logger from '../utils/Logger';
import AreaData from './AreaData';
import EventBase from '../events/EventBase';

export default class HouseSvgParser extends MeasuredSvgParser
{
	/**
	 * @return {string[]}
	 * @private
	 */
	static get FACADE_BOUNDARY() { return ['facade_boundary']; }
	/**
	 * @return {string[]}
	 * @private
	 */
	static get FACADE_GARAGE() { return ['facade_garage']; }
	/**
	 * @return {string[]}
	 * @private
	 */
	static get FACADE_GARAGE_FRONT() { return ['facade_carentry'];}
	/**
	 * @return {string[]}
	 * @private
	 */
	static get FACADE_PORCH()	{ return ['facade_porch_area']; }
	/**
	 * @return {string[]}
	 * @private
	 */
	static get FACADE_ALFRESCO()	{ return ['facade_alfresco_area']; }

	/**
	 * @param search {string}
	 * @param prefixList {string[]}
	 * @return {boolean}
	 */
	static hasPrefix(search, prefixList) {
		return prefixList.find( prefix => search.indexOf(prefix)===0 ) !== undefined;
	}

	static get FACADE_PREFIX() { return 'facade'; }
	static get OPTION_PREFIX() { return 'option'; }
	static get RULER_NAME() { return 'ruler'; }

	static get ROOF_PREFIX() { return 'roof'; }
	static get OPTION_ROOF_PREFIX() { return 'option_roof'; }
	static get OPTION_ROOF_PREFIX_X5F() { return 'option_x5f_roof'; }
	static get OPTION_ROOF_PREFIX_2() { return 'roof_option'; }
	static get OPTION_ROOF_PREFIX_2_X5F() { return 'roof_x5f_option'; }


	/**
	 * @param id {string}
	 * @param name {string|null}
	 * @param houseData {string|null}
	 * @param areaData {string|null}
	 * @param asynchronous {boolean}
	 */
	constructor(id, name, houseData, areaData=null, asynchronous=false)
	{
		super(houseData, asynchronous);

		/**
         * @type {string}
         * @private
         */
		this._id            = id;
        /**
         * @type {string}
         * @private
         */
        this._name          = name;

        /**
         * @type {SVGG[]}
         * @private
         */
        this._facades       = [];

		/**
		 * Metadata Facade Boundary
		 * @type {SVGG[]}
		 * @private
		 */
		this._facadeBoundaries = [];
		/**
		 * Metadata Facade Garage
		 * @type {SVGG[]}
		 * @private
		 */
		this._facadeGarages = [];
		/**
		 * Metadata Facade Garage Fronts
		 * @type {SVGG[]}
		 * @private
		 */
		this._facadeGarageFronts = [];
		/**
		 * Metadata Facade Porches
		 * @type {SVGG[]}
		 * @private
		 */
		this._facadePorches		= [];
		/**
		 * Metadata Facade Alfresco
		 * @type {SVGG[]}
		 * @private
		 */
		this._facadeAlfresco	= [];

        /**
         * @type {SVGG[]}
         * @private
         */
        this._options       = [];
		/**
		 * @type {SVGG[]}
		 * @private
		 */
		this._roofs			= [];
        /**
         * @type {AreaData[]}
         * @private
         */
        this._facadeAreas   = [];
        /**
         * @type {AreaData[]}
         * @private
         */
        this._optionAreas   = [];
        /**
         * @type {{}}
         * @private
         */
        this._areaData      = {};

        if (areaData) {
			this._parseAreaData(areaData);
		}
	}

	/**
	 * @param data
	 * @public
	 */
	loadAndParse(data) {
		if (this.parseStarted) {
			if (this.parseFinished) {
				this._dispatchParseComplete();
			}

			return;
		}

		if (data) {
			// parse the XML data and fetch the house element
			let element;
			try {
				element = new DOMParser()
					.parseFromString(data, 'text/xml')
					.getElementsByTagName('house')[0];
			}	catch (e) {
				// don't keep the UI hanging in case of parsing errors
				this._dispatchParseComplete();
			}

			if (element && element.getAttribute('id') === this.id) {
				// fetch the house & area data from the XML node
				if (element.getElementsByTagName('area').length > 0) {
					this._parseAreaData(
						element.getElementsByTagName('area')[0].textContent
					);
				}

				if (element.getElementsByTagName('svg').length > 0 &&
					element.getElementsByTagName('svg')[0].textContent.length > 0) {
					this._metaData = element.getElementsByTagName('svg')[0].textContent;
					// start parsing the house data
					this.parse();
				}	else {
					// don't keep the UI hanging in case of parsing errors
					this._dispatchParseComplete();
				}
			}
		}	else {
			this._dispatchParseComplete();
		}
	}

	/**
	 * @private
	 */
	_dispatchParseComplete() {
		this.dispatchEvent(new EventBase(EventBase.COMPLETE, this));
	}

	/**
	 * @param rawAreaData {string}
	 * @private
	 */
	_parseAreaData(rawAreaData) {
		if (rawAreaData && rawAreaData.length > 0) {
			try {
				let data = JSON.parse(rawAreaData).area;
				if (data.facades || data.options) {
					data = [...data.facades, ...data.options].reduce((accumulator, area) => {
						const areaId = area.id;
						delete area.id;
						delete area.name;
						delete area.visible;
						delete area.selected;
						accumulator[areaId] = {...area};
						return accumulator;
					}, {});
				}

				this._areaData = data;
			}	catch (e) {
				Logger.logStack('Error: can\'t parse area data for house '+this.name+'; data='/*+areaData*/);
			}
		}
	}

    /**
     * @return {string}
     */
	get id()            	{ return this._id; }
	/**
	 * @param value {string}
	 */
	set id(value)		{ this._id = value; }

    /**
     * @return {string}
     */
    get name()          	{ return this._name; }
	/**
	 * @param value {string}
	 */
	set name(value)	{ this._name = value; }

    /**
     * @return {SVGG[]}
     */
    get facades()       	{ return this._facades; }

	/**
	 * @return {SVGG[]}
	 */
    get facadeBoundaries()  { return this._facadeBoundaries; }

	/**
	 * @return {SVGG[]}
	 */
	get facadeGarages()     { return this._facadeGarages; }

	/**
	 * @return {SVGG[]}
	 */
	get facadeGarageFronts(){ return this._facadeGarageFronts; }

	/**
	 * @return {SVGG[]}
	 */
	get facadePorches() 	{ return this._facadePorches; }

	/**
	 * @return {SVGG[]}
	 */
	get facadeAlfresco()	{ return this._facadeAlfresco; }

    /**
     * @return {SVGG[]}
     */
	get options()       	{ return this._options; }

	/**
	 * @return {SVGG[]}
	 */
	get roofs()				{ return this._roofs;	}

    /**
     * @return {AreaData[]}
     */
	get facadeAreas()   	{ return this._facadeAreas; }

    /**
     * @return {AreaData[]}
     */
	get optionAreas()   	{ return this._optionAreas; }

	/**
	 * @param group {SVGG}
	 * @returns {AreaData}
	 */
	getFacadeArea(group)
	{
		let index = this._facades.indexOf(group);
		return index!==-1 ? this._facadeAreas[index] : new AreaData();
	}

	/**
	 * @param facadeGroup {SVGG}
	 * @return {null|SVGG}
	 */
	getFacadeBoundary(facadeGroup) {
		if (!facadeGroup || !facadeGroup.id) {
			return null;
		}

		const facadeName = HouseSvgParser.cleanID(facadeGroup.id);
		const facadeBoundary = this._facadeBoundaries.find(
			boundary => HouseSvgParser.cleanID(boundary.id) === facadeName
		);

		return facadeBoundary === undefined ? null : facadeBoundary;
	}

	/**
	 * @param facadeGroup {SVGG}
	 * @return {null|SVGG}
	 */
	getFacadeGarage(facadeGroup) {
		if (!facadeGroup || !facadeGroup.id) {
			return null;
		}

		const facadeName = HouseSvgParser.cleanID(facadeGroup.id);
		const facadeGarage = this._facadeGarages.find(
			garage => HouseSvgParser.cleanID(garage.id) === facadeName
		);

		return facadeGarage === undefined ? null : facadeGarage;
	}

	/**
	 * @param facadeGroup {SVGG}
	 * @return {null|SVGG}
	 */
	getFacadeGarageFront(facadeGroup) {
		if (!facadeGroup || !facadeGroup.id) {
			return null;
		}

		const facadeName = HouseSvgParser.cleanID(facadeGroup.id);
		const garageFront = this._facadeGarageFronts.find(
			front => HouseSvgParser.cleanID(front.id) === facadeName
		);

		return garageFront === undefined ? null : garageFront;
	}

	/**
	 * @param group {SVGG}
	 * @returns {AreaData}
	 */
	getOptionArea(group)
	{
		let index = this._options.indexOf(group);
		return index!==-1 ? this._optionAreas[index] : new AreaData();
	}

	/**
     * Once the SVG parse completes, analyze its structure to identify the house elements
     * @override
     */
	onAfterParse()
	{
		for (let i=0; i<this.groups.length; ++i) {
			const group = this.groups[i];

			if (!group || !group.id) {
				continue;
			}

			const id = HouseSvgParser.cleanID(group.id);

			// @TODO: streamline this if/else block

			// Meta Layers
			if (HouseSvgParser.hasPrefix(id, HouseSvgParser.FACADE_BOUNDARY)) {
				this._facadeBoundaries.push(group);
			}
			else if (HouseSvgParser.hasPrefix(id, HouseSvgParser.FACADE_GARAGE)) {
				this._facadeGarages.push(group);
			}
			else if (HouseSvgParser.hasPrefix(id, HouseSvgParser.FACADE_GARAGE_FRONT)) {
				this._facadeGarageFronts.push(group);
			}
			else if (HouseSvgParser.hasPrefix(id, HouseSvgParser.FACADE_PORCH)) {
				this._facadePorches.push(group);
			}
			else if (HouseSvgParser.hasPrefix(id, HouseSvgParser.FACADE_ALFRESCO)) {
				this._facadeAlfresco.push(group);
			}
			// Data Layers
			else if ( id.search(HouseSvgParser.FACADE_PREFIX)===0 ) {
                // add the facade to the list
                this._facades.push(group);
                // add area information for this facade if it's available
                this._facadeAreas.push( AreaData.fromObject(this._areaData[id]) );
            }
            else if ( id.search(HouseSvgParser.OPTION_PREFIX)===0 ) {
				// add the option to the list
				this._options.push(group);
				// add area information for this option if it's available
				this._optionAreas.push(AreaData.fromObject(this._areaData[id]));
			}
            else if ( id.search(HouseSvgParser.ROOF_PREFIX)===0) {
				// add the roof to the list
				this._roofs.push(group);
            }

            else if ( id.search(HouseSvgParser.RULER_NAME)===0 ) {
                this.setupRuler( group );
            }
        }
	}

	/**
	 * @param svgID {string}
	 * @return {string}
	 */
	static cleanID(svgID) { return svgID.toLowerCase().replace(/x5f_/gi,''); }

	/**
	 * Converts the ID of a house element to a user-friendly name by replacing underlines with spaces
	 * @param id {string} the id of the element in the SVG
	 * @return {string} a user-friendly name
	 */
	static elementNameFromId(id)
	{
		if (!id) {
			return id;
		}

		id = HouseSvgParser.cleanID(id);

		const prefixes = [
			// Meta
			...HouseSvgParser.FACADE_BOUNDARY,
			...HouseSvgParser.FACADE_GARAGE,
			...HouseSvgParser.FACADE_GARAGE_FRONT,
			...HouseSvgParser.FACADE_PORCH,
			...HouseSvgParser.FACADE_ALFRESCO,
			// Data
			HouseSvgParser.FACADE_PREFIX,
			HouseSvgParser.OPTION_PREFIX,
		];

		// Find the correct prefix
		for (let i=0; i<prefixes.length; ++i) {
			const prefix = prefixes[i];

			if (id.search(prefix) === 0) {
				id = id.substr(prefix.length + 1);
				break;
			}
		}

		return id.toUpperCase().replace(/_/gi, ' ');
	}

	/**
	 * @param name {string}
	 * @return {string[]}
	 */
	static getRoofNamesFor(name)
	{
		name = name.toLowerCase();
		if ( name.search(HouseSvgParser.FACADE_PREFIX) !== -1 ) {
			return [
				name.split(
					HouseSvgParser.FACADE_PREFIX
				).join(
					HouseSvgParser.ROOF_PREFIX
				).toLowerCase()
			];
		}
		if ( name.search(HouseSvgParser.OPTION_PREFIX) !== -1 )
		{
			return [
				name.replace(
					HouseSvgParser.OPTION_PREFIX, HouseSvgParser.OPTION_ROOF_PREFIX_X5F
				).toLowerCase(),

				name.replace(
					HouseSvgParser.OPTION_PREFIX, HouseSvgParser.OPTION_ROOF_PREFIX_2_X5F
				).toLowerCase()
			];
		}

		return ['UNKNOWN_ROOF_NAME'];
	}

	cleanup()
	{
		this._id		= '';
        this._name		= '';
        this._facades	= null;
        this._options	= null;
		super.cleanup();
	}
}