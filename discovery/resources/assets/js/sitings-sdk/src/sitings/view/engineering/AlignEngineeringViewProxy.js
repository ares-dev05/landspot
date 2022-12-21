import LabeledPolygonTheme from '../theme/LabeledPolygonTheme';

export default class AlignEngineeringViewProxy {

    /**
     * @param engineeringState {{r: number, s: number, tx: *, cx: *, ty: *, cy: *, ax: *, ay: *, page: (Object.image|null), pageHeight: (Object.height|number), pageWidth: (Object.width|number)}}
     */
    constructor(engineeringState) {
        this.viewRotation = engineeringState.r;

        this.pathView = {
            theme: new LabeledPolygonTheme(3, 0, 0, 0)
        };

        this.lotFeaturesView = {
            easementTheme: new LabeledPolygonTheme(2, 0x000000),
            envelopeTheme: new LabeledPolygonTheme(2, 0x888888)
        };

        this._pdfPage = {
            image: engineeringState.page,
            width: engineeringState.pageWidth,
            height: engineeringState.pageHeight
        };
    }
    
    /**
     * @returns {{image: Object.image, width: (Object.width|number), height: (Object.height|number)}}
     */
    get pdfPage() { return this._pdfPage; }
}