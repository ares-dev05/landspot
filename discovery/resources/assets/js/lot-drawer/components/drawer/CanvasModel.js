import LotDrawerModel from '~/sitings-sdk/src/lot-drawer/model/LotDrawerModel';

export const imageSizes = [
    {text: '1600px X 1200px', value: 0, width: 1600, height: 1200},
    {text: '2000px X 1500px', value: 1, width: 2000, height: 1500},
];

export const defaultTheme = Object.freeze({
    backgroundColor: null,
    fontColor: null,
    uploadingFile: false,
    uploadedFile: null,
    imageSize: 0,
    lineThickness: 1,
    boundaryColor: null,
    lotBackground: null,
    arrowColor: null,
    arrowBackgroundColor: null,
    fontType: null,
    fontSize: 12,
    lotLabelFontSize: 12,
    lotLabelPosition: null,
});

class CanvasModel {
    static defaultTheme = {...defaultTheme};

    constructor() {
        this.model = null;
        this.theme = {...CanvasModel.defaultTheme};
    }

    getModel() {
        if (!this.model) {
            this.model = new LotDrawerModel();
        }
        return this.model;
    }

    resetModel() {
        this.model = null;
        this.theme = {...CanvasModel.defaultTheme};
    }

    getTheme() {
        return this.theme;
    }

    setTheme(data) {
        this.theme = {...this.theme, ...data};
    }
}


export default new CanvasModel();