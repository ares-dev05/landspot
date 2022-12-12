import SVGPathCommand from "./SVGPathCommand";

export default class SVGArcToCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGArcToCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGArcToCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute = false, rx = 0, ry = 0, xAxisRotation = 0, largeArc = false, sweep = false, x = 0, y = 0)
	{
		super();

        /**
         * @type {boolean}
         */
		this.absolute = absolute;

        /**
         * @type {number}
         */
		this.rx = rx;
        /**
         * @type {number}
         */
		this.ry = ry;
        /**
         * @type {number}
         */
		this.xAxisRotation = xAxisRotation;
        /**
         * @type {boolean}
         */
		this.largeArc = largeArc;
        /**
         * @type {boolean}
         */
		this.sweep = sweep;
        /**
         * @type {number}
         */
		this.x = x;
        /**
         * @type {number}
         */
		this.y = y;
    }

    /**
     * @return {string}
     */
	get type() {
		return this.absolute ? "A" : "a";
	}

	clone() {
		let copy = new SVGArcToCommand(this.absolute);
		copy.rx = this.rx;
		copy.ry = this.ry;
		copy.xAxisRotation = this.xAxisRotation;
		copy.largeArc = this.largeArc;
		copy.sweep = this.sweep;
		copy.x = this.x;
		copy.y = this.y;
		return copy;
	}
}