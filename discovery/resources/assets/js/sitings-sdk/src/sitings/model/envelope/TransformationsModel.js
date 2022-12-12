import EventBase from '../../../events/EventBase';
import TransformationPoint from './TransformationPoint';
import HouseSlab from './HouseSlab';
import FacadeModel from './FacadeModel';
import ModelEvent from '../../events/ModelEvent';
import RestoreDispatcher from '../../../events/RestoreDispatcher';


export default class TransformationsModel extends RestoreDispatcher{

	/**
	 * @param facade {FacadeModel}
	 */
	constructor (facade) {
		super();

		// setup the facade
		/**
		 * @type {FacadeModel}
		 * @private
		 */
		this._facade = null;

		/**
		 * @type {TransformationPoint[]}
		 * @private
		 */
		this._transformations = [];

		// add the SLAB transformation
		// @TEMP!!
		this.addTransformation(new TransformationPoint(0, HouseSlab.NAME, 0, 0.435));
		this.facade = facade;
	}

	/**
	 * @return {TransformationPoint[]}
	 * @public
	 */
	get transformations() {
		return this._transformations;
	}

	/**
	 * @param level {number}
	 * @return {string|null}
	 * @public
	 */
	extensionPoint(level) {
		for (let point in this.transformations) {
			if (point.level === level)
				return point;
		}
		return null;
	}

	/**
	 * @return {FacadeModel}
	 * @public
	 */
	get facade() {
		return this._facade;
	}

	/**
	 * @param v {FacadeModel}
	 * @public
	 */
	set facade(v) {
		this._facade = v;
		this._facade.addEventListener(FacadeModel.FACADE_CHANGED, this.onNewFacadeSelected, this);
	}

	/**
	 * @public
	 */
	onNewFacadeSelected() {
		if (this.transformations.length >= 2){return}

		this.facade.extensionInfos.sort(TransformationPoint.compareLevel);

		// disable all points > the PAD

		for (let point of this.transformations) {
			point.enabled = !point.level;
		}

		// load the predefined points for this facade;
		for (let point of this.facade.extensionInfos) {
			if (this.extensionPoint(point.level)) {
				this.extensionPoint(point.level).load(point);
			} 	else {
				this.addTransformation(point);
			}
		}

		// @TODO: remove the points that aren't needed

		// sort the remaining points
		this.transformations.sort( TransformationPoint.compareLevel );
		this.onChange();
	}

	clear() {
		/**
		 * @TODO
			while ( _transformations.length ) {
				_transformations[0].deleteTransformation();
			}
			dispatchEvent(new EventBase("updateView"));
		 */
	}

	/**
	 * @return {TransformationPoint}
	 * @public
	 */
	get lastTransformation() {
		return this._transformations[this._transformations.length-1];
	}

	/**
	 * @param model {TransformationPoint}
	 * @public
	 */
	addTransformation(model) {
		this._transformations.push(model);

		model.addEventListener(EventBase.CHANGE, this.pointChanged, this);
		model.addEventListener(ModelEvent.DELETE, this.pointDeleted, this);

		this.dispatchEvent(new EventBase(EventBase.ADDED, this));
	}

	/**
	 * @private
	 */
	pointChanged() {
		this.onChange();
	}

	/**
	 * @param e {ModelEvent}
	 * @private
	 */
	pointDeleted(e) {
		const model = e.dispatcher;

		model.removeEventListener(EventBase.CHANGE, this.pointChanged, this);
		model.removeEventListener(ModelEvent.DELETE, this.pointDeleted, this);

		this._transformations.splice(this._transformations.indexOf(model),1);
		this.onChange();
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
	 * @param state the state to be restored
	 */
	restoreState(state) {
	}
}










