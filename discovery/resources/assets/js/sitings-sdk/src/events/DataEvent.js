import EventBase from './EventBase';

export default class DataEvent extends EventBase {
    /**
     * @param type {string}
     * @param dispatcher {Object}
     * @param bubbles {boolean}
     * @param cancelable {boolean}
     * @param data {*}
     */
    constructor(type, dispatcher=null, bubbles=false, cancelable=false, data=null)
    {
        super(type, dispatcher, bubbles, cancelable);

        this._data = data;
    }

    /**
     * @return {*}
     */
    get data() { return this._data; }
    
    /**
     * @param v {*}
     */
    set data(v) { this._data=v; }
}