import m from "../../utils/DisplayManager";
import Utils from "../../utils/Utils";

export default class SvgLineDrawer {

    /**
     * @param container {svgjs.Container}
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @param width {number}
     * @param color {number}
     * @returns {svgjs.Line}
     */
    static drawLine(container, ax, ay, bx, by, width=1, color=0)
    {
        return this._line(
            container, ax, ay, bx, by
        ).stroke(
            this._stroke({
                width: width,
                color: Utils.colorCode(color)
            })
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @param width {number}
     * @param color {number}
     * @param DASH_LENGTH {number}
     * @param SPACE_LENGTH {number}
     * @returns {svgjs.Line}
     */
    static drawDashedLine(container, ax, ay, bx, by, width=1, color=0, DASH_LENGTH=5, SPACE_LENGTH=5)
    {
        if (DASH_LENGTH===0) {
            return this.drawLine(container, ax, ay, bx, by, width, color);
        }

        return this._line(
            container, ax, ay, bx, by
        ).stroke(
            this._stroke({
                width: width,
                color: Utils.colorCode(color),
                dasharray: DASH_LENGTH + ' ' + SPACE_LENGTH
            })
        ).fill('none');
    }

    /**
     * @param container {svgjs.Container}
     * @param cx {number}
     * @param cy {number}
     * @param radius {number}
     * @param startAngle {number}
     * @param endAngle {number}
     * @param width {number}
     * @param color {number}
     * @returns {svgjs.Path}
     */
    static drawCurve(container, cx, cy, radius, startAngle, endAngle, width=1, color=0)
    {
        return this._curve(
            container, cx, cy, radius, startAngle, endAngle
        ).stroke(
            this._stroke({
                width: width,
                color: Utils.colorCode(color)
            })
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @returns {svgjs.Line}
     * @private
     */
    static _line(container, ax, ay, bx, by) {
        // When we render for the SVG, we draw everything in Centimeters
        return container.line(
            m.svgpx(ax), m.svgpx(ay),
            m.svgpx(bx), m.svgpx(by)
        );
    }

    /**
     * @param container {svgjs.Container}
     * @param cx {number}
     * @param cy {number}
     * @param radius {number}
     * @param startAngle {number}
     * @param endAngle {number}
     * @return {svgjs.Path}
     */
    static _curve(container, cx, cy, radius, startAngle, endAngle)
    {
        return container.path(
            SvgLineDrawer.describeArc(
                m.svgpx(cx), m.svgpx(cy), m.svgpx(radius), startAngle, endAngle
            )
        ).fill('none');
    }

    /**
     * @param centerX {number}
     * @param centerY {number}
     * @param radius {number}
     * @param angleInRadians {number}
     * @returns {{x: number, y: number}}
     * @private
     */
    static _polarToCartesian(centerX, centerY, radius, angleInRadians) {
        // const angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    /**
     * Describes a SVG arc from coordinates, radius and start / end angles
     * @param x {number}
     * @param y {number}
     * @param radius {number}
     * @param startAngle {number}
     * @param endAngle {number}
     * @param includeStart {boolean}
     * @returns {string}
     * @public
     */
    static describeArc(x, y, radius, startAngle, endAngle, includeStart=true){
        const start = SvgLineDrawer._polarToCartesian(x, y, radius, endAngle);
        const end   = SvgLineDrawer._polarToCartesian(x, y, radius, startAngle);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return [
            includeStart ? "M " + start.x + " " + start.y : "",
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    }

    /**
     * @param params {Object}
     * @returns {*}
     * @private
     */
    static _stroke(params) {
        params = params || {};

        if (!params.hasOwnProperty("width")) {
            params.width = 1;
        }
        if (!params.hasOwnProperty("linecap")) {
            params.linecap = 'none';
        }
        if (!params.hasOwnProperty('linejoin')) {
            params.linejoin = 'none';
        }

        /**
         color: '#333',
         width: 2,
         dasharray: '5 5'
         */

        return params;
    }
}