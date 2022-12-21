import HighlightableModel from '../../../events/HighlightableModel';
import HouseLayerModel from './HouseLayerModel';
import Point from '../../../geom/Point';
import Matrix from '../../../geom/Matrix';
import EventBase from '../../../events/EventBase';
import HouseLayerType from './HouseLayerType';
import Utils from '../../../utils/Utils';
import TransformEvent from '../../events/TransformEvent';
import Geom from '../../../utils/Geom';
import HouseSvgParser from '../../../data/HouseSvgParser';
import NavigationEvent from '../../events/NavigationEvent';
import Logger from '../../../utils/Logger';
import Segment from '../../../geom/Segment';
import RestoreEvent from '../../events/RestoreEvent';
import XMLStructureReader from '../../data/henley/XMLStructureReader';
import XMLHouseData from '../../data/henley/XMLHouseData';
import XMLHenleyDataMerger from '../../data/henley/XMLHenleyDataMerger';
import Rectangle from '../../../geom/Rectangle';
import LotEdgeModel from '../lot/LotEdgeModel';
import Polygon from '../../../geom/Polygon';


let VERBOSE				= true;
let POS_RESET_THRESHOLD	= 300;

/**
 * @INFO: Before conversion = 1026 lines
 * @IMPLEMENTS IRestorable, IMeasureTarget
 *
 * @DISPATCHES "floorMirrored"
 * @DISPATCHES "changeHousePlan"
 * @DISPTACHES "changeStructure"
 * @DISPATCHES TransformEvent.TRANSLATE
 * @DISPATCHES NavigationEvent.CLEAR_STEP
 */
export default class HouseModel extends HighlightableModel {

	static get DEFAULT_OMP()	{ return 0.45; }
	static get FORMAT_SVG()		{ return 0; }
	static get FORMAT_XML()		{ return 1; }
	static get OMP_CHANGED()	{ return 'vfm.OmpChanged'; }


	/**
	 * @param transform {TransformationsLayerModel}
	 * @param canDelete {boolean}
	 * @param context {*}
	 */
	constructor(transform, canDelete=true, context=null)
	{
		super(context);

		/**
		 * @type {TransformationsLayerModel}
		 * @private
		 */
		this._transformations   = transform;
		this._transformations.floorModel = this;
		this._transformations.addEventListener(EventBase.CHANGE, this.transformChange, this);
		this._transformations.addEventListener(RestoreEvent.RESTORE_COMPLETE, this.transformRestored, this);

		/**
		 * @type {Point}
		 * @private
		 */
		this._center		    = new Point();
        /**
         * @type {number}
         * @private
         */
        this._rotation          = 0;
        /**
         * The x coordinate around which the mirroring is done
         * @type {number}
         * @private
         */
        this._mirrorX           = 0;
        /**
         * The y coordinate around which the mirroring is done
         * @type {number}
         * @private
         */
        this._mirrorY           = 0;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._mirroredV			= false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._mirroredH			= false;

        /**
         * Calculated maximum width of the house across all facades and options, in meters
         * @type {number}
         * @private
         */
        this._fullWidth         = 0;
        /**
         * Calculated maximum height of the house across all facades and options, in meters
         * @type {number}
         * @private
         */
        this._fullHeight        = 0;

        /**
		 * @type {HouseLayerModel[]}
		 * @private
		 */
		this._layers		    = [];

		/**
		 * @type {HouseLayerModel[]}
		 * @private
		 */
		this._metaLayers		= [];

        /**
         * @type {HouseLayerModel}
         * @private
         */
        this._addonsLayer       = null;

        /**
         * @type {HouseData}
         * @private
         */
        this._houseData         = null;

        /**
         * @type {boolean}
         * @private
         */
        this._canDelete		    = canDelete;
        /**
         * Flag that indicates if the add-ons should be rendered on the addonsLayer
         * @type {boolean}
         * @private
         */
        this._renderAddons      = false;

        /**
         * Local transformation placed in the house space if renderAddons=false and in the global siting space if renderAddons=true
         * @type {Matrix}
         * @private
         */
		this._houseSpaceLocal   = new Matrix();
        /**
         * Inverse of the localTrans
         * @type {Matrix}
         * @private
         */
        this._houseSpaceGlobal	= this._houseSpaceLocal.clone();
        this._houseSpaceGlobal.invert();

        /**
         * Local transformation that is always placed in the global siting space
         * @type {Matrix}
         * @private
         */
        this._sitingSpaceLocal	= new Matrix();

        /**
         * @type {Matrix}
         * @private
         */
        this._sitingSpaceGlobal	= new Matrix();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Henley Properties

		/**
		 * @type {number}
		 * @private
		 */
		this._ompWidth			= HouseModel.DEFAULT_OMP;

		/**
		 * @type {XMLHouseData}
		 * @private
		 */
		this._xmlData			= null;

		/**
		 * @type {XMLHenleyDataMerger}
		 * @private
		 */
		this._merger			= null;
	}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Getters / Setters

	/**
	 * @return {number}
	 */
	get ompWidth() { return this._ompWidth; }

	/**
	 * @param v {number}
	 */
	set ompWidth(v) {
		this._ompWidth=v;
		this.dispatchEvent(new EventBase(HouseModel.OMP_CHANGED, this));
	}

	/**
	 * @returns {number}
	 */
	get format() {
		if (this._xmlData)
			return HouseModel.FORMAT_XML;
		else
			return HouseModel.FORMAT_SVG;
	}

	/**
     * @return {boolean}
     */
	get canDelete() { return this._canDelete; }

    /**
     * Used for multi-house sitings
     * @param v {boolean}
     */
	set activelySelected(v) { this.highlight=v; }
    /**
     * @return {boolean}
     */
	get activelySelected() { return this.highlight; }

    /**
     * @return {Matrix}
     */
	get  localTrans() { return  this._houseSpaceLocal; }
    /**
     * @return {Matrix}
     */
	get globalTrans() { return this._houseSpaceGlobal; }

	/**
	 * @return {Matrix}
	 */
	get sitingLocalTransform() { return this._sitingSpaceLocal; }

	/**
	 * @return {Matrix}
	 */
	get sitingGlobalTransform() { return this._sitingSpaceGlobal; }

    /**
     * @return {number}
     */
	get fullWidth () { return this._fullWidth; }
    /**
     * @return {number}
     */
    get fullHeight() { return this._fullHeight; }

	/**
	 * @return {number}
	 */
	get mirrorY() { return this._mirrorY; }

	/**
	 * @return {number}
	 */
	get mirrorX() { return this._mirrorX; }

	/**
	 * @return {boolean}
	 */
	get mirroredV() { return this._mirroredV; }

	/**
	 * @return {boolean}
	 */
	get mirroredH() { return this._mirroredH; }

    /**
     * @return {Point}
     */
	get center() { return this._center; }

    /**
     * @return {HouseLayerModel[]}
     */
	get layers() { return this._layers; }

	/**
	 * @return {HouseLayerModel[]}
	 */
	get metaLayers() { return this._metaLayers; }

	/**
	 * @return {HouseEdgeModel[]}
	 */
	get edges() {
		let edges = [];
		for (let layer of this.layers) {
			if (layer.visible && (layer.type===HouseLayerType.FACADE || layer.type===HouseLayerType.OPTION)) {
				edges = edges.concat(layer.edges);
			}
		}

		return edges;
	}

    /**
     * @return {HouseLayerModel}
     */
	get lastLayer() { return this._layers.length ? this._layers[this._layers.length-1] : null; }

    /**
     * @return {number}
     */
	get rotation() { return this._rotation; }

    /**
     * @param v {number}
     */
	set rotation(v) {
		if ( v < -180 ) v += 360;
		if ( v >  180 ) v -= 360;

		this._rotation = v;
        this._transformations.rotation = v;
        this.rebuildTransforms();
	}

    /**
     * @return {TransformationsLayerModel}
     */
	get transformations() { return this._transformations; }

    /**
     * @return {HouseData}
     */
	get houseData() { return this._houseData; }

	/**
     * @return {String} Format: {house name} - {facade name} facade. e.g.: Villa Modena 5415 - Carringdale Facade
     */
	get houseStructureDetails() { return this.getHouseStructDetails(' - '); }

    /**
     * @return {string}
     */
	get houseName() { return this._houseData ? this._houseData.name : ''; }

    /**
     * @return {string} Name of the selected facade
     */
	get facadeName() {
		if (this._xmlData) {
			if (this._merger && this._merger.facade) {
				return XMLStructureReader.displayName(this._merger.facade.name);
			}
		}	else {
			for (let i = 0; i < this._layers.length; ++i) {
				if (this._layers[i].type === HouseLayerType.FACADE && this._layers[i].visible) {
					return Utils.svgIdToName(this._layers[i].group.id);
				}
			}
		}

		return '';
	}

	/**
	 * @returns {string|null}
	 */
	get selectedFacadeId() {
		const currentFacade = this._layers.find(
			facade => facade.type === HouseLayerType.FACADE && facade.visible
		);

		return currentFacade !== undefined ? currentFacade.group.id : null;
	}

    /**
     * @return {boolean}
     */
	get renderAddons() { return this._renderAddons; }

    /**
     * @param v
     */
    set houseData(v) { this._houseData = v; }

    /**
     * @param v
     */
	set renderAddons(v)
	{
		if ( v !== this._renderAddons ) {
			this._renderAddons = v;
			this.applyRenderAddons();
        }
	}

	/**
	 * @private
	 */
	applyRenderAddons() {
		if (this._addonsLayer) {
			this._addonsLayer.visible = this._renderAddons;
			this._addonsLayer.clear();

			if (this._renderAddons) {
				this._transformations.buildAdditionsOn(this._addonsLayer);
			}
		}

		this.rebuildTransforms();
	}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Helpers

    /**
     * @param glue {string}
     * @return {string}
     */
    getHouseStructDetails(glue)
    {
		if (this._xmlData) {
			if (this._merger && this._merger.facade) {
				return Utils.capitalize(this._xmlData.name) + glue +
					XMLStructureReader.displayName(this._merger.facade.name);
			}
		}	else {
			for (let i = 0; i < this._layers.length; ++i) {
				if (this._layers[i].type === HouseLayerType.FACADE && this._layers[i].visible) {
					return this._houseData.name + glue + Utils.svgIdToName(this._layers[i].group.id) + ' FACADE';
				}
			}
		}

        return '';
    }

    /**
     * @param glue {string}
     * @return {string} format: {option1} / {option2} / ... / {optionn}
     */
    houseOptionsDetails(glue=' / ')
    {
		let pieces = [];
		if (this._xmlData) {
			for (let i=0; i<this._merger.selectedOptions.length; ++i) {
				pieces.push(
					this._merger.selectedOptions[i].displayName
				);
			}
		}	else {
			for (let i = 0; i < this._layers.length; ++i) {
				if (this._layers[i].type === HouseLayerType.OPTION && this._layers[i].visible) {
					pieces.push(Utils.svgIdToName(this._layers[i].group.id));
				}
			}
		}

		return pieces.join(glue);
    }

    /**
     * @param edge {HouseEdgeModel|Segment}
     * @return {{edge: number, layer: number}}
     */
    getEdgeInfo(edge)
    {
        let l, e;
        for (l=0; l<this._layers.length; ++l) {
            for (e=0; e<this._layers[l].edges.length; ++e) {
                if ( this._layers[l].edges[e]===edge ) {
                    return {
                        layer: l,
                        edge : e
                    };
                }
            }
        }

        return {layer:-1, edge:-1};
    }

    /**
     * @param info {{edge: number, layer: number}}
     * @return {HouseEdgeModel}
     */
    getEdgeFromInfo(info)
    {
		if (info.layer >= 0 && info.edge >= 0 && this._layers[info.layer]) {
			return this._layers[info.layer].edges[info.edge];
        }

        return null;
    }

	/**
	 * @return {Rectangle} the bounding box for the currently selected facade + options
	 * @TODO @FIX -> the minX, maxX, minY, maxY values are incorrect once we apply transformations to the layers
	 */
	get boundingBox()
	{
		// get the minimum
		let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;

		this._layers.forEach(layer => {
			if (layer.visible && layer.type !== HouseLayerType.ROOF && layer.edges.length) {
				minX = Math.min( minX, layer.minX );
				maxX = Math.max( maxX, layer.maxX );
				minY = Math.min( minY, layer.minY );
				maxY = Math.max( maxY, layer.maxY );
			}
		});

		return new Rectangle(
			minX - this.fullWidth /2 + this.center.x,
			minY - this.fullHeight/2 + this.center.y,
			maxX-minX,
			maxY-minY
		);
	}

	/**
	 * @return {Rectangle}
	 */
	get transformedBoundingBox() {
		// get the minimum
		let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;

		this._layers.forEach(layer => {
			if (layer.visible && layer.type !== HouseLayerType.ROOF && layer.edges.length) {
				layer.edges.forEach(
					edge => {
						minX = Math.min(minX, edge.a.x, edge.b.x);
						maxX = Math.max(maxX, edge.a.x, edge.b.x);
						minY = Math.min(minY, edge.a.y, edge.b.y);
						maxY = Math.max(maxY, edge.a.y, edge.b.y);
					}
				);
			}
		});

		return new Rectangle(
			minX - this.fullWidth /2 + this.center.x,
			minY - this.fullHeight/2 + this.center.y,
			maxX-minX,
			maxY-minY
		);
	}

	/**
	 * @param padding {number}
	 * @return {Rectangle}
	 */
	getBuildingPlatform(padding) {
		// @TODO: include / merge porch & alfresco
		const boundaries = this.getHouseBoundary();

		if (boundaries) {
			// 1. translate the slab bounding box to the same space as the house model
			// 2. apply padding to the house slab bounding box
			// 3. enlarge to also contain the garage (if needed)
			return boundaries.externalBoundingBox.translate(
				-this.fullWidth /2 + this.center.x,
				-this.fullHeight/2 + this.center.y
			).pad(padding).enlarge(this.transformedBoundingBox);
		}	else {
			return this.transformedBoundingBox.pad(padding);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Tests

	/**
	 * @param point {Point}
	 * @returns {Boolean}
	 */
	contains(point) {
		return this.containsCoords(point.x, point.y);
	}

	/**
	 * @param x {number}
	 * @param y {number}
	 * @returns {boolean}
	 */
	containsCoords(x, y) {
		// find out which ray goes inward and which goes outwards
		let i, insideR=0, insideL=0, edge, farR, farL;

		// cast a ray from the point to the far right
		farR = x+LotEdgeModel.FAR_NORMAL;
		farL = x-LotEdgeModel.FAR_NORMAL;

		const edges = this.edges;

		// intersect the ray with all the segments in the polygon
		for (i=0; i<edges.length; ++i) {
			edge = edges[i];

			if ( Geom.segmentIntersectionCoords(
				edge.a.x, edge.a.y, edge.b.x, edge.b.y, x, y, farR, y
			) ) {
				++insideR;
			}

			if ( Geom.segmentIntersectionCoords(
				edge.a.x, edge.a.y, edge.b.x, edge.b.y, x, y, farL, y
			) ) {
				++insideL;
			}
		}

		// if we have an odd number of intersections, the point is within the polygon; otherwise, it's outside
		return insideR===1 || insideL===1;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Transformations/Actions

	/**
     * @param isVertical {boolean}
     */
	toggleMirror(isVertical=true)
	{
		// Reset the transformations
		this._transformations.clear();

		for (let i=0; i<this._layers.length; ++i) {
			if (isVertical) {
				this._layers[i].mirrorVertically(this._mirrorY);
			}   else {
				this._layers[i].mirrorHorizontally(this._mirrorX);
			}
		}

		for (let i=0; this._metaLayers && i<this._metaLayers.length; ++i) {
			if (isVertical) {
				this._metaLayers[i].mirrorVertically(this._mirrorY);
			}	else {
				this._metaLayers[i].mirrorHorizontally(this._mirrorX);
			}
		}

		if (isVertical) {
			this._mirroredV = !this._mirroredV;
		}   else {
			this._mirroredH = !this._mirroredH;
		}

		this.dispatchEvent(new EventBase('floorMirrored', this));
	}

	/**
	 * @param dx {number}
	 * @param dy {number}
	 */
	translate(dx, dy)
	{
		this._center.translate(dx, dy, false);
		this.rebuildTransforms();
	}
	/**
	 * @param x {number}
	 * @param y {number}
	 */
	positionAt(x, y)
	{
		this._center.moveTo(x, y, false);
		this.rebuildTransforms();
	}

	/**
	 * Translate a specific distance along the angle defined by A and B
	 * @param a {Point}
	 * @param b {Point}
	 * @param delta {number}
	 */
	moveOnSegment(a, b, delta)
	{
		this.translateOnSegment(a, b, delta - Geom.segmentLength(a.x, a.y, b.x, b.y));
	}

	/**
	 * translates the floor by the given distance on the indicated direction
	 * @param a {Point}
	 * @param b {Point}
	 * @param delta {number}
	 */
	translateOnSegment(a, b, delta)
	{
		// translate along the angle defined by A and B
		const angle = Geom.angleBetween(a.x, a.y, b.x, b.y);

		this.dispatchEvent(new TransformEvent(
			TransformEvent.TRANSLATE, {
				dx:delta * Math.cos(angle),
				dy:delta * Math.sin(angle)
			},
			this
		));
	}

	/**
	 * Transforms a point from local (i.e. house) coordinates to global (i.e. siting space) coordinates
	 * @param px
	 * @param py
	 * @return {Point}
	 */
	localToGlobal(px, py)
	{
		return this._sitingSpaceGlobal.transformPoint(new Point(px, py));
	}

	/**
	 * Transforms a point from global (i.e. siting space) coordinates to local (i.e. house) coordinates
	 * @param px {number}
	 * @param py {number}
	 * @return {Point}
	 */
	globalToLocal(px, py)
	{
		return this._sitingSpaceLocal.transformPoint( new Point( px, py ) );
	}

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // House Loading / Structure Creation

	/**
	 * @param data {HouseData|XMLHouseData}
	 * @param setupNewLayers {boolean}
	 */
	loadHouse(data, setupNewLayers=true)
	{
		this.dispatchEvent(new EventBase('changeHousePlan', this));

		this.clearLayers();
		this._houseData	= data;

		if (data instanceof XMLHouseData) {
			this._xmlData = data;
		}

		if (this._xmlData) {
			this.setupXMLDataParser();
		}	else {
			if (setupNewLayers) {
				this.setupHouseLayers();

				// check if we should reset the position
				if (isNaN(this._center.x) || isNaN(this._center.y) ||
					this._center.x < -POS_RESET_THRESHOLD ||
					this._center.x > POS_RESET_THRESHOLD ||
					this._center.y < -POS_RESET_THRESHOLD ||
					this._center.y > POS_RESET_THRESHOLD) {

					this.dispatchEvent(new TransformEvent(
						TransformEvent.TRANSLATE, {
							dx: -this._center.x,
							dy: -this._center.y
						},
						this
					));
				}
			}
		}
	}

	/**
	 * @param id {string}
	 */
	selectFacade(id)
	{
		this.dispatchEvent(new EventBase('changeStructure', this));
		this.hideLayers(HouseLayerType.FACADE);

		if (id) {
			this.showLayer(id);
		}
	}

	/**
	 * @param optionIDs {string[]} the list of IDs for the options to select
	 */
	selectOptions(optionIDs)
	{
		this.dispatchEvent(new EventBase('changeStructure', this));
		this.hideLayers(HouseLayerType.OPTION);

		if (optionIDs && optionIDs.length) {
			for (let i=0; i<optionIDs.length; ++i) {
				this.showLayer(optionIDs[i]);
			}
		}
	}

	/**
	 * @returns {[]}
	 */
	getSelectedOptions() {
		let optionIDs = [];
		for (let i=0; i<this._layers.length; ++i) {
			if (this._layers[i].type===HouseLayerType.OPTION && this._layers[i].visible) {
				optionIDs.push(this._layers[i].group.id);
			}
		}

		return optionIDs;
	}

	/**
	 * Parses a house data
	 */
	setupHouseLayers()
	{
		// The ruler is parsed by the houseData
		const toMm = this._houseData.toMeters * 1000;

		// Calculate the bounds of the floor-plan
		let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;

		// Add all layer types to the model (facades, options, roofs)
		let data = [
			{list: this._houseData.facades, type:HouseLayerType.FACADE, target: this._layers, boundingBox: true},
			{list: this._houseData.options, type:HouseLayerType.OPTION, target: this._layers, boundingBox: true},
			{list: this._houseData.roofs  , type:HouseLayerType.ROOF  , target: this._layers, boundingBox: false},
			{list: this._houseData.facadeBoundaries,   type:HouseLayerType.META_BOUNDARY, 	  target: this._metaLayers, boundingBox: false},
			{list: this._houseData.facadeGarages, 	   type:HouseLayerType.META_GARAGE, 	  target: this._metaLayers, boundingBox: false},
			{list: this._houseData.facadeGarageFronts, type:HouseLayerType.META_GARAGE_FRONT, target: this._metaLayers, boundingBox: false},
			{list: this._houseData.facadePorches, 	   type:HouseLayerType.META_PORCH, 		  target: this._metaLayers, boundingBox: false},
			{list: this._houseData.facadeAlfresco, 	   type:HouseLayerType.META_ALFRESCO,	  target: this._metaLayers, boundingBox: false},
		];
		for (let i=0; i<data.length; ++i) {
			const layerConfig = data[i];

			for (let j=0, houseLayer; j<layerConfig.list.length; ++j) {
				layerConfig.target.push(
					houseLayer = new HouseLayerModel(layerConfig.list[j], layerConfig.type, toMm)
				);

				if (layerConfig.boundingBox) {
					minX = Math.min(minX, houseLayer.minX);
					maxX = Math.max(maxX, houseLayer.maxX);
					minY = Math.min(minY, houseLayer.minY);
					maxY = Math.max(maxY, houseLayer.maxY);
				}
			}
		}

		// Move the plan to its calculated origin
		this._layers.forEach(layer => layer.translate(-minX, -minY));
		this._metaLayers.forEach(layer => layer.translate(-minX, -minY));

		// Create the Add-ons layer
		this._layers.push(this._addonsLayer = new HouseLayerModel(null, HouseLayerType.ADDONS, toMm));

		this._fullWidth	 = maxX - minX;
		this._fullHeight = maxY - minY;

		this._mirrorX	 = this._fullWidth / 2;
		this._mirrorY	 = this._fullHeight/ 2;

		this.rebuildTransforms();
		this.dispatchEvent(new EventBase(EventBase.ADDED, this));
	}

	/**
	 * Update the siting/house space transformations
	 */
	rebuildTransforms()
	{
		this._houseSpaceLocal.identity();
		this._sitingSpaceLocal.identity();

		if (this._renderAddons) {
			this._houseSpaceLocal.translate(-this._center.x, -this._center.y);
			this._houseSpaceLocal.rotate(-Geom.deg2rad(this._rotation));
		}

		// always apply to localFullTrans
		this._sitingSpaceLocal.translate(-this._center.x, -this._center.y);
		this._sitingSpaceLocal.rotate(-Geom.deg2rad(this._rotation));

		this._houseSpaceLocal.translate(this._fullWidth/2, this._fullHeight/2);
		this._sitingSpaceLocal.translate(this._fullWidth/2, this._fullHeight/2);

		this._houseSpaceGlobal = this._houseSpaceLocal.clone();
		this._houseSpaceGlobal.invert();

		this._sitingSpaceGlobal = this._sitingSpaceLocal.clone();
		this._sitingSpaceGlobal.invert();

		this.onChange();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Layers

	/**
	 * Show a layer identified by its ID and all of its associated roof lines
	 *
	 * @param id {string}
	 * @private
	 */
	showLayer(id)
	{
		let roofIds, groupId;

		id		= id.toLowerCase();
		roofIds	= HouseSvgParser.getRoofNamesFor(id);

		for (let i=0; i<this._layers.length; ++i) {
			if (this._layers[i].group) {
				groupId	= this._layers[i].group.id.toLowerCase();

				if ( groupId===id || roofIds.indexOf(groupId)!==-1 ) {
					this._layers[i].visible = true;
				}
			}
		}
	}

	/**
	 * @param type {HouseLayerType}
	 * @private
	 */
	hideLayers(type)
	{
		let hidden=[], i;

		// Hide Facades/Options
		for (i=0; i<this._layers.length; ++i) {
			if (this._layers[i].type===type) {
				this._layers[i].visible = false;

				// add all possible roof names for this this layer to the to-be-hidden list
				hidden = hidden.concat(
					HouseSvgParser.getRoofNamesFor(this._layers[i].group.id.toLowerCase())
				);
			}
		}

		// Hide Roofs that match the names in the 'to-be-hidden' list
		for (i=0; i<this._layers.length; ++i) {
			if (this._layers[i].group && hidden.indexOf(this._layers[i].group.id.toLowerCase()) !== -1 ) {
				this._layers[i].visible = false;
			}
		}
	}

	/**
	 * @param type {HouseLayerType}
	 * @private
	 */
	clearLayers(type=null)
	{
		for (let i=this._layers.length-1; i+1; --i) {
			if (!type || this._layers[i].type===type) {
				this._layers[i].deleteLayer();
				this._layers.splice(i,1);
			}
		}
		this._metaLayers = [];
	}

	/**
	 * resets the house position and transformations
	 */
	clear()
	{
		this._center.x = 0;
		this._center.y = 0;

		// reset the transformation layer's position
		this._transformations.clear(true);

		this.dispatchEvent(new NavigationEvent(NavigationEvent.CLEAR_STEP, this));
	}

	/**
	 * @param forceDelete {boolean}
	 * @public
	 */
	deleteFloor(forceDelete=false)
	{
		if (this.canDelete || forceDelete) {
			this.clearLayers();
			this.onDelete();
		}
	}

	/**
	 * @public
	 */
	selectFloor()
	{
		this.onSelect();
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// transformation listeners

	transformChange()
    {
        this._transformations.apply();
        this.dispatchEvent(new EventBase('changeOutline', this));
    }

	transformRestored() {
		if (this.renderAddons) {
			this.applyRenderAddons();
			this.dispatchEvent(new EventBase('changeOutline', this));
		}
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// House Meta Layers

	/**
	 * @param crossover {LotDrivewayModel}
	 * @return {Segment|null}
	 */
	getGarageFront(crossover=null) {
		let layer = this._getMetaLayer(HouseLayerType.META_GARAGE_FRONT);

		if (!layer) {
			layer = this._getMetaLayer(HouseLayerType.META_GARAGE);
		}

		if (!layer || !layer.edges.length) {
			// can't find garage front
			return null;
		}

		// return the garage front
		if (layer.edges.length===1) {
			return layer.edges[0].clone().transform(this._houseSpaceGlobal);
		}	else {
			return this.getClosestMetricSegmentTo(crossover.x, crossover.y, [layer]);
		}
	}

	/**
	 * @return {Polygon|null}
	 */
	getHouseBoundary() {
		return this._getMetaLayer(HouseLayerType.META_BOUNDARY);
	}

	/**
	 * @return {Polygon|null}
	 */
	getGarageBoundary() {
		return this._getMetaLayer(HouseLayerType.META_GARAGE);
	}

	/**
	 * @return {Polygon|null}
	 */
	getPorchBoundary() {
		return this._getMetaLayer(HouseLayerType.META_PORCH);
	}

	/**
	 * @return {Polygon|null}
	 */
	getAlfrescoBoundary() {
		const pieces = [];

		const meta   = this._getMetaLayer(HouseLayerType.META_ALFRESCO);
		const option = this._layers.find(
			layer => layer.visible && layer.type === HouseLayerType.OPTION && layer.isAlfresco
		);

		meta   && pieces.push(meta);
		option && pieces.push(new Polygon(option.edges));

		return pieces.length === 0 ? null :
			pieces.length === 1 ? pieces[0] :
			pieces[0].union(pieces[1]);
	}

	/**
	 * @return {(Polygon|HouseModel)[]}
	 */
	getMetaHouseAreas() {
		return [
			this.getHouseBoundary() || this,
			this.getGarageBoundary(),
			this.getAlfrescoBoundary(),
			this.getPorchBoundary()
		].filter(area => area !== null);
	}

	/**
	 * @param layerType {HouseLayerType}
	 * @return {Polygon|null}
	 * @private
	 */
	_getMetaLayer(layerType) {
		const facadeId = (this._houseData && this._houseData.isXMLFormat) ?
			null :
			HouseSvgParser.elementNameFromId(this.selectedFacadeId);

		//
		const layer = this._metaLayers.find(
			layer => layer.type === layerType &&
				(facadeId===null || facadeId === HouseSvgParser.elementNameFromId(layer.group.id))
		);

		// create a polygon containing the house boundaries
		return layer !== undefined ? new Polygon(layer.edges) : null;

		// If we need boundaries in global space
		// layer.edges.map(edge => edge.clone().transform(this._houseSpaceGlobal)) :
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Measurements

	/**
	 * @param globalX {number}
	 * @param globalY {number}
	 * @param searchLayers {HouseLayerModel[]}
	 * @return {Segment}
	 *
	 * @public
	 */
	getClosestMetricSegmentTo(globalX, globalY, searchLayers=null)
	{
		const pos  = this._houseSpaceLocal.transformPoint(new Point(globalX, globalY));
		const edge = this.getSnapEdge(pos.x, pos.y, null, false, searchLayers);

		if (!edge) {
			return null;
		}

		return edge.clone().transform(this._houseSpaceGlobal);
		/**
		return new Segment(
			this._houseSpaceGlobal.transformPoint(new Point(edge.a.x,edge.a.y)),
			this._houseSpaceGlobal.transformPoint(new Point(edge.b.x,edge.b.y))
		);*/
	}

	/**
	 * Given a fixed segment and a position close to the house, it searches for the closest wall and rotates the house
	 * so that the wall and segment are parallel
	 *
	 * @param segment {Segment|LotCurveModel}	The segment (e.g. lot boundary, wall of another house in dual occupancy) to align with
	 * @param globalX {number}					x coordinate of the search position, next to a house wall
	 * @param globalY {number}					y coordinate of the search position, next to a house wall
	 * @param startPoint {Point}				origin for the house search direction
	 *
	 * @public
	 */
	rotateToAlignWithSegmentAt(segment, globalX, globalY, startPoint)
	{
		let p = this._houseSpaceLocal.transformPoint(new Point(globalX,globalY)),
			reference, boundaryAngle, wallAngle, closeRot, farRot, rotation;

		// Find the closest house wall to the search position
		const houseWall	= this.getSnapEdge(p.x, p.y, this._houseSpaceLocal.transformPoint(startPoint));
		if  (!houseWall) {
			return;
		}

		boundaryAngle	= (typeof segment.angleController !== 'undefined') ? segment.angleController.radians : segment.angle;
		wallAngle		= houseWall.angle + Geom.deg2rad(this.rotation);

		// Calculate the angles for rotating in both directions (clockwise and anti-clockwise).
		closeRot		= Geom.limitAngle(boundaryAngle - wallAngle);
		farRot			= Geom.limitAngle(boundaryAngle - wallAngle + Math.PI);

		/**
		 * To determine which rotation direction is best, we get the location on the wall where the search direction
		 * intersects with the house and then rotate this point around the center of the house in both directions.
		 *
		 * We then keep the rotation that brings this point closest to the lot boundary.
		 *
		 * @OPTIMIZE: we can determine the snap position from the house wall.
		 * @type {Point}
		 */
		reference		= this.getSnapPosition(globalX, globalY, startPoint);

		if (this._getRotationDistance(reference, segment, closeRot) <
			this._getRotationDistance(reference, segment, farRot) ) {
			rotation	= closeRot;
		}	else {
			rotation	= farRot;
		}
		
		// Dispatch a transformation event that will rotate both the house and its transformations
		this.dispatchEvent(
			new TransformEvent(
				TransformEvent.ROTATE, {
					rotation: Geom.rad2deg(rotation)
				},
				this
			)
		);
	}

	/**
	 * Rotates a point around the center of the house and returns the distance between the new position and a fixed segment
	 *
	 * @param point {Point}
	 * @param segment {Segment}
	 * @param degrees {number}
	 *
	 * @private
	 * @internal
	 */
	_getRotationDistance(point, segment, degrees)
	{
		// work on a copy of the point
		point = point.clone();
		point.rotate(degrees, this.center.x, this.center.y);
		return Geom.pointToSegmentDistance(point.x, point.y, segment.a.x, segment.a.y, segment.b.x, segment.b.y);
	}

	/**
	 * Returns a snap position on a house wall, or the search start position (px, py), when no snap is found.
	 *
	 * @param globalX {number}
	 * @param globalY {number}
	 * @param startPoint {Point}
	 * @param snapToRoofs {boolean}
	 * @return {Point}
	 */
	getSnapPosition(globalX, globalY, startPoint=null, snapToRoofs=false)
	{
		const pos = this.getExistingSnapPosition(globalX, globalY, startPoint, snapToRoofs);
		return pos ? pos : new Point(globalX, globalY);
	}

	/**
	 * Gets a snap position on an existing wall of the house. Returns null if no snap position is found
	 *
	 * @param globalX {number}
	 * @param globalY {number}
	 * @param startPoint {Point}
	 * @param snapToRoofs {boolean}
	 * @return {Point|null}
	 */
	getExistingSnapPosition(globalX, globalY, startPoint=null, snapToRoofs=false)
	{
		let p, edge, snap;

		// convert the coordinates to house coordinate space
		if (startPoint) {
			startPoint = this._houseSpaceLocal.transformPoint(startPoint);
		}

		p = this._houseSpaceLocal.transformPoint(new Point(globalX, globalY));
		edge = this.getSnapEdge(p.x, p.y, startPoint, snapToRoofs);

		if (edge) {
			snap = Geom.pointToSegmentIntersection(p.x, p.y, edge.a.x, edge.a.y, edge.b.x, edge.b.y);
			// dist = Geom.segmentLength(p.x, p.y, snap.x, snap.y);

			// convert back to the global coordinate space
			return this._houseSpaceGlobal.transformPoint( snap );
		}

		return null;
	}

	/**
	 * Gets a snap position on a house corner. Returns the search position if no corner snap is found.
	 *
	 * @param globalX {number}
	 * @param globalY {number}
	 * @returns {Point}
	 */
	getSnapCorner(globalX, globalY)
	{
		const pos = this._getExistingSnapCorner(globalX, globalY);
		return pos ? pos : new Point(globalX, globalY);
	}

	/**
	 * Gets a snap position on a house corner. Returns NULL if no corner snap is found.
	 *
	 * @param globalX {number}
	 * @param globalY {number}
	 * @param snapToRoofs {boolean}
	 * @returns {Point}
	 *
	 * @public
	 */
	_getExistingSnapCorner(globalX, globalY, snapToRoofs=false)
	{
		let point, edge;

		// Move the point to the local house space
		point	= this._houseSpaceLocal.transformPoint(new Point(globalX, globalY));

		// Search for a nearby wall
		edge	= this.getSnapEdge(point.x, point.y, null, snapToRoofs);

		// If a wall is found, return its closest edge as the corner
		if (edge) {
			if (Geom.segmentLength(point.x, point.y, edge.a.x, edge.a.y) <
				Geom.segmentLength(point.x, point.y, edge.b.x, edge.b.y) ) {
				// snap to corner A
				return this._houseSpaceGlobal.transformPoint(edge.a);
			}	else {
				// snap to corner B
				return this._houseSpaceGlobal.transformPoint(edge.b);
			}
		}

		return null;
	}

	/**
	 * Extends a ray from (px, py) -> startPoint towards the house, intersecting it with all the edges of the house and
	 * 	returning the closest one (if any)
	 *
	 * @param localX {number} X coordinate of the point that the search/snap is done from, in the house geometric space
	 * @param localY {number} Y coordinate of the point that the search/snap is done from, in the house geometric space
	 * @param startPoint {Point} defines a direction to the search segment
	 * @param roofsOnly {boolean} indicates if the snap should be done to the roof/eaves layer, or to the brickwall layer
	 * @param searchLayers {HouseLayerModel[]} custom house layer search
	 *
	 * @return {HouseEdgeModel}
	 *
	 * @private
	 * @internal use only
	 */
	getSnapEdge(localX, localY, startPoint=null, roofsOnly=false, searchLayers=null)
	{
		let crtPoint, crtDist, bestEdge, bestDist=Infinity, i, j, edge;
		let startPointCheck, spSegment;

		if (startPoint) {
			startPointCheck	= true;
			spSegment		= new Segment(startPoint, new Point(localX, localY));
			spSegment.normalize(spSegment.length * 2);
		}	else {
			startPointCheck = false;
		}

		const layers = searchLayers ? searchLayers : this._layers;
		const skipVisibleCheck = !!searchLayers;

		// Check all display layers of the house (i.e. facades, options)
		for (i=0; i<layers.length; ++i) {
			// Skip layers that are not displayed
			if (!skipVisibleCheck && !layers[i].visible) {
				continue;
			}

			// if roofsOnly == true  -> only search on roofs.
			// if roofsOnly == false -> only search on brickwall
			if ((!roofsOnly && layers[i].type===HouseLayerType.ROOF) ||
				( roofsOnly && layers[i].type!==HouseLayerType.ROOF)) {
				continue;
			}

			// Check all edges of the layer
			for (j=0; j<layers[i].edges.length; ++j) {
				edge	 = layers[i].edges[j];

				// Project the search point onto the edge.
				crtPoint = Geom.pointToSegmentIntersection(localX, localY, edge.a.x, edge.a.y, edge.b.x, edge.b.y);

				if (crtPoint) {
					if (startPointCheck) {
						// if a start point is provided, confirm that the segment formed by it and the search point
						// intersect the current edge
						if (!Geom.segmentIntersectionCoords(
							spSegment.a.x, spSegment.a.y, spSegment.b.x, spSegment.b.y,
							edge.a.x, edge.a.y, edge.b.x, edge.b.y
						)) {
							// Skip this edge otherwise
							continue;
						}
					}

					// see how far the edge projection is
					crtDist		= Geom.segmentLength(localX, localY, crtPoint.x, crtPoint.y);
					if (crtDist < bestDist) {
						bestDist	= crtDist;
						bestEdge	= edge;
					}
				}
			}
		}

		return bestEdge;
	}

	/**
	 * returns all the edges that have one end in common with the vertex
	 * @param vertex {Point}
	 * @param snapToRoofs {boolean}
	 * @returns {[]}
	 */
	getSnapCornerEdges(vertex, snapToRoofs=false)
	{
		let local = this._houseSpaceLocal.transformPoint(vertex);
		let edges = [], i, j, edge;
		let threshold = 0.05;	// 5cm

		for (i=0; i<this._layers.length; ++i) {
			if ( !this._layers[i].visible ) {
				continue;
			}

			// don't include rooflines when not needed
			if ((!snapToRoofs && this._layers[i].type===HouseLayerType.ROOF) ||
				( snapToRoofs && this._layers[i].type!==HouseLayerType.ROOF)) {
				continue;
			}

			for (j=0; j<this._layers[i].edges.length; ++j) {
				edge	 = this._layers[i].edges[j];

				if (Geom.equalPoint(local, edge.a.clone()) || Geom.equalPoint(local, edge.b.clone())) {
					edges.push(edge);
				}
			}
		}

		// we should really have TWO edges here
		if (edges.length<2) {
			Logger.logStack('--- couldn\'t find two edges for the corner! going for 5cm distance check');
			edges = [];

			for (i=0; i<this._layers.length; ++i) {
				if ( !this._layers[i].visible ) continue;

				for (j=0; j<this._layers[i].edges.length; ++j) {
					edge	 = this._layers[i].edges[j];

					if (Geom.pointDistance(local, edge.a.clone()) < threshold ||
						Geom.pointDistance(local, edge.b.clone()) < threshold) {
						edges.push(edge);
					}
				}
			}
		}

		Logger.log('snapped to corner; found these edges ('+edges.length+'); '+edges);

		return edges;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Henley XML Format Handling

	/**
	 * @returns {XMLHenleyDataMerger}
	 */
	get xmlMerger() {return this._merger;}

	/**
	 * @returns {XMLHouseData}
	 */
	get xmlData() { return this._xmlData;}

	/**
	 * @returns {string}
	 */
	get logoRange() {
		if (this._xmlData) {
			return this._xmlData.rangeLogoId;
		}	else if (this._houseData && this._houseData.rangeLogo) {
			return this._houseData.rangeLogo;
		}	else {
			return '';
		}
	}

	/**
	 * @returns {number}
	 */
	get totalXMLArea() {
		if (this._merger) {
			return this._merger.mergedArea;
		}	else {
			return 0;
		}
	}

	/**
	 * @private
	 */
	setupXMLDataParser()
	{
		/**
		 * @TODO: we should make sure to calculate the size & translation at the merger level
		 */
		if (this._xmlData ) {
			this._merger = new XMLHenleyDataMerger(this._xmlData.reader);
		}
	}

	/**
	 * @param select {XMLHenleyFacade}
	 */
	setXMLSelectedFacade(select)
	{
		// Logger.log('setXMLSelectedFacade',select,this._merger);
		if (this._merger) {
			this._merger.setFacadeSelection(select);
			this.refreshXMLSegments();
		}
	}

	/**
	 * @param selection {XMLHenleyOption[]}
	 */
	setXMLSelectedOptions(selection)
	{
		// Logger.log('setXMLSelectedOptions'+selection+', '+this._merger);
		if (this._merger) {
			this._merger.setOptionSelection(selection);
			this.refreshXMLSegments();
		}
	}

	/**
	 * @private
	 */
	refreshXMLSegments()
	{
		this.clearLayers();

		const reader = this._xmlData.reader;

		// add the merge results
		for (let story=0, layer; story<this._merger.stories.length; ++story) {
			this._layers.push(layer = new HouseLayerModel(
				this._merger.stories[story],
				story===0 ? HouseLayerType.FACADE : HouseLayerType.ROOF,
				1
			));
	
			layer.translate(-reader.left, -reader.top);
	
			layer.visible = true;
		}

		// add the additions layer
		this._layers.push(this._addonsLayer = new HouseLayerModel(null, HouseLayerType.ADDONS, 1));

		this._fullWidth	 = Math.abs(reader.right-reader.left);
		this._fullHeight = Math.abs(reader.bottom-reader.top);
		this._mirrorX	 = Math.abs(this._fullWidth*.5);
		this._mirrorY	 = Math.abs(this._fullHeight*.5);

		this.buildXMLMetaLayers();
		this.rebuildTransforms();

		this.dispatchEvent(new EventBase('changeStructure'));
		this.dispatchEvent(new EventBase(EventBase.ADDED));
	}

	buildXMLMetaLayers() {
		if (!this._houseData || !this._houseData.isXMLFormat) {
			return;
		}

		try {
			// add the meta layers
			this._metaLayers = [];

			// Load XML meta layers, if available
			if (this._merger && this._merger.groundFloor) {
				this._metaLayers.push(new HouseLayerModel(this._merger.groundFloor, HouseLayerType.META_BOUNDARY));
			}
			if (this._merger && this._merger.garage) {
				this._metaLayers.push(new HouseLayerModel(this._merger.garage, HouseLayerType.META_GARAGE));
			}

			// Apply the same translation to the meta layers
			this._metaLayers.forEach(layer => layer.translate(-this._xmlData.reader.left, -this._xmlData.reader.top));
		}	catch (e) {
			//
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// IRestorable implementation

	/**
	 * @return {Array}
	 * @private
	 */
	get layersRestorationData() {
		return this._layers.map(layer => layer.recordState());
	}

	/**
	 * @return {{}[]}
	 */
	get metaLayersRestorationData() {
		return this._metaLayers.map(layer => layer.recordState());
	}

	/**
	 * @param edge {HouseEdgeModel}
	 * @returns {{edge: int, layer: int}|null}
	 */
	findEdgePosition(edge) {
		for (let l=0; l<this._layers.length; ++l) {
			const layer = this._layers[l];

			for (let e=0; e<layer.edges.length; ++e) {
				if (layer.edges[e]===edge) {
					return {
						layer: l,
						edge: e
					};
				}
			}
		}

		return null;
	}

	/**
	 * @param position
	 * @returns {null|HouseEdgeModel}
	 */
	edgeFromPosition(position) {
		if (position && position.hasOwnProperty('layer') && position.hasOwnProperty('edge')) {
			if (position.layer < this._layers.length &&
				position.edge  < this._layers[position.layer].edges.length) {

				return this._layers[position.layer].edges[position.edge];
			}
		}

		return null;
	}

	/**
	 * Returns a data structure containing all the parameters representing this object's state
	 *
	 * @return {{}}
	 */
	recordState ()
	{
		const state = {
			layers		 : this.layersRestorationData,
			metaLayers	 : this.metaLayersRestorationData,
			centerX		 : this._center.x,
			centerY		 : this._center.y,
			rotation	 : this._rotation,
			mirrorX		 : this._mirrorX,
			mirrorY		 : this._mirrorY,
			mirroredV	 : this._mirroredV,
			mirroredH    : this._mirroredH,
			fullWidth	 : this._fullWidth,
			fullHeight	 : this._fullHeight,
			renderAddons : this._renderAddons,
			ompWidth     : this._ompWidth,
			// each house plan has a unique ID enforced in the DB (Primary key, autoIncrement)
			// we use this ID to restore the vectorFloorModel's house data
			houseId		 : this._houseData ? this._houseData.id : -1,
			houseData	 : {
                house_svgs_id: this._houseData ? this._houseData.id : null,
                house: this.houseName,
                facade: this.facadeName,
				options: this.houseOptionsDetails()
			},
			logoRange	 : this.logoRange
		};

		if (this._merger) {
			if (this._merger.facade) {
				state.xmlFacade = this._merger.facade.name;
			}
			if (this._merger.selectedOptions) {
				const optionNames=[];
				for (let i=0; i<this._merger.selectedOptions.length; ++i) {
					optionNames.push(this._merger.selectedOptions[i].name);
				}
				state.xmlOptions = optionNames.join('▓');
			}
		}

		return state;
	}

	/**
	 * restoreState
	 * restores this object to the state represented by the 'state' data structure
	 * @param state the state to be restored
	 */
	restoreState(state)
	{
		// houseData has to be properly restored before this point
		this._center.x		= state.centerX;
		this._center.y		= state.centerY;
		this._rotation		= state.rotation;
		this._fullWidth		= state.fullWidth;
		this._fullHeight	= state.fullHeight;
		this._mirrorX		= state.mirrorX;
		this._mirrorY		= state.hasOwnProperty('mirrorY') ? state.mirrorY : this._fullHeight / 2;

		// mirrored flags
		this._mirroredV     = state.hasOwnProperty('mirroredV') ? state.mirroredV : false;
		this._mirroredH     = state.hasOwnProperty('mirroredH') ? state.mirroredH : false;

		this._renderAddons	= state.renderAddons;
		this._ompWidth		= state.hasOwnProperty('ompWidth') ? state.ompWidth : HouseModel.DEFAULT_OMP;

		// Build the house layers
		let i, layersData = state.layers, lData, lGroup, j, layer;

		if (state.hasOwnProperty('metaLayers') && state.metaLayers) {
			layersData = layersData.concat(state.metaLayers);
		}

		this.clearLayers();

		// make sure layer restoration conditions are met
		if (layersData.length && !this._houseData) {
			VERBOSE && Logger.log('HouseModel.restore.CRITICAL ERROR: trying to restore floor layers without a houseData set. ');
			return;
		}

		// @TODO: refactor this section
		for (i=0; i<layersData.length; ++i) {
			lData	= layersData[i];
			layer	= new HouseLayerModel();
			layer.restoreState(lData);

			if (this._houseData.isXMLFormat) {
				// no need to restore the svg group for XML layers

				// Don't add meta layers. They are rebuilt for Henley / XML
				if (!layer.type.isMeta) {
					this._layers.push(layer);
				}
				if ( layer.type === HouseLayerType.ADDONS ) {
					this._addonsLayer = layer;
				}
			}	else {
				// Search for this layer's group data
				lGroup = null;

				/**
				 * @type {SVGG[]}
				 */
				let list = layer.type === HouseLayerType.FACADE ? this._houseData.facades :
						layer.type === HouseLayerType.OPTION ? this._houseData.options :
						layer.type === HouseLayerType.ROOF ? this._houseData.roofs :
						layer.type === HouseLayerType.META_BOUNDARY ? this._houseData.facadeBoundaries :
						layer.type === HouseLayerType.META_GARAGE ? this._houseData.facadeGarages :
						layer.type === HouseLayerType.META_GARAGE_FRONT ? this._houseData.facadeGarageFronts :
						layer.type === HouseLayerType.META_PORCH ? this._houseData.facadePorches :
						layer.type === HouseLayerType.META_ALFRESCO ? this._houseData.facadeAlfresco : null;

				if (list) {
					for (j = 0; j < list.length && !lGroup; ++j) {
						if (list[j].id === lData.groupId) {
							lGroup = list[j];
						}
					}
				}

				// Create the layer if its SVG group has been found or if it is an addon
				if (lGroup || layer.type === HouseLayerType.ADDONS) {
					// restore the SVG group for this layer
					layer.restoreGroup(lGroup);

					// add the layer to the correct list
					(layer.type.isMeta ? this._metaLayers : this._layers).push(layer);

					if (layer.type === HouseLayerType.ADDONS) {
						this._addonsLayer = layer;
					}
				}	else {
					VERBOSE && Logger.log('FloorModel.Restore.ERROR:\n\t\tunable to restore layer (type=' + layer.type + ', id=' +
						lData.groupId + ') of house(id=' + this._houseData.id + ', name=' + this._houseData.name + ')');
				}
			}
		}

		if (this._merger) {
			try {
				if (state.hasOwnProperty('xmlFacade') && state.xmlFacade) {
					this._merger.selectFacadeByName(state.xmlFacade);
				}
				if (state.hasOwnProperty('xmlOptions') && state.xmlOptions) {
					this._merger.selectOptionsByName(state.xmlOptions.split('▓'));
				}

				// refresh the meta layers
				this.buildXMLMetaLayers();

				// restore the mirroring for the meta layers
				if (this._mirroredV) {
					for (let i=0; this._metaLayers && i<this._metaLayers.length; ++i) {
						this._metaLayers[i].mirrorVertically(this._mirrorY);
					}
				}
				
			}	catch (e) {
				// nothing
			}
		}

		// dispatch final events
		this.rebuildTransforms();
		this.dispatchEvent(new EventBase(EventBase.ADDED, this));
		this.onRestored();
	}
}