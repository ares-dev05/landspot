import m from '../../utils/DisplayManager';
import Point from '../../geom/Point';
import Utils from '../../utils/Utils';

export default class PosSvgView {

    /**
     * @param model {PosCalculator}
     */
    constructor(model) {
        /**
         * @type {PosCalculator}
         * @private
         */
        this._model = model;
    }

    /**
     * @param container {svgjs.Container}
     * @param dpiScale {number}
     */
    draw(container, dpiScale=1) {
        if (this._model.points.length < 3) {
            return;
        }

        // Draw a polygon
        const coords = [];
        const center = new Point();

        this._model.points.forEach(
            function(point) {
                coords.push([m.svgpx(point.x), m.svgpx(point.y)]);
                center.x += point.x;
                center.y += point.y;
            }
        );

        center.x /= this._model.points.length;
        center.y /= this._model.points.length;

        // Diagonal hash pattern for the POS
        const SZ = 14*dpiScale;
        const pattern = container.pattern(SZ, SZ, function(add) {
            let stroke = {width: dpiScale, opacity: 0.35};
            add.line(-1, 1, 1, -1).stroke(stroke);
            add.line(0, SZ, SZ,0).stroke(stroke);
            add.line(SZ-1,SZ+1,SZ+1,SZ-1).stroke(stroke);
        });

        // Style
        container.polygon(coords).stroke({
            width: 2*dpiScale, color: '#006644', alpha: 0.7
        }).fill(pattern);

        if (this._model.area > 0) {
            container.text(
                this._model.area.toFixed(3) + ' m²'
            ).font({
                anchor: 'middle',
                size: 13 * dpiScale
            }).dx(
                m.svgpx(center.x)
            ).cy(
                m.svgpx(center.y)
            );
        }
    }
}