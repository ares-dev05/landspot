import LotCurveModel from "../model/lot/LotCurveModel";
import Segment from "../../geom/Segment";
import Point from "../../geom/Point";
import m from "../../utils/DisplayManager";
import Geom from "../../utils/Geom";
import Utils from "../../utils/Utils";
import LineDrawer from "../render/LineDrawer";

export default class LotPathSvgView {

    /**
     * @param model {LotPathModel}
     * @param theme {LabeledPolygonTheme}
     */
    constructor(model, theme) {
        /**
         * @type {LotPathModel}
         * @private
         */
        this._model         = model;

        /**
         * @type {LabeledPolygonTheme}
         * @private
         */
        this._theme         = theme;

        /**
         * svgjs.Container
         */
        this._labelsLayer   = null;
    }

    /**
     * @returns {LabeledPolygonTheme}
     */
    get theme() { return this._theme; }

    /**
     * @param v {LabeledPolygonTheme}
     */
    set theme(v) { this._theme = v; }

    /**
     * @returns {svgjs.Container}
     */
    get labelsLayer() { return this._labelsLayer; }

    /**
     * @param container {svgjs.Container}
     * @param viewRotation {number}
     * @param dpiScale {number}
     * @param drawLabels {boolean}
     * @param fullCurveLabels {boolean} Indicates if we want to display the full curve labels (i.e. R(adius), C(hord), A(rc)).
     */
    draw(container, viewRotation, dpiScale=1, drawLabels=true, fullCurveLabels=true) {
        // Create a list of coordinates for the lot fill
        const coords = [[
            m.svgpx(this._model.edges[0].a.x),
            m.svgpx(this._model.edges[0].a.y)
        ]], STEPS = 64;

        const background  = container.group();
        this._labelsLayer = container.group();

        this._model.edges.forEach(
            /**
             * @param curve {LotCurveModel}
             */
            function(curve) {
                if (curve.isCurve) {
                    // Add coordinates for the lot fill
                    let points = LineDrawer.getCurvePoints(
                        m.svgpx(curve.curveCenter.x), m.svgpx(curve.curveCenter.y), m.svgpx(curve.radius),
                        curve.aAngle, curve.bAngle, STEPS
                    ),  prev   = coords[coords.length-1];

                    if (Geom.segmentLength(prev[0], prev[1], points[0].x, points[0].y) <
                        Geom.segmentLength(prev[0], prev[1], points[STEPS-1].x, points[STEPS-1].y)) {
                        for (let j=0; j<points.length; ++j) {
                            coords.push([points[j].x, points[j].y]);
                        }
                    }	else {
                        for (let j=points.length-1; j>=0; --j) {
                            coords.push([points[j].x, points[j].y]);
                        }
                    }
                }   else {
                    coords.push([m.svgpx(curve.b.x), m.svgpx(curve.b.y)]);
                }

                if (drawLabels) {
                    // Create and position the label holder
                    const labelHolder = this._labelsLayer.group();

                    // calculate the view normal
                    let normal = curve.outNormal,
                        viewNormal = new Segment(
                            new Point(m.svgpx(normal.a.x), m.svgpx(normal.a.y)),
                            new Point(m.svgpx(normal.b.x), m.svgpx(normal.b.y))
                        );

                    // make sure the label is positioned at a pixel distance, and not at a metric distance from the edge
                    viewNormal.normalize(this._theme.labelFontSize * dpiScale * ((curve.isCurve && fullCurveLabels) ? 3 : 1));

                    // make sure the normal starts from the center of the curve segment
                    if (curve.isCurve && curve.isInvalidCurve === false) {
                        // move the normal to start from the centre of the curve segment
                        viewNormal.startFrom(m.svgpx(curve.curveMidpoint.x), m.svgpx(curve.curveMidpoint.y));
                    }

                    // make sure the text is always readable from the left to right
                    let lblAngle = Geom.limitDegrees(viewRotation + Geom.rad2deg(viewNormal.angle) + 90);
                    if (lblAngle > 45 && lblAngle < 235)
                        lblAngle += 180;
                    lblAngle = Geom.limitDegrees(lblAngle - viewRotation);

                    labelHolder.cx(viewNormal.b.x).cy(viewNormal.b.y).rotate(lblAngle);

                    // Attach the actual label; center it in the container. Since we use a middle anchor,
                    // we only have to center it vertically
                    labelHolder.text(
                        fullCurveLabels ? curve.description : curve.simpleDescription
                    ).font({
                        anchor: 'middle',
                        size: this._theme.labelFontSize * dpiScale,
                        family: this._theme.labelFontFamily
                    }).cy(0).fill({
                        color: Utils.colorCode(this._theme.labelColor)
                    }).attr(
                        'class', 'label-font'
                    );
                }
            },
            // use 'this' as the scope
            this
        );

        // Render the lot fill
        background.polygon(coords).fill({
            color: Utils.colorCode(this._theme.fillColor)
        }).opacity(
            this._theme.fillAlpha
        ).attr(
            'class', 'background-fill'
        );

        // Render the lot outline; Using polyline ensures that joints for consecutive segments are rendered correctly
        container.group().polyline(coords).stroke({
            width: this._theme.lineThickness * dpiScale,
            color: Utils.colorCode(this._theme.lineColor)
        }).fill(
            'none'
        ).attr(
            'class', 'line-stroke'
        );
    }
}