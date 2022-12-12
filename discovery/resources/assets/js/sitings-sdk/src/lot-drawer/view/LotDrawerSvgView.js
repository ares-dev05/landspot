import LotPathSvgView from "../../sitings/svg/LotPathSvgView";
import LotFeaturesSvgView from "../../sitings/svg/LotFeaturesSvgView";
import CanvasSvgView from "../../sitings/svg/CanvasSvgView";
import m from "../../utils/DisplayManager";
import Utils from "../../utils/Utils";

export default class LotDrawerSvgView extends CanvasSvgView {

    /**
     * @param model  {LotDrawerModel}
     * @param view   {LotDrawerView}
     */
    constructor(model, view) {
        super(model, view);

        /**
         * @type {LotPathSvgView}
         * @private
         */
        this._pathView          = new LotPathSvgView(this.model.pathModel, this.view.pathView.theme);

        /**
         * @type {LotFeaturesSvgView}
         * @private
         */
        this._lotFeaturesView   = new LotFeaturesSvgView(
            this.model.lotFeaturesModel,
            this.view.lotFeaturesView.easementTheme,
            this.view.lotFeaturesView.envelopeTheme
        );
    }

    /**
     * @returns {LotDrawerModel}
     */
    get model() { return this._model; }

    /**
     * @returns {LotDrawerView}
     */
    get view() { return this._view; }

    /**
     * @param divId {string} The DIV to render the SVG to
     * @param width {number} SVG Viewport Width
     * @param height {number} SVG Viewport Height
     * @param dpiScale {number} Scale to apply for high density exports. Scales up font sizes, line thicknesses and
     *      dash lengths for dashed lines.
     */
    draw(divId, width, height, dpiScale=1) {
        // Use the display scale for the SVG export.
        m.svgppm = m.ppm * m.instance.viewScale * PIXI.settings.RESOLUTION;

        dpiScale *= PIXI.settings.RESOLUTION;

        // Create the display list
        this._createDisplayGroups(divId, width, height);
        this._rotationLayer.rotate(this.view.viewRotation);

        // Draw all the elements of the Lot in order
        const lotGroup = this._getGroup();
        this._pathView.draw(lotGroup, 0, dpiScale, true, false);

        // By passing a null labelsContainer to LotFeaturesSvgView.draw(), we make sure that no labels are rendered for the lot easements
        this._lotFeaturesView.draw(this._getGroup(), null, dpiScale);

        // Center the SVG based on the bounds of the lot and the Viewport size
        let bounds = this._root.rbox(this._svg);
        this._root.dmove(
            (width  - bounds.width ) / 2 - bounds.x,
            (height - bounds.height) / 2 - bounds.y
        );

        // Add a title label
        if (this.model.pathModel.lotName) {
            const theme = this.view.titleTheme;
            this._svg.text(this.model.pathModel.lotNameAndArea)
                .font({
                   size: theme.labelFontSize * dpiScale,
                   family: theme.labelFontFamily
                }).fill({
                    color: Utils.colorCode(theme.labelColor)
                })
                .cx(width/2).cy(height/2).attr(
                    'class', 'title-font'
                );
        }
    }
}