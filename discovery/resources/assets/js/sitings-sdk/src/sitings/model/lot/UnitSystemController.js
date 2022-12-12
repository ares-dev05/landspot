import DisplayManager from '../../../utils/DisplayManager';
import Geom from '../../../utils/Geom';


export default class UnitSystemController {

    /**
     * @param meters {number}
     */
    constructor(meters=0)
    {
        /**
         * @type {number}
         * @private
         */
        this._meters = meters;

        /**
         * @type {number}
         * @private
         */
        this._feet   = 0;
        /**
         * @type {number}
         * @private
         */
        this._inches = 0;
    }

    /**
     * @return {number}
     */
    get meters() { return this._meters; }

    /**
     * @param v {number}
     */
    set meters(v) {
        this._meters    = v;
        const imperial  = DisplayManager.metricToImperial(this._meters);
        this._feet      = imperial.feet;
        this._inches    = imperial.inches;
    }

    /**
     * @return {number}
     */
    get feet() { return this._feet; }

    /**
     * @param feet {number}
     */
    set feet(feet) { this.setImperial(feet, this._inches); }

    /**
     * @return {number}
     */
    get inches() { return this._inches; }

    /**
     * @param inches {number}
     */
    set inches(inches) { this.setImperial(this._feet, inches); }

    /**
     * @param feet {number}
     * @param inches {number}
     */
    setImperial(feet=0, inches=0)
    {
        this._feet	 = feet;
        this._inches = inches;
        this._meters = DisplayManager.imperialToMetric(this._feet, this._inches);
    }

    /**
     * Fixes the meters to a maximum of 6 decimal places
     */
    fixPrecision()
    {
        this.meters = Geom.displayRound(this._meters);
        // Geom.epsilonRound(this._meters);
    }
}