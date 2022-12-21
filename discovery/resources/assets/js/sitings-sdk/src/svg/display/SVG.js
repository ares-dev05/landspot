import Rectangle from "../../geom/Rectangle";
import SVGContainer from "./base/SVGContainer";

export default class SVG extends SVGContainer
{
    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return "SVG" };

    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVG.CLASS_TYPE || super.isType(type); }

	constructor() {
		super("svg");
	}

    /**
     * @return {Rectangle}
     */
    get svgViewBox() { return Rectangle(this.getAttribute("viewBox")); }

    /**
     * @param value {Rectangle}
     */
    set svgViewBox(value) { this.setAttribute("viewBox", value); }

    /**
     * @return {string}
     */
    get svgPreserveAspectRatio() { return String(this.getAttribute("preserveAspectRatio")); }

    /**
     * @param value {string}
     */
    set svgPreserveAspectRatio(value) { this.setAttribute("preserveAspectRatio", value); }

    /**
     * @return {string}
     */
    get svgX() {
        return String(this.getAttribute("x"));
    }
    /**
     * @param value {string}
     */
    set svgX(value) {
        this.setAttribute("x", value);
    }

    /**
     * @return {string}
     */
    get svgY() {
        return String(this.getAttribute("y"));
    }
    /**
     * @param value {string}
     */
    set svgY(value) {
        this.setAttribute("y", value);
    }

    /**
     * @return {string}
     */
    get svgWidth() {
        return String(this.getAttribute("width"));
    }
    /**
     * @param value {string}
     */
    set svgWidth(value) {
        this.setAttribute("width", value);
    }

    /**
     * @return {string}
     */
    get svgHeight() {
        return String(this.getAttribute("height"));
    }
    /**
     * @param value {string}
     */
    set svgHeight(value) {
        this.setAttribute("height", value);
    }

    /**
     * @return {string}
     */
    get svgOverflow() {
        return String(this.getAttribute("overflow"));
    }
    /**
     * @param value {string}
     */
    set svgOverflow(value) {
        this.setAttribute("overflow", value);
    }
}