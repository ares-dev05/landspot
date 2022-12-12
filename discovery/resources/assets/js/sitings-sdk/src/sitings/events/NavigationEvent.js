import EventBase from "../../events/EventBase";

export default class NavigationEvent extends EventBase {

	// event type
	static get NAVIGATE()	{ return "nav.Navigate"; }

	// possible action types
	static get CLEAR_STEP() { return "nav.ClearStep"; }
	static get SAVE_STATE() { return "nav.SaveState"; }
	static get LOAD_STATE() { return "nav.LoadState"; }
	static get RESTART()	{ return "nav.Restart"; }
	static get LOG_OUT()	{ return "nav.LogOut"; }
	static get ADVANCE()	{ return "nav.Advance"; }
	static get STEP_BACK()	{ return "nav.StepBack"; }
	static get HELP()		{ return "nav.Help"; }

	/**
	 * @return {string}
	 */
	get action() { return this._action; }

	/**
	 * @param action {string}
	 * @param dispatcher {Object}
	 * @param bubbles {boolean}
	 * @param cancelable {boolean}
	 */
	constructor( action, dispatcher=null, bubbles=false, cancelable=false )
	{
		super(NavigationEvent.NAVIGATE, dispatcher, bubbles, cancelable);

		/**
		 * @type {string}
		 * @private
		 */
		this._action = action;
	}

	clone()
	{
		return new NavigationEvent( this.action, this.dispatcher, this.bubbles, this.cancelable );
	}
}