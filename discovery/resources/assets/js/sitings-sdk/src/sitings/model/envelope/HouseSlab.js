import FacadeSegment from './FacadeSegment';
import Point from '../../../geom/Point';
import HighlightableModel from '../../../events/HighlightableModel';

export default class HouseSlab extends HighlightableModel{

	static get NAME() {return 'SLAB TYPE';}

	constructor () {
		super();

		/**
		 * @type {FacadeSegment[]}
		 * @private
		 */
		this._edges = [];

		/**
		 * @type {null|FacadeSegment}
		 * @private
		 */
		this._centre = null;

		/**
		 * @type {number}
		 * @private
		 */
		this._width = NaN;

		/**
		 * @type {number} set to 43.5cm as the default slab height
		 * @private
		 */
		this._height = 0.435;

		/**
		 * @type {number}
		 * @private
		 */
		this._garageDropdown = 0.126;

		/**
		 * @type {number} porch & alfresco step-down - 212mm - to allow for finished surface (eg. concrete paving, decking) to be installed
		 * @private
		 */
		this._porchDropdown = 0.212;

		/**
		 * @type {number} porch & alfresco step-down - 212mm - to allow for finished surface (eg. concrete paving, decking) to be installed
		 * @private
		 */
		this._alfrescoDropdown = 0.212;

		/**
		 * @type {FacadeSegment}
		 * @private
		 */
		this._centre = new FacadeSegment(new Point(), new Point());

		/**
		 *
		 * @type {number}
		 * @private
		 */
		this._width	= 0;
		this.clear();
	}

	/**
	 * @return {null|FacadeSegment|*}
	 * @public
	 */
	get centre() {
		return this._centre;
	}

	/**
	 * @return {FacadeSegment[]}
	 * @public
	 */
	get edges() {
		return this._edges;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get height() {
		return this._height;
	}

	/**
	 * @return {number}
	 */
	get garageDropdown() {
		return this._garageDropdown;
	}

	/**
	 * @param value {number}
	 */
	set garageDropdown(value) {
		this._garageDropdown = value;
	}

	/**
	 * @return {number}
	 */
	get porchDropdown() {
		return this._porchDropdown;
	}

	/**
	 * @param value {number}
	 */
	set porchDropdown(value) {
		this._porchDropdown = value;
	}

	/**
	 * @return {number}
	 */
	get alfrescoDropdown() {
		return this._alfrescoDropdown;
	}

	/**
	 * @param value {number}
	 */
	set alfrescoDropdown(value) {
		this._alfrescoDropdown = value;
	}

	/**
	 * @param v {number}
	 * @public
	 */
	set height(v) {
		this._height = v;
		this.applyHeight();
	}

	/**
	 * @return {number}
	 * @public
	 */
	get width() {
		return this._width;
	}

	/**
	 * @private
	 */
	applyHeight() {
		for (let segment of this.edges) {
			segment.b.y = -this._height;
			segment.translate(0,0);
		}

		this.updateCentre();
	}

	/**
	 * @private
	 */
	updateCentre() {
		let minx = 0;
		let maxx = 0;
		this._centre.a.y = -this._height/2;
		this._centre.a.x = 0;
		for(let edge of this.edges) {
			this._centre.a.x += edge.a.x;

			minx = Math.min(minx, edge.a.x);
			maxx = Math.max(maxx, edge.a.x);
		}
		if (this.edges.length) {
			this._centre.a.x /= this.edges.length;
		}

		this._centre.translate(0, 0);
		this._width	= maxx - minx;
	}

	/**
	 * @param x {number}
	 */
	addWall(x) {
		const edge = new FacadeSegment(new Point(x, 0), new Point(x, -this._height));
		edge.fix();
		this.edges.push(edge);
		this.updateCentre();
	}

	/**
	 * @public
	 */
	reload() {
		this._height = 0;
		for (let edge of this.edges) {
			edge.reset();
		}
		this.updateCentre();
	}

	/**
	 * @param dx {number}
	 * @param dy {number}
	 * @public
	 */
	translate(dx, dy) {
		for (let segment of this.edges) {
			segment.translate(dx, dy);
		}
		this.updateCentre();
	}

	/**
	 * @public
	 */
	clear() {
		this._height	= 0;
		this.updateCentre();
	}

	/**
	 * @TODO recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState () {
		return {};
	}

	/**
	 * @TODO restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state) {
	}
}