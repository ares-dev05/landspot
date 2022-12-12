import * as PIXI from "pixi.js";
import EventBase from "../../events/EventBase";
import Render from "../../sitings/global/Render";
import ViewSettings from "../../sitings/global/ViewSettings";

export default class LotTitleView extends PIXI.Sprite
{

    /**
     * @param lotView {LotPathView}
     * @param theme {LabeledPolygonTheme}
     */
    constructor(lotView, theme)
    {
        super();

        /**
         * @type {LotPathView}
         * @private
         */
        this._view = lotView;

        /**
         * @type {LotPathModel}
         * @private
         */
        this._model = lotView.model;
        this._model.addEventListener(EventBase.CHANGE, this.onModelChanged, this);

        /**
         * @type {LabeledPolygonTheme}
         * @private
         */
        this._theme = theme;
        this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

        /**
         * @type {PIXI.TextStyle}
         * @private
         */
        this._labelStyle = new PIXI.TextStyle({
            fontFamily : this._theme.labelFontFamily,
            fontSize: this._theme.labelFontSize, // * Render.FONT_RESOLUTION,
            fontWeight: 'normal',
            fill : this._theme.labelColor,
            align : 'center'
        });

        /**
         * @type {PIXI.Text}
         * @private
         */
        this._label   = new PIXI.Text("", this._labelStyle);
        this.addChild(this._label);
    }

    /**
     * @param event
     */
    onModelChanged(event) {
        this.update();
    }

    /**
     * @param event {DataEvent}
     * @private
     */
    onThemeChanged(event) {
        if (event.data.prop==="labelFontFamily") {
            this._labelStyle.fontFamily = this._theme.labelFontFamily;
        }	else
        if (event.data.prop==="labelColor") {
            this._labelStyle.fill = this._theme.labelColor;
        }	else
        if (event.data.prop==="labelFontSize") {
            this._labelStyle.fontSize =  this._theme.labelFontSize;//  * Render.FONT_RESOLUTION;
            this.update();
        }
    }

    /**
     * Updates the label content and position
     */
    update() {
        if (this._model.lotName) {
            this._label.text = this._model.lotNameAndArea;
            this._label.x = -this._label.width / 2;
            this._label.y = -this._label.height / 2;

            // make sure the label has integer coordinates for sharper text
            Render.labelMoved(this._label, true);
        }   else {
            this._label.text = "";
        }
    }

    cleanup() {
        if (this._model) {
            this._model.removeEventListener(EventBase.CHANGE, this.onModelChanged, this);
            this._model = null;
        }

        if (this._theme) {
            this._theme.removeEventListener(EventBase.CHANGE, this.onThemeChanged, this);
            this._theme = null;
        }
    }
}
