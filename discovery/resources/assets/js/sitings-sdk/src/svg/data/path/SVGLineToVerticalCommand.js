import SVGPathCommand from "./SVGPathCommand";

export default class SVGLineToVerticalCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGLineToVerticalCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGLineToVerticalCommand.CLASS_TYPE || super.isType(type); }

    constructor(absolute, y = 0)
    {
        super();
        /**
         * @type {boolean}
         */
        this.absolute = absolute;
        /**
         * @type {number}
         */
        this.y = y;
    }

    get type() {
        return this.absolute ? "V" : "v";
    }
}