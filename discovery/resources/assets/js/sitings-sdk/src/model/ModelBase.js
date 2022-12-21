/*
[EventBase(name="added", type="flash.events.EventBase")]
[EventBase(name="change", type="flash.events.EventBase")]
[EventBase(name="complete", type="flash.events.EventBase")]
[EventBase(name="progress", type="flash.events.ProgressEvent")]
 */

import EventDispatcher from "../events/EventDispatcher";
import EventBase from "../events/EventBase";
import ProgressEventBase from "../events/ProgressEventBase";

export default class ModelBase extends EventDispatcher
{
    /**
     * @param context {*}
     */
	constructor(context=null)
	{
		super(context);

        /**
         * @type {EventBase}
         * @private
         */
        this._changeEvent = null;
        /**
         * @type {EventBase}
         * @private
         */
        this._addedEvent = null;
        /**
         * @type {EventBase}
         * @private
         */
        this._completeEvent = null;
    }

	onChange(e=null) {
		if ( !this._changeEvent )
            this._changeEvent = new EventBase(EventBase.CHANGE, this);
		this.dispatchEvent(this._changeEvent);
	}
	onAdded (e=null) {
		if ( !this._addedEvent )
            this._addedEvent = new EventBase(EventBase.ADDED, this);
		this.dispatchEvent(this._addedEvent);
	}
	onComplete(e=null) {
		if ( !this._completeEvent )
            this._completeEvent = new EventBase(EventBase.COMPLETE, this);
        this.dispatchEvent(this._completeEvent);
	}
	onProgress( loaded, total )
	{
		this.dispatchEvent(new ProgressEventBase(ProgressEventBase.PROGRESS, this, false, false, loaded, total));
	}
}