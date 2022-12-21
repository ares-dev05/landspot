import SVGPathCommand from "./SVGPathCommand";

export default class SVGCurveToCubicSmoothCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGCurveToCubicSmoothCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGCurveToCubicSmoothCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute, x2 = 0, y2 = 0, x = 0, y = 0)
	{
        super();
        /**
		 * @type {boolean}
         */
		this.absolute = absolute;
        /**
         * @type {number}
         */
		this.x2 = x2;
        /**
         * @type {number}
         */
        this.y2 = y2;
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
		return this.absolute ? "S" : "s";
	}

	/*
	clone() {
		var copy:SVGCurveToCubicSmoothCommand = new SVGCurveToCubicSmoothCommand(absolute);
		copy.x2 = x2;
		copy.y2 = y2;
		copy.x = x;
		copy.y = y;
		return copy;
	}
	*/
}