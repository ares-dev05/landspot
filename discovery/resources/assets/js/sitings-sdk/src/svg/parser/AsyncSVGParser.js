import VisitDefinition from  './VisitDefinition';
import Process from '../../processing/Process';
import SVG from '../display/SVG';
import SVGG from '../display/SVGG';
import SVGRect from '../display/SVGRect';
import SVGPath from '../display/SVGPath';
import SVGPolygon from '../display/SVGPolygon';
import SVGPolyline from '../display/SVGPolyline';
import SVGLine from '../display/SVGLine';
import SVGText from '../display/SVGText';
import SVGParserCommon from '../parser/SVGParserCommon';
import SVGContainer from '../display/base/SVGContainer';
import SVGUtil from '../utils/SVGUtil';
import StringUtil from '../utils/StringUtil';
import EventDispatcher from '../../events/EventDispatcher';
import EventBase from '../../events/EventBase';

export default class AsyncSVGParser extends EventDispatcher
{
    // protected namespace svg = "http://www.w3.org/2000/svg";

    /**
     * @param target {SVGDocument}
     * @param svg {Document}
     * @param context
     */
	constructor(target, svg, context=null)
    {
        super(context);
        /**
         * @type {SVGDocument}
         * @private
         */
        this._target = target;

        /**
         * @type {Document}
         * @private
         */
        this._svg = svg;

        /**
         * @type {Array.<VisitDefinition>}
         * @private
         */
        this._visitQueue = [];

        /**
         * @type {Process}
         * @private
         */
        this._process = null;
    }

    /**
     * @param synchronous {Boolean} parse right away or in a threaded manner
     */
    parse(synchronous = false) {
        let scope = this;
        this._visitQueue = [];

        // read the document children and add all the XML elements
        let docChildren = this._svg.childNodes;
        for (let i=0; i<docChildren.length; ++i) {
            let childNode = docChildren[i];
            if (childNode.nodeType===Node.ELEMENT_NODE) {
                this._visitQueue.push(new VisitDefinition(
                    childNode, function(obj) {
                        scope._target.addElement(obj);
                    }
                ));
            }
        }

        this._process = new Process(null, this.executeLoop, this.parseComplete, this);

        if(synchronous)
            this._process.execute();
        else
            this._process.start();
    }

    /**
	 * cancel parsing
     */
    cancel() {
        this._process.stop();
        this._process = null;
    }

    /**
     * @return {number}
     */
    executeLoop() {
        let newVisits = this.visit(this._visitQueue.shift());
        if (newVisits && newVisits.length) {
            this._visitQueue = newVisits.concat(this._visitQueue);
        }

        return this._visitQueue.length===0 ? Process.COMPLETE : Process.CONTINUE;
    }

    /**
	 * report completion to listeners
     */
    parseComplete() {
        this.dispatchEvent(new EventBase(EventBase.COMPLETE));
        this._process = null;
    }

    /**
     * @param visitDefinition {VisitDefinition}
     * @return {Array}
     */
    visit(visitDefinition) {
        let childVisits = [];

        /**
         * @type {Element}
         */
        let elt = visitDefinition.node;
        let obj;

        if(elt.nodeType === Node.TEXT_NODE){
            obj = elt.toString();
        }   else if(elt.nodeType === Node.ELEMENT_NODE){
            let localName = elt.localName.toLowerCase();

            switch(localName) {
                case 'svg': obj = AsyncSVGParser.visitSvg(elt); break;
                case 'rect': obj = AsyncSVGParser.visitRect(elt); break;
                case 'path': obj = AsyncSVGParser.visitPath(elt); break;
                case 'polygon': obj = AsyncSVGParser.visitPolygon(elt); break;
                case 'polyline': obj = AsyncSVGParser.visitPolyline(elt); break;
                case 'line': obj = AsyncSVGParser.visitLine(elt); break;
                case 'g': obj = AsyncSVGParser.visitG(); break;
                case 'text': obj = AsyncSVGParser.visitText(elt, childVisits); break;
                default: console.log('unsupported SVG node type \''+localName+'\'');
            }
        }

        if (SVGUtil.isSVGElement(obj)){
            /**
             * type {SVGElement}
             */
            let element = obj;

            element.id = elt.getAttribute('id');

            // @UNUSED
            // element.metadata = elt.svg::metadata[0];

            //Save in definitions
            if(element.id != null && element.id !== '')
                this._target.addDefinition(element.id, element);

            if(elt.hasAttribute('transform'))
                element.svgTransform = elt.getAttribute('transform');

            /*
            SVGUtil.presentationStyleToStyleDeclaration(elt, element.style);

            if("@style" in elt)
                element.style.fromString(elt.@style);

            if("@class" in elt)
                element.svgClass = String(elt["@class"]);

            if("@clip-path" in elt)
                element.svgClipPath = String(elt["@clip-path"]);

            if("@mask" in elt)
                element.svgMask = String(elt.@mask);
            */

            if(element.isType(SVGContainer.CLASS_TYPE)){
                /**
                 * @type {SVGContainer}
                 */
                let container = element;

                for (let i=0; i<elt.childNodes.length; ++i) {
                    /**
                     * @type {Node}
                     */
                    let childElt = elt.childNodes[i];

                    childVisits.push(new VisitDefinition(childElt, function(child) {
                        if(SVGUtil.isSVGElement(child)){
                            container.addElement(child);
                        }
                    }));
                }
            }
        }

        if (visitDefinition.onComplete != null)
            visitDefinition.onComplete(obj);

        return childVisits;
    }

    /**
     * @param elt {Element}
     * @return {SVG}
     */
    static visitSvg(elt) {
        let obj = new SVG();

        obj.svgX = elt.hasAttribute('x') ? elt.getAttribute('x') : null;
        obj.svgY = elt.hasAttribute('y') ? elt.getAttribute('y') : null;
        obj.svgWidth  = elt.hasAttribute('width') ? elt.getAttribute('width') : null;
        obj.svgHeight = elt.hasAttribute('height') ? elt.getAttribute('height') : null;

        return obj;
    }

    /**
     * @param elt {Element}
     * @return {SVGRect}
     */
    static visitRect(elt) {
        let obj = new SVGRect();

        obj.svgX = elt.getAttribute('x');
        obj.svgY =  elt.getAttribute('y');
        obj.svgWidth =  elt.getAttribute('width');
        obj.svgHeight =  elt.getAttribute('height');
        obj.svgRx =  elt.getAttribute('rx');
        obj.svgRy =  elt.getAttribute('ry');

        return obj;
    }

    /**
     * @param elt {Element}
     * @return {SVGPath}
     */
    static visitPath(elt) {
        let obj = new SVGPath();
        obj.path = SVGParserCommon.parsePathData(elt.getAttribute('d'));
        return obj;
    }

    /**
     * @param elt {Element}
     * @return {SVGPolygon}
     */
    static visitPolygon(elt) {
        let obj = new SVGPolygon();
        obj.points = SVGParserCommon.splitNumericArgs(elt.getAttribute('points'));
        return obj;
    }

    /**
     * @param elt {Element}
     * @return {SVGPolyline}
     */
    static visitPolyline(elt) {
        let obj = new SVGPolyline();
        obj.points = SVGParserCommon.splitNumericArgs(elt.getAttribute('points'));
        return obj;
    }

    /**
     * @param elt {Element}
     * @return {SVGLine}
     */
    static visitLine(elt) {
        let obj = new SVGLine();

        obj.svgX1 = elt.getAttribute('x1');
        obj.svgY1 = elt.getAttribute('y1');
        obj.svgX2 = elt.getAttribute('x2');
        obj.svgY2 = elt.getAttribute('y2');

        return obj;
    }

    /**
     * @return {SVGG}
     */
    static visitG() {
        return new SVGG();
    }

    /**
     * @param elt {Element}
     * @param childVisits {Array}
     * @return {SVGText}
     */
    static visitText(elt, childVisits) {
        let obj = new SVGText();

        obj.svgX = elt.hasAttribute('x') ? elt.getAttribute('x') : '0';
        obj.svgY = elt.hasAttribute('y') ? elt.getAttribute('y') : '0';

        let numChildrenToVisit = 0;
        let visitNumber = 0;

        for (let i=0; i<elt.childNodes.length; ++i) {
            const childElt = elt.childNodes[i];
            numChildrenToVisit++;

            const childText = childElt.data ? childElt.data.toString() : childElt.textContent ? childElt.textContent.toString() : null;

            if(childElt) {
                if (typeof childElt === 'string' || childText){
                    let str = childText ? childText : childElt.toString();

                    str = SVGUtil.prepareXMLText(str);

                    if(visitNumber === 0)
                        str = StringUtil.ltrim(str);

                    else if(visitNumber === numChildrenToVisit - 1)
                        str = StringUtil.rtrim(str);

                    if(StringUtil.trim(str) !== '') {
                        obj.addTextElement(str);
                    }
                }   else {
                    obj.addTextElement(childElt);
                }
            }
            visitNumber++;
        }
        return obj;
    }
}