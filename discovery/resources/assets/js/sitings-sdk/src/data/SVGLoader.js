import Point from "../geom/Point";
import Segment from "../geom/Segment";
import Matrix from "../geom/Matrix";
import SVGParserCommon from "../svg/parser/SVGParserCommon";
import Logger from "../utils/Logger";
import CurvedSegment from "../geom/CurvedSegment";
import SVGG from "../svg/display/SVGG";
import SVGRect from "../svg/display/SVGRect";
import SVGPolygon from "../svg/display/SVGPolygon";
import SVGPath from "../svg/display/SVGPath";
import SVGMoveToCommand from "../svg/data/path/SVGMoveToCommand";
import SVGCurveToCubicCommand from "../svg/data/path/SVGCurveToCubicCommand";
import SVGLineToCommand from "../svg/data/path/SVGLineToCommand";
import SVGClosePathCommand from "../svg/data/path/SVGClosePathCommand";
import SVGLine from "../svg/display/SVGLine";
import SVGPolyline from "../svg/display/SVGPolyline";
import SVGText from "../svg/display/SVGText";
import Polygon from "../geom/Polygon";
import LabelModel from "../model/LabelModel";

export default class SVGLoader {

    /**
     * @param data {SVGG}
     * @param metric {number}
     */
	constructor(data, metric=1)
	{
        /**
         * @type {SVGG}
         * @protected
         */
		this._data	 	= data;
        /**
         * @type {number}
         * @protected
         */
        this._metric	= metric;
        /**
         * @type {Polygon} - why not Segment Set?
         * @protected
         */
        this._outline	= new Polygon();
        /**
		 * @type {LabelModel[]}
		 * @protected
         */
        this._labels	= [];

        /**
         * @type {number}
         */
        this.minX =  Infinity;
        /**
         * @type {number}
         */
        this.minY =  Infinity;
        /**
         * @type {number}
         */
        this.maxX = -Infinity;
        /**
         * @type {number}
         */
        this.maxY = -Infinity;
    }

    /**
     * @return {SVGG}
     */
	get data()		{ return this._data; }

    /**
     * @return {Polygon}
     */
	get outline()	{ return this._outline; }

    /**
     * @return {LabelModel[]}
     */
	get labels()	{ return this._labels; }

    /**
     * @return {number}
     */
	get width()		{ return this.maxX-this.minX; }

    /**
     * @return {number}
     */
	get height()	{ return this.maxY-this.minY; }

    /**
     * @return {number}
     */
	get toMeters()	{ return this._metric; }

    /**
     * @param v
     */
	set toMeters(v)	{ this._metric=v; }

    /**
	 * starts parsing the contents of the SVGG synchronously
     */
	start()
	{
		this.parseGroup(this._data);
        this.onComplete();
	}

    /**
	 * @override in subclasses
     */
	onComplete() {}

    /**
     * @param value {*}
     * @return {number}
     */
	metric(value) { return Number(value) * this._metric; }

    /**
	 * Adds a linear segment from the indicated coordinates
	 *
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @param transform {Matrix}
     */
	addEdgeFromPoints(ax, ay, bx, by, transform=null)
	{
		if (transform) {
			let p = transform.transformPoint(new Point(ax, ay));
			ax = p.x;
			ay = p.y;

			p = transform.transformPoint(new Point(bx, by));
			bx = p.x;
			by = p.y;
		}

		this.minX = Math.min( this.minX, ax, bx );
        this.maxX = Math.max( this.maxX, ax, bx );
        this.minY = Math.min( this.minY, ay, by );
        this.maxY = Math.max( this.maxY, ay, by );

		this._outline.edges.push( new Segment( new Point(ax,ay), new Point(bx,by) ));
	}

    /**
     * Adds a cubic Bezier curve from the given coordinates
     *
     * @param ax {number} point A coordinate X
     * @param ay {number} point A coordinate Y
     * @param bx {number} point B coordinate X
     * @param by {number} point B coordinate Y
     * @param x1 {number} control point 1 coordinate X
     * @param y1 {number} control point 1 coordinate Y
     * @param x2 {number} control point 2 coordinate X
     * @param y2 {number} control point 2 coordinate Y
     */
    addCurveFromPoints(ax, ay, bx, by, x1, y1, x2, y2)
    {
        this.minX = Math.min( this.minX, ax, bx );
        this.maxX = Math.max( this.maxX, ax, bx );
        this.minY = Math.min( this.minY, ay, by );
        this.maxY = Math.max( this.maxY, ay, by );

        this._outline.edges.push(
            new CurvedSegment(
                new Point(ax,ay),
                new Point(bx,by),
                new Point(x1,y1),
                new Point(x2,y2)
            )
        );
    }

    /**
     * @param svgText {SVGText}
     */
	addLabelFromSvgText(svgText)
	{
		let text="", i;

		for (i=0; i<svgText.numTextElements; ++i) {
			text = text + (text.length ? "\n" : "") + svgText.getTextElementAt(i);
		}

		let mat = new Matrix();
		mat.translate(Number(svgText.svgX), Number(svgText.svgY));

		// see if the text has a transformation
		if(svgText.svgTransform != null){
			let svgTransformMat = SVGParserCommon.parseTransformation(svgText.svgTransform);
			if(svgTransformMat)
				mat.concat(svgTransformMat);
		}

		const rcd = Math.atan(  mat.c / mat.d );
        /*
        const rba = Math.atan( -mat.b / mat.a );
        const scx = Math.sqrt(  mat.a*mat.a + mat.b*mat.b );
        const scy = Math.sqrt(  mat.c*mat.c + mat.d*mat.d );
        Logger.log("label ["+text+"] angle: "+
            Geom.rad2deg(rcd).toFixed(2)+"|"+
            Geom.rad2deg(rba).toFixed(2)+", SCX="+
            scx.toFixed(2)+", SCY="+
            scy.toFixed(2)
        );
        */

		this._labels.push( new LabelModel(
			text,
			this.metric(mat.tx),
            this.metric(mat.ty),
			rcd,
			mat
		) );
	}

    /**
     * @param group {SVGG}
     */
	parseGroup(group)
	{
        /**
		 * @type {SVGElement|*}
         */
		let element;
		let i, j;

		for (i=0; i<group.numElements; ++i)
		{
			element = group.getElementAt(i);

			if ( element.isType(SVGG.CLASS_TYPE) )
			{
				this.parseGroup(element);
			}
			else if ( element.isType(SVGRect.CLASS_TYPE) )
			{
                /**
                 * @type {SVGRect}
                 */
				const rect = element;

				const mat = new Matrix();
				mat.translate(Number(rect.svgX), Number(rect.svgY));

				// see if the rect has a transformation
				if(rect.svgTransform != null){
					const svgTransformMat = SVGParserCommon.parseTransformation(rect.svgTransform);
					if(svgTransformMat)
						mat.concat(svgTransformMat);
				}

				// transform the 4 rectangle corners
                let cw = [ 0, 1, 1, 0 ], ch = [ 0, 0, 1, 1 ], p = [];

				for (j=0; j<cw.length; ++j) {
					p.push(mat.transformPoint(
						new Point(
							cw[j]*Number(rect.svgWidth),
							ch[j]*Number(rect.svgHeight)
						))
					);
				}

				for (j=0; j<p.length; ++j) {
					this.addEdgeFromPoints(
						this.metric(p[j].x),
						this.metric(p[j].y),
						this.metric(p[(j+1)%p.length].x),
						this.metric(p[(j+1)%p.length].y)
					);
				}
			}
			else if ( element.isType(SVGPolygon.CLASS_TYPE) )
			{
                /**
                 * @type {SVGPolygon}
                 */
				const poly = element;
				for (j=0; j<poly.points.length; j+=2)
				{
					this.addEdgeFromPoints(
						this.metric(poly.points[j]),
                        this.metric(poly.points[j+1]),
                        this.metric(poly.points[(j+2)%poly.points.length]),
                        this.metric(poly.points[(j+3)%poly.points.length])
					);
				}
			}
			else if ( element.isType(SVGPath.CLASS_TYPE) )
			{
                /**
                 * @type {SVGPath}
                 */
				const path = element;
				let cx=0, cy=0, ox=0, oy=0;

				// really simplified parser of SVG commands
				for (j=0; j<path.path.length; ++j)
				{
                    /**
                     * @type {SVGPathCommand|*}
                     */
					let command = path.path[j];
					if ( command.isType(SVGMoveToCommand.CLASS_TYPE) ) {
                        /**
                         * @type {SVGMoveToCommand}
                         */
						const mtc = command;

						if ( mtc.absolute ) {
							cx = mtc.x;
							cy = mtc.y;
						}	else {
							cx += mtc.x;
							cy += mtc.y;
						}

						// remember the start of the path
						ox = cx;
						oy = cy;
					}
					else if ( command.isType(SVGCurveToCubicCommand.CLASS_TYPE) ) {
                        /**
                         * @type {SVGCurveToCubicCommand}
                         */
						const ctcc = command;

						if ( ctcc.absolute ) {
							this.addCurveFromPoints(
								this.metric(cx),	  this.metric(cy),
                                this.metric(ctcc.x),  this.metric(ctcc.y),
                                this.metric(ctcc.x1), this.metric(ctcc.y1),
                                this.metric(ctcc.x2), this.metric(ctcc.y2)
							);
							cx = ctcc.x;
							cy = ctcc.y;
						}	else {
                            this.addCurveFromPoints(
                                this.metric(cx),		 this.metric(cy),
                                this.metric(cx+ctcc.x),  this.metric(cy+ctcc.y),
                                this.metric(cx+ctcc.x1), this.metric(cy+ctcc.y1),
                                this.metric(cx+ctcc.x2), this.metric(cy+ctcc.y2)
							);

							cx += ctcc.x;
							cy += ctcc.y;
						}
					}
					else if ( command.isType(SVGLineToCommand.CLASS_TYPE) ) {
                        /**
                         * @type {SVGLineToCommand}
                         */
						const lineTo = command;

						if ( lineTo.absolute ) {
							this.addEdgeFromPoints(
                                this.metric(cx),		this.metric(cy),
                                this.metric(lineTo.x),	this.metric(lineTo.y)
							);
							cx = lineTo.x;
							cy = lineTo.y;
						}	else {
                            this.addEdgeFromPoints(
                                this.metric(cx),		 this.metric(cy),
                                this.metric(cx+lineTo.x),this.metric(cy+lineTo.y)
							);
							cx += lineTo.x;
							cy += lineTo.y;
						}
					}
					else if ( command.isType(SVGClosePathCommand.CLASS_TYPE) ) {
                        /**
                         * @type {SVGClosePathCommand}
                         */
						this.addEdgeFromPoints( this.metric(cx), this.metric(cy), this.metric(ox), this.metric(oy));

						cx = ox;
						cy = oy;
					}
					else {
						Logger.log("Unknown SVGPath command: "+path.path[j]);
					}
				}
			}
			else if ( element.isType(SVGLine.CLASS_TYPE) ) {
                /**
                 * @type {SVGLine}
                 */
				const line = element;
				this.addEdgeFromPoints(this.metric(line.svgX1), this.metric(line.svgY1), this.metric(line.svgX2), this.metric(line.svgY2));
			}
			else if (element.isType(SVGPolyline.CLASS_TYPE)) {
                /**
				 * @type Array.<string>
                 */
                const points = element.points;
				if (points.length>2) {
					for (let index=0; index+3<points.length; index+=2) {
                        this.addEdgeFromPoints(
							this.metric(points[index  ]), this.metric(points[index+1]),
                            this.metric(points[index+2]), this.metric(points[index+3])
						);
					}
				}
			}
			else if ( element.isType(SVGText.CLASS_TYPE)) {
				this.addLabelFromSvgText(element);
			}
			else  {
				Logger.log("Unknown element type: "+element);
			}
		}
	}
}