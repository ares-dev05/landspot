import SVGPathCommand from "./SVGPathCommand";

export default class SVGLineToCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGLineToCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGLineToCommand.CLASS_TYPE || super.isType(type); }

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
		return this.absolute ? "L" : "l";
	}

	/*
	clone() {
		var copy:SVGLineToCommand = new SVGLineToCommand(absolute);
		copy.x = x;
		copy.y = y;
		return copy;
	}
	*/
}