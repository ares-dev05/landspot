import * as PIXI from 'pixi.js';
import ThemeManager from './ThemeManager';

export default class LabelFactory {

	/**
	 * @param text {string}
	 * @param fontSize {number}
	 * @param textColor {number}
	 * @param textColorTheme {string}
	 * @param fontFamily {string}
	 * @param bold {boolean}
	 * @param resolution {number}
	 *
	 * @return {PIXI.Text}
	 */
	static getLabel(text = '', fontSize = 13, textColor = 0, textColorTheme = null, bold = false, fontFamily = 'Arial', resolution = 2, align = 'center') {
		if ( textColorTheme != null ) {
			textColor = ThemeManager.i.theme.getColor(textColorTheme, 0xFFFFFF);
		}

		const textStyle = new PIXI.TextStyle({
			fontFamily: fontFamily,
			fontSize: fontSize, // * resolution
			fontWeight: bold ? 'bold' : 'normal',
			fill: textColor,
			align: align
		});

		const textField = new PIXI.Text(text, textStyle);
		// textField.scale = new Point(1 / resolution, 1 / resolution);
		textField.resolution = resolution;

		return textField;
	}

	/**
	 * @param text {string}
	 * @param fontSize {number}
	 * @param textColor {number}
	 * @param backgroundColor {number}
	 * @return {PIXI.Container}
	 */
	static getLabelBlock(text, fontSize, textColor, backgroundColor) {
		const label = LabelFactory.getLabel(text, fontSize, textColor);
		const back = ThemeManager.i.themedColorBlock(label.width+fontSize/2, label.height+fontSize/4, backgroundColor, backgroundColor);

		const container = new PIXI.Container();
		container.addChild(back);
		container.addChild(label);

		label.x = fontSize/4;
		label.y = fontSize/4;

		return container;
	}
}