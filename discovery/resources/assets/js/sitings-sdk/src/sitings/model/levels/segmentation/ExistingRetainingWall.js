import ModelEvent from '../../../events/ModelEvent';
import RetainingWall from '../works/RetainingWall';
import LevelPointModel from '../LevelPointModel';
import Point from '../../../../geom/Point';
import Geom from '../../../../utils/Geom';
import ParallelEasement from '../../easement/ParallelEasement';
import InnerSegment from '../../easement/InnerSegment';
import EasementEvent from '../../../events/EasementEvent';
import Segment from '../../../../geom/Segment';
import Quadrilateral from '../../../../geom/Quadrilateral';
import InnerEdgeModel from '../../easement/InnerEdgeModel';
import SegmentationPath from './SegmentationPath';
import EventBase from '../../../../events/EventBase';
import LotPointModel from '../../lot/LotPointModel';
import RestoreDispatcher from '../../../../events/RestoreDispatcher';


export default class ExistingRetainingWall extends InnerEdgeModel {

    // Default width to use for existing retaining walls
    static get DEFAULT_WIDTH()       { return RetainingWall.MINIMUM_WIDTH; }

    // highlight modes, for UI / UX experience
    static get HIGHLIGHT_NONE()      { return 0; }
    static get HIGHLIGHT_FULL()      { return 1; }
    static get HIGHLIGHT_START()     { return 2; }
    static get HIGHLIGHT_END()       { return 3; }
    static get HIGHLIGHT_START_IN()  { return 4; }
    static get HIGHLIGHT_START_OUT() { return 5; }
    static get HIGHLIGHT_END_IN()    { return 6; }
    static get HIGHLIGHT_END_OUT()   { return 7; }


    /**
     * @param boundary {LotEdgeModel} Boundary that we attach this retaining wall to
     * @param boundingPath {LotPathModel}
     */
    constructor(boundary, boundingPath) {
        super(boundary, boundingPath, 0);

        /**
         * @type {InnerSegment} wall face that is aligned with the batter line created by this retaining wall
         * @protected
         */
        this._wallBatterSide = null;

        /**
         * @UNUSED
         * @type {InnerSegment} wall face that is visible from the outside.
         * @private
         */
        this._wallOutsideFace = null;

        /**
         * @type {number} offset from the start of the boundary towards the end
         * @private
         */
        this._startOffset = 0;

        /**
         * @type {number} offset from the end of the boundary towards the start
         * @private
         */
        this._endOffset = 0;

        /**
         * @type {number}
         * @private
         */
        this._width = ExistingRetainingWall.DEFAULT_WIDTH;

        /**
         * @type {number} Inset from the boundary towards the center of the lot, in meters
         * @private
         */
        this._inset = 0;

        /**
         * @type {number} Distance parameter override
         * @private
         */
        this._distance = 0;

        /**
         * @type {boolean} Flag that indicates if the retaining wall is placed inside or outside of the lot
         * @private
         */
        this._insideLot = true;

        /**
         * @type {LevelPointModel}
         * @private
         */
        this._startInnerLevel = new LevelPointModel(new Point());
        this._startInnerLevel.addEventListener(EventBase.CHANGE, this.recalculate, this);

        /**
         * @type {LevelPointModel}
         * @private
         */
        this._startOuterLevel = new LevelPointModel(new Point());
        this._startOuterLevel.addEventListener(EventBase.CHANGE, this.recalculate, this);

        /**
         * @type {LevelPointModel}
         * @private
         */
        this._endInnerLevel = new LevelPointModel(new Point());
        this._endInnerLevel.addEventListener(EventBase.CHANGE, this.recalculate, this);

        /**
         * @type {LevelPointModel}
         * @private
         */
        this._endOuterLevel = new LevelPointModel(new Point());
        this._endOuterLevel.addEventListener(EventBase.CHANGE, this.recalculate, this);

        /**
         * @type {WallPortion[]}
         * @private
         */
        this._wallPortions = [];

        /**
         * @type {LevelPointModel[]} Contains levels for all 4 corners of the lot, whether they are set and used or not
         * @private
         */
        this._cornerLevels = [this._startInnerLevel, this._startOuterLevel, this._endInnerLevel, this._endOuterLevel];

        /**
         * @type {LevelPointModel[]} List of height level points that are used in the surface interpolation
         * @private
         */
        this._levels = [];

        /**
         * @type {{top: number, bottom: number, vertices: Point[]}[]} Coordinates for the 4 corners of this wall
         * @private
         */
        this._segments = [];

        /**
         * @type {Point[]}
         */
        this._corners = [];

        /**
         * @type {SegmentationPath}
         * @private
         */
        this._segmentationPath = null;

        /**
         * @type {number} Property that indicates which part of the retaining wall is highlighted
         * @private
         */
        this._highlight = 0;

        /**
         * @type {Point[][]}
         * @private
         */
        this._highlightAreas = [];

        // perform the initial parameters calculation
        this.recalculate();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Getters / Setters
    //

    /**
     * @return {LotEdgeModel}
     */
    get boundary() { return this._reference; }

    /**
     * @return {number}
     */
    get startOffset() { return this._startOffset; }

    /**
     * @param value {number}
     */
    set startOffset(value) {
        // only allow values between 0 and end
        if (value !== this._startOffset && value >= 0 && (!this._boundary || value + this._endOffset <= this._boundary.length)) {
            this._startOffset = value;
            this.recalculate();
        }
    }

    /**
     * @return {number}
     */
    get endOffset() { return this._endOffset; }

    /**
     * @param value {number}
     */
    set endOffset(value) {
        // only allow values between start and boundary.length
        if (value !== this._endOffset && value >= 0 && (!this._boundary || value + this._startOffset <= this._boundary.length)) {
            this._endOffset = value;
            this.recalculate();
        }
    }

    /**
     * @return {number}
     */
    get width() { return this._width; }

    /**
     * @param value {number}
     */
    set width(value) {
        if (value !== this._width && value > Geom.CLOSE && value < 1) {
            this._width = value;
            this.recalculate();
        }
    }

    /**
     * @return {number}
     */
    get inset() { return this._inset; }

    /**
     * @param value {number}
     */
    set inset(value) {
        // We can only assign an inset if the retaining wall is placed inside the lot
        if (value !== this._inset && this._inset >= 0 && this._insideLot) {
            this._inset = value;
            this.recalculate();
        }
    }

    /**
     * @param v {number}
     */
    set distance(v) {
        this._distance = v;
    }

    /**
     * @return {number}
     */
    get distance() {
        return this._distance;
    }


    /**
     * @return {boolean}
     */
    get insideLot() { return this._insideLot; }

    /**
     * @param value {boolean}
     */
    set insideLot(value) {
        if (value !== this._insideLot) {
            this._insideLot = value;
            this.recalculate();
        }
    }

    /**
     * @return {number}
     */
    get highlight() { return this._highlight; }

    /**
     * @return {Point[]}
     */
    get highlightArea() {
        if (this._highlightAreas && this._highlightAreas[this._highlight] && this._highlightAreas[this._highlight].length) {
            return this._highlightAreas[this._highlight];
        }
        return [];
    }

    /**
     * @param value {number}
     */
    set highlight(value) { this._highlight = value; this.onChange(); }

    /**
     * @return {LevelPointModel[]}
     */
    get levels() { return this._levels; }

    /**
     * @return {LevelPointModel[]}
     */
    get setLevels() {
        return this._cornerLevels.concat(this.wallPortionLevels).filter(level => level.height !== 0);
    }

    /**
     * @return {boolean}
     */
    get valid() { return this.setLevels.length >= 2; }

    /**
     * @return {LevelPointModel}
     */
    get startInnerLevel() { return this._startInnerLevel; }

    /**
     * @return {LevelPointModel}
     */
    get startOuterLevel() { return this._startOuterLevel; }

    /**
     * @return {LevelPointModel}
     */
    get endInnerLevel() { return this._endInnerLevel; }

    /**
     * @return {LevelPointModel}
     */
    get endOuterLevel() { return this._endOuterLevel; }

    /**
     * @return {WallPortion[]}
     */
    get wallPortions() { return this._wallPortions; }

    /**
     * @return {(WallBoundPoint|LevelPointModel)[]}
     */
    get wallPortionLevels() { return this._wallPortions.map(wall => [wall.innerLevel, wall.outerLevel]).flat(); }

    /**
     * @return {WallBoundPoint[]}
     */
    get wallPortionInnerLevels() { return this._wallPortions.map(wall => wall.innerLevel); }

    /**
     * @return {LevelPointModel[]}
     */
    get wallPortionOuterLevels() { return this._wallPortions.map(wall => wall.outerLevel); }

    /**
     * @return {WallPortion|null}
     */
    get lastWallPortion() { return this._wallPortions.length > 0 ? this._wallPortions[this._wallPortions.length-1] : null; }

    /**
     * @return {boolean} Indicates if the wall retains a cut towards the outside of the lot (i.e. outside < inside)
     */
    get retainsCut() {
        return this._startOuterLevel.height < this._startInnerLevel.height || this._endOuterLevel.height < this._endInnerLevel.height;
    }

    /**
     * @return {boolean} Indicates if the wall retains a fill towards the outside of the lot (i.e. outside > inside)
     */
    get retainsFill() {
        return !this.retainsCut;
    }

    /**
     * @return {number}
     */
    get top() {
        return Math.max(...this.setLevels.map(level => level.height));
    }

    /**
     * @return {number}
     */
    get bottom() {
        return Math.min(...this.setLevels.map(level => level.height));
    }

    /**
     * @return {Point[]}
     */
    get corners() { return this._corners; }

    /**
     * @return {{top: number, bottom: number, vertices: Point[]}[]}
     */
    get segments() { return this._segments; }

    /**
     * @return {SegmentationPath}
     */
    get segmentationPath() { return this._segmentationPath; }

    /**
     * @return {InnerSegment}
     */
    get batterSegment() { return this._wallBatterSide; }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Wall Portions
    //

    addWallPortion() {
        if (!this._wallBatterSide) {
            return;
        }

        // Place the new inner level at the centre of the retaining wall. It can then be dragged to any location
        const wallPortion = new WallPortion(this, 0.5);

        wallPortion.addEventListener(EventBase.CHANGE, this.recalculate, this);
        wallPortion.addEventListener(ModelEvent.DELETE, this.wallPortionDelete, this);

        this._wallPortions.push(wallPortion);

        // update wall data after an inner point is added
        this.onAdded();
        this.recalculate();
    }

    /**
     * @param event {ModelEvent}
     */
    wallPortionDelete(event) {
        const wallPortion = event.model;

        const index = this._wallPortions.indexOf(wallPortion);
        if (index >= 0) {
            wallPortion.removeEventListener(EventBase.CHANGE, this.recalculate, this);
            wallPortion.removeEventListener(ModelEvent.DELETE, this.wallPortionDelete, this);

            this._wallPortions.splice(index, 1);
        }

        // update wall data after an inner point is deleted
        this.recalculate();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Calculations
    //

    recalculate()
    {
        // Calculate the wall parameters first
        this.calculateParameters();
        // Intersect with the lot perimeter
        this.applyBoundaryExclusions();
        // Apply start/end offsets
        this.applyOffsets();
        // build the exclusion parameters
        this.buildExclusionParams();

        this.dispatchEvent(new EasementEvent(EasementEvent.RECALCULATE, this));
        // this.onChange();
    }

    // called once the inner path model
    exclusionsSet()
    {
        this.calculateLevels();
        this.calculateVertices();
        this.calculateSegmentationPath();

        super.exclusionsSet();
    }

    /**
     * Calculate the initial wall parameters, without offsets applied.
     * If the wall is inset from the boundary, we extend its sides outside of the lot so that we can
     * then intersect it with the lot boundaries
     */
    calculateParameters() {
        const boundary = this._reference;

        // Initialize the retaining wall pieces
        this._wallBatterSide  = this._wallBatterSide || new InnerSegment(new Point(), new Point());
        // this._wallOutsideFace = this._wallOutsideFace || new InnerSegment(new Point(), new Point());
        this._pieces = [this._wallBatterSide];

        // Set the distance from the boundary
        this._distance = this._inset + (this.insideLot && this.retainsCut ? this._width : 0);

        let wallSegment = boundary;

        // If the retaining wall is set on the boundary, then we just set it to be identical to it
        if (this._distance > 0) {
            /**
             * @type {Segment}
             */
            const inNormal = this._reference.inNormal.clone().normalize(this.distance);

            // calculate the initial wall position, translated from the boundary
            wallSegment = new Segment(
                inNormal.startFromPoint(boundary.a).b.clone(),
                inNormal.startFromPoint(boundary.b).b.clone()
            ).normalize(ParallelEasement.FAR_LENGTH/2).normalizeStart(ParallelEasement.FAR_LENGTH);
        }

        // Copy the wall segment coordinates into the ease
        this._wallBatterSide.farA.copy(wallSegment.a);
        this._wallBatterSide.farB.copy(wallSegment.b);
        this._wallBatterSide.a.copy(wallSegment.a);
        this._wallBatterSide.b.copy(wallSegment.b);
    }

    applyBoundaryExclusions() {
        // if the wall is aligned with the boundary, we don't need to apply any exclusions
        if (this._distance > 0) {
            super.applyBoundaryExclusions();
        }
    }

    /**
     * We get to this point after the wall has been intersected with the lot perimeter
     */
    applyOffsets() {
        if (this._startOffset && this._startOffset < this._wallBatterSide.length) {
            // this also fixes the far point of the easement to the offset start
            this._wallBatterSide.normalizeStart(this._wallBatterSide.length - this._startOffset);
        }

        if (this._endOffset && this._endOffset < this._wallBatterSide.length) {
            // this also fixes the end point of the easement to the offset end
            this._wallBatterSide.normalize(this._wallBatterSide.length - this._endOffset);
        }
    }

    /**
     * Build the exclusion parameters for this retaining wall. The exclusion area goes to the outside of the lot
     * and is fixed at the start/end if they are offset. If no offsets are set, the exclusion area extends up to 5k
     * on the wall line, equally in both directions
     */
    buildExclusionParams()
    {
        // If the wall wasn't constructed, it is an exterior one or aligned with the boundary, no exclusions apply
        if (!this._wallBatterSide || this._distance === 0) {
            this._exclusionArea = null;
            this._excludingSegments = [];
            return;
        }

        this._exclusionArea = Quadrilateral.getLineNormalExclusionArea(
            this._wallBatterSide.farA, this._wallBatterSide.farB,
            this._reference.outNormal,
            5000,
            this._startOffset === 0, this._endOffset === 0
        );

        this._excludingSegments = [
            new Segment( this._wallBatterSide.a.clone(), this._wallBatterSide.b.clone() )
        ];
    }

    /**
     * Calculate the positions for the level points
     */
    calculateLevels() {
        // make sure the wall portions are in a correct position
        this._wallPortions.forEach(wallPortion => wallPortion.snapToWall());

        // sort the levels by their position in the wall, from start to end
        const sortedWallPortions = this._wallPortions.concat().sort(
            (a, b) => a.wallPosition - b.wallPosition
        );
        const sortedInnerLevels = sortedWallPortions.map(a => a.innerLevel);
        const sortedOuterLevels = sortedWallPortions.map(a => a.outerLevel);

        // The inner levels are always added
        this._levels = [this._startInnerLevel, ...sortedInnerLevels, this._endInnerLevel];

        // The outer levels are only added if the batter is not aligned with the boundary
        if (this.distance > 0) {
            this._levels.push(this._startOuterLevel, ...sortedOuterLevels, this._endOuterLevel);
        }

        // set the positions for the levels on the batter line
        this._startInnerLevel.position.copy(this._wallBatterSide.a);
        this._startOuterLevel.position.copy(this._wallBatterSide.a);

        this._endInnerLevel.position.copy(this._wallBatterSide.b);
        this._endOuterLevel.position.copy(this._wallBatterSide.b);

        // Set inclusion directions for the points. When creating the surface interpolator and assigning level points
        // to the sub-surfaces, these levels will only be added if the direction that each level 'points to' passes
        // through the surface perimeter. Geometrically, this means that the direction intersects the perimeter
        // an even number of times
        const innerDirection = this._reference. inNormal.clone().normalize(1e4);
        const outerDirection = this._reference.outNormal.clone().normalize(1e4);

        /**
         * @type {LevelPointModel}
         */
        let previousLevel=null;
        [this._startInnerLevel, ...sortedInnerLevels, this._endInnerLevel].forEach(
            level => {
                if (previousLevel) {
                    const direction = innerDirection.clone().startFromPoint(
                        Geom.interpolatePoints(previousLevel.position, level.position, 0.5)
                    ).normalizeStart(1e4 - Geom.CLOSE);

                    level.inclusionDirections = [direction];
                    previousLevel.inclusionDirections.push(direction);
                }   else {
                    level.inclusionDirections = [];
                }

                previousLevel = level;
            }
        );

        // Set the outer inclusion directions.
        previousLevel = null;
        [this._startOuterLevel, ...sortedOuterLevels, this._endOuterLevel].forEach(
            level => {
                if (previousLevel) {
                    const direction = outerDirection.clone().startFromPoint(
                        Geom.interpolatePoints(previousLevel.position, level.position, 0.5)
                    ).normalizeStart(1e4 - Geom.CLOSE);

                    level.inclusionDirections = [direction];
                    previousLevel.inclusionDirections.push(direction);
                }   else {
                    level.inclusionDirections = [];
                }

                previousLevel = level;
            }
        );

        this._levels = this._levels.filter(level => level.height !== 0);
    }

    /**
     * @param excludeList {LevelPointModel[]}
     */
    excludeLevels(excludeList) {
        this._levels = this._levels.filter(level => excludeList.indexOf(level) < 0);
    }

    /**
     * Calculate the 2D wall vertices required to build the 3D representation of this wall
     */
    calculateVertices() {
        // The only case in which the secondary face is to the inside of the lot, is when the wall is inside the lot
        // and it retains a fill from the outside of the lot
        const faceNormal = this.insideLot && this.retainsFill ?
            this._reference.inNormal.clone().normalize(this._width):
            this._reference.outNormal.clone().normalize(this._width);

        // Create the list of wall portions
        const pieces = [
            {k: 0, levels: [this._startInnerLevel.height, this._startOuterLevel.height].filter(level => level!==0)},
            ...this._wallPortions.concat()
                .sort((a, b) => a.wallPosition - b.wallPosition)
                .map(portion => {
                    return {
                        k: portion.wallPosition,
                        levels: [
                            portion.innerLevel.height,
                            portion.outerLevel.height
                        ].filter(level => level!==0),
                    };
                }
            ),
            {k: 1, levels: [this._endInnerLevel.height, this._endOuterLevel.height].filter(level => level!==0)},
        ];

        // define the absolute corners of the wall
        const IN_A = faceNormal.startFromPoint(this._wallBatterSide.a).b.clone(),
              IN_B = faceNormal.startFromPoint(this._wallBatterSide.b).b.clone(),
             OUT_A = this._wallBatterSide.a,
             OUT_B = this._wallBatterSide.b;

        this._segments = [];
        this._corners  = [IN_A, IN_B, OUT_B, OUT_A];

        for (let index=0; index<pieces.length-1; ++index) {
            // Pick the start and end points for this piece
            const start = pieces[index];
            const end   = pieces[index+1];

            // Make sure we have at least some levels to use for this retaining wall segment
            if (start.levels.length || end.levels.length) {
                this._segments.push({
                    a: start.k, b: end.k,
                    bottom: Math.min(...start.levels, ...end.levels),
                    top: Math.max(...start.levels, ...end.levels),
                    vertices: [
                        Geom.interpolatePoints(IN_A, IN_B, start.k),
                        Geom.interpolatePoints(IN_A, IN_B, end.k),
                        Geom.interpolatePoints(OUT_A, OUT_B, end.k),
                        Geom.interpolatePoints(OUT_A, OUT_B, start.k)
                    ]
                });
            }
        }

        // Create highlightable portions for this wall
        let startIn, startOut, endIn, endOut, cornerK = 2 * this._width / this._wallBatterSide.length;

        if (this.insideLot && this.retainsFill) {
            startOut = this._corners[3];
            endOut   = this._corners[2];
            startIn  = this._corners[0];
            endIn    = this._corners[1];
        }   else {
            startOut = this._corners[0];
            endOut   = this._corners[1];
            startIn  = this._corners[3];
            endIn    = this._corners[2];
        }

        // @TODO: -> update this
        this._highlightAreas = [];
        this._highlightAreas[ExistingRetainingWall.HIGHLIGHT_START_IN] = [
            startOut, startIn, Geom.interpolatePoints(startIn, endIn, cornerK)
        ];
        this._highlightAreas[ExistingRetainingWall.HIGHLIGHT_START_OUT] = [
            startIn, startOut, Geom.interpolatePoints(startOut, endOut, cornerK)
        ];
        this._highlightAreas[ExistingRetainingWall.HIGHLIGHT_END_IN] = [
            endOut, endIn, Geom.interpolatePoints(endIn, startIn, cornerK)
        ];
        this._highlightAreas[ExistingRetainingWall.HIGHLIGHT_END_OUT] = [
            endIn, endOut, Geom.interpolatePoints(endOut, startOut, cornerK)
        ];
    }

    /**
     * The segmentation path is the segment defined by the start and end of this retaining wall
     */
    calculateSegmentationPath() {
        if (this.distance > 0) {
            this._segmentationPath = new SegmentationPath();
            this._segmentationPath.points.push(
                this._startInnerLevel,
                // @INFO: no inner levels are needed because we have all of them on a straight line
                // ...this.wallPortionInnerLevels.sort((a, b) => a.wallPosition - b.wallPosition),
                // ...this._wallPortions.concat().sort((a, b) => a.wallPosition - b.wallPosition),
                this._endInnerLevel
            );
            this._segmentationPath.closed = true;
        }   else {
            this._segmentationPath = null;
        }
    }

    /**
     * @param wall {ExistingRetainingWall}
     */
    joinNextWall(wall) {
        // Can only join if both walls have a segmentation path, and the current wall ends where the next one starts
        if (this._segmentationPath && wall._segmentationPath &&
            Geom.pointsEqual(this._segmentationPath.lastPoint.position, wall._segmentationPath.points[0].position)) {

            // extend the current segmentation path with the secondary wall's path, minus the start point
            this._segmentationPath.points.push(...wall._segmentationPath.points.slice(1));

            // remove start levels from the secondary wall
            wall.excludeLevels([wall._startInnerLevel, wall._startOuterLevel]);

            // remove the secondary wall's segmentation path, as it's been included in this wall's path
            wall._segmentationPath = null;

            return true;
        }   else if (Geom.pointsEqual(this._wallBatterSide.b, wall._wallBatterSide.a)) {
            // remove inner start level from the secondary wall.
            // the only case when the start outer level would have to be removed is if both walls had a distance > 0
            // which will never happen in this block - the previous condition would deal with that case
            wall.excludeLevels([wall._startInnerLevel]);
        }

        return false;
    }

    deleteWall() {
        if (this._startInnerLevel) {
            this._startInnerLevel.removeEventListener(EventBase.CHANGE, this.recalculate, this);
            this._startInnerLevel = null;
        }
        if (this._startOuterLevel) {
            this._startOuterLevel.removeEventListener(EventBase.CHANGE, this.recalculate, this);
            this._startOuterLevel = null;
        }
        if (this._endInnerLevel) {
            this._endInnerLevel.removeEventListener(EventBase.CHANGE, this.recalculate, this);
            this._endInnerLevel = null;
        }
        if (this._endOuterLevel) {
            this._endOuterLevel.removeEventListener(EventBase.CHANGE, this.recalculate, this);
            this._endOuterLevel = null;
        }

        // Delete existing wall portions
        if (this._wallPortions) {
            this._wallPortions.forEach(
                wallPortion => {
                    wallPortion.removeEventListener(EventBase.CHANGE, this.recalculate, this);
                    wallPortion.removeEventListener(ModelEvent.DELETE, this.wallPortionDelete, this);
                    wallPortion.deletePoint();
                }
            );

            this._wallPortions = null;
        }

        this.deleteEdge();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IRestorable implementation

    /**
     * @return {{}}
     */
    recordState ()
    {
        const state = super.recordState();

        state.startOffset     = this._startOffset;
        state.endOffset       = this._endOffset;
        state.width           = this._width;
        state.inset           = this._inset;
        state.distance        = this._distance;
        state.insideLot       = this._insideLot;

        state.startInnerLevel = this._startInnerLevel.height;
        state.startOuterLevel = this._startOuterLevel.height;
        state.endInnerLevel   = this._endInnerLevel.height;
        state.endOuterLevel   = this._endOuterLevel.height;

        state.wallPortions    = this._wallPortions.map(level => level.recordState());

        return state;
    }

    /**
     * restores this object to the state represented by the 'state' data structure
     * @param state {{}} the state to be restored
     */
    restoreState(state)
    {
        // restore properties
        this._startOffset = state.startOffset;
        this._endOffset   = state.endOffset;
        this._width       = state.width;
        this._inset       = state.inset;
        this._distance    = state.distance;
        this._insideLot   = state.insideLot;

        this._startInnerLevel._height = state.startInnerLevel;
        this._startOuterLevel._height = state.startOuterLevel;
        this._endInnerLevel._height   = state.endInnerLevel;
        this._endOuterLevel._height   = state.endOuterLevel;

        // Delete existing wall portions
        if (this._wallPortions) {
            this._wallPortions.forEach(
                wallPortion => {
                    wallPortion.removeEventListener(EventBase.CHANGE, this.recalculate, this);
                    wallPortion.removeEventListener(ModelEvent.DELETE, this.wallPortionDelete, this);
                    wallPortion.deletePoint();
                }
            );
        }

        if (state.wallPortions) {
            state.wallPortions.forEach(
                state => {
                    const wallPortion = new WallPortion(this, 0.5);

                    wallPortion.restoreState(state);
                    wallPortion.addEventListener(EventBase.CHANGE, this.recalculate, this);
                    wallPortion.addEventListener(ModelEvent.DELETE, this.wallPortionDelete, this);

                    this._wallPortions.push(wallPortion);
                    this.onAdded();
                }
            );
        }

        super.restoreState(state);
    }
}

class WallPortion extends RestoreDispatcher {

    constructor(wall, wallPosition) {
        super();

        /**
         * @type {WallBoundPoint}
         * @private
         */
        this._innerLevel = new WallBoundPoint(wall, wallPosition);
        this._innerLevel.addEventListener(EventBase.CHANGE, this.onChange, this);
        this._innerLevel.addEventListener(ModelEvent.DELETE, this.deletePoint, this);

        /**
         * @type {LevelPointModel}
         * @private
         */
        this._outerLevel = new LevelPointModel(this._innerLevel.position, 0); // this._innerLevel.height);
        this._outerLevel.addEventListener(EventBase.CHANGE, this.onChange, this);
    }

    /**
     * @return {WallBoundPoint}
     */
    get innerLevel() { return this._innerLevel; }

    /**
     * @return {LevelPointModel}
     */
    get outerLevel() { return this._outerLevel; }

    /**
     * @return {number}
     */
    get wallPosition() { return this._innerLevel.wallPosition; }

    /**
     * Snap this wall portion to the wall it's attached to
     */
    snapToWall() {
        if (this._innerLevel) {
            this._innerLevel.removeEventListener(EventBase.CHANGE, this.onChange, this);
            this._innerLevel.position.onChange();
            this._innerLevel.addEventListener(EventBase.CHANGE, this.onChange, this);
        }
    }

    /**
     * Deletes this wall portion
     */
    deletePoint() {
        if (this._innerLevel) {
            this._innerLevel.removeEventListener(EventBase.CHANGE, this.onChange, this);
            this._innerLevel.removeEventListener(ModelEvent.DELETE, this.deletePoint, this);
            this._innerLevel.deletePoint();
            this._innerLevel = null;
        }

        if (this._outerLevel) {
            this._outerLevel.removeEventListener(EventBase.CHANGE, this.onChange, this);
            this._outerLevel.deletePoint();
            this._outerLevel = null;
        }

        this.onDelete();
    }

    /**
     * @return {{outer: number, inner: {position: {x: number, y: number}, height: number}}}
     */
    recordState() {
        return {
            inner: this._innerLevel.recordState(),
            outer: this._outerLevel.height
        };
    }

    /**
     * @param state {{outer: number, inner: {position: {x: number, y: number}, height: number}}}
     */
    restoreState(state) {
        this.innerLevel.restoreState(state.inner);
        this.outerLevel.height = state.outer;
    }
}

class WallBoundPoint extends LevelPointModel {

    /**
     * @param wall {ExistingRetainingWall}
     * @param wallPosition {number}
     */
    constructor(wall, wallPosition) {
        super(
            new LotPointModel().copy(Geom.interpolatePoints(wall._wallBatterSide.a, wall._wallBatterSide.b, wallPosition)),
            0,// Geom.getWeighedValue(wall.startInnerLevel.height, wall.endInnerLevel.height, wallPosition)
        );

        /**
         * @type {ExistingRetainingWall}
         * @private
         */
        this._wall = wall;

        /**
         * @type {number}
         * @private
         */
        this._wallPosition = wallPosition;
    }

    /**
     * @return {number}
     */
    get wallPosition() { return this._wallPosition; }

    /**
     * @protected
     * @override
     */
    positionChanged() {
        this.snapToWall();
        super.positionChanged();
    }

    /**
     * @public
     */
    snapToWall() {
        // Make sure this point is always on the retaining wall
        const projection = this._wall._wallBatterSide.getIntersectionPoint(this.position.x, this.position.y);
        this.position.moveTo(projection.x, projection.y, false);

        // calculate the new wall position
        this._wallPosition = Geom.getPointPosition(this._wall.batterSegment.a, this._wall.batterSegment.b, this.position);
    }

    /**
     * @param e {EventBase}
     */
    positionedMoveComplete(e) {
        // Update position parameters
        this.positionChanged();

        // dispatch events
        super.positionedMoveComplete(e);
        this.onChange();
    }
}