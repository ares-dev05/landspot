import SVGParserCommon from '../../parser/SVGParserCommon';
import EventDispatcher from '../../../events/EventDispatcher';


export default class SVGElement extends EventDispatcher {

    /**
     * @return {string}
     * @constructor
     */
	static get CLASS_TYPE() { return 'SVGElement'; }

	/**
     * @param type {string}
     * @return {boolean}
     */
	isType(type) { return type === SVGElement.CLASS_TYPE; }


	/**
     * @param tagName {string}
     */
	constructor(tagName) {
		super(tagName);

        this._type	= tagName;

        /**
         * @type {string}
         * @private
         */
        this._type = null;

        /**
         * @type {string}
         * @private
         */
        this._id = null;

        /**
         * @type {SVGElement}
         * @private
         */
		this._parentElement = null;
        /**
         * @type {SVGDocument}
         * @private
         */
        this._document = null;
        /**
         * @type {Object}
         * @private
         */
        this._attributes = {};

        /**
		 * new Vector.<SVGElement>()
		 * @type {Array}
         */
        this._elementsAttached = [];
	}

    /**
     * @return {string}
     */
	get type() { return this._type; }

    /**
     * @return {string}
     */
	get id() { return this._id; }

    /**
     * @param value {string}
     */
	set id(value) { this._id = value; }

    /**
     * @return {string}
     */
	get svgClass() { return String(this.getAttribute("class")); }

    /**
     * @param value {string}
     */
	set svgClass(value) { this.setAttribute('class', value); }

    /**
     * @return {string}
     */
	get svgClipPath() { return String(this.getAttribute('clip-path')); }

    /**
     * @param value {string}
     */
	set svgClipPath(value) { this.setAttribute('clip-path', value); }

    /**
     * @return {string}
     */
	get svgMask() { return String(this.getAttribute('mask')); }

    /**
     * @param value {string}
     */
	set svgMask(value) { this.setAttribute('mask', value); }

    /**
     * @return {string}
     */
	get svgTransform() { return String(this.getAttribute('transform')); }

    /**
     * @param value {string}
     */
	set svgTransform(value) { this.setAttribute('transform', value); }

    /**
     * @param name {string}
     * @return {*}
     */
	getAttribute(name) { return this._attributes[name]; }

    /**
     * @param name {string}
     * @param value {*}
     */
	setAttribute(name, value) {
		if(this._attributes[name] !== value){
			let oldValue = this._attributes[name];
			this._attributes[name] = value;
			this._onAttributeChanged(name, oldValue, value);
		}
	}

    /**
     * @param name {string}
     */
	removeAttribute(name) { delete this._attributes[name]; }

    /**
     * @param name {string}
     * @return {boolean}
     */
	hasAttribute(name) { return name in this._attributes; }

    /**
     * @param attributeName {string}
     * @param oldValue {*}
     * @param newValue {*}
     * @private
	 * @UNUSED
     */
	_onAttributeChanged(attributeName, oldValue, newValue) {
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Stores a list of elements that are attached to this element

    /**
     * @param element {SVGElement}
     */
	attachElement(element) {
		if (this._elementsAttached.indexOf(element)===-1){
			this._elementsAttached.push(element);

			try {
				element.setParentElement(this);
			}	catch (e) {
				console.log(element);
			}
		}
	}

    /**
     * @param element {SVGElement}
     */
	detachElement(element) {
		let index = this._elementsAttached.indexOf(element);
		if (index !== -1){
			this._elementsAttached.splice(index, 1);
			element.setParentElement(null);
		}
	}

    /**
     * @return {SVGElement}
     */
	get parentElement() { return this._parentElement; }

    /**
     * @param value {SVGElement}
	 * @protected
     */
	setParentElement(value) {
		if(this._parentElement !== value){
            this._parentElement = value;
            this.setSVGDocument(value != null ? value.document : null);
		}
	}

    /**
     * @param value {SVGDocument}
	 * @private
     */
	setSVGDocument(value) {
		if(this._document !== value){
			if (this._document)
                this._document.onElementRemoved(this);

            this._document = value;

			if (this._document)
                this._document.onElementAdded(this);

			/**
             * @type SVGElement
             */
            this._elementsAttached.forEach(function(element) {
                element.setSVGDocument(value);
			});
		}
	}

    /**
     * @return {SVGDocument}
     */
	get document() {
		return this._document;
	}

    /**
     * @return {Matrix}
     */
	computeTransformMatrix() {
		return SVGParserCommon.parseTransformation(this.svgTransform);
	}
}