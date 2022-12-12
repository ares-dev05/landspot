import RestoreDispatcher from '../../../events/RestoreDispatcher';
import Point from '../../../geom/Point';
import EventBase from '../../../events/EventBase';
import Geom from '../../../utils/Geom';
import Polygon from '../../../geom/Polygon';
import AccountMgr from '../../data/AccountMgr';

/**
 * Location Item format:
 * "results": [{
        "title": "Melbourne",
        "highlightedTitle": "<b>Melbourne</b>",
        "vicinity": "Victoria",
        "highlightedVicinity": "Victoria",
        "position": [-37.81739, 144.96752],
        "category": "city-town-village",
        "categoryTitle": "City, Town or Village",
        "bbox": [144.55318, -38.22504, 145.54978, -37.5113],
        "href": "https://places.sit.ls.hereapi.com/places/v1/places/loc-dmVyc2lvbj0xO3RpdGxlPU1lbGJvdXJuZTtsYW5nPWVuO2xhdD0tMzcuODE3Mzk7bG9uPTE0NC45Njc1MjtjaXR5PU1lbGJvdXJuZTtjb3VudHJ5PUFVUztzdGF0ZT1WaWN0b3JpYTtzdGF0ZUNvZGU9VklDO2NhdGVnb3J5SWQ9Y2l0eS10b3duLXZpbGxhZ2U7c291cmNlU3lzdGVtPWludGVybmFsO3Bkc0NhdGVnb3J5SWQ9OTAwLTkxMDAtMDAwMA;context=Zmxvdy1pZD0wOWIyMTNkYS1iMTM2LTU0YWItOTY1OC0xZWFiZjJiOTRmMWJfMTY2MDY0Mjg2NTMxN18zMTU5XzYyMzUmYmJveD0xNDQuNTUzMTglMkMtMzguMjI1MDQlMkMxNDUuNTQ5NzglMkMtMzcuNTExMyZyYW5rPTA?app_id=MXtCW347CROeo0YIrbkW&app_code=oks4fF_Q5KnO_rVK-yscOw&tf=plain",
        "type": "urn:nlp-types:place",
        "resultType": "address",
        "id": "loc-dmVyc2lvbj0xO3RpdGxlPU1lbGJvdXJuZTtsYW5nPWVuO2xhdD0tMzcuODE3Mzk7bG9uPTE0NC45Njc1MjtjaXR5PU1lbGJvdXJuZTtjb3VudHJ5PUFVUztzdGF0ZT1WaWN0b3JpYTtzdGF0ZUNvZGU9VklDO2NhdGVnb3J5SWQ9Y2l0eS10b3duLXZpbGxhZ2U7c291cmNlU3lzdGVtPWludGVybmFsO3Bkc0NhdGVnb3J5SWQ9OTAwLTkxMDAtMDAwMA"
    }
 */

// allow a translation in a 10x10 tile block
const MAX_TRANSLATION       = 5;

const MELBOURNE_LATITUDE    = -37.81739;
const MELBOURNE_LONGITUDE   = 144.96751;

const NEARMAP_PROJECTION    = 'Vert';
const NEARMAP_FORMAT        = 'jpg';
// const NEARMAP_API_KEY       = 'MzgwZDg3NzMtYmE1ZS00MmM2LTgyMDktZDQ5ZDE1OTBjZWRk';


export default class NearmapModel extends RestoreDispatcher {

    /**
     * @return {string}
     * @constructor
     */
    static get LOCATION_CHANGE() { return 'location.change'; }

    /**
     * @return {number}
     * @constructor
     */
    static get MIN_ZOOM_LEVEL() { return 17; }

    /**
     * @return {number}
     * @constructor
     */
    static get MAX_ZOOM_LEVEL()  { return 22; }

    /**
     * @return {number}
     * @constructor
     */
    static get TILE_SIZE()       { return 256; }


    constructor(context=null) {
        super(context);

        /**
         * @type {null|{highlightedTitle: string, bbox: number[], categoryTitle: string, vicinity: string, highlightedVicinity: string, position: number[], href: string, id: string, title: string, category: string, type: string, resultType: string}}
         * @private
         */
        this._location = null;

        /**
         * @type {number}
         * @private
         */
        this._zoom = 21;

        /**
         * @type {Point} map translation in meters
         * @private
         */
        this._translation = new Point();

        /**
         * @type {boolean} Bi-stable flag, indicating if the model is in auto or manual placement mode.
         * @private
         */
        this._autoPlacement = true;

        /**
         * @type {boolean} Mono-stable flag. Reverts to false every time an auto placement action is performed
         * @private
         */
        this._autoPlacementActive = true;

        /**
         * @type {boolean}
         * @private
         */
        this._flipSiting = false;

        /**
         * @type {boolean}
         * @private
         */
        this._displayContours = false;

        /**
         * @type {boolean}
         * @private
         */
        this._displayFlood    = false;

        /**
         * @type {boolean}
         * @private
         */
        this._displayBushfire = false;

        /**
         * @type {boolean}
         * @private
         */
        this._displayOverland = false;

        /**
         * @type {Polygon} Selected area, in metric coordinates, with geometric center at (0,0)
         * @private
         */
        this._selectedArea = null;

        /**
         * @type {Point} Longitude / Latitude pair for the center of the selected area
         * @private
         */
        this._selectedCoordinates = null;

        /**
         * @type {null|{lgaPid: string, areaSqm: number, address: string, streetNumber: string, locality: string, lotNumber: string, planNumber: string, addressId: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, locPid: string, dtCreate: string}}
         * @private
         */
        this._selectedProperties = null;

        /**
         * @type {string[]}
         * @private
         */
        this._attribution = [];
    }

    /**
     * @return {string}
     */
    get attribution() { return this._attribution.join(' '); }

    /**
     * @param value {string|null}
     */
    addAttribution(value) {
        if (value !== null && this._attribution.indexOf(value) < 0) {
            this._attribution.push(value);
            this.dispatchEvent(new EventBase('attributionChanged', this));
        }
    }

    /**
     * @param value {string|null}
     */
    removeAttribution(value) {
        let index;
        if (value !== null && (index=this._attribution.indexOf(value)) >= 0) {
            this._attribution.splice(index, 1);
            this.dispatchEvent(new EventBase('attributionChanged', this));
        }
    }

    /**
     * @return {null|{highlightedTitle: string, bbox: number[], categoryTitle: string, vicinity: string, highlightedVicinity: string, position: number[], href: string, id: string, title: string, category: string, type: string, resultType: string}}
     */
    get location() { return this._location; }

    /**
     * @param v {null|{highlightedTitle: string, bbox: number[], categoryTitle: string, vicinity: string, highlightedVicinity: string, position: number[], href: string, id: string, title: string, category: string, type: string, resultType: string}}
     */
    set location(v) {
        if (v !== this._location) {
            this._location = v;

            // reset the zoom and translation
            this._zoom = 21;
            this._translation = new Point();

            // reset selected area & coordinates
            this._selectedArea = null;
            this._selectedCoordinates = null;

            this._attribution = [];

            this.onChange();
            this.dispatchEvent(new EventBase(NearmapModel.LOCATION_CHANGE, this));
        }
    }

    /**
     * @param name
     * @return {null|*}
     * @private
     */
    _attr(name) {
        if (this._location && this._location[name]) {
            return this._location[name];
        }

        return null;
    }

    /**
     * @return {number}
     */
    get streetNumber() { return 0; }

    /**
     * @return {number[]}
     */
    get position() { return this._attr('position'); }

    /**
     * @return {number}
     */
    get latitude() {
        const position = this.position;
        // return position && position.length === 2 ? position[0] : MELBOURNE_LATITUDE;
        return position && position.lat ? position.lat : MELBOURNE_LATITUDE;
    }

    /**
     * @return {number}
     */
    get longitude() {
        const position = this.position;
        // return position && position.length === 2 ? position[1] : MELBOURNE_LONGITUDE;
        return position && position.lng ? position.lng : MELBOURNE_LONGITUDE;
    }

    /**
     * @return {number}
     */
    get zoom() { return this._zoom; }

    /**
     * @param value {number}
     */
    set zoom(value) {
        if (this.location === null) {
            return;
        }

        // maintain zoom within a valid range
        value = Math.max(NearmapModel.MIN_ZOOM_LEVEL, Math.min(value, NearmapModel.MAX_ZOOM_LEVEL));

        if (this._zoom !== value) {
            // since the translation is stored in tile units, transform it as we scale up / down
            this._translation.x *= Math.pow(2, value-this._zoom);
            this._translation.y *= Math.pow(2, value-this._zoom);

            this._zoom = value;
            this.onChange();
        }
    }

    /**
     * @return {number} meters/pixel at the current zoom level
     */
    get resolution() { return 156543.03 * Math.cos(Geom.deg2rad(this.latitude)) / Math.pow(2, this.zoom); }

    /**
     * @return {number}
     */
    get ppm() { return 1 / this.resolution; }

    /**
     * @return {number}
     */
    get centerX() { return NearmapModel.lon2x_fractional(this.longitude, this.zoom) + this._translation.x; }

    /**
     * @return {number}
     */
    get centerY() { return NearmapModel.lat2y_fractional(this.latitude, this.zoom) + this._translation.y; }

    /**
     * @return {boolean}
     */
    get autoPlacement() { return this._autoPlacement; }
    /**
     * @param v {boolean}
     */
    set autoPlacement(v) {
        if (this._autoPlacement !== v) {
            this._autoPlacement = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get autoPlacementActive() { return this._autoPlacementActive; }
    /**
     * @param value {boolean}
     */
    set autoPlacementActive(value) { this._autoPlacementActive = value; this.onChange(); }

    /**
     * @return {boolean} Indicates if we need to flip the siting front (i.e. apply a 180 degree rotation when auto-placing)
     */
    get flipSiting() { return this._flipSiting; }
    /**
     * @param v {boolean}
     */
    set flipSiting(v) {
        if (this._flipSiting !== v) {
            this._flipSiting = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get displayContours() { return this._displayContours; }
    /**
     * @param v {boolean}
     */
    set displayContours(v) {
        if (this._displayContours !== v) {
            this._displayContours = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get displayFlood() { return this._displayFlood; }
    /**
     * @param v {boolean}
     */
    set displayFlood(v) {
        if (this._displayFlood !== v) {
            this._displayFlood = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get displayBushfire() { return this._displayBushfire; }
    /**
     * @param v {boolean}
     */
    set displayBushfire(v) {
        if (this._displayBushfire !== v) {
            this._displayBushfire = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get displayOverland() { return this._displayOverland; }
    /**
     * @param v {boolean}
     */
    set displayOverland(v) {
        if (this._displayOverland !== v) {
            this._displayOverland = v;
            this.onChange();
        }
    }

    /**
     * @return {boolean}
     */
    get hasFloodBushfireOverland() {
        const lat = this.latitude;
        const lng = this.longitude;

        // we only have these layers in Queensland
        const limits = {
            //            long   lat
            tl: new Point(138.0, -20),
            br: new Point(154.0, -29.5)
        };

        return limits.tl.x <= lng && lng <= limits.br.x &&
               // inverse testing for Y (latitude), because we are in the southern hemisphere
               limits.br.y <= lat && lat <= limits.tl.y;
    }

    /**
     * @return {Polygon}
     */
    get selectedArea() { return this._selectedArea; }

    /**
     * @param area {Polygon}
     * @param properties {null|{lgaPid: string, areaSqm: number, address: string, streetNumber: string, locality: string, lotNumber: string, planNumber: string, addressId: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, locPid: string, dtCreate: string}}
     */
    setSelectedArea(area, properties=null) {
        if (this.autoPlacement === true && this.autoPlacementActive === false) {
            return;
        }

        this._selectedProperties = properties;

        // convert the polygon vertices from pixel to metric
        let vertices = area.getVertices().map(vertex => vertex.scale(this.resolution));

        // the polygon's centroid will already be converted to metric
        let center = area.centroid;

        // Move the area so that its center will be (0, 0)
        vertices = vertices.map(vertex => vertex.subtract(center));

        // Convert the center location to tile coordinates
        center.x = center.x / (NearmapModel.TILE_SIZE*this.resolution) + this.centerX;
        center.y = center.y / (NearmapModel.TILE_SIZE*this.resolution) + this.centerY;

        // Now convert to longitude / latitude. This ensures our alignment will always be done to the same spot
        center.x = NearmapModel.x2long(center.x, this.zoom);
        center.y = NearmapModel.y2lat(center.y, this.zoom);

        this._selectedArea = Polygon.from(vertices);

        if (this.autoPlacement) {
            this._selectedCoordinates = center;
            this._autoPlacementActive = false;
        }

        this.onChange();
    }

    /**
     * @return {Point} Longitude / Latitude pair for the center of the selected area
     */
    get selectedCoordinates() { return this._selectedCoordinates; }

    /**
     * @return {Point}
     */
    get selectedCenterOffset() {
        if (!this._selectedCoordinates) {
            return null;
        }

        return new Point(
            // Convert from longitude / latitude to tile coordinates
            NearmapModel.lon2x_fractional(this.selectedCoordinates.x, this.zoom),
            NearmapModel.lat2y_fractional(this.selectedCoordinates.y, this.zoom)
        ).offset(
            // Subtract current center
            -this.centerX, -this.centerY, false
        ).scale(
            // Convert to metric
            NearmapModel.TILE_SIZE * this.resolution
        );
    }

    /**
     * @return {string}
     */
    get selectedAddress() {
        if (this._selectedProperties && this._selectedProperties.address) {
            return this._selectedProperties.address;
        }

        return '';
    }

    /**
     * @param dx {number} tile unit translation
     * @param dy {number} tile unit translation
     */
    translateSelection(dx, dy) {
        if (!this._selectedCoordinates) {
            this._selectedCoordinates = new Point(this.longitude, this.latitude);
        }

        this._selectedCoordinates.x = NearmapModel.x2long(
            NearmapModel.lon2x_fractional(this._selectedCoordinates.x, this.zoom) + dx, this.zoom
        );
        this._selectedCoordinates.y = NearmapModel.y2lat(
            NearmapModel.lat2y_fractional(this._selectedCoordinates.y, this.zoom) + dy, this.zoom
        );

        this.onChange();
    }

    /**
     * @param dx {number} tile unit translation
     * @param dy {number} tile unit translation
     */
    translate(dx, dy) {
        if (this.location === null) {
            return;
        }

        // restrict the translation to within 10 tile units
        this._translation.x = Math.max(-MAX_TRANSLATION, Math.min(MAX_TRANSLATION, this._translation.x + dx));
        this._translation.y = Math.max(-MAX_TRANSLATION, Math.min(MAX_TRANSLATION, this._translation.y + dy));

        this.onChange();
    }

    /**
     * @param lon {number}
     * @param zoom {number}
     * @return {number}
     */
    static lon2x(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }

    /**
     * @param lon {number}
     * @param zoom {number}
     * @return {number}
     */
    static lon2x_fractional(lon,zoom) { return (lon+180)/360*Math.pow(2,zoom); }

    /**
     * @param lat {number}
     * @param zoom {number}
     * @return {number}
     */
    static lat2y(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }

    /**
     * @param lat {number}
     * @param zoom {number}
     * @return {number}
     */
    static lat2y_fractional(lat,zoom)  { return (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom); }

    /**
     * @param x {number}
     * @param z {number}
     * @return {number}
     */
    static x2long(x,z) { return (x/Math.pow(2,z)*360-180); }

    /**
     * @param y {number}
     * @param z {number}
     *
     * @return {number}
     */
    static y2lat(y,z) { const n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }

    /**
     * EPSG:4326 -> EPSG:3857
     *
     * @param longitude {number}
     * @param latitude {number}
     *
     * @return {number[]}
     */
    static lonLatTo3857(longitude, latitude) {
        const K = 20037508.34;
        return [
            (longitude * K) / 180,
            Math.log(Math.tan(((90 + latitude) * Math.PI) / 360)) / Math.PI * K
        ];
    }

    /**
     * EPSG:3857 -> EPSG:4326
     *
     * @param x
     * @param y
     *
     * @return {number[]}
     */
    static xy3857ToLonLat(x, y) {
        const K = 20037508.34;
        return [
            x * 180 / K,
            Math.atan(Math.exp(y / K * Math.PI)) * 360 / Math.PI - 90
        ];
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Nearmap URLs

    static tileURL(x, y, z) {
        return 'https://api.nearmap.com/tiles/v3/'+NEARMAP_PROJECTION+'/'+z+'/'+x+'/'+y+'.'+NEARMAP_FORMAT+'?apikey='+AccountMgr.i.nearmapApiKey;
    }

    static parcelURL(x, y, z) {
        return 'https://api.nearmap.com/features/v1/parcels/latest/'+z+'/'+x+'/'+y+'.mvt?apikey='+AccountMgr.i.nearmapApiKey;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Open Data QLD elevations URLs

    static contoursURL(x, y, z) {
        // @INFO: X and Y are reversed in the contours service
        return 'https://spatial-img.information.qld.gov.au/arcgis/rest/services/Elevation/QldDem/ImageServer/tile/'+z+'/'+y+'/'+x;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Vic Contours service

    static get vicMapContoursURL() {
        return 'https://services6.arcgis.com/GB33F62SbDxJjwEL/arcgis/rest/services/Vicmap_Elevation_METRO_1_to_5_metre/FeatureServer/1/query?';
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Unitywater / Brisbane URLs

    static get waterReticulationURL() {
        return 'https://services2.arcgis.com/tQg86iShPXJPWQWw/ArcGIS/rest/services/UWPublicAccessWaterInfrastructureLayers/FeatureServer/10/query?where=SubtypeCD=11103&';
    }

    static get waterTrunkURL() {
        return 'https://services2.arcgis.com/tQg86iShPXJPWQWw/ArcGIS/rest/services/UWPublicAccessWaterInfrastructureLayers/FeatureServer/10/query?where=SubtypeCD<>11103&';
    }

    static get waterFittingURL() {
        return 'https://services2.arcgis.com/tQg86iShPXJPWQWw/ArcGIS/rest/services/UWPublicAccessWaterInfrastructureLayers/FeatureServer/8/query?';
    }

    static get sewerManholeURL() {
        return 'https://services2.arcgis.com/tQg86iShPXJPWQWw/ArcGIS/rest/services/UWPublicAccessSewerInfrastructureLayers/FeatureServer/5/query?';
    }

    static get sewerGravityURL() {
        return 'https://services2.arcgis.com/tQg86iShPXJPWQWw/ArcGIS/rest/services/UWPublicAccessSewerInfrastructureLayers/FeatureServer/11/query?';
    }

    static get cadastreURL() {
        return 'https://spatial-gis.information.qld.gov.au/arcgis/rest/services/PlanningCadastre/LandParcelPropertyFramework/MapServer/4/query?';
    }

    static get brisbaneCreekFloodURL() {
        return 'https://services2.arcgis.com/dEKgZETqwmDAh1rP/arcgis/rest/services/Flood_overlay_Creek_waterway_flood_planning_area/FeatureServer/0/query?';
    }

    static get brisbaneRiverFloodURL() {
        return 'https://services2.arcgis.com/dEKgZETqwmDAh1rP/arcgis/rest/services/Flood_overlay_Brisbane_River_flood_planning_area/FeatureServer/0/query?';
    }

    static get brisbaneBushfireURL() {
        return 'https://services2.arcgis.com/dEKgZETqwmDAh1rP/arcgis/rest/services/Bushfire_overlay/FeatureServer/0/query?';
    }

    static get brisbaneOverlandURL() {
        return 'https://services2.arcgis.com/dEKgZETqwmDAh1rP/arcgis/rest/services/Flood_overlay_Overland_flow/FeatureServer/0/query?';
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Gold Coast Water Network URLs

    static get goldCoastWaterPipeURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Potable_Water_Pipe/FeatureServer/0/query?';
    }

    static get goldCoastWaterServiceConnectionURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Water_Service_Connection/FeatureServer/7/query?';
    }

    static get goldCoastSewerManholeURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Sewer_Maintenance_Hole/FeatureServer/0/query?';
    }

    static get goldCoastSewerPipePressureURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Sewer_Pipe_Pressure/FeatureServer/1/query?';
    }

    static get goldCoastSewerPipeNonPressureURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Sewer_Pipe_Non_Pressure/FeatureServer/1/query?';
    }

    // drainage pipe = rainwater collection
    static get goldCoastDrainagePipeURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Drainage_Pipe/FeatureServer/1/query?';
    }

    // rainwater end structures, if needed for a complete rainwater network
    // https://services.arcgis.com/3vStCH7NDoBOZ5zn/ArcGIS/rest/services/Stormwater_End_Structure/FeatureServer

    static get goldCoastCadastreURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Easement/FeatureServer/0/query?';
    }

    static get goldCoastFloodURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/arcgis/rest/services/Flood_assessment_required_v6/FeatureServer/0/query?';
    }

    static get goldCoastBushfireURL() {
        return 'https://services.arcgis.com/3vStCH7NDoBOZ5zn/ArcGIS/rest/services/City_Plan_Version_9/FeatureServer/6/query?';
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Urban Utitilites Water Network URLs

    static get urbanUtilitiesWaterPressureURL() {
        return 'https://services3.arcgis.com/ocUCNI2h4moKOpKX/arcgis/rest/services/Water_sql/FeatureServer/17/query?';
    }

    static get urbanUtilitlesWaterServiceURL() {
        return 'https://services3.arcgis.com/ocUCNI2h4moKOpKX/arcgis/rest/services/Water_sql/FeatureServer/19/query?';
    }

    static get urbanUtilitiesWaterTrunkURL() {
        return 'https://services3.arcgis.com/ocUCNI2h4moKOpKX/arcgis/rest/services/Water_sql/FeatureServer/16/query?';
    }

    static get urbanUtilitiesWaterFittingURL() {
        return 'https://services3.arcgis.com/ocUCNI2h4moKOpKX/arcgis/rest/services/Water_sql/FeatureServer/3/query?';
    }

    static get urbanUtilitiesSewerGravityURL() {
        return 'https://services3.arcgis.com/ocUCNI2h4moKOpKX/arcgis/rest/services/Sewer_sql/FeatureServer/17/query?';
    }

    static get urbanUtilitlesSewerManholeURL() {
        return 'https://services3.arcgis.com/ocUCNI2h4moKOpKX/arcgis/rest/services/Sewer_sql/FeatureServer/4/query?';
    }

    static get brisbaneStormWaterURL() {
        return 'https://services2.arcgis.com/dEKgZETqwmDAh1rP/arcgis/rest/services/Stormwater_Pipe_Existing/FeatureServer/0/query?';
    }

    static get yarraValleyWaterURL() {
        return 'https://webmap.yvw.com.au/YVWassets/service.svc/get?request=GetFeature&service=WFS&version=2.0.0&TypeNames=WATERPIPES&';
    }

    static get yarraValleySewerURL() {
        return 'https://webmap.yvw.com.au/YVWassets/service.svc/get?request=GetFeature&service=WFS&version=2.0.0&TypeNames=SEWERPIPES&';
    }

    static get yarraValleyManholeURL() {
        return 'https://webmap.yvw.com.au/YVWassets/service.svc/get?request=GetFeature&service=WFS&version=2.0.0&TypeNames=SEWERACCESSPOINTS&';
    }

    static get yarraValleySewerBranchURL() {
        return 'https://webmap.yvw.com.au/YVWassets/service.svc/get?request=GetFeature&service=WFS&version=2.0.0&TypeNames=SEWERBRANCHES&';
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // IRestorable implementation

    /**
     * @return {{flipSiting: boolean, translation: {}, coordinates: ({}|null), autoPlacement: boolean, location: {highlightedTitle: string, bbox: number[], categoryTitle: string, vicinity: string, highlightedVicinity: string, position: number[], href: string, id: string, title: string, category: string, type: string, resultType: string}, zoom: number, selectedArea: (*[]|null), properties: {lgaPid: string, areaSqm: number, address: string, streetNumber: string, locality: string, lotNumber: string, planNumber: string, addressId: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, locPid: string, dtCreate: string}}}
     */
    recordState()
    {
        return {
            location:       this._location,
            zoom:           this._zoom,
            translation:    this._translation.recordState(),
            autoPlacement:  this._autoPlacement,
            flipSiting:     this._flipSiting,
            selectedArea:   this._selectedArea ? this._selectedArea.sourceVertices.map(v=>v.recordState()) : null,
            coordinates:    this._selectedCoordinates ? this._selectedCoordinates.recordState() : null,
            properties:     this._selectedProperties,
        };
    }

    /**
     * restores this object to the state represented by the 'state' data structure
     * @param state {{flipSiting: boolean, translation: {}, coordinates: ({}|null), autoPlacement: boolean, location: {highlightedTitle: string, bbox: number[], categoryTitle: string, vicinity: string, highlightedVicinity: string, position: number[], href: string, id: string, title: string, category: string, type: string, resultType: string}, zoom: number, selectedArea: (*[]|null), properties: {lgaPid: string, areaSqm: number, address: string, streetNumber: string, locality: string, lotNumber: string, planNumber: string, addressId: string, parclType: string, jurisdictionId: string, parclStts: string, stateCode: string, id: string, locPid: string, dtCreate: string}}}
     */
    restoreState(state)
    {
        try {
            this._translation.restoreState(state.translation);
            this._zoom = state.zoom;
            this._autoPlacement = state.autoPlacement;
            this._flipSiting = state.flipSiting;
            this._selectedArea = state.selectedArea ? Polygon.from(state.selectedArea.map(p => new Point(p.x, p.y))) : null;
            this._selectedCoordinates = state.coordinates ? new Point(state.coordinates.x, state.coordinates.y) : null;

            this._location = state.location;
            this._selectedProperties = state.properties;

            this.dispatchEvent(new EventBase(NearmapModel.LOCATION_CHANGE, this));
            this.onRestored();
        }   catch (e) {
            //
        }
    }
}