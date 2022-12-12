import SVGContainer from "./base/SVGContainer";

export default class SVGG extends SVGContainer {

    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return "SVGG" };

    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGG.CLASS_TYPE || super.isType(type); }

    constructor() {
		super("g");
	}
}