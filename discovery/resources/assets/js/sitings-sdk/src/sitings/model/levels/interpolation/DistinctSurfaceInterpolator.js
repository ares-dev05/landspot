import AbstractInterpolator from './polygons/AbstractInterpolator';
import NullInterpolator from './polygons/NulInterpolator';
import PointInterpolator from './polygons/PointInterpolator';
import SegmentInterpolator from './polygons/SegmentInterpolator';
import TriangleInterpolator from './polygons/TriangleInterpolator';
import QuadInterpolator from './polygons/QuadInterpolator';
import ThinPlateSplineInterpolator from './polygons/ThinPlateSplineInterpolator';
import Point from '../../../../geom/Point';
import TriangulatedSurfaceInterpolator from './polygons/TriangulatedSurfaceInterpolator';
import Geom from '../../../../utils/Geom';

/**
 * A distinct surface is an elementary, indivisible portion of the overall interpolated surface,
 * with a perimeter (outline) defined as a closed polygon and a set of level points placed inside
 * this perimeter, that are used to interpolate any position inside the surface's perimeter
 */
export default class DistinctSurfaceInterpolator extends AbstractInterpolator {

    /**
     * @param perimeter {Polygon}
     * @param points {LevelPointModel[]}
     * @param allowThinPlateInterpolation (boolean)
     */
    constructor(perimeter, points, allowThinPlateInterpolation) {
        super(points);

        /**
         * @type {Polygon}
         * @private
         */
        this._perimeter = perimeter;

        let interpolations = [
            NullInterpolator,
            PointInterpolator,
            SegmentInterpolator,
            TriangleInterpolator,
            QuadInterpolator
        ];

        /**
         * @type {AbstractInterpolator}
         * @private
         */
        this._interpolator = null;

        if (points.length < interpolations.length) {
            this._interpolator = new interpolations[points.length](Geom.sortPoints(points));
        }   else {
            // try to create a thin plate spline interpolator => higher accuracy
            if (allowThinPlateInterpolation) {
                this._interpolator = new ThinPlateSplineInterpolator(Geom.sortPoints(points));
            }

            // if the interpolator fails to calculate its required parameters, fallback to a triangulated interpolator
            if (!this._interpolator || this._interpolator.valid === false) {
                this._interpolator = new TriangulatedSurfaceInterpolator(points, perimeter);
            }
        }
    }

    /**
     * @return {Polygon}
     */
    get perimeter() {
        return this._perimeter;
    }

    /**
     * @return {AbstractInterpolator}
     */
    get interpolator() {
        return this._interpolator;
    }

    /**
     * Detects if a point is contained in the current polygon
     * @param x {number} X coordinate of the point
     * @param y {number} Y coordinate of the point
     * @returns Boolean true if the point is a part of this polygon.
     * @public
     */
    contains(x, y) {
        return this._perimeter.containsPointRobust(new Point(x, y));
    }

    /**
     * Interpolates from the existing points and returns the value at position (x,y)
     * @param x {number} X coordinate of the point to interpolate
     * @param y {number} Y coordinate of the point to interpolate
     * @return Number the interpolated value at the indicated position
     * @public
     */
    interpolate(x, y) {
        return this._interpolator.interpolate(x, y);
    }
}