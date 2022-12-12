import RestoreDispatcher from "../../../events/RestoreDispatcher";
import Geom from "../../../utils/Geom";

/**
 * Angle representation for lot edges, in Degrees/Minutes/Seconds format
 */
export default class LotEdgeAngle extends RestoreDispatcher {

	/**
	 * @return {number}
	 * @constructor
	 * @private
	 */
	static get VIEW_DELTA() { return 90; }

	/**
	 * @param d {number} degrees (0-360)
	 * @param m {number} minutes (0-59)
	 * @param s {number} seconds (0-59)
	 * @param flip {boolean} toggles a 180 rotation
	 * @param context {*}
	 */
	constructor(d=0, m=0, s=0, flip=false, context=null)
	{
		super(context);

		/**
		 * @type {number}
		 * @private
		 */
		this._degrees = d;
		/**
		 * @type {number}
		 * @private
		 */
		this._minutes = m;
		/**
		 * @type {number}
		 * @private
		 */
		this._seconds = s;
		/**
		 * @type {boolean}
		 * @private
		 */
		this._flip	  = flip;

		this._calculate();
	}

	/**
	 * @return {boolean}
	 */
	get flip() { return this._flip; }

	/**
	 * @return {number}
	 */
	get degrees() { return this._degrees; }

	/**
	 * @return {number}
	 */
	get minutes() { return this._minutes; }

	/**
	 * @return {number}
	 */
	get seconds() { return this._seconds; }

	/**
	 * @param v
	 */
	set flip(v) { this._flip=v; this.onChange(); }

	/**
	 * @param v
	 */
	set degrees(v) { this._degrees=v; this.onChange(); }

	/**
	 * @param v
	 */
	set minutes(v) { this._minutes=v; this.onChange(); }

	/**
	 * @param v
	 */
	set seconds(v) { this._seconds=v; this.onChange(); }

	/**
	 * self-explanatory
	 */
	toggleFlip() { this.flip = !this.flip; }

	/**
	 * @return {number} full decimal angle calculated from the integer degrees/minutes/seconds provided
	 */
	get decimalDegrees() { return this._decimalDegrees; }

	/**
	 * @return {number} angle in radians calculated form the integer degrees/minutes/seconds provided
	 */
	get radians() { return Geom.deg2rad( this.decimalDegrees ); }

	/**
	 * @param v {number} value in radians to set
	 */
	set radians(v)
	{
		// because the view is rotated by 90 degrees, we subtract it from the angle
		let valueDegrees = Geom.limitDegrees(Geom.rad2deg(v-Math.PI/2));

		this._degrees	 = Math.floor(valueDegrees);
		valueDegrees	-= this._degrees;
		valueDegrees	*= 60;

		this._minutes	 = Math.floor(valueDegrees);
		valueDegrees	-= this._minutes;
		valueDegrees	*= 60;

		// keep up to 2 decimals for the seconds
		this._seconds	= Math.floor( valueDegrees*100 )/100;

		// disable the flip
		this._flip		= false;

		this.onChange();
	}

	/**
	 * @private
	 */
	_calculate()
	{
		/**
		 * @type {number}
		 * @private
		 */
		this._decimalDegrees = Geom.limitDegrees(
			( this._flip ? 180 : 0 ) +
			LotEdgeAngle.VIEW_DELTA +
			this._degrees +
			this._minutes / 60.0 +
			this._seconds / 3600.0
		);
	}

	/**
	 * @param e {EventBase}
	 * @override
	 */
	onChange(e=null)
	{
		this._calculate();
		super.onChange(e);
	}

	toString()
	{
		return Math.floor(this.degrees)+"°"+Math.floor(this.minutes)+"'"+Math.floor(this.seconds)+"''";
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * returns a data structure containing all the parameters representing this object's state
	 * @return {{seconds: number, minutes: number, flip: boolean, degrees: number}}
	 */
	recordState()
	{
		return {
			flip	: this._flip,
			degrees	: this._degrees,
			minutes : this._minutes,
			seconds : this._seconds
		};
	}

	/**
	 * restores this object to the state represented by the supplied object
	 * @param state {{}} the state to be restored
	 */
	restoreState(state)
	{
		this._flip		= state.flip;
		this._degrees	= state.degrees;
		this._minutes	= state.minutes;
		this._seconds	= state.seconds;

		// calling onRestored will also trigger a call to 'onChange', which will recalculate the decimal degrees for the angle
		this.onRestored();
	}
}