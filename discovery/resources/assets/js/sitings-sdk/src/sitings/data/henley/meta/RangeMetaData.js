import HouseMetaData from './HouseMetaData';

export default class RangeMetaData {

	/**
	 * @param state {string}
	 * @param name {string}
	 * @param type {string}
	 */
	constructor(state, name, type)
	{
		/**
		 * Range state
		 * @type {string}
		 */
		this.state	= state;
		/**
		 * Range name
		 * @type {String}
		 */
		this.name	= name;
		/**
		 * Range type: single/double storey
		 * @type {String}
		 */
		this.type	= type;
		/**
		 * List of houses in this range
		 * @type {HouseMetaData[]}
		 */
		this.houses	= []; // new Vector.<HouseMetaData>;
	}

	/**
	 * @param pieces {array}
	 */
	addHouse(pieces)
	{
		this.houses.push(new HouseMetaData(pieces));
	}

	/**
	 * @param name {string}
	 * @returns {boolean}
	 */
	hasHouse(name)
	{
		return this.fetchHouse(name) != null;
	}

	/**
	 * @param name
	 * @returns {null|HouseMetaData}
	 */
	fetchHouse(name)
	{
		const  result = this.houses.find(house => house.isNamed(name));
		return result !== undefined ? result : null;
	}

	/**
	 * @param id {string}
	 * @returns {boolean}
	 */
	hasHouseId(id)
	{
		return this.fetchHouseById(id) != null;
	}

	/**
	 * @param id {string}
	 * @returns {HouseMetaData}
	 */
	fetchHouseById(id)
	{
		const  result = this.houses.find(house => house.id===id);
		return result !== undefined ? result : null;
	}

	/**
	 * @param comp {string}
	 * @returns {*|boolean}
	 */
	isNamed(comp)
	{
		return this.name && comp && comp.toLowerCase().indexOf(this.name.toLowerCase())===0;
	}

	/**
	 * @param comp {string}
	 * @returns {*|boolean}
	 */
	isType(comp)
	{
		return this.type && comp && comp.toLowerCase()===this.type.toLowerCase();
	}

	/**
	 * ID of the logo to display in the PDF output for this range. These IDs must exist as frame names in the PDF output
	 */
	get logoId()
	{
		if (this.name.toLowerCase().search('reserve')>=0) {
			return 'reserve';
		}	else
		if (this.name.toLowerCase().search('essence')>=0) {
			return 'essence';
		}	else {
			return 'collection';
		}
	}
}