import * as PIXI from 'pixi.js';
import NearmapModel from '../../model/nearmap/NearmapModel';
import Point from '../../../geom/Point';
import EventBase from '../../../events/EventBase';
import Polygon from '../../../geom/Polygon';
import MapFeatureLayer from './MapFeatureLayer';
import MapTopographyLayer from './MapTopographyLayer';
import AccountMgr from '../../data/AccountMgr';
import LabelFactory from '../theme/LabelFactory';
import ThemeManager from '../theme/ThemeManager';
import Utils from '../../../utils/Utils';

const Protobuf = require('pbf');
const VectorTile = require('@mapbox/vector-tile').VectorTile;

const TILE_SIZE = 256;


export default class MapLayerView extends PIXI.Container {

    /**
     * @param model {NearmapModel}
     * @param width {number}
     * @param height {number}
     */
    constructor(model, width, height) {
        super();

        /**
         * @type {number}
         * @private
         */
        this._width  = width;

        /**
         * @type {number}
         * @private
         */
        this._height = height;

        /**
         * @type {NearmapModel}
         * @private
         */
        this._model = model;
        this._model.addEventListener(EventBase.CHANGE, this.onNearmapModelChange, this);
        this._model.addEventListener('attributionChanged', this.onAttributionChange, this);

        /**
         * @type {MapLayer[]}
         * @private
         */
        this._zoomLayers = Array(NearmapModel.MAX_ZOOM_LEVEL+1).fill(null);

        // contours layer will be separate

        /**
         * @type {{br: Point, tl: Point}}
         */
        const brisbaneLimits = {
            tl: new Point(152.55, -26.95),
            br: new Point(153.65, -27.75)
        };

        /**
         * @type {{br: Point, tl: Point}}
         */
        const goldCoastLimits = {
            tl: new Point(153.05, -27.65),
            br: new Point(153.60, -28.30)
        };

        const urbanUtilitiesLimits = null;

        /**
         * @type {MapFeatureLayer[]}
         * @private
         */
        this._featureLayers = [];

        // color definitions
        const COLOR_WATER_PIPE    = 0x0070FF;
        const COLOR_WATER_TRUNK   = 0x00C5FF;
        const COLOR_SEWER_GRAVITY = 0xff00e1;
        const COLOR_SEWER_MANHOLE = 0xe817b0;
        const COLOR_EASEMENT      = 0xF8F3AC;
        const COLOR_STORMWATER    = 0xFF0000;
        const COLOR_FLOODAREA     = 0x0022CC;
        const COLOR_OVERLANDFLOW  = 0x040f8f;
        const COLOR_BUSHFIRE      = 0xd1470a;

        if (AccountMgr.i.builder.hasNearmapExtras === true) {
            this._featureLayers = [
                // @INFO: We set bounding boxes for each of the layers and load them only if the longitude / latitude
                //        are within those coordinates

                ////////////////////////////////////////////////////////////////////////////////////////////////////////
                /// Brisbane
                ////////////////////////////////////////////////////////////////////////////////////////////////////////

                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.waterReticulationURL,
                    brisbaneLimits,
                    'Water Reticulation Main',
                    COLOR_WATER_PIPE,
                    0,
                    false,
                    '© Unitywater 2017'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.waterTrunkURL,
                    brisbaneLimits,
                    'Water Trunk Main',
                    COLOR_WATER_TRUNK,
                    0,
                    false,
                    '© Unitywater 2017'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.waterFittingURL,
                    brisbaneLimits,
                    'Water Fitting',
                    COLOR_WATER_PIPE,
                    MapFeatureLayer.POINT_TYPE_TRUNK,
                    false,
                    '© Unitywater 2017'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.sewerGravityURL,
                    brisbaneLimits,
                    'Sewer Gravity Main',
                    COLOR_SEWER_GRAVITY,
                    0,
                    false,
                    '© Unitywater 2017'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.sewerManholeURL,
                    brisbaneLimits,
                    'Sewer Manhole',
                    COLOR_SEWER_MANHOLE,
                    MapFeatureLayer.POINT_TYPE_MANHOLE,
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.cadastreURL,
                    brisbaneLimits,
                    'Easement',
                    COLOR_EASEMENT
                ),

                // Flood areas
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.brisbaneCreekFloodURL,
                    null,
                    'Brisbane Creek Waterway Flood Area',
                    COLOR_FLOODAREA,
                    0, false, null,
                    () => this._model.displayFlood

                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.brisbaneRiverFloodURL,
                    null,
                    'Brisbane River Flood Area',
                    COLOR_FLOODAREA,
                    0, false, null,
                    () => this._model.displayFlood
                ),

                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.brisbaneOverlandURL,
                    null,
                    'Brisbane Overland Flow Area',
                    COLOR_OVERLANDFLOW,
                    0, true, null,
                    () => this._model.displayOverland
                ),

                // Bushfire
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.brisbaneBushfireURL,
                    null,
                    'Brisbane Bushfire Area',
                    COLOR_BUSHFIRE,
                    0, true, null,
                    () => this._model.displayBushfire
                ),

                ////////////////////////////////////////////////////////////////////////////////////////////////////////
                /// Gold Coast
                ////////////////////////////////////////////////////////////////////////////////////////////////////////

                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastWaterPipeURL,
                    goldCoastLimits,
                    'Potable Water Pipe',
                    COLOR_WATER_PIPE,
                    0,
                    false,
                    '© Council of the City of Gold Coast, Queensland'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastWaterServiceConnectionURL,
                    goldCoastLimits,
                    'Water Service Connection Potable',
                    COLOR_WATER_PIPE, // 0x0060DD,
                    0,
                    false,
                    '© Council of the City of Gold Coast, Queensland'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastSewerManholeURL,
                    goldCoastLimits,
                    'Sewer Maintenance Hole',
                    COLOR_SEWER_MANHOLE,
                    MapFeatureLayer.POINT_TYPE_MANHOLE,
                    false,
                    '© Council of the City of Gold Coast, Queensland'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastSewerPipePressureURL,
                    goldCoastLimits,
                    'Sewer Pipe Pressure',
                    COLOR_SEWER_GRAVITY,
                    0,
                    false,
                    '© Council of the City of Gold Coast, Queensland'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastSewerPipeNonPressureURL,
                    goldCoastLimits,
                    'Sewer Pipe Non Pressure',
                    COLOR_SEWER_GRAVITY,
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastDrainagePipeURL,
                    goldCoastLimits,
                    'Drainage Pipe',
                    COLOR_STORMWATER,
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastCadastreURL,
                    goldCoastLimits,
                    'Easement',
                    COLOR_EASEMENT,
                    MapFeatureLayer.POINT_TYPE_NONE,
                    true
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastFloodURL,
                    null,
                    'Gold Coast Flood Area',
                    COLOR_FLOODAREA,
                    0, false, null,
                    () => this._model.displayFlood
                ),

                // Bushfire
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.goldCoastBushfireURL,
                    null,
                    'Gold Coast Bushfire Area',
                    COLOR_BUSHFIRE,
                    0, true, null,
                    () => this._model.displayBushfire
                ),

                ////////////////////////////////////////////////////////////////////////////////////////////////////////
                /// Urban Utilities
                ////////////////////////////////////////////////////////////////////////////////////////////////////////

                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.urbanUtilitiesWaterPressureURL,
                    urbanUtilitiesLimits,
                    'Water Pressure Main',
                    COLOR_WATER_PIPE,
                    0,
                    false,
                    '© UrbanUtilities 2019'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.urbanUtilitlesWaterServiceURL,
                    urbanUtilitiesLimits,
                    'Water Service',
                    COLOR_WATER_PIPE,
                    0,
                    false,
                    '© UrbanUtilities 2019'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.urbanUtilitiesWaterTrunkURL,
                    urbanUtilitiesLimits,
                    'Water Trunk Main',
                    COLOR_WATER_TRUNK,
                    0,
                    false,
                    '© UrbanUtilities 2019'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.urbanUtilitiesWaterFittingURL,
                    urbanUtilitiesLimits,
                    'Water Fitting',
                    COLOR_WATER_PIPE,
                    MapFeatureLayer.POINT_TYPE_TRUNK
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.urbanUtilitiesSewerGravityURL,
                    urbanUtilitiesLimits,
                    'Sewer Gravity Main',
                    COLOR_SEWER_GRAVITY,
                    0,
                    false,
                    '© UrbanUtilities 2019'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.urbanUtilitlesSewerManholeURL,
                    urbanUtilitiesLimits,
                    'Sewer Manhole',
                    COLOR_SEWER_MANHOLE,
                    MapFeatureLayer.POINT_TYPE_MANHOLE,
                ),

                /// Brisbane Storm Water
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.brisbaneStormWaterURL,
                    null,
                    'Stormwater',
                    COLOR_STORMWATER,
                    0,
                    false,
                    '© Brisbane City Council 2022'
                ),

                ////////////////////////////////////////////////////////////////////////////////////////////////////////
                /// Victoria Contours
                ////////////////////////////////////////////////////////////////////////////////////////////////////////

                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.vicMapContoursURL,
                    null,
                    'Victoria Contours',
                    MapTopographyLayer.LINE_COLOR,
                    0,
                    false,
                    '© State of Victoria (Department of Environment, Land, Water and Planning)',
                    () => this._model.displayContours,
                    true
                ),

                ////////////////////////////////////////////////////////////////////////////////////////////////////////
                /// Yarra Valley
                ////////////////////////////////////////////////////////////////////////////////////////////////////////

                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.yarraValleyWaterURL,
                    null,
                    'Water Pipe',
                    COLOR_WATER_PIPE,
                    0,
                    false,
                    '© Yarra Valley Water'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.yarraValleySewerURL,
                    null,
                    'Sewer Pipe',
                    COLOR_SEWER_GRAVITY,
                    0,
                    false,
                    '© Yarra Valley Water'
                ),
                new MapFeatureLayer(
                    this._model, this._width, this._height,
                    NearmapModel.yarraValleyManholeURL,
                    null,
                    'Sewer Manhole',
                    COLOR_SEWER_MANHOLE,
                    MapFeatureLayer.POINT_TYPE_MANHOLE,
                    '© Yarra Valley Water'
                ),
            ];
        }

        if (this._model.location) {
            this.onNearmapModelChange();
        }
    }

    /**
     * @return {NearmapModel}
     */
    get model() { return this._model; }

    /**
     * create a new layer and/or update it
     */
    onNearmapModelChange() {
        this.removeChildren();

        let layer = this._zoomLayers[this._model.zoom];

        if (!layer) {
            // create a new layer
            layer = new MapLayer(this._model, this._model.zoom, this._width, this._height, this._model.centerX, this._model.centerY);
            this._zoomLayers[this._model.zoom] = layer;
        }   else {
            layer.move(this._model.centerX, this._model.centerY);
        }

        this.addChild(layer);

        /**
         * @type {string}
         */
        // this._model.attribution = '';

        // refresh feature layers
        this._featureLayers.forEach(
            featureLayer => {
                featureLayer.update();
                this.addChild(featureLayer);
            }
        );

        if (this._attrHolder) {
            this.addChild(this._attrHolder);
        }
    }

    onAttributionChange() {
        if (!this._attrTf) {
            this._attrTf = LabelFactory.getLabel('', 13, 0, null, false, 'Arial', 2, 'left');
            this._attrBack = new PIXI.Graphics();

            this._attrHolder = new PIXI.Container();
            this._attrHolder.addChild(this._attrBack);
            this._attrHolder.addChild(this._attrTf);
        }

        if (!this._model.attribution) {
            this._attrHolder.visible = false;
            return;
        }

        this._attrHolder.visible = true;

        this._attrTf.text = this._model.attribution;

        ThemeManager.i.themedColorBlock(
            Math.ceil(this._attrTf.width  + 6),
            Math.ceil(this._attrTf.height + 3),
            0xFFFFFF,
            0xEEEEEE,
            this._attrBack
        );

        this._attrTf.x	= 3;
        this._attrTf.y	= 1;

        const WIDTH  = this._attrBack.width;
        const HEIGHT = this._attrBack.height;
        const PAD = 10;

        this._attrHolder.x = PAD - this._width / 2; // this._width - WIDTH - PAD;
        this._attrHolder.y = this._height/2 - HEIGHT - PAD;

        Utils.removeParentOfChild(this._attrHolder);
        this.addChild(this._attrHolder);
    }

    /**
     * @param dx {number}
     * @param dy {number}
     */
    translate(dx, dy) {
        // convert from pixels to tile units when applying the translation
        this._model.translate(dx/TILE_SIZE, dy/TILE_SIZE);
    }

    /**
     * @param dx {number}
     * @param dy {number}
     */
    translateSiting(dx, dy) {
        this._model.translateSelection(dx/TILE_SIZE, dy/TILE_SIZE);
    }
}


class MapLayer extends PIXI.Container {

    /**
     * @param model {NearmapModel}
     * @param zoom {number}
     * @param width {number}
     * @param height {number}
     * @param centerX {number}
     * @param centerY {number}
     */
    constructor(model, zoom, width, height, centerX, centerY) {
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
        this._zoom   = zoom;

        /**
         * @type {number}
         * @private
         */
        this._width  = width;

        /**
         * @type {number}
         * @private
         */
        this._height = height;

        /**
         * @type {number}
         */
        this.centerX = centerX;

        /**
         * @type {number}
         */
        this.centerY = centerY;

        /**
         * @type {MapTile[]}
         * @private
         */
        this._tiles = [];

        /**
         * @type {MapTopographyLayer}
         * @private
         */
        this._topography = new MapTopographyLayer();

        this._refreshTiles();
    }

    /**
     * @param centerX {number}
     * @param centerY {number}
     */
    move(centerX, centerY) {
        this.centerX = centerX;
        this.centerY = centerY;

        this._refreshTiles();
    }

    /**
     * @private
     */
    _refreshTiles() {
        // find the top/left coordinates of the center tile
        const centerTileTL = new Point(
            Math.floor(TILE_SIZE * (Math.floor(this.centerX) - this.centerX)),
            Math.floor(TILE_SIZE * (Math.floor(this.centerY) - this.centerY))
        );

        // see how many tiles we need to load to the left
        const left   = Math.floor(-(centerTileTL.x + this._width/2) / TILE_SIZE) - 1;
        const top    = Math.floor( -(centerTileTL.y + this._height/2) / TILE_SIZE);
        const right  = Math.ceil((centerTileTL.x + TILE_SIZE + this._width / 2) / TILE_SIZE) + 1;
        const bottom = Math.ceil((centerTileTL.y + TILE_SIZE + this._height / 2) / TILE_SIZE);

        const centerXTile = Math.floor(this.centerX);
        const centerYTile = Math.floor(this.centerY);

        const tiles = [];

        for (let x=left; x<=right; ++x) {
            for (let y=top; y<=bottom; ++y) {
                tiles.push([centerXTile + x, centerYTile + y, centerTileTL.x + x * TILE_SIZE, centerTileTL.y + y * TILE_SIZE]);
            }
        }

        // show base map (Nearmap + Lot Outlines)
        this._showTiles(tiles);

        if (this._zoom >= 19 && AccountMgr.i.builder.hasNearmapExtras && this._model.displayContours) {
            // position and show the topography layer (Contours)
            this._topography.x = centerTileTL.x + left * TILE_SIZE;
            this._topography.y = centerTileTL.y + top * TILE_SIZE;
            this._topography.showArea(centerXTile + left, centerXTile + right, centerYTile + top, centerYTile + bottom, this._zoom);

            this._model.addAttribution(MapTopographyLayer.attribution);
        }   else {
            this._topography.clearContours();

            this._model.removeAttribution(MapTopographyLayer.attribution);
        }
    }

    /**
     * @param tiles {number[][]}
     * @private
     */
    _showTiles(tiles) {
        this.removeChildren();

        tiles.forEach(tile => {
            const X = tile[0];
            const Y = tile[1];

            let mapTile = this._tiles.find(search => search.tileX === X && search.tileY === Y);

            // see if this tile is already loaded
            if (mapTile === undefined) {
                this._tiles.push(mapTile = new MapTile(X, Y, this._zoom));

                mapTile.addListener(EventBase.CLICK, this.tileClicked, this);
            }

            mapTile.x = Math.floor(tile[2]);
            mapTile.y = Math.floor(tile[3]);

            this.addChild(mapTile);
        });

        this.addChild(this._topography);
    }

    tileClicked(object) {
        if (!object.target) {
            return;
        }

        // exit if auto placement is not active
        if (this._model.autoPlacement === false || this._model.autoPlacementActive === false) {
            return;
        }

        const clickedTile = object.target;
        const position = clickedTile.toLocal(object.data.global);

        // Find the clicked feature; Exit if no feature was clicked
        const feature = clickedTile.mapbox.features.find(feature => feature.area.containsPointRobust(position));
        if (!feature) {
            return;
        }

        const featureAddressId = feature.properties.addressId;
        const planNumber = feature.properties.planNumber;

        // find all pieces of this feature in all the loaded tiles
        const featureMap = this._tiles.map(
            tile => tile.mapbox.features.filter(
                feature =>
                    (featureAddressId && feature.properties.addressId === featureAddressId) ||
                    (!featureAddressId && planNumber && feature.properties.planNumber === planNumber)
            ).map(
                filteredFeature => filteredFeature.area.sourceVertices.map(
                    vertex => vertex.clone().translate(tile.x, tile.y, false)
                )
            ).flat()
        ).flat();

        // Exit if not enough vertices were found for the feature
        if (featureMap.length < 3) {
            return;
        }

        // build the convex hull for the feature map
        const addressArea = Polygon.from(featureMap).convexHull;

        this._model.setSelectedArea(addressArea, feature.properties);

        return;

        /* @TODO: implement this if required later.
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0xFFFF00);
        this.addChild(graphics);

        render.edges.forEach(
            (edge) => {
                graphics.moveTo(edge.a.x, edge.a.y);
                graphics.lineTo(edge.b.x, edge.b.y);
            }
        );

        graphics.beginFill(0xFFFF00, 1);
        graphics.drawCircle(render.vertexCentroid.x, render.vertexCentroid.y, 10);
        graphics.endFill();

        graphics.beginFill(0x0000FF, 0.75);
        graphics.drawCircle(render.centroid.x, render.centroid.y, 10);
        graphics.endFill();

        // this._model.selectedArea = addressArea;

        /**
         * .map(
         filteredFeature => filteredFeature.area.sourceVertices
         )
         */

        /**
         // find the clicked feature
         const feature = this._mapbox.features.find(feature => feature.area.containsPointRobust(position));

         console.log(' --> feature ', feature);
         */
    }
}

class MapTile extends PIXI.Container {
    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */

    constructor(x, y, z) {
        super();

        /**
         * @type {number}
         * @readonly
         */
        this.tileX = x;

        /**
         * @type {number}
         * @readonly
         */
        this.tileY = y;

        /**
         * @type {number}
         * @readonly
         */
        this.tileZ = z;

        this.addChild(this._raster = new RasterTile(x, y, z));
        this.addChild(this._mapbox = new MapboxVectorTile(x, y, z));
        // this.addChild(this._topo   = new MapTopographyTile(x, y, z));

        const mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF);
        mask.drawRect(0, 0, TILE_SIZE, TILE_SIZE);
        mask.endFill();

        this.addChild(mask);
        this.mask = mask;

        this.interactive = true;
        this.mouseEnabled = true;
    }

    /**
     * @return {RasterTile}
     */
    get raster() { return this._raster; }

    /**
     * @return {MapboxVectorTile}
     */
    get mapbox() { return this._mapbox; }
}

class RasterTile extends PIXI.Sprite {

    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    constructor(x, y, z) {
        super();

        // Load the texture
        this.texture = PIXI.Texture.from(NearmapModel.tileURL(x, y, z));
        this.width   = TILE_SIZE;
        this.height  = TILE_SIZE;
    }
}

const PARCEL_STRATA = 'Strata';
const PARCEL_LOT    = 'Lot Parcel';
const PARCEL_ROAD   = 'Road';


class MapboxVectorTile extends PIXI.Graphics {

    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    constructor(x, y, z) {
        super();

        /**
         * @type {number}
         * @readonly
         */
        this.tileX = x;

        /**
         * @type {number}
         * @readonly
         */
        this.tileY = y;

        /**
         * @type {number}
         * @readonly
         */
        this.tileZ = z;

        /**
         * @type {TileFeature[]}
         * @private
         */
        this._features = [];

        /**
         * @type {VectorTile}
         * @private
         */
        this._mapboxData = null;

        const mapboxURL = NearmapModel.parcelURL(x, y, z);
        fetch(mapboxURL)
            .then((response) => response.arrayBuffer())
            .then((data) =>  {
                this._mapboxData = this._parseVT(new VectorTile(new Protobuf(new Uint8Array(data))));
                this._renderTile();
            }
        );
    }

    /**
     * @return {TileFeature[]}
     */
    get features() { return this._features; }

    _parseVT(vt) {
        for (const key in vt.layers) {
            const lyr = vt.layers[key];
            this._parseVTFeatures(lyr);
        }
        return vt;
    }

    _parseVTFeatures(vtl) {
        vtl.parsedFeatures = [];
        const features = vtl._features;
        for (let i = 0, len = features.length; i < len; i++) {
            const vtf = vtl.feature(i);
            vtf.coordinates = vtf.loadGeometry();
            vtl.parsedFeatures.push(vtf);
        }
        return vtl;
    }

    /**
     Object { properties: {…}, extent: 4096, type: 3, _pbf: {…}, _geometry: 32, _keys: (15) […], _values: (76) […], coordinates: (2) […] }
     _geometry: 32
     _keys: Array(15) [ "id", "dtCreate", "locality", … ]
     _pbf: Object { pos: 443, type: 2, length: 1811, … }
     _values: Array(76) [ "0bff1861-812f-513a-a018-470766c52357", "2017-10-24", "Malvern East", … ]
     coordinates: Array [ (5) […], (6) […] ]
     extent: 4096
     type: 3
     <prototype>: Object { loadGeometry: loadGeometry(), bbox: bbox(), toGeoJSON: toGeoJSON(x, y, z), … }
     debugger eval code:1:9

     properties: Object
     {   address: "15 Warida Avenue Malvern East VIC 3145 Australia"
         addressId: "GAVIC421795133"
         areaSqm: 790.89
         dtCreate: "2017-10-24"
         id: "93cea413-a15e-55ec-9881-36a1dae81ef3"
         jurisdictionId: "1/TP91381~////"
         lgaPid: "VIC203"
         locPid: "VIC1582"
         locality: "Malvern East"
         lotNumber: "1"
         parclStts: "Registered"
         parclType: "Lot Parcel"
         planNumber: "TP91381"
         stateCode: "VIC"
         streetNumber: "15"
     }
     */

    _renderTile() {
        for (const key in this._mapboxData.layers) {
            const layer = this._mapboxData.layers[key];

            layer.parsedFeatures.forEach(
                feature => {
                    if (feature.properties.parclType !== PARCEL_LOT) {
                        return;
                    }

                    const divisor =  feature.extent / TILE_SIZE;

                    if (feature.type === 1) {
                        console.log('unsupported feature ', feature);
                    }

                    if (feature.type === 2) {
                        console.log('unsupported feature ', feature);
                    }

                    if (feature.type === 3) {
                        this._drawPolygon(feature.coordinates, divisor, feature.extent, feature.properties);
                    }
                }
            );
        }
    }

    _drawPolygon(coordsArray, divisor, extent, properties) {
        const lineWidth = Math.max(1, Math.floor(this.tileZ*this.tileZ/144));

        this.lineStyle(lineWidth, 0xFFFFFF, 0.9);

        const coords = [];
        const tileCoords = (C) => new Point(C.x / divisor, C.y / divisor);

        coordsArray.forEach(
            polygon => {
                if (polygon.length > 2) {
                    polygon.forEach(
                        (C, index) => {
                            // convert to tile coords
                            const T = tileCoords(C);
                            index === 0 ? this.moveTo(T.x, T.y) : this.lineTo(T.x, T.y);
                            coords.push(T);
                        }
                    );
                }
            }
        );

        this._features.push(new TileFeature(coords, properties));
    }
}

class TileFeature {

    /**
     * @param coords {Point[]}
     * @param properties {{lgaPid: string, address: string, areaSqm: number, streetNumber: string, locality: string, lotNumber: string, addressId: string, planNumber: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, dtCreate: string, locPid: string}}
     */
    constructor(coords, properties) {
        /**
         * @type {Polygon}
         * @private
         */
        this._area = Polygon.from(coords);

        /**
         * @type {{lgaPid: string, address: string, areaSqm: number, streetNumber: string, locality: string, lotNumber: string, addressId: string, planNumber: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, dtCreate: string, locPid: string}}
         * @private
         */
        this._properties = properties;
    }

    /**
     * @return {Polygon}
     */
    get area() { return this._area; }

    /**
     * @return {{lgaPid: string, address: string, areaSqm: number, streetNumber: string, locality: string, lotNumber: string, addressId: string, planNumber: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, dtCreate: string, locPid: string}}
     */
    get properties() { return this._properties; }
}
