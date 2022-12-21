import m from '../../../utils/DisplayManager';
import EventBase from '../../../events/EventBase';
import KeyboardEventWrapper from '../../events/KeyboardEventWrapper';
import * as PIXI from 'pixi.js';
import LevelPointView from './LevelPointView';
import KeyboardLayer from '../../global/KeyboardLayer';
import SegmentationPathView from './segmentation/SegmentationPathView';
import MeasurementsLayerModel from '../../model/measure/MeasurementsLayerModel';
import TriangulatedSurfaceInterpolator from '../../model/levels/interpolation/polygons/TriangulatedSurfaceInterpolator';
import SegmentationModel from '../../model/levels/segmentation/SegmentationModel';
import ExistingRetainingWallView from './segmentation/ExistingRetainingWallView';


const DEBUG = true;

export default class LevelsLayerView extends PIXI.Container {


	/**
	 * @param model {LotTopographyModel}
	 * @param measurementsModel {MeasurementsLayerModel}
	 */
	constructor (model, measurementsModel) {
		super();

		/**
		 * @type {LevelPointView[]}
		 * @private
		 */
		this._points = [];

		/**
		 * @type {SegmentationPathView[]}
		 * @private
		 */
		this._segmentationPaths = [];

		/**
		 * @type {LotTopographyModel}
		 * @private
		 */
		this._model = model;
		this._model.addEventListener(EventBase.ADDED, this.pointAdded, this);
		this._model.addEventListener(EventBase.CHANGE, this.modelChanged, this);

		this._model.segmentation.addEventListener(SegmentationModel.ADDED_BATTER, this.batterLineAdded, this);
		this._model.segmentation.addEventListener(SegmentationModel.ADDED_RETAINING, this.retainingWallAdded, this);
		this._model.segmentation.addEventListener(SegmentationModel.ADDED_RETAINING_LEVEL, this.retainingLevelAdded, this);

		/**
		 * @type {MeasurementsLayerModel}
		 * @private
		 */
		this._measurementsModel = measurementsModel;
		this._measurementsModel.addEventListener(EventBase.CHANGE, this.measurementsModelChanged, this);

		/**
		 * @type {PIXI.Graphics}
		 * @private
		 */
		this._surface = null;

		if (DEBUG) {
			this._surface = new PIXI.Graphics();

			this.addChild(this._surface);
			KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_DOWN, this.keyDownEvent, this);
		}

		// Add views for all existing level points
		this._model.pointLevels.forEach(point => this._addPointView(point));

		// Add views for all the existing segmentation batters
		this._model.segmentation.batters.forEach(path => this._addSegmentationPathView(path) );

		// Add views for all the existing retaining walls
		this._model.segmentation.retaining.forEach(retaining => this._addRetainingWallView(retaining));

		// Add views for all the retaining walls' inner levels
		this._model.segmentation.retainingWallInnerLevels.forEach(point => this._addPointView(point));
	}

	/**
	 * @return {LotTopographyModel}
	 * @public
	 */
	get model() {
		return this._model;
	}

	/**
	 * @return {LevelPointView[]}
	 * @public
	 */
	get points() {
		return this._points;
	}

	/**
	 * @return {*|null}
	 * @public
	 */
	get lastPoint() {
		return this._points.length ? this._points[this._points.length - 1] : null;
	}

	/**
	 * @private
	 */
	pointAdded() {
		if (this._model.lastPoint) {
			this._addPointView(this._model.lastPoint);
		}
	}

	/**
	 * @param model {LevelPointModel}
	 * @private
	 */
	_addPointView(model) {
		const view = new LevelPointView(model);
		view.addListener(EventBase.REMOVED, this.viewRemoved, this);
		view.addListener(EventBase.CLICK, this.viewClicked, this);

		this._points.push(view);
		this.addChild(view);
	}

	/**
	 * @param data
	 */
	viewClicked(data) {
		if (this._measurementsModel.currentMode === MeasurementsLayerModel.MODE_BATTER) {
			this.emit(EventBase.CLICK, data);
		}
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	viewRemoved(e) {
		const view = e.target;
		if (view) {
			view.removeListener(EventBase.REMOVED, this.viewRemoved);
			view.removeListener(MouseEvent.CLICK, this.viewClicked);

			this._points.splice(this._points.indexOf(view), 1);
		}
	}

	/**
	 * @private
	 */
	batterLineAdded() {
		if (this._model.segmentation.lastBatter) {
			this._addSegmentationPathView(this._model.segmentation.lastBatter);
		}
	}

	/**
	 * @param model {SegmentationPath}
	 * @private
	 */
	_addSegmentationPathView(model) {
		const view = new SegmentationPathView(model);
		view.addListener(EventBase.REMOVED, this.segmentationViewRemoved, this);
		this._segmentationPaths.push(view);
		this.addChild(view);
	}

	/**
	 * @param e
	 */
	segmentationViewRemoved(e) {
		const view = e.target;
		if (view) {
			view.removeListener(EventBase.REMOVED, this.segmentationViewRemoved);
			this._segmentationPaths.splice(this._segmentationPaths.indexOf(view), 1);
		}
	}

	retainingWallAdded() {
		if (this._model.segmentation.lastRetaining) {
			this._addRetainingWallView(this._model.segmentation.lastRetaining);
		}
	}

	/**
	 * @param event {DataEvent}
	 */
	retainingLevelAdded(event) {
		if (event.data) {
			this._addPointView(event.data);
		}
	}

	/**
	 * @param model {ExistingRetainingWall}
	 * @private
	 */
	_addRetainingWallView(model) {
		const view = new ExistingRetainingWallView(model);
		view.addListener(EventBase.REMOVED, this.retainingWallRemoved, this);
		this.addChild(view);
	}

	retainingWallRemoved(e) {
		const view = e.target;
		if (view) {
			view.removeListener(EventBase.REMOVED, this.segmentationViewRemoved);
		}
	}

	/**
	 * @private
	 */
	measurementsModelChanged() {
		const isBatterMode = this._measurementsModel.currentMode === MeasurementsLayerModel.MODE_BATTER;

		console.log('setting isBatterMode ', isBatterMode);
		this.points.forEach(
			(point) => {
				point.selectMode = isBatterMode;
			}
		);
	}

	/**
	 * @private
	 */
	modelChanged() {
		// @TODO @FALL-LINES: refresh & redraw the fall lines here
	}

	/**
	 * @param e {KeyboardEventWrapper}
	 */
	keyDownEvent(e) {
		if (DEBUG && (e.nativeEvent.key === 's' || e.nativeEvent.key === 'g')) {
			const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
			this._surface.clear();

			this._model.interpolator.subSurfaces.forEach(
				(area, i) => {
					// Draw the perimeter
					this._surface.beginFill(colors[i], 0.2);
					this._surface.lineStyle(4 + 2 * i, colors[i], 0.5);
					[...area.perimeter.edges, area.perimeter.edges[0]].forEach((edge, index) => {
						index === 0 ?
							this._surface.moveTo(m.px(edge.a.x), m.px(edge.a.y)) :
							this._surface.lineTo(m.px(edge.a.x), m.px(edge.a.y));
					});
					this._surface.endFill();

					// Draw the triangles - if they exist
					if (area.interpolator instanceof TriangulatedSurfaceInterpolator) {
						area.interpolator.faces.forEach(
							face => {
								this._surface.beginFill(colors[i], 0.1);
								[...face.points, face.points[0]].forEach(
									(point,index) => index > 0 ?
										this._surface.lineTo(m.px(point.x), m.px(point.y)) :
										this._surface.moveTo(m.px(point.x), m.px(point.y))
								);
								this._surface.endFill();
							}
						);
					}

					// Draw the height level points
					area.points.forEach( point => {
						this._surface.drawCircle(m.px(point.x), m.px(point.y), 8 + 4 * i);
					});
				}
			);
		}

		if (DEBUG && e.nativeEvent.key === 'k') {
			this._surface.clear();

			// interpolate over the surface's bounding box
			let low = this.model.baseLevel;
			let high = this.model.topLevel;
			let diff = high - low;
			let area = this.model.bounds;
			let px;
			let py;
			let val;
			let col;
			let step = .2;

			// inflate the rectangle in all directions
			// area.pad(1, 1);

			for (px = area.left; px <= area.right; px += step) {
				for (py = area.top; py <= area.bottom; py += step) {
					val = this.model.heightLevel(px, py);
					// translate to 0 -> 1
					val	= (val - low) / diff;

					// col	= 112 + uint( val * 32 );
					col	= 32 + Number(val * 192);
					col	= (col) + (col << 8) + (col << 16);

					// draw a height point
					this._surface.beginFill(col, .6);
					this._surface.drawCircle(m.px(px), m.px(py), 3);
					this._surface.endFill();
				}
			}

			// draw interpolation surfaces
			if (e.nativeEvent.shiftKey) {
				let colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];

				// draw the interpolation areas
				for (let s = 0; s < this.model.interpolator.slices.length; ++s) {
					let slice = this.model.interpolator.slices[s];

					this._surface.beginFill(colors[s], .075);
					for (let i = 0; i < slice.points.length; ++i) {
						px = m.px(slice.points[i].x);
						py = m.px(slice.points[i].y);

						if (!i) {
							this._surface.moveTo(px, py);
						}	else {
							this._surface.lineTo(px, py);
						}
					}
					this._surface.endFill();
				}
			}

			// build the house
			let points = this.model.getHouseSamplePoints(1);
			let i;

			for (i = 0; i < points.length; ++i) {
				px = points[i].x;
				py = points[i].y;

				this._surface.beginFill(0x0088BB, .1);
				this._surface.drawCircle(m.px(px), m.px(py), 3);
				this._surface.endFill();
			}
		}

		if (DEBUG && e.nativeEvent.key === 'l') {
			this._surface.clear();
			// Utils.removeChildrenOfParent(this._surface);
		}
	}
}