import LotCurveModel from "./sitings/model/lot/LotCurveModel";
import LotPointModel from "./sitings/model/lot/LotPointModel";
import LotEdgeAngle from "./sitings/model/lot/LotEdgeAngle";
import DisplayManager from "./utils/DisplayManager";
import SitingsModel from "./sitings/model/SitingsModel";
import SitingsView from "./sitings/view/SitingsView";
import ApplicationStep from "./sitings/model/ApplicationStep";
import LotFeaturesModel from "./sitings/model/lot/features/LotFeaturesModel";
import EventBase from "./events/EventBase";
import ViewSettings from "./sitings/global/ViewSettings";
import CompanyData from "./sitings/data/CompanyData";
import StructureRectangle from "./sitings/model/structure/StructureRectangle";
import StructurePoint from "./sitings/model/structure/StructurePoint";
import TransformationModel from "./sitings/model/house/transform/TransformationModel";
import MeasurementsLayerModel from "./sitings/model/measure/MeasurementsLayerModel";
import ThemeManager from "./sitings/view/theme/ThemeManager";
import ColorTheme from "./sitings/view/theme/ColorTheme";
import MeasurementPointEvent from "./sitings/events/MeasurementPointEvent";
import SitingsSvgView from "./sitings/svg/SitingsSvgView";
import TransformEvent from "./sitings/events/TransformEvent";
import PdfPage from "./sitings/global/PdfPage";
import SitingsTraceView from "./sitings/view/trace/SitingsTraceView";
import ManipulationManager from "./sitings/model/lot/trace/ManipulationManager";

/*
<theme>
    <color id="155" name="color_class_1" value="16777215"/>
    <color id="156" name="color_class_10" value="16777215"/>
    <color id="157" name="color_class_11" value="16777215"/>
    <color id="158" name="color_class_12" value="1381653"/>
    <color id="159" name="color_class_2" value="2854143"/>
    <color id="160" name="color_class_3" value="2854143"/>
    <color id="161" name="color_class_4" value="7211034"/>
    <color id="162" name="color_class_5" value="15066859"/>
</theme>
 */

let canvasModel, canvasView, canvasTraceView, svgView, lotModel, companyData;

// sample reading an XML file with the structure similar to the company data that we have in Sitings
loadFile('../data/company.xml', processCompanyXMLFormat);


function loadFile(path, callback) {
    let xobj = new XMLHttpRequest();
    xobj.open('GET', path, true);

    xobj.onreadystatechange = function () {
        if (xobj.readyState==4 && xobj.status=="200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

/**
 * @param rawData {string}
 */
function processCompanyXMLFormat(rawData) {
    companyData = new CompanyData(rawData);
    companyData.addEventListener(EventBase.COMPLETE, companyDataParseComplete);
    companyData.parse(null);
}

function companyDataParseComplete()
{
    console.log("companyDataParseComplete");

    companyData.removeEventListener(EventBase.COMPLETE, companyDataParseComplete);

    setupApplication();
}

function setupApplication() {
    // 1. Setup the rendering scale by calling DisplayManager.init
    // the workPpm parameter indicates the pixels-per-meter value that will be used to render the lot.
    //
    // If this value is 50, a 1 meter edge will have 50 pixels, a 1.5 meter edge will have 75 pixels etc.
    DisplayManager.init(
        // util function that calculates the PPM from the Display scale (e.g. 1m:100m) and DPI of the screen (e.g. 72, 144 etc.)
        DisplayManager.getPpm(
            // The default display scale is 1:200
            DisplayManager.DEFAULT_SCALE,
            // The default DPI of the screen (72 dots per inch)
            DisplayManager.DEFAULT_DPI
        )
    );

    // Setup the theme Manager
    // @TODO: pass some color data in here
    ThemeManager.initWith(new ColorTheme('default'));

    // Create the application (=Canvas) model. This is the main model that will hold all the data
    // for the Lot, specialEasements etc.
    canvasModel = new SitingsModel(companyData);

    // Create the application (=Canvas) view. It is responsible with rendering all the data in the canvasModel
    canvasView = new SitingsView(canvasModel);

    canvasTraceView = new SitingsTraceView(canvasModel);

    canvasView.viewRotation = 15;

    // We only initialize the model after the view attaches it. This sets up an initial state for the lot
    canvasModel.initModelState();

    // Add event listeners for Easement additions
    canvasModel.lotFeaturesModel.addEventListener(EventBase.ADDED, onLotFeatureAdded, this);
    canvasModel.lotFeaturesModel.parallelEasements.addEventListener(EventBase.ADDED, onParallelEasementAdded, this);
    canvasModel.lotFeaturesModel.envelopes.addEventListener(EventBase.ADDED, onEnvelopeAdded, this)

    // Add event listener for Measurement edits
    canvasModel.measurementsModel.addEventListener(MeasurementPointEvent.EDIT, editMeasurement, this);

    // fetch the lot model and store its initial state
    lotModel = canvasModel.pathModel;

    // Save the state of the Canvas Model
    saveModelState();

    // Load a previously saved state
    lotModel.restoreState(
        JSON.parse('{"edges":[{"a":{"x":0,"y":0},"length":20,"angle":{"flip":false,"degrees":0,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false},{"a":{"x":0,"y":0},"length":20,"angle":{"flip":true,"degrees":90,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false},{"a":{"x":20,"y":0},"length":20,"angle":{"flip":true,"degrees":0,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false},{"a":{"x":20,"y":-20},"length":20,"angle":{"flip":false,"degrees":90,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false}]}')
    );

    /* const newEdges = [
        addCurvedEdgeToLot(),
        addCurvedEdgeToLot(),
        addCurvedEdgeToLot()
    ]; */

    // Display the text description for the first edge in the lot
    echoEdgeState();

    // Toggle an edge from straight to a curve
    changeEdgeToCurve();

    // set the Radius for the Curve
    setCurveProperties();

    // Toggle the direction of an edge and also the Curving direction from one direction to the other
    flipEdgeAndCurve();

    // changes the degrees/minutes/seconds for the edge
    changeEdgeAngle();

    // Set the edge back to a Straight segment
    changeEdgeToStraight();

    // Make the edge a curve again. The radius and curving direction are maintained
    changeEdgeToCurve();

    // Add a new straight edge to the lot
    addStraightEdgeToLot();

    // Add external easement
    canvasModel.step    = ApplicationStep.ADD_EASEMENT;
    canvasModel.lotFeaturesModel.mode           = LotFeaturesModel.MODE_EXTERNAL_EASEMENT;

    canvasModel.lotFeaturesModel.addEasementToEdge(canvasModel.pathModel.lastEdge, 3.78);

    // Add a new curved edge to the lot. Normally this won't be used because all edges are Straight by default, they can be set
    // as curves from the UI and using the .isCurve property
    // addCurvedEdgeToLot();

    // adds an easement
    moveToEasementStep();

    // create a view for the lot
    setupViews();

    // change the visual theme
    changeThemeProperties();

    // select a house
    selectHouseAndFacade();

    // Add two structures
    addStructures();

    // Add a house transformation
    addTransformation();

    // Add private open space
    addPos();

    // Update street labels
    snapStreetLabels();

    // remove some of the edges
    // Start measurements
    let houseModel = canvasModel.multiFloors.crtFloor;

    // Translate the house model and its attached transforms / measurements
    houseModel.dispatchEvent(new TransformEvent(
        TransformEvent.TRANSLATE,
        {dx: 17.85, dy: 1.2},
        houseModel
    ));

    canvasModel.step    = ApplicationStep.ADD_MEASUREMENTS;
    canvasModel.lotFeaturesModel.mode           = LotFeaturesModel.MODE_EXTERNAL_EASEMENT;
    canvasModel.measurementsModel.currentMode   = MeasurementsLayerModel.MODE_MEASUREMENT;

    canvasModel.measurementsModel.addMeasurementTo(firstEdge(), 0, 0);
    canvasModel.measurementsModel.endCurrentPoint(5, -2);

    canvasModel.measurementsModel.addMeasurementTo(secondEdge(), 0, 0);
    canvasModel.measurementsModel.endCurrentPoint(21, 6);

    /* @END: draw the SVG
    svgView     = new SitingsSvgView(
        // Canvas Model
        canvasModel,
        // View -> for view settings
        canvasView
    );

    let size = svgView.draw('svg', PdfPage.SIZE_A4, 200);
    console.log("SVG view exported with size ", size);
     */

    ManipulationManager.i.start();
}

function saveModelState()
{
    let recordedState = JSON.stringify(canvasModel.recordState());
    console.log("--- Saving State of the Lot Drawer Canvas Model ---");
    console.log(recordedState);
}

function loadModelState(stateToLoad)
{
    canvasModel.restoreState(JSON.parse(stateToLoad));
    console.log("--- Restored state into Lot Drawer Canvas Model ---");
}

function changeEdgeToCurve()
{
    firstEdge().highlight = true;
    firstEdge().isCurve = true;
    firstEdge().length = 14.5;

    secondEdge().isCurve = true;
    secondEdge().radius = 40;

    console.log("--- Set edge to a Curve ---");
    console.log(firstEdge().description);
}

function setCurveProperties()
{
    // Change Curve Properties. edge.length sets the Chord length, the Arc length is calculated automatically from the Chord and Radius
    firstEdge().length = 18;
    firstEdge().radius = 25;
    console.log("--- Set Curve parameters ---");
    console.log(firstEdge().description);
}

function changeEdgeToStraight()
{
    firstEdge().isCurve = false;
    console.log("--- Set edge to Straight ---");
    console.log(firstEdge().description);
}

function flipEdgeAndCurve()
{
    // Flip Edge direction. This will add 180 degrees to the Edge angle, but only internally. The LotEdgeAngle display is not affected by this
    firstEdge().angleController.flipCurveDirection = !firstEdge().angleController.flip;

    // Update Curvature of the edge, so that it will switch from curving inwards to outwards and vice-versa
    firstEdge().flipCurveDirection = !firstEdge().flipCurveDirection;
    console.log("--- Changed direction and curving direction ---");
    console.log(firstEdge().description);
}

function changeEdgeAngle()
{
    firstEdge().angleController.degrees   = -48;
    firstEdge().angleController.minutes   = 40;
    firstEdge().angleController.seconds   = 20;
    console.log("--- Changed angle ---");
    console.log(firstEdge().description);
}

function echoEdgeState()
{
    console.log("--- First edge in the lot---");
    console.log(firstEdge().description);
}

function addStraightEdgeToLot()
{
    let newEdge;
    lotModel.addEdge(
        // the edge to add
        newEdge = new LotCurveModel(
            // The starting point of the edge. It can always be left with the default coordinates (0, 0), because when
            //  `connectToPreviousEdge` below is true, this point will be replaced with the Ending point of the
            //  previous edge in the Lot
            new LotPointModel(),
            // length, in meters
            15,
            // LotEdgeAngle, with degrees, minutes, seconds as the values. Minutes and Seconds should be restricted to between 0 and 59
            new LotEdgeAngle(45, 30, 50),
            // Arc length. Only used for Curves, can be left as 0 because it's calculated automatically from Chord length and Radius
            0,
            // Radius. Only used for Curves.
            0,
            // flag that indicates if this edge is a curve
            false
        ),
        // connectToPreviousEdge should always be true for the Lot Drawer so that we have a continuous polygon
        true
    );

    console.log("--- Added new Straight Edge to the Lot ---");
    console.log(newEdge.description);
}

function addCurvedEdgeToLot()
{
    let newEdge;
    lotModel.addEdge(
        // the edge to add
        newEdge = new LotCurveModel(
            // The starting point of the edge. It can always be left with the default coordinates (0, 0), because when
            //  `connectToPreviousEdge` below is true, this point will be replaced with the Ending point of the
            //  previous edge in the Lot
            new LotPointModel(),
            // length, in meters
            15,
            // LotEdgeAngle, with degrees, minutes, seconds as the values. Minutes and Seconds should be restricted to between 0 and 59
            new LotEdgeAngle(115, 59, 59),
            // Arc length. Only used for Curves, can be left as 0 because it's calculated automatically from Chord length and Radius
            0,
            // Radius. Only used for Curves.
            10,
            // flag that indicates if this edge is a curve
            true
        ),
        // connectToPreviousEdge should always be true for the Lot Drawer so that we have a continuous polygon
        true
    );

    console.log("--- Added new Curved Edge to the Lot ---");
    console.log(newEdge.description);

    return newEdge;
}

function moveToEasementStep()
{
    canvasModel.step = ApplicationStep.ADD_EASEMENT;
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_PARALLEL_EASEMENT;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[2]);
    canvasModel.addOrEditEasementToEdge(lotModel.edges[3]);

    // Add some envelopes
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_ENVELOPE;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[0], 2);
    canvasModel.addOrEditEasementToEdge(lotModel.edges[1], 2);
    canvasModel.addOrEditEasementToEdge(lotModel.edges[3], 3.5);
    canvasModel.addOrEditEasementToEdge(lotModel.edges[4], 2);
    canvasModel.addOrEditEasementToEdge(lotModel.edges[2], 4.5);

    const envelope = canvasModel.lotFeaturesModel.envelopes.lastEdge;
    console.log("splay this envelope: ", envelope);

    envelope.splayed = true;
    envelope.splayDistance = 6.75;

    // Add some block easements
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_BLOCK_EASEMENT;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[3], 5);
    canvasModel.lotFeaturesModel.lastEasement.width = 7;

    // External easement
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_EXTERNAL_EASEMENT;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[3], 4);

    // Angled easement
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_ANGLED_EASEMENT;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[1], 4);
    canvasModel.lotFeaturesModel.lastEasement.width = 2;

    // Driveways
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_DRIVEWAY;
    canvasModel.lotFeaturesModel.addDriveway(13, -15);
    canvasModel.lotFeaturesModel.addDriveway(6, -7);
    canvasModel.lotFeaturesModel.addDriveway(7, 7);
}

function setupViews()
{
    // 2. Setup PIXI
    let body   = document.body, html = document.documentElement;
    let width  = Math.max(body.scrollWidth , body.offsetWidth , html.clientWidth , html.scrollWidth , html.offsetWidth ) / 2;
    let height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    // PIXI.settings.PRECISION_FRAGMENT = 'highp';
    PIXI.settings.RESOLUTION = 2;

    // Create the PIXI application, have it take the full page
    const app = new PIXI.Application({
        width: width,
        height: height,
        backgroundColor: 0xFFFFFF,
        antialias: true,
        autoResize: true,
        forceFXAA: true,
        forceCanvas: true
    });

    ViewSettings.instance.application = app;

    // Add the view to the DOM
    document.getElementById('app').appendChild(app.view);

    // Create the lot view
    app.stage.addChild(canvasView);

    // Center the canvasView in the window. All content will then be centred inside the canvasView automatically
    canvasView.x = width / 2;
    canvasView.y = height / 2;

    canvasView.scaleAndCenter(0.5);

    document.addEventListener("mousewheel", mouseWheelHandler, false);

    // Create the trace app
    const traceApp = new PIXI.Application({
        width: width,
        height: height,
        transparent: true,
        backgroundColor: 0xFAFAFA,
        antialias: true,
        autoResize: true,
        forceFXAA: true,
        forceCanvas: true
    });

    traceApp.stage.addChild(canvasTraceView);

    document.getElementById('trace').appendChild(traceApp.view);
}

/**
 * @param event {WheelEvent}
 */
function mouseWheelHandler(event)
{
    if (event.deltaY < 0) {
        canvasView.viewScale += 0.1;
    }   else {
        canvasView.viewScale -= 0.1;
    }
}

function changeThemeProperties()
{
    canvasView.theme.lineThickness = 2;
    canvasView.theme.fillColor = 0xEDEFFE;
    canvasView.theme.labelColor = 0x131313;
    canvasView.theme.labelFontFamily = "Roboto";
    canvasView.theme.labelFontSize  = 13;
    canvasView.scaleAndCenter(0.75);

    // canvasView.pathView.cacheAsBitmap = true;

    for (let i=0; i<canvasView.pathView.edges.length; ++i) {
        canvasView.pathView.edges[i].exportMode = true;
    }
}

function selectHouseAndFacade()
{
    let houseData  = canvasModel.companyData.ranges[0].houses[3];

    // The models always create one floor (i.e. house) by default. Load a house data into it
    let houseModel = canvasModel.multiFloors.crtFloor;

    console.log("Loading house: " + houseData + " into " + houseModel);

    houseModel.loadHouse(houseData);
    houseModel.selectFacade(houseData.facades[0].id);

    houseModel.rotation = 183;
}

function addStructures()
{
    // add a rectangular structure to the model
    let pool = new StructureRectangle(
        StructureRectangle.POOL,
        0,  // X coordinate in Meters; 0 by default
        0,  // Y Coordinate in Meters; 0 by default,
        10, // Width in meters
        5   // Height in meters
    );
    // rotate the pool 90 degrees;
    pool.rotation   = 12;
    pool.x          = 27.6;
    pool.y          = -16.25;

    let tree = new StructurePoint(
        StructurePoint.TREE,
        0, // X coordinate in Meters; 0 by default
        0, // Y coordinate in Meters; 0 by default,
      1.5, // Tree Radius, in Meters
    );

    tree.x = 8.7;
    tree.y = 12;

    canvasModel.structures.addStructure(pool);
    canvasModel.structures.addStructure(tree);
}

function addTransformation()
{
    canvasModel.step = ApplicationStep.ADD_EXTENSIONS;

    const extension     = new TransformationModel(false, TransformationModel.EXTENSION);
    extension.width     = 4;
    extension.height    = 20;
    extension.x         = 2;
    extension.y         = -10;
    // add the transformation to the currently selected floor
    canvasModel.multiFloors.crtFloor.transformations.addTransformation(extension);
    extension.applied   = true;

    const reduction     = new TransformationModel(false, TransformationModel.REDUCTION);
    reduction.width     = 2.2;
    reduction.height    = 20;
    reduction.x         = -2;
    reduction.y         = -10;

    // add the transformation to the currently selected floor
    canvasModel.multiFloors.crtFloor.transformations.addTransformation(reduction);
    reduction.applied   = true;

    const addon         = new TransformationModel(true, TransformationModel.EXTENSION);
    addon.width         = 7;
    addon.height        = 2.1;
    canvasModel.multiFloors.crtFloor.transformations.addTransformation(addon);
}

function addPos()
{
    const model = canvasModel.posModel;

    model.addPoint(34,  0);
    model.addPoint(39, -2);
    model.addPoint(42,  6);
    model.addPoint(36,  5);
}

function snapStreetLabels()
{
    canvasModel.streetsModel.streets[0].x += 5;
    canvasModel.streetsModel.streets[0].y -= 15;
    canvasModel.streetsModel.streets[0].snap();

    canvasModel.streetsModel.streets[1].x += 10;
    canvasModel.streetsModel.streets[1].snap();
}

/**
 * @param e {DataEvent}
 */
function onLotFeatureAdded(e) {
    if (canvasModel.lotFeaturesModel.mode===LotFeaturesModel.MODE_BLOCK_EASEMENT) {
        // console.log("Added Block Easement", e.data);
    }   else
    if (canvasModel.lotFeaturesModel.mode===LotFeaturesModel.MODE_DRIVEWAY) {
        // console.log("Added Driveway", e.data);
    }   else
    if (canvasModel.lotFeaturesModel.mode===LotFeaturesModel.MODE_EXTERNAL_EASEMENT) {
        // console.log("Added External Easement", e.data);
    }
}

/**
 * @param e {DataEvent}
 */
function onParallelEasementAdded(e) {
    // console.log("Added Parallel Easement", e.data);
}

/**
 * @param e {DataEvent}
 */
function onEnvelopeAdded(e) {
    // console.log("Added Envelope", e.data);
}

/**
 * @param e {MeasurementPointEvent}
 */
function editMeasurement(e) {
    /**
     * @type {IMeasurement}
     */
    let measurementModel = e.point;

    // We should open a dialog that will allow users to edit the measurement or delete it.
    console.log("Open Measurement Dialog for ", measurementModel);

    // Don't display the full distance in the dialog, only the first 3 decimals (i.e. millimeter accuracy)
    console.log("Distance to edit ", measurementModel.getAccurateDistance(3));

    // fake editing
    if (measurementModel.distance<1) {
        measurementModel.deleteMeasurement();
    }   else {
        measurementModel.distance = Math.round(measurementModel.distance);
    }
}

/**
 * All the edges in a lot have to be of type LotCurveModel, even if they are straight edges.
 * To indicate if an edge is straight or a curve, use the 'isCurve' property.
 *
 * @return LotCurveModel
 */
function firstEdge() { return lotModel.edges[0]; }

/**
 * @returns {LotCurveModel}
 */
function secondEdge() { return lotModel.edges[1]; }
function thirdEdge() { return lotModel.edges[2]; }
