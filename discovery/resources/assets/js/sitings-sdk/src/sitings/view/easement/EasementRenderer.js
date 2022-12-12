import m from "../../../utils/DisplayManager";
import LineDrawer from "../../render/LineDrawer";
import IPathRenderer from "./IPathRenderer";
import SvgLineDrawer from "../../render/SvgLineDrawer";

export default class EasementRenderer extends IPathRenderer {

	/**
	 * @param graphics {PIXI.Graphics}
	 * @param pieces {Array.<InnerSegment>}
	 * @param splayedConnection {boolean}
	 */
	render(graphics, pieces, splayedConnection=false)
	{
		for (let i=0; i<pieces.length; ++i) {
			// draw the dashed easement
			LineDrawer.drawDashedLine(
				graphics,
				m.px(pieces[i].a.x), m.px(pieces[i].a.y),
				m.px(pieces[i].b.x), m.px(pieces[i].b.y)
			);
		}
	}

	/**
	 * @param container {svgjs.Container}
	 * @param pieces {InnerSegment[]}
	 * @param theme {LabeledPolygonTheme}
	 * @param dpiScale {number}
	 */
	static renderToSvg(container, pieces, theme, dpiScale=1)
	{
		for (let i=0; i<pieces.length; ++i) {
			// draw the dashed easement
			SvgLineDrawer.drawDashedLine(
				container,
				pieces[i].a.x, pieces[i].a.y,
				pieces[i].b.x, pieces[i].b.y,
				dpiScale * (theme ? theme.lineThickness : 1),
				theme ? theme.lineColor : 0,
				dpiScale * 5, dpiScale * 5
			).attr(
				'class', 'line-stroke'
			);
		}
	}
}