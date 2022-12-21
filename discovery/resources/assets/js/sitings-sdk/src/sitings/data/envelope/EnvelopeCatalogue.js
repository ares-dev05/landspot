import EnvelopeCategory from './EnvelopeCategory';
import ChangeDispatcher from '../../../events/ChangeDispatcher';

/**
 * The catalogue that organizes all the envelopes that the current user has access to.
 *
 * The catalogue is iniitialized once, when the Envelopes module is first started; after that, it's relatively static
 *	for the lifetime of the application. Admins can add new envelopes or delete existing ones.
 *
 * [INFO] as of 05 SEPT 17, only EnvelopeSide objects are stored in the envelope catalogue
 */
export default class EnvelopeCatalogue extends ChangeDispatcher {

	/**
	 * Create an EnvelopeCatalogue.
	 * @param data {XMLDocument}
	 */
	constructor (data) {
		super();

		/**
		 * @type {EnvelopeCategory[]}
		 * @private
		 */
		this._categories = [];
		for (let node of data.getElementsByTagName('category')) {
			this._categories.push(EnvelopeCategory.fromXML(node));
		}

		/**
		 * @type {EnvelopeCategory}
		 * @private
		 */
		this._currentCategory = null;
	}

	/**
	 * Get the _categories value.
	 * @returns {EnvelopeCategory[]}
	 */
	get categories() {
		return this._categories;
	}

	/**
	 * @returns {EnvelopeCategory}
	 */
	get currentCategory() {
		if(!this._currentCategory && this._categories.length){
			this._currentCategory = this._categories[0];
		}
		return this._currentCategory;
	}

	/**
	 * @param v {EnvelopeCategory}
	 */
	set currentCategory(v) {
		this._currentCategory = v;
	}

	/**
	 * adds this envelope to the catalogue, or updates it if it already exists
	 * @param item {EnvelopeSide}
	 */
	addEnvelope(item) {
		for (let cat of this._categories) {
			if (cat.name.toLowerCase() === item.category.toLowerCase()) {
				// add it to this category
				cat.addEnvelope(item);
				return;
			}
		}
		const cat = new EnvelopeCategory();
		cat.name = item.category;
		this._categories.push(cat);
		this.onAdded();
	}
}