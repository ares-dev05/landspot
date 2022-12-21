import ChangeDispatcher from '../../../events/ChangeDispatcher';
import EnvelopeData from './EnvelopeData';

/**
 * an envelope category that groups multiple envelopes under a single group ('estate' for most users)
 */
export default class EnvelopeCategory extends ChangeDispatcher {
	constructor() {
		super();

		/**
		 * @type {EnvelopeData[]}
		 * @public
		 */
		this.envelopes = [];

		/**
		 * category display name; categories have no unique ID
		 * @type {string}
		 * @public
		 */
		this.name = '';

		/**
		 * @type {EnvelopeData}
		 * @private
		 */
		this._currentEnvelope = null;
	}

	/**
	 * @returns {EnvelopeData}
	 */
	get currentEnvelope() {
		if(!this._currentEnvelope && this.envelopes.length){
			this._currentEnvelope = this.envelopes[0];
		}
		return this._currentEnvelope;
	}

	/**
	 * @param v {EnvelopeData}
	 */
	set currentEnvelope(v) {
		this._currentEnvelope = v;
	}

	/**
	 * adds this envelope to the catalogue or updates it if it already exists
	 * @param item {EnvelopeSide}
	 */
	addEnvelope(item) {
		if (item.id > 0) {
			let found = false;
			for (let env of this.envelopes) {
				if (env.id === item.id) {
					// merge/replace the envelope with the new one
					env.update(item);
					found = true;
					break;
				}
			}
			if (!found) {
				// envelope wasn't edited, it's a new one altogether; add it to the list
				this.envelopes.push(EnvelopeData.fromEnvelopeSide(item));
			}
		}	else {
			// the envelope has no associated DB id. just add it to the catalogue
			this.envelopes.push(EnvelopeData.fromEnvelopeSide(item));
		}

		// dispatch a change event so the view can refresh
		this.onChange();
	}

	/**
	 * adds this envelope to the catalogue or updates it if it already exists
	 * @param data {Element}
	 * @returns {EnvelopeCategory}
	 * @public
	 */
	static fromXML(data) {
		const category = new EnvelopeCategory();

		category.name	= data.getAttribute('name');

		for (let node of data.getElementsByTagName('envelope')) {
			category.envelopes.push(EnvelopeData.fromXML(node, category.name));
		}

		return category;
	}
}
