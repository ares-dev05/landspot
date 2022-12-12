import LotPointModel from '../lot/LotPointModel';
import Matrix from '../../../geom/Matrix';

export default class HouseLabelModel extends LotPointModel {

	/**
	 * @param text {string}
	 * @param x {number}
	 * @param y {number}
	 * @param rotation {number}
	 * @param transform {Matrix}
	 */
	constructor(text, x, y, rotation=0, transform=null )
	{
		super(x, y);

		this._rotation = rotation;
		this._text = text.replace(/_/gi, ' ');

		if (transform) {
			this._transform		= transform.clone();
			// reset translation. we store it as the label position
			this._transform.tx	= 0;
			this._transform.ty	= 0;
		}
	}

	/**
	 * @return {string}
	 */
	get text() { return this._text; }

	/**
	 * @return {number}
	 */
	get rotation() { return this._rotation; }

	/**
	 * @return {Matrix}
	 */
	get trans() { return this._transform; }

    /**
     * @param xRef {number}
     */
	mirrorHorizontally(xRef)
	{
		super.mirrorHorizontally(xRef);
		this.onChange();
	}

    /**
     * @param yRef {number}
     */
	mirrorVertically(yRef)
	{
		super.mirrorVertically(yRef);
		this.onChange();
	}

    deleteModel()
    {
        this.onDelete();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IRestorable implementation

    /**
     * @return {{}}
     */
	recordState()
	{
		let state       = super.recordState();
		state.text      = this._text;
		state.rotation  = this._rotation;

		if (this._transform) {
			state.transform = this._transform.recordState();
		}

		return state;
	}

    /**
     * @param state {{}}
     */
	restoreState(state)
	{
		this._text      = state.text;
        this._rotation  = state.hasOwnProperty('rotation') ? state.rotation : 0;

        if (state.hasOwnProperty('transform')) {
			this._transform = this._transform || new Matrix();
            this._transform.restoreState(state.transform);
        }

		super.restoreState( state );
	}
}