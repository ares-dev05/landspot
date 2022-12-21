import RestoreDispatcher from '../../../../events/RestoreDispatcher';
import ModelEvent from '../../../events/ModelEvent';
import EventBase from '../../../../events/EventBase';

let _instanceKey = Symbol();

export default class ManipulationManager extends RestoreDispatcher {

	/**
	 * @return {ManipulationManager}
	 */
	static get instance() {
		if (!this[_instanceKey]) {
			this[_instanceKey] = new ManipulationManager(_instanceKey);
		}

		return this[_instanceKey];
	}

	/**
	 * @return {ManipulationManager}
	 */
	static get i() { return this.instance; }


	constructor(constructKey) {
		super();

		if (_instanceKey!==constructKey) {
			throw new Error('The class \'ManipulationManager\' is a singleton.');
		}

		/**
		 * @type {LotEdgeManipulator[]}
		 * @private
		 */
		this._manipulators		= [];

		/**
		 * @type {Function[]}
		 * @private
		 */
		this._listeners			= [];
		this._listenerScopes	= [];

		/**
		 * @type {boolean} Done by default as we're not in trace mode
		 * @private
		 */
		this._manipulationDone	= true;

		/**
		 * @type {number}
		 * @private
		 */
		this._globalPpm			= 1;
	}

	/**
	 * @returns {boolean}
	 */
	get manipulationDone()	{ return this._manipulationDone; }

	/**
	 * @param v {boolean}
	 */
	set manipulationDone(v)	{ this._manipulationDone=v; this.onChange(); }

	/**
	 * @param callback {Function}
	 * @param scope {Object}
	 * @public
	 */
	listen(callback, scope=null) {
		this._listeners.push(callback);
		this._listenerScopes.push(scope);
	}

	/**
	 * @param callback {Function}
	 */
	unlisten(callback) {
		const index = this._listeners.indexOf(callback);

		if (index>=0) {
			this._listeners.splice(index, 1);
			this._listenerScopes.splice(index, 1);
		}
	}

	/**
	 * @returns {number}
	 */
	get ppmFactor() {
		if (!this._manipulators || !this._manipulators.length) {
			return 1;
		}

		let sum = 0;
		for (let i=0; i<this._manipulators.length; ++i) {
			sum += this._manipulators[i].ppmFactor;
		}

		return sum / this._manipulators.length;
	}

	/**
	 * @param manipulator {LotEdgeManipulator}
	 */
	add(manipulator) {
		manipulator.addEventListener(ModelEvent.DELETE, this.manipulatorDeleted, this);
		manipulator.addEventListener(EventBase.CHANGE,  this.manipulatorChanged, this);

		this._manipulators.push(manipulator);

		if (!this.manipulationDone) {
			manipulator.reset();
			manipulator.enabled = true;
		}
	}

	/**
	 * @param manipulator {LotEdgeManipulator}
	 */
	remove(manipulator) {
		manipulator.removeEventListener(ModelEvent.DELETE, this.manipulatorDeleted, this);
		manipulator.removeEventListener(EventBase.CHANGE,  this.manipulatorChanged, this);

		this._manipulators.splice(this._manipulators.indexOf(manipulator), 1 );
	}

	/**
	 * Enabled the lot edge manipulators
	 * @public
	 */
	start()
	{
		this.manipulationDone = false;
		for (let i=0; i<this._manipulators.length; ++i) {
			this._manipulators[i].reset();
			this._manipulators[i].enabled = true;
		}
	}

	/**
	 * Apply the calibration to all the edges
	 * @public
	 */
	applyToAllEdges()
	{
		let i;

		for (i=0; i<this._manipulators.length; ++i) {
			this._manipulators[i].apply();
		}
		for (i=0; i<this._manipulators.length; ++i) {
			this._manipulators[i].reset();
		}
		for (i=0; i<this._manipulators.length; ++i) {
			this._manipulators[i].fixate();
		}

		// make the last edge snap to the first
		if (this._manipulators.length > 1) {
			this._manipulators[this._manipulators.length-1].snapEndTo(this._manipulators[0].a);
		}

		for (i=0; i<this._manipulators.length; ++i) {
			this._manipulators[i].enabled = false;
		}

		for (i=0; i<this._listeners.length; ++i) {
			let callback = this._listeners[i];
			let context  = this._listenerScopes[i] ? this._listenerScopes[i] : this;

			callback.call(context, this._manipulators[0].ppmFactor, this._manipulators[0].a);
		}

		this.manipulationDone = true;
	}

	/**
	 * @param e {EventBase}
	 * @private
	 */
	manipulatorChanged(e)	{ }

	/**
	 * @param e {EventBase}
	 * @private
	 */
	manipulatorDeleted(e)	{ this.remove(e.dispatcher); }
}