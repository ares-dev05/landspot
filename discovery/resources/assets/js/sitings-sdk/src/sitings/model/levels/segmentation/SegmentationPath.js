import Segment from '../../../../geom/Segment';
import Geom from '../../../../utils/Geom';
import LotPointModel from '../../lot/LotPointModel';
import HighlightableModel from '../../../../events/HighlightableModel';
import ModelEvent from '../../../events/ModelEvent';

// ray length in meters. fixed to 10km
const RAY_LENGTH    = 100;

export default class SegmentationPath extends HighlightableModel {

    constructor() {
        super();

        /**
         * @type {LevelPointModel[]}
         * @private
         */
        this._points = [];

        /**
         * @type {Segment[]}
         * @private
         */
        this._segments = [];

        /**
         * Indicates if this path has been ended and no other points can be added to it
         * @type {boolean}
         * @private
         */
        this._closed = false;
    }

    /**
     * @returns {LevelPointModel[]}
     */
    get points() { return this._points; }

    /**
     * @returns {number}
     */
    get pointCount() { return this._points.length; }

    /**
     * @returns {LevelPointModel}
     */
    get lastPoint() {
        return this._points && this._points.length>0 ? this.points[this._points.length-1] : null;
    }

    /**
     * @returns {LevelPointModel}
     */
    get secondLastPoint() {
        return this._points && this._points.length > 1 ? this.points[this._points.length-2] : null;
    }

    /**
     * @returns {Segment[]}
     */
    get segments() { return this._segments; }

    /**
     * @param value {boolean}
     */
    set closed(value) {
        if (!this._closed && value) {
            // The path can only be closed once
            this._closed = value;
            this.onChange();
        }
    }

    /**
     * @returns {boolean}
     */
    get closed() { return this._closed; }

    /**
     * The segmentation path is valid (i.e. it can be applied on the lot), if it has at least 2 points
     *
     * @returns {boolean}
     */
    get valid() { return this._points && this._points.length >= 2; }

    /**
     * Selects another point along the segmentation path
     * @param point {LevelPointModel}
     * @returns {Boolean} indicating if the point was added
     */
    addPoint(point) {
        if (this.closed) {
            return false;
        }

        /*

        If we are adding the same point as the last one - close the path instead

        if (this.lastPoint===point) {
            this.closed = true;
            return false;
        }

        @INFO @MD 23.02.2022: don't close the path with double click on a point.

        */

        // we don't want to add a point multiple times.
        if (this._points.indexOf(point) >= 0 ) {
            return false;
        }

        this._points.push(point);
        point.addEventListener(LotPointModel.MOVE_COMPLETE, this.pointMoved, this);
        point.addEventListener(ModelEvent.DELETE, this.deletePath, this);

        // Recalculate the segments
        this._segments = [];
        for (let index=0; index<this._points.length-1; ++index) {
            this._segments.push(
                new Segment(this._points[index].position, this._points[index+1].position)
            );
        }

        this.onAdded();
        this.onChange();

        return true;
    }

    /**
     * @private
     */
    pointMoved() {
        this.onChange();
    }


    /**
     * Delete the current path
     */
    deletePath() {
        this.clear(false);
        this.onDelete();
    }

    /**
     * removes all the points & segments in the current path
     */
    clear(dispatchChange=true) {
        this._points.forEach(point => {
            point.removeEventListener(ModelEvent.DELETE, this.deletePath, this);
            point.removeEventListener(LotPointModel.MOVE_COMPLETE, this.pointMoved, this);
        });
        this._points = [];
        this._segments = [];

        dispatchChange && this.onChange();
    }

    /**
     * Applies the segmentation to a closed path (polygon), defined by a set of vertices sorted in CW or CCW order.
     *
     * @param area {Point[]} a list of points sorted in either clockwise or counter-clockwise order
     * @returns {Point[][]}
     */
    applyOn(area) {
        if (!this.valid) {
            return [area];
        }

        // We calculate the cut path as the line defined by the current list of points.
        // To make sure that we calculate segmentations correctly, we move the first point of the path
        // along the direction defined by it and the 2nd point, outwards, making it a 'RAY' .
        // We do the same for the last point of the path, only in the opposite direction.

        // reverse the vertex order for the start ray
        const startRay = new Segment(this.points[1].position.clone(), this.points[0].position.clone());
        startRay.startFrom(startRay.b.x, startRay.b.y);
        startRay.normalize(RAY_LENGTH);

        // calculate the end ray
        const endRay = new Segment(this.secondLastPoint.position.clone(), this.lastPoint.position.clone());
        endRay.startFrom(endRay.b.x, endRay.b.y);
        endRay.normalize(RAY_LENGTH);

        // create the segmentation path as the list of points
        const cutPath  = [
            startRay.b,
            ...this.points.slice(1, this.pointCount-1).map(point => point.position),
            endRay.b
        ];

        // see if the current segmentation path 'cuts' the passed area in two.
        // for this to be true, 2 intersection points need to be detected between
        // the cut path and the vertices of the area

        // create an area to work on, where the last point equals the first.
        const closedArea = [...area, area[0]];
        const cutIndices = [], cutPoints=[], pathIndices=[];
        let point;

        // we need to loop the area segments in their defined order
        for (let index=0; index<closedArea.length-1; ++index) {
            for (let pathIndex=0; pathIndex<cutPath.length-1; ++pathIndex) {
                // Check if there is an intersection between the closed area and the current path segment
                point = Geom.segmentIntersectionPoints(
                    cutPath[pathIndex], cutPath[pathIndex+1],
                    closedArea[index], closedArea[index+1]
                );

                // if we found an intersection between the path and the polygon,
                // we record it so that we can build our segmented areas later.

                // @IMPORTANT: Normally, the Intersections will always be at the end of the cut path

                // @INFO: Technically this verification is no longer needed:
                // } && cutPoints.find(v => Geom.pointsEqual(v, point))===undefined)   {
                if (point !== null) {
                    // we have found a new cut index. add it to the list
                    cutIndices.push(index);
                    cutPoints.push(point);
                    pathIndices.push(pathIndex);
                }
            }
        }

        // no cut happens if we found less than two intersection points
        if (cutIndices.length < 2) {
            return [area];
        }

        // invalid case. The cut path has an unsupported geometry
        if (cutIndices.length > 2) {
            return [area];
        }

        /**
         * When a segmentation is detected, we need to reconstruct the two areas
         * from the intersection points and from the current polygon.
         *
         * Taking the below case, the two new created polygons will be:
         * [ B [...] A, 1, 2, 3 ]
         * [ B, 4, 5, 0, A ]
         *
         *             [0]
         *             /
         *            /
         [0]---------A------1
        /           /        \
       5    M    [...]        \
        \         /       N    2
         \       /            /
          4-----B----------[3]
               /
              /
            [S]
         *
         */

        // shortcuts for intersection points
        const A = cutPoints[0], B = cutPoints[1];

        // shortcuts for cut indices on the enclosed area
        const x = cutIndices[0], y = cutIndices[1];

        // Create the array of points that is part of the segmentation path
        const m = pathIndices[0], n = pathIndices[1];
        let cutPortion;

        if (m < n) {
            // we take all the points between m+1 and n
            cutPortion = [A, ...cutPath.slice(m + 1, n + 1), B];
        } else {
            // we create the cut portion in a reverse order
            cutPortion = [B, ...cutPath.slice(n + 1, m + 1), A].reverse();
        }

        // @INFO Special case, check if both cut points points are on the same boundary
        if (x === y) {
            // We need to find the starting & ending sides of the loop
            const VX = area[x];

            /**
             * If point [A] is between [VX] and [B], nothing needs to change -> the algorithm works correctly
             * Otherwise, we need to reverse the cutPortion
             *
             [VX]---[A]--------[B]---[VY]
              /      |          |      \
             *
             */
            if (Geom.equal(Geom.pointDistance(VX, A)+Geom.pointDistance(A, B), Geom.pointDistance(VX, B))) {
                // X and Y can stay unchanged.
            }   else {
                // we need to reverse the inner array
                cutPortion.reverse();
            }
        }

        // Return the two newly created areas
        return [
            [...cutPortion, ...area.concat(area).slice(y+1, x+1+area.length)],
            // Because array.reverse() changes the original array, we call it in the 2nd area
            [...cutPortion.reverse(), ...area.slice(x+1, y+1)],
        ];
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Restorable implementation
    //

    /**
     * @param points {LevelPointModel[]}
     * @return {{points: number[]}}
     */
    recordState(points) {
        return {
            points: this.points.map( point => points.indexOf(point) ),
        };
    }

    /**
     * @param state {{points: number[]}}
     * @param levelPoints {LevelPointModel[]}
     */
    restoreState(state, levelPoints) {
        this.clear(false);

        if (state && state.points) {
            state.points.forEach(
                pointIndex => pointIndex >= 0 && pointIndex < levelPoints.length && this.addPoint(levelPoints[pointIndex])
            );
        }

        this.closed = true;
    }
}