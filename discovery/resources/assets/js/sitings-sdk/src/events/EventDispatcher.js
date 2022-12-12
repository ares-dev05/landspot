export default class EventDispatcher {

    constructor(context=null) {
        /**
         * Internal reference to the original context
         * @type {Object}
         * @private
         */
        this.context = context || this;

        /**
         * Internal map of events
         * @private
         * @type {Array.<EventBase>}
         */
        this.events = [];
    }

    /**
     * Add an event listener (callback for a specific event type.
     * Call return false if a listener to stop the event propagation
     * @example bus.addEventListener('someEventType', onSomeEventType);
     * @param type {string} EventBase type, typically a String that will be stored in your event class
     * @param callback {function(Object)} Reference to the event handler
     * @param context {Object=} Optional scope for the event handler
     * @param priority {number=} Positive Number (0 by default). The higher the priority is, the sooner the event handler gets called
     */
    addEventListener(type, callback, context, priority=0) {
        // add an entry for this event type if not in the map already
        this.events[type] = this.events[type] || {};
        let listenerToInsert = {context:context, callback:callback, priority:priority};

        // same for listeners map (Array) for this event type
        if (this.events[type].listeners) {
            // insert at the right spot
            let listeners = this.events[type].listeners;
            let inserted = false;

            for (let i = 0, l = listeners.length; i < l; i++) {
                let listener = listeners[i];
                let eventPriority = listener.priority;
                // When events have the same priority, event adding order has priority: the events that are added first
                // have to be called first. As the listeners list is walked from the end, we put the latest events at the front of it
                if (priority <= eventPriority) {
                    listeners.splice(i, 0, listenerToInsert);
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                listeners.push(listenerToInsert);
            }
        }   else {
            this.events[type].listeners = [listenerToInsert];
        }
    };

    /**
     * Returns whether an event listener is registered for the specified event type (callback parameter specified) or if there is at least one listener specified for the event type (no callback parameter specified)
     * @example bus.hasEventListener('someEventType', onSomeEventType);
     * @example bus.hasEventListener('someEventType');
     * @param type {string}
     * @param callback {function(Object)=}
     * @return {boolean} true if an event listener is registered for the specified event type (callback parameter specified) or true if there is at least one listener specified for the event type (no callback parameter specified)
     */
    hasEventListener(type, callback) {
        let listeners = this.events[type] ? this.events[type].listeners : null;
        if (!listeners) {
            return false;
        }

        // if no callback is provided, check if any callback is defined for this event
        if (!callback) {
            return listeners.length > 0;
        }

        // looking for a specific event
        for (let i = 0, l = listeners.length; i < l; i++) {
            let listener = listeners[i];
            if (listener.callback === callback) {
                return true;
            }
        }
        return false;
    };

    /**
     * Remove an event handler for a specific type. If no callback is specified, all the event listeners for this event type are removed
     * @example bus.removeEventListener('someEventType', onSomeEventType);
     * @example bus.removeEventListener('someEventType');
     * @param {string} type
     * @param {function(Object)=} callback
     * @param context {Object=} Optional scope for the event handler
     */
    removeEventListener(type, callback, context) {
        let listeners = this.events[type] ? this.events[type].listeners : null;
        if (!listeners || listeners.length < 1) {
            return false;
        }
        // not defining a callback = remove all listeners
        if (!callback) {
            this.events[type].listeners = [];
            return true;
        }

        for (let i = 0, l = listeners.length; i < l; i++) {
            let listener = listeners[i];
            if (listener.callback===callback && listener.context===context) {
                listeners.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    /**
     * Dispatch and event on the event dispatched that will be caught by one of the event listener if attached.
     * @example bus.dispatchEvent({type:'someEventType, data:{someData:'someDataValue'}});
     * @param event {EventBase} Data can be passed to the event handler if there is a data property on the event object
     */
    dispatchEvent(event) {
        let type = event.type;
        // default
        let listeners = this.events[type] ? this.events[type].listeners : null;
        if (!listeners || listeners.length < 1) {
            // no listeners for this event
            return;
        }

        for (let i = listeners.length - 1; i >= 0; i--) {
            let listener = listeners[i];
            let callback = listener.callback;
            // merge listener data and event triggered data
            let callbackContext = listener.context ? listener.context : this.context;
            let result = callback.call(callbackContext, event);
            if (result !== undefined && !result) {
                break;
            }
        }
    };

}