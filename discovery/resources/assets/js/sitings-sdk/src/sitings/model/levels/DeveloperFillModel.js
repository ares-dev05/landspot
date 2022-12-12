import PosCalculator from '../pos/PosCalculator';
import Polygon from '../../../geom/Polygon';

export default class DeveloperFillModel extends PosCalculator {

    /**
     * @param lotModel {LotPathModel}
     * @param height {number}
     */
    constructor(lotModel, height=0.3) {
        super();

        /**
         * @type {number}
         * @private
         */
        this._height = height;

        /**
         * @type {LotPathModel}
         * @private
         */
        this._lotModel = lotModel;

        /**
         * @type {Polygon}
         * @private
         */
        this._perimeter = null;

        /**
         * @type {boolean}
         * @private
         */
        this._valid = false;
    }

    /**
     * @return {number}
     */
    get height() { return this._height; }

    /**
     * @param value {number}
     */
    set height(value) { this._height=value;
    console.log('my height is ', value);
    }

    /**
     * @return {Polygon}
     */
    get perimeter() { return this._perimeter; }

    /**
     * @return {LotPathModel}
     */
    get lotModel() { return this._lotModel; }

    /**
     * @return {boolean}
     */
    get valid() { return this._valid; }


    /**
     * @param x {number}
     * @param y {number}
     */
    _innerAddPoint(x, y) {
        super._innerAddPoint(x, y);
        this._perimeter = Polygon.from(this.points);
    }

    onChange() {
        // Fill Area is valid if it has at least 3 points and all the points are contained inside the lot perimeter
        this._valid =
            this.points.length > 2 &&
            this.points.find(point => this.lotModel.contains(point)===false) === undefined;

        super.onChange();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IRestorable implementation

    /**
     * recordState
     * returns a data structure containing all the parameters representing this object's state
     */
    recordState()
    {
        return {
            height: this._height,
            ...super.recordState()
        };
    }

    /**
     * restoreState
     * restores this object to the state represented by the 'state' data structure
     * @param state the state to be restored
     */
    restoreState(state)
    {
        this._height = state.height;
        super.restoreState(state);

        // this.onChange();
    }
}