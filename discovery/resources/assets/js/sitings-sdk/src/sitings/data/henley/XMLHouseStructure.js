import Geom from '../../../utils/Geom';
import Point from '../../../geom/Point';

export default class XMLHouseStructure {

	/**
	 * @param data {Element}
	 */
	constructor(data=null)
	{
		/**
		 * @type {Element}
		 */
		this.data		= null;
		/**
		 * @type {number}
		 */
		this.story		= 0;
		/**
		 * @type {number}
		 */
		this.area		= 0;
		/**
		 * @type {Point[]}
		 */
		this.structure	= null;

		/**
		 * @type {number}
		 */
		this.left		=  Infinity;
		/**
		 * @type {number}
		 */
		this.top		=  Infinity;
		/**
		 * @type {number}
		 */
		this.right		= -Infinity;
		/**
		 * @type {number}
		 */
		this.bottom		= -Infinity;

		if (data) {
			this.data	= data;
			this.parse();
		}
	}

	/**
	 * @protected
	 */
	parse()
	{
		// all house structures seem to have a story associated
		this.story		= parseFloat(this.data.getAttribute('story'));

		// load the coordinates
		this.structure	= [];

		const coords = this.data.getElementsByTagName('coord');
		for (let i=0; i<coords.length; ++i) {
			const p = new Point(
				parseFloat(coords[i].getAttribute('x')),
				parseFloat(coords[i].getAttribute('y'))
			);

			this.structure.push(p);
			this._updateBounds(p);
		}

		this.calculateArea();
	}

	/**
	 * See https://www.mathopenref.com/coordpolygonarea.html
	 * @protected
	 */
	calculateArea()
	{
		this.area = 0;
		for (let i=0, a, b; i<this.structure.length; ++i) {
			a = this.structure[i];
			b = this.structure[(i+1) % this.structure.length];
			this.area += a.x*b.y - a.y*b.x;
		}

		this.area = Math.abs(this.area/2);
	}

	/**
	 * @param origin {Point}
	 * @param angle {number}
	 */
	rotate(origin, angle)
	{
		// reset the bounds
		this.left   =  Infinity;
		this.top	=  Infinity;
		this.right  = -Infinity;
		this.bottom = -Infinity;

		for (let i=0; i<this.structure.length; ++i) {
		// for each (var a:Point in structure) {
			const a = this.structure[i];
			const b = Geom.rotatePoint(origin, a, angle);
			a.x = b.x;
			a.y = b.y;

			this._updateBounds(a);
		}
	}

	/**
	 * @param point
	 * @protected
	 */
	_updateBounds(point) {
		this.left	= Math.min(this.left  , point.x);
		this.top	= Math.min(this.top   , point.y);
		this.right	= Math.max(this.right , point.x);
		this.bottom	= Math.max(this.bottom, point.y);
	}
}