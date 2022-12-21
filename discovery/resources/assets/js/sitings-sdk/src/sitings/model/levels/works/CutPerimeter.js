import Polygon from '../../../../geom/Polygon';
import Geom from '../../../../utils/Geom';
import SiteWorksModel from './SiteWorksModel';
import Segment from '../../../../geom/Segment';

export default class CutPerimeter extends Polygon {

    /**
     * @param topography {LotTopographyModel}
     * @param platformLevel {number}
     * @param buildPerimeter {Polygon}
     * @param isCut {boolean}
     * @param processCutLines {boolean}
     */
    constructor(topography, platformLevel, buildPerimeter, isCut=true, processCutLines=true) {
        super([], []);

        /**
         * @type {LotTopographyModel}
         * @private
         */
        this._topography = topography;

        /**
         * @type {number}
         * @private
         */
        this._targetLevel = platformLevel;

        /**
         * @type {Polygon}
         * @private
         */
        this._buildPerimeter = buildPerimeter;

        /**
         * Flag that indicates if we are building a cut (true) or a fill (false) perimeter
         *
         * @type {boolean}
         * @private
         */
        this._isCut = isCut;

        /**
         * @type {boolean}
         * @private
         */
        this._processCutLines = processCutLines;

        /**
         * @type {number[]} Height levels for all the vertices in this polygon
         * @private
         */
        this._levels = [];

        /**
         * @type {Point[][]} All the cut lines
         * @private
         */
        this._cutLines = [];

        /**
         * @type {null|Point}
         * @private
         */
        this._previousPoint = null;

        /**
         * @type {number}
         * @private
         */
        this._previousLevel = 0;

        /**
         * @type {boolean}
         * @private
         */
        this._outsideTargetArea = !isCut;

        /**
         * @type {Point[]}
         * @private
         */
        this._cutEntries = [];
    }

    /**
     * @return {number[]}
     */
    get levels() { return this._levels; }

    /**
     * @return {Point[][]}
     */
    get cutLines() { return this._cutLines; }

    /**
     * @return {boolean}
     */
    get isCut() { return this._isCut; }

    /**
     * @return {boolean}
     */
    get isFill() { return !this._isCut; }

    /**
     * @param level
     * @return {boolean}
     * @private
     */
    underThreshold(level) {
        return this.isCut ? level < this._targetLevel : level > this._targetLevel;
    }

    /**
     * @param level
     * @return {boolean}
     */
    underAtThreshold(level) {
        return this.isCut ? level <= this._targetLevel : level >= this._targetLevel;
    }

    /**
     * @param level
     * @return {boolean}
     * @private
     */
    overThreshold(level) {
        return !this.underThreshold(level);
    }

    /**
     * @param point {Point}
     */
    addPoint(point) {
        const level = this._topography.heightLevel(point.x, point.y);

        if (!this._previousPoint && this.underThreshold(level)) {
            // We are starting outside a target area. Flag this so we know later.
            this._outsideTargetArea = true;
        }

        // Maintain Target Area
        if (this._outsideTargetArea === false && this.overThreshold(level)) {
            // this point is part of the cut perimeter
            this._sourceVertices.push(point);
            this._levels.push(level);
        }
        // Maintain Non-Target Area
        else if (this._outsideTargetArea === true && this.underThreshold(level)) {
            // no update needed
        }
        // Transition from Cut to Fill or Fill to Cut
        else if (this._previousPoint) {
            // we are transitioning from a fill area to a cut area. Calculate the exact cut point
            const cutPoint = this._findCutPoint(this._previousPoint, point, this._previousLevel);

            if (this._outsideTargetArea) {
                // We are entering a Target Area. See if we can calculate the target line now
                if (this._cutEntries.length > 0) {
                    // calculate the full cut line here and add it
                    this._addCutLine(this._cutEntries.pop(), cutPoint);
                }   else {
                    // we started processing the perimeter in a non-target area. Store this cut point to process it at the end
                    this._cutEntries.push(cutPoint);
                }
            }   else {
                // We are entering a non-target Area. Store the point so we can use it to calculate the cut line later
                this._cutEntries.push(cutPoint);
            }

            // Add the cut point to the perimeter
            this._sourceVertices.push(cutPoint);
            this._levels.push(this._targetLevel);

            // update flag
            this._outsideTargetArea = this.underThreshold(level);
        }

        /**
         * @type {Point}
         * @private
         */
        this._previousPoint = point;
        this._previousLevel = level;
    }

    complete() {
        // If we have two cut entries at the end, join then with a cut line
        if (this._cutEntries.length===2) {
            this._addCutLine(this._cutEntries[1], this._cutEntries[0]);
            this._cutEntries = [];
        }
    }

    /**
     * @param A {Point}
     * @param B {Point}
     * @param aLevel {number}
     * @return {Point}
     *
     * @private
     */
    _findCutPoint(A, B, aLevel) {
        // Binary search, 8 steps -> 1mm accuracy when dist(A, B)=0.2m
        let bestPoint=A;
        for (let step=0, best=0, coefficient=0.5; step<8; ++step, coefficient /= 2) {
            const current = best + coefficient;
            const point   = Geom.interpolatePoints(A, B, current);
            const level   = this._topography.heightLevel(point.x, point.y);

            if ((this.underThreshold(aLevel) && this.underAtThreshold(level) && (this.isCut ? level > aLevel : level < aLevel)) ||
                (this.overThreshold (aLevel) && this.overThreshold   (level) && (this.isCut ? level < aLevel : level > aLevel))) {
                best        = current;
                bestPoint   = point;
                aLevel = level;
            }
        }

        return bestPoint;
    }

    /**
     * @param A {Point}
     * @param B {Point}
     * @private
     */
    _addCutLine(A, B) {
        const cutLine = [];

        // find the number of processing steps required
        const steps = Math.ceil(Geom.log2( Geom.pointDistance(A, B) / SiteWorksModel.WORK_STEP )) - 1;

        if (steps > 0 && this._processCutLines) {
            this._processCutPiece(A, B, steps, cutLine, 4);
        }

        // add all the points along the cut line to the perimeter
        if (cutLine.length) {
            this._sourceVertices.push(...cutLine);
            this._levels.push(...Array(cutLine.length).fill(this._targetLevel));
        }

        // Add this cut line to the list
        this._cutLines.push([A, ...cutLine, B]);
    }

    /**
     * @param A {Point}
     * @param B {Point}
     * @param iterationStep {number}
     * @param cutLine {Point[]}
     * @param searchLength {number}
     * @private
     */
    _processCutPiece(A, B, iterationStep, cutLine, searchLength) {
        const mid = Geom.interpolatePoints(A, B, 0.5);

        // Create two search rays
        let rays = [
            new Segment(mid, Geom.rotatePoint(mid, B, Math.PI/2)).normalize(0.1),
            new Segment(mid, Geom.rotatePoint(mid, B, -Math.PI/2)).normalize(0.1)
        ];

        // check if the end point of the rays is inside the lot
        rays = rays.filter(
            ray => this._buildPerimeter.containsPointRobust(ray.b)
        );

        // if we still have two rays, keep the one that's closest to the target level
        if (rays.length===2) {
            rays = rays.sort(
                (a, b) =>
                    Math.abs(this._targetLevel-this._topography.heightLevel(a.b.x, a.b.y)) >
                    Math.abs(this._targetLevel-this._topography.heightLevel(b.b.x, b.b.y))
            );
        }

        if (rays.length > 0) {
            // extend the ray to 10m
            const ray = rays[0].normalize(Math.max(searchLength, SiteWorksModel.WORK_STEP));

            // store the temporary best point
            let bestPoint = ray.a.clone();
            let bestLevel = this._topography.heightLevel(ray.a.x, ray.a.y);

            // perform a binary search. Aim for 1cm accuracy
            for (let steps = Math.ceil(Geom.log2(ray.length*100)), coefficient=0.5, best=0; steps; --steps, coefficient /= 2) {
                const current = best + coefficient;
                const point   = Geom.interpolatePoints(ray.a, ray.b, current);
                const level   = this._topography.heightLevel(point.x, point.y);

                if ((this.underThreshold(bestLevel) && this.underAtThreshold(level) && (this.isCut ? level > bestLevel : level < bestLevel)) ||
                    (this.overThreshold (bestLevel) && this.overThreshold   (level) && (this.isCut ? level < bestLevel : level > bestLevel))) {
                    best      = current;
                    bestPoint = point;
                    bestLevel = level;
                }
            }

            // with the found point, continue the search
            if (bestPoint) {
                if (iterationStep > 0) {
                    this._processCutPiece(A, bestPoint, iterationStep-1, cutLine, searchLength/2);
                }

                cutLine.push(bestPoint);

                if (iterationStep > 0) {
                    this._processCutPiece(bestPoint, B, iterationStep-1, cutLine, searchLength/2);
                }
            }
        }
    }
}