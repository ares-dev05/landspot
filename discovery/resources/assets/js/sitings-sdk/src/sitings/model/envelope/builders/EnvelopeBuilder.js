import ChangeDispatcher from '../../../../events/ChangeDispatcher';

export default class EnvelopeBuilder extends ChangeDispatcher{
	constructor(){
		super();

		/**
		 * @type {null|EnvelopeStructure}
		 * @private
		 */
		this._envelope = null;
	}

	/**
	 * @param v {EnvelopeStructure}
	 */
	set envelope(v){
		this._envelope = v;
		this.rebuild();
	}

	/**
	 * @return {EnvelopeStructure}
	 */
	get envelope() {
		return this._envelope;
	}

	rebuild() {
	}

	rebuildGround() {
	}
}