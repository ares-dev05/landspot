
import SVGContainer from "./base/SVGContainer";
import SVGEvent from "../events/SVGEvent";
import AsyncSVGParser from "../parser/AsyncSVGParser";

import EventBase from "../../events/EventBase";

export default class SVGDocument extends SVGContainer {

    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return "SVGDocument" };
    /**
     * @param type {string}
     * @return {boolean}
     */
    isType(type) { return type === SVGDocument.CLASS_TYPE || super.isType(type); }


    constructor(){
        super("document");

        /**
         * @type {AsyncSVGParser}
         * @private
         */
        this._parser = null;

        /**
         * @type {boolean}
         * @private
         */
        this._parsing = false;

        /**
         * @type {Object}
         * @private
         */
        this._definitions = {};

        /**
         * Determines if the document should parse the XML synchronous, without spanning processing on multiple frames
		 * @type {boolean}
         */
        this.forceSynchronousParse = false;
    }

    /**
     * @return {SVGDocument}
     */
    get document() { return this; }

    /**
     * @param svgData {string}
     */
    parseString(svgData) {
		this.parseDocument(
			new DOMParser().parseFromString(svgData.trim(), "text/xml")
		);
	}

    /**
     * @param doc {Document}
     */
    parseDocument(doc) {
        this.clear();

        if (this._parsing)
            this._parser.cancel();
        this._parsing = true;

		this.dispatchEvent(new SVGEvent(SVGEvent.PARSE_START, this));

        this._parser = new AsyncSVGParser(this, doc);
        this._parser.addEventListener(EventBase.COMPLETE, this.parseCompleteHandler, this);
        this._parser.parse(this.forceSynchronousParse);
    }

    /**
     * @param e {EventBase}
     */
    parseCompleteHandler(e=null) {
        this._parsing = false;
        this._parser = null;

		this.dispatchEvent(new SVGEvent(SVGEvent.PARSE_COMPLETE, this));
    }

    /**
     * @return {Array.<string>}
     */
    listDefinitions() {
        let definitionsList = [];
        for(let id in this._definitions)
            definitionsList.push(id);
        return definitionsList;
    }

    /**
     * @param id {string}
     * @param object {Object}
     */
    addDefinition(id, object) {
        if(!this._definitions[id]){
            this._definitions[id] = object;
        }
    }

    /**
     * @param id {string}
     * @return {boolean}
     */
    hasDefinition(id) {
        return this._definitions[id] != null;
    }

    /**
     * @param id {string}
     * @return {*}
     */
    getDefinition(id) {
        return this._definitions[id];
    }

    /**
     * @param id {string}
     */
    removeDefinition(id) {
        if (this._definitions[id])
            this._definitions[id] = null;
    }

    /**
     * @param element {SVGElement}
     */
    onElementAdded(element) {
        if (this.hasEventListener(SVGEvent.ELEMENT_ADDED))
            this.dispatchEvent(new SVGEvent(SVGEvent.ELEMENT_ADDED, this, element));
    }

    /**
     * @param element {SVGElement}
     */
    onElementRemoved(element) {
        if (this.hasEventListener(SVGEvent.ELEMENT_REMOVED))
            this.dispatchEvent(new SVGEvent(SVGEvent.ELEMENT_REMOVED, this, element));
    }

    clear() {
        this.id = null;
        this.svgClass = null;
        this.svgClipPath = null;
        this.svgMask = null;
        this.svgTransform = null;

        this._stylesDeclarations = {};

        for(let id in this._definitions) {
            this.removeDefinition(id);
        }

        while(this.numElements > 0) {
            this.removeElementAt(0);
        }
    }
}