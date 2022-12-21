export default class IPathRenderer
{
	/**
	 * @param graphics {Graphics}
	 * @param pieces {Array.<InnerSegment>}
	 * @param splayedConnection {boolean}
	 */
	render(graphics, pieces, splayedConnection=false) {}

	/**
	 * @param graphics {Graphics}
	 * @param cx {number}
	 * @param cy {number}
	 * @param R {number}
	 * @param alpha {number}
	 * @param beta {number}
	renderCurve(graphics, cx, cy, R, alpha, beta) {}
	 */

	/**
	 * RenderFill
	 * @param graphics {Graphics}
	 * @param outside {LotPathModel}
	 * @param inside {InnerPathModel}
	 */
	renderFill(graphics, outside, inside) {}
}