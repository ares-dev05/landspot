import SVGPathCommand from "./SVGPathCommand";

export default class SVGMoveToCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGMoveToCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGMoveToCommand.CLASS_TYPE || super.isType(type); }

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
		return this.absolute ? "M" : "m";
	}

	/*
	clone() {
		var copy:SVGMoveToCommand = new SVGMoveToCommand(absolute);
		copy.x = x;
		copy.y = y;
		return copy;
	}
	*/
}