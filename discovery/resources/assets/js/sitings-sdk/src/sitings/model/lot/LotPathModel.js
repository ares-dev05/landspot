import RestoreDispatcher from '../../../events/RestoreDispatcher';
import Geom from '../../../utils/Geom';
import LotCurveModel from './LotCurveModel';
import LotPointModel from './LotPointModel';
import LotEdgeAngle from './LotEdgeAngle';
import Point from '../../../geom/Point';
import Rectangle from '../../../geom/Rectangle';
import ModelEvent from '../../events/ModelEvent';
import LotEdgeEvent from '../../events/LotEdgeEvent';
import EventBase from '../../../events/EventBase';
import TransformEvent from '../../events/TransformEvent';
import LotEdgeManipulator from './trace/LotEdgeManipulator';
import LotEdgeModel from './LotEdgeModel';
import Polygon from '../../../geom/Polygon';

/**
 * @TODO: We really need to base this on the SegmentSet/Polygon class used for Kaspa
 *
 * A connect-the-dots segment set that has to close as a Polygon in the end.
 */
export default class LotPathModel extends RestoreDispatcher
{
	/**
	 * The default path drawing mode is data entry; the most accurate mode, it asks users to enter the meters and angle of each edge
	 * @return {number}
	 * @constructor
	 */
	static get MODE_DATA_ENTRY() { return 0; }

	/**
	 * Auxiliary mode, allows users to manually draw the lot.
	 * @return {number}
	 * @constructor
	 */
	static get MODE_TRACING() { return 1; }

	constructor(lotName='', context=null) {
		super(context);

		/**
		 * @type {string}
		 * @private
		 */
		this._lotName	= lotName;

		/**
		 * @type {number}
		 * @private
		 */
		this._inputMode = LotPathModel.MODE_DATA_ENTRY;

		/**
		 * @type {LotCurveModel[]}
		 * @private
		 */
		this._edges	= [];

		/**
		 * Indicates if the edges of the lot turn in a clockwise or counterclockwise direction
		 * @type {boolean}
		 * @public
		 */
		this.isCw	= false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._showAngleInEdgeLabels = true;
	}

	/**
	 * @returns {string}
	 */
	get lotName() { return this._lotName; }

	/**
	 * @param v {string}
	 */
	set lotName(v) { this._lotName=v; this.onChange(); }

	/**
	 * @returns {string}
	 */
	get lotNameAndArea() {
		return this.lotName + '\n' + this.totalArea.toFixed(0) + 'M²';
	}

	/**
	 * @return {boolean}
	 */
	get isDataMode () { return this._inputMode === LotPathModel.MODE_DATA_ENTRY; }

	/**
	 * @return {boolean}
	 */
	get isTraceMode() { return this._inputMode === LotPathModel.MODE_TRACING;    }

	/**
	 * @return {number}
	 */
	get inputMode() { return this._inputMode; }

	/**
	 * @param v {number}
	 */
	set inputMode(v) {
		if (this._inputMode!==v) {
			this._inputMode=v;

			// change the edges to reflect the current mode
			this.setupDefaultLot();

			// dispatch change for views
			this.onChange();
		}
	}

	/**
	 * @returns {boolean}
	 */
	get showAngleInEdgeLabels() { return this._showAngleInEdgeLabels; }

	/**
	 * @param v {boolean}
	 */
	set showAngleInEdgeLabels(v) { this._showAngleInEdgeLabels = v;}

	/**
	 * setup a default lot depending on the entry mode
	 */
	setupDefaultLot(useDebugStructure=false)
	{
		let index, edge, edgeParams = [[0,0,false], [0,0,false], [0,0,false], [0,0,false]];

		if ( this.isTraceMode ) {
			// delete all the 0 meters edges
			for(index=this._edges.length-1; index>=0; --index) {
				edge=this._edges[index];

				if (edge && Geom.equal(edge.length, 0) ) {
					edge.deleteEdge(true);
				}
			}

			// add one 20 meters / 90 degrees edge
			edgeParams = [[20,90,false]];
		}    else {
			// delete the default edge from trace mode
			if ( this._edges.length===1 ) {
				edge = this._edges[0];
				if (edge && edge.length===20 && edge.angleController.degrees===90) {
					edge.deleteEdge( true );
				}
			}

			// @DEBUG: create a simple rectangular lot for testing
			if ( useDebugStructure ) {
			 	edgeParams = [[30,0,false], [30,90,true], [30,0,true], [30,90,false]];
			}
		}

		// add fixed edges
		for (index=this._edges.length; index<edgeParams.length; ++index) {
			this.addEdge(
				new LotCurveModel(
					// end point
					new LotPointModel(),
					// length
					edgeParams[index][0],
					// angle
					new LotEdgeAngle(edgeParams[index][1],0,0,edgeParams[index][2]),
					// arc meters, radius, isCurve
					0, 0, false,
					// can delete
					index>2
				)
			);
		}

		// with a new lot, make sure the normals are calculated
		this._recalculateNormals();
	}

	/**
	 * @param index {number}
	 * @return {LotCurveModel}
	 */
	edgeAt(index)	{ return index < this._edges.length ? this._edges[index] : null; }

	/**
	 * @returns {LotCurveModel[]}
	 */
	get edges()		{ return this._edges; }

	/**
	 * @param curveStep {number}
	 * @return {Segment[]}
	 */
	getPieceWiseEdges(curveStep=0.5) {
		let edges = [];

		this._edges.forEach(
			edge => {
				if (edge.isCurve) {
					const curveSteps = Math.max(2, Math.ceil(edge.arcLength/curveStep));
					// split the curve in a set of straight lines
					edges = edges.concat(edge.pieceWiseSplit(curveSteps));
				}	else {
					edges.push(edge.clone());
				}
			}
		);

		return edges;
	}

	/**
	 * @returns {Point[]}
	 */
	get vertices() {
		const list = [];
		const hasVertex = (v) => list.find(p => Geom.pointsEqual(p, v)) !== undefined;

		this._edges.forEach(
			edge => [edge.a, edge.b].forEach(
				v => !hasVertex(v) && list.push(v)
			)
		);

		return list;
	}

	/**
	 * @param edge {LotCurveModel}
	 * @returns {number}
	 */
	indexOf(edge)	{ return this._edges.indexOf(edge); }

	/**
	 * @return {LotCurveModel}
	 */
	get lastEdge() {
		if (this._edges && this._edges.length>0)
			return this._edges[this._edges.length-1];
		return null;
	}

	/**
	 * @return {boolean}
	 */
	get canAdvance()
	{
		for (let i=0; i<this._edges.length; ++i)
			if ( this._edges[i].length===0 ) return false;
		return true;
	}

	/**
	 * End of the path that's being constructed point-to-point
	 * @return {Point}
	 */
	get pathEnd()
	{
		return this._edges.length ?
			this.lastEdge.b.clone() : new Point();
	}

	/**
	 * @return {number} The surface of the lot, calculated in squared meters
	 */
	get totalArea()
	{
		let area2 = 0, i, edge, areaSign, roughSurface, segSurface;

		// Calculate the double of the area when considering all segments as straight edges
		for (i=0; i<this._edges.length; ++i) {
			edge   = this._edges[i];
			area2 += ( edge.a.x * edge.b.y - edge.a.y * edge.b.x );
		}

		// Determine the sign of the area
		areaSign	= Geom.sign(area2);

		// Add the areas of the curves
		for (i=0; i<this._edges.length; ++i) {
			edge	= this._edges[i];

			if (edge.isCurve) {
				// @TODO: refactor this
				roughSurface = edge.roughTriangleSurface();
				segSurface	 = Math.abs(edge.getSegmentSurface());

				if ( Geom.sign(roughSurface) === areaSign ) {
					// same sign => the curve ADDS to the area
					area2 += ( 2 * areaSign * segSurface );
				}
				else {
					// different sign => the curve DELETES from the area
					area2 -= ( 2 * areaSign * segSurface );
				}
			}
		}

		return Math.abs( area2 / 2 );
	}

	/**
	 * @return {Point} The usual center, called the centroid (center of area) comes from considering the surface of the polygon as having constant density.
	 * @TODO: this is an exact copy of SegmentSet.centroid. We need to refactor LotPathModel to extend SegmentSet/Polygon so we can take advantage of their existing functionality
	 */
	get centroid() {
		let twiceArea = 0, x=0, y=0;

		this.edges.forEach(
			edge => {
				const area = edge.a.x * edge.b.y - edge.b.x * edge.a.y;
				twiceArea += area;
				x += (edge.a.x + edge.b.x) * area;
				y += (edge.a.y + edge.b.y) * area;
			}
		);

		twiceArea *= 3;

		return new Point(x/twiceArea, y/twiceArea);
	}

	/**
	 * @TODO: optimize this calculation to take into account different angles, and return the smallest bounding box
	 * @return {Rectangle}
	 */
	get boundingBox()
	{
		let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;

		for(let i=0; i<this._edges.length; ++i) {
			let edge = this._edges[i];
			minX = Math.min( minX, edge.a.x, edge.b.x );
			maxX = Math.max( maxX, edge.a.x, edge.b.x );
			minY = Math.min( minY, edge.a.y, edge.b.y );
			maxY = Math.max( maxY, edge.a.y, edge.b.y );
		}

		return new Rectangle( minX, minY, maxX-minX, maxY-minY );
	}

	/**
	 * Delete all the edges in the lot
	 */
	clear()
	{
		// reset the input mode but without rebuilding the lot
		if (this._inputMode!== LotPathModel.MODE_DATA_ENTRY ) {
			this._inputMode  = LotPathModel.MODE_DATA_ENTRY;

			// dispatch change for views
			this.onChange();
		}

		for (let i=this._edges.length-1; i+1; --i) {
			if (this._edges[i].canDelete) {
				this._edges[i].deleteEdge();
			}
		}
	}

	/**
	 * @param edge {LotCurveModel}
	 * @param connectToPreviousEdge {boolean}
	 */
	addEdge(edge, connectToPreviousEdge=true)
	{
		if ( this._edges.length && connectToPreviousEdge ) {
			edge.a = this.lastEdge.b;

			if (this.lastEdge.manipulator) {
				edge.setupManipulator(this.lastEdge.manipulator.b);
			}
		}	else {
			edge.setupManipulator(null);
		}

		edge.showAngleInEdgeLabels = this.showAngleInEdgeLabels;

		this._edges.push(edge);
		edge.index = this._edges.length;

		edge.addEventListener(ModelEvent.DELETE	  	  , this._edgeDeleteEvent	, this);
		edge.addEventListener(EventBase.CHANGE		  , this._edgeParamsChanged	, this);
		edge.addEventListener(LotEdgeEvent.MANIPULATE , this._edgeManipulate	, this);

		this._recalculateNormals();
		this.onAdded();
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	addAtPosition(x, y)
	{
		let a, angle, params;

		if ( this._edges.length ) {
			a = this.lastEdge.b;
		}	else {
			a = new LotPointModel();
		}

		// convert the given coordinates to edge parameters
		params	= LotEdgeManipulator.edgeParamsFromCoords(a.x, a.y, x, y);

		angle	= new LotEdgeAngle();
		angle.radians = params.radians;

		// we need to reverse engineer the parameters of the edge to be able to add it
		this.addEdge(
			new LotCurveModel(a, params.length, angle, 0, 0, false)
		);
	}

	/**
	 * @param e {ModelEvent}
	 * @private
	 */
	_edgeDeleteEvent(e)
	{
		this._deleteEdge(e.model);
		this._recalculateNormals();
	}

	/**
	 * @param e {LotEdgeEvent}
	 * @private
	 */
	_edgeManipulate(e)
	{
		this.dispatchEvent(e);
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	_edgeParamsChanged(e)
	{
		this._recalculateNormals();
	}

	/**
	 * @param edge {LotCurveModel}
	 * @private
	 */
	_deleteEdge(edge)
	{
		let index = this._edges.indexOf(edge);

		edge.removeEventListener(ModelEvent.DELETE	  	 , this._edgeDeleteEvent	, this);
		edge.removeEventListener(EventBase.CHANGE		 , this._edgeParamsChanged	, this);
		edge.removeEventListener(LotEdgeEvent.MANIPULATE , this._edgeManipulate		, this);

		// remove the edge from the poly
		this._edges.splice( this._edges.indexOf(edge), 1 );

		// reconnect the remaining edges for a continuous outline
		if ( index === 0 ) {
			// deleting the first point of the outline
			if ( this._edges.length )
			{
				// put the next edge at the origin
				this._edges[index].a.x = 0;
				this._edges[index].a.y = 0;
			}
		}
		else if ( index < this._edges.length )
		{
			// deleting a point in the middle
			this._edges[index].a = this.edges[index-1].b;
		}
	}

	/**
	 * @param edge {LotCurveModel|Segment}
	 * @param direction {int}
	 */
	alignEdgeToDirection(edge, direction)
	{
		// define the direction angles
		let angles = [0, Math.PI/2, Math.PI, 3*Math.PI/2];

		// dispatch a rotation event to the
		this.dispatchEvent(new TransformEvent(
			TransformEvent.ROTATE, {
				rotation: Geom.rad2deg( Math.PI+angles[direction]-edge.outNormal.angle )
			}
		));

		for (let i=0; i<this._edges.length; ++i) {
			this._edges[i].alignedToPage = (this._edges[i] === edge);
		}
	}

	/**
	 * @param target {Polygon} An axis-aligned polygon that approximately matches the shape of the current lot
	 */
	matchRotationWith(target) {
		const origin		= this.centroid;

		// Create a clone of the lot model centred at (0,0). We will apply our rotations to it
		const lot			= Polygon.from(this.vertices.map(v => v.subtract(origin)));

		// Method 1: pick the first vertex in the lot and try to align it with each of the target's vertices, one by one
		const control 		= lot.sourceVertices[0],
			controlDistance = control.vectorLength,
			controlAngle	= control.vectorAngle;

		const rotateLot     = (angle) => lot.sourceVertices.forEach(v => v.rotate(angle, 0, 0));

		let bestDistance=Infinity, bestRotation=0;

		target.sourceVertices.forEach(
			testVertex => {
				// See if we can have an approximate alignment by rotating the lot around its center so that
				// We use a maximum match of 90% between the control point and the test point
				if (Math.abs(controlDistance/testVertex.vectorLength-1) < 0.1) {
					// Try to align the control point to this one
					const testRotation = testVertex.vectorAngle - controlAngle;

					rotateLot(testRotation);

					// calculate the minimum overall distance between vertices
					const totalDistance = lot.sourceVertices.reduce(
						(sum, lotVertex) => {
							// find the closest point to this one in the target polygon and add the distance to the overall sum
							return sum + target.sourceVertices.reduce(
								(minimum, targetVertex) => Math.min(minimum, lotVertex.distanceToPoint(targetVertex)),
								Infinity
							);
						}, 0
					);

					if (totalDistance < bestDistance) {
						bestDistance = totalDistance;
						bestRotation = testRotation;
					}

					// Rotate the lot back
					rotateLot(-testRotation);
				}
			}
		);

		return bestRotation;
	}

	/**
	 * @private
	 */
	_recalculateNormals()
	{
		for (let i=0; i<this._edges.length; ++i) {
			this._edges[i].updateNormals(this._edges);
		}

		// calculate the geometric center of the lot
		let midx=0, midy=0, cwCount=0, ccwCount=0, angles=[], i;
		for (i=0; i<this._edges.length; ++i) {
			midx += this._edges[i].a.x;
			midy += this._edges[i].a.y;
		}

		midx /= this._edges.length;
		midy /= this._edges.length;
		for (i=0; i<this._edges.length; ++i) {
			angles.push( Geom.norm(Geom.angleBetween(midx, midy, this._edges[i].a.x, this._edges[i].a.y)) );

			if (i>0) {
				if ( Geom.norm( angles[i]-angles[i-1] ) > Math.PI )
					++ccwCount;
				else
					++cwCount;
			}
		}

		if ( Geom.norm( angles[0]-angles[angles.length-1] ) > Math.PI )
			++ccwCount;
		else
			++cwCount;

		this.isCw = ( cwCount > ccwCount );

		// The shape of the lot has changed
		this.onChange();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Tests

	/**
	 * @param point {Point}
	 * @returns {Boolean}
	 */
	contains(point) {
		let inside=false, count=0, coll=[];

		this.edges.forEach((edge) => {
			if (edge.testRayCast(point)) {
				inside = !inside;
				++count;
				coll.push(edge);
			}
		});

		return inside;
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @return {Boolean}
	 */
	containsCoords(x, y) {
		return this.contains(new Point(x, y));
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * returns a data structure containing all the parameters representing this object's state
	 * @return {*}
	 */
	recordState()
	{
		let edgeStates = [], i;
		for (i=0; i<this._edges.length; ++i) {
			edgeStates.push( this._edges[i].recordState() );
		}

		return {edges: edgeStates};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {*} the state to be restored
	 */
	restoreState(state)
	{
		let i, newEdges = state.edges, edge;

		// restore existing edges
		for (i=0; i<newEdges.length && i<this._edges.length; ++i) {
			this._edges[i].restoreState(newEdges[i]);
		}

		// add missing edges
		for (; i<newEdges.length; ++i) {
			edge = new LotCurveModel(new LotPointModel(), 0, new LotEdgeAngle(), 0, 0, false);
			edge.restoreState(newEdges[i]);
			this.addEdge(edge);
		}

		// delete surplus edges
		while (i<this._edges.length) {
			this._edges[i].deleteEdge(true);
		}

		this.onRestored();
	}
}