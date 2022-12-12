/**
 * InnerPathModel
 * the inner path is fully contained by another, bounding path
 *
 * rule 1. all edges of the current path must stop when intersecting with any edge of the bounding path
 * rule 2. all inner edges must stop when intersecting with another inner edge
 * rule 3. the bounding path must be completely defined and static when the innerPathModel's edges start being added
 */
import RestoreDispatcher from "../../../events/RestoreDispatcher";
import EventBase from "../../../events/EventBase";
import ModelEvent from "../../events/ModelEvent";
import ParallelEasement from "./ParallelEasement";
import EasementEvent from "../../events/EasementEvent";
import CurvedEdgeModel from "./CurvedEdgeModel";
import Geom from "../../../utils/Geom";
import Logger from "../../../utils/Logger";
import DataEvent from "../../../events/DataEvent";

let VERBOSE = false;

export default class InnerPathModel extends RestoreDispatcher {

	/**
	 * @param lotModel {LotPathModel}
	 * @param allowMultipleEdgesPerReference {boolean}
	 * @param context {*}
	 */
	constructor(lotModel, allowMultipleEdgesPerReference=false, context=null)
	{
		super(context);

		/**
		 * @type {LotPathModel}
		 * @protected
		 */
		this._boundingPath	= lotModel;
		this._boundingPath.addEventListener(EventBase.ADDED, this.onBoundEdgeAdded, this);

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._allowMultipleEdgesPerReference	= allowMultipleEdgesPerReference;

		/**
		 * @type {InnerEdgeModel|ParallelEasement|ExistingRetainingWall[]}
		 * @protected
		 */
		this._edges			= [];
	}

	/**
	 * @param e {ModelEvent}
	 */
	onBoundEdgeAdded(e)
	{
		this._boundingPath.lastEdge.addEventListener(ModelEvent.DELETE, this.onBoundsEdgeDeleted, this);
	}

	/**
	 * @param e {ModelEvent}
	 */
	onBoundsEdgeDeleted(e)
	{
		e.model.removeEventListener(ModelEvent.DELETE, this.onBoundsEdgeDeleted, this);
		this.clear();
	}

	recalculateInnerPath()
	{
		for (let i=0; i<this._edges.length; ++i) {
			this._edges[i].recalculate();
		}

		this.applySelfExclusions();
	}

	/**
	 * @return {Array}
	 */
	get lotEdges() { return this._boundingPath.edges; }

	/**
	 * @return {LotPathModel}
	 */
	get lotModel() { return this._boundingPath; }

	/**
	 * @return {Array<InnerEdgeModel>}
	 */
	get edges() { return this._edges; }

	/**
	 * @return {InnerEdgeModel}
	 */
	get lastEdge() { return this._edges[this._edges.length-1]; }

	/**
	 * @param reference
	 * @returns {InnerEdgeModel}
	 */
	getEdgeEasement(reference)
	{
		for (let i=0; i<this._edges.length; ++i) {
			if (this._edges[i].reference === reference) {
				return this._edges[i];
			}
		}

		return null;
	}

	/**
	 * @param reference {LotCurveModel}
	 * @param distance {number}
	 * @param allowCurves {boolean}
	 * @return {boolean}
	 */
	addParallelEdge(reference, distance, allowCurves=false)
	{
		if ( !this._allowMultipleEdgesPerReference ) {
			for (let i=0; i<this._edges.length; ++i) {
				if (this._edges[i].reference === reference) {
					return false;
				}
			}
		}

		if ( allowCurves && reference.isCurve ) {
			this.addEdge( new CurvedEdgeModel(
				reference,
				this._boundingPath,
				distance
			));
		} 	else {
			this.addEdge( new ParallelEasement(
				reference,
				this._boundingPath,
				distance
			));
		}

		return true;
	}

	/**
	 * @param edge {InnerEdgeModel}
	 * @param dispatchAdded {boolean}
	 */
	addEdge(edge, dispatchAdded=true)
	{
		this._edges.push(edge);

		edge.addEventListener(EasementEvent.RECALCULATE	, this.onInnerEdgeRecalculated, this);
		edge.addEventListener(EasementEvent.DELETE		, this.onEasementDelete, this);

		this.applySelfExclusions();
		dispatchAdded && this.dispatchEvent(new DataEvent(EventBase.ADDED, this, false, false, edge));
	}

	/**
	 * @param event {EasementEvent}
	 */
	onInnerEdgeRecalculated(event)
	{
		this.applySelfExclusions();
	}

	/**
	 * @param e {EasementEvent}
	 */
	onEasementDelete(e)
	{
		let edge = e.easement;
		if (edge) {
			edge.removeEventListener(EasementEvent.RECALCULATE	, this.onInnerEdgeRecalculated, this);
			edge.removeEventListener(EasementEvent.DELETE		, this.onEasementDelete, this);
			this._edges.splice(this._edges.indexOf(edge), 1);
		}

		// reapply the self exclusions
		this.applySelfExclusions();
	}

	clear()
	{
		while (this._edges.length) {
			this._edges[0].deleteEdge();
		}
	}

	/**
	 * applySelfExclusions
	 * apply the exclusions of the path on itself
	 */
	applySelfExclusions()
	{
		this.applyConcaveExclusions();
		this.dispatchEvent( new EasementEvent(EasementEvent.RECALCULATE, null) );
	}


	///////////////////////////////////////////////////////////////////////////////////////////////////
	// HELPER functions

	printPolyStructure()
	{
		VERBOSE && Logger.log("poly type: "+(this._boundingPath.isCw ? "CW" : "CCW"));

		let i, a, edges = this._boundingPath.edges;
		let dist=1;

		for (i=0; i<edges.length; ++i)
		{
			a = Geom.limitDegrees(
				edges[(i+dist)%edges.length].angleController.decimalDegrees -
				edges[i].angleController.decimalDegrees
			);

			VERBOSE && Logger.log("LotEdgeAngle dif "+((i+dist)%edges.length)+"-"+i+" : ("+edges[(i+dist)%edges.length].angleController.decimalDegrees+"-"+edges[i].angleController.decimalDegrees+") = "+a);
		}
	}

	/**
	 * applyConcaveExclusions
	 *
	 * Current inner path building algorithm. Intersects all of the edges of the path and reduces the segments that
	 * are located _between_ this path and the bounding path (i.e. the edges of the lot)
	 */
	applyConcaveExclusions()
	{
		VERBOSE && this.printPolyStructure();
		VERBOSE && Logger.log("---------------------------------------------------------------------");
		VERBOSE && Logger.log("applySelfExclusions");

		// the distance between the edges for which intersections are performed
		let dist, maxDist,
			// the indexes of the reference edges in the bounding path
			refIndx, leftRefIndx, rightRefIndx,
			// the group of left and right inner-edges; every left inner-edge will be intersected with all right inner-edges, and viceversa
			lEdges, rEdges, lIndx, rIndx, leftChanged, rightChanged,
			// store a cache of all inner edges with a certain reference
			edgesWithRefs,
			// helper variables
			angleDif, isConcave;

		// cache all the inner edges with the same reference
		edgesWithRefs = [];
		for (refIndx=0; refIndx<this.lotEdges.length; ++refIndx) {
			edgesWithRefs.push(this.edgesWithReference(this.lotEdges[refIndx]));
		}

		// reset all edges
		for (lIndx=0; lIndx<this._edges.length; ++lIndx)
		{
			this._edges[lIndx].resetExclusions();
			this._edges[lIndx].rebuildExclusionParams();
		}

		// maximum distance between intersecting references = reference count / 2
		maxDist	= this.lotEdges.length / 2;

		// apply exclusions over an ever-increasing distance
		for (dist=1; dist<=maxDist; ++dist)
		{
			// go over all the bounding path's edges
			for (refIndx=0; refIndx<this.lotEdges.length; ++refIndx)
			{
				leftRefIndx		= refIndx;
				rightRefIndx	= ( refIndx + dist ) % this.lotEdges.length;

				// fetch the edges that reference both the current edge, and the edge at [dist] positions further
				lEdges			= edgesWithRefs[ leftRefIndx ];
				rEdges			= edgesWithRefs[ rightRefIndx ];

				// calculate the angle difference between the two boundary edges
				angleDif	= Geom.limitDegrees(
					this.lotEdges[rightRefIndx].angleController.decimalDegrees -
					this.lotEdges[ leftRefIndx].angleController.decimalDegrees
				);

				// skip intersections for parallel edges
				if (Geom.epsilonEqual(angleDif, 180)) {
					VERBOSE && Logger.log('Skipping '+leftRefIndx+' TO '+rightRefIndx+' because they are parallel');
					continue;
				}

				// concave detection is different depending on whether the lot is built CW or CCW
				isConcave = this._boundingPath.isCw ? ( angleDif > 180 ) : ( angleDif < 180 );

				// apply exclusions to all the edges on a boundary
				for (const leftEdge of lEdges)
				{
					for (const rightEdge of rEdges)
					{
						leftChanged  = rightEdge.hasExclusions && leftEdge.applyExclusionOf(rightEdge, this.isConcaveLR, this, false);
						rightChanged = leftEdge.hasExclusions && rightEdge.applyExclusionOf(leftEdge, this.isConcaveRL, this, true);

						if (leftChanged) {
							leftEdge.rebuildExclusionParams();
						}

						if (rightChanged) {
							rightEdge.rebuildExclusionParams();
						}
					}
				}
			}
		}

		// soft-commit the exclusions
		for (lIndx=0; lIndx<this._edges.length; ++lIndx)
		{
			this._edges[lIndx].exclusionsSet();
		}
	}

	/**
	 * @param lAngle {number}
	 * @param rAngle {number}
	 * @return {boolean}
	 */
	isConcaveLR(lAngle, rAngle)
	{
		let angleDif = Geom.limitAngle( rAngle - lAngle );
		return this._boundingPath.isCw ? ( angleDif > Math.PI ) : ( angleDif < Math.PI );
	}

	/**
	 * @param lAngle {number}
	 * @param rAngle {number}
	 * @return {boolean}
	 */
	isConcaveRL(rAngle, lAngle)
	{
		return this.isConcaveLR( lAngle, rAngle );
	}

	/**
	 * applyLeftToRightExclusions
	 *
	 * @OBSOLETTE: Old Inner Path building algorithm
	 *
	applyLeftToRightExclusions()
	{
		let dist, maxDist, refIndx, angleDif, isConcave, edgesWithRefs=[], lEdges, rEdges, lIndx, rIndx;

		// init
		maxDist	= this.edges.length / 2;

		// cache the edges-with-reference for a better runtime
		for (refIndx=0; refIndx<this.lotEdges.length; ++refIndx) {
			edgesWithRefs.push(this.edgesWithReference(this.lotEdges[refIndx]));
		}

		// reset all edges
		for (lIndx=0; lIndx<this._edges.length; ++lIndx) {
			this._edges[lIndx].resetExclusions();
			this._edges[lIndx].rebuildExclusionParams();
		}

		// apply exclusions over an ever-increasing distance
		for (dist=1; dist<=maxDist; ++dist) {
			// go over all the bounding path's edges
			for (refIndx=0; refIndx<this.lotEdges.length; ++refIndx) {
				// fetch the edges that reference both the current edge, and the edge <dist> positions further
				lEdges		= edgesWithRefs[ refIndx ];
				rEdges		= edgesWithRefs[(refIndx+dist)%this.lotEdges.length];

				// calculate the angle difference between the two edges
				angleDif	= Geom.limitDegrees(
					this.lotEdges[(refIndx+dist)%this.lotEdges.length].angleController.decimalDegrees -
					this.lotEdges[refIndx].angleController.decimalDegrees
				);
				isConcave = angleDif < 180;

				for (lIndx=0; lIndx<lEdges.length; ++lIndx) {
					for (rIndx=0; rIndx<rEdges.length; ++rIndx) {
						lEdges[lIndx].applyRightExclusion( rEdges[rIndx] );
						rEdges[rIndx].applyLeftExclusion ( lEdges[lIndx] );
					}
				}
			}

			// reset the exclusion edges for the parallel specialEasements
			for (refIndx=0; refIndx<this._edges.length; ++refIndx)
			{
				this._edges[refIndx].rebuildExclusionParams();
			}
		}

		// soft-commit the exclusions
		for (lIndx=0; lIndx<this._edges.length; ++lIndx) {
			this._edges[lIndx].exclusionsSet();
		}
	}
	 */

	/**
	 * @param ref {LotCurveModel}
	 * @return {Array.<InnerEdgeModel>}
	 */
	edgesWithReference(ref)
	{
		let i, result = [];
		for (i=0; i<this._edges.length; ++i) {
			if (this._edges[i].reference===ref) {
				result.push(this._edges[i]);
			}
		}

		return result;
	}


	//////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * recordState
	 * returns {{}} Data structure containing all the parameters representing this object's state
	 */
	recordState ()
	{
		let edgeStates = [], i;
		for (i=0; i<this._edges.length; ++i) {
			edgeStates.push(this._edges[i].recordState());
		}

		return { edges: edgeStates };
	}

	/**
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		let i, newEdges = state.edges, edgeState;

		// delete all existing edges
		this.clear();

		// restore existing edges
		for (i=0; i<newEdges.length && i<this._edges.length; ++i) {
			this._edges[i].restoreState( newEdges[i] );
		}

		// add missing edges
		for (; i<newEdges.length; ++i)
		{
			/**
			 * @type {{type, refIndx}}
			 */
			edgeState	= newEdges[i];

			switch ( edgeState.type )
			{
				case ParallelEasement.TYPE:
				case CurvedEdgeModel.TYPE:
					this.addParallelEdge(
						this._boundingPath.edges[ edgeState.refIndx ],
						edgeState.distance,
						edgeState.type===CurvedEdgeModel.TYPE
					);

					if (edgeState.hasOwnProperty('splayed')) {
						this.lastEdge.restoreState(edgeState);
					}
				break;
				default:
					// Unsupported
					break;
			}
		}

		// delete surplus edges
		while ( i < this._edges.length ) {
			this._edges[i].deleteEdge();
		}

		this.onRestored();
	}
}