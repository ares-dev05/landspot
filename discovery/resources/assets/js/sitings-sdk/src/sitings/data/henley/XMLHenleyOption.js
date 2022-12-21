import XMLHenleyStructure from './XMLHenleyStructure';
import XMLStructureReader from './XMLStructureReader';

export default class XMLHenleyOption extends XMLHenleyStructure {

	constructor(piece)
	{
		super();

		/**
		 * Display label/name used in the application for this option
		 * @type {string}
		 */
		this.displayName = '';

		/**
		 * Henley Option Code (e.g. 4548HPG011, 4661HPG002 etc)
		 * @type {string}
		 */
		this.name		 = XMLStructureReader.displayName(piece.name);

		/**
		 * @type {XMLHenleyFacade}
		 */
		this.parent		 = null;

		/**
		 * The regular and mirrored vectors contain all the pieces of this option;
		 * The pieces can be positioned on multiple stories
		 * @type {XMLHouseOption[]}
		 */
		this.regular	 = [];

		/**
		 * @type {XMLHouseOption[]}
		 */
		this.mirrored	 = [];

		this.structure	= piece;
	}

	/**
	 * Can mirror only when we have some data in both arrangements. Can't mirror when a single one is available
	 * @returns {boolean|boolean}
	 */
	get canMirror() { return this.regular.length>0 && this.mirrored.length>0; }

	/**
	 * Returns true if this option is a facade mirroring (i.e. it is facade-specific, has a mirrored structure but not a regular one)
	 * @returns {boolean}
	 */
	get isFacadeMirroring() { return this.parent!=null && this.mirrored.length>0 && !this.regular.length; }

	/**
	 * Return the regular or mirrored structure of this option, based on the 'mirrored' flag
	 * @param mirror {boolean}
	 * @returns {XMLHouseOption[]}
	 */
	getData(mirror) {
		if (this.canMirror) {
			return mirror ? this.mirrored : this.regular;
		}	else {
			// otherwise, return whatever data we have available
			return (this.regular && this.regular.length) ? this.regular : this.mirrored;
		}
	}

	/**
	 * @returns {string}
	 */
	get id() {
		const data = this.getData(false);
		return data ? data.id : '';
	}

	/**
	 * @param option {XMLHouseOption}
	 * @returns {boolean}
	 */
	addPiece(option)
	{
		if (XMLStructureReader.displayName(option.name)===this.name) {
			this.structure = option;
			return true;
		}

		return false;
	}

	/**
	 * @protected
	 * @override
	 * @param piece {Object|XMLHouseOption}
	 */
	set structure(piece)
	{
		super.structure = piece;

		if (XMLStructureReader.isMirrored(piece.name)) {
			this.mirrored.push(piece);
		}	else {
			this.regular.push(piece);
		}
	}
}