/**
 * Store and manipulate information related to this user account
 * - the individual/team distinction is abstracted as much as possible from the rest of the application,
 * 	 except for the areas that need to work differently (i.e. the floorplans management)
 */

const _instanceKey = Symbol();

export default class AccountMgr {

	/**
	 * @return {AccountMgr}
	 */
	static get instance() {
		if (!this[_instanceKey]) {
			this[_instanceKey] = new AccountMgr(_instanceKey);
		}

		return this[_instanceKey];
	}

	/**
	 * @return {AccountMgr}
	 */
	static get i() { return this.instance; }

	/**
	 * @param constructKey {Object}
	 */
	constructor(constructKey) {
		if (_instanceKey!==constructKey) {
			throw new Error('The class \'AccountMgr\' is a singleton.');
		}

		// User State
		this._userRegion = 0;

		// this account's Builder settings
		this._builder = null;

		// Indicates if the user has access to dual occ
		this._multiHouse = false;

		/**
		 * @type {boolean} Indicates if this builder/user has nearmap
		 * @private
		 */
		this._hasNearmap = false;

		/**
		 * @type {string} Api key to use for the nearmap account
		 * @private
		 */
		this._nearmapApiKey = '';
	}

	/**
	 * @param userState {int}
	 * @param multiHouse {boolean}
	 * @param builder {Builder}
	 * @param hasNearmap {boolean}
	 * @param nearmapApiKey {string}
	 */
	update(userState, multiHouse, builder, hasNearmap=false, nearmapApiKey='') {
		// User State
		this._userRegion = userState;

		// Indicates if the user has access to dual occ
		this._multiHouse = multiHouse;

		// this account's Builder settings
		this._builder = builder;

		// Indicates if this builder/user has nearmap
		this._hasNearmap = hasNearmap;

		// api key to use for the nearmap account
		this._nearmapApiKey = nearmapApiKey;
	}

	/**
	 * @returns {number}
	 */
	get userRegion() {
		return this._userRegion;
	}

	/**
	 * @returns {Builder}
	 */
	get builder() {
		return this._builder;
	}

	/**
	 * @returns {boolean}
	 */
	get multihouse() {
		return this._multiHouse;
	}

	/**
	 * @return {boolean}
	 */
	get hasNearmap() {
		return this._hasNearmap;
	}

	/**
	 * @return {string}
	 */
	get nearmapApiKey() {
		return this._nearmapApiKey;
	}
}