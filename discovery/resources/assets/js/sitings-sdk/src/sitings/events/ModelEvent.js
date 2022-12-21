import EventBase from '../../events/EventBase';

export default class ModelEvent extends EventBase {

	// dispatched when the model is deleted
	static get DELETE() { return 'modelEvent.delete'; }
	// dispatched when the model is selected from a group of similar models
	static get SELECT() { return 'modelEvent.select'; }

	/**
	 * @return {ChangeDispatcher|*}
	 */
	get model() { return this._model; }

	/**
	 * @param type {String}
	 * @param model {ChangeDispatcher}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, model=null, dispatcher=null, bubbles=false, cancelable=false )
	{
		super(type, dispatcher||model, bubbles, cancelable);

		/**
		 * @type {ChangeDispatcher}
		 * @private
		 */
		this._model = model || this.dispatcher;
	}

	/**
	 * @return {ModelEvent}
	 */
	clone()
	{
		return new ModelEvent( this.type, this.model, this.dispatcher, this.bubbles, this.cancelable );
	}
}