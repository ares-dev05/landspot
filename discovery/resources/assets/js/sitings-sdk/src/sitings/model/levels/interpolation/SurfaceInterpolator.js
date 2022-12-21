import AbstractInterpolator from './polygons/AbstractInterpolator';
import Polygon from '../../../../geom/Polygon';
import Point from '../../../../geom/Point';
import DistinctSurfaceInterpolator from './DistinctSurfaceInterpolator';


export default class SurfaceInterpolator extends AbstractInterpolator {

	/**
	 * @param points {LevelPointModel[]}
	 * @param lotOutline {Polygon}
	 * @param segmentation {SegmentationModel}
	 */
	constructor(points, lotOutline, segmentation) {
		super(points);

		/**
		 * @type {Polygon} The entire area of interpolation, to be split into sub-surfaces through segmentation
		 * @private
		 */
		this._lotOutline = lotOutline;

		/**
		 * @type {SegmentationModel} a collection of batters / retaining walls that split the lot area into distinct areas
		 * @private
		 */
		this._segmentation = segmentation;

		/**
		 * @type {DistinctSurfaceInterpolator[]} set of non-overlapping sub-surfaces that are independently interpolated
		 * @private
		 */
		this._subSurfaces = [];

		// we have to apply the segmentation first to the lot and then sort the points for each slice.
		this.slicePolygon();
	}

	/**
	 * @type {DistinctSurfaceInterpolator[]}
	 */
	get subSurfaces() {
		return this._subSurfaces;
	}

	/**
	 * @private
	 */
	slicePolygon() {
		// if we don't have any height points, we don't need to do any interpolation
		if (!this.points.length) {
			return;
		}

		// Apply the segmentation lines to the lot boundaries, obtaining a set of non-overlapping areas
		// For easier setup of the sub-surfaces, we convert the received point lists to polygons

		// @INFO: for correct calculations, we want the lot vertices to be in a clockwise order.
		// const vertices = this._lotModel.isCw ? this._lotModel.vertices : this._lotModel.vertices.reverse();
		const vertices = this._lotOutline.edges.map(edge => edge.a);

		// Reverse vertices if not in CW order
		if (this._lotOutline.testCWSorting() === false) {
			vertices.reverse();
		}

		const segmentedLotAreas = this._segmentation
			.applyOn(vertices)
			.map(points => Polygon.from(points));

		// Create the distinct, non-overlapping segmented areas that will be interpolated on
		// for each of the areas, we look to see which level points are contained in them
		this._subSurfaces = segmentedLotAreas
			.map(perimeter => new DistinctSurfaceInterpolator(
				// perimeter to use for the interpolation
				perimeter,
				// level points that are contained in the perimeter
				this.points.filter(
					point => perimeter.containsOrClose(point.position) && point.includeIn(perimeter)
				),
				// true if no batter lines have been added. In this case we allow thin plate spline interpolations
				segmentedLotAreas.length === 1
			));

		console.log(
			'retaining created sub-surfaces ',
			this._subSurfaces.map(surface => {
				return 'P: ' + surface.perimeter.sourceVertices.map(p => p.toString()) +
				'LVL: ' + surface.interpolator.points.map(p => p.height);
			})
		);
	}

	/**
	 * Detects if a point is contained in the current polygon
	 * @param x {number} X coordinate of the point
	 * @param y {number} Y coordinate of the point
	 * @returns Boolean true if the point is a part of this polygon.
	 * @public
	 */
	contains(x, y) {
		return this.subSurfaces.some(slice => slice.contains(x, y));
	}

	/**
	 * Interpolates from the existing points and returns the value at position (x,y)
	 * @param x {number} X coordinate of the point to interpolate
	 * @param y {number} Y coordinate of the point to interpolate
	 * @return Number the interpolated value at the indicated position
	 * @public
	 */
	interpolate(x, y) {
		if (isNaN(x) || isNaN(y)) {
			throw new Error('Can\'t interpolate NaN');
		}

		if (!isFinite(x) || !isFinite(y)) {
			throw new Error('Can\'t interpolate Infinity');
		}

		// if we have no interpolation data, we just return a 0=ground level height
		if (!this.subSurfaces.length) {
			return 0;
		}

		// if we have a single interpolator, use it to determine the height
		if (this.subSurfaces.length === 1) {
			return this.subSurfaces[0].interpolate(x, y);
		}

		// Find the first surface that contains the searched point
		// let surface = this.subSurfaces.find(surface => surface.contains(x, y));
		let surface = this.subSurfaces.find(surface => surface.perimeter.containsOrClose(new Point(x,y)));

		// If no surface containing the coordinates is found, we try to find the one the point is closest to
		if (!surface) {
			let minimum = Infinity;
			for (let current of this.subSurfaces) {
				const distance = current.perimeter.distanceFromCoords(x, y);
				if ( distance < minimum ) {
					minimum = distance;
					surface = current;
				}
			}
		}

		// @INFO: This is not the quickest search, as we calculate the distanceFrom twice for each surface, but it is
		// the most clear. Since in most cases we will have only 2 or 3 surfaces, performance wouldn't be impacted visibly

		// surface = surface || this.subSurfaces.reduce( (prev, curr) =>
		// 	prev.perimeter.distanceFromCoords(x, y) <= curr.perimeter.distanceFromCoords(x, y) ? prev : curr
		// );

		// At this point we should always have a surface set
		return surface ? surface.interpolate(x, y) : 0;
	}
}
