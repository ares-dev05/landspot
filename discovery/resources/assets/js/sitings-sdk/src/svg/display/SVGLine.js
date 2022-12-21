import SVGShape from "./base/SVGShape";

export default class SVGLine extends SVGShape {

    static get CLASS_TYPE() { return "SVGLine" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGLine.CLASS_TYPE || super.isType(type); }

    constructor(){
		super("line");

        /**
         * @type {string}
         * @private
         */
        this._svgX1 = null;
        /**
         * @type {string}
         * @private
         */
        this._svgX2 = null;
        /**
         * @type {string}
         * @private
         */
        this._svgY1 = null;
        /**
         * @type {string}
         * @private
         */
        this._svgY2 = null;
    }

    /**
     * @return {string}
     */
	get svgX1() {
		return this._svgX1;
	}
    /**
     * @param value {string}
     */
    set svgX1(value) {
        if(this._svgX1 !== value){
            this._svgX1 = value;
        }
    }

    /**
     * @return {string}
     */
    get svgX2() {
        return this._svgX2;
    }
    /**
     * @param value {string}
     */
    set svgX2(value) {
        if(this._svgX2 !== value){
            this._svgX2 = value;
        }
    }

    /**
     * @return {string}
     */
    get svgY1() {
        return this._svgY1;
    }
    /**
     * @param value {string}
     */
    set svgY1(value) {
        if(this._svgY1 !== value){
            this._svgY1 = value;
        }
    }

    /**
     * @return {string}
     */
    get svgY2() {
        return this._svgY2;
    }
    /**
     * @param value {string}
     */
    set svgY2(value) {
        if(this._svgY2 !== value){
            this._svgY2 = value;
        }
    }
}