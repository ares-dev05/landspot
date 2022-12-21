import SVGPathCommand from "./SVGPathCommand";

export default class SVGClosePathCommand extends SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGClosePathCommand" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGClosePathCommand.CLASS_TYPE || super.isType(type); }

    get type() {
		return "z";
	}

	clone() {
		return new SVGClosePathCommand();
	}
}