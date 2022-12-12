import EventDispatcher from './EventDispatcher';
import EventBase from './EventBase';
import ModelEvent from '../sitings/events/ModelEvent';

export default class ChangeDispatcher extends EventDispatcher {

	constructor(context=null)
	{
		super(context);
	}

	onChange()
    {
        /**
         * @type {EventBase}
         * @private
         */
        this._changeEvent = this._changeEvent || new EventBase(EventBase.CHANGE, this);
        this.dispatchEvent(this._changeEvent);
    }
	onAdded ()
    {
        /**
         * @type {EventBase}
         * @private
         */
        this._addedEvent = this._addedEvent || new EventBase(EventBase.ADDED, this);
        this.dispatchEvent(this._addedEvent);
    }
	onDelete()
    {
        this.dispatchEvent(new ModelEvent(ModelEvent.DELETE, this, this));
    }
	onSelect()
    {
        this.dispatchEvent(new ModelEvent(ModelEvent.SELECT, this, this));
    }
}