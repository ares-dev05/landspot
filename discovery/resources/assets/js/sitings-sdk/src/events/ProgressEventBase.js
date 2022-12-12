import EventBase from "./EventBase";

export default class ProgressEventBase extends EventBase {

    static get PROGRESS() { return "progress"; }

    /**
     * @param type {string}
     * @param dispatcher {Object}
     * @param bubbles {boolean}
     * @param cancelable {boolean}
     * @param loaded {number}
     * @param total {number}
     */
    constructor(type, dispatcher=null, bubbles=false, cancelable=false, loaded=0, total=0) {
        super(type, dispatcher, bubbles, cancelable);

        /**
         * @type {number}
         * @private
         */
        this._loaded = loaded;

        /**
         * @type {number}
         * @private
         */
        this._total = total;
    }

    get loaded() { return this._loaded; }
    get total() { return this._total; }
}