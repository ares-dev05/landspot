import RestoreDispatcher from "../../../events/RestoreDispatcher";
import ModelEvent from "../../events/ModelEvent";
import HouseEdgeModel from "./HouseEdgeModel";
import LotPointModel from "../lot/LotPointModel";

export default class HouseSegmentSet extends RestoreDispatcher
{

	/**
	 * @param context {*}
	 */
	constructor(context=null)
	{
		super(context);

		/**
		 * @type {HouseEdgeModel[]}
		 * @private
		 */
		this._edges = [];

		// Bounds
		this.minX =  Infinity;
		this.minY =  Infinity;
		this.maxX = -Infinity;
		this.maxY = -Infinity;
	}

	/**
	 * @return {number}
	 */
	get width() { return this.maxX - this.minX; }

	/**
	 * @return {number}
	 */
	get height() { return this.maxY - this.minY; }

	/**
	 * @return {HouseEdgeModel[]}
	 */
	get edges() { return this._edges; }

	/**
	 * @return {HouseEdgeModel}
	 */
	get lastEdge() { return this._edges[this._edges.length-1]; }

	/**
	 * @param x {number}
	 * @param y {number}
	 */
	translate(x, y)
	{
		for (let i=0; i<this._edges.length; ++i) {
			this._edges[i].translate(x, y);
		}

		// apply to min/max coords
		this.minX += x; this.maxX += x;
		this.minY += y; this.maxY += y;
	}

    /**
     * Removes all edges from this set
     */
	clear() {
		for (let i=this._edges.length-1; i+1; --i) {
			this._edges[i].deleteEdge();
		}
	}

	/**
	 * @param edge {HouseEdgeModel}
	 */
	addEdge(edge)
	{
		this._edges.push( edge );
		edge.addEventListener(ModelEvent.DELETE, this.onEdgeDeleted, this);

		this.onAdded();
	}

	/**
	 * @param e {ModelEvent}
     * @private
	 */
	onEdgeDeleted(e)
	{
		let edge = e.model, indx;

		if (edge) {
            edge.removeEventListener(ModelEvent.DELETE, this.onEdgeDeleted, this);
			if ((indx=this._edges.indexOf(edge)) >= 0 ) {
                this._edges.splice(indx, 1);
            }
		}
	}

    /**
     * @param ax {number}
     * @param ay {number}
     * @param bx {number}
     * @param by {number}
     * @public
     */
	addEdgeFromPoints(ax, ay, bx, by)
	{
		this.minX	= Math.min(this.minX, ax, bx);
        this.maxX	= Math.max(this.maxX, ax, bx);
        this.minY	= Math.min(this.minY, ay, by);
        this.maxY	= Math.max(this.maxY, ay, by);

		this.addEdge(new HouseEdgeModel(new LotPointModel(ax, ay), new LotPointModel(bx, by)));
	}


	//////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

    /**
     * @return {Array}
     * @private
     */
	get edgesRestorationData()
	{
		let edgesData = [], i;
		for (i=0; i<this._edges.length; ++i) {
			edgesData.push(this._edges[i].recordState());
		}
		return edgesData;
	}

    /**
     * Returns a data structure containing all the parameters representing this object's state
     * @return {{}}
     */
	recordState()
	{
		return {
			edges		: this.edgesRestorationData,
			minX		: this.minX,
			minY		: this.minY,
			maxX		: this.maxX,
			maxY		: this.maxY
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		this.minX = state.minX;
        this.minY = state.minY;
        this.maxX = state.maxX;
        this.maxY = state.maxY;

		// restore edges
		let i, edgesData = state.edges;

		// remove all existing edges
		this.clear();

		// re-add new edges
		for (i=0; i<edgesData.length; ++i)
		{
		    let edge = new HouseEdgeModel(new LotPointModel(), new LotPointModel());
			this.addEdge(edge);
            edge.restoreState(edgesData[i]);
		}
	}
}