import * as PIXI from 'pixi.js';
import m from '../../../../utils/DisplayManager';
import EventBase from '../../../../events/EventBase';
import EasementEvent from '../../../events/EasementEvent';
import Utils from '../../../../utils/Utils';
import LineDrawer from '../../../render/LineDrawer';
import Render from '../../../global/Render';
import Segment from '../../../../geom/Segment';


export default class LotTruncationView extends PIXI.Sprite {

    /**
     * @param model {LotTruncationModel}
     * @param theme {LabeledPolygonTheme}
     */
    constructor(model, theme) {
        super();

        /**
         * @type {LotTruncationModel}
         * @private
         */
        this._model = model;
        this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);
        this._model.addEventListener(EasementEvent.DELETE, this.modelDeleted, this);

        /**
         * @type {LabeledPolygonTheme}
         * @private
         */
        this._theme				= theme;
        this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

        /**
         * @type {PIXI.Graphics}
         * @private
         */
        this._graphics = new PIXI.Graphics();
        this.addChild(this._graphics);

        // add event for scale up/down
        m.instance.addEventListener(EventBase.CHANGE, this.render, this);

        this.render();
    }

    /**
     * @return LotTruncationModel
     */
    get model() { return this._model; }

    /**
     * @param event {DataEvent}
     */
    onThemeChanged(event)
    {
        if (event.data.prop==='lineThickness' || event.data.prop==='lineColor') {
            this.render();
        }
    }

    get currentColor() {
        return this.model.highlight ? 0x00AAEE : !this.model.valid ? 0x00AAEE : this._theme.lineColor;
    }

    render()
    {
        this._graphics.clear();

        let edges = [], dash=LineDrawer.DASH_LENGTH, weight=this._theme.lineThickness;

        // draw background
        if (this._model.valid) {
            this._graphics.lineStyle(0, 0, 0);
            this._graphics.beginFill(0, 0.05);
            this._graphics.moveTo(m.px(this._model.truncatedArea.a.x), m.px(this._model.truncatedArea.a.y));
            this._graphics.lineTo(m.px(this._model.truncatedArea.b.x), m.px(this._model.truncatedArea.b.y));
            this._graphics.lineTo(m.px(this._model.truncatedArea.c.x), m.px(this._model.truncatedArea.c.y));
            this._graphics.endFill();

            edges = [this._model.truncationLeft, this._model.truncationRight, new Segment(this.model.truncatedArea.b, this.model.truncatedArea.c)];
        }   else {
            edges = [this._model.leftEdge];
            dash  = 0;
            weight= 3;
        }

        this._graphics.lineStyle(weight, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

        edges.forEach((edge) => {
            LineDrawer.drawDashedLine(
                this._graphics,
                m.px(edge.a.x), m.px(edge.a.y), m.px(edge.b.x), m.px(edge.b.y),
                dash
            );
        });
    }

    modelChanged() {
        this.render();
    }

    modelDeleted() {
        if (this._model) {
            this._model.removeEventListener(EventBase.CHANGE, this.modelChanged, this);
            this._model.removeEventListener(EasementEvent.DELETE, this.modelDeleted, this);
            this._model = null;
        }
        if (this._theme) {
            this._theme.removeEventListener(EventBase.CHANGE, this.onThemeChanged, this);
            this._theme = null;
        }

        m.instance.removeEventListener(EventBase.CHANGE, this.render, this);
        Utils.removeParentOfChild(this);
    }
}