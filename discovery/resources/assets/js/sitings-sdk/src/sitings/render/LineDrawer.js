import * as PIXI from 'pixi.js';
import Geom from "../../utils/Geom";
import Segment from "../../geom/Segment";
import Point from "../../geom/Point";

export default class LineDrawer {

	/**
	 * @return {number} the thickness of the hit area around a line, in Pixels
	 */
	static get LINE_HIT_THICKNESS() { return 18; }

	static get DASH_LENGTH() { return 5; }

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// Straight Line Rendering

	/**
	 * @param g {Graphics}
	 * @param ax {number}
	 * @param ay {number}
	 * @param bx {number}
	 * @param by {number}
	 * @param hitAreaThickness {number}
	 */
	static drawLine(g, ax, ay, bx, by, hitAreaThickness=0)
	{
		g.moveTo(ax, ay);
		g.lineTo(bx, by);

		if (hitAreaThickness > 0) {
			LineDrawer.setLineHitArea(g, ax, ay, bx, by, hitAreaThickness);
		}
	}

	/**
	 * @param g {Graphics}
	 * @param ax {number}
	 * @param ay {number}
	 * @param bx {number}
	 * @param by {number}
	 * @param DASH_LENGTH {number}
	 * @param hitAreaThickness {number}
	 */
	static drawDashedLine(g, ax, ay, bx, by, DASH_LENGTH=5, hitAreaThickness=0)
	{
		if (DASH_LENGTH===0) {
			this.drawLine(g, ax, ay, bx, by, hitAreaThickness);
			return;
		}

		if ( Geom.equal( ax, bx ) && Geom.equal( ay, by ) )
			return;

		let k=0, f, lineStart=true, cx, cy;

		f = 1 / ( Geom.segmentLength(ax,ay,bx,by) / DASH_LENGTH );

		while ( k < 1 ) {
			cx	= Geom.getWeighedValue( ax, bx, k );
			cy	= Geom.getWeighedValue( ay, by, k );

			lineStart ?
				g.moveTo( cx, cy ):
				g.lineTo( cx, cy );

			k += f;
			lineStart = !lineStart;
		}

		g.lineTo( bx, by );

		if (hitAreaThickness > 0) {
			LineDrawer.setLineHitArea(g, ax, ay, bx, by, hitAreaThickness);
		}
	}

	/**
	 * @param g {PIXI.Graphics}
	 * @param ax {number}
	 * @param ay {number}
	 * @param bx {number}
	 * @param by {number}
	 * @param hitAreaThickness {number}
	 */
	static setLineHitArea(g, ax, ay, bx, by, hitAreaThickness)
	{
		if (hitAreaThickness < 1) {
			return;
		}

		let s = new Segment(new Point(ax, ay), new Point(bx, by)),
			a = s.clone(),
			b = s.clone(),
			// angle of the normal to the segment
			n = s.angle;

		// one direction
		a.translate(Math.cos(n + Math.PI/2)*hitAreaThickness/2, Math.sin(n + Math.PI/2)*hitAreaThickness/2);
		// other direction
		b.translate(Math.cos(n - Math.PI/2)*hitAreaThickness/2, Math.sin(n - Math.PI/2)*hitAreaThickness/2);

		g.hitArea = new PIXI.Polygon(a.a.x, a.a.y, a.b.x, a.b.y, b.b.x, b.b.y, b.a.x, b.a.y);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////
	// Circle Arcs Rendering

	/**
	 * @param g {PIXI.Graphics}
	 * @param cx {number}
	 * @param cy {number}
	 * @param radius {number}
	 * @param startAngle {number}
	 * @param endAngle {number}
	 * @param hitAreaThickness {number}
	 */
	static drawCurve(g, cx, cy, radius, startAngle, endAngle, hitAreaThickness=0)
	{
		g.arc(cx, cy, radius, startAngle, endAngle);

		if (hitAreaThickness > 0) {
			LineDrawer.setCurveHitArea(g, cx, cy, radius, startAngle, endAngle, hitAreaThickness);
		}
	}

	/**
	 * @param g {PIXI.Graphics}
	 * @param cx {number}
	 * @param cy {number}
	 * @param radius {number}
	 * @param startAngle {number}
	 * @param endAngle {number}
	 * @param DASH_LENGTH {number}
	 * @param hitAreaThickness {number}
	 */
	static drawDashedCurve(g, cx, cy, radius, startAngle, endAngle, DASH_LENGTH=4, hitAreaThickness=0)
	{
		if ( endAngle < startAngle )
		{
			let swap = endAngle;
			endAngle = startAngle;
			startAngle = swap;
		}

		let cLength = ( endAngle - startAngle ) * radius,
			numSteps = cLength / DASH_LENGTH, angle, px, py, i;

		for (i=0; i<numSteps; ++i) {
			angle	= Geom.getWeighedValue( startAngle, endAngle, i/(numSteps-1) );
			px		= cx + Math.cos( angle ) * radius;
			py		= cy + Math.sin( angle ) * radius;

			( i & 1 ) ?
				g.lineTo( px, py ):
				g.moveTo( px, py );
		}

		if (hitAreaThickness > 0) {
			LineDrawer.setCurveHitArea(g, cx, cy, radius, startAngle, endAngle, hitAreaThickness);
		}
	}

	/**
	 * @param graphics {PIXI.Graphics}
	 * @param cx {number}
	 * @param cy {number}
	 * @param radius {number}
	 * @param startAngle {number}
	 * @param endAngle {number}
	 * @param hitAreaThickness {number}
	 * @param curvePieceLength {number}
	 */
	static setCurveHitArea(graphics, cx, cy, radius, startAngle, endAngle, hitAreaThickness, curvePieceLength=10)
	{
		if (hitAreaThickness < 1) {
			return;
		}

		let hitArea = new PIXI.Polygon();

		///////////////////////////////////////////////////////////////////////////////////////
		// 1. Add the outside of the curve, splitting the curve piece-wise into
		// straight edges with a length of curvePieceLength each
		let outerRadius = radius + hitAreaThickness / 2;
		let arcLength = Math.abs(endAngle-startAngle) * outerRadius;

		// Calculate the number of curve pieces
		let curvePieces = Math.max(1, Math.round(arcLength/curvePieceLength));

		hitArea.points = hitArea.points.concat(
			LineDrawer.getCurveCommands(
				// centre of the curve circle
				cx, cy,
				// circle radius
				outerRadius,
				// arc angles
				startAngle, endAngle,
				// number of pieces in the curve
				curvePieces
			).points
		);

		///////////////////////////////////////////////////////////////////////////////////////
		// 2. Add the inside of the curve, splitting the curve piece-wise into
		// straight edges with a length of curvePieceLength each
		let innerRadius = radius - hitAreaThickness / 2;

		if (innerRadius < curvePieceLength) {
			// close the polygon
			hitArea.close();
		}	else {
			// add the inside of the polygon
			arcLength = Math.abs(endAngle-startAngle) * innerRadius;

			// Calculate the number of curve pieces
			let curvePieces = Math.max(1, Math.round(arcLength/curvePieceLength));

			hitArea.points = hitArea.points.concat(
				LineDrawer.getCurveCommands(
					// centre of the curve circle
					cx, cy,
					// circle radius
					innerRadius,
					// reversed arc angles
					endAngle, startAngle,
					// number of pieces in the curve
					curvePieces
				).points
			);
			hitArea.close();
		}

		// set the hit area for the
		graphics.hitArea = hitArea;

		// debug: draw it
		// graphics.lineStyle(1, 0xFF0000, 0.3);
		// graphics.drawPolygon(hitArea);
	}

	/**
	 * @param cx {number}
	 * @param cy {number}
	 * @param radius {number}
	 * @param startAngle {number}
	 * @param endAngle {number}
	 * @param CURVE_STEPS {number}
	 * @return {{commands: Array, points: Array}}
	 */
	static getCurveCommands( cx, cy, radius, startAngle, endAngle, CURVE_STEPS=128 )
	{
		let numSteps = CURVE_STEPS, i, angle;
		let points = [], commands = [];

		for (i=0; i<numSteps; ++i)  {
			// find the coordinates
			angle = startAngle + i/(numSteps-1)*(endAngle-startAngle);

			// draw a line
			points.push(
				cx + Math.cos( angle ) * radius,
				cy + Math.sin( angle ) * radius
			);
			commands.push(
				i===0 ?
					/*GraphicsPathCommand.MOVE_TO*/ 1 :
					/*GraphicsPathCommand.LINE_TO*/ 2
			);
		}

		return {
			points: points,
			commands: commands
		};
	}

	/**
	 * @param cx {number}
	 * @param cy {number}
	 * @param radius {number}
	 * @param startAngle {number}
	 * @param endAngle {number}
	 * @param CURVE_STEPS {number}
	 * @return {Array<Point>}
	 */
	static getCurvePoints( cx, cy, radius, startAngle, endAngle, CURVE_STEPS=128 )
	{
		let numSteps = CURVE_STEPS, i, angle;
		let points = [];

		for (i=0; i<numSteps; ++i)  {
			// find the coordinates
			angle = startAngle + i/(numSteps-1)*(endAngle-startAngle);

			// draw a line
			points.push(new Point(
				cx + Math.cos( angle ) * radius,
				cy + Math.sin( angle ) * radius
			));
		}

		return points;
	}
}