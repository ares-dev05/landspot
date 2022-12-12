import m from '../../../utils/DisplayManager';
import LineDrawer from '../../render/LineDrawer';
import Render from '../../global/Render';

export default class EnvelopeSegmentRenderer {

	static get NORMAL_COLOR() {return 0x222222;}

	static get RETAIN_WALL_COLOR() {return 0x777777;}

	static get HIT_COLOR() {return 0xD31F08;}

	/**
	 * @param graphics {PIXI.Graphics}
	 * @param s {EnvelopeSegment}
	 */
	static draw(graphics, s) {
		if (s && graphics) {
			if (s.isGround) {
				if (s.isVirtual) {
					// draw a virtual ground piece
					graphics.lineStyle(1, EnvelopeSegmentRenderer.HIT_COLOR, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
					LineDrawer.drawDashedLine(graphics, m.px(s.a.x), m.px(s.a.y), m.px(s.b.x), m.px(s.b.y), 2);
				}	else {
					// draw a piece of the retaining wall
					if (s.isRetainingWall) {
						graphics.lineStyle(5, EnvelopeSegmentRenderer.RETAIN_WALL_COLOR, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
					}	else {
						graphics.lineStyle(1, EnvelopeSegmentRenderer.NORMAL_COLOR, 1,Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
					}

					LineDrawer.drawLine(graphics, m.px(s.a.x), m.px(s.a.y), m.px(s.b.x), m.px(s.b.y));
				}
			}	else {
				// draw an envelope segment
				graphics.lineStyle(1, s.isHit ? EnvelopeSegmentRenderer.HIT_COLOR : EnvelopeSegmentRenderer.NORMAL_COLOR, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);
				LineDrawer.drawDashedLine(graphics, m.px(s.a.x), m.px(s.a.y), m.px(s.b.x), m.px(s.b.y), 3);
			}
		}
	}
}