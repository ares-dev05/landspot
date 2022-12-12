import axios from 'axios/index';

import SitingsCompanyData from '~/sitings-sdk/src/sitings/data/CompanyData';
import SitingsThemeManager from '~/sitings-sdk/src/sitings/view/theme/ThemeManager';
import EventBase from '~/sitings-sdk/src/events/EventBase';
import FacadeCatalogue from '~/sitings-sdk/src/sitings/data/envelope/FacadeCatalogue';
import EnvelopeCatalogue from '~/sitings-sdk/src/sitings/data/envelope/EnvelopeCatalogue';

class CompanyData {
    constructor() {
        this.model = null;
        this.callback = null;
    }

    getModel() {
        return this.model;
    }

    resetModel() {
        this.model = null;
    }

    /**
     * @param path {string}
     */
    loadCompanyFile(path) {
        const {processCompanyXMLFormat} = this;

        return new Promise((resolve, reject) => {
            try {
                axios.get(path)
                    .then(({data}) => processCompanyXMLFormat(data))
                    .then(data => resolve(data));
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * @param path {string}
     */
    loadThemeFile(path) {
        return new Promise((resolve, reject) => {
            try {
                axios.get(path)
                    .then(({data}) => {
                        SitingsThemeManager.setup(data);
                        resolve();
                    });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * @param houseData {HouseData}
     * @param path {string}
     */
    loadHouseData(houseData, path) {
        const {processHouseData} = this;

        return new Promise((resolve, reject) => {
            try {
                axios.get(path)
                    .then(({data}) => processHouseData(houseData, data))
                    .then(houseData => resolve(houseData));
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * @param rawData {string}
     */
    processCompanyXMLFormat = (rawData) => {
        const model = this.model = new SitingsCompanyData(rawData, true);
        return new Promise(resolve => {
            model.addEventListener(EventBase.COMPLETE, e => {
                model.removeEventListener(EventBase.COMPLETE);
                resolve(model);
            });
            model.parse(null);
        });
    };

    /**
     * @param houseData {HouseData}
     * @param rawData {string}
     */
    processHouseData = (houseData, rawData) => {
        return new Promise(resolve => {
            houseData.addEventListener(EventBase.COMPLETE, () => {
                houseData.removeEventListener(EventBase.COMPLETE);
                resolve(houseData);
            });
            houseData.loadAndParse(rawData);
        });
    }

    /**
     * @param path {string}
     */
    loadFacadeCatalogue = (path) => {
        return new Promise((resolve, reject) => {
            try {
                axios.get(path)
                    .then(({data}) => new FacadeCatalogue(this.parseXmlFromString(data)))
                    .then(data => resolve(data));
            } catch (e) {
                reject(e);
            }
        });
    };

    /**
     * @param path {string}
     */
    loadEnvelopeCatalogue = (path) => {
        return new Promise((resolve, reject) => {
            try {
                axios.get(path)
                    .then(({data}) => new EnvelopeCatalogue(this.parseXmlFromString(data)))
                    .then(data => resolve(data));
            } catch (e) {
                reject(e);
            }
        });
    };

    /**
     * @param value
     * @returns {null|Document}
     */
    parseXmlFromString = (value) => {
        try {
            const parser = new DOMParser();
            return parser.parseFromString(value, 'text/xml');
        } catch (e) {
            return null;
        }
    }
}


export default new CompanyData();