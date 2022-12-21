/**
 * This class takes a selected facade + a set of selected options and merges them
 */
import ChangeDispatcher from '../../../events/ChangeDispatcher';
import MergedSegmentSet from './MergedSegmentSet';

export default class XMLHenleyDataMerger extends ChangeDispatcher {

	/**
	 * @param data {XMLStructureReader}
	 */
	constructor(data)
	{
		super();

		/**
		 * @type {XMLStructureReader}
		 * @private
		 */
		this._data			  = data;
		/**
		 * @type {MergedSegmentSet[]}
		 * @private
		 */
		this._stories		  = [];

		/**
		 * @type {MergedSegmentSet}
		 * @private
		 */
		this._groundFloor	  = null;

		/**
		 * @type {MergedSegmentSet}
		 * @private
		 */
		this._garage	  	  = null;

		/**
		 * Currently selected facade
		 * @type {XMLHenleyFacade}
		 * @private
		 */
		this._facade		  = null;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._facadeMirror	  = false;

		/**
		 * Selected options + their mirrored variations
		 * @type {XMLHenleyOption[]}
		 * @private
		 */
		this._selectedOptions = [];

		/**
		 * @type {XMLHouseOption[]}
		 * @private
		 */
		this._options		  = [];

		/**
		 * @type {boolean}
		 * @private
		 */
		this._showGarage	  = true;

		/**
		 * Calculated merger area
		 * @type {number}
		 * @private
		 */
		this._mergedArea	  = 0;
	}

	/**
	 * @returns {XMLHenleyFacade}
	 */
	get facade()		{ return this._facade; }

	/**
	 * @returns {XMLHenleyOption[]}
	 */
	get selectedOptions() { return this._selectedOptions; }

	/**
	 * The merged stories' structures for this house
	 * @returns {MergedSegmentSet[]}
	 */
	get stories()		{ return this._stories; }

	/**
	 * Calculated 1st story area for the selected facade/options
	 * @returns {number}
	 */
	get mergedArea()	{ return this._mergedArea; }

	/**
	 * @return {MergedSegmentSet}
	 */
	get groundFloor()	{ return this._groundFloor; }

	/**
	 * @return {MergedSegmentSet}
	 */
	get garage()		{ return this._garage; }

	/**
	 * @private
	 */
	merge()
	{
		// refresh the stories, ground floor and garage data
		this._stories = [];
		this._groundFloor = new MergedSegmentSet(0);
		this._garage	  = new MergedSegmentSet(0);

		if (this._facade) {
			let facadeData = this._facade.getData(this._facadeMirror), story;
			if (!facadeData)
				return;

			// start calculating the floorplan area on the 1st story
			this._mergedArea	= facadeData.totalArea();

			// create all the stories from the facade
			for (let index=0; index<facadeData.stories.length; ++index) {
				// _stories.push(story = new MergedSegmentSet(index+1));
				story = this._stories[facadeData.stories[index].story-1] = new MergedSegmentSet(index+1);
				story.push(facadeData.stories[index], MergedSegmentSet.INTERSECT_NO);

				// Add the ground floor outline
				if (index===0) {
					this._groundFloor.push(facadeData.stories[index], MergedSegmentSet.INTERSECT_NO);
				}
			}

			// merge in the garage
			if (this._showGarage) {
				if (facadeData.garage && facadeData.garage.story<=this._stories.length) {
					this._stories[
						facadeData.garage.story-1
					].push(
						facadeData.garage, MergedSegmentSet.INTERSECT_PARTIAL
					);

					// store the garage outline
					this._garage.push(facadeData.garage, MergedSegmentSet.INTERSECT_NO);

					// exclude the garage outline from the house boundaries
					this._groundFloor.push(facadeData.garage, MergedSegmentSet.INTERSECT_FULL);
				}
			}

			// merge in the options
			for (let index=0; index<this._options.length; ++index) {
				const option = this._options[index];
				this._stories[option.story-1].push(option, MergedSegmentSet.INTERSECT_FULL);

				// add the area for this option
				if (option.story===1) {
					this._mergedArea += option.area;
					this._groundFloor.push(option, MergedSegmentSet.INTERSECT_FULL);
				}
			}

			// execute the merger on all stories
			for (let index=0; index<facadeData.stories.length; ++index) {
				if (this._stories[index]) {
					try {
						this._stories[index].execute();
					}	catch(e) {
						// nothing yet
					}
				}
			}

			try {
				this._groundFloor.execute();
				this._garage.execute();
			}	catch(e) {
				// ignore
				console.log(e);
			}
		}

		this.onChange();
	}

	/**
	 * @param name {string}
	 * @public
	 */
	selectFacadeByName(name)
	{
		for (let i=0; i<this._data.facades.length; ++i) {
			const facade = this._data.facades[i];
			if (facade.name.toLowerCase()===name.toLowerCase()) {
				this.setFacadeSelection(facade);
				break;
			}
		}
	}

	/**
	 * @param names {string[]}
	 * @public
	 */
	selectOptionsByName(names)
	{
		const selection = [];
		const options	= this._data.optionsForFacade(this._facade);

		names.forEach(function(optionName) {
			options.find(function(option) {
				if (option.name.toLowerCase()===optionName.toLowerCase()) {
					selection.push(option);
					return true;
				}

				return false;
			});
		});

		this.setOptionSelection(selection);
	}

	/**
	 * @param facade {XMLHenleyFacade}
	 * @param mirror {boolean}
	 * @public
	 */
	setFacadeSelection(facade, mirror=false)
	{
		let optionRemoved = false;
		if (this._facade) {
			// go over the selected options
			for (let i=this._selectedOptions.length-1; i>=0; --i) {
				if (this._selectedOptions[i].parent && this._selectedOptions[i].parent !== facade) {
					this._selectedOptions.splice(i, 1);
					optionRemoved = true;
				}
			}
		}

		if (facade) {
			this._facade		= facade;
			this._facadeMirror	= mirror;
		}	else {
			this._facade		= null;
			this._facadeMirror	= false;
		}

		if (optionRemoved) {
			this.setOptionSelection([...this._selectedOptions]);
		}	else {
			this.merge();
		}
	}

	/**
	 * @param selection {XMLHenleyOption[]}
	 * @public
	 */
	setOptionSelection(selection)
	{
		// reset the option set
		this._selectedOptions	= [];
		this._options			= [];
		this._showGarage		= true;

		// flag that indicates if one of the selected options is the facade mirroring
		let isFacadeMirrored	= false;

		// first we check to see if we selected a facade mirroring; this can only be the case when the selected facade has any options
		if (this._facade && this._facade.options.length) {
			isFacadeMirrored = selection.find(
				(option) => option.isFacadeMirroring
			);
		}

		for (let i=0; i<selection.length; ++i) {
			const option = selection[i];
			const optionPieces = option.getData(isFacadeMirrored);

			if (this._facade && this._facade.options.indexOf(option)>=0) {
				this._showGarage = false;
			}	else if (this._data.options.indexOf(option) < 0) {
				// confirm that this option belongs to this facade
				continue;
			}

			this._selectedOptions.push(option);
			this._options = this._options.concat(optionPieces);
		}

		this.merge();
	}
}