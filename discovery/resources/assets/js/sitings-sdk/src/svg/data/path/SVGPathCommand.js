export default class SVGPathCommand
{
    static get CLASS_TYPE() { return "SVGPathCommand" };

    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGPathCommand.CLASS_TYPE; }

    constructor()
	{
		this._something = true;
	}

	get type() {
		return "";
	}

	clone() {
		throw new Error("Not Implemented On This Class");
		// return null;
	}
}
