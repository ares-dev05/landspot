export default class AreaData
{
	constructor()
	{
        /**
         * @type {string[]}
         * @private
         */
		this._names	= [];

        /**
         * @type {number[]}
         * @private
         */
		this._values = [];

        /**
         * @type {number}
         * @private
         */
        this._totalArea = 0;
    }

    /**
     * @param name {string}
     * @param value {number}
     */
	addLayer(name, value)
	{
		this._names.push( name.toLowerCase() );
        this._values.push( value );
        this._totalArea += value;
	}

    /**
     * @return {number}
     */
	get totalArea() { return this._totalArea; }

    /**
     * @param layerName {string}
     * @return {number}
     */
	getAreaOf(layerName)
	{
		let pos = this._names.indexOf( layerName.toLowerCase() );
		return pos !== -1 ? this._values[pos] : 0;
	}

    /**
     * @param object {*}
     * @return {AreaData}
     */
	static fromObject(object)
	{
		let data = new AreaData();
		if (object) {
			for (let key in object) {
			    if (object.hasOwnProperty(key)) {
                    data.addLayer(key, Number(object[key]));
                }
			}
		}

		return data;
	}
}