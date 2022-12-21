import ChangeDispatcher from '../events/ChangeDispatcher';
import KeyboardLayer from '../sitings/global/KeyboardLayer';
import Point from '../geom/Point';
import AccountMgr from '../sitings/data/AccountMgr';
import EventBase from '../events/EventBase';

let _instanceKey = Symbol();

export default class DisplayManager extends ChangeDispatcher {

	static get ROTATION_CHANGE() { return 'rotation.change'; }

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Singleton Implementation

    /**
     * @param displayPpm {number}
     */
    static init(displayPpm) {
        if (!this[_instanceKey]) {
             this[_instanceKey] = new DisplayManager(_instanceKey, displayPpm, displayPpm);
        }
    }

	/**
	 * @returns {DisplayManager}
	 */
	static get instance() { return this[_instanceKey]; }
	/**
	 * @returns {DisplayManager}
	 */
	static get i() { return DisplayManager.instance; }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Constant Definitions + Helpers

	static get METRIC() {return 1;}
    static get IMPERIAL() {return 2;}

    static get ENVELOPE_SCALE() {return 100;}
    static get DEFAULT_SCALE() {return 200;}

    // the default DPI to be used in the application
    static get DEFAULT_DPI() { return 72; }

    // Dots per inch used in the PRINT output
    static get PRINT_DPI() { return 144; }

    // one inch to meter conversion
    static get INCH_TO_METER() {return 0.0254;}
    static get FEET_TO_METER() {return 0.3048;}
    static get SQ_FT_TO_SQ_M() {return 0.09290304;}

    /**
     * @return {number}
     */
	static get ppm() { return DisplayManager.instance.displayPpm; }

	/**
	 * @returns {number}
	 */
	static get svgppm() { return DisplayManager.instance.svgPpm; }

	/**
	 * @param value {number}
	 */
	static set svgppm(value) { DisplayManager.instance.svgPpm = value; }

    /**
	 * Transforms a dimension from metric to pixels for in-app display
	 *
     * @param meters {number}
     * @return {number}
     */
	static toPixels(meters) { return meters * this.ppm * this.instance.viewScale; }

    /**
     * @param meters {number}
     * @return {number}
     */
	static px(meters) { return this.toPixels(meters); }

	/**
	 * @param meters {number}
	 * @returns {number}
	 */
	static toSvgPixels(meters) { return meters * this.svgppm; }

	/**
	 * @param meters {number}
	 * @returns {number}
	 */
	static svgpx(meters) { return this.toSvgPixels(meters); }

	/**
	 * Transforms a dimension from pixels to metric
	 *
	 * @param pixels {number}
	 * @return {number}
	 */
	static toMeters(pixels) { return pixels/(this.ppm * this.instance.viewScale); }

	/**
	 * @param pixels {number}
	 * @return {number}
	 */
	static tr(pixels) { return this.toMeters(pixels); }

	/**
	 * @param point {Point}
	 * @returns {Point}
	 */
	static trPoint(point) { return new Point(this.tr(point.x), this.tr(point.y)); }

    /**
     * @return {number}
     */
	get displayPpm() { return this._displayPpm; }

    /**
     * @param value {number}
     */
    set displayPpm(value) { this._displayPpm = value; this.onChange(); }

	/**
	 * @returns {number}
	 */
	get svgPpm() { return this._svgPpm; }

	/**
	 * @param value {number}
	 */
	set svgPpm(value) { this._svgPpm=value; }

	/**
	 * @return {number}
	 */
	get viewScale() { return this._viewScale; }

	/**
	 * @param value {number}
	 */
	set viewScale(value) {
		if (this._viewScale !== value) {
			console.log('setting a view scale of ', value);
			this._viewScale = value;
			this.onChange();
		}
	}

	/**
	 * @param value {number}
	 */
	set viewRotation(value) {
		if (this._viewRotation !== value) {
			this._viewRotation = value;

			/**
			 * @type {EventBase}
			 * @private
			 */
			this._rotChangeEvent = this._rotChangeEvent || new EventBase(DisplayManager.ROTATION_CHANGE, this);
			this.dispatchEvent(this._rotChangeEvent);
		}
	}

	/**
	 * @returns {number}
	 */
	get viewRotation() {
		return this._viewRotation;
	}

	/**
     * @return {number}
     */
	get unitType() { return this._unitType; }

    /**
     * @return {number}
     */
	get previousUnit() { return this._unitType.value===DisplayManager.METRIC?DisplayManager.IMPERIAL:DisplayManager.METRIC; }

    /**
     * @param constructKey {*}
     * @param displayPpm {number}
	 * @param svgPpm {number}
	 * @param context {*}
     */
	constructor(constructKey, displayPpm, svgPpm, context=null)
	{
		super(context);

        /**
		 * The current pixels per meter density of the application
         * @type {number}
         * @private
         */
        this._displayPpm = displayPpm;

		/**
		 * @type {number}
		 * @private
		 */
		this._svgPpm	= svgPpm;

		/**
		 * View Scale, from 0 -> Infinity
		 * @type {number}
		 * @private
		 */
		this._viewScale		= 1;

		/**
		 * @type {number}
		 * @private
		 */
		this._viewRotation	= 0;

        /**
		 * Active unit system
         * @type {number}
         * @private
         */
        this._unitType	= DisplayManager.METRIC;
	}

    /**
     * calculates the site coverage of a house within a lot as a ratio from 0 to 1 (unless the house takes up more space than the lot)
     * @param houseArea {number}
     * @param lotArea {number}
     * @return {number}
     */
	static siteCoverage(houseArea, lotArea)
	{
		if (lotArea>0) {
			return houseArea/lotArea;
		}	else {
			return 0;
		}
	}

    /**
     * returns the pixels-per-meter for a given scale and pixel density
     * @param scale {number}
     * @param dpi {number}
     * @return {number}
     */
	static getPpm(scale, dpi)
	{
		return dpi / this.INCH_TO_METER / scale;
	}

    /**
     * convert meters <-> (feet, inches)
     * @param m {number}
     * @return {{feet: number, inches: number}}
     */
	static metricToImperial(m)
	{
		let feet = Math.floor( m / this.FEET_TO_METER );
		m	    -= feet * this.FEET_TO_METER;

		return {
			feet	: feet,
			inches	: m / this.INCH_TO_METER
		};
	}

    /**
     * @param feet {number}
     * @param inches {number}
     * @return {number}
     */
	static imperialToMetric(feet, inches)
	{
		return this.round(feet * this.FEET_TO_METER + inches * this.INCH_TO_METER);
	}

    /**
     * convert meters <-> feet
     * @param meters {number}
     * @return {number}
     */
	static metersToFeet(meters)
	{
		return meters / this.FEET_TO_METER;
	}

    /**
     * @param feet
     * @return {Number}
     */
	static feetToMeters(feet)
	{
		return this.round(feet*this.FEET_TO_METER);
	}

    /**
     * convert meters <-> feet
     * @param meters {number}
     * @return {number}
     */
	static squaredMetersToFeet(meters)
	{
		return meters/this.SQ_FT_TO_SQ_M;
	}

    /**
     * @param feet {number}
     * @return {number}
     */
	static squaredFeetToMeters(feet)
	{
		return feet*this.SQ_FT_TO_SQ_M;
	}

    /**
     * rounding to 5 decimal digits
     * @param v {number}
     * @return {number}
     */
	static round(v)
	{
		return Number(v.toFixed(5));
	}

	/**
	 * @TODOf
	 * @returns {boolean|*}
	 */
	static get ompEnabled()
	{
		return KeyboardLayer.i.shiftPressed && AccountMgr.i.builder.ompEnabled;
	}
}
