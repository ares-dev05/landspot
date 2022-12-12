import Geom from '../../../../utils/Geom';

export default class SiteBatter {

    // i.e. ratio is 1:2 -> 1 meter vertically for every 2 meters horizontally
    static get BATTER_RATIO_FILL() { return 2; }

    // i.e. ratio is 1:2 -> 1 meter vertically for every 2 meters horizontally
    static get BATTER_RATIO_CUT() { return 2; }

    /**
     * @return {number} how much we can inset the batter into the platform to avoid retaining
     * @constructor
     */
    static get PLATFORM_INSET() { return 0.2; }

    /**
     * @param edge {Segment}
     * @param start {number}
     */
    constructor (edge, start) {
        /**
         * @type {Segment}
         * @private
         */
        this._edge = edge;

        /**
         * @type {number}
         * @private
         */
        this._start = start;

        /**
         * @type {number}
         * @private
         */
        this._end = start;

        /**
         * @type {SiteBatterSlice[]}
         * @private
         */
        this._slices = [];
    }

    /**
     * @return {Segment}
     */
    get edge() { return this._edge; }

    /**
     * @return {number}
     */
    get start() { return this._start; }

    /**
     * @return {number}
     */
    get end() { return this._end; }

    /**
     * @return {SiteBatterSlice[]}
     */
    get slices() { return this._slices; }

    /**
     * @param slice {SiteBatterSlice}
     */
    addSlice(slice) {
        this._slices.push(slice);
    }

    /**
     * @return {number}
     */
    get volume() {
        return this._slices.reduce((sum, slice) => sum + slice.volume, 0);
    }

    /**
     * @return {Point}
     */
    get innerStart() {
        return this._slices.length ? this._slices[0].a : null;
    }

    /**
     * @return {Point}
     */
    get innerEnd() {
        return this._slices.length ? this._slices[this._slices.length-1].a : null;
    }

    /**
     * @return {Point[]}
     */
    get outerPath() {
        return this._slices.map(slice => slice.b);
    }

    /**
     * @return {boolean}
     */
    get isFill() {
        return this._slices.find(slice => slice.volume < 0) === undefined;
    }

    /**
     * @param position {number}
     * @param addEndSlice {boolean}
     * @param maxDistance {number}
     */
    endBatter(position, addEndSlice, maxDistance=-1) {
        this._end = position;

        // Add the final slice, if needed.
        if (addEndSlice && maxDistance !== 0 && this._slices.length) {
            const endSlice = this._slices[this._slices.length-1].clone();
            endSlice.startFromPoint(
                Geom.interpolatePoints(this.edge.a, this.edge.b, this.end/this.edge.length)
            );

            // Make sure the slice doesn't extend outside of the lot boundaries
            if (maxDistance > 0 && maxDistance < endSlice.length) {
                endSlice.normalize(maxDistance);
            }

            /**
             * The end slice doesn't have any depth. It is just the closing segment for the batter
             * @type {number}
             */
            endSlice.volume = 0;

            this.addSlice(endSlice);
        }
    }
}