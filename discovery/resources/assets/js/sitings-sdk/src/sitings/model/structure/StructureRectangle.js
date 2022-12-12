import StructurePoint from "./StructurePoint";
import TransformEvent from "../../events/TransformEvent";
import Geom from "../../../utils/Geom";
import Point from "../../../geom/Point";
import Segment from "../../../geom/Segment";
import Matrix from "../../../geom/Matrix";

export default class StructureRectangle extends StructurePoint {

	// Rectangular structure
	static get DATA_TYPE()	{ return 'rect'; }

	// rectangular structures
	static get POOL()		{ return 1001; }

	// Rainwater pad
	static get RWT_PAD()    { return 1002; }

	/**
	 * @param type {number}
	 * @param x {number} position in meters
	 * @param y {number} position in meters
	 * @param width {number} width in meters
	 * @param height {number} height in meters
	 * @param includeInSiteCoverage {boolean}
	 * @param context {Object}
	 */
	constructor(type, x=0, y=0, width=0, height=0, includeInSiteCoverage=false, context=null )
	{
		super(type, x, y, 0, includeInSiteCoverage, context);

		/**
		 * @type {number}
		 * @private
		 */
		this._width		= width;

		/**
		 * @type {number}
		 * @private
		 */
		this._height	= height;

		/**
		 * @type {number}
		 * @private
		 */
		this._rotation	= 0;

		/**
		 * @type {string}
		 * @private
		 */
		this._label		= this.typeName;
	}

	/**
	 * @return {string}
	 */
	get labelText() { return this._label; }

	/**
	 * @param v {string}
	 */
	set labelText(v) {
		this._label=v;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get rotation() { return this._rotation; }

	/**
	 * @param v {number}
	 */
	set rotation(v) {
		if ( isNaN(v) ) {
			v=0;
		}

		this.dispatchEvent(
			new TransformEvent(
				TransformEvent.ROTATE, {
					dx: this.x,
					dy: this.y,
					rotation:Geom.deg2rad(v - this._rotation),
					model:this
				}
			)
		);

		this._rotation = v;
		this.onChange();
	}

	/**
	 * @return {number}
	 */
	get radians() { return Geom.deg2rad(this._rotation); }

	/**
	 * @return {number}
	 */
	get width() { return this._width; }

	/**
	 * @param v {number}
	 */
	set width(v) {
		if ( isNaN(v) ) {
			v=0;
		}

		this._width=v;
		this.onChange();
		this.dispatchEvent(new TransformEvent(TransformEvent.SHAPE, {model:this}));
	}

	/**
	 * @return {number}
	 */
	get height() { return this._height; }

	/**
	 * @param v {number}
	 */
	set height(v) {
		if ( isNaN(v) ) {
			v=0;
		}
		this._height=v;
		this.onChange();
		this.dispatchEvent(new TransformEvent( TransformEvent.SHAPE, {model:this}));
	}

	/**
	 * @return {string}
	 */
	get typeName() {
		if (this.type === StructureRectangle.POOL) {
			return 'POOL';
		}
		if (this.type === StructureRectangle.RWT_PAD) {
			return 'RWT';
		}

		return super.typeName;
	}

	/**
	 * @return {Segment[]} iterates this rectangle's edges
	 */
	get edges() {
		// rotate all the points around the origin
		const origin = new Point(this.x, this.y);
		const corners = [
			Geom.rotatePoint( origin, new Point( this.x-this.width/2, this.y-this.height/2 ), this.radians ),
			Geom.rotatePoint( origin, new Point( this.x-this.width/2, this.y+this.height/2 ), this.radians ),
			Geom.rotatePoint( origin, new Point( this.x+this.width/2, this.y+this.height/2 ), this.radians ),
			Geom.rotatePoint( origin, new Point( this.x+this.width/2, this.y-this.height/2 ), this.radians )
		];

		let i, sides=[];
		for (i=0; i<4; ++i) {
			sides.push(new Segment(corners[i], corners[(i+1)%4]));
		}

		return sides;
	}

	/**
	 * @return number
	 */
	get area() { return this._width * this._height; }


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IMeasureTarget implementation

	/**
	 * Given a fixed segment and a position close to the house, it searches for the closest wall and rotates the structure
	 * so that the wall and segment are parallel
	 *
	 * @param segment {Segment|LotCurveModel}	The segment (e.g. lot boundary, wall of a house in dual occupancy) to align with
	 * @param globalX {number}					x coordinate of the search position, next to a structure wall
	 * @param globalY {number}					y coordinate of the search position, next to a structure wall
	 * @param startPoint {Point}				origin for the structure search direction
	 *
	 * @public
	 */
	rotateToAlignWithSegmentAt(segment, globalX, globalY, startPoint)
	{
		let reference, boundaryAngle, wallAngle, closeRot, farRot, rotation;

		// Find the closest house wall to the search position
		const houseWall = this.getSnapEdge(globalX, globalY, startPoint);
		if  (!houseWall) {
			return;
		}

		boundaryAngle	= (typeof segment.angleController !== 'undefined') ? segment.angleController.radians : segment.angle;
		wallAngle		= houseWall.angle; //  + Geom.deg2rad(this.rotation);

		// Calculate the angle difference between the boundary and structure wall
		rotation		= Geom.limitAngle(boundaryAngle - wallAngle);

		// Using the rotation setter also dispatches a TransformEvent.ROTATE event, which will
		// update all the measurements that are attached to this structure;
		this.rotation += Geom.rad2deg(rotation);
	}

	/**
	 * Returns a snap position on a house wall, or the search start position (px, py), when no snap is found.
	 *
	 * @param globalX {number}
	 * @param globalY {number}
	 * @param startPoint {Point}
	 * @param snapToRoofs {boolean}
	 * @return {Point}
	 */
	getSnapPosition(globalX, globalY, startPoint=null, snapToRoofs=false)
	{
		const pos = this.getExistingSnapPosition(globalX, globalY, startPoint, snapToRoofs);
		return pos ? pos : new Point(globalX, globalY);
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @param startPoint {Point}
	 * @param snapToRoofs {boolean}
	 * @return {Point|null}
	 */
	getExistingSnapPosition(px, py, startPoint=null, snapToRoofs=false)
	{
		const edge = this.getSnapEdge(px, py, startPoint);
		if ( !edge ) {
			return null;
		}

		return Geom.pointToSegmentIntersection( px, py, edge.a.x, edge.a.y, edge.b.x, edge.b.y );
	}

	/**
	 * @param px {number}
	 * @param py {number}
	 * @param startPoint {Point}
	 * @return {Segment}
	 */
	getSnapEdge(px, py, startPoint)
	{
		let point, dist, bestEdge, bestDist=Infinity, snapSegment;

		// the segment that the measurement is being done on; double the length for automatic snapping
		snapSegment = new Segment(startPoint, new Point(px, py));
		snapSegment.normalize(snapSegment.length*2);

		for (let i=0, edge, edgeList=this.edges; i<edgeList.length; ++i) {
			edge = edgeList[i];

			// Check if the snap segment intersects with this structure wall
			if (Geom.segmentIntersectionCoords(
				snapSegment.a.x, snapSegment.a.y, snapSegment.b.x, snapSegment.b.y,
				edge.a.x, edge.a.y, edge.b.x, edge.b.y
			))	{
				point	= Geom.pointToSegmentIntersection(px, py, edge.a.x, edge.a.y, edge.b.x, edge.b.y);
				dist	= Geom.segmentLength(px, py, point.x, point.y);

				if ( dist < bestDist ) {
					bestDist	= dist;
					bestEdge	= edge;
				}
			}
		}

		return bestEdge;
	}

	/**
	 * Rotates a point around the center of the structure and returns the distance between the new position and a fixed segment
	 *
	 * @param point {Point}
	 * @param segment {Segment}
	 * @param degrees {number}
	 *
	 * @private
	 * @internal
	 */
	_getRotationDistance(point, segment, degrees)
	{
		// work on a copy of the point
		point = point.clone();
		point.rotate(degrees, this.x, this.y);
		return Geom.pointToSegmentDistance(point.x, point.y, segment.a.x, segment.a.y, segment.b.x, segment.b.y);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {string}
	 */
	get dataType() { return StructureRectangle.DATA_TYPE; }

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @return {{dataType, x, y, type}}
	 */
	recordState()
	{
		const state = super.recordState();

		state.dataType	= this.dataType;
		state.width		= this.width;
		state.height	= this.height;
		state.rotation	= this.rotation;
		state.label		= this.labelText;

		return state;
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		this._width		= state.width;
		this._height	= state.height;
		this._rotation	= state.rotation;
		this._label		= state.label;

		super.restoreState(state);
	}

	/**
	 * @param state {{}}
	 * @return {StructureRectangle}
	 */
	static fromRestoreData(state)
	{
		const r = new StructureRectangle(0);
		r.restoreState( state );
		return r;
	}
}
