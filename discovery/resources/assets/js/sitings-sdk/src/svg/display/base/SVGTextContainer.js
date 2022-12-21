import SVGGraphicsElement from "./SVGGraphicsElement";
import SVGElement from "./SVGElement";

export default class SVGTextContainer extends SVGGraphicsElement
{
    /**
     * @type {string}
     */
    static get CLASS_TYPE() { return "SVGTextContainer" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGTextContainer.CLASS_TYPE || super.isType(type); }


    /**
     * @param tagName {string}
     */
    constructor(tagName) {
        super(tagName);

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
         * @type {SVGText}
         * @private
         */
        this._textOwner = null;
        /**
         * @type {Array<Object>}
         * @private
         */
        this._textElements = [];
    }

    /**
     * @return {string}
     */
    get svgX() { return this._svgX; }
    /**
     * @param value {string}
     */
    set svgX(value) {this._svgX = value;}

    /**
     * @return {string}
     */
    get svgY() { return this._svgY; }
    /**
     * @param value {string}
     */
    set svgY(value) {this._svgY = value;}

    /**
     * @return {SVGText}
     */
    get textOwner() { return this._textOwner; }

    /**
     * @param value {SVGText}
     */
    setTextOwner(value) {
        if(this._textOwner !== value){
            this._textOwner = value;

            this._textElements.forEach(function(element) {
				if (element.isType(SVGTextContainer.CLASS_TYPE)) {
                    element.setTextOwner(value);
				}
			});
        }
    }

    /**
     * @param element {Object}
     */
    addTextElement(element) {
        this.addTextElementAt(element, this.numTextElements);
    }

    /**
     * @param element {Object}
     * @param index {int}
     */
    addTextElementAt(element, index) {
        this._textElements.splice(index, 0, element);

        if(element.hasOwnProperty("isType") && element.isType(SVGElement.CLASS_TYPE)) {
            this.attachElement(element);
        }
    }

    /**
     * @param index {number}
     * @return {Object}
     */
    getTextElementAt(index) {
        return this._textElements[index];
    }

    /**
     * @return {number}
     */
    get numTextElements() {
        return this._textElements.length;
    }

    /**
     * @param index {number}
     */
    removeTextElementAt(index) {
        if(index < 0 || index >= this.numTextElements)
            return;

        /**
         * @type {SVGElement}
         */
        let element = this._textElements[index];
        if(element.isType(SVGElement.CLASS_TYPE))
        	this.detachElement(element);
    }
}