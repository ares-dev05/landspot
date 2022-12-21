import CostProfile from './CostProfile';
import RulesProfile from './RulesProfile';

export default class RegionProfile {

    constructor() {
        /**
         * @type {CostProfile}
         * @private
         */
        this._cost = new CostProfile();

        /**
         * @type {RulesProfile}
         * @private
         */
        this._rules = new RulesProfile();
    }

    /**
     * @return {CostProfile}
     */
    get cost() { return this._cost; }

    /**
     * @return {RulesProfile}
     */
    get rules() { return this._rules; }
}