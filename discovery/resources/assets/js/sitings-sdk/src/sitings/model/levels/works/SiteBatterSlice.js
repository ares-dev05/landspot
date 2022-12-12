import Segment from '../../../../geom/Segment';

export default class SiteBatterSlice extends Segment {

    /**
     * @param a {Point}
     * @param b {Point}
     * @param aLevel {number}
     * @param bLevel {number}
     * @param volume {number}
     */
    constructor(a, b, aLevel, bLevel, volume) {
        super(a, b);

        /**
         * @type {number}
         * @private
         */
        this._aLevel = aLevel;

        /**
         * @type {number}
         * @private
         */
        this._bLevel = bLevel;

        /**
         * @type {number}
         * @private
         */
        this._volume = volume;
    }

    /**
     * @return {number}
     */
    get aLevel() { return this._aLevel; }

    /**
     * @return {number}
     */
    get bLevel() { return this._bLevel; }

    /**
     * @return {number}
     */
    get volume() { return this._volume; }

    /**
     * @param v {number}
     */
    set volume(v) { this._volume=v; }

    /**
     * @return {SiteBatterSlice}
     */
    clone() {
        return new SiteBatterSlice(this._a.clone(), this._b.clone(), this._aLevel, this._bLevel, this._volume);
    }

    /**
     * @param segment {Segment}
     * @param aLevel {number}
     * @param bLevel {number}
     * @param volume {number}
     */
    static from(segment, aLevel, bLevel, volume) {
        return new SiteBatterSlice(segment.a, segment.b, aLevel, bLevel, volume);
    }
}