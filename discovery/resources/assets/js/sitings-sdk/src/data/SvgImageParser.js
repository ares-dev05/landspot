import ModelBase from '../model/ModelBase';
import SVGEvent from '../svg/events/SVGEvent';
import SVGG from '../svg/display/SVGG';
import SVGContainer from '../svg/display/base/SVGContainer';
import SVGDocument from '../svg/display/SVGDocument';
import EventBase from '../events/EventBase';
import ProgressEventBase from '../events/ProgressEventBase';

export default class SvgImageParser extends ModelBase {

	/**
     * @param data {string}
	 * @param asynchronous {boolean}
	 * @param context {*}
	 */
	constructor(data, asynchronous=false, context=null)
	{
		super(context);

        /**
         * @type {String}
         * @protected
         */
        this._metaData = data;

        /**
		 * @type {SVGG[]}
         */
        this._groups	= null;

        /**
         * @type {boolean}
         * @private
         */
        this._parseStarted	= false;
        /**
         * @type {boolean}
         * @private
         */
        this._parseFinished	= false;

        /**
         * @type {SVGDocument}
         * @private
         */
        this._document	= new SVGDocument();

        /**
		 * @MD 28 JUNE 2018 - we have no need to validate & render the document after it's been parsed, as we'll do our own rendering.
		 * Plus, we just need it to be parsed so that we have access to its structure; This decreases the load times significantly
		 */
		this._document.validateAfterParse = false;
        this._document.addEventListener(ProgressEventBase.PROGRESS, this.svgDocumentProgress, this);
        this._document.addEventListener(SVGEvent.PARSE_COMPLETE, this.svgDocumentRendered, this);
	}

    /**
     * @return {boolean}
     */
    get parseStarted () { return this._parseStarted; }

    /**
     * @return {boolean}
     */
    get parseFinished() { return this._parseFinished; }

    /**
     * @return {SVGDocument}
     */
    get document()		{ return this._document; }

    /**
     * @return {SVGG[]}
     */
    get groups()		{ return this._groups; }

	/**
	 * return {Boolean}
	 */
	get hasData()		{ return this._metaData !== null; }

    parse()
	{
		if (!this._parseStarted) {
            this._parseStarted = true;
            this._document.parseString(this._metaData);
        }
	}

    /**
     * @param e {ProgressEventBase}
     */
	svgDocumentProgress(e) { this.dispatchEvent(e); }

	svgDocumentRendered(e)
	{
		this._groups	= [];
		this.parseContainer(this._document);
        this.onAfterParse();
        this._parseFinished = true;

        this.dispatchEvent( new EventBase(EventBase.COMPLETE, this) );
	}

    /**
	 * @override in sub-classes
     */
	onAfterParse() { }

    /**
     * @param c {*|SVGContainer}
     */
	parseContainer(c)
	{
		for (let i=0, element; i<c.numElements; ++i)
		{
			element = c.getElementAt(i);
			if(!element) {
				console.error(`Skipping empty element ${i}`);
				continue;
			}
			if (element.isType(SVGG.CLASS_TYPE)) {
                this._groups.push(element);
			}
			if (element.isType(SVGContainer.CLASS_TYPE))
			{
				this.parseContainer(element);
			}
		}
	}

	cleanup()
	{
		try {
			this._metaData = null;
            this._groups = null;
			if ( this._document ) {
                this._document.clear();
                this._document = null;
			}
		}	catch(e) {
		}
	}
}