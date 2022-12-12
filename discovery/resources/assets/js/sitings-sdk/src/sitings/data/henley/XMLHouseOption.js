import XMLHouseStructure from './XMLHouseStructure';

export default class XMLHouseOption extends XMLHouseStructure {

	/**
	 * @param data {Element}
	 */
	constructor(data)
	{
		super(data);

		/**
		 * @type {string}
		 */
		this.name		= '';

		/**
		 * @type {number}
		 */
		this.areachange	= 0;

		if (data) {
			this.parse();
		}
	}

	/**
	 * @returns {string}
	 */
	get id() { return this.name; }

	/**
	 * @protected
	 */
	parse()
	{
		this.name		= this.data.getAttribute('option');
		this.areachange	= parseFloat(this.data.getAttribute('areachange'));

		super.parse();
	}

	/**
	 * @protected
	 */
	calculateArea()
	{
		// use the provided area
		this.area	= this.areachange;
	}
}