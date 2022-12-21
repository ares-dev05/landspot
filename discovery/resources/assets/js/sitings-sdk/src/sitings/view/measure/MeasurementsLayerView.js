import * as PIXI from 'pixi.js';
import EventBase from '../../../events/EventBase';
import MeasurementPointView from './MeasurementPointView';
import MeasurementsLayerModel from '../../model/measure/MeasurementsLayerModel';
import KeyboardLayer from '../../global/KeyboardLayer';
import KeyboardEventWrapper from '../../events/KeyboardEventWrapper';
import ViewSettings from '../../global/ViewSettings';
import m from '../../../utils/DisplayManager';
import MeasurementPointEvent from '../../events/MeasurementPointEvent';

export default class MeasurementsLayerView extends PIXI.Sprite {

	/**
	 * @param model {MeasurementsLayerModel}
	 */
	constructor(model)
	{
		super();

		this._model	= model;
		this._model.addEventListener(EventBase.ADDED, this.onMeasurementAdded, this);

		/**
		 * @type {MeasurementPointView[]}
		 * @private
		 */
		this._views	= [];

		/**
		 * @type {MeasurementPointLabelView[]}
		 * @private
		 */
		this._labels = [];

		/**
		 * @type {PIXI.Point}
		 * @private
		 */
		this._lastPosition	= null;

		if (this._model.points.length) {
			for (let i=0; i<this._model.points.length; ++i) {
				this._innerAddMeasurementView(new MeasurementPointView(this._model.points[i]));
			}
		}
	}

	/**
	 * @returns {MeasurementsLayerModel}
	 */
	get model()		{ return this._model; }

	/**
	 * @returns {MeasurementPointView[]}
	 */
	get points()	{ return this._views; }

	/**
	 * @returns {MeasurementPointView}
	 */
	get lastMeasurement() { return this._views[this._views.length-1]; }

	/**
	 * @private
	 */
	onMeasurementAdded() {
		// Add the measurement view
		this._innerAddMeasurementView(new MeasurementPointView(this._model.latestPoint));
	}

    /**
     * @param view {MeasurementPointView}
     * @private
     */
    _innerAddMeasurementView(view) {
        view.addListener(EventBase.REMOVED, this._viewRemoved, this);
        view.addListener(MeasurementPointEvent.EDIT, this._pointViewEdit, this);

        this._views.push(view);
        this.addChild(view);

        // Add the label
        // const label = new MeasurementPointLabelView(view);
        // this.parent.parent.parent.addChild(label);

        // Add measurements on next frame
        ViewSettings.instance.application.ticker.addOnce(
            // event
            this._addEventsOnNextFrame,
            // context
            this
        );

        switch (this._model.currentMode) {
            case MeasurementsLayerModel.MODE_HOUSE_ALIGNMENT:
                view.isAlignMeasurement = true;
                break;

            case MeasurementsLayerModel.MODE_PAGE_ALIGNMENT:
                view.isAlignMeasurement = true;
                view.alpha = 0;
                break;

            default:
                break;
        }
    }

	/**
	 * @private
	 */
	_addEventsOnNextFrame()
	{
		// listen to mouse interactions
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_MOVE,	   this._onMouseMove, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP,		   this._mouseUp, this);
		ViewSettings.i.interaction.addListener(EventBase.MOUSE_UP_OUTSIDE, this._mouseUp, this);

		// listen to keyboard strokes; these can change where the measurements snap to
		// i.e. to corners when Ctrl is pressed, to rooflines when Shift is pressed
		KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_DOWN, this._onKeyboardEvent, this);
		KeyboardLayer.i.addEventListener(KeyboardEventWrapper.KEY_UP  , this._onKeyboardEvent, this);
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	_onMouseMove(event)
	{
		// store the position for keyboard events
		// this._lastPosition = this.parent.toLocal(event.data.global);
		this._lastPosition = this.toLocal(event.data.global);

		// Update the anchor point for the current measurement
		this._model.updateCurrentPoint(
			m.toMeters(this._lastPosition.x), m.toMeters(this._lastPosition.y)
		);
	}

	/**
	 * @param event {KeyboardEventWrapper}
	 * @private
	 */
	_onKeyboardEvent(event)
	{
		// Check if the user tapped Escape
		if (event.nativeEvent.key==='Escape') {
			this._model.cancelCurrentPoint();
		}

		if (this._model.currentMode===MeasurementsLayerModel.MODE_PAGE_ALIGNMENT) {
			const directions = {
				'ArrowLeft':  MeasurementsLayerModel.DIRECTION_LEFT,
				'ArrowRight': MeasurementsLayerModel.DIRECTION_RIGHT,
				'ArrowUp':    MeasurementsLayerModel.DIRECTION_UP,
				'ArrowDown':  MeasurementsLayerModel.DIRECTION_DOWN
			};

			// Align to the selected direction (if any)
			if (directions.hasOwnProperty(event.nativeEvent.key)) {
				this._model.alignDirectionSelected(
					directions[event.nativeEvent.key]
				);
			}
		}

		// Make sure we have something to update
		if (!this._lastPosition || !this._model.currentPoint) {
			return;
		}

		// The measurement point anchor doesn't move, but a keyboard press
		this._model.updateCurrentPoint(
			m.toMeters(this._lastPosition.x), m.toMeters(this._lastPosition.y)
		);
	}

	/**
	 * @param event {PIXI.interaction.InteractionEvent}
	 * @private
	 */
	_mouseUp(event)
	{
		// store the position for keyboard events
		// const position = this.parent.toLocal(event.data.global);
		const position = this.toLocal(event.data.global);

		if (this._model.endCurrentPoint(m.toMeters(position.x), m.toMeters(position.y))) {
			this._lastPosition = null;
			this._cleanupMeasurementEvents();
		}
	}

	/**
	 * @private
	 */
	_cleanupMeasurementEvents()
	{
		// event cleanup
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_MOVE, this._onMouseMove, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP, this._mouseUp, this);
		ViewSettings.i.interaction.removeListener(EventBase.MOUSE_UP_OUTSIDE, this._mouseUp, this);

		KeyboardLayer.i.removeEventListener(KeyboardEventWrapper.KEY_DOWN, this._onKeyboardEvent, this);
		KeyboardLayer.i.removeEventListener(KeyboardEventWrapper.KEY_UP  , this._onKeyboardEvent, this);
	}

	/**
	 * @param container {MeasurementsLayerView}
	 * @private
	 */
	_viewRemoved(container) {
		// in this context, 'this' represents the view that was removed, so it's a MeasurementPointView
		container.removeView(this);

		// cleanup any pending events
		this._cleanupMeasurementEvents();
	}

    /**
     * @param container {MeasurementsLayerView}
     * @private
     */
    _pointViewEdit(container) {
        if (this.isSetbackMode) {
            // set the current setback
            this._model.setback = container.point;
            // exit; all other batters will bubble up the measurement.edit event
        }
    }

    /**
     * @param view {MeasurementPointView}
     * @private
     */
    removeView(view) {
        if (view) {
            view.removeListener(EventBase.REMOVED, this._viewRemoved, this);
            view.removeListener(MeasurementPointEvent.EDIT, this._pointViewEdit, this);


            this._views.splice(this._views.indexOf(view), 1);
        }
    }
}