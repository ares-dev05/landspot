import * as PIXI from 'pixi.js';
import Render from '../../global/Render';
import ColorTheme from './ColorTheme';

let _instanceKey = Symbol();

export default class ThemeManager
{
	/**
	 * @param xmlData
	 * @returns {boolean}
	 */
	static setup(xmlData) {
		try {
			ThemeManager.initWith(ColorTheme.fromXML(xmlData));
		}	catch (e) {
			return false;
		}

		return true;
	}

	/**
	 * @param theme {ColorTheme}
	 * @private
	 */
	static initWith(theme) {
		if (!this[_instanceKey]) {
			this[_instanceKey] = new ThemeManager(_instanceKey, theme);
		}
	}

	/**
	 * @return {ThemeManager}
	 */
	static get instance() {
		return this[_instanceKey];
	}

	/**
	 * @return {ThemeManager}
	 */
	static get i() { return this.instance; }

	/**
	 * @param constructKey {Object}
	 * @param theme {ColorTheme}
	 * @private
	 */
	constructor(constructKey, theme) {
		if (_instanceKey !== constructKey) {
			console.log('The class \'ThemeManager\' is a singleton.');
		}

		/**
		 * @type {ColorTheme}
		 * @private
		 */
		this._theme = theme;
	}

	/**
	 * @returns {ColorTheme}
	 */
	get theme() { return this._theme; }

	/**
	 * @param width {number}
	 * @param height {number}
	 * @param fillColor {number|string}
	 * @param lineColor {number|string}
	 * @param shape {Graphics}
	 * @returns {Graphics}
	 */
	themedColorBlock(width, height, fillColor='color_class_2', lineColor='color_class_4', shape=null)
	{
		if ( !shape ) {
			shape = new PIXI.Graphics();
		}

		shape.clear();
		shape.lineStyle(
			1,
			isNaN(lineColor) ? this._theme.getColor(lineColor, 0x333333) : lineColor,
			1,
			Render.LINE_ALIGNMENT,
			Render.LINE_NATIVE
		);
		shape.beginFill(
			isNaN(fillColor) ? this._theme.getColor(fillColor) : fillColor
		);
		shape.drawRect(0, 0, width, height);
		shape.endFill();

		return shape;
	}
}