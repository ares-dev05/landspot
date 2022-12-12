import Geom from '../../../../utils/Geom';
import Delaunator from 'delaunator';
import LotSurfaceBuilder from './LotSurfaceBuilder';
import Triangle from '../../../../geom/Triangle';
import Point from '../../../../geom/Point';
import Utils from '../../../../utils/Utils';


/**
 * Builds a triangulated surface, projecting the lot topography and features onto a 2D grid, before each vertex
 * is interpolated in the 3D space
 */
export default class TriangulatedSurface {

    constructor() {
        /**
         * Array of coordinates for all of the points (vertices) in this surface. point[0] is X, point[1] is Y
         * @type {number[][]}
         * @private
         */
        this._points = null;

        /**
         * Array of triplets, indicating the triangle vertices as indices to the points array
         * @type {number[][]}
         * @private
         */
        this._triangles = null;
    }

    /**
     * @returns {number[][]}
     */
    get points() { return this._points; }

    /**
     * @returns {number[][]}
     */
    get triangles() { return this._triangles; }

    /**
     * Builds the triangulated surface from a set of distinct, non-intersecting sub-surfaces
     * @param surfaces {DistinctSurfaceInterpolator[]}
     * @public
     */
    build(surfaces) {
        // Reset the points and triangles for the surface
        this._points    = [];
        this._triangles = [];

        surfaces.forEach(
            surface => {
                const box = surface.perimeter.externalBoundingBox;
                const L = box.left, R = box.right, T = box.top, B = box.bottom, STEP = LotSurfaceBuilder.PRECISION;
                const points = [];

                // 1. Sweep the entire sub-surface in a grid-like pattern, include all the points inside the perimeter
                for (let x = L; x <= R; x += STEP) {
                    for (let y = T; y <= B; y += STEP) {
                        if (surface.perimeter.containsPointCoordsRobust(x, y)) {
                            points.push([x, y, surface.interpolator]);
                        }
                    }
                }

                // 2. Include all the points on the perimeter to the surface
                for (let i=0; i<surface.perimeter.vertexList.length; ++i) {
                    const A = surface.perimeter.vertexList[i];
                    const B = surface.perimeter.vertexList[(i+1) % surface.perimeter.vertexList.length];

                    // make sure we have at least 1 step so that we add the starting point
                    const steps = Math.max(
                        1,
                        Math.floor( Geom.segmentLength(A[0], A[1], B[0], B[1]) / LotSurfaceBuilder.PRECISION_BOUNDARY )
                    );

                    // add points along the current segment
                    for (let step=0; step < steps; ++step) {
                        const point = Geom.getSegmentPoint(A[0], A[1], B[0], B[1], step / steps);
                        points.push([point.x, point.y, surface.interpolator]);
                    }
                }

                // 3. Triangulate and take out faces that aren't inside the perimeter
                const delaunator = Delaunator.from(points);
                // delta to use for vertex indices when adding the new triangles
                const P = this._points.length;

                for (let i=0; i<delaunator.triangles.length; i+=3) {
                    // point shortcuts
                    const A=points[delaunator.triangles[i]],
                        B=points[delaunator.triangles[i+1]],
                        C=points[delaunator.triangles[i+2]];

                    // Check if the triangle is part of the surface perimeter
                    if (surface.perimeter.containsPointCoordsRobust((A[0]+B[0]+C[0])/3, (A[1]+B[1]+C[1])/3)) {
                        // Add the triangle to the list of faces for the current surface
                        this._triangles.push([
                            P + delaunator.triangles[i],
                            P + delaunator.triangles[i+1],
                            P + delaunator.triangles[i+2]
                        ]);
                    }
                }

                // 4. The surface processing is complete. Add the new points to the list
                this._points = this._points.concat(points);
            }
        );
    }

    /**
     * @param cutout {Polygon}
     * @return {Point[]}
     */
    applyCutout(cutout) {

        let start = Utils.now(), delaunations=0;

        // prepare a new list of triangles
        const cutTriangles = [];

        // Store the list of points that define the 'cut' boundary. We store each point on the edge that is was added
        // on, which allows us to correctly sort them at the end, without having to rely on a polar sort that would be
        // inaccurate on concave polygons.

        // Initialize the cut path
        const cutPath = Array(cutout.edges.length).fill().map(() => []);

        const addCutPoint = (edge, index, point) => {
            cutPath[index].push({
                point: point,
                value: Geom.getPointPosition(edge.a, edge.b, point)
            });
        };

        this.triangles.forEach(
            triangle => {
                // iterate the triangle vertices
                const vertices = [this._points[triangle[0]], this._points[triangle[1]], this._points[triangle[2]]];
                // store the global vertex indices. These will be used later when we add the new triangles to the list
                const indices  = [...triangle];
                // create a triangular perimeter so we can determine if points are contained within it
                const perimeter = new Triangle(...vertices.map(P => new Point(P[0], P[1])));
                // function that tests if a point is already in the list of vertices
                const hasVertex = (v) => vertices.find(p => Geom.pointsEqualCoords(p[0], p[1], v.x, v.y)) !== undefined;

                // Check to see which sides of the triangle the edge intersects with
                for (let i=0; i<3; ++i) {
                    const A = vertices[i], B = vertices[(i+1)%3];
                    const interpolator = A[2];

                    cutout.edges.forEach(
                        (edge, index) => {
                            const P = Geom.segmentIntersectionCoords(
                                A[0], A[1], B[0], B[1],
                                edge.a.x, edge.a.y, edge.b.x, edge.b.y
                            );

                            // If the intersection happens at a triangle vertex, we don't include it in the list.
                            if (P && !P.equalsCoords(A[0], A[1]) && !P.equalsCoords(B[0], B[1])) {
                                vertices.push([P.x, P.y]);
                                this._points.push([P.x, P.y, interpolator]);
                                indices.push(this._points.length - 1);
                            }

                            if (P) {
                                // Store all the points along the cut path -> we will use these to create the building platform sides
                                addCutPoint(edge, index, P);
                            }

                            // check if one of the edge vertices are contained inside the triangle.
                            // If this is the case, then we have to add this vertex as well.
                            [edge.a, edge.b].forEach(
                                vertex => {
                                    if (perimeter.contains(vertex.x, vertex.y) && !hasVertex(vertex)) {
                                        vertices.push([vertex.x, vertex.y]);
                                        this._points.push([vertex.x, vertex.y, interpolator]);
                                        indices.push(this._points.length - 1);

                                        addCutPoint(edge, index, vertex);
                                    }
                                }
                            );
                        }
                    );
                }

                if (vertices.length===3) {
                    // No cut was detected. Check if the triangle is inside or outside of the cutout area
                    if (!cutout.containsPointCoordsRobust(
                        (vertices[0][0]+vertices[1][0]+vertices[2][0]) / 3,
                        (vertices[0][1]+vertices[1][1]+vertices[2][1]) / 3)) {
                        cutTriangles.push(triangle);
                    }
                }   else {
                    // Triangulate the resulting vertices.
                    const delaunator = Delaunator.from(vertices);
                    delaunations++;

                    // Check which triangles are outside of the perimeter
                    for (let i=0; i<delaunator.triangles.length; i+=3) {
                        // point shortcuts
                        const A = vertices[delaunator.triangles[i]];
                        const B = vertices[delaunator.triangles[i+1]];
                        const C = vertices[delaunator.triangles[i+2]];

                        // If the triangle is outside of the cutout area, we want to keep it
                        if (!cutout.containsPointCoordsRobust((A[0]+B[0]+C[0])/3, (A[1]+B[1]+C[1])/3)) {
                            // Add the triangle to the list of faces for the current surface
                            // However, we want to use the global point indices for the entire surface
                            cutTriangles.push([
                                indices[delaunator.triangles[i]],
                                indices[delaunator.triangles[i+1]],
                                indices[delaunator.triangles[i+2]]
                            ]);
                        }
                    }
                }
            }
        );

        console.log('LotSurfaceBuilder.triangulated.cut = ', (Utils.now() - start), '; delaunations ', delaunations, ' edges ', cutout.edges.length, ' triangles ', this.triangles.length);
        start = Utils.now();

        // Update the list of triangles
        this._triangles = cutTriangles;

        // Remap the cut path to a single list of consecutive points
        return cutPath.map(
            // Sort all points along an edge based on their position between the edge's ends
            edge => edge.sort(
                (a, b) => a.value-b.value
            ).map(
                p => p.point
            )
        ).flat();
    }
}