import HouseSegmentSet from './HouseSegmentSet';
import SVGG from '../../../svg/display/SVGG';
import SVGParserCommon from '../../../svg/parser/SVGParserCommon';
import SVGPolygon from '../../../svg/display/SVGPolygon';
import Point from '../../../geom/Point';
import Matrix from '../../../geom/Matrix';
import SVGPath from '../../../svg/display/SVGPath';
import SVGMoveToCommand from '../../../svg/data/path/SVGMoveToCommand';
import SVGCurveToCubicCommand from '../../../svg/data/path/SVGCurveToCubicCommand';
import SVGLineToCommand from '../../../svg/data/path/SVGLineToCommand';
import SVGClosePathCommand from '../../../svg/data/path/SVGClosePathCommand';
import Logger from '../../../utils/Logger';
import SVGLine from '../../../svg/display/SVGLine';
import SVGRect from '../../../svg/display/SVGRect';
import SVGPolyline from '../../../svg/display/SVGPolyline';
import SVGText from '../../../svg/display/SVGText';
import HouseLabelModel from './HouseLabelModel';
import HouseLayerType from './HouseLayerType';
import Utils from '../../../utils/Utils';
import MergedSegmentSet from '../../data/henley/MergedSegmentSet';
import LotEdgeModel from '../lot/LotEdgeModel';
import Geom from '../../../utils/Geom';


export default class HouseLayerModel extends HouseSegmentSet {

	/**
	 * @param data {SVGG|MergedSegmentSet}
	 * @param type {HouseLayerType}
	 * @param toMm {number}
	 * @param loadData {boolean}
	 * @param context {*}
	 */
	constructor(data=null, type=null, toMm=1, loadData=true, context=null)
	{
		super();

		/**
		 * @type {SVGG|MergedSegmentSet}
		 * @private
		 */
		this._data	 = data;

		/**
		 * @type {SVGG}
		 * @private
		 */
		this._group	 = (data instanceof SVGG) ? data : null;

		/**
		 * @type {MergedSegmentSet}
		 * @private
		 */
		this._mergedSet = (data instanceof MergedSegmentSet) ? data : null;

		/**
		 * @type {HouseLayerType}
		 * @private
		 */
		this._type	 = type;

		/**
		 * @type {number}
		 * @private
		 */
		this._toMm	 = toMm;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._visible = false;

		/**
		 * @type {HouseLabelModel[]}
		 * @private
		 */
		this._labels = [];

		// loadData will be set to false when restoring the layer from a RestorationData
		if (loadData) {
			if (this._group) {
				this.parseGroup(this._group);
			}	else if (this._mergedSet) {
				for (let i=0; i<this._mergedSet.segments.length; ++i) {
					const segment = this._mergedSet.segments[i];
					this.addEdgeFromPoints(
						segment.a.x, segment.a.y,
						segment.b.x, segment.b.y
					);
				}
			}
		}
	}

	get layerId() {
		if ( this._group )
			return this._group.id.toLowerCase();

		return null;
	}

	/**
	 * @return {boolean}
	 */
	get isAlfresco() {
		const id = this.layerId;
		return id ? id.indexOf('alfresco') >= 0 : false;
	}

	/**
	 * @return {boolean}
	 */
	get visible() { return this._visible; }

	/**
	 * @param v {boolean}
	 */
	set visible(v)
	{
		this._visible=v;
		this.onChange();
	}

	/**
	 * @return {SVGG}
	 */
	get group() { return this._group; }

	/**
	 * @return {HouseLayerType}
	 */
	get type() { return this._type; }

	/**
	 * @return {HouseLabelModel[]}
	 */
	get labels() { return this._labels; }

	getLayerLabel() {
		return this.group ? Utils.sentenceCase(Utils.svgIdToName(this.group.id)) : '';
	}

	/**
	 * @param xRef {number}
	 */
	mirrorHorizontally(xRef)
	{
		for (let i=0; i<this.edges.length; ++i) {
			this.edges[i].mirrorHorizontally(xRef);
		}
		for (let i=0; i<this.labels.length; ++i) {
			this.labels[i].mirrorHorizontally(xRef);
		}
	}

	/**
	 * @param yRef {number}
	 */
	mirrorVertically(yRef)
	{
		for (let i=0; i<this.edges.length; ++i) {
			this.edges[i].mirrorVertically(yRef);
		}
		for (let i=0; i<this.labels.length; ++i) {
			this.labels[i].mirrorVertically(yRef);
		}
	}

	/**
	 * Clears the effect of house transformations on all the edges in this layer
	 */
	undoTransforms()
	{
		for (let i=0; i<this.edges.length; ++i) {
			this.edges[i].undoTransforms();
		}
	}

	/**
	 * Applies a transformation to all the edges in this layer
	 *
	 * @param transformArea {Rectangle}
	 * @param delta {Point}
	 * @param cutLine {Segment}
	 * @return {TransformationCutModel[]} All the cuts/or extension triggered in the layer's edges by the transformation
	 */
	applyTransformation(transformArea, delta, cutLine)
	{
		let cutSegments = [], crtSegment;

		for (let i=0; i<this.edges.length; ++i)
		{
			crtSegment = this.edges[i].applyTransformation(transformArea, delta, cutLine);

			if (crtSegment !== null) {
				cutSegments.push(crtSegment);
			}
		}

		return cutSegments;
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	translate(x, y)
	{
		super.translate( x, y );

		for (let i=0; i<this._labels.length; ++i) {
			this._labels[i].translate( x, y );
		}
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
				let cw = [0, 1, 1, 0], ch = [0, 0, 1, 1], p = [];

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
							/*
							@UNSUPPORTED
							this.addCurveFromPoints(
								this.metric(cx),	  this.metric(cy),
								this.metric(ctcc.x),  this.metric(ctcc.y),
								this.metric(ctcc.x1), this.metric(ctcc.y1),
								this.metric(ctcc.x2), this.metric(ctcc.y2)
							);
							 */
							this.addEdgeFromPoints(
								this.metric(cx),	  this.metric(cy),
								this.metric(ctcc.x),  this.metric(ctcc.y),
							);
							cx = ctcc.x;
							cy = ctcc.y;
						}	else {
							/*
							@UNSUPPORTED
							this.addCurveFromPoints(
								this.metric(cx),		 this.metric(cy),
								this.metric(cx+ctcc.x),  this.metric(cy+ctcc.y),
								this.metric(cx+ctcc.x1), this.metric(cy+ctcc.y1),
								this.metric(cx+ctcc.x2), this.metric(cy+ctcc.y2)
							);
							*/
							this.addEdgeFromPoints(
								this.metric(cx),		 this.metric(cy),
								this.metric(cx+ctcc.x),  this.metric(cy+ctcc.y),
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
						Logger.log('Unknown SVGPath command: '+path.path[j]);
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
			else {
				Logger.log('Unknown element type: ');
				Logger.log(element);
			}
		}
	}

	/**
	 * @param svgText {SVGText}
	 */
	addLabelFromSvgText(svgText)
	{
		// Build multi-line text
		let text='', i;
		for (i=0; i<svgText.numTextElements; ++i) {
			text = text + (text.length ? '\n' : '') + svgText.getTextElementAt(i);
		}

		// Prepare label transformation
		let mat = new Matrix();
		mat.translate(Number(svgText.svgX), Number(svgText.svgY));

		// see if the text has a transformation
		if(svgText.svgTransform != null){
			let svgTransformMat = SVGParserCommon.parseTransformation(svgText.svgTransform);
			if(svgTransformMat)
				mat.concat(svgTransformMat);
		}

		const rcd = Math.atan(  mat.c / mat.d );
		this._labels.push( new HouseLabelModel(
			text.toUpperCase(),
			this.metric(mat.tx),
			this.metric(mat.ty)+this._labels.length*0.3,
			rcd,
			mat
		) );
	}

	/**
	 * @param value {*}
	 * @return {number}
	 */
	metric(value) { return Number(value) * this._toMm / 1000; }

	deleteLayer()
	{
		this.clear();
		this.onDelete();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 */
	get recordLabelsState()
	{
		let data = [];
		for (let i=0; this._labels && i<this._labels.length; ++i) {
			// if (this._labels[i] != null) {
				data.push(this._labels[i].recordState());
			// }
		}
		return data;
	}

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @return {{}}
	 */
	recordState()
	{
		let state = super.recordState();

		state.visible	= this._visible;
		state.toMm		= this._toMm;
		state.typeId	= this._type.id;
		state.groupId	= this._group ? this._group.id : null;
		state.labels	= this.recordLabelsState;

		return state;
	}

	/**
	 * @INFO: The group has to be set manually by the HouseModel, using state.groupId, before calling restoreState()
	 *
	 * @param group {SVGG}
	 */
	restoreGroup(group)
	{
		this._group = group;
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 *
	 * @param state {{}}
	 */
	restoreState(state)
	{
		// Delete all current labels
		while (this._labels && this._labels.length) {
			this._labels.pop().deleteModel();
		}

		this._labels = [];

		// Add new labels
		if (state.hasOwnProperty('labels')) {
			for (let i=0; i<state.labels.length; ++i) {
				let label = new HouseLabelModel('', 0, 0);
				label.restoreState(state.labels[i]);
				this._labels.push(label);
			}
		}

		this._visible	= state.visible;
		this._toMm		= state.toMm;
		this._type		= HouseLayerType.fromId( state.typeId );

		super.restoreState(state);
	}
}