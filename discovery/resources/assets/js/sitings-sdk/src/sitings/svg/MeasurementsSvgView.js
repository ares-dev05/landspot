import m from '../../utils/DisplayManager';
import SvgLineDrawer from '../render/SvgLineDrawer';
import ThemeManager from '../view/theme/ThemeManager';
import Render from '../global/Render';
import MeasurementPointModel from '../model/measure/MeasurementPointModel';
import MeasurementPointView from '../view/measure/MeasurementPointView';

export default class MeasurementsSvgView {

    /**
     * @param model {MeasurementsLayerModel}
     */
    constructor(model) {
        /**
         * @type {MeasurementsLayerModel}
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
        this._model.points.forEach(
            /**
             * @param measurement {MeasurementPointModel}
             */
            function(measurement) {
                MeasurementsSvgView._drawMeasurement(container.group(), labelsContainer, measurement, dpiScale);
            }
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param labelsContainer {svgjs.Container}
     * @param model {MeasurementPointModel}
     * @param dpiScale {number}
     * @private
     */
    static _drawMeasurement(container, labelsContainer, model, dpiScale)
    {
        if (model.origin && model.intersection) {
            // Render a small square for corner setbacks
            if (model.isOnCorner) {
                container.rect(10*dpiScale, 10*dpiScale)
                    .cx(m.svgpx(model.origin.x)).cy(m.svgpx(model.origin.y))
                    .stroke({width: dpiScale, color: '#00BBDD'})
                    .fill('none');
            }

            // Render the measurement line
            const line = SvgLineDrawer.drawLine(
                container,
                model.origin.x, model.origin.y,
                model.intersection.x, model.intersection.y,
                2*dpiScale,
                model.isHenleyOMP ? ThemeManager.i.theme.eaveMeasurement : ThemeManager.i.theme.primary
            );

            // Render the measurement label
            const r = line.rbox(container.doc());

            // Create a label block with a background and text
            const block = labelsContainer.group();

            // block color
            const back = block.rect(10, 10)
                .stroke({
                    width: dpiScale,
                    color: model.isHenleyOMP ? ThemeManager.i.theme.eaveMeasurementCode : ThemeManager.i.theme.secondaryCode
                })
                .fill(
                    model.isHenleyOMP ? ThemeManager.i.theme.eaveMeasurementCode: ThemeManager.i.theme.primaryCode
                );

            const text = block.text(
                model.isPlantationOMP ?
                    model.getAccurateDistance()+'m / ' + model.getOMPDistance()+'m OMP' :
                    model.isHenleyOMP ? model.getAccurateDistance() + 'm' : model.description
            )   .dx(3*dpiScale)
                .dy(-3*dpiScale)
                .font({size: 13*dpiScale})
                .fill({color: ThemeManager.i.theme.measurementLabelCode});

            const WIDTH = text.bbox().width  + 6*dpiScale,
                 HEIGHT = text.bbox().height + 3*dpiScale;

            // Resize the measurement background
            back.width(WIDTH).height(HEIGHT);

            // default positioning
            block.x(r.x + (r.width - WIDTH )/2);
            block.y(r.y + (r.height- HEIGHT)/2);

            // Get the display coordinates for the Setback anchor and projection
            const intersection = container.circle(1).cx(m.svgpx(model.intersection.x)).cy(m.svgpx(model.intersection.y)).stroke({width:1, color:'red'});
            const a = intersection.rbox(container.doc());
            intersection.remove();

            const origin = container.circle(1).cx(m.svgpx(model.origin.x)).cy(m.svgpx(model.origin.y)).stroke({width:1, color:'red'});
            const b = origin.rbox(container.doc());
            origin.remove();

            // check if the label is wider/taller than the measurement line
            if (Math.abs(a.cx-b.cx) > Math.abs(a.cy-b.cy)) {
                // ~horizontal
                if (WIDTH > r.width) {
                    // if the width of the label is larger than the width of the line
                    if (a.cx < b.cx) {
                        block.x(a.cx-WIDTH).y(a.cy-HEIGHT/2);
                    }	else {
                        block.x(a.cx).y(a.y-HEIGHT/2);
                    }
                }
            }	else {
                // ~vertical
                if (HEIGHT > r.height) {
                    // if the label is taller than the height of the line
                    if (a.cy < b.cy) {
                        block.x(a.x-WIDTH/2).y(a.y-HEIGHT);
                    }	else {
                        block.x(a.x-HEIGHT/2).y(a.y);
                    }
                }
            }
        }
    }
}
