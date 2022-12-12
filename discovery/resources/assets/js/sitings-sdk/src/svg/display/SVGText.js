import SVGTextContainer from "./base/SVGTextContainer";

export default class SVGText extends SVGTextContainer {

    /**
     * @type {string}
     */
    static get CLASS_TYPE() { return "SVGText" };
    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGText.CLASS_TYPE || super.isType(type); }


    constructor(){
		super("text");
		this._textOwner = this;
   }

    /**
	 * -> from SVGTExtContainer
     * @param value {SVGElement}
     */
    setParentElement(value) {
        super.setParentElement(value);

        if(value.isType(SVGText.CLASS_TYPE))
            this.setTextOwner(value);
        else if(value.isType(SVGTextContainer.CLASS_TYPE))
            this.setTextOwner(value["textOwner"]);
        else
            this.setTextOwner(this);
    }
}