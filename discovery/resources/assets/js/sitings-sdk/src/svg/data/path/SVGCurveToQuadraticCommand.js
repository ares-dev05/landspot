import SVGPathCommand from "./SVGPathCommand";


export default class SVGCurveToQuadraticCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGCurveToQuadraticCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGCurveToQuadraticCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute, x1 = 0, y1 = 0, x = 0, y = 0)
	{
        super();
        /**
		 * @type {boolean}
         */
		this.absolute = absolute;
        /**
         * @type {number}
         */
		this.x1 = x1;
        /**
         * @type {number}
         */
		this.y1 = y1;
        /**
         * @type {number}
         */
		this.x = x;
        /**
         * @type {number}
         */
		this.y = y;
	}

	get type() {
		return this.absolute ? "Q" : "q";
	}

	/*
	clone() {
		var copy:SVGCurveToQuadraticCommand = new SVGCurveToQuadraticCommand(absolute);
		copy.x1 = x1;
		copy.y1 = y1;
		copy.x = x;
		copy.y = y;
		return copy;
	}
	*/
}