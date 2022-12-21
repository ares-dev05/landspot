import RestoreDispatcher from '../../../../events/RestoreDispatcher';
import Geom from '../../../../utils/Geom';
import Segment from '../../../../geom/Segment';
import Triangle from '../../../../geom/Triangle';
import EasementEvent from '../../../events/EasementEvent';
import EventBase from '../../../../events/EventBase';

export default class LotTruncationModel extends RestoreDispatcher {

    /**
     * @returns {string}
     * @constructor
     */
    static get TYPE()         {return 'LotTruncationModel';}

    /**
     * @returns {number} default corner truncation size (6x6m)
     * @constructor
     */
    static get DEFAULT_SIZE() { return 6; }

    /**
     * @param size {number}
     * @param leftEdge {LotCurveModel}
     */
    constructor(size=6, leftEdge=null) {
        super();

        /**
         * @type {number}
         * @private
         */
        this._size      = size;

        /**
         * @type {LotCurveModel}
         * @private
         */
        this._leftEdge  = null;

        /**
         * @type {LotCurveModel}
         * @private
         */
        this._rightEdge = null;

        /**
         * @type {Segment}
         * @private
         */
        this._truncationLeft = null;

        /**
         * @type {Segment}
         * @private
         */
        this._truncationRight = null;

        /**
         * @type {Triangle}
         * @private
         */
        this._truncatedArea = null;

        /**
         * @type {boolean}
         * @private
         */
        this._valid = false;

        // Start validating
        this.leftEdge   = leftEdge;
    }

    /**
     * @return string
     */
    get type() { return this ? LotTruncationModel.TYPE : null; }

    /**
     * @returns {boolean}
     */
    get valid() { return this._valid; }

    /**
     * @returns {Segment}
     */
    get truncationLeft() { return this._truncationLeft; }

    /**
     * @returns {Segment}
     */
    get truncationRight() { return this._truncationRight; }

    /**
     * @returns {Triangle}
     */
    get truncatedArea() { return this._truncatedArea; }

    /**
     * @returns {number}
     */
    get size() { return this._size; }

    /**
     * @param v {number}
     */
    set size(v) {
        this._size = v;
        this._calculate();
    }

    /**
     * @returns {LotCurveModel}
     */
    get leftEdge() { return this._leftEdge; }

    /**
     * @param edge {LotCurveModel}
     */
    set leftEdge(edge) {
        if (edge !== this._leftEdge && (!edge || edge !== this._rightEdge)) {
            this._leftEdge = edge;
            // @TODO: do we want to add event listeners for edge change events?
            this._calculate();
        }
    }

    /**
     * @returns {LotCurveModel}
     */
    get rightEdge() { return this._rightEdge; }

    /**
     * @param edge {LotCurveModel}
     */
    set rightEdge(edge) {
        if (edge !== this._rightEdge && (!edge || edge !== this._leftEdge)) {
            this._rightEdge = edge;
            // @TODO: do we want to add event listeners for edge change events?
            this._calculate();
        }
    }

    /**
     * @private
     */
    _calculate() {
        if (this.size <= 0 || this.leftEdge === null || this.rightEdge === null) {
            this._valid = false;
            return;
        }

        this._valid = true;

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Option 1:
        // check if the two edges have a vertex in common

        /**
         * @type {Point}
         */
        let common = null;
        if (this.leftEdge.a.equals(this.rightEdge.a) || this.leftEdge.a.equals(this.rightEdge.b)) {
            common = this.leftEdge.a;
        }   else
        if (this.leftEdge.b.equals(this.rightEdge.a) || this.leftEdge.b.equals(this.rightEdge.b)) {
            common = this.leftEdge.b;
        }

        if (common) {
            // the two edges have a common point.
            this._truncationLeft = new Segment(
                common.clone(),
                (common.equals(this.leftEdge.a) ? this.leftEdge.b : this.leftEdge.a).clone()
            );

            this._truncationRight = new Segment(
                common.clone(),
                (common.equals(this.rightEdge.a) ? this.rightEdge.b : this.rightEdge.a).clone()
            );
        }

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Option 2:
        // The two boundaries don't share a common corner. Find the intersection

        if (!common) {
            // find the intersection for the two boundaries
            const intersection = Geom.segmentIntersection(this.leftEdge, this.rightEdge, true);

            this._truncationLeft = new Segment(
                intersection.clone(),
                (Geom.pointDistance(intersection, this.leftEdge.a) < Geom.pointDistance(intersection, this.leftEdge.b) ?
                    this.leftEdge.b : this.leftEdge.a).clone()
            );

            this._truncationRight = new Segment(
                intersection.clone(),
                (Geom.pointDistance(intersection, this.rightEdge.a) < Geom.pointDistance(intersection, this.rightEdge.b) ?
                    this.rightEdge.b : this.rightEdge.a).clone()
            );
        }

        // Set the correct length for both segments
        this._truncationLeft.normalize(this._size);
        this._truncationRight.normalize(this._size);

        // define the truncation area
        this._truncatedArea = new Triangle(
            this._truncationLeft.a, this._truncationLeft.b, this._truncationRight.b
        );

        this.dispatchEvent(new EventBase(EventBase.CHANGE));
    }

    /**
     * @public
     */
    deleteTruncation() {
        this.dispatchEvent(new EasementEvent(EasementEvent.DELETE, this));
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IRestorable implementation

    /**
     * @param lotPathModel {LotPathModel}
     * @returns {{leftIndex: (*|number), size: number, rightIndex: (*|number)}}
     */
    recordState(lotPathModel)
    {
        return {
            leftIndex  : this.leftEdge  ? lotPathModel.edges.indexOf(this.leftEdge)  : -1,
            rightIndex : this.rightEdge ? lotPathModel.edges.indexOf(this.rightEdge) : -1,
            size       : this.size
        };
    }

    /**
     * @param state {{leftIndex: (*|number), size: number, rightIndex: (*|number)}}
     * @param lotPathModel {LotPathModel}
     */
    restoreState(state, lotPathModel)
    {
        this._size      = state.size;
        this._leftEdge  = lotPathModel.edges[state.leftIndex];
        this._rightEdge = lotPathModel.edges[state.rightIndex];
        this._calculate();
    }
}