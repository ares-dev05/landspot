// [Bindable]
import Point from "../geom/Point";
import Logger from "../utils/Logger";
import ModelBase from "./ModelBase";

// [Bindable]
export default class BindablePoint extends ModelBase
{
	constructor(x=0, y=0)
	{
		super();
        /**
         * @type {number}
         * @private
         */
		this._x = x;
        /**
         * @type {number}
         * @private
         */
        this._y = y;
	}

    /**
     * @return {number}
     */
	get y() { return this._y; }

    /**
     * @param value {number}
     */
	set y(value) { this._y = value; }

    /**
     * @return {number}
     */
	get x() { return this._x; }

    /**
     * @param value {number}
     */
	set x(value) { this._x = value; }

    /**
     * @return {BindablePoint}
     */
	clone()
	{
		return new BindablePoint(this.x, this.y);
	}

    /**
     * @param v {BindablePoint}
     */
	add(v)
	{
		this.x += v.x;
        this.y += v.y;
	}

    /**
     * @param v {Point}
     */
	addPoint(v)
	{
		this.x += v.x;
        this.y += v.y;
	}

    /**
     * @return {Point}
     */
	toPoint()
	{
		return new Point(this.x, this.y);
	}

    /**
	 * @param source {Object}
     */
	copyFrom(source) {
		if ( source.hasOwnProperty("x") && source.hasOwnProperty("y") ) {
			this.x = Number(source.x);
            this.y = Number(source.y);
		}	else {
			Logger.throwMsg("Unable to copy into BindablePoint from object "+source);
		}
	}

    /**
     * @param p {Point}
     * @return {BindablePoint}
     */
	static fromPoint(p)
	{
		return new BindablePoint(p.x, p.y);
	}
}