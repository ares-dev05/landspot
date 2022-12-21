import XMLHenleyStructure from './XMLHenleyStructure';
import XMLStructureReader from './XMLStructureReader';

const VERBOSE = false;

export default class XMLHenleyFacade extends XMLHenleyStructure {

	/**
	 * @param facade {XMLHouseFacade}
	 */
	constructor(facade)
	{
		super();

		/**
		 * @type {XMLHouseFacade}
		 */
		this.regularData	= null;
		/**
		 * @type {XMLHouseFacade}
		 */
		this.mirroredData	= null;

		/**
		 * @type {XMLHenleyOption[]}
		 */
		this.options 		= [];

		//
		this.name	 		= XMLStructureReader.displayName(facade.name);
		this.structure		= facade;
	}

	/**
	 * @returns {string}
	 */
	get id() {
		const data = this.getData(false);
		return data ? data.id : '';
	}

	/**
	 * @param mirror {boolean}
	 * @returns {XMLHouseFacade}
	 */
	getData(mirror) {
		if (this.canMirror) {
			return mirror ? this.mirroredData : this.regularData;
		}	else {
			return this.regularData ? this.regularData : this.mirroredData;
		}
	}

	/**
	 * @returns {boolean}
	 */
	get canMirror() { return this.mirroredData != null; }

	/**
	 * Add a piece to this facade - if it is a part of it
	 *
	 * @param facade {XMLHouseFacade}
	 * @returns {boolean}
	 */
	addPiece(facade)
	{
		if (XMLStructureReader.displayName(facade.name)===this.name) {
			this.structure = facade;
			return true;
		}

		return false;
	}

	/**
	 * Add an option to this facade - if it is a part of it
	 *
	 * @param option {XMLHenleyOption}
	 * @returns {boolean}
	 */
	addOption(option)
	{
		if (XMLStructureReader.isOptionOfFacade(option.name, this.name)) {
			// update the display name for this option so that it doesn't contain the facade name in it
			option.name	  = XMLStructureReader.displayName(option.name, this.name);
			option.parent = this;
			this.options.push(option);
			return true;
		}

		return false;
	}

	/**
	 * distribute the indicated structure to either the regularData, or the mirroredData view of this facade
	 * @protected
	 * @param piece {XMLHouseFacade|Object}
	 */
	set structure(piece)
	{
		super.structure = piece;

		if (XMLStructureReader.isMirrored(piece.name)) {
			if (this.mirroredData!=null) {
				VERBOSE && console.trace('overwriting mirroredData view of facade '+this.name+' that already has it set');
			}

			this.mirroredData = piece;
		}	else {
			if (this.regularData!=null) {
				VERBOSE && console.trace('overwriting regularData view of facade '+this.name+' that already has it set');
			}

			this.regularData  = piece;
		}
	}
}