/**
 * Contains the set of cost groups and items that are calculated for the overall site costs
 */
export default class CostProfile {

    constructor() {
        // @TODO: load a specified cost profile instead of building the default one
        this._buildDefault();
    }

    _buildDefault() {
        /**
         * @type {GroupCostProfile[]}
         */
        this.groups = [
            new GroupCostProfile(
                'Piers',
                [
                    new ItemCostProfile(
                        'Pier Labour',
                        ItemCostProfile.TYPE_ALWAYS,
                        ItemCostProfile.UNIT_METERS3,
                        0,
                        ItemCostFormula.PIER_VOLUME
                    ),
                    new ItemCostProfile(
                        'Soil Removal',
                        ItemCostProfile.TYPE_ALWAYS,
                        ItemCostProfile.UNIT_METERS3,
                        0,
                        ItemCostFormula.PIER_VOLUME
                    ),
                    new ItemCostProfile(
                        'Pier Material',
                        ItemCostProfile.TYPE_ALWAYS,
                        ItemCostProfile.UNIT_METERS3,
                        0,
                        ItemCostFormula.PIER_VOLUME
                    )
                ]
            ),
            new GroupCostProfile(
                'Earthworks',
                [
                    new ItemCostProfile(
                        'Recycled water connection',
                        ItemCostProfile.TYPE_CHECK,
                        ItemCostProfile.UNIT_NONE,
                        0,
                        ItemCostFormula.FIXED_COST
                    ),
                    new ItemCostProfile(
                        'AG Drains and Silt Pit',
                        ItemCostProfile.TYPE_CHECK,
                        ItemCostProfile.UNIT_NONE,
                        0,
                        ItemCostFormula.FIXED_COST
                    ),
                    new ItemCostProfile(
                        'Deep sewer connection',
                        ItemCostProfile.TYPE_CHECK,
                        ItemCostProfile.UNIT_NONE,
                        0,
                        ItemCostFormula.FIXED_COST
                    ),
                    new ItemCostProfile(
                        'Rock Removal',
                        ItemCostProfile.TYPE_CHECK,
                        ItemCostProfile.UNIT_NONE,
                        0,
                        ItemCostFormula.FIXED_COST
                    ),
                ]
            ),
            new GroupCostProfile(
                'Cut & Fill',
                [
                    new ItemCostProfile(
                        'under 300',
                        ItemCostProfile.TYPE_CONDITIONAL,
                        ItemCostProfile.UNIT_MILLIMETERS,
                        0,
                        ItemCostFormula.FALL_INTERVAL,
                        {
                            max: 300
                        }
                    ),
                    new ItemCostProfile(
                        '300 to 600',
                        ItemCostProfile.TYPE_CONDITIONAL,
                        ItemCostProfile.UNIT_MILLIMETERS,
                        0,
                        ItemCostFormula.FALL_INTERVAL,
                        {
                            min: 300,
                            max: 600
                        }
                    ),
                    new ItemCostProfile(
                        'over 600',
                        ItemCostProfile.TYPE_CONDITIONAL,
                        ItemCostProfile.UNIT_MILLIMETERS,
                        0,
                        ItemCostFormula.FALL_INTERVAL,
                        {
                            min: 600
                        }
                    ),
                ]
            )
        ];
    }
}

export class GroupCostProfile {
    /**
     * @param name {string}
     * @param items {ItemCostProfile[]}
     */
    constructor(name, items) {
        this.name = name;
        this.items = items;
    }

    static from(data) {
        return new GroupCostProfile(
            data.name,
            data.items.map(item => ItemCostProfile.from(item))
        );
    }
}

export class ItemCostProfile {

    // This item will always show in the final cost table
    static get TYPE_ALWAYS()      { return 0; }
    // This item will show in the final cost table only if its value <> 0
    static get TYPE_CONDITIONAL() { return 1; }
    // This item will show in the final cost table if it is checked by the user
    static get TYPE_CHECK()       { return 2; }
    // This item will show in the final cost table if it is the selected one
    // from its radio group
    static get TYPE_RADIO()       { return 3; }

    static get UNIT_NONE()        { return '';   }
    static get UNIT_METERS()      { return 'm';  }
    static get UNIT_METERS2()     { return 'm²'; }
    static get UNIT_METERS3()     { return 'm³'; }
    static get UNIT_MILLIMETERS() { return 'mm'; }

    /**
     * @param name {string}
     * @param type {number}
     * @param unitType {string}
     * @param unitCost {number}
     * @param formula {string}
     * @param params {null|Object}
     */
    constructor(name, type, unitType, unitCost, formula, params=null) {
        this.name     = name;
        this.type     = type;
        this.unitType = unitType;
        this.unitCost = unitCost;
        this.formula  = formula;
        this.params   = params;
    }

    static from(data) {
        return new ItemCostProfile(
            data.name,
            data.type,
            data.unitType,
            data.unitCost,
            data.formula,
            data.params
        );
    }
}

export class ItemCostFormula {

    static get FIXED_COST()     { return 'fixedCost'; }

    static get PIER_VOLUME()    { return 'pierVolume'; }
    static get FALL_INTERVAL()  { return 'fallInterval'; }

    /**
     * @param item {ItemCostProfile}
     * @param siteWorksModel {SiteWorksModel}
     */
    static apply(item, siteWorksModel) {
        if (item.formula === ItemCostFormula.FIXED_COST) {
            return 1;
        }

        // if the site works model doesn't exist or no initial calculation was done, return 0;
        if (!siteWorksModel || !siteWorksModel.cutFillResult) {
            return 0;
        }

        switch (item.formula) {
            case ItemCostFormula.PIER_VOLUME:
                return siteWorksModel.sitePiering ? siteWorksModel.sitePiering.pierVolume : 0;

            case ItemCostFormula.FALL_INTERVAL: {
                const fall = siteWorksModel.cutFillResult.totalFall;

                if (item.params) {
                    if (item.params.hasOwnProperty('min') && fall <= item.params.min)
                        return 0;
                    if (item.params.hasOwnProperty('max') && fall > item.params.max)
                        return 0;

                    // We only return a 1 if we are in the correct interval i.e. (min, max]
                    return 1;
                }

                return 0;
            }

            default:
                return 0;
        }
    }
}