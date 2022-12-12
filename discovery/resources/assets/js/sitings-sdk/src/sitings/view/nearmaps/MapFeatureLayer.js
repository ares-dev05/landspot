import * as PIXI from 'pixi.js';
import NearmapModel from '../../model/nearmap/NearmapModel';
import Point from '../../../geom/Point';
import Geom from '../../../utils/Geom';
import LabelFactory from '../theme/LabelFactory';
import Utils from '../../../utils/Utils';
import Rectangle from '../../../geom/Rectangle';

// https://services2.arcgis.com/tQg86iShPXJPWQWw/ArcGIS/rest/services/UWPublicAccessWaterInfrastructureLayers/FeatureServer/10
export default class MapFeatureLayer extends PIXI.Container {

    static get POINT_TYPE_NONE()    { return 0; }
    static get POINT_TYPE_TRUNK()   { return 1; }
    static get POINT_TYPE_MANHOLE() { return 2; }

    /**
     * @param model {NearmapModel}
     * @param width {number}
     * @param height {number}
     * @param url {string}
     * @param limits {{br: Point, tl: Point}}
     * @param name {string}
     * @param color {number}
     * @param pointType {number}
     * @param allPolyTypes {boolean}
     * @param attribution {string}
     * @param showLayerCB {function}
     */
    constructor(model, width, height, url, limits, name, color, pointType=0, allPolyTypes=false, attribution=null, showLayerCB=null, contourLines=false) {
        super();

        /**
         * @type {NearmapModel}
         * @private
         */
        this._model = model;

        /**
         * @type {number}
         * @private
         */
        this._width = width;

        /**
         * @type {number}
         * @private
         */
        this._height = height;

        /**
         * @type {string}
         * @private
         */
        this._url = url;

        /**
         * @type {boolean}
         * @private
         */
        this._isEPSG3857 = true;

        /**
         * @type {{br: Point, tl: Point}}
         * @private
         */
        this._limits = limits;

        /**
         * @type {string}
         * @private
         */
        this._name = name;

        /**
         * @type {number}
         * @private
         */
        this._color = color;

        /**
         * @type {number}
         * @private
         */
        this._pointType = pointType;

        /**
         * @type {boolean}
         * @private
         */
        this._allPolyTypes = allPolyTypes;

        /**
         * @type {null|{}}
         * @private
         */
        this._geoJson = null;

        /**
         * @type {number[][]}
         * @private
         */
        this._loadedArea = null;

        /**
         * @type {string}
         * @private
         */
        this._attribution = attribution;

        /**
         * @type {function}
         * @private
         */
        this._showLayerCB = showLayerCB ? showLayerCB : () => true;

        /**
         * @type {boolean}
         * @private
         */
        this._contourLines = contourLines;

        /**
         * @type {PIXI.Graphics}
         * @private
         */
        this._graphics = new PIXI.Graphics();
        this.addChild(this._graphics);

        /**
         * @type {PIXI.Container}
         * @private
         */
        this._labels = new PIXI.Container();
        this.addChild(this._labels);

        this.update();
    }

    /**
     * @return {string}
     */
    get attribution() { return this._attribution; }

    _calculateBounds() {
        // always fetch an area 2x larger than the view screen. When we refresh, check if we are out of those
        // bounds and if we need to refresh and/or load more data.

        // Calculate the 'view coordinates'
        const viewCoords = [
            [this._model.centerX - this._width/NearmapModel.TILE_SIZE/2, this._model.centerY - this._height/NearmapModel.TILE_SIZE/2],
            [this._model.centerX + this._width/NearmapModel.TILE_SIZE/2, this._model.centerY + this._height/NearmapModel.TILE_SIZE/2]
        ].map(
            point => [
                NearmapModel.x2long(point[0], this._model.zoom),
                NearmapModel.y2lat (point[1], this._model.zoom),
            ]
        );

        // See if there is at least one corner that is contained within the layer's display limits
        if (this._limits && viewCoords.find(
            coords => this._limits.tl.x <= coords[0] && coords[0] <= this._limits.br.x &&
                // inverse testing for Y (latitude), because we are in the southern hemisphere
                this._limits.br.y <= coords[1] && coords[1] <= this._limits.tl.y
        ) === undefined) {
            // If current view is outside of layer's limits, there is no need to load any data
            return;
        }

        // If we are still in the loaded bounds, there is no need to load new data
        if (this._loadedArea &&
            viewCoords[0][0] >= this._loadedArea[0][0] && Math.abs(viewCoords[0][1]) >= Math.abs(this._loadedArea[0][1]) &&
            viewCoords[1][0] <= this._loadedArea[1][0] && Math.abs(viewCoords[1][1]) <= Math.abs(this._loadedArea[1][1])
        )   {
            return;
        }

        // Calculate the 'load' coordinates, an area 4x larger than the view
        const PAD_K = 2;
        this._loadedArea = [
            [this._model.centerX - PAD_K*this._width/NearmapModel.TILE_SIZE/2, this._model.centerY - PAD_K*this._height/NearmapModel.TILE_SIZE/2],
            [this._model.centerX + PAD_K*this._width/NearmapModel.TILE_SIZE/2, this._model.centerY + PAD_K*this._height/NearmapModel.TILE_SIZE/2]
        ].map(
            // Move to longitude / latitude coordinates
            point => [
                NearmapModel.x2long(point[0], this._model.zoom),
                NearmapModel.y2lat (point[1], this._model.zoom)
            ]
        );

        // Move to EPSG:3857
        const points = this._loadedArea.map(
            point => NearmapModel.lonLatTo3857(
                point[0], point[1]
            )
        );

        // Set X / Y minimums and maximums
        const minx = points[0][0];
        const miny = points[0][1];
        const maxx = points[1][0];
        const maxy = points[1][1];

        let featureServiceURL = '';

        // Build the feature service URL
        if (this._url.indexOf('service=WFS')>0) {
            featureServiceURL = this._url + 'bbox='+this._loadedArea[0][0]+','+this._loadedArea[1][1]+','+
                this._loadedArea[1][0]+','+this._loadedArea[0][1]+'&outputFormat=application%2Fvnd.geo%2Bjson&srsname=EPSG:4326';

            this._isEPSG3857 = false;
            // application%2Fvnd.geo%2Bjson
        }   else {
            const geometry = '{"xmin":'+minx+',"ymin":'+miny+',"xmax":'+maxx+',"ymax":'+maxy+',"spatialReference":{"wkid":102100}}';
            const quantParameters = '{"mode":"view","originPosition":"upperLeft","tolerance":0.29858214173889186,"extent":'+geometry+'}';

            featureServiceURL = this._url +
                'f=geojson&returnGeometry=true&spatialRel=esriSpatialRelIntersects&maxAllowableOffset=0.29858214173889186&'+
                'geometry='+encodeURI(geometry)+
                '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*&returnCentroid=false&returnExceededLimitFeatures=false&maxRecordCountFactor=3&'+
                'outSR=102100&resultType=tile&quantizationParameters='+encodeURI(quantParameters);

            this._isEPSG3857 = true;
        }

        fetch(featureServiceURL)
            .then((response) => response.json())
            .then((data) =>  {
                    this._geoJson = data;
                    this._renderTile();

                    // set model attribution
                    try {
                        if (this._geoJson && this._geoJson.features && this._geoJson.features.length) {
                            this._model.addAttribution(this._attribution);
                        }
                    }   catch (e) {
                        // console.log('attribution set error ', e);
                    }
                }
            );
    }

    /**
     * @param C {number[]}
     * @return {Point}
     * @private
     */
    toPx(C) {
        const offset = new Point(0.55, 1.6);
        // Convert to lot / lan
        const coords = this._isEPSG3857 ? NearmapModel.xy3857ToLonLat(C[0] + offset.x, C[1] + offset.y) : C;
        // Convert to tile coords, then to pixel offset
        return new Point(
            NearmapModel.lon2x_fractional(coords[0], this._model.zoom),
            NearmapModel.lat2y_fractional(coords[1], this._model.zoom),
        ).offset(
            -this._model.centerX, -this._model.centerY, false
        ).scale(
            NearmapModel.TILE_SIZE
        );
    }

    _renderTile() {
        const start = Utils.now();
        const lineWidth = Math.max(1, Math.floor(this._model.zoom*this._model.zoom/144)) * (this._pointType === MapFeatureLayer.POINT_TYPE_TRUNK ? 3 : 1);

        // -> draw the geoJson
        this._graphics.clear();
        this._labels.removeChildren();
        this._graphics.lineStyle(lineWidth, this._color, 0.9);

        let inBounds=0;
        let outBounds=0;

        const bounds = new Rectangle(
            -this._width/2-NearmapModel.TILE_SIZE,
            -this._height/2-NearmapModel.TILE_SIZE,
            this._width + 2*NearmapModel.TILE_SIZE,
            this._height + 2*NearmapModel.TILE_SIZE
        );

        if (this._geoJson) {
            this._geoJson.features.forEach(
                feature => {
                    const isContour = this._contourLines &&
                        feature.properties &&
                        feature.properties.FEATURE_TYPE_CODE &&
                        feature.properties.FEATURE_TYPE_CODE === 'contour';

                    let altitude = isContour ? feature.properties.ALTITUDE : 0;

                    if (feature.geometry) {
                        switch (feature.geometry.type) {
                            case 'LineString': {
                                let distance = 0, threshold = 200, previous=null, first=true;

                                feature.geometry.coordinates.forEach(
                                    (C, indx) => {
                                        const offset = this.toPx(C);

                                        // @TODO: intersect with the bounds and crop at the margins
                                        if (bounds.contains(offset.x, offset.y) || this._isEPSG3857 === false) {
                                            first ? this._graphics.moveTo(offset.x, offset.y) : this._graphics.lineTo(offset.x, offset.y);
                                            first = false;

                                            if (previous) {
                                                distance += Geom.pointDistance(previous, offset);

                                                if (isContour && distance > threshold) {
                                                    distance = distance % threshold;

                                                    // @TODO: reuse the labels, don't discard them
                                                    const label = LabelFactory.getLabelBlock(
                                                        altitude + '',
                                                        10,
                                                        0xFFFFFF,
                                                        this._color
                                                    );

                                                    this._labels.addChild(label);
                                                    label.x = offset.x - label.width / 2;
                                                    label.y = offset.y - label.height / 2;
                                                }
                                            }
                                        }

                                        previous = offset;
                                    }
                                );
                                break;
                            }

                            case 'Point': {
                                const center = this.toPx(feature.geometry.coordinates);

                                if (this._pointType === MapFeatureLayer.POINT_TYPE_TRUNK) {
                                    // Draw a 'water trunk', i.e. a T junction connecting two+ water pipes
                                    const rotation = feature.properties && !isNaN(feature.properties.SymbolRotation) ?
                                        Geom.deg2rad(Number(feature.properties.SymbolRotation)) : 0;
                                    const SIZE = 10;

                                    // define the left, right, mid points
                                    const left  = Geom.rotatePointCoords(center.x, center.y, center.x-SIZE, center.y, rotation);
                                    const right = Geom.rotatePointCoords(center.x, center.y, center.x+SIZE, center.y, rotation);
                                    const mid   = Geom.rotatePointCoords(center.x, center.y, center.x, center.y-SIZE*0.75, rotation);

                                    // Draw the T junction
                                    this._graphics.moveTo(left.x, left.y);
                                    this._graphics.lineTo(right.x, right.y);
                                    this._graphics.moveTo(center.x, center.y);
                                    this._graphics.lineTo(mid.x, mid.y);
                                }
                                else if (this._pointType === MapFeatureLayer.POINT_TYPE_MANHOLE) {
                                    // Draw a manhole
                                    this._graphics.beginFill(this._color, 1);
                                    this._graphics.lineStyle(1, 0, 0.5);
                                    this._graphics.drawCircle(center.x, center.y, 5);
                                    this._graphics.endFill();
                                }
                                else {
                                    console.log('still can\'t draw ['+feature.properties.parcel_typ+']', feature);
                                }
                                break;
                            }

                            case 'Polygon': {
                                // only draw properties with the current name. This is used for Easements
                                if (feature.properties && (this._allPolyTypes || feature.properties.parcel_typ === this._name)) {
                                    feature.geometry.coordinates.forEach(
                                        poly => {
                                            this._graphics.beginFill(this._color, 0.5);
                                            // this.lineStyle(1, 0, 0.5);
                                            this._graphics.lineStyle(1, this._color, 0.8);
                                            poly.forEach(
                                                (C, indx) => {
                                                    const offset = this.toPx(C);
                                                    indx ? this._graphics.lineTo(offset.x, offset.y) : this._graphics.moveTo(offset.x, offset.y);
                                                }
                                            );
                                            this._graphics.endFill();
                                        }
                                    );
                                }   else {
                                    // console.log('can\'t draw type difference ', feature, feature.properties.parcel_typ, this._name);
                                }
                            }   break;

                            case 'MultiPolygon': {
                                // Creek/waterway flood planning area 3
                                feature.geometry.coordinates.forEach(
                                    poly => {
                                        this._graphics.beginFill(this._color, 0.5);
                                        this._graphics.lineStyle(1, this._color, 0.8);
                                        poly.forEach(
                                            points => {
                                                points.forEach(
                                                    (C, indx) => {
                                                        const offset = this.toPx(C);
                                                        indx ? this._graphics.lineTo(offset.x, offset.y) : this._graphics.moveTo(offset.x, offset.y);
                                                    }
                                                );
                                            }
                                        );
                                        this._graphics.endFill();
                                    }
                                );
                            }   break;

                            default:
                                console.log('can\'t draw ['+feature.properties.parcel_typ+']', feature);
                                break;
                        }
                    }
                }
            );
        }

        // console.log('nearmap.redraw ('+this._name+')['+inBounds+','+outBounds+'] in ', (Utils.now()-start));
    }

    update() {
        if (this._showLayerCB()) {
            this._renderTile();
            this._calculateBounds();
        }   else{
            this._graphics.clear();
            this._labels.removeChildren();
        }
    }
}