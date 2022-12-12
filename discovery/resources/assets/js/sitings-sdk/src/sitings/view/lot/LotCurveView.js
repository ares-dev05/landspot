import LotEdgeView from "./LotEdgeView";
import LineDrawer from "../../render/LineDrawer";
import m from "../../../utils/DisplayManager";
import Render from "../../global/Render";

// let CURVE_STEPS = 100;

export default class LotCurveView extends LotEdgeView {

	/**
	 * @param model {LotEdgeModel}
	 * @param theme {LabeledPolygonTheme}
	 * @param allowManualControl {boolean}
	 */
	constructor(model, theme, allowManualControl=false)
	{
		super(model, theme, allowManualControl);
	}

	/**
	 * @return {LotCurveModel}
	 */
	get curveModel() { return this._model; }

	/**
	 * Curve Rendering Function
	 */
	renderByCoordinates()
	{
		// draw a regular edge if this is not a valid curve
		if (!this.curveModel ||
			this.curveModel.isCurve===false ||
			this.curveModel.isInvalidCurve===true) {

			// this._highController.normal();
			super.renderByCoordinates();
			return;
		}

		this._edgeGraphics.clear();

		// draw the curve
		this._edgeGraphics.lineStyle(this.currentThickness, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		// draw the curve and hit area for it
		LineDrawer.drawCurve(
			this._edgeGraphics,
			m.px(this.curveModel.curveCenter.x),
			m.px(this.curveModel.curveCenter.y),
			m.px(this.curveModel.radius),
			Math.min(this.curveModel.aAngle, this.curveModel.bAngle),
			Math.max(this.curveModel.aAngle, this.curveModel.bAngle),
			LineDrawer.LINE_HIT_THICKNESS
		);

		this.renderLineEnd();
	}

	/**
	 * @UNUSED
	drawExclusionArea()
	{
		if ( ReleaseManager.i.drawLotExclusions )
		{
			_graphics.graphics.lineStyle( 3, 0xAA00AA );
			_graphics.graphics.moveTo( m.px(_model.outNormal.a.x), m.px(_model.outNormal.a.y) );
			_graphics.graphics.lineTo( m.px(_model.outNormal.b.x), m.px(_model.outNormal.b.y) );

			_graphics.graphics.beginFill(0,.1);
			_graphics.graphics.moveTo( m.px(_model.exclusionArea.a.x), m.px(_model.exclusionArea.a.y) );
			_graphics.graphics.lineTo( m.px(_model.exclusionArea.b.x), m.px(_model.exclusionArea.b.y) );
			_graphics.graphics.lineTo( m.px(_model.exclusionArea.c.x), m.px(_model.exclusionArea.c.y) );
			_graphics.graphics.lineTo( m.px(_model.exclusionArea.d.x), m.px(_model.exclusionArea.d.y) );
			_graphics.graphics.endFill();
		}
	}
	 */

	/**
	 * @return {number}
	 */
	get currentColor() {
		if (this.curveModel.isCurve && this.curveModel.isInvalidCurve) {
			return 0xCC2200;
		}

		return super.currentColor;
	}
}