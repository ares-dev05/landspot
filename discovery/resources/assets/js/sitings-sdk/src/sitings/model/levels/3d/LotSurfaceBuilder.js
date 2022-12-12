import RestoreDispatcher from '../../../../events/RestoreDispatcher';
import LotGeometry from './LotGeometry';
import Geom from '../../../../utils/Geom';
import Delaunator from 'delaunator';
import LotSurface from './LotSurface';
import Point from '../../../../geom/Point';
import TriangulatedSurface from './TriangulatedSurface';
import Polygon from '../../../../geom/Polygon';
import Segment from '../../../../geom/Segment';
import LevelPointModel from '../LevelPointModel';
import LotPointModel from '../../lot/LotPointModel';
import DistinctSurfaceInterpolator from '../interpolation/DistinctSurfaceInterpolator';
import Utils from '../../../../utils/Utils';
import DrivewayPath from '../works/DrivewayPath';
import * as THREE from 'three';
import EventBase from '../../../../events/EventBase';
import SitePiering from '../works/SitePiering';
import Matrix from '../../../../geom/Matrix';



export default class LotSurfaceBuilder extends RestoreDispatcher {

    // We triangulate the surfaces / sub-surfaces by also including their exact perimeters. This allows us to have
    // a very high precision at critical lot points, like the boundaries and batter lines, without having to use a
    // very high fragmentation. Because of this, we can significantly reduce the number of triangles that are calculated
    // for the surface geometries.

    // Precision to use when building the surface, in meters. 0.25m -> one point is added every 25cm. For a 20m side,
    // that will result in 80 points. For a 20 x 30 lot, that results in 80 x 120 = 9600 points
    // static get PRECISION()          { return 0.25; }
    static get PRECISION()          { return 1; }

    // How high the 'crust' below the lot should be. CRUST_HEIGHT is calculated from the lowest point in the lot
    static get CRUST_HEIGHT()       { return 4; }

    // precision to use for the boundaries
    static get PRECISION_BOUNDARY() { return LotSurfaceBuilder.PRECISION; }

    // Default scale up to use from metrix to pixel coordinates for the 3D view
    static get DEFAULT_SCALE_UP()   { return 25; }

    // lot without anything done
    static get SURFACE_LAND()       { return 0; }
    // Cut and fill
    static get SURFACE_CUT_FILL()   { return 1; }
    // Retaining
    static get SURFACE_RETAINING()  { return 2; }
    // Slab down
    static get SURFACE_SLAB()       { return 3; }
    // Driveway gradient
    static get SURFACE_DRIVEWAY()   { return 4; }
    // House Demo
    static get SURFACE_HOUSE_DEMO() { return 5; }

    // Event name for parameter change
    static get SHOW_CUT_AREA_CHANGE() { return 'showCutChange'; }

    /**
     * @param siteWorksModel {SiteWorksModel}
     * @param topography {LotTopographyModel}
     * @param position {FloorPositionModel}
     * @param fall {FallTopologyModel}
     * @param facade {FacadeModel}
     * @param driveways {LotDrivewayModel[]}
     */
    constructor(siteWorksModel, topography, position, fall, facade, driveways) {
        super();

        /**
         * @type {SiteWorksModel}
         * @private
         */
        this._siteWorksModel = siteWorksModel;

        /**
         * @type {LotTopographyModel}
         * @private
         */
        this._topography = topography;

        /**
         * @type {FloorPositionModel}
         * @private
         */
        this._position   = position;

        /**
         * @type {FallTopologyModel}
         * @private
         */
        this._fall       = fall;

        /**
         * @type {FacadeModel}
         * @private
         */
        this._facade     = facade;

        /**
         * @type {LotDrivewayModel[]}
         * @private
         */
        this._driveways  = driveways;

        /**
         * @type {LotGeometry[]}
         * @private
         */
        this._surfaces   = [];

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._retainingWalls = null;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._batterAreas = null;

        /**
         * @type {ShapeGeometry[]}
         * @private
         */
        this._sitePiers = null;

        /**
         * <type> {LotSurface}
         * @type  {{horizontal: ShapeGeometry, vertical: LotSurface}}
         * @private
         */
        this._buildingPlatform = null;

        /**
         * @type {boolean}
         * @private
         */
        this._showCutSurface = false;

        /**
         * @type {ShapeGeometry}
         * @private
         */
        this._cutSurface = null;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._cutLines = null;

        /**
         * @type {LotSurface[]}
         * @private
         */
        this._fallLines = null;

        /**
         * @type {LotSurface}
         * @private
         */
        this._lotCrust = null;

        /**
         * @type  {{horizontal: ShapeGeometry, vertical: LotSurface}[]}
         * @private
         */
        this._slabSurfaces = null;

        /**
         * @type {LotSurface}
         * @private
         */
        this._lotOutline = null;

        /**
         * @type {LotSurface}
         * @private
         */
        this._drivewaySurface = null;

        /**
         * @type {LotSurface}
         * @private
         */
        this._lotSurface = null;

        /**
         * @type {LotSurface} Lot Bottom, used for rendering the shadow
         * @private
         */
        this._lotBottom = null;

        /**
         * @type {number}
         * @private
         */
        this._currentMode = LotSurfaceBuilder.SURFACE_LAND;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Getters + Setters for important properties in this object

    /**
     * @returns {number}
     */
    get currentMode() { return this._currentMode; }

    /**
     * @param v {number}
     */
    set currentMode(v) {
        if (this._currentMode !== v) {
            this._currentMode = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get showCutSurface() { return this._showCutSurface; }

    /**
     * @param value {boolean}
     */
    set showCutSurface(value) {
        if (this._showCutSurface !== value) {
            this._showCutSurface = value;
            this.dispatchEvent(new EventBase(LotSurfaceBuilder.SHOW_CUT_AREA_CHANGE, this));
        }
    }

    /**
     * @returns {LotGeometry}
     */
    get currentSurface() {
        if (this._currentMode < this._surfaces.length) {
            return this._surfaces[this._currentMode];
        }

        return null;
    }

    /**
     * @return {SiteWorksModel}
     */
    get siteWorks() { return this._siteWorksModel; }

    /**
     * @returns {LotPathModel}
     * @protected
     */
    get lotModel() { return this._topography.lotModel; }

    /**
     * @returns {LotTopographyModel}
     * @protected
     */
    get topography() { return this._topography; }

    /**
     * @returns {FloorPositionModel}
     */
    get floorPosition() { return this._position; }

    /**
     * @returns {HouseModel}
     */
    get houseModel() { return this._topography.houseModel; }

    /**
     * @returns {FacadeModel}
     */
    get facade() { return this._facade; }

    /**
     * @returns {LotGeometry[]}
     */
    get surfaces() { return this._surfaces; }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Algorithm Implementation

    /**
     * @param scaleUp {number}
     */
    recalculate(scaleUp) {
        const start = Utils.now();

        // Make sure there is an interpolator to work with, even if it's a 0-level one
        if (!this._topography.interpolator) {
            this._topography.recalculate();
        }

        // Calculate all the site works
        this._siteWorksModel.update();

        // Create all the surface modes, from the initial lot, to the house model included
        this._surfaces = [];

        // Reset variables that only need to be calculated once
        this._retainingWalls    = null;
        this._batterAreas       = null;
        this._sitePiers         = null;
        this._buildingPlatform  = null;
        this._cutSurface        = null;
        this._cutLines          = null;
        this._fallLines         = null;
        this._lotCrust          = null;
        this._slabSurfaces      = null;
        this._lotOutline        = null;
        this._drivewaySurface   = null;
        this._lotSurface        = null;
        this._lotBottom         = null;

        for (let mode=0; mode<=LotSurfaceBuilder.SURFACE_HOUSE_DEMO; ++mode) {
            if (mode === LotSurfaceBuilder.SURFACE_DRIVEWAY) {
                // refresh the calculations
                this._siteWorksModel.update(true);
            }

            if (mode === LotSurfaceBuilder.SURFACE_CUT_FILL && !this.houseModel.houseData) {
                break;
            }

            this._surfaces[mode] = this.buildLandSurface(scaleUp, mode);
        }

        console.log('LotSurfaceBuilder.recalculate total: ' + (Utils.now()-start));
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // 3D Surface building for all the construction stages

    /**
     * Builds the initial lot surface
     *
     * @param scaleUp {number}
     * @param mode {number}
     * @returns {LotGeometry}
     */
    buildLandSurface(scaleUp=1, mode=0) {
        // settings
        // const box = this.lotModel.boundingBox;
        const box = this.topography.lotOutline.externalBoundingBox;
        const offset = {
            x: -box.left - box.width / 2,
            y: -box.top - box.height / 2,
            z: -this.topography.baseLevel
        };
        const crustBottom = -LotSurfaceBuilder.CRUST_HEIGHT;

        // Shortcuts for accessing point coordinates
        const X = (point) => point instanceof Point ? point.x : point[0];
        const Y = (point) => point instanceof Point ? point.y : point[1];

        // Generic 2d -> 3d mapping function. Accepts a custom Z function
        const map3D = (Z) => (point) => [X(point) + offset.x, Y(point) + offset.y, Z(point) + offset.z];

        // custom 2d -> 3d mapping functions
        const mapLot = map3D((point) => this.topography.heightLevel(X(point), Y(point)));

        // 2d -> 3d mapping function for a lot that may be segmented from existing retaining walls
        const mapSegmentedLot = map3D((point) => point[2].interpolate(X(point), Y(point)));

        // setup the points along the lot boundary
        const boundaryPoints = this._iterateBoundary(this.topography.lotOutline.edges).map(mapLot);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 1. Build the lot surface

        // Store the cut boundaries and the driveway interpolator
        let buildCutout;

        if (mode <= LotSurfaceBuilder.SURFACE_RETAINING || mode === LotSurfaceBuilder.SURFACE_DRIVEWAY) {
            this._lotSurface = new LotSurface();
            const lotTriangulation = new TriangulatedSurface();

            let start = Utils.now();

            // Create the initial lot triangulation
            lotTriangulation.build(this._topography.interpolator.subSurfaces);

            console.log('LotSurfaceBuilder.triangulation = ', (Utils.now() - start));
            start = Utils.now();

            // If we are on a step >= Cut & Fill, we want to apply the cutout to the lot
            if (mode >= LotSurfaceBuilder.SURFACE_CUT_FILL) {
                // Apply a cut to the lot triangulation, either along the build platform, or the full site works perimeter
                // Store all the 'cut points' along the path
                const cutPath = lotTriangulation.applyCutout(
                    mode >= LotSurfaceBuilder.SURFACE_RETAINING ?
                        this.siteWorks.siteWorksPerimeter :
                        this.siteWorks.buildPerimeter
                );

                // Create the 3D cutout perimeter
                if (mode >= LotSurfaceBuilder.SURFACE_RETAINING) {
                    buildCutout = [];
                }   else {
                    buildCutout = cutPath.map(
                        map3D((point) => Math.max(this.topography.heightLevel(X(point), Y(point)), this.siteWorks.platformLevel))
                    );
                }
            }

            // add all the points to the lot surface
            this._lotSurface.addFromXZY(lotTriangulation.points.map(mapSegmentedLot), scaleUp);

            // set the calculated triangles
            this._lotSurface.triangles = lotTriangulation.triangles.flat();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 2. Build the lot bottom & outline

        if (!this._lotBottom) {
            this._lotBottom = new LotSurface();
            this._lotBottom.addFromXZY(boundaryPoints.map(point=>[point[0], point[1], 0]), scaleUp);
            this._lotBottom.triangles = [...Delaunator.from(boundaryPoints).triangles];
        }

        if (!this._lotOutline) {
            // Create the 3D outline data
            this._lotOutline = new LotSurface();
            this._lotOutline.addFromXZY(boundaryPoints, scaleUp);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 3. Create the lot crust
        //

        if (!this._lotCrust) {
            this._lotCrust = new LotSurface();

            // add all the boundary points to the lot surface
            this._lotCrust.addFromXZYVertical(boundaryPoints, scaleUp);

            // GO over the hull and add the 'crust'. This will go 4 meters below the lowest point of the lot
            // for each point in the boundary, add a corresponding one that is at crustBottom Y level
            for (let i = 0; i < boundaryPoints.length - 1; ++i) {
                const A = boundaryPoints[i];
                const C = this._lotCrust.vertexCount;
                this._lotCrust.vertices.push(
                    A[0] * scaleUp,
                    crustBottom * scaleUp,
                    A[1] * scaleUp
                );
                this._lotCrust.uvs.push(A[0] + A[1], crustBottom);
                this._lotCrust.triangles.push(i, i + 1, C);

                // also add a triangle to the previous crust point
                if (i > 0) {
                    this._lotCrust.triangles.push(i, C, C - 1);
                }
            }

            // close the 'crust' with the first point
            this._lotCrust.triangles.push(0, boundaryPoints.length, this._lotCrust.vertexCount - 1);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 4. Create the Fall Lines
        //

        if (mode === LotSurfaceBuilder.SURFACE_LAND && !this._fallLines) {
            this._fallLines = this._fall.lines.map(
                line => {
                    const surface = new LotSurface();
                    line.points.forEach(
                        point => surface.vertices.push((point.x + offset.x) * scaleUp, (line.level + offset.z) * scaleUp + 1, (point.y + offset.y) * scaleUp)
                    );
                    return surface;
                }
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 5. Create Cut Surface
        //

        if (mode === LotSurfaceBuilder.SURFACE_CUT_FILL && this.siteWorks.cutPerimeter) {
            if (this.siteWorks.cutPerimeter.sourceVertices) {
                // Overlay the cut perimeter perfectly on the building platform
                this._cutSurface = new THREE.ShapeGeometry(
                    new THREE.Shape(
                        this.siteWorks.cutPerimeter.sourceVertices.map(
                            point => new THREE.Vector2((point.x + offset.x) * scaleUp, (point.y + offset.y) * scaleUp
                        ))
                    )
                ).rotateX(Math.PI / 2).translate(0, (this.siteWorks.platformLevel + offset.z) * scaleUp, 0);
            }

            if (this.siteWorks.cutPerimeter.cutLines) {
                this._cutLines = this.siteWorks.cutPerimeter.cutLines.map(
                    line => {
                        const surface = new LotSurface();
                        line.forEach(
                            point => surface.vertices.push(
                                (point.x + offset.x) * scaleUp,
                                (this.siteWorks.platformLevel + offset.z + 0.05) * scaleUp,
                                (point.y + offset.y) * scaleUp
                            )
                        );
                        return surface;
                    }
                );
            }
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 5. Create Building Platform
        //

        // first create the flat building platform
        if (mode === LotSurfaceBuilder.SURFACE_RETAINING ||
            mode === LotSurfaceBuilder.SURFACE_DRIVEWAY ||
           (mode >= LotSurfaceBuilder.SURFACE_CUT_FILL && !this._buildingPlatform)) {

            /* @TODO @REFACTOR: use similar method as for the House Slab here.
            let vertices=null, triangles=null;

            if (mode >= LotSurfaceBuilder.SURFACE_DRIVEWAY) {
                // Fetch build platform vertices
                vertices = this.siteWorks.platformVertices ? this.siteWorks.platformVertices : this.siteWorks.buildPerimeter.sourceVertices;

                // Triangulate the building platform
                const delaunator = Delaunator.from(vertices, p => p.x, p => p.y);
                triangles = [];

                // Go over all the triangles and remove those with the center outside of the house interiors
                for (let i = 0; i < delaunator.triangles.length; i += 3) {
                    const A = vertices[delaunator.triangles[i]];
                    const B = vertices[delaunator.triangles[i + 1]];
                    const C = vertices[delaunator.triangles[i + 2]];

                    const CX = (A.x + B.x + C.x) / 3;
                    const CY = (A.y + B.y + C.y) / 3;

                    // Include triangles that have their centers inside the house slab
                    if (this.siteWorks.buildPerimeter.containsPointCoordsRobust(CX, CY) &&
                        (!this.siteWorks.driveway || !this.siteWorks.driveway.containsPointCoordsRobust(CX, CY))) {
                        triangles.push(delaunator.triangles[i], delaunator.triangles[i + 1], delaunator.triangles[i + 2]);
                    }
                }
            }   else {
                vertices = this.siteWorks.buildPerimeter.sourceVertices;
            }

            this._buildingPlatform = this._buildEnclosedArea(
                // Horizontal Surface
                // this.siteWorks.buildPerimeter.sourceVertices.map(map3D(() => this.siteWorks.platformLevel)),
                vertices.map(map3D(() => this.siteWorks.platformLevel)),
                // Vertical Surface
                buildCutout,
                // bottom for the 'crust' added to the side of the building platform
                crustBottom,
                // 3D scale up factor
                scaleUp,
                // pre-calculated triangles
                triangles
            ); */

            this._buildingPlatform = this._buildSlabArea(
                // sorted points
                this.siteWorks.buildPerimeter.sourceVertices,
                // X/Y/Z offsets
                offset,
                // scale factor from metric to 3D space
                scaleUp,
                // surface level
                this.siteWorks.platformLevel,
                // bottom level
                crustBottom,
                // use an identity matrix
                new Matrix().identity()
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 6. Create retaining walls
        //

        if (mode === LotSurfaceBuilder.SURFACE_RETAINING || mode === LotSurfaceBuilder.SURFACE_DRIVEWAY ||
            (mode=== LotSurfaceBuilder.SURFACE_LAND && this.topography.segmentation.retaining)) {
            /**
             * @type {(RetainingWall|ExistingRetainingWall)[]}
             */
            const retaining = [
                ...(mode===LotSurfaceBuilder.SURFACE_LAND ? [] : this.siteWorks.retainingWalls),
                ...this.topography.segmentation.retaining.map(wall => wall.segments).flat()
            ];

            // this.siteWorks.retainingWalls
            this._retainingWalls = retaining.map(
                wall => {
                    // map the wall top to 3D space
                    const perimeter = wall.vertices.map(map3D(() => wall.top));

                    return this._buildEnclosedArea(
                        // Horizontal perimeter
                        perimeter,
                        // Vertical perimeter
                        [...perimeter, perimeter[0]],
                        // bottom
                        wall.bottom + offset.z,
                        // 3D scale up factor
                        scaleUp
                    );
                }
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 7. Create site batter surfaces
        //

        if (mode === LotSurfaceBuilder.SURFACE_RETAINING || mode === LotSurfaceBuilder.SURFACE_DRIVEWAY) {
            this._batterAreas = this.siteWorks.batterAreas.map(
                batter => {
                    // Build the perimeter from two parts, inner and outer batter.
                    // Inner is always at the platform level, Outer is always at the land level.
                    const perimeter = [
                        ...batter.slices.map(slice => [slice.a.x + offset.x, slice.a.y + offset.y, slice.aLevel + offset.z]),
                        ...batter.slices.map(slice => [slice.b.x + offset.x, slice.b.y + offset.y, slice.bLevel + offset.z]).reverse()
                    ];

                    return this._buildEnclosedArea(
                        // Horizontal
                        perimeter,
                        // Vertical is identical to horizontal
                        [...perimeter, perimeter[0]],
                        // bottom
                        crustBottom,
                        // 3D scale up factor
                        scaleUp
                    );
                }
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 8. Create the Piers (if they exist)
        //
        if (mode === LotSurfaceBuilder.SURFACE_RETAINING && this.siteWorks.sitePiering) {
            /**
             * const geometry = new THREE.CircleGeometry( 5, 32 );
             const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
             const circle = new THREE.Mesh( geometry, material );
             scene.add( circle );
             */
            this._sitePiers = this.siteWorks.sitePiering.pierLocations.map(
                pier => new THREE.CircleGeometry(SitePiering.PIER_RADIUS * scaleUp, 16)
                    .rotateX(Math.PI/2).translate(
                        (pier.x + offset.x) * scaleUp,
                        (this.siteWorks.platformLevel + offset.z + 0.05) * scaleUp,
                        (pier.y + offset.y) * scaleUp
                    )
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 8. Create the Slab
        //

        if (mode >= LotSurfaceBuilder.SURFACE_SLAB && !this._slabSurfaces) {
            // Select the house boundary if it exists. Otherwise default to the full house edges
            this._slabSurfaces = [
                {
                    boundary: this.houseModel.getHouseBoundary() || this.houseModel,
                    level: this.siteWorks.slabLevel,
                },
                {
                    boundary: this.houseModel.getGarageBoundary(),
                    level: this.siteWorks.garageSlabLevel,
                },
                {
                    boundary: this.houseModel.getPorchBoundary(),
                    level: this.siteWorks.porchSlabLevel,
                },
                {
                    boundary: this.houseModel.getAlfrescoBoundary(),
                    level: this.siteWorks.alfrescoSlabLevel,
                }
            ].filter(
                piece => piece.boundary !== null
            ).map(
                piece => this._buildSlabArea(
                    // sorted slab points
                    Geom.walkSortPoints(piece.boundary.edges),
                    // X/Y/Z offsets
                    offset,
                    // scale factor from metric to 3D space
                    scaleUp,
                    // surface level
                    piece.level
                )
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 9. Create the Driveway
        //

        if (mode >= LotSurfaceBuilder.SURFACE_DRIVEWAY && !this._drivewaySurface && this.siteWorks.driveway) {
            const drivewayInterpolator = this.siteWorks.driveway.interpolator;

            this._drivewaySurface = this._buildEnclosedArea(
                // Horizontal Surface
                drivewayInterpolator.perimeter.sourceVertices.map(
                    map3D(point => drivewayInterpolator.interpolate(X(point), Y(point))),
                ),
                // Vertical Surface
                drivewayInterpolator.perimeter.sourceVertices.map(
                    map3D(point => drivewayInterpolator.interpolate(X(point), Y(point))),
                ),
                // bottom for the 'crust' added to the side of the building platform
                crustBottom,
                // 3D scale up factor
                scaleUp,
            );
        }

        // return the lot surface. It will create its own triangles / normals
        return new LotGeometry(
            this._lotSurface,
            this._lotBottom,
            this._lotOutline,
            this._lotCrust,
            mode === LotSurfaceBuilder.SURFACE_LAND ? this._fallLines : [],
            this._buildingPlatform,
            this._cutSurface,
            this._cutLines,
            this._retainingWalls,
            this._batterAreas,
            this._sitePiers,
            this._slabSurfaces,
            this._drivewaySurface,
            mode >= LotSurfaceBuilder.SURFACE_HOUSE_DEMO,
            // @TEMP slabLevel
            this.siteWorks.slabLevel + 0.05 + offset.z,
            // @TEMP up scale
            scaleUp,
            // @TEMP: house transform
            {
                tx:  offset.x + this.houseModel.sitingGlobalTransform.tx,
                ty: -offset.y - this.houseModel.sitingGlobalTransform.ty
            },
        );
    }

    /**
     * Loop an enclosed boundary and return a set of (X, Y) coordinates along the way.
     * @param edges {Segment[]}
     * @param asArray {boolean}
     * @return {{Point|[Number, Number]}[]}
     * @private
     */
    _iterateBoundary(edges, asArray=true) {
        const points = [];

        edges.forEach(
            edge => {
                const steps = Math.max(1, Math.floor(edge.length / LotSurfaceBuilder.PRECISION_BOUNDARY * 10));

                for (let step = 0; step < steps; ++step) {
                    const point = Geom.interpolatePoints(edge.a, edge.b, step / steps);
                    points.push(asArray ? [point.x, point.y] : point);
                }
            }
        );

        if (points.length) {
            points.push(points[0]);
        }

        return points;
    }

    /**
     * @TODO: Move this to the SiteWorks class
     * @param buildPlatform {Polygon}
     * @return {null|DistinctSurfaceInterpolator}
     * @private
     */
    _buildDrivewayArea(buildPlatform) {
        // Check to see if the house has a valid crossover
        const crossover = this._driveways ? this._driveways.find( C => C.boundary !== null ) : null;

        // @TEMP: determine what garage width is needed
        const drivewayWidth = DrivewayPath.DRIVEWAY_WIDTH_DOUBLE;

        if (!crossover) {
            return null;
        }

        // Find the front of the house
        const houseFront = buildPlatform.edges.reduce(
            (previous, current) =>
                previous.center.distanceTo(crossover.x, crossover.y) < current.center.distanceTo(crossover.x, crossover.y) ? previous : current
        );

        if (!houseFront) {
            return null;
        }

        // Helper for creating a level point model
        const LVL = (p, h) => new LevelPointModel(new LotPointModel(p.x, p.y), h);

        // See which corner of the house front is closer to the driveway
        // points of the driveway path
        let drivewayLevels = [], A, B, p;
        if (houseFront.a.distanceTo(crossover.x, crossover.y) < houseFront.b.distanceTo(crossover.x, crossover.y)) {
            A = houseFront.a;
            B = houseFront.b;
        }   else {
            A = houseFront.b;
            B = houseFront.a;
        }

        drivewayLevels.push(
            // corner of the house.
            LVL(
                Geom.interpolatePoints(
                    A, B,
                    this.floorPosition.housePadding / houseFront.length
                ),
                this.siteWorks.platformLevel
            ),
            // inner corner of the driveway / garage entry
            LVL(
                Geom.interpolatePoints(
                    A, B,
                    // @TEMP: look at the actual garage size for this
                    (drivewayWidth + this.floorPosition.housePadding) / houseFront.length
                ),
                this.siteWorks.platformLevel
            )
        );

        // crossover A and B points, selected on the boundary the crossover is on
        drivewayLevels.push(
            LVL(
                p = new Segment(crossover, crossover.boundary.a.clone()).normalize(drivewayWidth / 2).b,
                this.topography.heightLevel(p.x, p.y)
            ),
            LVL(
                p = new Segment(crossover, crossover.boundary.b.clone()).normalize(drivewayWidth / 2).b,
                this.topography.heightLevel(p.x, p.y)
            )
        );

        // Determine the driveway area
        return new DistinctSurfaceInterpolator(
            Polygon.from(Geom.sortPoints(drivewayLevels.map(p => p.position))),
            drivewayLevels
        );
    }

    /**
     * @TODO: Move this to the SiteWorks class
     * @TODO @INFO: This gives more reasons to create the full object geometries here and discard / fully refactor
     * @TODO        the LotGeometry class. We create two different geometries here.
     *
     * @param points {Point[]}
     * @param offset {{x:number, y:number, z:number}}
     * @param scaleUp {number}
     * @param topLevel {number}
     * @param bottomLevel {number}
     * @param transform {Matrix}
     * @return {{horizontal: ShapeGeometry, vertical: LotSurface}}
     * @private
     */
    _buildSlabArea(points, offset, scaleUp, topLevel, bottomLevel=NaN, transform=null) {
        if (points && points.length > 1 && Geom.pointsEqual(points[0], points[points.length-1])) {
            points.pop();
        }

        // apply the house transformation to the points, and map them to the 3D space
        transform = transform || this.houseModel.sitingGlobalTransform;

        // horizontal shape points
        const slabShapePoints = points.map(
            point => transform.apply(point).translate(offset.x, offset.y)
        );

        // set the slab level to use
        // const slabLevel = (garage ? this.siteWorks.garageSlabLevel : this.siteWorks.slabLevel) + offset.z;
        topLevel    = offset.z + topLevel;

        // set the bottom level
        bottomLevel = offset.z + (isNaN(bottomLevel) ? this.siteWorks.platformLevel : bottomLevel);

        return {
            // the horizontal shape to use
            horizontal: new THREE.ShapeGeometry(
                new THREE.Shape(
                    slabShapePoints.map(point => new THREE.Vector2(point.x * scaleUp, point.y * scaleUp))
                )
            ).rotateX(Math.PI/2).translate(0, topLevel*scaleUp, 0),
            vertical: this._buildEnclosedArea(
                // Horizontal Surface => none
                [],
                // Vertical Surface
                slabShapePoints.map(point => [...point.asArray(), topLevel]),
                // bottom for the 'crust' added to the side of the building platform
                bottomLevel,
                // 3D scale up factor
                scaleUp,
                // pre-calculated triangulation
                []
            )
        };
    }

    /**
     * @param horizontal {number[][]} array of [X, Y, Z] triplets given as coordinates of the horizontal perimeter
     * @param vertical {number[][]} array of [X, Y, Z], triplets given as the coordinates of the vertical perimeter
     * @param bottom {number} vertical bottom to use for the 'crust'
     * @param scaleUp {number}
     * @param triangles {number[]}
     * @return {LotSurface}
     * @private
     */
    _buildEnclosedArea(horizontal, vertical, bottom, scaleUp, triangles=null) {
        const surface = new LotSurface();

        // Create the Horizontal Surface.
        surface.addFromXZY(horizontal, scaleUp);

        // Triangulate the horizontal surface
        surface.triangles = triangles || [...Delaunator.from(horizontal).triangles];

        // add the building platform 'crust' similarly to the one of the lot.
        for (let i=0; i<vertical.length; ++i) {
            const point = vertical[i];

            // Store the starting index point
            const A = surface.vertexCount;

            // Add the Top point
            surface.vertices.push(
                point[0] * scaleUp,
                point[2] * scaleUp,
                point[1] * scaleUp
            );
            surface.uvs.push(point[0] + point[1], point[2]);

            // Add the Bottom point
            const ZB = point.length > 3 ? point[3] : bottom;
            surface.vertices.push(
                point[0] * scaleUp,
                ZB * scaleUp,
                point[1] * scaleUp
            );
            surface.uvs.push(point[0] + point[1], ZB);

            // Add Triangles
            if (i>0) {
                surface.triangles.push(A-2, A-1, A, A-1, A+1, A);
            }
        }

        return surface;
    }
}