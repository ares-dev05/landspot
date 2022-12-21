import SVGShape from "./base/SVGShape";

export default class SVGPolyline extends SVGShape {

    static get CLASS_TYPE() { return "SVGPolyline" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGPolyline.CLASS_TYPE || super.isType(type); }

    constructor(){
		super("polyline");

        /**
         * @type {Array.<string>}
         * @private
         */
        this._points = null;
	}

    /**
     * @return {Array.<string>}
     */
	get points() { return this._points; }

    /**
     * @param value {Array.<string>}
     */
	set points(value) { this._points = value; }
}