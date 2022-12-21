import * as PIXI from 'pixi.js';
import m from '../../../../utils/DisplayManager';
import EventBase from '../../../../events/EventBase';
import ModelEvent from '../../../events/ModelEvent';
import Utils from '../../../../utils/Utils';
import Render from '../../../global/Render';
import LineDrawer from '../../../render/LineDrawer';

export default class SegmentationPathView extends PIXI.Container {

    /**
     * @param model {SegmentationPath}
     */
    constructor(model) {
        super();

        /**
         * @type {SegmentationPath}
         * @private
         */
        this._model = model;

        this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);
        this._model.addEventListener(ModelEvent.DELETE, this.modelDeleted, this);

        /**
         * @type {Graphics}
         * @private
         */
        this._graphics = new PIXI.Graphics();

        this.addChild(this._graphics);

        m.instance.addEventListener(EventBase.CHANGE, this.modelChanged, this);
    }

    modelChanged() {
        this.render();
    }

    /**
     * @private
     */
    modelDeleted() {
        if (this._model) {
            this._model.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
            this._model.removeEventListener(ModelEvent.DELETE, this.modelDeleted, this);

            this._model = null;
        }

        m.instance.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
        Utils.removeParentOfChild(this);
    }

    /**
     * @private
     * @returns {number}
     */
    get lineThickness() { return this._model.closed ? 2 : 3; }

    /**
     * @private
     * @returns {number}
     */
    get lineColor()     { return this._model.closed ? 0x333333 : 0xAA3311; }

    /**
     * @private
     */
    render() {
        this._graphics.clear();
        this._graphics.lineStyle(this.lineThickness, this.lineColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

        for (let i=0; i<this._model.points.length-1; ++i) {
            const A = this._model.points[i];
            const B = this._model.points[i + 1];
            LineDrawer.drawDashedLine(this._graphics, m.px(A.x), m.px(A.y), m.px(B.x), m.px(B.y));
        }

        if (!this._model.closed) {
            this._graphics.lineStyle(this.lineThickness, this.lineColor, 0.65, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

            // draw a point on each
            this._model.points.forEach(
                point => {
                    this._graphics.beginFill(0xBB4418, 0.15);
                    this._graphics.drawCircle(m.px(point.x), m.px(point.y), 10);
                    this._graphics.endFill();
                }
            );
        }
    }
}