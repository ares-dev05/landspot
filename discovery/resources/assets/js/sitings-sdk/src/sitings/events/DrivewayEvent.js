import EventBase from "../../events/EventBase";

export default class DrivewayEvent extends EventBase {

	static get EDIT  () { return "drivewayEvent.edit";   }
	static get DELETE() { return "drivewayEvent.delete"; }

	/**
	 * @param type {string}
	 * @param model {LotDrivewayModel}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor(type, model=null, dispatcher=null, bubbles=false, cancelable=false)
	{
		super(type, dispatcher, bubbles, cancelable);

		/**
		 * @type {LotDrivewayModel}
		 * @private
		 */
		this._driveway = model ? model : this.target;
	}

	/**
	 * @return {LotDrivewayModel}
	 */
	get driveway() { return this._driveway; }

	/**
	 * @return {DrivewayEvent}
	 */
	clone()
	{
		return new DrivewayEvent(this.type, this.driveway, this.bubbles, this.cancelable);
	}
}