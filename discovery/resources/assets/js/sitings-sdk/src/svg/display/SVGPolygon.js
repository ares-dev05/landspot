import SVGShape from "./base/SVGShape";

export default class SVGPolygon extends SVGShape {

    static get CLASS_TYPE() { return "SVGPolygon" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGPolygon.CLASS_TYPE || super.isType(type); }
	
    
    constructor() {
		super("polygon");

        /**
         * @type {Array.<string>}
         * @private
         */
        this._points = null;
	}

    /**
     * @return {Array}
     */
	get points() { return this._points; }

    /**
     * @param value {Array}
     */
	set points(value) { this._points = value; }
}