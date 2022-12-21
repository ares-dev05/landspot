export default class SitePiering {

    /**
     * The half of the house that is sitting on fill (that exceeds 300mm in depth) requires piers to be introduced
     *
     * @return {number}
     */
    static get PIER_THRESHOLD() { return 0.3; }

    /**
     * [...] usually 450 dia. bored concrete piers, sometimes Screw piles, depending on soil conditions
     *
     * @return {number}
     * @constructor
     */
    static get PIER_RADIUS() { return 0.225; }

    /**
     * @return {number}
     * @constructor
     */
    static get PIER_AREA() { return Math.pow(SitePiering.PIER_RADIUS, 2) * Math.PI; }

    /**
     * Average depth of fill + 800mm into founding soil
     *
     * @return {number}
     * @constructor
     */
    static get PIER_DEPTH() { return 0.8; }

    /**
     * Single storey - distance between piers = 2400mm (max.) to perimeter, 3600max. internal
     * Double storey – distance between piers = 1200mm (max.) to perimeter, 2400max. internal
     *
     * @return {number}
     * @constructor
     */
    static get SINGLE_STOREY_PERIMETER() { return 1.2; }

    /**
     * @return {number}
     * @constructor
     */
    static get SINGLE_STOREY_INTERNAL() { return 2.4; }


    /**
     * @param houseModel {HouseModel}
     * @param pierPerimeter {Polygon}
     * @param averageFill {number}
     */
    constructor(houseModel, pierPerimeter, averageFill) {
        /**
         * @type {HouseModel}
         * @private
         */
        this._houseModel = houseModel;

        /**
         * @type {Polygon}
         * @private
         */
        this._pierPerimeter = pierPerimeter;

        /**
         * @type {number}
         * @private
         */
        this._averageFill = averageFill;

        /**
         * @type {Point[]}
         * @private
         */
        this._pierLocations = [];

        this._calculate();
    }

    /**
     * @return {HouseModel}
     */
    get houseModel() { return this._houseModel; }

    /**
     * @return {Polygon}
     */
    get pierPerimeter() { return this._pierPerimeter; }

    /**
     * @return {Point[]}
     */
    get pierLocations() { return this._pierLocations; }

    /**
     * @return {number}
     */
    get pierHeight() { return this._averageFill + SitePiering.PIER_DEPTH; }

    /**
     * @return {number}
     */
    get pierVolume() {
        if (!this._pierLocations) {
            return 0;
        }

        return this._pierLocations.length * SitePiering.PIER_AREA * this.pierHeight;
    }

    _calculate() {

    }
}