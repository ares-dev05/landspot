import SVGShape from "./base/SVGShape";
import SVGParserCommon from "../parser/SVGParserCommon";

export default class SVGPath extends SVGShape
{
    static get CLASS_TYPE() { return "SVGPath" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGPath.CLASS_TYPE || super.isType(type); }

    constructor(){
		super("path");

        /**
         * @type {Array.<SVGPathCommand>}
         * @private
         */
        this._path = null;
    }

    /**
     * @return {string}
     */
    get svgPath() {
        return String(this.getAttribute("path"));
    }

    /**
     * @param value {string}
     */
    set svgPath(value) {
        this.setAttribute("path", value);
        this.path = SVGParserCommon.parsePathData(value);
    }

    /**
     * @return {Array<SVGPathCommand>}
     */
    get path() { return this._path; }

    /**
     * @param value {Array.<SVGPathCommand>}
     */
    set path(value) { this._path = value; }
}