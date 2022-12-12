import LotPathSvgView from './LotPathSvgView';
import LotFeaturesSvgView from './LotFeaturesSvgView';
import MultiHouseSvgView from './MultiHouseSvgView';
import StructuresSvgView from './StructuresSvgView';
import MeasurementsSvgView from './MeasurementsSvgView';
import PosSvgView from './PosSvgView';
import StreetLabelsSvgView from './StreetLabelsSvgView';
import CanvasSvgView from './CanvasSvgView';
import PdfPage from '../global/PdfPage';
import m from '../../utils/DisplayManager';
import AlignEngineeringView from '../view/engineering/AlignEngineeringView';
import AlignEngineeringViewProxy from '../view/engineering/AlignEngineeringViewProxy';

const V_OFFSET  = 75;

export default class SitingsSvgView extends CanvasSvgView {

    /**
     * @param model {SitingsModel}
     * @param view {SitingsView}
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

        /**
         * @type {MultiHouseSvgView} View for the house and transformation views
         * @private
         */
        this._multiFloors       = new MultiHouseSvgView(this.model.multiFloors);

        /**
         * @type {StructuresSvgView}
         * @private
         */
        this._structuresView	= new StructuresSvgView(this._model.structures);

        /**
         * @type {MeasurementsSvgView}
         * @private
         */
        this._measurementsView  = new MeasurementsSvgView(this._model.measurementsModel);

        /**
         * @type {PosSvgView}
         * @private
         */
        this._posView           = new PosSvgView(this._model.posModel);

        /**
         * @type {StreetLabelsSvgView}
         * @private
         */
        this._streetLabelsView  = new StreetLabelsSvgView(this._model.streetsModel);
    }

    /**
     * @returns {SitingsModel}
     */
    get model() { return this._model; }

    /**
     * @returns {SitingsView}
     */
    get view() { return this._view; }

    /**
     * @param v {SitingsView}
     */
    set view(v) { this._view = v; }


    /**
     * @param view       {SitingsSvgView|AlignEngineeringView|AlignEngineeringViewProxy}
     * @param divId      {string} The ID of the html div where the SVG will be rendered
     * @param printPage  {number} Selected page size. Can be PdfPage.SIZE_A4 or PdfPage.SIZE_A3
     * @param printScale {number} Inverse of the selected print scale. For 1:100, printScale=100, for 1:200, printScale=200 etc.
     * @param printDpi   {number} Selected print density, in dots-per-inch.
     *
     * @returns {{width: number, pageSize: {width: number, height: number}, underlay: (Matrix|null), height: number}}
     */
    drawView(view, divId, printPage, printScale, printDpi=144) {
        // Determine page dimensions, in print dots
        const pagePixelSize = PdfPage.pageSize(printPage, printDpi);
        if (pagePixelSize.width * pagePixelSize.height === 0) {
            throw new Error('Invalid page size. Use one of PdfPage.Size_A4 or PdfPage.Size_A3.');
        }

        // Calculate the factor for going from meters -> print dots and set it in the display manager.
        m.svgppm = printDpi / (printScale * m.INCH_TO_METER);

        // Scale up the labels as the DPI goes up, to always the same relative size for the text.
        const dpiScale = printDpi / 100;

        // Create the display list
        this._createDisplayGroups(divId, pagePixelSize.width, pagePixelSize.height);

        this._rotationLayer.rotate(view.viewRotation);

        // Draw all the elements of the Siting in order
        this._multiFloors.draw(this._getGroup(), this._labelsLayer, dpiScale);

        // first, draw the lot without labels for metrics
        const lotGroup = this._getGroup();
        this._pathView.theme = view.pathView.theme;
        this._pathView.draw(lotGroup, view.viewRotation, dpiScale, false);

        // determine the SVG bounds without the labels included
        const noLabelBounds = this._root.rbox(this._svg);

        // Draw the lot again, this time with labels included
        lotGroup.remove();
        this._pathView.draw(this._getGroup(), view.viewRotation, dpiScale, true);

        this._lotFeaturesView.easementTheme = view.lotFeaturesView.easementTheme;
        this._lotFeaturesView.envelopeTheme = view.lotFeaturesView.envelopeTheme;
        this._lotFeaturesView.draw(this._getGroup(), this._labelsLayer, dpiScale);

        this._structuresView.draw(this._getGroup(), dpiScale);

        this._measurementsView.draw(this._getGroup(), this._labelsLayer, dpiScale);
        this._posView.draw(this._getGroup(), dpiScale);
        this._streetLabelsView.draw(this._getGroup(), this._labelsLayer, dpiScale);

        // Center the SVG based on the bounds of the entire siting and the size of the page
        let bounds = this._root.rbox(this._svg); // this._root.bbox();

        if (view instanceof AlignEngineeringView || view instanceof AlignEngineeringViewProxy) {
            const deltaX = pagePixelSize.width /2 - noLabelBounds.width /2 - noLabelBounds.x;
            const deltaY = pagePixelSize.height/2 - noLabelBounds.height/2 - noLabelBounds.y - V_OFFSET;

            this._root.dmove(deltaX, deltaY);

            const pos   = this.model.engineeringState.sitingDelta;
            const scale = m.svgppm / m.ppm / pos.s * pos.ps;

            // move image's upper-left corner to be relative to use the center of the siting as the reference point.
            this._underlay
                .x(noLabelBounds.x + noLabelBounds.width /2 + pos.ax * scale + deltaX)
                .y(noLabelBounds.y + noLabelBounds.height/2 + pos.ay * scale + deltaY)
                .scale(scale);

            const image = this._underlay.image(view._pdfPage.image, function(event) {
                if (event && event.target) {
                    image.width(event.target.naturalWidth).height(event.target.naturalHeight);
                }
            });

            image.width(null).height(null);
        }   else {
            const deltaX = pagePixelSize.width /2 - bounds.width /2 - bounds.x;
            const deltaY = pagePixelSize.height/2 - bounds.height/2 - bounds.y - V_OFFSET;

            this._root.dmove(deltaX, deltaY);

            // add an empty block sized as the siting + 10px padding on each side
            const PAD = 20;
            this._background
                .width(bounds.width + 2*PAD)
                .height(bounds.height + 2*PAD)
                .x(pagePixelSize.width /2 - bounds.width /2 - PAD)
                .y(pagePixelSize.height/2 - bounds.height/2 - PAD)
                .fill('white').opacity(1)
                .attr('class', 'siting-background');
        }
        
        // for the size, return the bounds of the lot labels
        bounds = this._pathView.labelsLayer.rbox(this._svg); // this._root.bbox();

        return {
             width: bounds.width / m.svgppm,
            height: bounds.height / m.svgppm,
             // width: noLabelBounds.width / m.svgppm,
            // height: noLabelBounds.height / m.svgppm,
          pageSize: pagePixelSize,
          underlay: this._underlay.transform() ? this._underlay.transform().matrix : null
        };
    }

    /**
     * @param divId      {string} The ID of the html div where the SVG will be rendered
     * @param printPage  {number} Selected page size. Can be PdfPage.SIZE_A4 or PdfPage.SIZE_A3
     * @param printDpi   {number} Selected print density, in dots-per-inch.
     * @param printScale {number} Inverse of the selected print scale. For 1:100, printScale=100, for 1:200, printScale=200 etc.
     *
     * @returns {{width: number, pageSize: {width: number, height: number}, underlay: (Matrix|null), height: number}}
     */
    draw(divId, printPage, printScale, printDpi=144) {
        return this.drawView(this.view, divId, printPage, printScale, printDpi);
    }
}