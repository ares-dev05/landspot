
import SVGShape from './base/SVGShape';

export default class SVGRect extends SVGShape {

    static get CLASS_TYPE() { return 'SVGRect' };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGRect.CLASS_TYPE || super.isType(type); }

    constructor(){
        super('rect');

        /**
         * @type {string}
         * @private
         */
        this._svgX = null;
        /**
         * @type {string}
         * @private
         */
        this._svgY = null;
        /**
         * @type {string}
         * @private
         */
        this._svgWidth = null;
        /**
         * @type {string}
         * @private
         */
        this._svgHeight = null;
        /**
         * @type {string}
         * @private
         */
        this._svgRx = null;
        /**
         * @type {string}
         * @private
         */
        this._svgRy = null;
    }


    /**
     * @return {string}
     */
    get svgX() {
        return this._svgX;
    }
    /**
     * @param value {string}
     */
    set svgX(value) {
        if(this._svgX !== value){
            this._svgX = value;
        }
    }

    /**
     * @return {string}
     */
    get svgY() {
        return this._svgY;
    }
    /**
     * @param value {string}
     */
    set svgY(value) {
        if(this._svgY !== value){
            this._svgY = value;
        }
    }

    /**
     * @return {string}
     */
    get svgWidth() {
        return this._svgWidth;
    }
    /**
     * @param value {string}
     */
    set svgWidth(value) {
        if(this._svgWidth !== value){
            this._svgWidth = value;
        }
    }

    /**
     * @return {string}
     */
    get svgHeight() {
        return this._svgHeight;
    }
    /**
     * @param value {string}
     */
    set svgHeight(value) {
        if(this._svgHeight !== value){
            this._svgHeight = value;
        }
    }

    /**
     * @return {string}
     */
    get svgRx() {
        return this._svgRx;
    }
    /**
     * @param value {string}
     */
    set svgRx(value) {
        if(this._svgRx !== value){
            this._svgRx = value;
        }
    }

    /**
     * @return {string}
     */
    get svgRy() {
        return this._svgRy;
    }
    /**
     * @param value {string}
     */
    set svgRy(value) {
        if(this._svgRy !== value){
            this._svgRy = value;
        }
    }
}