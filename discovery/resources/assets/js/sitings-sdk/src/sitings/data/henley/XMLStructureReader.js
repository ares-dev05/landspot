import XMLHenleyStructure from './XMLHenleyStructure';
import XMLHenleyFacade from './XMLHenleyFacade';
import XMLHenleyOption from './XMLHenleyOption';

export default class XMLStructureReader extends XMLHenleyStructure {

	/**
	 * @param data {XMLHouseData}
	 * @param metadata {HouseMetaData}
	 */
	constructor(data, metadata)
	{
		super();

		/**
		 * @type {XMLHouseData}
		 * @private
		 */
		this._data		= data;

		/**
		 * @type {HouseMetaData}
		 * @private
		 */
		this._metadata	= metadata;

		/**
		 * @type {XMLHenleyFacade[]}
		 * @private
		 */
		this._facades	= [];

		/**
		 * @type {XMLHenleyOption[]}
		 * @private
		 */
		this._options	= [];

		// Read the house structure and start organizing things a bit, so we know what can be selected and what can't
		// Add all the facade pieces and group them together
		for (let i=0; i<this._data.xmlFacades.length; ++i) {
			// check if this facade is a part of any facade that was already added
			const facadePiece = this._data.xmlFacades[i];
			const added = this.facades.find(
				facade => facade.addPiece(facadePiece)
			);

			if (!added) {
				// This is a new facade - create it
				this.facades.push(new XMLHenleyFacade(facadePiece));
			}
		}

		// add all the option pieces and group them together into coherent pieces
		for (let i=0; i<this._data.xmlOptions.length; ++i) {
			// check if this piece is a part of any option that was already added
			const optionPiece = this._data.xmlOptions[i];
			const added = this.options.find(
				option => option.addPiece(optionPiece)
			);

			if (!added) {
				// this is a new option - create it;
				const hOption = new XMLHenleyOption(optionPiece);
				// we must set the display name for this option
				hOption.displayName	= this._metadata.getOptionName(hOption.name);
				// add it to the list
				this.options.push(hOption);
			}
		}

		// collect names for all the facade options
		const facadeOptionNames = [];

		// add all the facade-specific options to their respective parents
		for (let indx=this.options.length-1; indx>=0; --indx) {
			const option = this.options[indx];

			for (let i=0; i<this.facades.length; ++i) {
				const facade = this.facades[i];
				if (facade.addOption(option)) {
					if (facadeOptionNames.indexOf(option.name)===-1) {
						facadeOptionNames.push(option.name);
					}
					// remove the option from the list
					this.options.splice(indx, 1);
					// update the option display name
					option.displayName	= this._metadata.getOptionName(option.name);
					// skip searching through the other facades
					break;
				}
			}
		}

		// go again through the options and remove the facade options that don't have associated facades
		// @MD 24OCT18 - also remove options without names
		for (let indx=this._options.length-1; indx>=0; --indx) {
			const option = this._options[indx];

			// remove options that are not listed in the Metadata file. This is equivalent to the options having been assigned a
			// NULL display name above
			if (option.displayName==null) {
				this._options.splice(indx, 1);
			}	else {
				// conditions: the option name should look like <facade>_<option>[_M] and <option> should be in the facadeOptionNames array
				const namePieces = option.name.split('_');
				if (namePieces.length>1 && facadeOptionNames.indexOf(namePieces[1])>=0) {
					// trace("removing option "+option.name+" as it doesn't have an associated facade");
					this.options.splice(indx, 1);
				}
			}
		}

		this._options = this._options.sort(XMLStructureReader.nameCompare);
		this._facades = this._facades.sort(XMLStructureReader.nameCompare);

		// fetch the facade + options sizes
		this.options.forEach(option => this.mergeBoundsWith(option));
		this.facades.forEach(facade => this.mergeBoundsWith(facade));
	}

	/***
	 * @param A {Object}
	 * @param B {Object}
	 * @returns {number}
	 * @private
	 */
	static nameCompare(A, B) {
		if (!A.hasOwnProperty('name') || !B.hasOwnProperty('name')) return 0;
		if (A.name < B.name) return -1;
		if (A.name > B.name) return  1;
		return 0;
	}

	/**
	 * @returns {XMLHenleyFacade[]}
	 */
	get facades() { return this._facades; }

	/**
	 * @returns {XMLHenleyOption[]}
	 */
	get options() { return this._options; }

	/**
	 * return all the available options for the indicated facade
	 */
	/**
	 * @param facade {XMLHenleyFacade}
	 * @returns {XMLHenleyOption[]}
	 */
	optionsForFacade(facade)
	{
		// trace("getting options for facade " +facade.name+", which has options: "+facade.options.length);

		if (facade && facade.options.length) {
			return facade.options.concat(this.options);
		}	else {
			return this.options;
		}
	}

	/**
	 * Returns true if the raw name indicates a mirrored structure
	 *
	 * @param rawName {string}
	 * @returns {boolean}
	 */
	static isMirrored(rawName)
	{
		return (rawName.toLowerCase().substr(-2)==='_m');
	}

	/**
	 * Parse a structure name by removing the _M suffix and optionally the facade prefix - when and if present
	 *
	 * @param rawName {string}
	 * @param parentFacade {string}
	 * @returns {string}
	 */
	static displayName(rawName, parentFacade='')
	{
		rawName = rawName.toLowerCase();
		parentFacade = parentFacade.toLowerCase();
		if (parentFacade.length && rawName.indexOf(parentFacade)>=0) {
			rawName = rawName.substr(
				rawName.indexOf(parentFacade)+parentFacade.length+1/*1 = underscore after the facade name*/
			);
		}

		if (XMLStructureReader.isMirrored(rawName) && rawName.length>2) {
			rawName = rawName.substr(0, rawName.length-2);
		}

		return rawName;
	}

	/**
	 * @param optionName {string}
	 * @param facadeName {string}
	 * @returns {boolean}
	 */
	static isOptionOfFacade(optionName, facadeName)
	{
		return optionName.toLowerCase().indexOf(facadeName.toLowerCase())>=0;
	}
}