import SVG from "svg.js";

export default class CanvasSvgView {

    /**
     * @param model {RestoreDispatcher}
     * @param view {TransformableViewBase}
     */
    constructor(model, view) {
        /**
         * @type {RestoreDispatcher}
         * @protected
         */
        this._model = model;

        /**
         * @type {TransformableViewBase}
         * @protected
         */
        this._view = view;

        /**
         * The SVG Document that we're creating. It will contain a similar view hierarchy as the SitingsView
         * @type {svgjs.Doc}
         * @protected
         */
        this._svg = null;

        /**
         * Optional background for the siting
         * @type {svgjs.Rect}
         * @protected
         */
        this._background    = null;

        /**
         * Optional underlay for the siting (used for engineering overlay)
         * @type {null}
         * @protected
         */
        this._underlay      = null;

        /**
         * All transforms are applied to this layer (scaling, translation)
         * @type {svgjs.G}
         * @protected
         */
        this._transformLayer = null;

        /**
         * Rotation is applied only to this layer. Inherited from SitingsView.viewRotation
         * @type {svgjs.G}
         * @protected
         */
        this._rotationLayer = null;

        /**
         * The layer that holds all the visual content.
         * @type {svgjs.G}
         * @protected
         */
        this._contentLayer = null;

        /**
         * Display layer for un-rotated labels
         * @type {svgjs.G}
         * @protected
         */
        this._labelsLayer  = null;
    }

    /**
     * @returns {RestoreDispatcher}
     */
    get model() { return this._model; }

    /**
     * @returns {svgjs.Doc}
     */
    get svgNode() { return this._svg.node; }

    /**
     * @returns {TransformableViewBase}
     */
    get view() { return this._view; }

    /**
     * @param v {TransformableViewBase}
     */
    set view(v) { this._view = v; }

    /**
     * @param divId {string} the ID of the Html DIV in which the SVG will be rendered
     * @param width {number}
     * @param height {number}
     * @protected
     */
    _createDisplayGroups(divId, width='100%', height='100%') {
        /**
         * The SVG Document that we're creating. It will contain a similar view hierarchy as the SitingsView
         * @type {svgjs.Doc}
         * @private
         */
        document.getElementById(divId).innerHTML = '';
        this._svg            = SVG(divId).size(width, height);
        this._svg.viewbox({x: 0, y:0, width: width, height: height});
        this._background     = this._svg.rect(1,1).opacity(0);
        this._underlay       = this._svg.group();
        this._root           = this._svg.group();

        // Create the display layer hierarchy
        this._transformLayer = this._root.group();
        this._rotationLayer  = this._transformLayer.group();
        this._contentLayer   = this._rotationLayer.group();

        // The labels layer is in a separate coordinate system.
        this._labelsLayer    = this._root.group();
    }

    /**
     * Creates and returns
     * @returns {svgjs.G}
     * @protected
     */
    _getGroup() { return this._contentLayer.group(); }
}