export default class EventBase {

    static get COMPLETE() { return 'complete'; }
    static get ADDED() { return 'added'; }
    static get CHANGE() { return 'change'; }
    static get REMOVED() { return 'removed'; }
    static get RESIZE() { return 'resize'; }
    static get CLICK() { return 'click'; }
    static get MOUSE_DOWN() { return 'mousedown'; }
    static get MOUSE_UP() { return 'mouseup'; }
    static get MOUSE_UP_OUTSIDE() { return 'mouseupoutside'; }
    static get MOUSE_MOVE() { return 'mousemove'; }
    static get MOUSE_OVER() { return 'mouseover'; }
    static get DROP() { return 'drop'; }

    /**
     * @param type {string}
     * @param dispatcher {Object}
     * @param bubbles {boolean}
     * @param cancelable {boolean}
     */
    constructor(type, dispatcher=null, bubbles=false, cancelable=false) {
        /**
         * @type {string}
         * @private
         */
        this._type = type;
        /**
         * @type {Object}
         * @private
         */
        this._dispatcher = dispatcher;
        /**
         * @type {boolean}
         * @private
         */
        this._bubbles = bubbles;
        /**
         * @type {boolean}
         * @private
         */
        this._cancelable = cancelable;
    }

    /**
     * @return {string}
     */
    get type() { return this._type; }

    /**
     * @return {Object}
     */
    get dispatcher() {return this._dispatcher;}

    /**
     * @unsupported
     * @return {boolean}
     */
    get bubbles() {return this._bubbles;}

    /**
     * @unsupported
     * @return {boolean}
     */
    get cancelable() {return this._cancelable;}
}