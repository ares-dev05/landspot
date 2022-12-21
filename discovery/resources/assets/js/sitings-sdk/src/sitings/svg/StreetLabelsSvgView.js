import m from "../../utils/DisplayManager";

export default class StreetLabelsSvgView {

    /**
     * @param model {StreetsModel}
     */
    constructor(model) {
        /**
         * @type {StreetsModel}
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
        this._model.streets.forEach(
            /**
             * @param street {StreetModel}
             */
            function(street) {
                if (street.text && street.text.length) {
                    StreetLabelsSvgView._drawStreet(container, labelsContainer, street, dpiScale);
                }
            },
            this
        )
    }

    /**
     * @param container {svgjs.Container}
     * @param labelsContainer {svgjs.Container}
     * @param street {StreetModel}
     * @param dpiScale {number}
     * @private
     */
    static _drawStreet(container, labelsContainer, street, dpiScale)
    {
        // Calculate the position of the street label in the lot's coordinate system
        const point = container.circle(0.1).dmove(m.svgpx(street.x), m.svgpx(street.y));

        const bounds = point.rbox(container.doc());
        point.remove();

        // Create the label
        let labelGroup = labelsContainer.group();
        labelGroup
            .dx(bounds.cx + m.svgpx(street.labelDelta.x))
            .dy(bounds.cy+m.svgpx(street.labelDelta.y))
            .rotate(street.labelRotation);

        let text = labelGroup.text(street.text).font({
            size: 13 * dpiScale
        });
        text.cx(0).cy(0);
    }
}