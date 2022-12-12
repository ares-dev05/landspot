import IPathRenderer from "./IPathRenderer";
import LineDrawer from "../../render/LineDrawer";
import m from "../../../utils/DisplayManager";
import SvgLineDrawer from "../../render/SvgLineDrawer";

export default class EnvelopeRenderer extends IPathRenderer  {

	/**
	 * @param piece {InnerSegment}
	 * @returns {boolean}
	 * @private
	 */
	static _drawable(piece) {
		// skip fully-excluded pieces AND pieces marked to be hidden if not reduced
		return !(piece.fullExclusion || (piece.hideIfNotReduced && !piece.aReduced && !piece.bReduced));
	}

	/**
	 * @param graphics {Graphics}
	 * @param pieces {Array.<InnerSegment>}
	 * @param splayedConnection {boolean}
	 */
	render(graphics, pieces, splayedConnection=false)
	{
		for (let i=0; i<pieces.length; ++i) {
			if (EnvelopeRenderer._drawable(pieces[i])) {
				LineDrawer.drawDashedLine(
					graphics,
					m.px(pieces[i].a.x), m.px(pieces[i].a.y),
					m.px(pieces[i].b.x), m.px(pieces[i].b.y),
					splayedConnection ? 5 : 0
				);
			}
		}
	}

	/**
	 * @param container {svgjs.Container}
	 * @param pieces {InnerSegment[]}
	 * @param theme {LabeledPolygonTheme}
	 * @param dpiScale {number}
	 * @param splayedConnection {boolean}
	 */
	static renderToSvg(container, pieces, theme, dpiScale=1, splayedConnection=false)
	{
		for (let i=0; i<pieces.length; ++i) {
			if (EnvelopeRenderer._drawable(pieces[i])) {
				SvgLineDrawer.drawDashedLine(
					container,
					pieces[i].a.x, pieces[i].a.y, pieces[i].b.x, pieces[i].b.y,
					dpiScale * (theme ? theme.lineThickness : 1),
					theme ? theme.lineColor : 0,
					splayedConnection ? 5 : 0
				).attr(
					'class', 'line-stroke'
				);
			}
		}
	}

	/**
	 * @param graphics {PIXI.Graphics}
	 * @param cx {number}
	 * @param cy {number}
	 * @param R {number}
	 * @param alpha {number}
	 * @param beta {number}
	   @UNUSED
	renderCurve(graphics, cx, cy, R, alpha, beta)
	{
		// draw the curve
		LineDrawer.drawDashedCurve(graphics, m.px(cx), m.px(cy), m.px(R), alpha, beta);
	}
	 */

	/**
	 * @param graphics {PIXI.Graphics}
	 * @param outside {LotPathModel}
	 * @param inside {InnerPathModel}
	 */
	renderFill(graphics, outside, inside)
	{
		/**
		 * @UNUSUED
		if ( ReleaseManager.i.drawEnvelopeFill )
		{
			if ( inside.edges.length )
			{
				graphics.beginFill( 0, .05 );

				// draw the outer path; this area will define the fill
				var outer:Object = outerPathToGraphicCommands( outside );
				graphics.drawPath( outer.commands, outer.points );

				// draw the inner path; this area will be excluded from the fill
				// @TODO: problems occur here when the inner path does not have all the edges added
				// in this cases,
				// @IDEA: whenever an inner edge intersects with an edge of the boundary, and not with
				// another inner edge, we can pick that point, and continue from it in the same direction,
				// going on the boundary edges until we meet/intersect with a new inner edge;
				// this would be quite complex to implement, and will cause additional issues when intersecting
				// with curves.
				var inner:Object = innerPathToGraphicCommands( inside, outside );
				graphics.drawPath( inner.commands, inner.points );

				graphics.endFill();
			}
		}
		 */
	}

	/**
	 * @UNUSED
	 * @param path {LotPathModel}
	 * @return {{commands: Array, points: Array}}
	outerPathToGraphicCommands(path)
	{
		var v:Array, i:int, edge:OutlineCurveModel, j:int, p:int,
			curvePath:Object, curvePoints:array, segment:Segment,

			// the commands & points for the outer path
			commands	= [],
			points:	= [];


		for (i=0; i<path.edges.length; ++i)
		{
			// all edges are drawn from A->B; for curves, we need to ensure this is done correctly,
			// and the pieces are drawn in the correct order
			edge = path.edges[i];

			if ( edge.isCurve )
			{
				// create the pieces for this curve.
				curvePath	= LineDrawer.getCurveCommands(
					m.px( edge.curveCenter.x ),
					m.px( edge.curveCenter.y ),
					m.px( edge.radius ),
					edge.aAngle,
					edge.bAngle
				);
				curvePoints	= curvePath.points;

				// convert the graphic commands into the inner segments
				if ( Geom.segmentLength( curvePoints[0], curvePoints[1], m.px( edge.a.x ), m.px( edge.a.y ) ) <
					 Geom.segmentLength( curvePoints[0], curvePoints[1], m.px( edge.b.x ), m.px( edge.b.y ) ) )
				{
					// first point corresponds to A
					for (j=0; j<curvePoints.length; j+=2)
					{
						commands.push( !commands.length ? GraphicsPathCommand.MOVE_TO : GraphicsPathCommand.LINE_TO );
						points.push( curvePoints[j], curvePoints[j+1] );
					}
				}
				else
				{
					// first point corresponds to B
					for (j=curvePoints.length-1; j+1; j-=2)
					{
						commands.push( !commands.length ? GraphicsPathCommand.MOVE_TO : GraphicsPathCommand.LINE_TO );
						points.push( curvePoints[j-1], curvePoints[j] );
					}
				}
			}
			else
			{
				// push the line as A->B
				commands.push( !commands.length ? GraphicsPathCommand.MOVE_TO : GraphicsPathCommand.LINE_TO );
				points.push( m.px( edge.a.x ), m.px( edge.a.y ) );
				// points.push( m.px( edge.b.x ), m.px( edge.b.y ) );
			}
		}

		return {
			commands: commands,
			points	: points
		};
	}

	private function innerPathToGraphicCommands( path:InnerPathModel, bounds:OutlinePathModel ):Object
	{
		var i:int, j:int, edges:array, edge:InnerEdgeModel, segment:Segment,
			// the commands & points for the outer path
			commands:array	= [],
			points:array	= [];

		// take the edges by reference
		for (i=0; i<bounds.edges.length; ++i)
		{
			edges	= path.edgesWithReference( bounds.edges[i] );
			if ( !edges.length ) continue;

			edge	= edges[0];

			// push all the exclusion pieces for each edge
			for (j=0; j<edge.pieces.length; ++j)
			{
				if ( !edge.pieces[j].fullExclusion )
				{
					segment = edge.pieces[j];
					commands.push( !commands.length ? GraphicsPathCommand.MOVE_TO : GraphicsPathCommand.LINE_TO );
					points.push( m.px( segment.a.x ), m.px( segment.a.y ) );
				}
			}
		}

		return {
			commands: commands,
			points	: points
		};
	}
	 */
}