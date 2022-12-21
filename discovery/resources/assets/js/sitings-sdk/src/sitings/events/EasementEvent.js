import EventBase from "../../events/EventBase";

export default class EasementEvent extends EventBase {

	// dispatched when the easement needs to be deleted
	static get DELETE() { return "easementEvent.delete"; }

	// dispatched after the easement's parameters have been recalculated
	static RECALCULATE() { return "easementEvent.recalculate"; }


	/**
	 * @param type
	 * @param model {InnerEdgeModel|*}
	 * @param view
	 * @param dispatcher
	 * @param bubbles
	 * @param cancelable
	 */
	constructor(type, model=null, view=null, dispatcher=null, bubbles=false, cancelable=false) {
		super(type, dispatcher, bubbles, cancelable);

		/**
		 * @type {InnerEdgeModel|*}
		 * @private
		 */
		this._easement = model || dispatcher;
	}

	/**
	 * @return {InnerEdgeModel|*}
	 */
	get easement() { return this._easement; }
}
