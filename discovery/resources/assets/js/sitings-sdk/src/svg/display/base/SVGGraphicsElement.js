import SVGElement from "./SVGElement";

/**
 * No rendering needed/used
 */
export default class SVGGraphicsElement extends SVGElement
{
    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return "SVGGraphicsElement" };

    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGGraphicsElement.CLASS_TYPE || super.isType(type); }

    constructor(tagName){
        super(tagName);
    }
}