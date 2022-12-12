import RestoreDispatcher from '../../../../events/RestoreDispatcher';
import Geom from '../../../../utils/Geom';
import Polygon from '../../../../geom/Polygon';
import RetainingWall from './RetainingWall';
import Segment from '../../../../geom/Segment';
import SiteBatter from './SiteBatter';
import SiteBatterSlice from './SiteBatterSlice';
import Triangle from '../../../../geom/Triangle';
import DrivewayPath from './DrivewayPath';
import CutPerimeter from './CutPerimeter';
import SitePiering from './SitePiering';
import Point from '../../../../geom/Point';
import Rectangle from '../../../../geom/Rectangle';


export default class SiteWorksModel extends RestoreDispatcher {

    // Step to use when calculating retaining walls (=10cm)
    static get WORK_STEP() { return 0.2; }

    /**
     * @param topography {LotTopographyModel}
     * @param position {FloorPositionModel}
     * @param facade {FacadeModel}
     * @param crossovers {LotDrivewayModel[]}
     */
    constructor(topography, position, facade, crossovers) {
        super();

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
         * @type {FacadeModel}
         * @private
         */
        this._facade     = facade;

        /**
         * @type {LotDrivewayModel[]}
         * @private
         */
        this._crossovers = crossovers;

        /**
         * @type {CutFillResult}
         * @private
         */
        this._cutFillResult = null;

        /**
         * @type {number}
         * @private
         */
        this._platformLevel  = 0;

        /**
         * @type {number}
         * @private
         */
        this._slabLevel = 0;

        /**
         * @type {number}
         * @private
         */
        this._garageSlabLevel = 0;

        /**
         * @type {Polygon}
         * @private
         */
        this._buildPerimeter = null;

        /**
         * @type {Polygon}
         * @private
         */
        this._buildPlatform = null;

        /**
         * @type {CutPerimeter}
         * @private
         */
        this._cutPerimeter = null;

        /**
         * @type {CutPerimeter}
         * @private
         */
        this._pierPerimeter = null;

        /**
         * @type {Point[]}
         * @private
         */
        this._platformVertices = null;

        /**
         * @type {Polygon}
         * @private
         */
        this._siteWorksPerimeter = null;

        /**
         * @type {RetainingWall[]}
         * @private
         */
        this._retainingWalls = [];

        /**
         * @type {SiteBatter[]}
         * @private
         */
        this._batterAreas = [];

        /**
         * @type {DrivewayPath}
         * @private
         */
        this._driveway = null;

        /**
         * @type {SitePiering}
         * @private
         */
        this._sitePiering = null;
    }

    /**
     * @return {number} Level of the building platform
     */
    get platformLevel() { return this._platformLevel; }

    /**
     * @return {number}
     */
    get slabLevel() { return this._slabLevel; }

    /**
     * @return {number}
     */
    get garageSlabLevel() { return this._garageSlabLevel; }

    /**
     * @return {number}
     */
    get porchSlabLevel() { return Math.max(this._platformLevel+0.001, this._slabLevel - this.facade.slab.porchDropdown); }

    /**
     * @return {number}
     */
    get alfrescoSlabLevel() { return Math.max(this._platformLevel+0.001, this._slabLevel - this.facade.slab.alfrescoDropdown); }

    /**
     * @return {Polygon} Perimeter of the building platform (driveway included)
     */
    get buildPerimeter() { return this._buildPerimeter; }

    /**
     * @return {Polygon} Perimeter of the building platform (driveway excluded)
     */
    get buildPlatform() { return this._buildPlatform; }

    /**
     * @return {CutPerimeter}
     */
    get cutPerimeter() { return this._cutPerimeter; }

    /**
     * @return {CutPerimeter}
     */
    get pierPerimeter() { return this._pierPerimeter; }

    /**
     * @return {Point[]}
     */
    get platformVertices() { return this._platformVertices; }

    /**
     * @return {Polygon} Full perimeter of the site works, including retaining walls and batter for cuts/fills
     */
    get siteWorksPerimeter() { return this._siteWorksPerimeter; }

    /**
     * @return {RetainingWall[]} List of retaining walls to be added on the lot
     */
    get retainingWalls() { return this._retainingWalls; }

    /**
     * @return {SiteBatter[]}
     */
    get batterAreas() { return this._batterAreas; }

    /**
     * @return {DrivewayPath}
     */
    get driveway() { return this._driveway; }

    /**
     * @return {SitePiering}
     */
    get sitePiering() { return this._sitePiering; }

    /**
     * @returns {LotPathModel}
     * @protected
     */
    get lotModel() { return this._topography.lotModel; }

    /**
     * @returns {LotTopographyModel}
     * @public
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

    /**
     * @return {CutFillResult}
     */
    get cutFillResult() { return this._cutFillResult; }

    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Site Work Calculations

    /**
     * Difference between cut volume and fill volume
     * @return {number}
     */
    get cutFillVolume() {
        return this._cutFillResult.volumeDifference;
    }

    /**
     * Volume of soil taken away during vegetation scrape
     * @return {number}
     */
    get vegScrapeVolume() {
        return this._cutFillResult.surface * this.topography.vegScrape;
    }

    /**
     * @return {number}
     */
    get batterVolume() {
        return this._batterAreas.reduce((sum, batter) => sum + batter.volume, 0);
    }

    /**
     * @return {number}
     */
    get retainedLength() {
        return this._retainingWalls.reduce((sum, wall) => sum + wall.length, 0);
    }

    /**
     * @return {number}
     */
    get retainedSurface() {
        return this._retainingWalls.reduce((sum, wall) => sum += wall.surface, 0);
    }

    /**
     * @return {number}
     */
    get retainedBeamLength() {
        return Math.ceil(
            this._retainingWalls.reduce((sum, wall) => sum += wall.beamLength, 0) / RetainingWall.BEAM_LENGTH
        );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Calculations for all site works

    /**
     * Update all the calculations for the site works
     * @param addDriveway {boolean}
     *
     * @public
     */
    update(addDriveway=false) {
        // Calculate the cut Fill result
        this._cutFillResult   = this.topography.getHouseAverageLevel(this.floorPosition.housePadding, true);

        // Calculate the level of the building platform
        this._platformLevel   = this._cutFillResult.level - this.topography.vegScrape;

        // Calculate the house & garage slab levels
        this._slabLevel       = this._platformLevel + Math.max(this.facade.slab.height, 0.212);
        this._garageSlabLevel = Math.max(this._platformLevel+0.001, this._slabLevel - this.facade.slab.garageDropdown);

        // Reset all the site works properties
        this._siteWorksPerimeter = new Polygon([]);
        this._retainingWalls     = [];
        this._batterAreas        = [];

        // If no house is selected -> nothing to calculate
        if (!this.houseModel.houseData) {
            return;
        }

        // Determine the house area and pad it by the size of the building platform
        // const houseArea       = this.houseModel.boundingBox;
        // houseArea.pad(this.floorPosition.housePadding);
        const houseArea       = this.houseModel.getBuildingPlatform(this.floorPosition.housePadding);

        // Apply the rotation to the house area
        const center  = this.houseModel.center;
        const angle   = Geom.deg2rad(this.houseModel ? this.houseModel.rotation : 0);

        this._buildPerimeter = Polygon.from(
            houseArea.vertices.map(
                vertex => Geom.rotatePoint(center, vertex, angle)
            )
        );

        // Clip the building perimeter so that it's contained within the lot boundaries
        // @TODO: intersect can return 0, 1 or more polygons. make sure we pick correctly
        this._buildPerimeter = this._buildPerimeter.intersect(this.topography.lotOutline)[0];

        // Initialize the cut perimeter before adding the driveway to the build perimeter
        this._cutPerimeter   = new CutPerimeter(this.topography, this.platformLevel, this.buildPerimeter, true);

        // Initialize the piering perimeter at the level threshold where we need to pier the fill
        /**
         * @TODO: We have an issue here with the processed cut lines. They create issues when we use this perimeter
         * @TODO to clip the house slab /garage slab. Trying to calculate the convex hull for the perimeter leads to
         * @TODO the same issue - the hull edges zig-zag back and forth along the final path, making clipping impossible
         */
        this._pierPerimeter  = new CutPerimeter(this.topography, this.platformLevel-SitePiering.PIER_THRESHOLD, this.buildPerimeter, false, false);

        // Make sure normals are calculated for the platform before we apply a driveway cutout
        this._buildPerimeter.calculateNormals();

        // Calculate the driveway and apply it to the build perimeter (if it is created)
        if (addDriveway) {
            this.buildDriveway();
        }

        // Update the cut fill data to use the clipped surface
        this._cutFillResult.surface = this._buildPerimeter.getArea();

        // Process each edge of the build platform and retain if necessary
        this.buildPerimeter.edges.forEach(
            (edge, edgeIndex) => {
                // Skip driveway fronts -> no site works needed
                if (this._driveway && this._driveway.isFront(edge)) {
                    // Add a site works segment for the entire span
                    this.addSiteWorkSegment(new Segment(edge.a, edge.b));
                    return;
                }

                // Flag that indicates if this is a driveway side
                const isDrivewaySide = this._driveway && this._driveway.isSide(edge);

                // Split the edge every 5cm (?)
                const totalSteps = Math.max(1, Math.floor(edge.length / SiteWorksModel.WORK_STEP));
                let step = 0;

                /**
                 * Work segments associated with this edge.
                 * @type {(RetainingWall|SiteBatter)[]}
                 */
                const segments = [];

                /**
                 * @type {RetainingWall}
                 */
                let wallSegment = null;
                const endCurrentWall = (position) => {
                    if (wallSegment) {
                        wallSegment.endWall(position);

                        // Check if we can extend the previous wall instead
                        if (!(segments.length) ||
                            !(segments[segments.length-1] instanceof RetainingWall) ||
                            !(segments[segments.length-1].extendWall(wallSegment))) {
                            // Only add a new wall if it's the first, or if we didn't extend the previous piece.
                            segments.push(wallSegment);
                        }

                        wallSegment = null;
                    }
                };

                /**
                 * @type {SiteBatter}
                 */
                let batterSegment = null;
                const endCurrentBatter = (position, addEndSlice=true) => {
                    if (batterSegment) {
                        batterSegment.endBatter(position, addEndSlice);

                        // Batter needs to have at least two slices to be added
                        if (batterSegment.slices.length>1) {
                            segments.push(batterSegment);
                        }

                        batterSegment = null;
                    }
                };

                /**
                 * @param ray {Segment}
                 * @param position {number}
                 */
                const retainOrBatter = (ray, position) => {
                    const originalRay = ray.clone();

                    // Flag that indicates if the current point needs to be retained or not
                    let retainPoint = false;

                    // Find closest boundary and distance to it.
                    const {side, distanceToBoundary} = this.getClosestBoundary(ray);

                    // @INFO: Assume we need to retain: start by determining the outside end of the retaining wall.
                    // flag that indicates if the existing retaining wall would be built on the boundary
                    let onBoundary = false;

                    // How much the retaining wall is offset inwards from the building platform edge (if any)
                    let wallOffset = RetainingWall.PLATFORM_INSET;

                    // @INFO Special case: If there is not enough room to the boundary to retain, we need to offset the
                    // retaining wall back into the building platform
                    if (distanceToBoundary < RetainingWall.MINIMUM_WIDTH - wallOffset) {
                        // Determine the required offset
                        wallOffset = RetainingWall.MINIMUM_WIDTH - distanceToBoundary;

                        // Move the ray start backwards for the required offset
                        ray.normalizeStart(wallOffset + ray.length);

                        // We retain on the boundary in this case
                        onBoundary = true;
                    }   else if (Geom.equal(distanceToBoundary, 0)) {
                        // We retain on the boundary in this case
                        onBoundary = true;
                    }

                    // The start of the retaining wall is fixed. Now set the end
                    ray.normalize(RetainingWall.MINIMUM_WIDTH);

                    // We now have the coordinates of the retaining wall in the Y (depth) space. Determine
                    // the maximum height difference at both ends
                    const levels = [
                        this.topography.heightLevel(ray.a.x, ray.a.y),
                        this.topography.heightLevel(ray.b.x, ray.b.y),
                    ];

                    // Set the platform level that we retain / batter from.
                    const platformLevel = isDrivewaySide ? this._driveway.interpolator.interpolate(originalRay.a.x, originalRay.a.y) : this._platformLevel;

                    // We also need to calculate the bottom of the retaining wall in the Z (height) coordinate
                    const bottom     = Math.min(platformLevel, ...levels);
                    const heightDiff = Math.max(...levels.map(h => Math.abs(h-platformLevel)));

                    // If we are on the boundary, we use a different threshold to determine if we need to retain
                    if (heightDiff > (onBoundary ? RetainingWall.BOUNDARY_THRESHOLD : RetainingWall.THRESHOLD) ) {
                        retainPoint = true;
                    }

                    // Calculate batter parameters, if it hasn't been determined yet that we need to retain
                    if (!retainPoint && !wallSegment) {
                        // Reset the ray in case its start was moved to test for retaining
                        ray = originalRay.clone();
                        ray.normalize(distanceToBoundary);

                        // @TODO: if there is a batter line intersecting the ray, we should check if we can batter up to that point, not further

                        // Determine the maximum batter height difference from this point on the building platform, to the boundary
                        let batterHeightDiff = Math.abs(platformLevel-this.topography.heightLevel(ray.b.x, ray.b.y));

                        // we need to know if we are battering a cut or a fill
                        const platformHeightDiff = platformLevel - this.topography.heightLevel(ray.a.x, ray.a.y);

                        if (Geom.equal(platformHeightDiff, 0)) {
                            // If no battering is needed, we can skip any additional checks
                            if (batterSegment) {
                                endCurrentBatter(position, false);
                            }
                        }   else {
                            // flag indicating if we are battering a cut or a fill
                            const isCut = platformHeightDiff < 0;
                            // Determine what slop ratio limit to use
                            const batterSlope = isCut ? SiteBatter.BATTER_RATIO_CUT : SiteBatter.BATTER_RATIO_FILL;
                            // flag that tracks if we inset the batter into the building platform
                            let batterInset = false;

                            // If there is not enough room to batter, we try to inset the batter into the platform
                            if (ray.length / batterHeightDiff < batterSlope) {
                                /**
                                 * L = batter length
                                 * H = batter height difference
                                 * L / H => actual batter slope
                                 *
                                 * solve for L to achieve required slope
                                 */

                                const L = batterHeightDiff * batterSlope;

                                // see if it's an acceptable inset
                                if (L - ray.length < SiteBatter.PLATFORM_INSET) {
                                    const PREV_LENGTH = ray.length;

                                    if (Geom.equal(ray.length, 0)) {
                                        // If we reduced the ray to a single point, (when distanceToBoundary=0),
                                        // we have to reset it to the original, make its end reach the same point,
                                        // but give it a length of 1.
                                        ray = originalRay.clone();
                                        ray.normalizeStart(ray.length + 1);
                                        ray.normalize(distanceToBoundary + 1);
                                    }

                                    // extend the ray to the required position
                                    ray.normalizeStart(L);

                                    if (isNaN(ray.a.x)) {
                                        console.log('batter.NaN here ', ray.toString(), L, 'prev: ', PREV_LENGTH, 'toBoundary: ', distanceToBoundary);
                                    }

                                    // since we're extending to get the exact slope, we set the inset flag to true, to avoid
                                    // running into precision errors when we compare against the slope in the next block
                                    batterInset = true;
                                }
                            }

                            // Check if we can batter at a better slope than the limit
                            if (batterInset || (ray.length / batterHeightDiff >= batterSlope)) {
                                // Only need to binary search if we don't inset the batter
                                if (batterInset === false) {
                                    // Aim for a 1mm precision and determine the number of binary search steps required
                                    const steps = Math.max(1, Math.ceil(Geom.log2(ray.length * 1000)));

                                    // Binary search for the batter position.
                                    for (let step = steps, div = 2; step > 0; --step, div *= 2) {
                                        // Try to move the ray closer to the edge by this distance
                                        const distance = distanceToBoundary / div;

                                        ray.normalize(ray.length - distance);
                                        const testHeightDiff = Math.abs(platformLevel - this.topography.heightLevel(ray.b.x, ray.b.y));

                                        if (isNaN(ray.a.x)) {
                                            console.log('batter.NaN here ', ray.toString(), distance);
                                        }

                                        if (ray.length / testHeightDiff < batterSlope) {
                                            // If the new slope is too steep, revert the ray to the previous position
                                            ray.normalize(ray.length + distance);

                                            if (isNaN(ray.a.x)) {
                                                console.log('batter.NaN here ', ray.toString(), distance);
                                            }
                                        } else {
                                            // We store the new batter height
                                            batterHeightDiff = testHeightDiff;
                                        }
                                    }
                                }

                                // We now have the position that we need to batter to.
                                if (!batterSegment) {
                                    batterSegment = new SiteBatter(edge, position);
                                }

                                // Determine the slice area from its three sides
                                const area = Triangle.areaFromSides(
                                    // vertical platform line before battering
                                    platformHeightDiff,
                                    // new batter line
                                    Geom.vectorLength(ray.length, batterHeightDiff),
                                    // initial lot line
                                    Geom.vectorLength(ray.length, batterHeightDiff-platformHeightDiff)
                                );

                                // Determine volume (positive or negative, based on cut/fill)
                                const volume = (isCut ? -1 : 1 )  * area * SiteWorksModel.WORK_STEP;

                                if (isNaN(ray.a.x)) {
                                    console.log('batter.addSlice ', ray.toString(), ' from ', originalRay.toString());
                                }

                                // Add the new slice and its volume
                                batterSegment.addSlice(
                                    SiteBatterSlice.from(ray, platformLevel, this.topography.heightLevel(ray.b.x, ray.b.y), volume)
                                );
                            } else {
                                retainPoint = true;
                            }
                        }
                    }

                    // If we still have an active wall segment, update it
                    if (wallSegment) {
                        wallSegment.updateWall(heightDiff, wallOffset, bottom);
                    }   else if (retainPoint) {
                        // End the current batter segment, if any
                        endCurrentBatter(position, true, distanceToBoundary);
                        // New wall segment is needed
                        wallSegment = new RetainingWall(edge, position, heightDiff, wallOffset, bottom);
                    }   else {
                        // Batter slice was added
                    }
                };

                for (step=0; step<=totalSteps; ++step) {
                    // Determine the point on the edge for the current step
                    const point = Geom.interpolatePoints(edge.a, edge.b, step / totalSteps);

                    // 1D position on the edge, in meters
                    const position = step * SiteWorksModel.WORK_STEP;

                    // First check if there is a retaining wall that we can end here.
                    if (wallSegment && position - wallSegment.start >= wallSegment.lengthStep) {
                        endCurrentWall(position);
                    }

                    // Set the outward normal for the edge to start from the current point.
                    retainOrBatter(edge.outNormal.clone().startFromPoint(point), position);

                    // process this point in the cut perimeter
                    this._cutPerimeter.addPoint(point);
                    this._pierPerimeter.addPoint(point);
                }

                // End the wall / batter segments if any is still open
                endCurrentWall(edge.length);

                // @TODO: this will need fixing for the driveway as there's a direction change.
                if (batterSegment) {
                    // continue the batter until the next segment
                    const nextEdge = this.buildPerimeter.edges[(edgeIndex+1) % this.buildPerimeter.edges.length];

                    // Don't apply this for driveways
                    const isDriveway = this._driveway && (this._driveway.isFront(nextEdge) || this._driveway.isSide(nextEdge));

                    const convexTurn = this._buildPerimeter.testCWSorting() === Geom.ccwTurn(edge.a, edge.b, nextEdge.b);

                    if (!isDriveway && convexTurn) {
                        // @TODO: add more pieces. Now we're just going to use the next edge normal
                        retainOrBatter(nextEdge.outNormal.clone().startFromPoint(edge.b), edge.length);
                    }
                }

                // end the batter (if any)
                endCurrentBatter(edge.length);

                // Navigate the new processed boundary and add the work segments to the cutout platform
                let current = edge.a;

                // Use a slightly extended edge to make sure we detect intersections
                const edgeRay = edge.clone();
                edgeRay.normalize(edgeRay.length + 1);
                edgeRay.normalizeStart(edgeRay.length + 1);

                if (isDrivewaySide) {
                    console.log('Driveway side. Segments=', segments.length, segments);
                }

                // Check at each step if we're dealing with a wall segment or a batter segment
                segments.forEach(
                    workSegment => {
                        // add retaining wall to overall list
                        if (workSegment instanceof RetainingWall) {
                            // Case 1: retaining wall has no inside offset
                            if (Geom.equal(workSegment.offset, 0)) {
                                this.addSiteWorkSegment(new Segment(current, workSegment.innerStart));
                                this.addSiteWorkSegment(new Segment(workSegment.innerStart, workSegment.outerStart));
                                this.addSiteWorkSegment(new Segment(workSegment.outerStart, workSegment.outerEnd));
                                this.addSiteWorkSegment(new Segment(workSegment.outerEnd, workSegment.innerEnd));

                                current = workSegment.innerEnd;
                            }
                            // Case 2: retaining wall has some (but not full) offset
                            else if (!Geom.equal(workSegment.offset, workSegment.width)) {
                                const midStart = Geom.segmentIntersectionPoints(edgeRay.a, edgeRay.b, workSegment.innerStart, workSegment.outerStart);
                                const midEnd = Geom.segmentIntersectionPoints(edgeRay.a, edgeRay.b, workSegment.innerEnd, workSegment.outerEnd);

                                if (midStart !== null && midEnd !== null) {
                                    // can midStart or midEnd be null here?
                                    this.addSiteWorkSegment(new Segment(current, midStart));
                                    this.addSiteWorkSegment(new Segment(midStart, workSegment.outerStart));
                                    this.addSiteWorkSegment(new Segment(workSegment.outerStart, workSegment.outerEnd));
                                    this.addSiteWorkSegment(new Segment(workSegment.outerEnd, midEnd));

                                    current = midEnd;
                                } else {
                                    // @TODO
                                }
                            }
                            // Case 3: retaining wall is fully offset into the building platform. We can ignore its cutout

                            this._retainingWalls.push(workSegment);
                        }   else if (workSegment instanceof SiteBatter) {

                            // For the Site Batter, we add the two side segments, plus the boundary of the batter
                            this.addSiteWorkSegment(new Segment(current, workSegment.innerStart));
                            current = workSegment.innerStart;

                            // If this batter is a fill, we don't need to add the full path
                            if (!workSegment.isFill) {
                                workSegment.outerPath.forEach(
                                    point => {
                                        // No need to check for overlaps over the outer path perimeter
                                        // @TODO: see if we can extend in a loop here.
                                        this.addSiteWorkSegment(new Segment(current, point), false, false);
                                        current = point;
                                    }
                                );
                            }

                            // Add the closing side segment
                            this.addSiteWorkSegment(new Segment(current, workSegment.innerEnd));
                            current = workSegment.innerEnd;

                            this._batterAreas.push(workSegment);
                        }
                    }
                );

                // Add the final piece, connecting the edge to the end
                this.addSiteWorkSegment(new Segment(current, edge.b));
            }
        );

        // complete processing the cut & piering perimeter
        this._cutPerimeter.complete();
        this._pierPerimeter.complete();

        // calculate piers required for the house slab
        this.calculatePiering();

        // @TODO: process the cut points, merge them and build the whole perimeter

        console.log('from input ', this.buildPerimeter.edges);
        console.log('calculated ', this.siteWorksPerimeter.edges);
        console.log('coordinates ', this.siteWorksPerimeter.edges.map(edge => [edge.a.x, edge.a.y, edge.b.x, edge.b.y]));

        console.log(
            'volumes: ',
            'cut/fill: ' + this.cutFillVolume,
            'veg scrp: ' + this.vegScrapeVolume,
            'batters : ' + this.batterVolume
        );

        // it's important we calculate the vertices for the site works platform correctly, otherwise the triangles won't be
        // excluded correctly from its area. We set the list of vertices as the starting point
        this.siteWorksPerimeter.sourceVertices = this.siteWorksPerimeter.edges.map(edge => edge.a);

        // Dispatch a change event for the model
        this.onChange();
    }

    /**
     * Adds a new segment to the site works perimeter
     * @param segment {Segment}
     * @param checkOverlap {boolean} Flag that indicates if we need to check for overlapping segments
     * @param closeExtend {boolean} Flag that indicates if we can extend segment pieces with
     * @private
     */
    addSiteWorkSegment(segment, checkOverlap=true, closeExtend=false) {
        // Don't add if a null segment
        if (Geom.equal(segment.length, 0)) {
            return;
        }

        // Determine if we have a previous segment
        const prevSegment = this.siteWorksPerimeter.edges.length > 0 ? this.siteWorksPerimeter.edges[this.siteWorksPerimeter.edges.length-1] : null;

        // If the newly added segment is a reverse of the previous one -> take it out
        if (prevSegment && Geom.reverseSegment(prevSegment, segment))  {
            this.siteWorksPerimeter.edges.pop();
            return;
        }

        // If this segment is a continuation of the previous one, extend it instead;
        if (prevSegment && (
             Geom.equal(prevSegment.angle, segment.angle) ||
            (closeExtend && Math.abs(Geom.deg2rad(prevSegment.angle-segment.angle)) < 0.01))) {
            prevSegment.b = segment.b.clone();
            return;
        }

        // If this segment goes in an opposite direction from the previous one and overlaps it, take out the overlapping portion
        if (prevSegment && checkOverlap &&
            Geom.pointsEqual(prevSegment.b, segment.a) &&
            Geom.equal(Geom.norm(prevSegment.angle - segment.angle), Math.PI)) {
            // Check which is the longest segment
            if (segment.length > prevSegment.length) {
                // Segments overlap across the length of [prevSegment]. Make new segment continue from where previous started
                segment.a = prevSegment.a.clone();
                // Remove the previous segment, add the new one
                this.siteWorksPerimeter.edges.pop();
                this.siteWorksPerimeter.edges.push(segment);
            }   else {
                // Segments overlap across the length of [segment]. Don't add it to the list, update the previous one instead
                prevSegment.b = segment.b.clone();
            }

            return;
        }

        this.siteWorksPerimeter.edges.push(segment);
    }

    /**
     * @param ray {Segment}
     * @return {{side: {Segment}, distanceToBoundary: number}}
     * @private
     */
    getClosestBoundary(ray) {
        ray.normalize(1e4); // 10km
        let side=null, minimum=Infinity;
        this.topography.lotOutline.edges.forEach(
            boundary => {
                // See if the ray intersects the tested boundary
                const X = Geom.segmentIntersection(boundary, ray);
                if (X) {
                    const distance = Geom.pointDistance(ray.a, X);
                    if (distance < minimum) {
                        minimum  = distance;
                        side     = boundary;
                    }
                }
            }
        );

        if (!side) {
            this.topography.lotOutline.edges.forEach(
                boundary => {
                    const distance = Geom.pointToSegmentDistance(
                        ray.a.x, ray.a.y,
                        boundary.a.x, boundary.a.y, boundary.b.x, boundary.b.y
                    );

                    if (distance < minimum) {
                        minimum = distance;
                        side    = boundary;
                    }
                }
            );
        }

        return {
            side: side,
            distanceToBoundary: minimum
        };
    }

    /**
     * @private
     */
    buildDriveway() {
        // Check to see if the house has a valid crossover
        const crossover = this._crossovers ? this._crossovers.find( C => C.boundary !== null ) : null;

        if (crossover) {
            this._driveway = new DrivewayPath(
                // Lot Topography
                this.topography,
                // Crossover -> Driveway entry
                crossover,
                // Floorplan
                this.houseModel,
                // Driveway Width
                DrivewayPath.DRIVEWAY_WIDTH_SINGLE,
                // Garage level
                this._garageSlabLevel
            );

            if (!this._driveway.valid) {
                this._driveway = null;
            }   else {
                // Driveway batters, one sorted CW, the other CCW
                // The union path will calculate the site works perimeter,
                // the subtraction path will calculate the building platform perimeter
                let unionPath, subtractionPath;

                // store all the vertices from the platform, driveway + the intersections
                this._platformVertices = this._buildPerimeter.sourceVertices.concat(
                    this._driveway.sourceVertices.filter(vertex => this._buildPerimeter.containsPointRobust(vertex))
                );
                
                // Make sure both the build perimeter and the driveway path have the same edge sorting
                if (this._buildPerimeter.testCWSorting() === this._driveway.testCWSorting()) {
                    unionPath       = Polygon.from(this._driveway.sourceVertices.concat().reverse());
                    subtractionPath = Polygon.from(this._driveway.sourceVertices.concat());
                }   else {
                    unionPath       = Polygon.from(this._driveway.sourceVertices.concat());
                    subtractionPath = Polygon.from(this._driveway.sourceVertices.concat().reverse());
                }

                // contract the driveway path by 1cm to avoid splitting the building platform into multiple polygons
                //unionPath.pad(-SiteWorksModel.WORK_STEP);
                //subtractionPath.pad(-SiteWorksModel.WORK_STEP);

                // We want normals for the driveway. These will be copied into the new perimeter
                unionPath.calculateNormals();
                subtractionPath.calculateNormals();

                /**
                 * @type {Polygon}
                 * @public
                 */
                this._unionPath = unionPath;

                /**
                 * @type {Polygon}
                 * @public
                 */
                this._subtractionPath = subtractionPath;

                // Calculate the new build platform
                const {intersections: intersections, polygon: union} = this._buildPerimeter.union(subtractionPath);

                // Set new values
                this._buildPlatform = union;
                this._platformVertices.push(...intersections);

                // Update the build perimeter
                this._buildPerimeter = this._buildPerimeter.union(unionPath).polygon;
            }
        }   else {
            this._driveway = null;
        }
    }

    /**
     * @private
     * @TODO: move this to the SitePiering class
     */
    calculatePiering() {
        /**
         * @type {Polygon}
         */
        let pierPerimeter = null;

        if (this._topography.developerFill.valid) {
            pierPerimeter = this._topography.developerFill.perimeter;

            // ensure the fill has enough depth for piering
            if (this._topography.developerFill.height < SitePiering.PIER_THRESHOLD) {
                return;
            }

            if (!pierPerimeter.testCWSorting()) {
                pierPerimeter = Polygon.from(pierPerimeter.sourceVertices.concat().reverse());
            }
        }   else
        if (this._pierPerimeter && this._pierPerimeter.sourceVertices.length) {
            // @TODO @TEMP: we should use the convex hull after we fix its bugs / the bugs with the cut line processing in the pier perimeter
            // The pier perimeter isn't a fully built polygon. Create one to use for clipping the house & garage boundaries
            pierPerimeter = Polygon.from(this._pierPerimeter.sourceVertices).convexHull;
        }

        // we must have a valid pier perimeter to calculate the piering
        if (!pierPerimeter) {
            return;
        }

        console.log('piering. with perimeter', pierPerimeter.sourceVertices.map(v=>v.toString()));

        /**
         * @type {SitePiering}
         * @private
         */
        this._sitePiering = new SitePiering(
            this.houseModel,
            pierPerimeter,
            Math.abs(this._cutFillResult.level-this._cutFillResult.low)
        );

        const clipPerimeter = pierPerimeter;

        // transform the house points and apply the clipping.
        const globalTransform = this.houseModel.sitingGlobalTransform;
        const localTransform  = this.houseModel.sitingLocalTransform;

        // To determine the house areas that need piering (house, garage, porch, alfresco), we perform the following steps:
        //
        // 1. Perform a 'walk sort' on the metadata house boundary / metadata garage boundary
        // 2. Transform the points from the house local space to the siting global space (same space as the pier perimeter)
        // 3. Clip the current structure (house/garage/porch/alfresco) with the calculated pier perimeter
        const pierAreas = this.houseModel.getMetaHouseAreas().map(area =>
            // From each area, create a sorted polygon in the global coordinate system that we then clip
            Polygon.from(
                Geom.walkSortPoints(area.edges).map(
                    point => globalTransform.apply(point)
                )
            ).clipConvex(clipPerimeter)
        )
        .filter(clippedArea => clippedArea !== null);

        console.log('piering.original areas ', this.houseModel.getMetaHouseAreas().map(area =>
            // From each area, create a sorted polygon in the global coordinate system that we then clip
            Polygon.from(
                Geom.walkSortPoints(area.edges).map(
                    point => globalTransform.apply(point)
                )
            )
        ));

        // We now transform the house/garage areas back to their local house space, as as in this space
        // the walls are aligned to the 0x / 0y axes, which means we will align the piers with the slab contours
        // another benefit is that we will have smaller bounding boxes to work within

        /**
         * Determine the bounding box that will contain all the pier areas
         * @ALTERNATIVE: create a polygon containing the points of all the house areas and calculate its bounding box
         * @type {Rectangle}
         */
        const boundingBox = pierAreas.reduce(
            /**
             * @param boundingBox {Rectangle}
             * @param area {Polygon}
             * @return {Rectangle}
             */
            (boundingBox, area) => {
                const areaBoundingBox = Polygon.from(
                    area.sourceVertices.map(point => localTransform.apply(point))
                ).externalBoundingBox;

                return boundingBox ? boundingBox.enlarge(areaBoundingBox) : areaBoundingBox;
            },  null
        );

        console.log('piering. boundingBox ', boundingBox);

        // function that indicates if the point is in a pierable area
        const inPierableArea = (point) => (pierAreas.find(area => area.containsPointRobust(point)) !== undefined);

        // @TODO @TEMP: move this
        const withinDistance = (point) => (this._sitePiering.pierLocations.find(pier => Geom.pointDistance(pier, point) <= SitePiering.SINGLE_STOREY_INTERNAL) === undefined);

        // If we have a piering bounding box and and it can fit at least one pier, then we run our piering algorithm
        if (boundingBox && boundingBox.width > SitePiering.PIER_RADIUS*2 && boundingBox.height > SitePiering.PIER_RADIUS*2) {
            // todo this._pierPerimeter.sourceVertices = boundingBox.vertices.map(
            //     p => globalTransform.apply(p)
            // );

            // deflate the bounding box a bit -> we want the piers to fit within
            boundingBox.pad(-SitePiering.PIER_RADIUS, -SitePiering.PIER_RADIUS);

            const position = new Point();

            // navigate the house grid and add piers where needed
            for (position.x=boundingBox.left; position.x<=boundingBox.right;) {
                let columnPiered=false;

                for (position.y=boundingBox.top; position.y<=boundingBox.bottom; ) {
                    const point = globalTransform.apply(position);

                    if (inPierableArea(point) && withinDistance(point)) {
                        // add a pier to this position
                        this._sitePiering.pierLocations.push(point);
                        columnPiered = true;

                        position.y += SitePiering.SINGLE_STOREY_INTERNAL;
                    }   else {
                        position.y += SiteWorksModel.WORK_STEP/2;
                    }
                }

                // position.x += columnPiered ? SitePiering.SINGLE_STOREY_INTERNAL : SiteWorksModel.WORK_STEP/2;
                position.x += SiteWorksModel.WORK_STEP/2;
            }

            //
            console.log('added piers: ', this._sitePiering.pierLocations);
        }
    }
}