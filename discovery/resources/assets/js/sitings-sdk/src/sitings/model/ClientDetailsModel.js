import RestoreDispatcher from '../../events/RestoreDispatcher';

export default class ClientDetailsModel extends RestoreDispatcher {

	/**
	 * @param context {*}
	 */
	constructor(context=null)
	{
		super(context);

		/**
		 * @type {string}
		 * @private
		 */
		this._firstName		= '';
		/**
		 * @type {string}
		 * @private
		 */
		this._lastName		= '';
		/**
		 * @type {string}
		 * @private
		 */
		this._lotNumber		= '';
		/**
		 * @type {string}
		 * @private
		 */
		this._address		= '';
		/**
		 * @type {string}
		 * @private
		 */
		this._extraDetails	= '';


		this._lotNo = '';
		this._spNo = '';
		this._parentLotNo = '';
		this._parentSpNo = '';
	}

	get lotNo() { return this._lotNo; }
	/**
	 * @param v {string}
	 */
	set lotNo(v) { this._lotNo = v; this.onChange(); }

	get spNo() { return this._spNo; }
	/**
	 * @param v {string}
	 */
	set spNo(v) { this._spNo = v; this.onChange(); }

	get parentLotNo() { return this._parentLotNo; }
	/**
	 * @param v {string}
	 */
	set parentLotNo(v) { this._parentLotNo = v; this.onChange(); }

	get parentSpNo() { return this._parentSpNo; }
	/**
	 * @param v {string}
	 */
	set parentSpNo(v) { this._parentSpNo = v; this.onChange(); }

	/**
	 * @returns {string}
	 */
	get firstName()		{ return this._firstName; }
	/**
	 * @param v {string}
	 */
	set firstName(v)	{ this._firstName=v; this.onChange(); }

	/**
	 * @returns {string}
	 */
	get lastName()		{ return this._lastName; }
	/**
	 * @param v {string}
	 */
	set lastName(v)		{ this._lastName=v; this.onChange(); }

	/**
	 * @returns {string}
	 */
	get lotNumber()		{ return this._lotNumber; }
	/**
	 * @param v {string}
	 */
	set lotNumber(v)	{ this._lotNumber=v; this.onChange(); }

	/**
	 * @returns {string}
	 */
	get address()		{ return this._address; }
	/**
	 * @param v {string}
	 */
	set address(v)		{ this._address=v; this.onChange(); }

	/**
	 * @returns {string}
	 */
	get extraDetails()	{ return this._extraDetails; }
	/**
	 * @param v {string}
	 */
	set extraDetails(v)	{ this._extraDetails=v; this.onChange(); }

	/**
	 * resets all the details
	 */
	clear()
	{
		this._firstName		= '';
		this._lastName		= '';
		this._lotNumber		= '';
		this._address		= '';
		this._extraDetails	= '';
		this._lotNo			= '';
		this._spNo			= '';
		this._parentLotNo	= '';
		this._parentSpNo	= '';

		this.onRestored();
	}

	/**
	 * @param floors {MultiHouseModel}
	 * @returns {string}
	 */
	exportFileName(floors)
	{
		// lastname-firstname-lot#-address-housetype
		const pieces = [
			this.lastName,
			this.firstName,
			this.lotNumber,
			this.address
		];

		let fileParts = [], i, spreg = new RegExp( '[^a-zA-Z0-9]', 'g' );

		if (floors && floors.floors.length && floors.floors[0].houseData && floors.floors[0].houseData.name) {
			pieces.push(floors.floors[0].houseData.name);
		}

		for (i=0; i<pieces.length; ++i) {
			if ( pieces[i] && pieces[i].length ) {
				fileParts.push(pieces[i].toLowerCase().replace(spreg, ''));
			}
		}

		return fileParts.join("-");
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 * @returns {{firstName: string, lastName: string, address: string, lotNumber: string, extraDetails: string}}
	 */
	recordState()
	{
		return {
			firstName	 : this.firstName,
			lastName	 : this.lastName,
			lotNumber	 : this.lotNumber,
			address		 : this.address,
			extraDetails : this.extraDetails,
			lotNo		 : this.lotNo,
			spNo		 : this.spNo,
			parentLotNo  : this.parentLotNo,
			parentSpNo   : this.parentSpNo,
		};
	}

	/**
	 * Restores this object to the state represented by the 'state' data structure.
	 * @param state {{firstName: string, lastName: string, address: string, lotNumber: string, extraDetails: string}}
	 */
	restoreState(state)
	{
		if ( state.hasOwnProperty('firstName') ) {
			this._firstName		= state.firstName;
			this._lastName		= state.lastName;
			this._lotNumber		= state.lotNumber;
			this._address		= state.address;
			this._extraDetails	= state.extraDetails;

			if (state.hasOwnProperty('lotNo')) {
				this._lotNo		  = state.lotNo;
				this._spNo		  = state.spNo;
				this._parentLotNo = state.parentLotNo;
				this._parentSpNo  = state.parentSpNo;
			}
		}	else {
			// unknown format; clear everything
			this.clear();
		}

		this.onRestored();
	}
}