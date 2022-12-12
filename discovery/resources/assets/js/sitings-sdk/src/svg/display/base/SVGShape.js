import SVGGraphicsElement from "./SVGGraphicsElement";

export default class SVGShape extends SVGGraphicsElement {

    static get CLASS_TYPE() { return "SVGShape" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGShape.CLASS_TYPE || super.isType(type); }

    /**
     * @param tagName {string}
     */
    constructor(tagName){
        super(tagName);
    }
}