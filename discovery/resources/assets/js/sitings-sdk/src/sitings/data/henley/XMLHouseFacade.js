import XMLHenleyStructure from './XMLHenleyStructure';

export default class XMLHouseFacade extends XMLHenleyStructure
{
	constructor(name)
	{
		super();

		/**
		 * @type {XMLHouseStructure}
		 */
		this.garage	 = null;
		/**
		 * @type {XMLHouseStructure[]}
		 */
		this.stories = [];
		
		this.name	 = name;
	}

	/**
	 * @returns {string}
	 */
	get id() { return this.name; }

	/**
	 * Calculates the total house area on a certain story
	 * @param story {number}
	 * @returns {number}
	 */
	totalArea(story=1)
	{
		return this.stories.reduce(
			(total, storey) =>
				(storey.story === story ? total + storey.area : total),
			0
		);
	}

	calculateBounds()
	{
		this.left	=  Infinity;
		this.top	=  Infinity;
		this.right	= -Infinity;
		this.bottom	= -Infinity;

		// Update the bounds over all the storeys and the garage (if it is set)
		this.stories.concat(
			this.garage ? [this.garage] : []
		).forEach(
			piece => this.mergeBoundsWith(piece)
		);
	}

	/**
	 * @param origin {Point}
	 * @param angle {number}
	 */
	rotate(origin, angle)
	{
		// Rotate the garage and all the
		if (this.garage) {
			this.garage.rotate(origin, angle);
		}
		this.stories.forEach(storey => storey.rotate(origin, angle));
	}
}