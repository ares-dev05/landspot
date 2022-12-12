import SVGPathCommand from "./SVGPathCommand";

export default class SVGCurveToQuadraticSmoothCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGCurveToQuadraticSmoothCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGCurveToQuadraticSmoothCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute, x = 0, y = 0)
	{
        super();
        /**
		 * @type {boolean}
         */
		this.absolute = absolute;
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
		return this.absolute ? "T" : "t";
	}

	/*
	clone() {
		var copy:SVGCurveToQuadraticSmoothCommand = new SVGCurveToQuadraticSmoothCommand(absolute);
		copy.x = x;
		copy.y = y;
		return copy;
	}
	*/
}