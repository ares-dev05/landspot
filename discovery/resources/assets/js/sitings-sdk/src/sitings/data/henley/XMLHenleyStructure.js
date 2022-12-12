export default class XMLHenleyStructure {

	constructor() {
		/**
		 * @type {string}
		 */
		this.name	= '';
		/**
		 * @type {number}
		 */
		this.left	=  Infinity;
		/**
		 * @type {number}
		 */
		this.top	=  Infinity;
		/**
		 * @type {number}
		 */
		this.right	= -Infinity;
		/**
		 * @type {number}
		 */
		this.bottom	= -Infinity;
	}

	/**
	 * @protected
	 * @param piece {Object}
	 */
	set structure(piece)
	{
		this.mergeBoundsWith(piece);
	}

	/**
	 * @param piece {Object}
	 */
	mergeBoundsWith(piece)
	{
		this.left	= Math.min(this.left  , piece.left);
		this.top	= Math.min(this.top   , piece.top);
		this.right	= Math.max(this.right , piece.right);
		this.bottom	= Math.max(this.bottom, piece.bottom);
	}
}