import EventBase from "../../events/EventBase";

export default class KeyboardEventWrapper extends EventBase {

    // dispatched when the model is deleted
    static get KEY_DOWN() { return "keydown"; }
    // dispatched when the model is selected from a group of similar models
    static get KEY_UP() { return "keyup"; }

    /**
     * @return {KeyboardEvent}
     */
    get nativeEvent() { return this._nativeEvent; }

    /**
     * @param type {String}
     * @param nativeEvent {KeyboardEvent}
     * @param dispatcher {Object}
     * @param bubbles {boolean}
     * @param cancelable {boolean}
     */
    constructor(type, nativeEvent, dispatcher=null, bubbles=false, cancelable=false )
    {
        super(type, dispatcher, bubbles, cancelable);

        /**
         * @type {KeyboardEvent}
         * @private
         */
        this._nativeEvent = nativeEvent;
    }
}