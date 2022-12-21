import ChangeDispatcher from '../../../events/ChangeDispatcher';
import DataEvent from '../../../events/DataEvent';
import EventBase from '../../../events/EventBase';
import * as PIXI from 'pixi.js';

export default class LabeledPolygonTheme extends ChangeDispatcher {

    constructor(lineThickness=2, lineColor=0, fillColor=0xEEEEEE, fillAlpha=1, labelFontFamily='Arial', labelFontSize=13, labelColor=0, renderLineEnds=false, context=null)
    {
        super(context);

        /**
         * @type {number}
         * @private
         */
        this._lineThickness = lineThickness;

        /**
         * @type {number}
         * @private
         */
        this._lineColor = lineColor;

        /**
         * @type {number}
         * @private
         */
        this._fillColor = fillColor;

        /**
         * @type {number}
         * @private
         */
        this._fillAlpha = fillAlpha;

        /**
         * @type {string}
         * @private
         */
        this._labelFontFamily = labelFontFamily;

        /**
         * @type {number}
         * @private
         */
        this._labelFontSize  = labelFontSize;

        /**
         * @type {number}
         * @private
         */
        this._labelColor     = labelColor;

        /**
         * @type {boolean}
         * @private
         */
        this._renderLineEnds = renderLineEnds;
    }

    get lineThickness() {
        return this._lineThickness;
    }
    set lineThickness(v) {
        let dataChange = {
            'prop': 'lineThickness',
            'oldValue': this._lineThickness,
            'newValue': v
        };

        this._lineThickness = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    get lineColor() {
        return this._lineColor;
    }
    set lineColor(v) {
        let dataChange = {
            'prop': 'lineColor',
            'oldValue': this._lineColor,
            'newValue': v
        };

        this._lineColor = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    get fillColor() {
        return this._fillColor;
    }
    set fillColor(v) {
        let dataChange = {
            'prop': 'fillColor',
            'oldValue': this._fillColor,
            'newValue': v
        };

        this._fillColor = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    get fillAlpha() {
        return this._fillAlpha;
    }
    set fillAlpha(v) {
        let dataChange = {
            'prop': 'fillAlpha',
            'oldValue': this._fillAlpha,
            'newValue': v
        };

        this._fillAlpha = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    get labelFontFamily() {
        return this._labelFontFamily;
    }
    set labelFontFamily(v) {
        let dataChange = {
            'prop': 'labelFontFamily',
            'oldValue': this._labelFontFamily,
            'newValue': v
        };

        this._labelFontFamily = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    get labelFontSize() {
        return this._labelFontSize;
    }
    set labelFontSize(v) {
        let dataChange = {
            'prop': 'labelFontSize',
            'oldValue': this._labelFontSize,
            'newValue': v
        };

        this._labelFontSize = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    /**
     * @returns {*}
     */
    get labelColor() {
        return this._labelColor;
    }
    /**
     * @param v {*}
     */
    set labelColor(v) {
        let dataChange = {
            'prop': 'labelColor',
            'oldValue': this._labelColor,
            'newValue': v
        };

        this._labelColor = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }

    /**
     * @return {PIXI.TextStyle}
     */
    get labelStyle() {
        return this._labelStyle = this._labelStyle || new PIXI.TextStyle({
            fontFamily	: this._labelFontFamily,
            fontSize	: this._labelFontSize,
            fill		: this._labelColor,
            align		: 'center'
        });
    }

    /**
     * @returns {boolean}
     */
    get renderLineEnds() {
        return this._renderLineEnds;
    }
    /**
     * @param v {boolean}
     */
    set renderLineEnds(v) {
        let dataChange = {
            'prop': 'renderLineEnds',
            'oldValue': this._renderLineEnds,
            'newValue': v
        };

        this._renderLineEnds = v;
        this.dispatchEvent(new DataEvent(EventBase.CHANGE, this, false, false, dataChange));
    }
}