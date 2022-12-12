/**
 * sample data row:
vhe,Clendonvale,3948,Allegra Lux Q1,Double Storey,Arcadia|ARC,Broadway|BWY,Classique|CLQ,Florence|FLO,Hayman|HMN,Imperial|IMP,Lancaster|LAC,Patterson|PTS,Piermont|PIE,Sandpiper|SDP,Ultima|ULT,Urban|URB
 */
const VERBOSE = false;

export default class HouseMetaData {

	/**
	 * @param pieces {Array}
	 */
	constructor(pieces)
	{
		/**
		 * Unique house ID code
		 * @type {string}
		 */
		this.id				= pieces[2].toLowerCase();
		/**
		 * House Display Name
		 * @type {string}
		 */
		this.name			= pieces[3].toLowerCase();
		/**
		 * House type (single/double storey)
		 * @type {string}
		 */
		this.type			= pieces[4];
		/**
		 * @type {string[]}
		 */
		this.facades		= [];
		/**
		 * @type {string[]}
		 */
		this.facadeAbbrevs	= [];
		/**
		 * @type {string[]}
		 */
		this.optionCodes	= [];
		/**
		 * @type {string[]}
		 */
		this.optionNames	= [];

		pieces.slice(5).forEach((facadeData) => {
			const facadeParts = facadeData.split('|');
			this.facades.push(facadeParts[0].toString().toLowerCase());
			this.facadeAbbrevs.push(facadeParts[1]);
		});
	}

	/**
	 * @param name {string}
	 * @returns {boolean}
	 */
	hasFacade(name)
	{
		return this.facades.indexOf(name.toLowerCase())>=0;
	}

	/**
	 * @param code {string}
	 * @returns {number}
	 */
	optionCodeIndex(code)
	{
		return this.optionCodes.indexOf(code.toLowerCase());
	}

	/**
	 * @param code {string}
	 * @param rawName {string}
	 */
	addOptionName(code, rawName)
	{
		code = code.toLowerCase();
		if (this.optionCodeIndex(code)<0) {
			this.optionCodes.push(code);
			this.optionNames.push(this.cleanupOptionName(rawName));
		}
	}

	/**
	 * @param code {string}
	 * @returns {string|null}
	 */
	getOptionName(code)
	{
		let index = this.optionCodeIndex(code);
		if (index>=0) {
			return this.optionNames[index];
		}	else {
			return null;
		}
	}
	
	/**
	 * The Henley option naming isn't consistent across the entire catalogue; on top of this, the raw names are too long to display
	 *	   in the user interface. Because of this, we try to shorten them to remove the extraneous details and keep just the option name in the end.
	 * Some samples of what the option names can look like:
	 * 	  - Provide Cascade 22 - Grand Dining & Grand Family Option
	 * @param rawName {string}
	 * @returns {string}
	 */
	cleanupOptionName(rawName)
	{
		// remove /Provide/? <houseName> - from the option
		const original = rawName;
		const pieces   = rawName.split('-'), prefix = pieces[0].toLowerCase();
		let   pos;

		if ((prefix.indexOf('provide')>=0 || prefix.indexOf(name.toLowerCase())>=0) && pieces.length>1) {
			pieces.shift();
		}
		
		// if the text has more dashes, we don't care what comes after the 2nd one
		rawName = pieces[0];

		// revert if we trimmed too much
		if (!rawName || rawName.length===0) {
			rawName = original;
		}
		
		// remove 'Provides' from the name
		if ((pos=rawName.toLowerCase().indexOf('provides'))>=0) {
			rawName = rawName.substr(pos+'provides'.length);
		}
		
		// remove 'Provide' from the name (again)
		if ((pos=rawName.toLowerCase().indexOf('provide'))>=0) {
			rawName = rawName.substr(pos+'provide'.length);
		}
		
		// remove 'Option' and anything following it, UNLESS it is a number
		if ((pos=rawName.toLowerCase().indexOf('option'))>=0) {
			// fetch the text following 'option'
			const suffix = rawName.substr(pos+'option'.length).trim();
			
			// if 'option' is the last word or if the very first non-whitespace character is NOT a number,
			// we can trim the entire suffix starting with 'option'
			if (!suffix.length || isNaN(Number(suffix.charAt(0)))) {
				// this isn't a numbered option; we can remove the entire suffix
				rawName = rawName.substr(0, pos);
			}
		}
		
		return rawName.trim();
	}

	/**
	 * @param comp {string}
	 * @returns {boolean}
	 */
	isNamed(comp)
	{
		// support multiple name formats
		comp = comp.toLowerCase();

		if (this.name===comp || this.name+' ['+this.id+']'===comp) {
			return true;
		}

		if (comp.indexOf(this.name)===0) {
			VERBOSE && console.log('Detected house with different versions. XML=\''+comp+'\'; TXT=\''+this.name+' ['+this.id+']\'');
		}
		
		// try to compare the name Without the ID
		if (comp.indexOf('[')>=0) {
			comp = comp.substr(0,comp.indexOf('[')).trim();
		}
		
		if (comp===this.name) {
			VERBOSE && console.log('	> assuming \''+this.name+'\' is in TXT');
			return true;
		}	else if (comp.indexOf(this.name)===0) {
			VERBOSE && console.log('	> assuming \''+this.name+'\' is a different version from \''+comp+'\'');
		}
		/* if (comp.indexOf(name)==0 || name.indexOf(comp)==0) {
			Logger.log("false negative when searching for: "+comp+" VS <"+name+"> or <"+name+" ["+id+"]"+">");
		} */
		
		return false;
	}
}