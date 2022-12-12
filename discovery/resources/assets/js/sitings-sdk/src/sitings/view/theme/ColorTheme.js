import EventDispatcher from '../../../events/EventDispatcher';
import ColorPair from './ColorPair';
import Utils from '../../../utils/Utils';
import AccountMgr from '../../data/AccountMgr';
import Builder from '../../data/Builder';

export default class ColorTheme extends EventDispatcher
{
	static get MEASUREMENT_LABEL()	 { return 'color_class_1'; }
	static get PRIMARY_COLOR()	 	{ return 'color_class_2'; }
	static get SECONDARY_COLOR() 	{ return 'color_class_4'; }

	/**
	 * @param name {string}
	 * @param context {Object}
	 */
	constructor(name, context=null)
	{
		super(context);

		/**
		 * @type {string}
		 * @private
		 */
		this._themeName		= name;

		/**
		 * @type {ColorPair[]}
		 * @private
		 */
		this._colors		= [];

		/**
		 * @type {{}}
		 * @private
		 */
		this._colorsByName	= {};
	}

	/**
	 * @returns {string}
	 */
	get name()		{ return this._themeName; }

	/**
	 * @returns {ColorPair[]}
	 */
	get colors()	{ return this._colors; }

	/**
	 * @returns {number} Primary color as a number
	 */
	get primary()	{ return this.getColor(ColorTheme.PRIMARY_COLOR, 0xFFFFFF); }

	/**
	 * @returns {string} Primary color as a hexadecimal code
	 */
	get primaryCode() { return Utils.colorCode(this.primary); }

	/**
	 * @returns {number} Secondary color as a number
	 */
	get secondary()	{ return this.getColor(ColorTheme.SECONDARY_COLOR, 0x333333); }

	/**
	 * @returns {string} Secondary color as a hexadecimal code
	 */
	get secondaryCode() { return Utils.colorCode(this.secondary); }

	/**
	 * @returns {number} Measurement Label color as a number
	 */
	get measurementLabel()	{
		if (AccountMgr.i.builder===Builder.BOUTIQUE) {
			return 0;
		}
		
		return this.getColor(ColorTheme.MEASUREMENT_LABEL, 0xFFFFFF);
	}

	/**
	 * @returns {string} Measurement Label color as a hexadecimal code
	 */
	get measurementLabelCode() { return Utils.colorCode(this.measurementLabel); }

	//////////////////////////////////////////////////////////////
	// Custom coloring for Henley + Plantation Eave measurements

	/**
	 * @return {number}
	 */
	get eaveMeasurement() { return 0x4F85AE; }

	/**
	 * @return {string}
	 */
	get eaveMeasurementCode() { return Utils.colorCode(this.eaveMeasurement); }

	/**
	 * @param name {string}
	 * @returns {ColorPair}
	 */
	getColorPair(name)
	{
		if ( name && this._colorsByName.hasOwnProperty(name) ) {
			return this._colorsByName[name];
		}

		return null;
	}

	/**
	 * @param name {string}
	 * @param defaultColor {number}
	 * @returns {number}
	 */
	getColor(name, defaultColor=0xFFFFFF)
	{
		const  color = this.getColorPair(name);
		return color ? color.color : defaultColor;
	}

	/**
	 * @param name {string}
	 * @param value {number}
	 */
	setColor(name, value)
	{
		let color = this.getColorPair(name);

		if (color) {
			color.color	= value;
		}	else {
			color = new ColorPair(name, value);

			this._colors.push( color );
			this._colorsByName[name] = color;
		}
	}

	/**
	 * @param {string} xmlData
	 */
	static fromXML(xmlData='') {
		const colorTheme = new ColorTheme('colorTheme.local');
		const colors = (new DOMParser().parseFromString(xmlData, 'text/xml'))
						.getElementsByTagName('color');
		
		for (let i=0; i<colors.length; ++i) {
			colorTheme.setColor(
				colors[i].getAttribute('name'),
				parseInt(colors[i].getAttribute('value'))
			);
		}

		return colorTheme;
	}
}