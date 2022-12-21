import EventBase from '../../../events/EventBase';
import SVGPolygon from '../../../svg/display/SVGPolygon';
import SVGPath from '../../../svg/display/SVGPath';
import SVGMoveToCommand from '../../../svg/data/path/SVGMoveToCommand';
import SVGCurveToCubicCommand from '../../../svg/data/path/SVGCurveToCubicCommand';
import SVGLineToCommand from '../../../svg/data/path/SVGLineToCommand';
import SVGClosePathCommand from '../../../svg/data/path/SVGClosePathCommand';
import SVGLine from '../../../svg/display/SVGLine';
import SVGText from '../../../svg/display/SVGText';
import HouseSlab from './HouseSlab';
import TransformationPoint from './TransformationPoint';
import FacadeSegment from './FacadeSegment';
import FacadeTestData from './FacadeTestData';
import HighlightableModel from '../../../events/HighlightableModel';
import SVGG from '../../../svg/display/SVGG';
import SVGRect from '../../../svg/display/SVGRect';
import Point from '../../../geom/Point';

export default class FacadeModel extends HighlightableModel{

	static get FACADE_CHANGED() {return 'changeFacade';}

	static get ORIGIN() {return 'ORIGIN';}

	static get WALL_LEFT() {return 'WALL_X5F_LEFT';}

	static get WALL_RIGHT() {return 'WALL_X5F_RIGHT';}

	constructor () {
		super();

		// HouseSlab
		/**
		 * @type {HouseSlab}
		 * @private
		 */
		this._slab = new HouseSlab();

		// display name of the selected house / facade combo
		/**
		 * @type {string}
		 * @private
		 */
		this._facadeName = '';

		// extension points associated with the current facade
		/**
		 * @type {TransformationPoint[]}
		 * @private
		 */
		this._extensionInfos = [];

		// the floor edges
		/**
		 * @type {FacadeSegment[]}
		 * @private
		 */
		this._edges = [];

		// the floor edges
		/**
		 * @type {null|SVGG}
		 * @private
		 */
		this._facadeData = null;

		/**
		 * @type {number}
		 * @private
		 */
		this._toMm = NaN;

		/**
		 * @type {number}
		 * @private
		 */
		this._originX = NaN;

		/**
		 * @type {number}
		 * @private
		 */
		this._originY = NaN;

		/**
		 * @type {Object}
		 * @private
		 */
		this._facadeTestData = {};

	}

	/**
	 * @return {HouseSlab}
	 * @public
	 */
	get slab() {
		return this._slab;
	}

	/**
	 * @return {number}
	 * @public
	 */
	get width() {
		return this._slab.width;
	}

	/**
	 * @return {FacadeSegment[]}
	 * @public
	 */
	get edges() {
		return this._edges;
	}

	/**
	 * @return {TransformationPoint[]}
	 * @public
	 */
	get extensionInfos() {
		return this._extensionInfos;
	}

	/**
	 * @return {string}
	 * @public
	 */
	get facadeName() {
		return this._facadeName;
	}

	/**
	 * @public
	 */
	reload() {
		this.slab.reload();
		for(let segment of this.edges) {
			segment.reset();
		}
	}

	/**
	 * apply a transformation on the entire facade
	 * @param transform {TransformationPoint}
	 * @public
	 */
	applyTransform(transform) {
		let segment;

		if (transform.isSlab) {
			// this is a slab transformation; set the slab height and move the entire facade upwards
			this.slab.height = transform.extension;
			for (segment of this.edges) {
				segment.translate(0, -transform.extension);
			}
		}	else {
			for (segment of this.edges) {
				segment.applyTransform(transform);
			}
		}

		this.onChange();
	}

	/**
	 * sets the vertical level of the house, i.e. the level of the pad, on which the slab will be
	 * @param level {number}
	 * @public
	 */
	setHouseLevel(level) {
		// translate the slab upwards vertically
		this.slab.translate(0, -level);

		// translate all the other segments of the house
		for(let segment of this.edges) {
			segment.translate(0, -level);
		}

		this.onChange();
	}

	/**
	 * reset everything
	 */
	clear() {
		this._edges = [];
		this._extensionInfos = [];
	}

	/**
	 * loads the facade for the house that was picked in Footprints
	 * @param name {string} the name of the house/facade to display
	 * @param data {SVGG} the SVG group containing the front projection of the facade
	 * @param tomm {number}
	 * @public
	 */
	loadFacade(name, data, tomm) {
		this.clear();
		this.slab.clear();

		this._facadeData	= data;
		this._facadeName	= name;
		this._toMm		= tomm;

		this._originX	= 0;
		this._originY	= 0;

		// @TEMP: start parsing the SVG!!!
		this.parseGroup(data);

		// translate everything to the ORIGIN, and create the SLAB
		for (let segment of this.edges) {
		// translate to (0,0);
			segment.translate(-this._originX, -this._originY );
			segment.fix();

			if (segment.isWall) {
				this.slab.addWall(segment.center.x);
			}
		}

		// @TEMP @TODO @INFO: how do we do this in the SVG ???
		const extensions = [{
			name	 : 'GROUND FLOOR CELLING HEIGHT',
			level	 : 1,
			position : -2.7
		},	{
			name	 : 'FIRST FLOOR CELLING HEIGHT',
			level	 : 2,
			position : -4.2
		}];

		// parse the extension infos
		extensions.forEach(extensionInfo => this.extensionInfos.push(
			TransformationPoint.fromObject(extensionInfo)
		));

		this.dispatchEvent(new EventBase(FacadeModel.FACADE_CHANGED, this));
	}

	/**
	 * @param group {SVGG}
	 * @private
	 */
	parseGroup(group) {
		let i;
		let element;
		let j;
		const groupId = group.id.toUpperCase();

		for (i = 0; i < group.numElements; ++i) {
			element = group.getElementAt(i);

			if (element instanceof SVGG) {
			this.parseGroup(element);
			} else if (element instanceof SVGRect) {
				let rect = element,
					cw = [0, 1, 1, 0],
					ch = [0, 0, 1, 1];

				for (j = 0; j < cw.length; ++j) {
					this.addEdgeFromPoints(
						this.toMeters(rect.svgX) + cw[j] * this.toMeters(rect.svgWidth),
						this.toMeters(rect.svgY) + ch[j] * this.toMeters(rect.svgHeight),
						this.toMeters(rect.svgX) + cw[(j+1) % cw.length] * this.toMeters(rect.svgWidth),
						this.toMeters(rect.svgY) + ch[(j+1) % cw.length] * this.toMeters(rect.svgHeight)
					);
				}
			}	else if (element instanceof SVGPolygon) {

				const poly = element;

				for (j = 0; j < poly.points.length; j += 2) {
					this.addEdgeFromPoints(
						this.toMeters(poly.points[j]),
						this.toMeters(poly.points[j + 1]),
						this.toMeters(poly.points[(j + 2) % poly.points.length]),
						this.toMeters(poly.points[(j + 3) % poly.points.length])
					);
				}
			}
			else if (element instanceof SVGPath) {
				let path = element;
				let cx = 0;
				let cy = 0;
				let ox = 0;
				let oy = 0;

				for (j = 0; j < path.path.length; ++j) {
					if (path.path[j] instanceof SVGMoveToCommand) {
						const mtc = path.path[j];

						if (mtc.absolute) {
							cx = mtc.x;
							cy = mtc.y;
						}	else {
							cx += mtc.x;
							cy += mtc.y;
						}

						// remember the start of the path
						ox = cx;
						oy = cy;
					}
					else if (path.path[j] instanceof SVGCurveToCubicCommand) {
						let ctcc = path.path[j];

						if (ctcc.absolute) {
							this.addEdgeFromPoints(
								this.toMeters(cx), this.toMeters(cy),
								this.toMeters(ctcc.x), this.toMeters(ctcc.y)
							);
							cx = ctcc.x;
							cy = ctcc.y;
						}	else {
							this.addEdgeFromPoints(
								this.toMeters(cx),this.toMeters(cy),
								this.toMeters(cx+ctcc.x), this.toMeters(cy+ctcc.y)
							);
							cx += ctcc.x;
							cy += ctcc.y;
						}
					}
					else if (path.path[j] instanceof SVGLineToCommand) {
						let lineTo = path.path[j];

						if (lineTo.absolute) {
							this.addEdgeFromPoints(
								this.toMeters(cx), this.toMeters(cy),
								this.toMeters(lineTo.x), this.toMeters(lineTo.y)
							);
							cx = lineTo.x;
							cy = lineTo.y;
						}	else {
							this.addEdgeFromPoints(
								this.toMeters(cx), this.toMeters(cy),
								this.toMeters(cx+lineTo.x), this.toMeters(cy+lineTo.y)
							);
							cx += lineTo.x;
							cy += lineTo.y;
						}
					}
					else if (path.path[j] instanceof SVGClosePathCommand) {
						this.addEdgeFromPoints(
							this.toMeters(cx), this.toMeters(cy),
							this.toMeters(ox), this.toMeters(oy)
						);

						cx = ox;
						cy = oy;
					}
					else {
						// unsupported command
						console.log('unsupported path command ', path.path[j]);
					}
				}
			}
			else if (element instanceof SVGLine) {
				let line = element;

				if (groupId.indexOf(FacadeModel.ORIGIN) === 0) {
					// @TODO: at the moment, only LINES are supported as ORIGIN / WALL; add this support to hter
					this._originX	= Math.min(this.toMeters(line.svgX1), this.toMeters(line.svgX2) );
					this._originY	= Math.min(this.toMeters(line.svgY1), this.toMeters(line.svgY2) );
					// no need to add it
				}	else {
					/*
					if (groupId.indexOf(FacadeModel.WALL_LEFT) === 0) {
					}	else if (groupId.indexOf(FacadeModel.WALL_RIGHT) === 0) {
					}
					 */

					this.addEdgeFromPoints(
						this.toMeters(line.svgX1), this.toMeters(line.svgY1),
						this.toMeters(line.svgX2), this.toMeters(line.svgY2),
						groupId.indexOf(FacadeModel.WALL_LEFT) === 0 || groupId.indexOf(FacadeModel.WALL_RIGHT) === 0
					);
				}
			}
			else if (element instanceof SVGText) {
				this.addLabelFromSvgText(element);
			}
			else {
				console.log('unsupported element ', element);
			}
		}
	}

	/**
	 * @param ax {number}
	 * @param ay {number}
	 * @param bx {number}
	 * @param by {number}
	 * @param isWall {boolean}
	 * @private
	 */
	addEdgeFromPoints(ax, ay, bx, by, isWall = false) {
		/*
		segment = FacadeSegment.fromObject( segmentData, scx, scy )
		this.edges.push( segment );
		maxY = Math.max( maxY, segment.a.y, segment.b.y );
		minX = Math.min( minX, segment.a.x, segment.b.x );

		// determine the left wall
		if ( segment.isWall ) {
			wminX = Math.min( wminX, segment.a.x, segment.b.x );
		}
		minX	= Math.min( minX, ax, bx );
		maxX	= Math.max( maxX, ax, bx );
		minY	= Math.min( minY, ay, by );
		maxY	= Math.max( maxY, ay, by );
		*/
		// @TODO: maybe we need to flip Y here!
		this._edges.push(new FacadeSegment(new Point(ax, ay), new Point(bx, by), isWall));
	}

	/**
	 * @param value
	 * @return {number}
	 * @public
	 */
	toMeters(value) {
		return this._toMm * Number(value) / 1000;
	}

	/**
	 * @TODO recordState
	 * returns a data structure containing all the parameters representing this object's state
	 */
	recordState () {
		return {};
	}

	/**
	 * @TODO restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state {Object} the state to be restored
	 * @public
	 */
	restoreState(state) {
	}

	/**
	 *
	 * @param name
	 * @param floorWidth
	 */
	loadTestFacade(name, floorWidth = 0) {
		/** @TEMP: no facades available; load test data */
		this.loadTestData(FacadeTestData.facades[0], floorWidth);

		// @TEMP: make this connection more solid
		this._facadeName = name;

		if (floorWidth > 0) {
			// @TODO: resize the facade to the given width
		}

		this.onChange();
	}

	/**
	 * used during testing
	 * @param data
	 * @param floorWidth
	 */
	loadTestData(data, floorWidth = 0) {
		this._facadeTestData = data;
		this.parseTestData(floorWidth);
	}

	parseTestData(floorWidth = 0) {
		this.clear();
		this.slab.clear();

		// determine the X scale
		let scx = 1;
		let scy = 1;

		if (floorWidth > 0 && this._facadeTestData.hasOwnProperty('width') ) {
			scx = floorWidth / this._facadeTestData.width;
		}

		// fix the facade at 0, 0
		let maxY = -Infinity;
		let minX = Infinity;
		let wallMinX = Infinity;
		let segment = null;

		// parse the edges
		this._facadeTestData.edges.forEach(segmentData => {
			segment = FacadeSegment.fromObject(segmentData, scx, scy);
			this.edges.push(segment);
			maxY = Math.max(maxY, segment.a.y, segment.b.y);
			minX = Math.min(minX, segment.a.x, segment.b.x);

			// determine the left wall
			if (segment.isWall) {
				wallMinX = Math.min(wallMinX, segment.a.x, segment.b.x);
			}
		});

		// if we have a left wall, translate the house so that the left wall will be at the origin
		if (wallMinX < Infinity) {
			minX = wallMinX;
		}

		for (segment of this.edges) {
			// translate to (0,0);
			segment.translate( -minX, -maxY );
			segment.fix();

			if (segment.isWall) {
				this.slab.addWall(segment.center.x);
			}
			// segment.translate( _dx, 0 );
		}

		// translate the slab
		// slab.translate( _dx, 0 );

		// parse the extension infos
		this._facadeTestData.extensions.forEach(extensionInfo => {
			this.extensionInfos.push(TransformationPoint.fromObject(extensionInfo));
		});

		this.dispatchEvent(new EventBase(FacadeModel.FACADE_CHANGED, this));
	}
}