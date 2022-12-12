export default class SnapInfo
{
	/**
	 * @param point {Point}
	 * @param target {RestoreDispatcher}
	 * @param found {boolean}
	 * @param isOnCorner {boolean}
	 * @param isRoofline {boolean}
	 * @param cornerEdges {Array}
	 */
	constructor(point, target, found, isOnCorner=false, isRoofline=false, cornerEdges=null)
	{
		/**
		 * @type {Point}
		 */
		this.point	= point;

		/**
		 * @type {RestoreDispatcher}
		 */
		this.target	= target;

		/**
		 * @type {boolean}
		 */
		this.found	= found;

		/**
		 * @type {boolean}
		 */
		this.isOnCorner	= isOnCorner;

		/**
		 * @type {boolean}
		 */
		this.isRoofline	= isRoofline;

		/**
		 * @type {Array}
		 */
		this.cornerEdges = cornerEdges;
	}
}