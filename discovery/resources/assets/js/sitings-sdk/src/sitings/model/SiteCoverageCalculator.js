import HouseLayerType from './house/HouseLayerType';
import HouseModel from './house/HouseModel';
const facadeKeys = ['floor', 'garage', 'alfresco', 'porch'];

export default class SiteCoverageCalculator {

	/**
	 * @param model {SitingsModel}
	 */
	constructor(model)
	{
		/**
		 * @type {SitingsModel}
		 * @private
		 */
		this._model = model;

		/**
		 * @type {{alfresco: number, porch: number, transformations: number, options: number, layers: {}, garage: number, facade: number, floor: number, house: HouseModel}[]}
		 * @private
		 */
		this._houseAreas	= [];

		/**
		 * @type {number}
		 * @private
		 */
		this._lotArea		= 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._facadeArea	= 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._optionsArea	= 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._transformArea	= 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._structureArea = 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._sitedArea		= 0;
		/**
		 * @type {number}
		 * @private
		 */
		this._siteCoverage	= 0;
	}

	/**
	 * Returns an area breakdown for all the houses. A house area breakdown has the following format:
	 * {	house: HouseModel,
	 * 		totalArea: number			// total area of the house (including facade, options and transformations)
	 * 		facade: number,				// total area of the selected facade
	 * 		options: number,			// summed area of all the options selected for the house
	 * 		transformations: number,	// added or removed area by the transformations & add-ons applied to the house
	 * 		alfresco: number,			// alfresco area (as defined in the House's area JSON)
	 * 		porch: number,				// porch area (as defined in the House's area JSON)
	 * 		garage: number,				// garage area (as defined in the House's area JSON)
	 * 		floor: number				// floor area (as defined in the House's area JSON),
	 * 		layers: {}					// mapping for the labels of selected layers to their areas
	 * }
	 *
	 * @returns {{alfresco: number, porch: number, transformations: number, options: number, layers: {}, garage: number, facade: number, floor: number, house: HouseModel}[]}
	 */
	get houseAreas() { return this._houseAreas; }

	/**
	 * Gets an area breakdown for a certain house
	 *
	 * @param house {HouseModel}
	 * @returns {{}|{alfresco: number, porch: number, transformations: number, options: number, layers: {}, garage: number, facade: number, floor: number, house: HouseModel}}
	 */
	getHouseAreaBreakdown(house) {
		for (let i=0; i<this._houseAreas.length; ++i) {
			if (this._houseAreas[i].house === house) {
				return this._houseAreas[i];
			}
		}

		return {};
	}

	/**
	 * Total area of the lot (in m2)
	 *
	 * @returns {number}
	 */
	get lotArea()		{ return this._lotArea;}

	/**
	 * Total facade area for the facades of all the sited houses (in m2)
	 *
	 * @returns {number}
	 */
	get facadeArea()	{ return this._facadeArea; }

	/**
	 * Total area for the structural options of all the sited houses (in m2)
	 *
	 * @returns {number}
	 */
	get optionsArea()	{ return this._optionsArea; }

	/**
	 * Total area added or removed by house transformations for all the sited houses (in m2)
	 *
	 * @returns {number}
	 */
	get transformArea()	{ return this._transformArea; }

	/**
	 * @returns {number}
	 */
	get structureArea() { return this._structureArea; }

	/**
	 * Summed area of all the houses sited on the lot, including structural options, transformations and add-ons (in m2)
	 * Includes the area of structures that have 'include in site coverage' checked
	 *
	 * @returns {number}
	 */
	get sitedArea()		{ return this._sitedArea; }

	/**
	 * Site coverage as a percentage
	 *
	 * @returns {number}
	 */
	get siteCoverage()	{ return this._siteCoverage; }

	/**
	 * Calculates the site coverage details
	 * @public
	 */
	calculate()
	{
		// Reset house area calculations
		this._houseAreas	= [];
		this._facadeArea	= 0;
		this._optionsArea	= 0;
		this._structureArea = 0;

		// Calculate House area properties
		for (let houseIndex=0, areaData; houseIndex<this._model.multiFloors.count; ++houseIndex) {
			// select the layers for the current house
			const house			= this._model.multiFloors.floors[houseIndex];
			const houseLayers	= house.layers;

			// Prepare the area breakdown for the current house
			let areaBreakdown	= {
				house:			 house,
				transformations: this._model.multiTransforms.getTransformationAreaFor(house),
				options:		 0,
				facade:			 0,
				layers:			 {}
			};

			if (house.format === HouseModel.FORMAT_SVG) {
				// Loop all of this house's layers
				for (let layerIndex = 0; layerIndex < houseLayers.length; ++layerIndex) {
					const layer = houseLayers[layerIndex];

					if (!layer.visible) {
						continue;
					}

					if (layer.type === HouseLayerType.FACADE) {
						areaData = house.houseData.getFacadeArea(layer.group);

						// Fetch the floor, garage, alfresco and porch areas for this house
						for (let key = 0; key < facadeKeys.length; ++key) {
							areaBreakdown[facadeKeys[key]] = areaData.getAreaOf(facadeKeys[key]);
						}

						areaBreakdown.facade += areaData.totalArea;
						areaBreakdown.layers[layer.getLayerLabel()] = areaData.totalArea;
					}

					if (layer.type === HouseLayerType.OPTION) {
						areaData = house.houseData.getOptionArea(layer.group);
						areaBreakdown.options += areaData.totalArea;
						areaBreakdown.layers[layer.getLayerLabel()] = areaData.totalArea;
					}
				}
			}	else {
				areaBreakdown.facade += house.totalXMLArea;
			}

			// Calculate the total area of the house and push it to the breakdowns list
			areaBreakdown.totalArea	= areaBreakdown.facade + areaBreakdown.options + areaBreakdown.transformations;
			this._houseAreas.push(areaBreakdown);

			// add the facade / option areas for this house to the totals
			this._facadeArea	+= areaBreakdown.facade;
			this._optionsArea	+= areaBreakdown.options;
		}

		// Calculate structures area
		for (let structures=this._model.structures.structures, index=0; index<structures.length; ++index) {
			const structure = structures[index];

			if (structure.includeInSiteCoverage) {
				this._structureArea += structure.area;
			}
		}

		// calculate overalls
		this._transformArea	= this._model.multiTransforms.totalArea;
		this._lotArea		= this._model.pathModel.totalArea;
		this._sitedArea		= this._facadeArea + this._optionsArea + this._transformArea + this._structureArea;

		if (this._lotArea > 0) {
			this._siteCoverage = this._sitedArea * 100 / this._lotArea;
		}	else {
			this._siteCoverage = 0;
		}
	}
}