import BindablePoint from "./BindablePoint";

export default class LabelModel extends BindablePoint {

    /**
     * @param text {string}
     * @param x {number}
     * @param y {number}
     * @param rotation {number}
     * @param transform {Matrix}
     */
	constructor( text, x, y, rotation=0, transform=null )
	{
		super( x, y );

        /**
         * @type {number}
         * @private
         */
		this._rotation = rotation;

        /**
         * @type {string}
         * @private
         */
        this._text = text;

        /**
         * @type {Matrix}
         * @private
         */
        this._transform = null;

		if ( transform ) {
            this._transform = transform.clone();
            // the position is stored in the x, y properties of BindablePoint, so the translation is not needed
            this._transform.tx = this._transform.ty = 0;
		}
	}

    get text() { return this._text; }
    get rotation() { return this._rotation; }
    get trans() { return this._transform; }
}