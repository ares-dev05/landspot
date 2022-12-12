import Utils from "../../utils/Utils";

export default class Render {

    // Alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    // See https://pixijs.download/dev/docs/PIXI.Graphics.html#lineStyle for possible values
    static get LINE_ALIGNMENT() { return 0.5; }
    static get LINE_NATIVE() { return true; }

    static get FIX_UNROTATED_LABELS_INTEGER_COORDS() { return true; }

    static get FONT_RESOLUTION() { return 2; }

    /**
     * @param label {PIXI.DisplayObject}
     * @param has90DegRotation {boolean} indicates if the label is assumed to have a rotation of: 0/90/180/270
     */
    static labelMoved(label, has90DegRotation=true) {
        if (this.FIX_UNROTATED_LABELS_INTEGER_COORDS && label && has90DegRotation===true) {
            Utils.fixIntegerPosition(label);
        }
    }
}