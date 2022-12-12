import PosView from '../pos/PosView';

export default class DeveloperFillView extends PosView {

    /**
     * @param model {DeveloperFillModel}
     */
    constructor(model) {
        super(model);
    }

    /**
     * @return {number}
     * @protected
     */
    get lineColor() { return this.model.valid ? 0x0a75f0 : 0xc94742; }

    /**
     * @return {number}
     * @protected
     */
    get lineAlpha() { return 0.4; }
}