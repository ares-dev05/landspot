import ChangeDispatcher from '../../../events/ChangeDispatcher';

/**
 * This is an envelope that was saved to the database and contains restoration data for the envelope builder
 */
export default class EnvelopeData extends ChangeDispatcher{

	constructor() {
		super();

		/**
		 * database ID
		 * @type {number}
		 * @public
		 */
		this.id = 0;

		/**
		 * display name
		 * @type {string}
		 * @public
		 */
		this.name = '';

		/**
		 * organization tag
		 * @type {string}
		 * @public
		 */
		this.category = '';

		/**
		 * @public
		 * @type {boolean}
		 */
		this.isValid = true;

		/**
		 * @type {string}
		 * @private
		 */
		this._rawData = '';

		/**
		 * @type {Object}
		 * @private
		 */
		this._data = null;
	}

	/**
	 * @public
	 * @returns
	 */
	get data() {
		if (!this._data) {
			try {
				this._data = JSON.parse(this._rawData);
			}	catch (e) {
				this.isValid = false;
				this._data = {};
			}
		}

		return this._data;
	}

	/**
	 * @public
	 * @param v {Object}
	 */
	set data(v) {
		this._data = v;
	}

	/**
	 * @public
	 * @param side {EnvelopeSide}
	 */
	update(side) {
		this.name = side.name;
		this.category = side.category;
		this._data = side.recordState();
		this.onChange();
	}

	/**
	 * @public
	 */
	remove() {
		this.onDelete();
	}

	/**
	 * @public
	 * @param data {Element}
	 * @param category {string}
	 * @return {EnvelopeData}
	 */
	static fromXML(data, category) {
		const envelope = new EnvelopeData();

		envelope.id = Number(data.getAttribute('id'));
		envelope.name = data.getAttribute('name');
		envelope.category = category;
		envelope._rawData = data.textContent;

		return envelope;
	}

	/**
	 * @public
	 * @param side {EnvelopeSide}
	 * @return {EnvelopeData}
	 */
	static fromEnvelopeSide(side) {
		const envelope = new EnvelopeData();

		// write the ID manually
		envelope.id = side.id;
		// lod everything else through 'update'
		envelope.update(side);

		return envelope;
	}
}