import Segment from "../../../../geom/Segment";
import Utils from "../../../../utils/Utils";

/**
 * When a transformation is applied on a floorplan, it will either extend or shorten all the edges that the transformation
 * boundary line intersects with.
 *
 * At the location of these extensions/reductions, we will apply cuts to the house walls, so that we can then enlarge
 * or shorten them. A TransformationCutModel stores a segment cut, indicating if it's an extension or a reduction in length
 */
export default class TransformationCutModel extends Segment {

	/**
	 * @param a {Point}
	 * @param b {Point}
	 * @param isExtension {boolean}
	 */
	constructor(a, b, isExtension=true)
	{
		super(a, b);

		/**
		 * @type {boolean}
		 * @public
		 */
		this.isExtension = isExtension;
	}

	/**
	 * @param transformArea {Rectangle} The area affected by the transformation
	 * @param delta {Point}
	 */
	applyTransformation(transformArea, delta)
	{
		if (transformArea.contains(this.a.x, this.a.y)) {
			this.a.x += delta.x;
			this.a.y += delta.y;
		}

		if (transformArea.contains(this.b.x, this.b.y)) {
			this.b.x += delta.x;
			this.b.y += delta.y;
		}
	}

	/**
	 * @returns {string}
	 */
	get labelString() {
		return (this.isExtension?"+":"-") + Utils.fx4(this.length) + "m";
	}
}