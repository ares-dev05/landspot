import * as PIXI from 'pixi.js';
import m from '../../../../utils/DisplayManager';
import EventBase from '../../../../events/EventBase';
import Utils from '../../../../utils/Utils';
import Render from '../../../global/Render';
import ThemeManager from '../../theme/ThemeManager';
import ExistingRetainingWall from '../../../model/levels/segmentation/ExistingRetainingWall';
import EasementEvent from '../../../events/EasementEvent';

export default class ExistingRetainingWallView extends PIXI.Container {

    /**
     * @param model {ExistingRetainingWall}
     */
    constructor(model) {
        super();

        /**
         * @type {ExistingRetainingWall}
         * @private
         */
        this._model = model;

        this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);
        this._model.addEventListener(EasementEvent.DELETE, this.modelDeleted, this);

        /**
         * @type {Graphics}
         * @private
         */
        this._graphics = new PIXI.Graphics();

        this.addChild(this._graphics);

        m.instance.addEventListener(EventBase.CHANGE, this.modelChanged, this);

        this.render();
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
            this._model.removeEventListener(EasementEvent.DELETE, this.modelDeleted, this);

            this._model = null;
        }

        m.instance.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
        Utils.removeParentOfChild(this);
    }

    /**
     * @private
     * @return {number}
     */
    get highlightThickness() { return 3; }

    /**
     * @return {number}
     */
    get highlightColor() {
        return ThemeManager.i.theme.getColor('color_class_2');
    }

    /**
     * @private
     * @returns {number}
     */
    get lineThickness() { return 1; }

    /**
     * @private
     * @returns {number}
     */
    get currentColor() {
        return (this._model && this._model.highlight === ExistingRetainingWall.HIGHLIGHT_FULL) ? 0xc94742 : 0x0a75f0;
    }

    /**
     * @private
     */
    render() {
        this._graphics.clear();
        this._graphics.lineStyle(this.lineThickness, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

        if (!this._model) {
            return;
        }

        /**
         * @param points {Point[]}
         * @return {*}
         */
        const drawPoints = (points) => points.forEach(
            (point, index) => !index ?
                this._graphics.moveTo(m.px(point.x), m.px(point.y)) :
                this._graphics.lineTo(m.px(point.x), m.px(point.y))
        );

        if (this._model.corners.length > 0) {
            this._graphics.beginFill(this.currentColor, 0.5);
            drawPoints([...this._model.corners, this._model.corners[0]]);
            this._graphics.endFill();
        }

        if (this._model.highlightArea.length) {
            this._graphics.lineStyle(this.highlightThickness, this.highlightColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
            drawPoints(this._model.highlightArea);
        }
    }
}