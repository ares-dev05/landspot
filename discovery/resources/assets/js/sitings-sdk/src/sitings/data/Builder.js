/*
	Id	Name							Abbreviation
	-==============================================-
	1 	New South Wales 				NSW
	2 	Australian Capital Territory 	ACT
	3 	Northern Territory 				NT
	4 	Queensland 						QLD
	5 	South Australia 				SA
	6 	Tasmania 						TAS
	7 	Victoria 						VIC
	8 	Western Australia 				WA
	9 	Dual Occ 						DOC
	-==============================================-
*/

import AccountMgr from './AccountMgr';

/**
 * @type {{}}
 * @private
 */
const _builderMap = {};

export default class Builder {

	static BURBANK		= new Builder( 'Burbank'	  , [4,7], [1,5], [], [], true,
		[
			// 0	N/A
			'',
			// 1 	New South Wales 				NSW
			'This siting plan is to be used solely to determine whether a particular Burbank Australia (NSW) Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 2 	Australian Capital Territory 	ACT
			'This siting plan is to be used solely to determine whether a particular Burbank Australia (NSW) Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 3 	Northern Territory 				NT
			'This siting plan is to be used solely to determine whether a particular Burbank Australia Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 4 	Queensland 						QLD
			'This siting plan is to be used solely to determine whether a particular Burbank Australia (Qld) Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 5 	South Australia 				SA
			'This siting plan is to be used solely to determine whether a particular Burbank Australia (SA) Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 6 	Tasmania 						TAS
			'This siting plan is to be used solely to determine whether a particular Burbank Australia Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 7 	Victoria 						VIC
			'This siting plan is to be used solely to determine whether a particular Burbank Australia Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.',
			// 8 	Western Australia 				WA
			'This siting plan is to be used solely to determine whether a particular Burbank Australia Pty Ltd house will fit on a lot of land.  It is an indication only and should not be relied upon for any other purpose. Burbank takes no responsibility for the accuracy of this siting plan as it has not fully reviewed all necessary and ancillary documents in relation to the particular lot. All parties relying upon this plan should seek expert advice in order to accurately determine the suitability of the proposed dwelling on the particular lot.'
		]
	);
	static DEFAULT		= new Builder( 'Default'		,[7], [1,2,3,4,5,6,7],[1,2,3,4,5,6,7]);
	static MELODY		= new Builder( 'MelodyDemo'	,[7], [],[1,2,3,4,5,6,7]);
	static SIMONDS		= new Builder( 'Simonds'    	,[4,5,7],[1], [1,2,3,4,5,6,7,8]);
	static SIMONDS_DEMO	= new Builder( 'SimondsDemo' 	,[4,5,7],[1],[1,2,3,4,5,6,7]);
	static PORTER_DAVIS	= new Builder( 'PorterDavis'	,[7], [], [1,2,3,4,5,6,7,8]);
	static PORTER_DAVIS_DEMO	= new Builder( 'PorterDavisDemo'	,[7], [], [1,2,3,4,5,6,7,8]);
	static SHERRIDON	= new Builder( 'SherridonHomes',[4,7], [], []);
	static ORBIT		= new Builder( 'OrbitHomes' 	,[4,7], [], [4,7]);
	static ORBIT_DEMO	= new Builder( 'OrbitHomesDemo',[4,7], [], [1,2,3,4,5,6,7]);
	static BOLD		 	= new Builder( 'BoldProperties',[4,7], [], [4]);
	static MEGA_HOMES	= new Builder( 'MegaHomes'	,[4,7], [], []);
	static MIMOSA_HOMES	= new Builder( 'MimosaHomes'	,[4,7], [], []);
	static EIGHT_HOMES	= new Builder( 'EightHomes' 	,[7], [], []);
	static EIGHT_HOMES_DEMO	= new Builder( 'EightHomesDemo' 	,[7], [], [7]);
	static URBAN_EDGE	= new Builder( 'UrbanEdge' 	,[7], [], []);
	static URBAN_EDGE_DEMO	= new Builder( 'UrbanEdgeDemo' 	,[7], [], [7]);
	static BEECHWOOD	= new Builder( 'BeechwoodHomes',[4,7], [1,2,3,4,5,6,7,8]);
	static HOMEBUYERS	= new Builder( 'Homebuyers'	,[4,7], [], [], [], false);
	static BOUTIQUE		= new Builder( 'BoutiqueHomes',[7], [], []);
	static KINGSBRIDGE	= new Builder( 'Kingsbridge'	,[7], [], [7]);
	static KINGSBRIDGE_DEMO	= new Builder( 'KingsbridgeDemo'	,[7], [], [7]);
	static CLARENDON	= new Builder( 'ClarendonHomes',[4,7], [1,2,3,4,5,6,7,8]);
	static INVISION		= new Builder( 'InvisionHomes',[4,7], []);
	static HENLEY		= new Builder( 'Henley'		,[4,7], [], [1,2,3,4,5,6,7,8]);
	static HENLEY_SA	= new Builder( 'HenleySA'		,[4,7], [], [1,2,3,4,5,6,7,8]);
	static HENLEY_DEMO	= new Builder( 'HenleyDemo'	,[4,7], [], [1,2,3,4,5,6,7,8], [1,2,3,4,5,6,7,8]);
	static PLANTATION	= new Builder( 'Plantation'	,[4,7], [], [1,2,3,4,5,6,7,8]);
	static RAWDONHILL	= new Builder( 'RawdonHill'	,[4,7], [], [7]);
	static FIRSTPLACE	= new Builder( 'FirstPlace'	,[4], [], [7]);
	static FIRSTPLACE_DEMO	= new Builder( 'FirstPlaceDemo'	,[4], [],[1,2,3,4,5,6,7]);
	static TRUEVALUE	= new Builder( 'TrueValue'	,[4], []);
	static MARQUEHOMES	= new Builder( 'MarqueHomes'	,[4], []);
	static UNISONHOMES	= new Builder( 'UnisonHomes'	,[4], []);
	static HIGHMARK		= new Builder( 'Highmark'		,[4], []);
	static HOMECORP		= new Builder( 'HomeCorp'		,[4], []);
	static ARLI_HOMES	= new Builder( 'ArliHomes'	,[4,7], [], [7]);
	static ASTON_HOMES	= new Builder( 'AstonHomes'	,[4,7], [], [7]);
	static APLACE		= new Builder( 'Aplace'		,[4,7], [], [4,7]);
	static UHOMES		= new Builder( 'UHomes'		,[4,7], [], [4,7]);
	static CJHOMES		= new Builder( 'CJHomes'		,[4,7], [], [4,7]);
	static CARLISLE		= new Builder( 'Carlisle',[7], [], [7]);
	static HOMEGROUP	= new Builder( 'HomeGroup',[7], [], [7]);


	/**
	 * @param name {string}
	 * @param ompStates {Array}
	 * @param traceStates {Array}
	 * @param engineeringStates {Array}
	 * @param nearmapStates {Array}
	 * @param hasExtendReduce {boolean}
	 * @param disclaimerText {Array}
	 */
	constructor(name, ompStates, traceStates=[], engineeringStates=[], nearmapStates=[], hasExtendReduce=true, disclaimerText=null)
	{
		/**
		 * Unique builder name/ID
		 *
		 * @type {string}
		 * @private
		 */
		this._name					= name.toUpperCase();

		/**
		 * States in which OMP is enabled for the current builder
		 *
		 * @type {Array}
		 * @private
		 */
		this._ompStates				= ompStates;

		/**
		 * States in which manual tracing is enabled for the current builder
		 *
		 * @type {Array}
		 * @private
		 */
		this._traceStates			= traceStates;

		/**
		 * States in which engineering overlay is enabled for the current builder
		 *
		 * @type {Array}
		 * @private
		 */
		this._engineeringStates		= engineeringStates;

		/**
		 * States in which Nearmap overlay is enabled for the current builder
		 *
		 * @type {Array}
		 * @private
		 */
		this._nearmapStates 		= nearmapStates;

		/**
		 * Flag that indicates if house extension/reductions are enabled for this builder
		 *
		 * @type {boolean}
		 * @private
		 */
		this._hasExtendReduce		= hasExtendReduce;

		/**
		 * Custom disclaimer text by state (or null if default text will be used)
		 *
		 * @type {Array}
		 * @private
		 */
		this._customDisclaimerText	= disclaimerText;

		// Map this builder account to its name
		_builderMap[this._name] 		= this;
	}

	/**
	 * @returns {String}
	 */
	get name()		{ return this._name; }

	/**
	 * @returns {String}
	 */
	get customDisclaimerText() {
		if (this._customDisclaimerText && AccountMgr.i.userRegion < this._customDisclaimerText.length) {
			return this._customDisclaimerText[AccountMgr.i.userRegion];
		}

		return null;
	}

	/**
	 * @returns {boolean}
	 */
	get hasExtendReduce()	{ return this._hasExtendReduce; }

	/**
	 * @returns {boolean}
	 */
	get ompEnabled()		{ return this._ompStates.indexOf(AccountMgr.i.userRegion) !== -1; }

	/**
	 * @returns {boolean}
	 */
	get hasManualTracing()	{ return this._traceStates.indexOf(AccountMgr.i.userRegion) !== -1; }

	/**
	 * @returns {boolean}
	 */
	get usesXMLFormat()		{ return this===Builder.HENLEY || this===Builder.PLANTATION || this===Builder.HENLEY_SA || this===Builder.HENLEY_DEMO; }

	/**
	 * @return {boolean}
	 */
	get hasSplitDriveway()  { return this.usesXMLFormat; }

	/**
	 * @param name
	 * @returns {*}
	 */
	static fromName(name)
	{
		name = name.toUpperCase();
		return _builderMap[name] ? _builderMap[name] : Builder.DEFAULT;
	}

	/**
	 * @returns {boolean}
	 */
	get hasEngineering()	{ return this.hasEngineeringInState(AccountMgr.i.userRegion); }

	/**
	 * @returns {boolean}	True if corner lot truncations are enabled for this builder
	 * @TODO: implement a 'hasTruncationInState' function
	 */
	get hasTruncations()	{
		return this===Builder.PLANTATION || this===Builder.SIMONDS_DEMO ||
			(this===Builder.SIMONDS && AccountMgr.i.userRegion === 4);
	}
	
	/**
	 * @return {string}
	 */
	get stateCenter() {
		switch (AccountMgr.i.userRegion) {
			case 7:
				return '-37.815018,144.946014';
			case 4:
				return '-27.4705,153.0260';
		}

		return '-37.815018,144.946014';
	}

	/**
	 * @param state
	 * @returns {boolean}
	 */
	hasEngineeringInState(state) {
		return this._engineeringStates && this._engineeringStates.indexOf(parseInt(state)) !== -1;
	}

	/**
	 * @return {boolean}
	 */
	get hasAdvancedFeatures() {
		// @TODO: Refactor this
		return this === Builder.HENLEY_DEMO ||
			this === Builder.DEFAULT ||
			this === Builder.SIMONDS_DEMO ||
			this === Builder.ORBIT_DEMO ||
			this === Builder.FIRSTPLACE_DEMO ||
			this === Builder.PORTER_DAVIS_DEMO ||
			this === Builder.EIGHT_HOMES_DEMO ||
			this === Builder.KINGSBRIDGE_DEMO ||
			this === Builder.URBAN_EDGE_DEMO;
	}

	/**
	 * @return {boolean}
	 */
	get hasHeightEnvelope() {
		return this.hasAdvancedFeatures && this === Builder.DEFAULT;
	}

	/**
	 * @return {boolean}
	 */
	get hasNearmapOverlay() {
		// return (this._nearmapStates && this._nearmapStates.indexOf(AccountMgr.i.userRegion) !== -1);
		return !!(AccountMgr.i.hasNearmap && AccountMgr.i.nearmapApiKey);
	}

	/**
	 * @return {boolean}
	 */
	get hasNearmapExtras() {
		return this.hasNearmapOverlay;
		/*
		return this === Builder.HENLEY
			|| this === Builder.PLANTATION
			|| this === Builder.HENLEY_DEMO;
		 */
	}
}