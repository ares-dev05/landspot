import SurfaceInterpolator from './interpolation/SurfaceInterpolator';
import CutFillResult from './interpolation/CutFillResult';
import LevelPointModel from './LevelPointModel';
import RestoreDispatcher from '../../../events/RestoreDispatcher';
import Geom from '../../../utils/Geom';
import ModelEvent from '../../events/ModelEvent';
import TransformEvent from '../../events/TransformEvent';
import Rectangle from '../../../geom/Rectangle';
import Point from '../../../geom/Point';
import LotPointModel from '../lot/LotPointModel';
import EventBase from '../../../events/EventBase';
import SegmentationModel from './segmentation/SegmentationModel';
import Polygon from '../../../geom/Polygon';
import DeveloperFillModel from './DeveloperFillModel';


/**
 * Contains details about the Lot Topography and cut & fill settings
 */
export default class LotTopographyModel extends RestoreDispatcher{

	// Default vegetation scrape height
	static get VEG_SCRAPE() { return 0.085; }

	// @private
	static get INTERPOLATE_SAMPLES() {return 4000;}

	// @private
	static get INV_WEIGHT_COEFF() {return 1;}

	// Length of a piece when splitting curves into sets of segments for the piecewise lot boundary
	static get CURVE_STEP() { return 0.5; }


	/**
	 * @param lotModel {LotPathModel}
	 */
	constructor (lotModel) {
		super();

		/**
		 * @type {null|HouseModel}
		 * @private
		 */
		this._houseModel = null;

		/**
		 * The surface interpolator slices the available height points in quads and triangles and then interpolates
		 * each requested point depending on which slice it's a part of:
		 * quads: Irregular grid Billinear Interpolation
		 * triangles: Barycentric interpolation
		 *
		 * When less than 3 points are available, we interpolate from:
		 * segment: project the point to interpolate on the segment and interpolate at that position
		 * point: return the value for that point
		 * @type {SurfaceInterpolator}
		 * @private
		 */
		this._interpolator = null;

		/**
		 * Height Levels
		 * @type {LevelPointModel[]}
		 * @private
		 */
		this._pointLevels = [];

		/**
		 * Batter Lines
		 * @type {SegmentationModel}
		 * @private
		 */
		this._segmentation = new SegmentationModel(lotModel);
		this._segmentation.addEventListener(EventBase.CHANGE, this.segmentationChanged, this);

		/**
		 * @type {DeveloperFillModel}
		 * @private
		 */
		this._developerFill = new DeveloperFillModel(lotModel);

		/**
		 * @type {LotPathModel}
		 * @private
		 */
		this._lotModel = lotModel;

		/**
		 * @type {Polygon} Piecewise split of the lot outline (to account for curves in the lot)
		 * @private
		 */
		this._lotOutline = null;

		/**
		 * Cut & Fill Settings 60% / 40% TEST
		 */
		this._cutRatio = 0.6;

		/**
		 * @type {number}
		 * @private
		 */
		this._vegScrape = LotTopographyModel.VEG_SCRAPE;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////
	// Getters / Setters
	//

	/**
	 * @return {number}
	 */
	get vegScrape() { return this._vegScrape; }

	/**
	 * @param value
	 */
	set vegScrape(value) { this._vegScrape = value; }

	/**
	 * @returns {LotPathModel}
	 */
	get lotModel() { return this._lotModel; }

	/**
	 * @return {Polygon}
	 */
	get lotOutline() { return this._lotOutline; }

	/**
	 * @return {HouseModel}
	 * @public
	 */
	get houseModel() { return this._houseModel; }

	/**
	 * @return {LevelPointModel[]} manually added height levels
	 * @public
	 */
	get pointLevels() { return this._pointLevels; }

	/**
	 * @return {LevelPointModel|null}
	 * @public
	 */
	get lastPoint() {
		return this._pointLevels.length > 0 ? this._pointLevels[this._pointLevels.length - 1] : null;
	}

	/**
	 * @return {LevelPointModel[]} All level points in the model
	 */
	get allLevelPoints() {
		return this._pointLevels.concat(this._segmentation.retainingLevels);
	}

	/**
	 * @return {null|SurfaceInterpolator}
	 * @public
	 */
	get interpolator() { return this._interpolator; }

	/**
	 * @returns {SegmentationModel}
	 */
	get segmentation() { return this._segmentation; }

	/**
	 * @return {DeveloperFillModel}
	 */
	get developerFill() { return this._developerFill; }

	/**
	 * @param v {HouseModel}
	 * @public
	 */
	set houseModel(v) {
		if (this._houseModel) {
			this._houseModel.removeEventListener(EventBase.CHANGE, this.houseChanged, this);
			this._houseModel.removeEventListener(TransformEvent.TRANSLATE, this.houseChanged, this);
		}

		this._houseModel = v;

		if (this._houseModel) {
			this._houseModel.addEventListener(EventBase.CHANGE, this.houseChanged, this);
			this._houseModel.addEventListener(TransformEvent.TRANSLATE, this.houseChanged, this);
		}
	}

	/**
	 * @return {number}
	 */
	get cutRatio() { return this._cutRatio; }

	/**
	 * @param value {number}
	 */
	set cutRatio(value) { this._cutRatio = value; }

	/**
	 * @return {number}
	 */
	get fillRatio() { return 1 - this._cutRatio; }

	/**
	 * @param value {number}
	 */
	set fillRatio(value) { this._cutRatio = 1 - value; }


	/////////////////////////////////////////////////////////////////////////////////////////////
	// State change
	//

	/**
	 * recalculate the levels when a batter line is added / removed / changed
	 */
	segmentationChanged() {
		this.recalculate();
	}

	/**
	 * @param p {LevelPointModel} the point to add to the levels layer
	 * @public
	 */
	addPoint(p) {
		// First, make sure the point is positioned correctly
		this.containWithinLot(p.position);

		// add event listeners
		p.addEventListener(EventBase.CHANGE, this.pointChanged, this);
		p.addEventListener(ModelEvent.DELETE, this.pointDeleted, this);
		p.addEventListener(LotPointModel.MOVE_COMPLETE, this.pointMoveComplete, this);
		p.position.addEventListener(EventBase.CHANGE, this.pointMoving, this);

		this._pointLevels.push( p );

		this.onAdded();
		this.recalculate();
	}

	/**
	 * @private
	 */
	pointChanged() {
		// this is called only when the height value changes for a LevelPointModel
		this.recalculate();
	}

	/**
	 * @private
	 */
	pointMoveComplete(e) {
		// this is called when a drag & drop action completes for a point, in which case we want to re-create the surface interpolator
		this.containWithinLot(e.dispatcher);
		this.recalculate();
	}

	/**
	 * Make sure the point is contained within the lot when it is being repositioned
	 * @param e {EventBase}
	 */
	pointMoving(e) {
		this.containWithinLot(e.dispatcher);
	}

	/**
	 * @param position {Point}
	 */
	containWithinLot(position) {
		// find the point that is currently being moved
		if (!this.lotModel.contains(position)) {
			let minDistance=Infinity, projection=null;

			// we must find the closest point -> boundary projection and move the point to it
			this.lotModel.edges.forEach(
				edge => {
					let intersection = edge.getIntersectionPoint(position.x, position.y), distance;

					if (intersection && minDistance > (distance=Geom.pointDistance(position, intersection))) {
						minDistance = distance;
						projection  = intersection;
					}
				}
			);

			// move the point to the found projection point, without dispatching a change event
			if (projection) {
				position.moveTo(projection.x, projection.y, false);
			}
		}
	}

	/**
	 * @param e {ModelEvent}
	 * @private
	 */
	pointDeleted(e) {
		/**
		 * @type {LevelPointModel}
		 */
		let p = e.model;
		p.removeEventListener(EventBase.CHANGE, this.pointChanged, this);
		p.removeEventListener(ModelEvent.DELETE, this.pointDeleted, this);
		p.removeEventListener(LotPointModel.MOVE_COMPLETE, this.pointMoveComplete, this);
		p.position.removeEventListener(EventBase.CHANGE, this.pointMoving, this);

		// remove the current point from the layer
		this._pointLevels.splice(this._pointLevels.indexOf(p), 1);

		// check if this point is in any segmentation path
		this._segmentation.deletePathsWithPoints(p);

		this.recalculate();
	}

	/**
	 * rebuild the surface interpolator from the available level points
	 * @public
	 */
	recalculate() {
		// Calculate the piecewise edges from the lot boundaries
		this._lotOutline = new Polygon(this.lotModel.getPieceWiseEdges(LotTopographyModel.CURVE_STEP));
		this._lotOutline.sourceVertices = this._lotOutline.edges.map(edge => edge.a);

		// rebuild the interpolator from the new points
		this._interpolator = new SurfaceInterpolator(this.allLevelPoints, this._lotOutline, this.segmentation);
		this.onChange();
	}

	/**
	 * @public
	 */
	clear() {
		while (this.pointLevels && this.pointLevels.length) {
			this.pointLevels[0].deletePoint();
		}
	}

	/**
	 * @return {number|number} the lowest height in the lot
	 * @public
	 */
	get baseLevel() {
		const points = this.allLevelPoints;
		if (!points.length)
			return 0;

		let level = Infinity;
		for (let index = 0; index < points.length; ++index) {
			level = Math.min(level, points[index].height);
		}

		return level;
	}

	/**
	 * @return {number|number} the highest point in the lot
	 * @public
	 */
	get topLevel() {
		const points = this.allLevelPoints;
		if (!points.length) {
			return 0;
		}

		let level = -Infinity;
		for (let index = 0; index < points.length; ++index) {
			level = Math.max(level, points[index].height);
		}

		return level;
	}

	/**
	 * @return {number}
	 */
	get totalLotFall() {
		return this.topLevel - this.baseLevel;
	}

	/**
	 * @return {Rectangle}
	 * @public
	 */
	get bounds() {
		const points = this.allLevelPoints;
		if (!points.length) {
			return new Rectangle();
		}
		let minx = Infinity;
		let miny = Infinity;
		let maxx = -Infinity;
		let maxy = -Infinity;
		for (let indx = 0; indx < points.length; ++indx)	{
			minx = Math.min(minx, points[indx].x);
			miny = Math.min(miny, points[indx].y);
			maxx = Math.max(maxx, points[indx].x);
			maxy = Math.max(maxy, points[indx].y);
		}

		return new Rectangle(minx, miny, maxx-minx, maxy-miny);
	}

	/**
	 * @private
	 */
	houseChanged() {
		// Logger.logStack("houseChanged @ "+getTimer());
		// getHouseAverageLevel();
	}

	/**
	 * @return {Rectangle|null}
	 * @public
	 */
	get houseBoundingBox() {
		return this.houseModel ? this.houseModel.boundingBox : null;
	}

	/**
	 * Implements a dynamic grid algorithm that takes height samples over the *bounding box* of the house
	 * @param pad {number} the padding to add around the house when calculating the coverage (in meters)
	 * @param saveSamples {boolean}
	 * @returns {CutFillResult} the average height level of the lot over the construction area of the house
	 * @TODO: pre-determine the house grid in advance and then translate / rotate it as needed to
	 * @INFO: we currently use a sampling grid. Because of the high number of samples, this is highly accurate.
	 * 		Is there any reason to switch to a triangulated prism sampling? Not necessarily because in a triangulated
	 * 		grid, the accuracy still comes from the number of vertices that are interpolated, and if that number isn't
	 * 		higher than the grid sample count, the accuracy doesn't increase.
	 * @public
	 */
	getHouseAverageLevel(pad, saveSamples=false) {
		// calculate an average over the entire surface of the house
		let xpos, ypos, sum = 0, samples = 0, area = this.houseBoundingBox;

		// add the padding around the house
		area.pad(pad, pad);

		const areaSurface = area.width * area.height;
		const points = this.allLevelPoints;

		// handle trivial cases
		if (!points.length) {
			return new CutFillResult(0, 0, 0, areaSurface);
		}

		if (points.length === 1) {
			return new CutFillResult(points[0].height, points[0].height, points[0].height, areaSurface);
		}

		let xcells, ycells, ycount, level, step;
		let result = new CutFillResult(0, Infinity, -Infinity, areaSurface);

		// determine the interpolation step so that we take ~INTERPOLATE_SAMPLES level samples
		step = Math.sqrt(area.width * area.height / LotTopographyModel.INTERPOLATE_SAMPLES);

		/** @DynamicGrid:
		 make the sampling grid dynamic so that it will cover the entire area from side-to-side
		 (rather than being fixed in the top-left corner)
		 */
		xcells = Math.ceil(area.width / step);
		ycells = Math.ceil(area.height / step);

		let angle = Geom.deg2rad(this.houseModel.rotation);

		for (xpos = area.left; xcells >= 0; xpos += step, --xcells) {
			for (ypos = area.top, ycount = ycells; ycount >= 0; ypos += step, --ycount) {
				let coords = Geom.rotatePoint(this.houseModel.center, new Point(xpos,ypos), angle);

				if (this.lotModel.contains(coords)) {
					level = this.heightLevel(coords.x, coords.y);
					sum += level;
					samples += 1;

					if (saveSamples) {
						result.samplePoints.push(new LevelPointModel(coords, level));
					}

					result.low	= Math.min(result.low, level);
					result.high	= Math.max(result.high, level);
				}
			}
		}

		// Determine the average level for the
		result.average = sum / samples;

		result.setRatio(this._cutRatio);

		console.log('interpolated over ', samples, ' samples');
		result.logData();

		return result;
	}

	/**
	 * @param pad {number}
	 * @return {*[]}
	 * @public
	 */
	getHouseSamplePoints(pad) {
		// calculate an average over the entire surface of the house
		let xpos, ypos, area=this.houseBoundingBox, xcells, ycells, ycount, step, list=[];

		// add the padding to the house
		area.pad( pad, pad );

		// determine the interpolation step so that we take ~INTERPOLATE_SAMPLES level samples
		step	= Math.sqrt( area.width * area.height / LotTopographyModel.INTERPOLATE_SAMPLES );
		xcells	= Math.ceil( area.width  / step );
		ycells	= Math.ceil( area.height / step );

		let angle = Geom.deg2rad(this.houseModel.rotation);

		for (xpos = area.left; xcells >= 0; xpos += step, --xcells) {
			for (ypos = area.top, ycount = ycells; ycount >= 0; ypos += step, --ycount) {
				// rotate the point
				const coords = Geom.rotatePoint(this.houseModel.center, new Point(xpos, ypos), angle);

				if (this.lotModel.contains(coords)) {
					list.push(coords);
				}
			}
		}

		return list;
	}

	/**
	 * @return Number the height/level at the indicated position
	 * @param x {number}
	 * @param y {number}
	 */
	heightLevel(x, y) {
		if (!this._interpolator) {
			this.recalculate();
		}
		return this._interpolator.interpolate(x, y);
	}

	/**
	 * recordState
	 * returns a data structure containing all the parameters representing this object's state
	 * @public
	 */
	recordState() {
		// save the state for all the points
		let pstates = [];
		for (let indx = 0; indx < this.pointLevels.length; ++indx) {
			pstates.push(this.pointLevels[indx].recordState());
		}

		return {
			points: pstates,
			segmentation: this._segmentation ? this._segmentation.recordState(this.pointLevels) : null,
			devfill: this._developerFill ? this._developerFill.recordState() : null
		};
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state) {
		if (!state || !state.points) {
			return;
		}

		// remove all points
		this.clear();

		// restore all the points
		for (let pstates = state.points, indx = 0; indx < pstates.length; ++indx) {
			// add a new point
			this.addPoint(new LevelPointModel(new LotPointModel()));

			// restore its state
			this.lastPoint.restoreState(pstates[indx]);
		}

		// Restore the state of the batter lines
		if (state.segmentation) {
			this._segmentation.restoreState(state.segmentation, this.pointLevels);
		}
		// Restore the developer fill (if any)
		if (state.devfill) {
			this._developerFill.restoreState(state.devfill);
		}

		this.onRestored();
	}
}