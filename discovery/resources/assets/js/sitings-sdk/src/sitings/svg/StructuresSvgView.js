import StructureRectangle from "../model/structure/StructureRectangle";
import m from "../../utils/DisplayManager";
import Render from "../global/Render";

export default class StructuresSvgView {

    /**
     * @param model {StructuresLayerModel}
     */
    constructor(model) {
        /**
         * @type {StructuresLayerModel}
         * @private
         */
        this._model = model;
    }

    /**
     * @param container {svgjs.Container}
     * @param dpiScale {number}
     */
    draw(container, dpiScale=1) {
        this._model.structures.forEach(
            function(structure) {
                StructuresSvgView._drawStructure(container.group(), structure, dpiScale);
            },
            this
        )
    }

    /**
     * @param container {svgjs.Container}
     * @param structure {StructurePoint}
     * @param dpiScale {number}
     * @private
     */
    static _drawStructure(container, structure, dpiScale)
    {
        // Position and rotate the container
        container.cx(m.svgpx(structure.x));
        container.cy(m.svgpx(structure.y));

        if (structure.dataType===StructureRectangle.DATA_TYPE) {
            /** @type {StructureRectangle} */
            const rectangle = structure;

            // Create the structure block
            container.rect(m.svgpx(rectangle.width), m.svgpx(rectangle.height))
                .stroke({width: 2 * dpiScale})
                .fill('none')
                .cx(0).cy(0)
                .rotate(rectangle.rotation);

            // Create the label
			if (rectangle && rectangle.labelText && rectangle.labelText.length) {
				container.text(rectangle.labelText)
					.font({size: 13 * dpiScale})
					.cx(0).cy(0);
			}
        }	else {
            let R = m.svgpx(structure.radius);

            // Draw the outer part
            container.circle(R * 2)
                .stroke({width: 2 * dpiScale})
                .fill('none')
                .cx(0).cy(0);

            if (R > 8) {
                const C = m.px(0.1);
                container.circle(C)
                    .stroke({width: 2 * dpiScale})
                    .fill('none')
                    .cx(0).cy(0);

                const D = 0.05;
                container.ellipse(2*R*(1+D), 2*R*(1-D))
                    .stroke({width: 2 * dpiScale})
                    .fill('none')
                    .cx(-C/1.8).cy(C/2.6);

                container.ellipse(2*R*(1-D), 2*R*(1+D*1.3))
                    .stroke({width: 2 * dpiScale})
                    .fill('none')
                    .cx(C/3).cy(-C/2);
            }
        }
    }
}