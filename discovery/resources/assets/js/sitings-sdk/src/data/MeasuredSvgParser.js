/**
 * a measured SVG contains a 10 meters ruler, which then helps to determine the real dimensions of the objects it contains
 */
import Geom from '../utils/Geom';
import SVGLoader from './SVGLoader';
import SvgImageParser from './SvgImageParser';

export default class MeasuredSvgParser extends SvgImageParser
{
    /**
     * @return {number}
     */
	static get RULER_LENGTH() { return 10; }

    /**
     * @return {string}
     */
	static get RULER_NAME() { return 'ruler'; }

    /**
     * @param data {string}
	 * @param asynchronous {boolean}
     */
	constructor(data, asynchronous=false)
	{
		super(data, asynchronous);

        /**
         * @type {SVGG}
         * @private
         */
        this._ruler = null;

        /**
         * @type {number}
         * @private
         */
        this._toMeters = 1;
    }

    /**
     * @param g {SVGG}
     */
	setupRuler(g)
	{
		if ( !this._ruler ) {
            let parser = new SVGLoader(this._ruler=g);
            parser.start();
            this._toMeters = MeasuredSvgParser.RULER_LENGTH / Geom.vectorLength(parser.width, parser.height);
        }
	}

	/**
	 * @return {number} a factor that translates the SVG sizespace into metric
	 */
	get toMeters() { return this._toMeters; }

	cleanup()
	{
		this._ruler = null;
		super.cleanup();
	}
}