import SitingsCanvasModel from '~/sitings-sdk/src/sitings/model/SitingsModel';
import EnvelopeCanvasModel from '~/sitings-sdk/src/sitings/model/envelope/EnvelopeCanvasModel';
import CompanyData from './CompanyData';

class LotCanvasModel {
    constructor() {
        this.model = null;
        this.envelopeModel = null;
        this.svgView = null;
    }

    getModel() {
        if (!this.model) {
            this.model = new SitingsCanvasModel(CompanyData.getModel());
        }
        return this.model;
    }

    resetModel() {
        this.model = null;
    }

    /**
     * @returns {EnvelopeCanvasModel}
     */
    getEnvelopeModel() {
        if (!this.envelopeModel) {
            this.envelopeModel = new EnvelopeCanvasModel(this.getModel());
        }
        return this.envelopeModel;
    }
}


export default new LotCanvasModel();