// import SVG from "svg.js";
import m from "../../utils/DisplayManager";
import SvgLineDrawer from "../render/SvgLineDrawer";
import EnvelopeRenderer from "../view/easement/EnvelopeRenderer";
import EasementRenderer from "../view/easement/EasementRenderer";
import LotEasementModel from "../model/lot/features/LotEasementModel";
import LotDrivewayView from "../view/lot/features/LotDrivewayView";
import Utils from "../../utils/Utils";
import Segment from '../../geom/Segment';

export default class LotFeaturesSvgView {

    /**
     * @param model {LotFeaturesModel}
     * @param easementTheme {LabeledPolygonTheme}
     * @param envelopeTheme {LabeledPolygonTheme}
     */
    constructor(model, easementTheme, envelopeTheme)
    {
        /**
         * @type {LotFeaturesModel}
         * @private
         */
        this._model = model;

        /**
         * @type {LabeledPolygonTheme}
         * @private
         */
        this._easementTheme = easementTheme;

        /**
         * @type {LabeledPolygonTheme}
         * @private
         */
        this._envelopeTheme = envelopeTheme;
    }

    /**
     * @returns {LabeledPolygonTheme}
     */
    get easementTheme() { return this._easementTheme; }

    /**
     * @param v {LabeledPolygonTheme}
     */
    set easementTheme(v) { this._easementTheme = v; }

    /**
     * @returns {LabeledPolygonTheme}
     */
    get envelopeTheme() { return this._envelopeTheme; }

    /**
     * @param v {LabeledPolygonTheme}
     */
    set envelopeTheme(v) { this._envelopeTheme = v; }

    /**
     * @param container {svgjs.Container}
     * @param labelsContainer {svgjs.Container} the SVG container to draw labels in. Can be NULL of no labels have to be drawn
     * @param dpiScale {number}
     */
    draw(container, labelsContainer=null, dpiScale=1) {
        // Draw envelopes as solid lines
        this._drawInnerPath(container, this._model.envelopes, EnvelopeRenderer.renderToSvg, dpiScale, this._envelopeTheme);

        // Draw easements as dashed lines
        this._drawInnerPath(container, this._model.parallelEasements, EasementRenderer.renderToSvg, dpiScale, this._easementTheme, labelsContainer);

        // Draw special easements
        this._drawEasements(container, this._model.specialEasements, dpiScale, this._easementTheme, labelsContainer);

        // Draw driveways
        this._drawDriveways(container, this._model.driveways, dpiScale);

        // Draw truncations
        this._drawTruncations(container, this._model.truncations, dpiScale, this._easementTheme);
    }

    /**
     * @param container {svgjs.Container}
     * @param model {InnerPathModel}
     * @param pieceRenderer {Function}
     * @param dpiScale {number}
     * @param theme {LabeledPolygonTheme}
     * @param labelsContainer {svgjs.Container}
     * @private
     */
    _drawInnerPath(container, model, pieceRenderer, dpiScale, theme, labelsContainer=null)
    {
        // Draw envelopes
        model.edges.forEach(
            /** @param edge {InnerEdgeModel} */
            function(edge) {
                // Draw all the edge's pieces
                const edgeGroup = container.group();
                pieceRenderer(edgeGroup, edge.pieces, theme, dpiScale);

                if (edge.splayed) {
                    pieceRenderer(edgeGroup, [edge.connection], theme, dpiScale, true);
                }

                // Create a label for the edge (if needed)
                if (labelsContainer!=null) {
                    // Fetch the global bounds of the easement
                    let r = edgeGroup.rbox(container.doc());
                    let label = labelsContainer.text(
                        edge.description
                    ).font({
                        size: theme.labelFontSize * dpiScale,
                        family: theme.labelFontFamily
                    }).fill({
                        color: Utils.colorCode(theme.labelColor)
                    }).attr(
                        'class', 'label-font'
                    );

                    if (r.width > r.height) {
                        // the edge is horizontal. position the label on top of the edge
                        label.cx(r.x + r.width /2).dy(r.y + r.height/2 - 24 * dpiScale);
                    }	else {
                        // the edge is vertical. position the label to the right of the edge
                        label.dx(r.x + r.width /2 + 5 * dpiScale).cy(r.y + r.height/2);
                    }
                }
            }
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param easements {Array<LotEasementModel>}
     * @param dpiScale {number}
     * @param theme {LabeledPolygonTheme}
     * @param labelsContainer {svgjs.Container}
     * @private
     */
    _drawEasements(container, easements, dpiScale, theme, labelsContainer)
    {
        easements.forEach(
            /**
             * @param easement {LotEasementModel}
             */
            function(easement) {
                // Draw the first easement line
                const edgeGroup = container.group();
                SvgLineDrawer.drawDashedLine(
                    edgeGroup,
                    easement.a.x, easement.a.y,
                    easement.b.x, easement.b.y,
                    dpiScale * (theme ? theme.lineThickness : 1),
                    theme ? theme.lineColor : 0,
                    dpiScale * 5, dpiScale * 5
                ).attr(
                    'class', 'line-stroke'
                );

                // Draw the secondary easement line
                if ( (easement.type===LotEasementModel.ANGLED && easement.width!==0) ||
                      easement.type===LotEasementModel.BLOCK ) {
                    SvgLineDrawer.drawDashedLine(
                        edgeGroup,
                        easement.aw.x, easement.aw.y,
                        easement.bw.x, easement.bw.y,
                        dpiScale * (theme ? theme.lineThickness : 1),
                        theme ? theme.lineColor : 0
                    ).attr(
                        'class', 'line-stroke'
                    );
                }

                // Add the easement label, relative to the position of the easement line and the lot
                // Create a label for the edge (if needed)
                if (labelsContainer!=null) {
                    let r = edgeGroup.rbox(container.doc());
                    let label = labelsContainer.text(
                        easement.description
                    ).font({
                        size: theme.labelFontSize * dpiScale,
                        family: theme.labelFontFamily
                    }).fill({
                        color: Utils.colorCode(theme.labelColor)
                    }).attr(
                        'class', 'label-font'
                    );

                    let WIDTH = label.bbox().width;

                    if (r.width > r.height) {
                        // the edge is horizontal. position the label on top of or below the edge, but inside the lot
                        let hk = (WIDTH < r.width) ? (r.width - WIDTH) / r.width : 0;

                        if (easement.normal.y < easement.mid.y) {
                            label.cx(r.x + r.width / 2)
                                .dy(r.y + r.height / 2 * hk - 24 * dpiScale);
                        } else {
                            label.cx(r.x + r.width / 2)
                                .dy(r.y + r.height - hk * r.height / 2 - 5 * dpiScale);
                        }
                    } else {
                        // the edge is vertical. position the label to the left/right of the edge, but inside the lot
                        if (easement.normal.x > easement.mid.x) {
                            label.dx(r.x + r.width / 2 + 5 * dpiScale)
                                .cy(r.y + r.height / 2);
                        } else {
                            label.dx(r.x + r.width / 2 - WIDTH - 10 * dpiScale)
                                .cy(r.y + r.height / 2);
                        }
                    }
                }
            }
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param driveways {Array<LotDrivewayModel>}
     * @param dpiScale {number}
     * @private
     */
    _drawDriveways(container, driveways, dpiScale)
    {
        driveways.forEach(
            /**
             * @param driveway {LotDrivewayModel}
             */
            function(driveway) {
                // create a new group for the driveway
                const D = container.group();
                const G = D.group();
                const W = LotDrivewayView.WIDTH, H = LotDrivewayView.HEIGHT, C = -LotDrivewayView.CORNER;

                // We have to position and rotate the driveway before drawing anything to it
                D.cx(m.svgpx(driveway.x));
                D.cy(m.svgpx(driveway.y));

                // Rotate the graphic instead of the driveway
                G.rotate(driveway.rotation);

                // Draw the driveway body
                G.polygon([
                    m.svgpx(-W), 0,
                    m.svgpx( W), 0,
                    m.svgpx(W-C), m.svgpx(H),
                    m.svgpx(-W+C), m.svgpx(H)
                ]).stroke({
                    width: dpiScale,
                    color: '#333'
                }).fill({
                    color: '#000',
                    opacity: 0.1
                }).attr(
                    'class', 'line-stroke'
                );
                
                SvgLineDrawer.drawLine(
                    G, -W, 0, W-C, H,
                    dpiScale, 0x333333
                );
                SvgLineDrawer.drawLine(
                    G, W, 0, -W+C, H,
                    dpiScale, 0x333333
                );
            }
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param truncations {Array<LotTruncationModel>}
     * @param dpiScale {number}
     * @param theme {LabeledPolygonTheme}
     * @private
     */
    _drawTruncations(container, truncations, dpiScale, theme)
    {
        truncations.forEach(
            /**
             * @param truncation {LotTruncationModel}
             */
            function(truncation) {
                if (!truncation.valid) {
                    return;
                }

                // create a new group for the driveway
                const D = container.group();
                const G = D.group();

                const A = truncation.truncatedArea.a;
                const B = truncation.truncatedArea.b;
                const C = truncation.truncatedArea.c;

                // Draw the truncation body
                G.polygon([
                    m.svgpx(A.x), m.svgpx(A.y),
                    m.svgpx(B.x), m.svgpx(B.y),
                    m.svgpx(C.x), m.svgpx(C.y)
                ]).fill({
                    color: '#000',
                    opacity: 0.05
                }).attr(
                    'class', 'line-stroke'
                );

                // draw the edges
                [truncation.truncationLeft, truncation.truncationRight, new Segment(B, C)].forEach((edge) => {
                    SvgLineDrawer.drawDashedLine(
                        G,
                        edge.a.x, edge.a.y, edge.b.x, edge.b.y,
                        dpiScale * (theme ? theme.lineThickness : 1),
                        theme ? theme.lineColor : 0,
                        dpiScale * 5, dpiScale * 5
                    ).attr(
                        'class', 'line-stroke'
                    );
                });
            }
        );
    }
}