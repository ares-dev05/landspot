import SVGPathCommand from "./SVGPathCommand";

export default class SVGLineToHorizontalCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGLineToHorizontalCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGLineToHorizontalCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute, x = 0)
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
	}

	get type() {
		return this.absolute ? "H" : "h";
	}

	/*
	clone() {
		var copy:SVGLineToHorizontalCommand = new SVGLineToHorizontalCommand(absolute);
		copy.x = x;
		return copy;
	}
	*/
}