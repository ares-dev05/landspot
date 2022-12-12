import SVGPathCommand from "./SVGPathCommand";

export default class SVGCurveToCubicCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGCurveToCubicCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGCurveToCubicCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute, x1 = 0, y1 = 0, x2 = 0, y2 = 0, x = 0, y = 0)
	{
		super();
        /**
		 * @type {Boolean}
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
		return this.absolute ? "C" : "c";
	}

	/*
	clone() {
		var copy:SVGCurveToCubicCommand = new SVGCurveToCubicCommand(absolute);
		copy.x1 = x1;
		copy.y1 = y1;
		copy.x2 = x2;
		copy.y2 = y2;
		copy.x = x;
		copy.y = y;
		return copy;
	}
	*/
}