import SvgImageParser from '../../../data/SvgImageParser';

export default class FacadeSvgParser extends SvgImageParser {

	static get FACADE_PREFIX() { return 'facade'; }
	static get RULER_PREFIX() { return 'ruler'; }

	constructor (svgData) {
		super(svgData);

		/**
		 * @type {SVGG[]}
		 * @private
		 */
		this._facades = [];

		/**
		 * @type {SVGG}
		 * @private
		 */
		this._ruler = null;
	}

	/**
	 * @public
	 * @return {SVGG[]}
	 */
	get facades() {
		return this._facades;
	}

	/**
	 *
	 * @return {null|SVGG}
	 */
	get ruler() {
		return this._ruler;
	}

	/**
	 * Sort the SVG groups by type
	 */
	onAfterParse() {
		for (let group of this.groups) {
			let id = group.id.toLowerCase();
			id = id.replace(/x5f_/gi,'');

			if (id.includes(FacadeSvgParser.FACADE_PREFIX)) {
				this._facades.push(group);
			}	else if (id.includes(FacadeSvgParser.RULER_PREFIX)) {
				this._ruler = group;
			}
		}
	}
}