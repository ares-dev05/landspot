import Geom from '../../../../utils/Geom';
import LotTopographyModel from '../LotTopographyModel';
import LineDrawer from '../../../render/LineDrawer';
import Point from '../../../../geom/Point';
import Segment from '../../../../geom/Segment';
import Polygon from '../../../../geom/Polygon';
import LevelPointModel from '../LevelPointModel';
import LotPointModel from '../../lot/LotPointModel';
import DistinctSurfaceInterpolator from '../interpolation/DistinctSurfaceInterpolator';
import SurfaceInterpolator from '../interpolation/SurfaceInterpolator';
import AccountMgr from '../../../data/AccountMgr';
import HouseLayerType from '../../house/HouseLayerType';

export default class DrivewayPath extends Polygon {

    // Driveway width for single-car garages
    static get DRIVEWAY_WIDTH_SINGLE()  { return 3; }

    // Driveway width for double-car garages
    static get DRIVEWAY_WIDTH_DOUBLE()  { return 5; }

    /**
     * @return {number} length in meters for the split driveway front & back sections
     * @constructor
     */
    static get SPLIT_DRIVEWAY_SECTION_LENGTH() { return 2; }

    /**
     * @return {number} height level drop in meters for the split driveway
     * @constructor
     */
    static get SPLIT_DRIVEWAY_SECTION_DROP() { return 0.25; }

    /**
     * @param topography {LotTopographyModel}
     * @param crossover {LotDrivewayModel}
     * @param houseModel {HouseModel}
     * @param width {number}
     * @param garageSlabLevel {number}
     */
    constructor(topography, crossover, houseModel, width, garageSlabLevel) {
        super();

        /**
         * @type {LotTopographyModel}
         * @private
         */
        this._topography = topography;

        /**
         * @type {LotDrivewayModel}
         * @private
         */
        this._crossover = crossover;

        /**
         * @type {HouseModel}
         * @private
         */
        this._houseModel = houseModel;

        /**
         * @type {number}
         * @private
         */
        this._width = width;

        /**
         * @type {boolean}
         * @private
         */
        this._splitDriveway = false;

        /**
         * @type {number}
         * @private
         */
        this._length = 0;

        /**
         * @type {number}
         * @private
         */
        this._middleLength = 0;

        /**
         * @type {number}
         * @private
         */
        this._heightDifference = 0;

        /**
         * @type {number}
         * @private
         */
        this._middleHeightDifference = 0;

        /**
         * @type {number}
         * @private
         */
        this._garageSlabLevel = garageSlabLevel;

        /**
         * @type {SurfaceInterpolator}
         * @private
         */
        this._interpolator = null;

        /**
         * @type {boolean}
         * @private
         */
        this._valid = true;

        /**
         * @type {Segment[]}
         * @private
         */
        this._drivewayFront = null;

        /**
         * @type {Segment[]}
         * @private
         */
        this._drivewayLeft = null;

        /**
         * @type {Segment[]}
         * @private
         */
        this._drivewayRight = null;

        /**
         * @type {Segment}
         * @private
         */
        this._drivewayBack  = null;

        // process the driveway path
        this._calculate();
    }

    /**
     * @return {boolean}
     */
    get valid() { return this._valid; }

    /**
     * @return {SurfaceInterpolator}
     */
    get interpolator() { return this._interpolator; }

    /**
     * @return {number}
     */
    get width() { return this._width; }

    /**
     * @return {number} driveway length in meters
     */
    get length() { return this._length; }

    /**
     * @return {number}
     */
    get middleLength() { return this._middleLength; }

    /**
     * @return {number} driveway gradient
     */
    get gradient() {
        if (this._splitDriveway) {
            return this._middleLength/this._middleHeightDifference;
        }

        return this._length / this._heightDifference;
    }

    /**
     * @param segment {Segment}
     */
    isFront(segment) {
        return this._drivewayFront ? this._drivewayFront.find(test => test.equals(segment)) !== undefined : false;
    }

    /**
     * @param segment {Segment}
     * @return {boolean}
     */
    isSide(segment) {
        return this._drivewayLeft ? (
            this._drivewayLeft.find(test => test.containsSegment(segment)) !== undefined ||
            this._drivewayRight.find(test => test.containsSegment(segment)) !== undefined
        ) : false;
    }

    /**
     * @private
     */
    _calculate() {
        // fetch the driveway start & end
        const drivewayBack = this._houseModel.getGarageFront(this._crossover);

        console.log('received driveway back ',
            drivewayBack, ' from ',
            this._crossover, ' model ',
            this._houseModel._getMetaLayer(HouseLayerType.META_GARAGE_FRONT), ' data ',
            this._houseModel.houseData._facadeGarageFronts
        );

        if (!drivewayBack) {
            this._valid = false;
            return;
        }
        
        // update the driveway back to the required width.
        // @TODO @REFACTOR. This is simplified.
        if (drivewayBack.length > DrivewayPath.DRIVEWAY_WIDTH_DOUBLE) {
            this._width = DrivewayPath.DRIVEWAY_WIDTH_DOUBLE;
        }   else {
            this._width = DrivewayPath.DRIVEWAY_WIDTH_SINGLE;
        }

        // normalize around the center to the target width
        const diff = drivewayBack.length - this.width;
        drivewayBack.normalizeStart(this._width + diff/2);
        drivewayBack.normalize(this._width);

        let drivewayFront = [];

        if (this._crossover.boundary.isCurve) {
            // we need to determine the angle of the arc section that has a chord length equal to the driveway width
            const C = this._crossover.boundary;

            const halfAngle = Math.abs(Math.asin(this._width / 2 / C.radius));
            let   midAngle  = Geom.angleBetween(C.curveCenter.x, C.curveCenter.y, this._crossover.x, this._crossover.y);

            const curveStart = Math.min(C.aAngle, C.bAngle);
            const curveEnd   = Math.max(C.aAngle, C.bAngle);

            // Determine the start & end angles for the driveway
            if (midAngle - halfAngle < curveStart) {
                midAngle = curveStart + halfAngle;
            }   else if (midAngle + halfAngle > curveEnd) {
                midAngle = curveEnd - halfAngle;
            }

            // Determine arc length and number of steps for driveway entry. We will then split it in a set of segments
            const arcLength  = C.radius * 2 * halfAngle;
            const curveSteps = Math.max(2, Math.ceil(arcLength / LotTopographyModel.CURVE_STEP));

            // use the graphic LineDrawer to create the curve pieces
            const path = LineDrawer.getCurveCommands(C.curveCenter.x, C.curveCenter.y, C.radius, midAngle-halfAngle, midAngle+halfAngle, curveSteps);
            const points = [];

            // map the coordinates to points
            for (let i=0; i<path.points.length; i+=2) {
                points.push(new Point(path.points[i], path.points[i+1]));
            }
            for (let i=0; i<points.length-1; i++) {
                drivewayFront.push(new Segment(points[i], points[i+1]));
            }
        }   else {
            // straight line, pick the two points
            const L = this._crossover.boundary, distanceToLeft = Geom.pointDistance(L.a, this._crossover);
            let front = L.clone();

            // If there is enough room to start the boundary to the left of the crossover center, move the front
            if (distanceToLeft > this._width / 2) {
                front.normalizeStart(front.length - (distanceToLeft - this._width/2));
            }

            // make sure the crossover doesn't expand too much to the right.
            if (front.length < this._width) {
                front.normalizeStart(this._width);
            }   else {
                front.normalize(this._width);
            }

            drivewayFront.push(front);
        }

        // if left & right intersect, we need to change the direction for the back
        if (Geom.segmentIntersectionPoints(drivewayBack.b, drivewayFront[0].a, drivewayFront[drivewayFront.length-1].b, drivewayBack.a) !== null) {
            drivewayBack.reverse();
        }

        /**
         * @type {Segment[]}
         * @private
         */
        this._drivewayFront = drivewayFront;

        /**
         * @type {Segment}
         * @private
         */
        this._drivewayBack  = drivewayBack;

        // Calculate the driveway width from the crossover to the middle of the back
        this._length = Geom.pointDistance(this._crossover, drivewayBack.center);

        // calculate the driveway height difference
        this._heightDifference = Math.abs(this._topography.heightLevel(this._crossover.x, this._crossover.y) - this._garageSlabLevel);

        // Check if a split driveway is needed and can be built, or if we should default to a simple driveway.
        if (AccountMgr.i.builder.hasSplitDriveway &&
            this._heightDifference >= 2 * DrivewayPath.SPLIT_DRIVEWAY_SECTION_DROP &&
            this._length >= 2 * DrivewayPath.SPLIT_DRIVEWAY_SECTION_LENGTH) {
            this._buildSplitDriveway(drivewayFront, drivewayBack);
        }   else {
            this._buildSimpleDriveway(drivewayFront, drivewayBack);
        }
    }

    /**
     * Normal driveway format
     *
     * @param drivewayFront {Segment[]}
     * @param drivewayBack {Segment}
     * @private
     */
    _buildSimpleDriveway(drivewayFront, drivewayBack) {
        // store first & last segments in the driveway front
        const frontStart = this._drivewayFront[0], frontEnd = this._drivewayFront[this._drivewayFront.length-1];

        // Set the driveway sides
        this._drivewayRight = [new Segment(frontEnd.b, drivewayBack.a)];
        this._drivewayLeft  = [new Segment(drivewayBack.b, frontStart.a)];

        // Driveway direction is: ...drivewayFront, right, drivewayBack, left. Segments are sorted either CW or CCW
        this._edges = [
            // front segment(s)
            ...this._drivewayFront,
            // right
            ...this._drivewayRight,
            // back
            this._drivewayBack,
            // left
            ...this._drivewayLeft,
        ];

        // Create the surface interpolator
        const LVL = (p, h) => new LevelPointModel(new LotPointModel(p.x, p.y), h);

        // Add the Driveway Level Points
        const drivewayLevels = [
            // Add the garage entry
            LVL(drivewayBack.a, this._garageSlabLevel),
            LVL(drivewayBack.b, this._garageSlabLevel),
            // Crossover points
            LVL(frontStart.a, this._topography.heightLevel(frontStart.a.x, frontStart.a.y)),
            LVL(frontEnd.b, this._topography.heightLevel(frontEnd.b.x, frontEnd.b.y))
        ];

        // Determine the driveway area
        this._interpolator = new DistinctSurfaceInterpolator(
            new Polygon(this._edges.concat()),
            drivewayLevels
        );

        // Manually set source vertices for the driveway perimeter
        this.sourceVertices =
            this._interpolator.perimeter.sourceVertices = this._edges.map(edge => edge.a);
    }

    /**
     * Henley format: 1:8 gradient front 2m, 1:8 gradient back 2m, custom gradient in the middle
     *
     * @param drivewayFront {Segment[]}
     * @param drivewayBack {Segment}
     * @private
     */
    _buildSplitDriveway(drivewayFront, drivewayBack) {
        // store first & last segments in the driveway front
        const frontStart = drivewayFront[0], frontEnd = drivewayFront[drivewayFront.length-1];

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 1. start by building the driveway back

        const rightBack = new Segment(frontEnd.b.clone(), drivewayBack.a.clone()).normalizeStart(DrivewayPath.SPLIT_DRIVEWAY_SECTION_LENGTH);
        const leftBack  = new Segment(drivewayBack.b.clone(), frontStart.a.clone()).normalize(DrivewayPath.SPLIT_DRIVEWAY_SECTION_LENGTH);

        // difference for driveway platforms
        const difference = this._topography.heightLevel(this._crossover.x, this._crossover.y) < this._garageSlabLevel ?
            -DrivewayPath.SPLIT_DRIVEWAY_SECTION_DROP :
             DrivewayPath.SPLIT_DRIVEWAY_SECTION_DROP;

        // Create the surface interpolator
        const LVL = (p, h) => new LevelPointModel(new LotPointModel(p.x, p.y), h);

        // Add the Driveway Level Points
        let drivewayLevels = [
            // Add the garage entry
            LVL(drivewayBack.a, this._garageSlabLevel),
            LVL(drivewayBack.b, this._garageSlabLevel),
            // 1:8 drop to last 2m
            LVL(rightBack.a, this._garageSlabLevel + difference),
            LVL(leftBack.b, this._garageSlabLevel + difference),
        ];

        // Determine the driveway area
        const backInterpolator = new DistinctSurfaceInterpolator(
            // new Polygon([new Segment(leftBack.b, rightBack.a), rightBack, drivewayBack, leftBack]),
            Polygon.from(Geom.sortPoints(drivewayLevels.map(level => level.position.clone()))),
            drivewayLevels
        );
        // Manually set source vertices for the driveway perimeter
        backInterpolator.perimeter.sourceVertices = backInterpolator.perimeter.edges.map(edge => edge.a);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 2. build the driveway front

        const rightFront = new Segment(frontEnd.b.clone(), drivewayBack.a.clone()).normalize(DrivewayPath.SPLIT_DRIVEWAY_SECTION_LENGTH);
        const leftFront  = new Segment(drivewayBack.b.clone(), frontStart.a.clone()).normalizeStart(DrivewayPath.SPLIT_DRIVEWAY_SECTION_LENGTH);

        // Add the Driveway Level Points
        drivewayLevels = [
            // 1:8 rise for the first 2m
            LVL(rightFront.b, this._topography.heightLevel(frontEnd.b.x, frontEnd.b.y) - difference),
            LVL(leftFront.a, this._topography.heightLevel(frontStart.a.x, frontStart.a.y) - difference),
            // Crossover points
            LVL(frontStart.a, this._topography.heightLevel(frontStart.a.x, frontStart.a.y)),
            LVL(frontEnd.b, this._topography.heightLevel(frontEnd.b.x, frontEnd.b.y))
        ];

        // Determine the driveway area
        const frontInterpolator = new DistinctSurfaceInterpolator(
            new Polygon([...drivewayFront, rightFront, new Segment(rightFront.b, leftFront.a), leftFront]),
            drivewayLevels
        );
        // Manually set source vertices for the driveway perimeter
        frontInterpolator.perimeter.sourceVertices = frontInterpolator.perimeter.edges.map(edge => edge.a);

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // 3. Build the driveway middle

        // Add the Driveway Level Points
        drivewayLevels = [
            // 1:8 rise for the first 2m
            LVL(rightFront.b, this._topography.heightLevel(frontEnd.b.x, frontEnd.b.y) - difference),
            LVL(leftFront.a, this._topography.heightLevel(frontStart.a.x, frontStart.a.y) - difference),
            // 1:8 drop to last 2m
            LVL(rightBack.a, this._garageSlabLevel + difference),
            LVL(leftBack.b, this._garageSlabLevel + difference),
        ];

        // Determine the driveway area
        const midInterpolator = new DistinctSurfaceInterpolator(
            Polygon.from([leftFront.a, rightFront.b, rightBack.a, leftBack.b]),
            drivewayLevels
        );

        // create the interpolator by manually assigning the 3 parts
        this._interpolator = new SurfaceInterpolator([], null, null);
        this._interpolator.subSurfaces.push(frontInterpolator, midInterpolator, backInterpolator);

        // Set the driveway sides
        this._drivewayRight = [rightFront, new Segment(rightFront.b, rightBack.a), rightBack];
        this._drivewayLeft  = [leftBack, new Segment(leftBack.b, leftFront.a), leftFront];

        // Build the full Driveway. For Henley, this includes all 3 sections of the driveway (start, mid, end)
        // Driveway direction is: ...drivewayFront, right, drivewayBack, left. Segments are sorted either CW or CCW
        this._edges = [
            // front segment(s)
            ...drivewayFront,
            // right
            ...this._drivewayRight,
            // back
            drivewayBack,
            // left
            ...this._drivewayLeft,
        ];

        // set source vertices for the driveway
        this.sourceVertices = this._edges.map(edge => edge.a);

        // set the full perimeter for the interpolator
        this._interpolator.perimeter = Polygon.from(this.sourceVertices);

        // Calculate the driveway width for the middle section
        this._middleLength = this._length - 2 * DrivewayPath.SPLIT_DRIVEWAY_SECTION_LENGTH;

        // Calculate the height difference for the middle section
        this._middleHeightDifference = this._heightDifference - 2 * DrivewayPath.SPLIT_DRIVEWAY_SECTION_DROP;

        // Mark this as a split driveway
        this._splitDriveway = true;
    }
}