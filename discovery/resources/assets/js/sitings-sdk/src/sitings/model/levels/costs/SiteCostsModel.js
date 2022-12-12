import {ItemCostFormula, ItemCostProfile} from '../profiles/CostProfile';
import EventBase from '../../../../events/EventBase';
import ChangeDispatcher from '../../../../events/ChangeDispatcher';


export default class SiteCostsModel extends ChangeDispatcher {

    /**
     * @param siteWorks {SiteWorksModel}
     * @param costProfile {CostProfile}
     */
    constructor(siteWorks, costProfile) {
        super();

        /**
         * @type {SiteWorksModel}
         * @private
         */
        this._siteWorks = siteWorks;
        this._siteWorks.addEventListener(EventBase.CHANGE, this.siteWorksChange, this);

        /**
         * @type {CostProfile}
         * @private
         */
        this._costProfile = costProfile;

        /**
         * @type {CostGroup[]} full costs table
         * @private
         */
        this._costGroups = [];

        /**
         * @type {ItemCheckbox[]}
         * @private
         */
        this._checkboxes = [];

        /**
         * @type {number}
         * @private
         */
        this._cost = 0;

        this.siteWorksChange();
    }

    /**
     * @return {CostProfile}
     */
    get costProfile() { return this._costProfile; }

    /**
     * @return {CostGroup[]}
     */
    get costGroups() { return this._costGroups; }

    /**
     * @return {number}
     */
    get cost() { return this._cost; }

    /**
     * @private
     */
   siteWorksChange() {
       const checkboxPool = this._checkboxes.concat();
       const getCheckbox  = () => {
           if (checkboxPool.length) {
               return checkboxPool.shift();
           }

           const checkbox = new ItemCheckbox();
           checkbox.addEventListener(EventBase.CHANGE, this.checkboxChanged, this);
           this._checkboxes.push(checkbox);
           return checkbox;
       };

       // create the set of applied cost groups and filter out the invisible ones
       this._costGroups = this._costProfile.groups.map(
           group => new CostGroup(
               group.name,
               group.items.map(
                   item => new CostItem(
                       item,
                       ItemCostFormula.apply(item, this._siteWorks),
                       item.type === ItemCostProfile.TYPE_CHECK ? getCheckbox() : null
                   )
               )
           )
       ).filter(
           costGroup => costGroup.visible
       );

       this.refreshCosts();
   }

    /**
     * @private
     */
   checkboxChanged() {
       this.refreshCosts();
   }

    /**
     * @private
     */
    refreshCosts() {
        // Calculate overall total
        this._cost = this._costGroups.reduce(
            (total, group) => {
                group.refresh();
                return total + group.cost;
            },
            0
        );

        this.onChange();
    }
}

class CostGroup {
    /**
     * @param name {string}
     * @param items {CostItem[]}
     */
    constructor(name, items) {
        /**
         * @type {string}
         */
        this.name = name;

        /**
         * @type {CostItem[]}
         */
        this.items = items;

        /**
         * @type {number}
         */
        this.cost = 0;
    }

    /**
     * @return {boolean}
     */
    get visible() { return !!(this.name && this.items && this.items.filter(item => item.visible).length); }

    /**
     * @return {CostItem[]}
     */
    get visibleItems() { return this.items.filter(item => item.visible); }

    /**
     * Update the group cost
     */
    refresh() {
        this.cost = this.items.reduce((total, item) => total + item.currentCost, 0);
    }
}

class CostItem {

    /**
     * @param profile {ItemCostProfile}
     * @param unitAmount {number}
     * @param checkbox {ItemCheckbox}
     */
    constructor(profile, unitAmount, checkbox) {
        /**
         * @type {ItemCostProfile}
         * @private
         */
        this._profile = profile;

        /**
         * @type {number}
         * @private
         */
        this._unitAmount = unitAmount;

        /**
         * @type {ItemCheckbox}
         * @private
         */
        this._checkbox = checkbox;

        /**
         * @type {number}
         * @private
         */
        this._cost = this._profile.unitCost * this._unitAmount;
    }

    /**
     * @return {ItemCostProfile}
     */
    get profile() { return this._profile; }

    /**
     * @return {number}
     */
    get unitAmount() { return this._unitAmount; }

    /**
     * @return {number}
     */
    get cost() { return this._cost; }

    /**
     * @return {number}
     */
    get currentCost() { return this.applied ? this.cost : 0; }

    /**
     * @return {boolean}
     */
    get applied() {
        switch (this.profile.type) {
            case ItemCostProfile.TYPE_ALWAYS:
                return true;
            case ItemCostProfile.TYPE_CONDITIONAL:
                return this.unitAmount > 0;
            case ItemCostProfile.TYPE_CHECK:
            case ItemCostProfile.TYPE_RADIO:
                return this._checkbox && this._checkbox.checked;
        }

        return false;
    }

    /**
     * The only case when an item is not visible is if it is a conditional one, with its amount=0
     * @return {boolean}
     */
    get visible() {
        return this.profile.type !== ItemCostProfile.TYPE_CONDITIONAL || this.unitAmount > 0;
    }
}


class ItemCheckbox extends ChangeDispatcher {

    /**
     * @param item {CostItem}
     */
    constructor(item=null) {
        super();

        /**
         * @type {CostItem}
         * @private
         */
        this._item = item;

        /**
         * @type {boolean}
         * @private
         */
        this._checked = false;
    }

    /**
     * @return {CostItem}
     */
    get item() { return this._item; }

    /**
     * @param value {CostItem}
     */
    set item(value) { this._item = value; }

    /**
     * @return {boolean}
     */
    get checked() { return this._checked; }

    /**
     * @param value
     */
    set checked(value) { this._checked = value; this.onChange(); }
}