import ChangeDispatcher from "./ChangeDispatcher";
import RestoreEvent from "../sitings/events/RestoreEvent";

export default class RestoreDispatcher extends ChangeDispatcher {

	constructor(context=null)
	{
		super(context);
	}

	/**
	 * @protected
	 */
	onRestored()
	{
		// automatically dispatch onChange to inform CHANGE listeners that the model's data has been modified
		this.onChange();

		/**
		 * @type {RestoreEvent}
		 * @private
		 */
		this._restoreEvent = this._restoreEvent || new RestoreEvent(RestoreEvent.RESTORE_COMPLETE);
		this.dispatchEvent(this._restoreEvent);
	}
}