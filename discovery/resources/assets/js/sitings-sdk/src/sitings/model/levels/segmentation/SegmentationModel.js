import SegmentationPath from './SegmentationPath';
import ModelEvent from '../../../events/ModelEvent';
import EventBase from '../../../../events/EventBase';
import InnerPathModel from '../../easement/InnerPathModel';
import ExistingRetainingWall from './ExistingRetainingWall';
import DataEvent from '../../../../events/DataEvent';


export default class SegmentationModel extends InnerPathModel {

    /**
     * @return {string}
     * @constructor
     */
    static get ADDED_BATTER() { return 'added.batter'; }

    /**
     * @return {string}
     * @constructor
     */
    static get ADDED_RETAINING() { return 'added.retaining'; }

    /**
     * @return {string}
     * @constructor
     */
    static get ADDED_RETAINING_LEVEL() { return 'added.retaining.level'; }


    /**
     * @param lotModel {LotPathModel}
     */
    constructor(lotModel) {
        super(lotModel, true);

        /**
         * All the batter lines that split the lot into individual surfaces
         *
         * @type {SegmentationPath[]}
         * @private
         */
        this._batters = [];
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Getters/Setters
    //

    /**
     * @returns {SegmentationPath[]}
     */
    get batters() { return this._batters; }

    /**
     * @returns {SegmentationPath}
     */
    get lastBatter() {
        if (this._batters && this._batters.length) {
            return this._batters[this._batters.length - 1];
        }

        return null;
    }

    /**
     * @return {ExistingRetainingWall[]}
     */
    get retaining() { return this._edges; }

    /**
     * @return {ExistingRetainingWall|null}
     */
    get lastRetaining() {
        if (this.retaining && this.retaining.length) {
            return this.retaining[this.retaining.length-1];
        }

        return null;
    }

    /**
     * @return {LevelPointModel[]}
     */
    get retainingLevels() {
        return this.retaining.map(wall => wall.levels).flat();

        /*
        const levels = [];
        const hasLevel = (A) => levels.find(B => Geom.equalPoint(A.position, B.position)) !== undefined;

        this.retaining.forEach(
            wall => {
                if (!levels.length) {
                    levels.push(...wall.levels);
                }   else {
                    // only add level points that don't exist in previous retaining walls
                    levels.push(...wall.levels.filter(level => !hasLevel(level)));
                }
            }
        );

        return levels;
         */
    }

    /**
     * @return {WallBoundPoint[]}
     */
    get retainingWallInnerLevels() {
        return this.retaining.map(wall=>wall.wallPortionInnerLevels).flat();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Batter Lines
    //

    /**
     * @param point {LevelPointModel}
     */
    addBatterPoint(point) {
        // If no path exists or the most current one is closed, add a new one
        if (!this.lastBatter || this.lastBatter.closed) {
            this._addNewPath();
        }

        this.lastBatter.addPoint(point);
    }

    /**
     * Adds a new path to the model
     * @return {SegmentationPath}
     * @private
     */
    _addNewPath() {
        const path = new SegmentationPath();
        path.addEventListener(ModelEvent.DELETE, this.batterLineDeleted, this);
        path.addEventListener(EventBase.CHANGE, this.batterLineChanged, this);
        this._batters.push(path);
        this.dispatchEvent(new EventBase(SegmentationModel.ADDED_BATTER, this));

        return path;
    }

    /**
     * @param point {LevelPointModel}
     */
    deletePathsWithPoints(point) {
        for (let index=this._batters.length-1; index>=0; --index) {
            const path = this._batters[index];
            if (path.points.indexOf(point) !== -1) {
                path.deletePath();
            }
        }
    }

    /**
     * @private
     */
    batterLineChanged() {
        this.onChange();
    }

    /**
     * @param event {ModelEvent}
     */
    batterLineDeleted(event) {
        const path = event.model;
        path.removeEventListener(ModelEvent.DELETE, this.batterLineDeleted, this);
        path.removeEventListener(EventBase.CHANGE, this.batterLineChanged, this);

        const index = this._batters.indexOf(path);
        index >= 0 && this._batters.splice(index, 1);

        this.onChange();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Retaining Walls
    //

    /**
     * @param boundary {LotCurveModel}
     * @return {ExistingRetainingWall|boolean}
     */
    addRetainingWall(boundary) {
        // If multiple walls per boundary are not allowed and there is already a wall on the current boundary, exit
        if (!this._allowMultipleEdgesPerReference &&
            this.retaining.find(wall => wall.reference === boundary) !== undefined ) {
            return false;
        }

        const retainingWall = new ExistingRetainingWall(boundary, this.lotModel);
        retainingWall.addEventListener(EventBase.ADDED, this.retainingWallLevelAdded, this);

        this.addEdge(retainingWall, false);
        this.dispatchEvent(new EventBase(SegmentationModel.ADDED_RETAINING, this));

        return retainingWall;
    }

    /**
     * @param event {EventBase}
     */
    retainingWallLevelAdded(event) {
        this.dispatchEvent(new DataEvent(SegmentationModel.ADDED_RETAINING_LEVEL, this, false, false, event.dispatcher.lastWallPortion.innerLevel));
    }

    /**
     * @param e {EasementEvent}
     */
    onEasementDelete(e)
    {
        let wall = e.easement;
        if (wall) {
            wall.removeEventListener(EventBase.ADDED, this.retainingWallLevelAdded, this);
        }

        super.onEasementDelete(e);
    }

    // join intersecting retaining walls to each-other, updating the segmentation path to accurately represent
    // how the walls retain the lot surface.
    joinRetainingWalls() {
        // keep a list of available (i.e. un-joined) walls
        const available = this.retaining.concat();

        this.lotModel.edges.forEach(
            boundary => {
                // fetch all the retaining walls on the current boundary, while also removing them from the available list
                const boundaryWalls = available.filter(
                    (wall, index) =>
                        wall.reference === boundary && available.splice(index, 1).length===1
                );

                boundaryWalls.forEach(
                    wall => {
                        // extend each wall as long as there is another one that will extend with it
                        while (
                            // if we find an extending wall for the current one, also remove it from the available list
                            available.find(
                                (joinCandidate, index) =>
                                    wall.joinNextWall(joinCandidate) && available.splice(index, 1).length===1
                            )
                        ) {
                            // no-op
                        }
                    }
                );
            }
        );
    }

    applySelfExclusions() {
        super.applySelfExclusions();
        this.joinRetainingWalls();

        this.onChange();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Surface segmentation
    //

    /**
     * Applies the segmentation to a closed path (polygon), defined by a set of vertices.
     * Each segmentation path will gradually split the available polygons in one or more non-intersecting polygons
     *
     * @param vertices {Point[]} a list of points sorted in either clockwise or counter-clockwise order
     * @returns {Point[][]}
     */
    applyOn(vertices) {
        // start with the main polygon as a single area
        let areas = [vertices];

        const runSegmentation = (path) => {
            const newAreas = [];
            for (let area of areas) {
                newAreas.push(...path.applyOn(area));
            }
            areas = newAreas;
        };

        this.batters.forEach((batter) => runSegmentation(batter));
        this.retaining.filter((wall) => {
            // @TODO: simplify
            if (wall.valid && wall.segmentationPath) {
                runSegmentation(wall.segmentationPath);
            }
        });

        return areas;
    }

    /**
     * @public
     */
    clear() {
        while (this.batters && this.batters.length) {
            this.batters[0].deletePath();
        }

        while (this.retaining && this.retaining.length) {
            this.retaining[0].deleteWall();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Restorable implementation
    //

    /**
     * @param levelPoints {LevelPointModel[]}
     * @return {{batters: {points: unknown[]}[]}}
     */
    recordState(levelPoints) {
        // include the retaining wall inner points
        levelPoints = levelPoints.concat(this.retaining.map(wall=>wall.wallPortionInnerLevels).flat());

        // build the state
        return {
            // We only want to record the state of the closed batters
            paths: this.batters.filter(path => path.closed).map(path => path.recordState(levelPoints)),
            // Also include retaining walls
            retaining: this.retaining.map(wall => wall.recordState()),
        };
    }

    /**
     * @param state {{batters: {points: unknown[]}[]}}
     * @param levelPoints {LevelPointModel[]}
     */
    restoreState(state, levelPoints) {
        this.clear();

        if (state && state.retaining) {
            state.retaining.forEach(
                wallState => {
                    this.addRetainingWall(this.lotEdges[wallState.refIndx]).restoreState(wallState);
                }
            );
        }

        // include the retaining wall inner points
        levelPoints = levelPoints.concat(this.retaining.map(wall=>wall.wallPortionInnerLevels).flat());

        if (state && state.paths) {
            state.paths.forEach(
                pathState => this._addNewPath().restoreState(pathState, levelPoints)
            );
        }
    }
}