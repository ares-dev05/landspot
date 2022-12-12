import EventBase from "../../events/EventBase";

export default class SVGEvent extends EventBase {

    static get PARSE_START() { return "svg.parseStart"; }
    static get PARSE_COMPLETE() { return "svg.parseComplete" };
    static get ELEMENT_ADDED() { return "svg.elementAdded" };
    static get ELEMENT_REMOVED() { return "svg.elementRemoved" };

    /**
     * @param type {string}
	 * @param dispatcher {Object}
     * @param element {SVGElement}
     * @param bubbles {boolean}
     * @param cancelable {boolean}
     */
	constructor(type, dispatcher, element = null, bubbles = false, cancelable = false){
		super(type, dispatcher, bubbles, cancelable);

        /**
		 * @type {SVGElement}
		 * @private
         */
		this._element = element;
    }

    /**
     * @return {SVGElement}
     */
	get element() {return this._element;}
}