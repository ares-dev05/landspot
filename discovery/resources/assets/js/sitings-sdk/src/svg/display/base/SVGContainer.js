import SVGElement from "./SVGElement";

export default class SVGContainer extends SVGElement {

    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return "SVGContainer" };

    /**
     * @param type
     * @return {boolean}
     */
    isType(type) { return type === SVGContainer.CLASS_TYPE || super.isType(type); }

	constructor(tagName)
	{
		super(tagName);

        /**
		 * @type {Array.<SVGElement>}
		 * @private
         */
        this._elements = [];
    }

    /**
     * @param element {SVGElement}
     */
	addElement(element) {
		this.addElementAt(element, this.numElements);
	}

    /**
     * @param element {SVGElement}
     * @param index {number}
     */
	addElementAt(element, index) {
		if (this._elements.indexOf(element) === -1){
			this._elements.splice(index, 0, element);
			this.attachElement(element);
		}
	}

    /**
     * @param index {number}
     * @return SVGElement}
     */
	getElementAt(index) { return this._elements[index]; }

    /**
     * @return {number}
     */
	get numElements() { return this._elements.length; }

    /**
     * @param element {SVGElement}
     */
	removeElement(element) {
		this.removeElementAt(this._elements.indexOf(element));
	}

    /**
     * @param index {number}
     */
	removeElementAt(index) {
		if(index >= 0 && index < this.numElements){
			this.detachElement(
				this._elements.splice(index, 1)[0]
			);
		}
	}
}