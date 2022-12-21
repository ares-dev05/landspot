import AbstractInterpolator from './AbstractInterpolator';
import Delaunator from 'delaunator';
import TriangleInterpolator from './TriangleInterpolator';
import Point from '../../../../../geom/Point';
import Geom from '../../../../../utils/Geom';
import QuadInterpolator from './QuadInterpolator';

export default class TriangulatedSurfaceInterpolator extends AbstractInterpolator {

    /**
     * @param points {LevelPointModel[]}
     * @param perimeter {Polygon} A perimeter that indicates which area this interpolator will work in.
     *      Having a perimeter defined is needed when working with a concave surface, as the Delaunay algorithm
     *      creates a convex surface through during the triangulation. We can then use the perimeter to exclude
     *      triangles that are outside of its area.
     */
    constructor (points, perimeter=null) {
        super(points);

        /**
         * @type {(TriangleInterpolator|QuadInterpolator)[]}
         * @private
         */
        this._faces = [];

        // triangulate the given point set
        const delaunator = Delaunator.from(points.map(point => [point.x, point.y]));
        const triangles  = [];
        const quads      = [];

        // create interpolators for each triangular face
        for (let i=0; i<delaunator.triangles.length; i+=3) {
            // point shortcuts
            const A=this._points[delaunator.triangles[i]],
                  B=this._points[delaunator.triangles[i+1]],
                  C=this._points[delaunator.triangles[i+2]];

            // if a perimeter is specified, we only want to add an interpolator for the current triangle
            // if its center is part of the perimeter
            if (!perimeter || perimeter.containsPoint(new Point((A.x+B.x+C.x) / 3, (A.y+B.y+C.y) / 3))) {
                const interpolator = new TriangleInterpolator([A, B, C]);

                if (!interpolator.isDegenerate) {
                    triangles.push(interpolator);
                }
            }
        }

        // look to see if triangles M and N have a common segment. If they do, return the segment length
        const mergeTriangles = (M, N) => {
            const mPoints = [M.points[0], M.points[1], M.points[2]], nPoints = [N.points[0], N.points[1], N.points[2]];
            const common  = [];

            // Find the points that M & N have in common (if any)
            for (let mIndex=0; mIndex<mPoints.length; mIndex++) {
                for (let nIndex=0; nIndex<nPoints.length; ++nIndex) {
                    if (mPoints[mIndex] === nPoints[nIndex]) {
                        common.push(mPoints[mIndex]);
                        break;
                    }
                }
            }

            // If exactly two points in common are found, the triangles share a side
            if (common.length === 2) {
                return {
                    // list of unique points, ordered in a CW or CCW order
                    points: [
                        // find the unique point from the M triangle
                        ...mPoints.filter(item => common.indexOf(item)<0),
                        // one of the common vertices of M & N
                        common[0],
                        // find the unique point from the N triangle
                        ...nPoints.filter(item => common.indexOf(item)<0),
                        // the second common vertex of M & N
                        common[1]
                    ],
                    // length of the merged segment
                    length: Geom.pointDistance(common[0], common[1])
                };
            }

            return null;
        };

        // @OPTIMIZE: Merge the triangular faces into quads for more accurate interpolation.
        // The algorithm we use searches for the pair of triangles with the largest common edge in a loop. At every
        // loop end, we merge the two triangles. We continue with this process until no triangles are left to merge.
        while (triangles.length > 1) {
            let maxLength = -Infinity, points, toMerge;

            for (let i=0; i<triangles.length-1; ++i) {
                for (let j=i+1; j<triangles.length; ++j) {
                    const merger = mergeTriangles(triangles[i], triangles[j]);
                    if (merger !== null && merger.length > maxLength) {
                        maxLength = merger.length;
                        points    = merger.points;
                        toMerge   = [i, j];
                    }
                }
            }

            // If we found two triangles that can be merged,
            if (points) {
                // Create a new Quad Interpolator from the two merged triangles
                quads.push(new QuadInterpolator(points));

                // Delete 2nd triangle first. This will be higher in the list, so the first index won't be affected
                triangles.splice(toMerge[1], 1);
                // Delete the 1st triangle
                triangles.splice(toMerge[0], 1);
            }   else {
                // If no merger is found, no need try try another loop
                break;
            }
        }

        // setup the faces of this interpolator
        this._faces = [...triangles, ...quads];
    }

    /**
     * @return {(TriangleInterpolator|QuadInterpolator)[]}
     */
    get faces() { return this._faces; }

    /**
     * Interpolates on the existing points and returns the value at position (x,y)
     * @param x {number} X coordinate of the point to interpolate
     * @param y {number} Y coordinate of the point to interpolate
     * @return {number} the interpolated value at the indicated position
     * @public
     */
    interpolate(x, y) {
        // Find the first face that contains the searched point
        let result = null;

        for (let face of this._faces) {
            result = face.analyze(x, y);
            if (result.contained) {
                return result.value;
            }
        }

        // If no triangle is found, try to find the one that the point is closest to
        let minimum = Infinity, closestFace;
        this._faces.forEach(
            face => {
                const distance = face.distanceFromCoords(x, y);
                if (distance < minimum) {
                    minimum  = distance;
                    closestFace = face;
                }
            }
        );

        return closestFace ? closestFace.interpolate(x, y) : 0;
    }
}