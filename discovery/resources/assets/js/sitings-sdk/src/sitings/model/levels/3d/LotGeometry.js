import RestoreDispatcher from '../../../../events/RestoreDispatcher';


/**
 * @TODO: refactor this.
 */
export default class LotGeometry extends RestoreDispatcher {

    /**
     * @param lotSurface {LotSurface}
     * @param lotOutline {LotSurface}
     * @param lotBottom {LotSurface}
     * @param outsideSurface {LotSurface}
     * @param fallLines {LotSurface[]}
     * @param padSurface {{horizontal: ShapeGeometry, vertical: LotSurface}}
     * @param cutSurface {ShapeGeometry}
     * @param cutLines {LotSurface[]}
     * @param retainingWalls {LotSurface[]}
     * @param batterAreas {LotSurface[]}
     * @param sitePiers {ShapeGeometry[]}
     * @param slabSurfaces {{horizontal: ShapeGeometry, vertical: LotSurface}[]}
     * @param drivewaySurface {LotSurface}
     * @param hasHouseModel {boolean}
     * @param slabLevel {number}
     * @param scaleUp {number}
     * @param houseTransform {Matrix}
     */
    constructor(lotSurface, lotBottom, lotOutline, outsideSurface, fallLines, padSurface, cutSurface, cutLines, retainingWalls, batterAreas, sitePiers, slabSurfaces, drivewaySurface, hasHouseModel=false, slabLevel=0, scaleUp=1, houseTransform=null) {
        super();

        /**
         * @type {LotSurface}
         * @private
         */
        this._lotSurface = lotSurface;

        /**
         * @type {LotSurface}
         * @private
         */
        this._lotBottom = lotBottom;

        /**
         * @type {LotSurface}
         * @private
         */
        this._lotOutline = lotOutline;

        /**
         * @type {LotSurface}
         * @private
         */
        this._outsideSurface = outsideSurface;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._fallLines = fallLines;

        /**
         * @type {{horizontal: ShapeGeometry, vertical: LotSurface}}
         * @private
         */
        this._padSurface = padSurface;

        /**
         * @type {ShapeGeometry}
         * @private
         */
        this._cutSurface = cutSurface;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._cutLines = cutLines;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._retainingWalls = retainingWalls;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._batterAreas = batterAreas;

        /**
         * @type {ShapeGeometry[]}
         * @private
         */
        this._sitePiers = sitePiers;

        /**
         * @type {{horizontal: ShapeGeometry, vertical: LotSurface}[]}
         * @private
         */
        this._slabSurfaces = slabSurfaces;

        /**
         * @type {LotSurface}
         * @private
         */
        this._drivewaySurface = drivewaySurface;

        /**
         * @type {boolean}
         * @private
         */
        this._hasHouseModel = hasHouseModel;

        // @TEMP
        this.slabLevel = slabLevel;

        // @TEMP
        this.scaleUp = scaleUp;

        /**
         * @type {Matrix}
         */
        this.houseTransform = houseTransform;
    }

    /**
     * @returns {LotSurface}
     */
    get lotSurface() { return this._lotSurface; }

    /**
     * @return {LotSurface}
     */
    get lotBottom() { return this._lotBottom; }

    /**
     * @returns {LotSurface}
     */
    get lotOutline() { return this._lotOutline; }

    /**
     * @returns {LotSurface}
     */
    get outsideSurface() { return this._outsideSurface; }

    /**
     * @returns {LotSurface[]}
     */
    get fallLines() { return this._fallLines; }

    /**
     * @returns {{horizontal: ShapeGeometry, vertical: LotSurface}}
     */
    get padSurface() { return this._padSurface; }

    /**
     * @return {ShapeGeometry}
     */
    get cutSurface() { return this._cutSurface; }

    /**
     * @return {LotSurface[]}
     */
    get cutLines() { return this._cutLines; }

    /**
     * @returns {LotSurface[]}
     */
    get retainingWalls() { return this._retainingWalls;}

    /**
     * @return {LotSurface[]}
     */
    get batterAreas() { return this._batterAreas; }

    /**
     * @return {ShapeGeometry[]}
     */
    get sitePiers() { return this._sitePiers; }

    /**
     * @returns {{horizontal: ShapeGeometry, vertical: LotSurface}[]}
     */
    get slabSurfaces() { return this._slabSurfaces; }

    /**
     * @return {LotSurface}
     */
    get drivewaySurface() { return this._drivewaySurface; }

    /**
     * @return {boolean}
     */
    get hasHouseModel() { return this._hasHouseModel; }
}