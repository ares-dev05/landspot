import Geom from '../../../../utils/Geom';


export default class RetainingWall {

    /**
     * @return {number} height threshold for when walls are needed
     * @TODO @TEMP -> setting this to 3m for Henley Demo
     * @constructor
     */
    static get THRESHOLD() { return 0.3 * 10; }

    /**
     * @return {number} height threshold if the building platform edge is on the boundary
     * @constructor
     */
    static get BOUNDARY_THRESHOLD() { return 0.2; }

    /**
     * @return {number} wall beam thickness, in meters
     * @constructor
     */
    static get THICKNESS() { return 0.1; }

    /**
     * @return {number} minimum wall setback from the boundary, in meters
     * @constructor
     */
    static get SETBACK() { return 0.1; }

    /**
     * @return {number} full minimum width, wood beam and setback included
     * @constructor
     */
    static get MINIMUM_WIDTH() { return RetainingWall.THICKNESS + RetainingWall.SETBACK; }

    /**
     * @TODO @TEMP -> setting this to 0 for Henley Demo
     * @return {number} how much the wall is inset into the building platform
     * @constructor
     */
    static get PLATFORM_INSET() { return 0; } // RetainingWall.THICKNESS + RetainingWall.SETBACK; }

    /**
     * @return {number} height step in meters. represents height of a wood beam used in the wall construction
     * @constructor
     */
    static get HEIGHT_STEP() { return 0.2; }

    /**
     * @return {number} Retaining walls should have their lengths be multiples of this
     * @constructor
     */
    static get LENGTH_STEP() { return 2.4; }

    /**
     * @return {number}
     * @constructor
     */
    static get BEAM_HEIGHT() { return 0.2; }

    /**
     * @return {number}
     * @constructor
     */
    static get BEAM_LENGTH() { return 2.4; }

    /**
     * @param edge {Segment}
     * @param start {number}
     * @param maxHeight {number}
     * @param offset {number}
     * @param bottom {number}
     */
    constructor(edge, start, maxHeight, offset, bottom) {
        /**
         * Edge of the building platform that this wall retains
         * @type {Segment}
         */
        this._edge = edge;

        /**
         * Start position on its building platform edge, in meters, measured from edge.a
         * @type {number}
         */
        this._start = start;

        /**
         * End position on its building platform edge, in meters, measured from edge.a
         * @type {number}
         */
        this._end = start;

        /**
         * Inner (i.e. face visible from the house) start point for the retaining wall, in 2D space
         * @type {Point}
         * @private
         */
        this._innerStart = null;

        /**
         * Inner (i.e. face visible from the house) start point for the retaining wall, in 2D space
         * @type {Point}
         * @private
         */
        this._innerEnd = null;

        /**
         * Outer (i.e. face visible from the boundary) start point for the retaining wall, in 2D space
         * @type {Point}
         * @private
         */
        this._outerStart = null;

        /**
         * Outer (i.e. face visible from the boundary) end point for the retaining wall, in 2D space
         * @type {Point}
         * @private
         */
        this._outerEnd = null;

        /**
         * @type {number}
         * @private
         */
        this._maxHeight = maxHeight;

        /**
         * Inwards offset towards the building, perpendicular on the edge.
         * @type {number}
         * @private
         */
        this._offset = offset;

        /**
         * @type {number} Wall bottom, in the Z coordinate.
         * @private
         */
        this._bottom = bottom;

        /**
         * @type {number}
         * @private
         */
        this._height = maxHeight;

        /// Wall Configuration Parameters

        /**
         * Wall thickness, in meters. Represents the width of a wooden beam used in the wall construction
         * @type {number}
         */
        this._thickness = RetainingWall.THICKNESS;

        /**
         * Minimum wall setback from the boundary
         * @type {number}
         */
        this._setback = RetainingWall.THICKNESS;

        /**
         * Height step, in meters. Indicates the height of a wooden beam used in the wall construction
         * @type {number}
         */
        this._heightStep = RetainingWall.HEIGHT_STEP;

        /**
         * Length step, in meters. Indicates the length of a wooden beam used in the wall construction
         * @type {number}
         */
        this._lengthStep = RetainingWall.LENGTH_STEP;
    }

    /**
     * @return {Segment}
     */
    get edge() { return this._edge; }

    /**
     * @param v {Segment}
     */
    set edge(v) { this._edge=v; }

    /**
     * @return {number}
     */
    get start() { return this._start; }

    /**
     * @param v {number}
     */
    set start(v) { this._start = v; }

    /**
     * @return {number}
     */
    get end() { return this._end; }

    /**
     * @param v {number}
     */
    set end(v) { this._end = v; }

    /**
     * @return {Point}
     */
    get innerStart() { return this._innerStart; }

    /**
     * @return {Point}
     */
    get innerEnd() { return this._innerEnd; }

    /**
     * @return {Point}
     */
    get outerStart() { return this._outerStart; }

    /**
     * @return {Point}
     */
    get outerEnd() { return this._outerEnd; }

    /**
     * @return {Point[]}
     */
    get vertices() { return [this._innerStart, this._outerStart, this._outerEnd, this._innerEnd]; }

    /**
     * @return {number}
     */
    get maxHeight() { return this._maxHeight; }

    /**
     * @return {number}
     */
    get height() { return this._height; }

    /**
     * @return {number}
     */
    get offset() { return this._offset; }

    /**
     * @return {number}
     */
    get bottom() { return this._bottom; }

    /**
     * @return {number}
     */
    get top() { return this._bottom + this._height; }

    /**
     * @return {number}
     */
    get thickness() { return this._thickness; }

    /**
     * @return {number}
     */
    get setback() { return this._setback; }

    /**
     * @return {number} Full wall width, in meters
     */
    get width() { return this._thickness + this._setback; }

    /**
     * @return {number}
     */
    get heightStep() { return this._heightStep; }

    /**
     * @return {number}
     */
    get lengthStep() { return this._lengthStep; }

    /**
     * @return {number}
     */
    get length() { return Math.abs(this._end - this._start); }

    /**
     * @return {number}
     */
    get surface() { return this.length * this.height; }

    /**
     * @return {number}
     */
    get beamLength() { return this.length * this.height / RetainingWall.BEAM_HEIGHT; }

    /**
     * Update the retaining wall with another provided position
     * @param heightDifference {number}
     * @param offset {number}
     * @param bottom {number}
     */
    updateWall(heightDifference, offset, bottom) {
        this._maxHeight = Math.max(this._maxHeight, heightDifference);
        this._offset    = Math.max(this._offset, offset);
        this._bottom    = Math.min(this._bottom, bottom);

        // @TODO: update wall parameters here if needed.
    }

    /**
     * @param position {number}
     */
    endWall(position) {
        this._end = position;

        // Calculate the start & end points, considering no offset
        this._innerStart = Geom.interpolatePoints(this.edge.a, this.edge.b, this.start / this.edge.length);
        this._innerEnd   = Geom.interpolatePoints(this.edge.a, this.edge.b, this.end / this.edge.length);

        // If there is an offset, apply it
        if (this._offset > 0) {
            let normal = this._edge.inNormal.clone();
            normal.normalize(this._offset);

            normal.startFromPoint(this._innerStart);
            this._innerStart.copy(normal.b);

            normal.startFromPoint(this._innerEnd);
            this._innerEnd.copy(normal.b);
        }

        // Determine the outer points
        let normal = this._edge.outNormal.clone();
        normal.normalize(this.width);

        normal.startFromPoint(this._innerStart);
        this._outerStart = normal.b.clone();

        normal.startFromPoint(this._innerEnd);
        this._outerEnd = normal.b.clone();

        // Calculate total wall height
        this._height = this._heightStep * Math.ceil(this._maxHeight / this._heightStep);
    }

    /**
     * We try to extend the current wall with a new segment. This is only done if the new wall is on the same edge,
     * it continues exactly from where the current wall ended and it has the same height as the current one.
     * @param wall {RetainingWall}
     */
    extendWall(wall) {
        // Check if the new wall is on the same edge and continues from where this one ends.
        if (this.edge === wall.edge && Geom.equal(this._end, wall.start)) {

            if (Geom.equal(this.offset, wall.offset) && Geom.equal(this.height, wall.height)) {
                // Walls can be merged successfully
                this._innerEnd = wall._innerEnd;
                this._outerEnd = wall._outerEnd;
                this._end = wall._end;

                return true;
            }   else if (!Geom.equal(this.offset, wall.offset)){
                // try to connect the walls seamlessly
                if (this.offset < wall.offset) {
                    // update the start of the 2nd wall, so it has a smaller offset
                    wall._innerStart = this._innerEnd;
                    wall._outerStart = this._outerEnd;
                }   else {
                    // update the end of this wall, so it has a smaller offset
                    this._innerEnd = wall._innerStart;
                    this._outerEnd = wall._outerStart;
                }
            }
        }

        return false;
    }
}