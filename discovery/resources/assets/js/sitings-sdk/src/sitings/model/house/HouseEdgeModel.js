import Segment from '../../../geom/Segment';
import EventBase from '../../../events/EventBase';
import Point from '../../../geom/Point';
import Geom from '../../../utils/Geom';
import TransformationCutModel from './transform/TransformationCutModel';


export default class HouseEdgeModel extends Segment {

	/**
	 * @param a {LotPointModel}
	 * @param b {LotPointModel}
	 * @param context {*}
	 */
	constructor(a, b, context=null)
	{
		super(null, null, context);

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._a = a;

		/**
		 * @type {LotPointModel}
		 * @private
		 */
		this._b = b;

		/**
		 * @type {Point}
		 * @private
		 */
		this._aTransformDelta = new Point();

		/**
		 * @type {Point}
		 * @private
		 */
		this._bTransformDelta = new Point();

		/**
		 * @type {number}
		 * @private
		 */
		this._cornerTint = 0;

		this._a.addEventListener(EventBase.CHANGE, this.onChange, this);
		this._b.addEventListener(EventBase.CHANGE, this.onChange, this);
	}

	/**
	 * @return {LotPointModel}
	 */
	get a() { return this._a; }

	/**
	 * @return {LotPointModel}
	 */
	get b() { return this._b; }

	/**
	 * @return {number}
	 */
	get angle() {
		return Geom.norm(Geom.angleBetween(this.a.x, this.a.y, this.b.x, this.b.y));
		// return super.angle;
	}

	/**
	 * @returns {number}
	 */
	get cornerTint() { return this._cornerTint; }

	/**
	 * @param v {number}
	 */
	set cornerTint(v) {
		this._cornerTint = v;
		this.onChange();
	}

	/**
	 * @param xRef {number}
	 */
	mirrorHorizontally(xRef)
	{
		super.mirrorHorizontally(xRef);
		this.onChange();
	}

	/**
	 * @param yRef {number}
	 */
	mirrorVertically(yRef)
	{
		super.mirrorVertically(yRef);
		this.onChange();
	}

	/**
	 * Deletes the edge from the house
	 */
	deleteEdge()
	{
		if (this._a !== null) {
			this._a.removeEventListener(EventBase.CHANGE, this.onChange, this);
			this._a = null;
		}

		if (this._b !== null) {
			this._b.removeEventListener(EventBase.CHANGE, this.onChange, this);
			this._b = null;
		}

		this.onDelete();
	}

	/**
	 * Resets transformations applied to one or both of the ends of this edge
	 */
	undoTransforms()
	{
		this._a.translate(-this._aTransformDelta.x, -this._aTransformDelta.y);
		this._b.translate(-this._bTransformDelta.x, -this._bTransformDelta.y);

		this._aTransformDelta = new Point();
		this._bTransformDelta = new Point();

		this.invalidate();
		this.onChange();
	}

	/**
	 * @param transformArea {Rectangle} the area affected by the transformation
	 * @param delta {Point} the distance that the transformation applies to segments within the area
	 * @param cutLine {Segment}
	 * @return {TransformationCutModel}
	 */
	applyTransformation(transformArea, delta, cutLine)
	{
		let cutSegment=null, cutPoint;

		// check if the cut line intersects the edge
		cutPoint = Geom.segmentIntersectionCoords(
			cutLine.a.x, cutLine.a.y, cutLine.b.x, cutLine.b.y,
			this.a.x, this.a.y, this.b.x, this.b.y
		);

		if (cutPoint  != null) {
			// return the extension segment/reduction point
			cutSegment = new TransformationCutModel(cutPoint, cutPoint.add(delta));
		}

		// apply the transformation to edge vertices, if they are within the affected area
		if (transformArea.contains(this.a.x, this.a.y)) {
			this.a.translate(delta.x, delta.y);
			this._aTransformDelta.translate(delta.x, delta.y);
		}

		if (transformArea.contains(this.b.x, this.b.y))
		{
			this.b.translate(delta.x, delta.y);
			this._bTransformDelta.translate(delta.x, delta.y);
		}

		this.validateProperties(true);
		this.onChange();

		return cutSegment;
	}


	//////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation
	//

	/**
	 * recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState ()
	{
		return {
			a			: this.a.recordState(),
			b			: this.b.recordState(),
			aTransDelta	: {
				x: this._aTransformDelta.x,
				y: this._aTransformDelta.y
			},
			bTransDelta : {
				x: this._bTransformDelta.x,
				y: this._bTransformDelta.y
			}
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		this.a.restoreState(state.a);
		this.b.restoreState(state.b);

		this._aTransformDelta.x	= state.aTransDelta.x;
		this._aTransformDelta.y	= state.aTransDelta.y;

		this._bTransformDelta.x	= state.bTransDelta.x;
		this._bTransformDelta.y	= state.bTransDelta.y;

		this.validateProperties(true);
		this.onRestored();
	}
}