/**
 * The Point object represents a location in a two-dimensional coordinate system, where x represents
 * the horizontal axis and y represents the vertical axis.
 *
 * @class
 */
import HighlightableModel from '../events/HighlightableModel';
import Geom from '../utils/Geom';

export default class Point extends HighlightableModel
{
    /**
     * @return {string}
     */
    static get CLASS_TYPE() { return 'Point'; }
    /**
     * @param type {string}
     * @return {boolean}
     */
    isType(type) { return type === Point.CLASS_TYPE; }

    // two points are considered equal if the distance between them is <= 1mm
    static get EQUAL_DISTANCE() {return 0.001;}


    /**
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     * @param {*} context
     */
    constructor(x = 0, y = 0, context=null)
    {
        super(context);

        /**
         * @member {number}
         * @default 0
         * @protected
         */
        this._x = x;

        /**
         * @member {number}
         * @default 0
         * @protected
         */
        this._y = y;
    }

    get x() { return this._x; }
    set x(v)
    {
        if (this._x !== v) {
            this._x = v;
            this.onChange();
        }
    }

    get y() { return this._y; }
    set y(v)
    {
        if (this._y !== v) {
            this._y = v;
            this.onChange();
        }
    }

    /**
     * Creates a clone of this point
     *
     * @return {Point} a copy of the point
     */
    clone()
    {
        return new Point(this.x, this.y);
    }

    /**
     * @return {number} The length of the vector starting at (0,0) and ending at this point
     */
    get vectorLength() {
        return this.distanceTo(0,0);
    }

    /**
     * @return {number} Angle of the vector starting at (0,0) and ending at this point
     */
    get vectorAngle() {
        return Math.atan2(this.y, this.x);
    }

    /**
     * Copies x and y from the given point
     *
     * @param {Point} p - The point to copy.
     */
    copy(p)
    {
        this.moveTo(p.x, p.y);
        return this;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Queries

    /**
     * @param x {number}
     * @param y {number}
     * @return  {number}
     */
    distanceTo(x, y)
    {
        return Math.sqrt((x-this._x)*(x-this._x) + (y-this._y)*(y-this._y) );
    }

    /**
     * @param a {Point}
     * @return {number}
     */
    distanceToPoint(a) {
        return Math.sqrt((a.x-this._x)*(a.x-this._x) + (a.y-this._y)*(a.y-this._y) );
    }

    /**
     * Returns true if the given point is within 1mm of this one
     *
     * @param b {*}
     * @return {boolean} true if the give point equals this one
     */
    equals(b)
    {
        return ( typeof b !== 'undefined' ) &&
               ( this === b || this.distanceTo(b.x, b.y) < Point.EQUAL_DISTANCE );
    }

    /**
     * @param x {number}
     * @param y {number}
     * @returns {boolean}
     */
    equalsCoords(x, y) {
        return this.distanceTo(x, y) < Point.EQUAL_DISTANCE;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Actions
    
    /**
     * Sets the point to a new x and y position.
     * If y is omitted, both x and y will be set to x.
     *
     * @param {number} [x=0] - position of the point on the x axis
     * @param {number} [y=0] - position of the point on the y axis
     * @param {boolean} dispatchChange
     */
    moveTo(x, y, dispatchChange=true)
    {
        this._x = x || 0;
        this._y = y || ((y !== 0) ? this.x : 0);

        dispatchChange && this.onChange();
    }

    /**
     * @return {string}
     */
    toString()
    {
        return '('+this.x.toFixed(4)+', '+this.y.toFixed(4)+')';
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Transformations

    /**
     * @param x {number} - value to add to the X coordinate
     * @param y {number} - value to add to the Y coordinate
     * @param dispatchChange {boolean}
     */
    translate(x, y, dispatchChange=true)
    {
        this._x += x;
        this._y += y;
        dispatchChange && this.onChange();

        return this;
    }

    /**
     * @param x {number} - value to add to the X coordinate
     * @param y {number} - value to add to the Y coordinate
     * @param dispatchChange {boolean}
     */
    offset(x, y, dispatchChange=true) {
        return this.translate(x, y, dispatchChange);
    }

    /**
     * @param {number} factor
     */
    scale(factor)
    {
        this._x	*= factor;
        this._y	*= factor;
        this.onChange();

        return this;
    }

    /**
     * @param {number} angle
     * @param {number} ox
     * @param {number} oy
     */
    rotate(angle, ox, oy)
    {
        let b   = Geom.rotatePointCoords(ox, oy, this.x, this.y, angle);
        this._x	= b.x;
        this._y	= b.y;
        this.onChange();

        return this;
    }

    /**
     * @param {number} origin
     */
    mirrorHorizontally(origin)
    {
        this._x	= 2*origin - this._x;

        return this;
    }

    /**
     * @param {number} origin
     */
    mirrorVertically(origin)
    {
        this._y	= 2*origin - this._y;

        return this;
    }

    /**
     * @param {Matrix} mat
     */
    transform(mat)
    {
        const b = mat.transformPoint(this);
        this._x = b.x;
        this._y = b.y;
        this.onChange();

        return this;
    }

    /**
     * @param point {Point}
     * @return {Point}
     */
    add(point)
    {
        return new Point(
            this.x + point.x,
            this.y + point.y
        );
    }

    /**
     * @param point {Point}
     * @return {Point}
     */
    subtract(point)
    {
        return new Point(
            this.x - point.x,
            this.y - point.y
        );
    }

    /**
     * @return {number[]}
     */
    asArray() {
        return [this.x, this.y];
    }

    /**
     * @param v {Array.<Point>}
     * @return {Array.<Point>}
     */
    static cloneList(v) {
        if ( !v )
            return null;
        let copy = [];
        for (let i=0; i<v.length; ++i) {
            copy.push(v[i].clone());
        }
        return copy;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IRestorable implementation

    /**
     * Returns a data structure containing all the parameters representing this object's state
     * @return {{x: number, y: number}}
     */
    recordState ()
    {
        return {
            x : this._x,
            y : this._y
        };
    }

    /**
     * Restores this object to the state represented by the 'state' data structure
     *
     * @param state {{}} the state to be restored
     */
    restoreState(state)
    {
        this._x = state.x;
        this._y = state.y;
        this.onRestored();
    }
}