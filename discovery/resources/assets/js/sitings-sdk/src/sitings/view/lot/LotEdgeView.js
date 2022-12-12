import EventBase from '../../../events/EventBase';
import ModelEvent from '../../events/ModelEvent';
import Point from '../../../geom/Point';
import m from '../../../utils/DisplayManager';
import * as PIXI from 'pixi.js';
import Utils from '../../../utils/Utils';
import LineDrawer from '../../render/LineDrawer';
import Segment from '../../../geom/Segment';
import Geom from '../../../utils/Geom';
import Render from '../../global/Render';
import LotPointView from './LotPointView';
import LotEdgeEvent from '../../events/LotEdgeEvent';


export default class LotEdgeView extends PIXI.Sprite {

	static get MODE_DRAW() { return 0; }
	static get MODE_VIEW() { return 1; }

	/**
	 * @param model {LotEdgeModel}
	 * @param theme {LabeledPolygonTheme}
	 * @param allowManualControl {boolean}
	 */
	constructor(model, theme, allowManualControl=false)
	{
		super();

		/**
		 * Listen to interaction events on this sprite
		 * @type {boolean}
		 */
		this.interactive = true;
		this.interactiveChildren = true;

		/**
		 * @type {LotEdgeModel}
		 * @protected
		 */
		this._model	= model;
		this._model.addEventListener(EventBase.CHANGE, this.onModelChange, this);
		this._model.addEventListener(LotEdgeEvent.UPDATE_NORMALS, this.updateLabel, this);
		this._model.addEventListener(ModelEvent.DELETE, this.onEdgeDelete, this);

		/**
		 * @type {LabeledPolygonTheme}
		 * @protected
		 */
		this._theme = theme;
		this._theme.addEventListener(EventBase.CHANGE, this.onThemeChanged, this);

		/**
		 * The current view mode
		 * @type {number}
		 * @protected
		 */
		this._mode = LotEdgeView.MODE_DRAW;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._allowManualControl = allowManualControl;

		/**
		 * @type {PIXI.Graphics}
		 * @protected
		 */
		this._edgeGraphics	= new PIXI.Graphics();
		this.addChild(this._edgeGraphics);

		// If this view is created for manual tracing mode, create draggable controllers for the segments ends
		// and for the curve center
		if (this._allowManualControl) {
			this.addChild(
				this._controlA = new LotPointView(this._model.manipulator.a)
			);
			this.addChild(
				this._controlB = new LotPointView(this._model.manipulator.b)
			);
			this.addChild(
				this._controlC = new LotPointView(this._model.manipulator.c, true)
			);

			if (this._model.manipulator) {
				this._model.manipulator.addEventListener(EventBase.CHANGE, this.onModelChange, this);
			}
		}

		/**
		 * @type {number}
		 * @private
		 */
		this._viewAngle		= 0;

		/**
		 * @type {PIXI.Sprite}
		 * @private
		 */
		this._lblHolder		= new PIXI.Sprite();

		/**
		 * @type {PIXI.TextStyle}
		 * @private
		 */
		this._labelStyle	= new PIXI.TextStyle({
			fontFamily : 'Arial',
			fontSize: this._theme.labelFontSize * Render.FONT_RESOLUTION,
			fontWeight: 'normal',
			fill : this._theme.labelColor,
			align : 'center'
		});

		/**
		 * @type {PIXI.Text}
		 * @private
		 */
		this._edgeLabel		 = new PIXI.Text('test', this._labelStyle);

		this.addChild(this._lblHolder);
		this._lblHolder.addChild(this._edgeLabel);
		this._lblHolder.scale = new Point(
			1.0 / Render.FONT_RESOLUTION,
			1.0 / Render.FONT_RESOLUTION
		);

		// Listen to app zoom level changes
		m.instance.addEventListener(EventBase.CHANGE, this.render, this);
		m.instance.addEventListener(m.ROTATION_CHANGE, this.updateLabelRotation, this);

		this.render();
	}

	/**
	 * @return {number}
	 */
	get mode() { return this._mode; }

	/**
	 * @param v {number}
	 */
	set mode(v) {
		if ((this._mode=v) === LotEdgeView.MODE_VIEW) {
			// @TODO
		}

		this.render();
	}

	/**
	 * @return {LotEdgeModel}
	 */
	get model() { return this._model; }

	/**
	 * @return {Rectangle}
	get displayBounds()
	{
		return new Rectangle();
		let a = Utils.localToGlobalTransform( this, m.px(this._model.a.x), m.px(this._model.a.y );
		let b = Utils.localToGlobalTransform( this, m.px(this._model.b.x), m.px(this._model.b.y) );

		return new Rectangle(
			Math.min(a.x, b.x),
			Math.min(a.y, b.y),
			Math.abs(a.x-b.x),
			Math.abs(a.y-b.y)
		);
	}
	 */

	/**
	 * @param v {boolean}
	 */
	// set interactive(v) { this._graphics.interactive = v; }

	/**
	 * @param e {EventBase}
	 */
	onModelChange(e)
	{
		this.render();
		this.emit(EventBase.CHANGE, this);
	}

	/**
	 * @param e {EventBase}
	 */
	onEdgeDelete(e)
	{
		// cleanup
		if (this._edgeGraphics) {
			this.removeChild(this._edgeGraphics);
			this._edgeGraphics = null;
		}
		if (this._model) {
			this._model.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			this._model.removeEventListener(LotEdgeEvent.UPDATE_NORMALS, this.updateLabel, this);
			this._model.removeEventListener(ModelEvent.DELETE, this.onEdgeDelete, this);

			if (this._model.manipulator) {
				this._model.manipulator.removeEventListener(EventBase.CHANGE, this.onModelChange, this);
			}

			this._model	= null;
		}
		if (this._theme) {
			this._theme.removeEventListener(EventBase.CHANGE, this.onThemeChanged, this);
			this._theme = null;
		}

		m.instance.removeEventListener(EventBase.CHANGE, this.render, this);

		if (!this.stage) {
			this.emit(EventBase.REMOVED, this);
		}

		Utils.removeParentOfChild(this);
	}

	/**
	 * @param event {DataEvent}
	 */
	onThemeChanged(event)
	{
		if (event.data.prop==='lineThickness' || event.data.prop==='lineColor') {
			this.renderByCoordinates();
		}	else
		if (event.data.prop==='labelFontFamily') {
			this._labelStyle.fontFamily = this._theme.labelFontFamily;
		}	else
		if (event.data.prop==='labelColor') {
			this._labelStyle.fill = this._theme.labelColor;
		}	else
		if (event.data.prop==='labelFontSize') {
			this._labelStyle.fontSize =  this._theme.labelFontSize * Render.FONT_RESOLUTION;
			this.updateLabel();
		}
	}

	/**
	 * @return {number}
	 */
	get currentThickness() { return this._theme.lineThickness; }

	/**
	 * @return {number}
	 */
	get currentColor()
	{
		if (this._model.highlight) {
			return 0x00AAEE;
		}

		return this._theme.lineColor;

		/*
		switch ( this._mode )
		{
			case LotEdgeView.MODE_DRAW:
				return this._model.length===0 ? 0xFF0000 : ( this._allowManualControl ? 0x41BC1B : 0x151515 ); // 0x41BC1B;
			case LotEdgeView.MODE_VIEW:
				return this._allowManualControl ? 0x41BC1B : 0;
		}
		return this._allowManualControl ? 0x41BC1B : 0;
		 */
	}

	render()
	{
		this.renderByCoordinates();
		this.updateLabel();
	}

	renderByCoordinates()
	{
		// Delete previous view
		this._edgeGraphics.clear();

		// Set the line style / draw it
		this._edgeGraphics.lineStyle(this.currentThickness, this.currentColor, 1, Render.LINE_ALIGNMENT, Render.LINE_NATIVE);

		// Draw a straight line
		LineDrawer.drawLine(
			this._edgeGraphics,
			m.px(this._model.a.x), m.px(this._model.a.y),
			m.px(this._model.b.x), m.px(this._model.b.y),
			LineDrawer.LINE_HIT_THICKNESS
		);

		this.renderLineEnd();

		/*
		@DEBUG: rendering in/out normals
		this._edgeGraphics.lineStyle(1,0xFF0000);
		this._edgeGraphics.moveTo( m.px(this._model.outNormal.a.x), m.px(this._model.outNormal.a.y) );
		this._edgeGraphics.lineTo( m.px(this._model.outNormal.b.x), m.px(this._model.outNormal.b.y) );

		this._edgeGraphics.lineStyle(1,0x00FF00);
		this._edgeGraphics.moveTo( m.px(this._model.inNormal.a.x), m.px(this._model.inNormal.a.y) );
		this._edgeGraphics.lineTo( m.px(this._model.inNormal.b.x), m.px(this._model.inNormal.b.y) );
		 */
	}

	/**
	 * @protected
	 */
	renderLineEnd()
	{
		if (this._theme.renderLineEnds && this.currentThickness > 1) {
			this._edgeGraphics.beginFill(this.currentColor, 1);
			this._edgeGraphics.lineStyle(1, 0, 0);
			this._edgeGraphics.drawCircle(m.px(this._model.b.x), m.px(this._model.b.y), this.currentThickness/2);
			this._edgeGraphics.endFill();
		}
	}

	displayLabel(display=true) {
		if (this._lblHolder) {
			if (display && !this._lblHolder.parent) {
				this.addChild(this._lblHolder);
			}
			if (!display && this._lblHolder.parent) {
				this.removeChild(this._lblHolder);
			}
		}
	}

	updateLabel()
	{
		let labelDist;

		// update the text
		if (this._allowManualControl && this._model.manipulator) {
			// Show the label in 'trace' mode - just the length is displayed
			labelDist = this._theme.labelFontSize;
			this._edgeLabel.text = this._model.manipulator.length.toFixed(3);
		}	else {
			// The label is shown in the normal lot view
			labelDist = this._model.isCurve ? (3 * this._theme.labelFontSize) : this._theme.labelFontSize;
			this._edgeLabel.text = this._model.description;
		}

		// center the text field in the label holder
		this._edgeLabel.x		 = -this._edgeLabel.width  / 2;
		this._edgeLabel.y		 = -this._edgeLabel.height / 2;

		// calculate the view normal
		let normal = this._model.outNormal,
			viewNormal = new Segment(
				new Point(m.px(normal.a.x), m.px(normal.a.y)),
				new Point(m.px(normal.b.x), m.px(normal.b.y))
			);

		// make sure the label is positioned at a pixel distance, and not at a metric distance from the edge
		viewNormal.normalize(labelDist);

		// make sure the normal starts from the center of the curve segment
		if (this._model.isCurve && this._model.isInvalidCurve===false && this._model.length > 0)
		{
			// move the normal to start from the centre of the curve segment
			let center = this._model.curveMidpoint;
			viewNormal.startFrom(
				m.px(center.x),
				m.px(center.y)
			);
		}

		this._lblHolder.x = viewNormal.b.x;
		this._lblHolder.y = viewNormal.b.y;

		this._viewAngle	  = viewNormal.angle;

		// make sure the text is always readable from the left to right
		this.updateLabelRotation();
	}

	updateLabelRotation()
	{
		// make sure the text is always readable from the left to right
		let lblAngle = Geom.limitDegrees( Geom.rad2deg(this._viewAngle) + m.i.viewRotation + 90 );
		if (lblAngle > 45 && lblAngle < 235)
			lblAngle += 180;

		lblAngle = Geom.limitDegrees(lblAngle - m.i.viewRotation);
		
		this._lblHolder.rotation	= Geom.deg2rad(lblAngle);
	}
}