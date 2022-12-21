const typeNames  = ['N/A', 'facade', 'option', 'addons', 'roof'];

export default class HouseLayerType {

	static get FACADE() { return facadeType; }
	static get OPTION() { return optionType; }
	static get ADDONS() { return addonType; }
	static get ROOF  () { return roofType; }

	// Meta layers
	static get META_BOUNDARY()     { return metaBoundaryType; }
	static get META_GARAGE()       { return metaGarage;       }
	static get META_GARAGE_FRONT() { return metaGarageFront;  }
	static get META_PORCH()		   { return metaPorch; 		  }
	static get META_ALFRESCO()	   { return metaAlfresco;	  }

	// lots are being loaded & displayed as SVG for easy management of huge blocks
	static get BLOCK_LOT() { return blockLotType; }


	/**
	 * @param id {number}
	 * @param exclusive {boolean}
	 */
	constructor(id, exclusive)
	{
		/**
		 * @type {number}
		 * @private
		 */
		this._id = id;

		/**
		 * True if the floor can only have one layer of this type at a time
		 * @type {boolean}
		 * @private
		 */
		this._exclusive = exclusive;
	}

	/**
	 * @return {boolean}
	 */
	get isMeta() {
		return this === HouseLayerType.META_BOUNDARY ||
			this === HouseLayerType.META_GARAGE ||
			this === HouseLayerType.META_GARAGE_FRONT;
	}

	/**
	 * @return {number}
	 */
	get id() { return this._id; }

	/**
	 * @return {boolean}
	 */
	get exclusive() { return this._exclusive; }

	/**
	 * @return {string}
	 */
	toString() { return typeNames[this._id]; }

	/**
	 * @param id
	 * @return {HouseLayerType}
	 */
	static fromId(id) {
		return [
			// display layers
			this.FACADE, this.OPTION, this.ADDONS, this.ROOF, this.BLOCK_LOT,
			// meta layers
			this.META_BOUNDARY, this.META_GARAGE, this.META_GARAGE_FRONT, this.META_PORCH,
			// null returned if layer type not found
			null
		].find(type => !type || type.id === id);
	}
}

const facadeType = new HouseLayerType(1, true );
const optionType = new HouseLayerType(2, false);
const addonType  = new HouseLayerType(3, true );
const roofType   = new HouseLayerType(4, false);

// lots are being loaded & displayed as SVG for easy management of huge blocks
const blockLotType = new HouseLayerType(5, true);

// Meta layers: Used to mark certain house areas on the floorplan
const metaBoundaryType = new HouseLayerType(101, false);
const metaGarage	   = new HouseLayerType(102, false);
const metaGarageFront  = new HouseLayerType(103, false);
const metaPorch		   = new HouseLayerType(104, false);
const metaAlfresco	   = new HouseLayerType(105, false);