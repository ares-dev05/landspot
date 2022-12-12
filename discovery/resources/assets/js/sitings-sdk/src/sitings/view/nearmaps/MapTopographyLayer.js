import * as PIXI from 'pixi.js';
import NearmapModel from '../../model/nearmap/NearmapModel';
import Geom from '../../../utils/Geom';
import * as Lerc from 'lerc';
import * as d3 from 'd3-contour';
import LabelFactory from '../theme/LabelFactory';


export default class MapTopographyLayer extends PIXI.Container {

    static LINE_WIDTH   = 1.25;
    static LINE_COLOR   = 0xef8309;
    static LINE_ALPHA   = 1;

    // how many contour lines we want to have every 1m
    static LINES_PER_METER  = 4;

    static get attribution() { return '© State of Queensland (Department of Resources); © Commonwealth of Australia (Geoscience Australia, The Australian Hydrographic Office); © www.deepreef.org 2021'; }

    constructor() {
        super();

        /**
         * @type {number}
         * @private
         */
        this._left = NaN;
        /**
         * @type {number}
         * @private
         */
        this._right = NaN;
        /**
         * @type {number}
         * @private
         */
        this._top = NaN;
        /**
         * @type {number}
         * @private
         */
        this._bottom = NaN;
        /**
         * @type {number}
         * @private
         */
        this._zoom = NaN;

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

        /**
         * @TODO
         */
        this._cache = [];
    }

    clearContours() {
        this._graphics.cacheAsBitmap = false;
        this._graphics.clear();
        this._graphics.cacheAsBitmap = true;

        this._labels.removeChildren();

        this._left = NaN;
        this._right = NaN;
        this._top = NaN;
        this._bottom = NaN;
    }

    /**
     * @param left {number}
     * @param right {number}
     * @param top {number}
     * @param bottom {number}
     * @param zoom {number}
     */
    showArea(left, right, top, bottom, zoom) {
        // Don't redraw an area that we're already showing
        // @TODO: optimize and cache up to 30 different configurations that we pre-calculate
        if (left === this._left && right === this._right && top === this._top && bottom === this._bottom && zoom === this._zoom) {
            return;
        }

        this._left   = left;
        this._right  = right;
        this._top    = top;
        this._bottom = bottom;
        this._zoom   = zoom;

        // Load the tile matrix for the indicated area
        const contours = [];
        let   contoursLeft = (right-left+1) * (bottom-top+1);
        let   contourMin = Infinity, contourMax = -Infinity;

        const mergeContours = () => {
            contourMin = Math.floor(contourMin);
            contourMax = Math.ceil(contourMax);

            // check what tile sizes we are working with, and how much we need to scale tiles to get to [256x256] images
            const tileSize  = contours[0][0].length;
            const tileScale = NearmapModel.TILE_SIZE / tileSize;

            // Merge all the tiles into a single master tile that we can process the contours on together
            const master = [];
            const MASTER_WIDTH  = tileSize * (bottom-top+1);
            const MASTER_HEIGHT = tileSize * (right-left+1);

            for (let x=0; x<=right-left; ++x) {
                for (let column=0; column<tileSize; ++column) {
                    for (let y=0; y<=bottom-top; ++y) {
                        master.push(contours[x][y][column]);
                    }
                }
            }

            // Compute the contour polygons at log-spaced intervals; returns an array of MultiPolygon.
            const processedContours = d3.contours()
                .smooth(true)
                .size([MASTER_WIDTH, MASTER_HEIGHT])
                .thresholds(Array.from(
                    {length: MapTopographyLayer.LINES_PER_METER*(contourMax-contourMin+1)},
                    (_, i) => i/MapTopographyLayer.LINES_PER_METER+contourMin
                ))(master.flat());

            this._graphics.cacheAsBitmap = false;
            this._graphics.clear();
            this._labels.removeChildren();

            processedContours.forEach(multiPoly => {
                if (multiPoly.coordinates.length > 0) {
                    const showLabel = Number.isInteger(multiPoly.value);
                    if (showLabel) {
                        this._graphics.lineStyle(
                            MapTopographyLayer.LINE_WIDTH * 2, MapTopographyLayer.LINE_COLOR, MapTopographyLayer.LINE_ALPHA
                        );
                    }   else {
                        this._graphics.lineStyle(
                            MapTopographyLayer.LINE_WIDTH, MapTopographyLayer.LINE_COLOR, MapTopographyLayer.LINE_ALPHA
                        );
                    }
                    multiPoly.coordinates.forEach(
                        poly => poly.forEach(
                            // Smooth the contours by drawing curves between subsequent points
                            points => {
                                let distance = 0;
                                // const threshold = 20 * Math.pow(2, 23-zoom);
                                const threshold = 200;

                                // move to the first point
                                this._graphics.moveTo(tileScale*points[0][1], tileScale*points[0][0]);
                                let i=1;

                                for (; i<points.length-2; i++) {
                                    const xc = tileScale*(points[i][1] + points[i+1][1]) / 2;
                                    const yc = tileScale*(points[i][0] + points[i+1][0]) / 2;

                                    distance += tileScale*Geom.segmentLength(points[i-1][0], points[i-1][1], points[i][0], points[i][1]);

                                    if (showLabel && distance > threshold) {
                                        distance = distance % threshold;

                                        const label = LabelFactory.getLabelBlock(
                                            multiPoly.value + '',
                                            10,
                                            0xFFFFFF,
                                            MapTopographyLayer.LINE_COLOR
                                        );

                                        this._labels.addChild(label);
                                        label.x = tileScale*points[i][1] - label.width/2;
                                        label.y = tileScale*points[i][0] - label.height/2;
                                    }

                                    this._graphics.quadraticCurveTo(tileScale*points[i][1], tileScale*points[i][0], xc, yc);
                                }

                                // curve through the last two points
                                this._graphics.quadraticCurveTo(
                                    tileScale*points[i][1],
                                    tileScale*points[i][0],
                                    tileScale*points[i+1][1],
                                    tileScale*points[i+1][0]
                                );
                            }
                            /*slice.forEach(
                                (point,index) => index===0 ?
                                    this.moveTo(tileScale*point[1], tileScale*point[0]) :
                                    this.lineTo(tileScale*point[1], tileScale*point[0])
                            )*/
                        )
                    );
                }
            });

            this._graphics.cacheAsBitmap = true;
        };

        // load the required tiles
        for (let x=left; x<=right; ++x) {
            contours[x-left] = [];
            for (let y=top; y<=bottom; ++y) {

                TopographyMapLoader.fetchTile(
                    x, y, zoom,
                    (data, min, max) => {
                        contours[x-left][y-top] = data;
                        contourMin = Math.min(contourMin, min);
                        contourMax = Math.max(contourMax, max);

                        if (--contoursLeft <= 0) {
                            try {
                                mergeContours();
                            }   catch (e) {
                                // ignore. must be an out of date request
                            }
                        }
                    }
                );
            }
        }
    }
}

class TopographyMapLoader {

    static get MAX_ZOOM_AVAILABLE() { return 17; }

    /**
     * @type {{miny: number, minx: number, maxy: number, maxx: number}}
     * @private
     */
    static ZOOM_17_LIMITS = {miny: 68878, minx:115437, maxy:76958, maxx:124866};

    /**
     * @type {TopographyTileLoader[]}
     * @private
     */
    static _tiles = [];

    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     * @param onTileReady {function}
     */
    static fetchTile(x, y, z, onTileReady) {
        // coordinates for the master tile data that we're going to load
        let tileX, tileY, tileZ;

        // inner coordinates for the requested tile within the master tile
        let innerX, innerY, innerSize;

        if (z < TopographyMapLoader.MAX_ZOOM_AVAILABLE) {
            // we don't display contours on zooms < 17
            return;
        }

        if (z === TopographyMapLoader.MAX_ZOOM_AVAILABLE) {
            tileX      = x;
            tileY      = y;
            tileZ      = z;

            innerSize  = NearmapModel.TILE_SIZE;
            innerX     = 0;
            innerY     = 0;
        }   else {
            // otherwise, determine the position in a larger tile that we're going to use
            const factor = Math.pow(2, z-TopographyMapLoader.MAX_ZOOM_AVAILABLE);

            // Calculate inner tile x/y parameters. These indicate where within the master tile we have the corresponding
            // current tile
            innerSize = NearmapModel.TILE_SIZE / factor;
            innerX    = (x % factor) * innerSize;
            innerY    = (y % factor) * innerSize;

            // coordinates for the tile we need to load
            tileX     = Math.floor(x/factor);
            tileY     = Math.floor(y/factor);
            tileZ     = TopographyMapLoader.MAX_ZOOM_AVAILABLE;
        }

        // If the master tile doesn't exist, exit
        const limits = TopographyMapLoader.ZOOM_17_LIMITS;
        if (tileX < limits.minx || tileX > limits.maxx || tileY < limits.miny || tileY > limits.maxy) {
            return;
        }

        // see if tile X/Y/Z was already fetched
        let tileLoader = TopographyMapLoader._tiles.find(
            tileLoader => tileLoader.x === tileX && tileLoader.y === tileY && tileLoader.z === tileZ
        );

        if (!tileLoader) {
            tileLoader = new TopographyTileLoader(tileX, tileY, tileZ);
            TopographyMapLoader._tiles.push(tileLoader);
        }

        // Fetch the required subtile
        tileLoader.fetchSubtile({
            innerX: innerX,
            innerY: innerY,
            innerSize: innerSize,
            onTileReady: onTileReady
        });
    }
}

class TopographyTileLoader {

    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    constructor(x, y, z) {
        /**
         * @type {number}
         */
        this.x = x;
        /**
         * @type {number}
         */
        this.y = y;
        /**
         * @type {number}
         */
        this.z = z;

        /**
         * @type {number[][]}
         * @private
         */
        this._data = null;

        /**
         * @type {number}
         * @private
         */
        this._minValue = 0;

        /**
         * @type {number}
         * @private
         */
        this._maxValue = 0;

        /**
         * @type {{innerSize: number, onTileReady: Function, innerX: number, innerY: number}[]}
         * @private
         */
        this._requests = [];

        // Start loading the tile data;
        const contoursURL = NearmapModel.contoursURL(x, y, z);

        fetch(contoursURL)
            .then((response) => response.arrayBuffer())
            .then((data) =>  {
                    const image = Lerc.decode(data);
                    const pixels = image.pixels[0];
                    const stats  = image.statistics[0];

                    this._minValue = stats.minValue;
                    this._maxValue = stats.maxValue;

                    this._data = [];

                    for (let x=0; x<NearmapModel.TILE_SIZE; ++x) {
                        this._data[x] = [];
                        for (let y=0; y<NearmapModel.TILE_SIZE; ++y) {
                            this._data[x][y] = pixels[y * image.width + x];
                        }
                    }

                    this._processRequests();
                }
            );
    }

    /**
     * @param request {{innerSize: number, onTileReady: Function, innerX: number, innerY: number}}
     */
    fetchSubtile(request) {
        this._requests.push(request);

        if (this._data) {
            this._processRequests();
        }
    }

    /**
     * @private
     */
    _processRequests() {
        if (!this._data) {
            return;
        }

        this._requests.forEach(
            request => {
                if (request.innerSize === NearmapModel.TILE_SIZE) {
                    // return the full tile
                    request.onTileReady(this._data, this._minValue, this._maxValue);
                }   else {
                    // fetch subtile portion
                    const subtile = Geom.extractMatrix(this._data, request.innerX, request.innerY, request.innerSize);
                    // upscale the matrix and return it
                    // @INFO: we pass the sub-tiles without upscaling for increased performance.
                    // request.onTileReady(Geom.upscaleMatrix(subtile, NearmapModel.TILE_SIZE / request.innerSize), this._minValue, this._maxValue);
                    request.onTileReady(subtile, this._minValue, this._maxValue);
                }
            }
        );

        this._requests = [];
    }
}



/// @UNUSED @DEPRECATED
class MapTopographyTile extends PIXI.Graphics {

    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    constructor(x, y, z) {
        super();

        /**
         * @type {number}
         */
        this.tileX = x;
        /**
         * @type {number}
         */
        this.tileY = y;
        /**
         * @type {number}
         */
        this.tileZ = z;

        TopographyMapLoader.fetchTile(x, y, z, (data) => this.renderTile(data));
    }

    /**
     * @param data {number[][]}
     */
    renderTile(data) {
        // Compute the contour polygons at log-spaced intervals; returns an array of MultiPolygon.
        const contours = d3.contours()
            .size([data.length, data[0].length])
            .thresholds(Array.from({length: 24}, (_, i) => i))(data.flat());

        this.lineStyle(2, 0xe66300, 1);

        contours.forEach(multiPoly => {
            if (multiPoly.coordinates.length > 0) {
                const pointInBounds = point => point[0] > 0 && point[0] < NearmapModel.TILE_SIZE && point[1] > 0 && point[1] < NearmapModel.TILE_SIZE;

                multiPoly.coordinates.forEach(
                    poly => poly.forEach(
                        slice => slice.forEach(
                            (point,index) => index===0 || !pointInBounds(point) ? this.moveTo(point[1], point[0]) : this.lineTo(point[1], point[0])
                        )
                    )
                );
            }
        });
    }
}