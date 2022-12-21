import EventBase from "../../events/EventBase";

export default class RestoreEvent extends EventBase {

	static get RESTORE_COMPLETE() { return "restore.Complete"; }

	/**
	 * @param type {String}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, dispatcher=null, bubbles=false, cancelable=false )
	{
		super(type, dispatcher, bubbles, cancelable );
	}

	clone()
	{
		return new RestoreEvent(this.type, this.dispatcher, this.bubbles, this.cancelable);
	}
}