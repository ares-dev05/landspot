import SVG from "svg.js";
import m from "../../utils/DisplayManager";
import HouseLayerType from "../model/house/HouseLayerType";
import SvgLineDrawer from "../render/SvgLineDrawer";
import Geom from "../../utils/Geom";

export default class MultiHouseSvgView {

    /**
     * @param model {MultiHouseModel}
     */
    constructor(model) {
        /**
         * @type {MultiHouseModel}
         * @private
         */
        this._model = model;
    }

    /**
     * @param container {svgjs.Container}
     * @param labelsContainer {svgjs.Container}
     * @param dpiScale {number}
     */
    draw(container, labelsContainer, dpiScale=1) {
        this._model.floors.forEach(
            function(house) {
                MultiHouseSvgView._drawHouse(house, container.group(), dpiScale);
                MultiHouseSvgView._drawTransforms(house.transformations, container.group(), labelsContainer, dpiScale);
            },
            this
        );
    }

    /**
     * @param house {HouseModel}
     * @param container {svgjs.Container}
     * @param dpiScale {number}
     * @private
     */
    static _drawHouse(house, container, dpiScale) {
        // Draw all the layers of the house on the container
        container.move(
            m.svgpx(house.center.x),
            m.svgpx(house.center.y)
        );

        // create the rotation layer
        const R = container.group();
        R.rotate(house.rotation);

        // create the content layer
        const H = R.group();
        H.move(
            m.svgpx(-house.fullWidth / 2),
            m.svgpx(-house.fullHeight/ 2)
        );

        house.layers.forEach(
            /**
             * @param layer {HouseLayerModel}
             */
            function(layer) {
                // Only draw visible layers
                if (layer.visible) {
                    // Render the layer edges
                    layer.edges.forEach(
                        /**
                         * @param edge {HouseEdgeModel}
                         */
                        function(edge) {
                            if (layer.type===HouseLayerType.ROOF) {
                                SvgLineDrawer.drawDashedLine(
                                    H,
                                    edge.a.x, edge.a.y,
                                    edge.b.x, edge.b.y,
                                    dpiScale, 0, 3 * dpiScale, 3 * dpiScale
                                )
                            }   else {
                                SvgLineDrawer.drawLine(
                                    H,
                                    edge.a.x, edge.a.y,
                                    edge.b.x, edge.b.y,
                                    2 * dpiScale
                                )
                            }
                        }
                    );

                    // Render the labels
                    layer.labels.forEach(
                        function(label) {
                            if (label && label.text) {
                                let text = H.text(label.text).font({size: 13 * dpiScale});

                                if (label.trans) {
                                    text.transform({
                                        a: label.trans.a,
                                        b: label.trans.b,
                                        c: label.trans.c,
                                        d: label.trans.d,
                                        e: label.trans.tx,
                                        f: label.trans.ty
                                    });
                                } else {
                                    text.rotate(-label.rotation);
                                }

                                text.dx(m.svgpx(label.x)).cy(m.svgpx(label.y));
                            }
                        }
                    )
                }
            }
        )
    }

    /**
     * @param transformations {TransformationsLayerModel}
     * @param container {svgjs.Container}
     * @param labelsContainer {svgjs.Container}
     * @param dpiScale {number}
     * @private
     */
    static _drawTransforms(transformations, container, labelsContainer, dpiScale) {
        container.x(m.svgpx(transformations.x)).y(m.svgpx(transformations.y)).rotate(transformations.rotation);

        transformations.cutSegments.forEach(
            /**
             * @param segment {TransformationCutModel}
             */
            function(segment) {
                const cutGroup = container.group();

                // Create the Extension / Reduction symbol
                if (segment.isExtension) {
                    // Draw an extension line
                    SvgLineDrawer.drawLine(
                        cutGroup,
                        segment.a.x, segment.a.y, segment.b.x, segment.b.y,
                        2 * dpiScale, 0xCCCCCC
                    );
                }   else {
                    MultiHouseSvgView._createReductionSymbol(cutGroup, dpiScale)
                        .x(m.svgpx(segment.a.x))
                        .y(m.svgpx(segment.a.y))
                        .rotate(segment.a.x===segment.b.x ? 90 : 0);
                }

                // Create and position the label
                const r     = cutGroup.rbox(container.doc());
                const label = labelsContainer.text(segment.labelString).font({size: 11 * dpiScale});
                const WIDTH = label.bbox().width;

                // Fully horizontal
                if (Geom.equal(segment.a.x, segment.b.x )) {
                    label.x(r.x - WIDTH - 5*dpiScale + (segment.isExtension ? r.width/2 : 0))
                        .cy(r.y + r.height/2);
                }   else {
                    label.cx(r.x + r.width/2)
                          .y(r.y + r.height/2 - 20*dpiScale - (segment.isExtension?0:3)*dpiScale);
                }
            }
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param dpiScale {number}
     * @returns {svgjs.Container}
     * @private
     */
    static _createReductionSymbol(container, dpiScale)
    {
        const sizeMeters = 0.15;
        const sizePx	 = m.svgpx(sizeMeters);

        // cover the house edge with white
        SvgLineDrawer.drawLine(container, -sizeMeters, 0, sizeMeters, 0, 2 * dpiScale, 0xFFFFFF);

        // Draw the two wiggles
        MultiHouseSvgView._renderReductionWiggle(container, -sizePx, 0, dpiScale);
        MultiHouseSvgView._renderReductionWiggle(container,  sizePx, 0, dpiScale);

        return container;
    }

    /**
     * @param container {svgjs.Container}
     * @param x {number}
     * @param y {number}
     * @param dpiScale {number}
     * @returns {svgjs.Path}
     * @private
     */
    static _renderReductionWiggle(container, x, y, dpiScale)
    {
        const size = m.svgpx(0.2);

        return container.path(
            new SVG.PathArray([
                ['M', x, y],
                ['Q', x-size, y-size, x, y-size*2],
                ['M', x, y],
                ['Q', x+size, y+size, x, y+size*2]
            ])
        ).stroke({width: 2 * dpiScale}).fill('none');
    }
}