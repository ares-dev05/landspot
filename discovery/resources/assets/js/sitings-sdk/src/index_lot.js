import LotCurveModel from "./sitings/model/lot/LotCurveModel";
import LotPointModel from "./sitings/model/lot/LotPointModel";
import DisplayManager from "./utils/DisplayManager";
import LotDrawerModel from "./lot-drawer/model/LotDrawerModel";
import LotDrawerView from "./lot-drawer/view/LotDrawerView";
import ApplicationStep from "./sitings/model/ApplicationStep";
import LotFeaturesModel from "./sitings/model/lot/features/LotFeaturesModel";
import EventBase from "./events/EventBase";
import LotEdgeAngle from "./sitings/model/lot/LotEdgeAngle";
import ViewSettings from "./sitings/global/ViewSettings";
import LotDrawerSvgView from "./lot-drawer/view/LotDrawerSvgView";


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

let appWidth, appHeight, pixiElement, aspectRatio = 4/2.5;

// Create the application (=Canvas) model. This is the main model that will hold all the data
// for the Lot, specialEasements etc.
let canvasModel = new LotDrawerModel();

// Create the application (=Canvas) view. It is responsible with rendering all the data in the canvasModel
let canvasView  = new LotDrawerView(canvasModel);

canvasView.viewRotation  = 15;

// We only initialize the model after the view attaches it. This sets up an initial state for the lot
canvasModel.initModelState();

// Add event listeners for Easement additions
canvasModel.lotFeaturesModel.addEventListener(EventBase.ADDED, onLotFeatureAdded, this);
canvasModel.lotFeaturesModel.parallelEasements.addEventListener(EventBase.ADDED, onParallelEasementAdded, this);

// fetch the lot model and store its initial state
let lotModel = canvasModel.pathModel;

// Save the state of the Canvas Model
saveModelState();

// Load a previously saved state
lotModel.restoreState(
    JSON.parse('{"edges":[{"a":{"x":0,"y":0},"length":20,"angle":{"flip":false,"degrees":0,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false},{"a":{"x":0,"y":0},"length":20,"angle":{"flip":true,"degrees":90,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false},{"a":{"x":20,"y":0},"length":20,"angle":{"flip":true,"degrees":0,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false},{"a":{"x":20,"y":-20},"length":20,"angle":{"flip":false,"degrees":90,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flipCurveDirection":false,"isCurve":false}]}')
);

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

// Add a new curved edge to the lot. Normally this won't be used because all edges are Straight by default, they can be set
// as curves from the UI and using the .isCurve property
// addCurvedEdgeToLot();

// adds an easement
moveToEasementStep();

// create a view for the lot
setupViews();

console.log("continuing here");

// change the visual theme
changeThemeProperties();

// Resize the app
// ViewSettings.instance.application.renderer.resize(appWidth, appHeight);
// canvasView.x = appWidth / 2;
// canvasView.y = appHeight / 2;

/*
lotModel.restoreState(
    {
        edges: JSON.parse('[{"a":{"x":0,"y":0},"length":15,"angle":{"flip":false,"degrees":0,"minutes":0,"seconds":0},"arcLength":15.160815308524722,"radius":30,"flip":false,"isCurve":true},{"a":{"x":9.18485099360515e-16,"y":15},"length":20,"angle":{"flip":false,"degrees":90,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flip":false,"isCurve":false},{"a":{"x":-20,"y":15.000000000000002},"length":20,"angle":{"flip":true,"degrees":0,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flip":false,"isCurve":false},{"a":{"x":-20.000000000000004,"y":-4.999999999999998},"length":20.7,"angle":{"flip":true,"degrees":104,"minutes":0,"seconds":0},"arcLength":0,"radius":0,"flip":false,"isCurve":false}]')
    }
);
canvasModel.lotFeaturesModel.restoreState(
    JSON.parse('{"parallels":[{"type":"ParallelEasement","refIndx":0,"distance":3}],"blocks":[{"refIndx":0,"leftIndx":0,"rightIndx":0,"type":3,"angle":{"flip":false,"degrees":90,"minutes":0,"seconds":0},"distance":3,"width":3,"flipStart":false}]}')
);
*/

// @END: draw the SVG
let svgView     = new LotDrawerSvgView(canvasModel, canvasView);

// Draw the current state of the lot Drawer to the SVG
svgView.draw('svg', 1500, 1500);

/*
let div = document.createElement('div');
div.id  ='lot-export';
div.setAttribute('style', 'opacity: 0');
document.body.append(div);

const svgView = new LotDrawerSvgView(canvasModel, canvasView);

svgView.draw('lot-export', 2000, 1500);

const svgNode = svgView.svgNode;
const svgData  = (new XMLSerializer()).serializeToString(svgNode);
const lotImage = window.btoa(encodeURIComponent(svgData.replace(/></g, '>\n\r<')));
div.remove();
console.log(svgData);
*/

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
    // Flip Edge direction. This will add 180 degrees to the Edge angle, but only internally. The Angle display is not affected by this
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
            14.8,
            // Angle, with degrees, minutes, seconds as the values. Minutes and Seconds should be restricted to between 0 and 59
            new LotEdgeAngle(46, 0, 25),
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
            // Angle, with degrees, minutes, seconds as the values. Minutes and Seconds should be restricted to between 0 and 59
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
}

function moveToEasementStep()
{
    // Move to the easements step
    canvasModel.step = ApplicationStep.ADD_EASEMENT;

    // set lot features mode to PARALLEL_EASEMENT
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_PARALLEL_EASEMENT;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[2]);
    canvasModel.addOrEditEasementToEdge(lotModel.edges[3]);

    // set lot features mode to BLOCK_EASEMENT
    canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_BLOCK_EASEMENT;
    canvasModel.addOrEditEasementToEdge(lotModel.edges[3], 5);
    canvasModel.lotFeaturesModel.lastEasement.width = 7;

    // set lot features mode to PARALLEL_EASEMENT
    // canvasModel.lotFeaturesModel.mode = LotFeaturesModel.MODE_PARALLEL_EASEMENT;
}

function setupViews()
{
    // 2. Setup PIXI
    let body   = document.body, html = document.documentElement;
    appWidth  = Math.max(body.scrollWidth , body.offsetWidth , html.clientWidth , html.scrollWidth , html.offsetWidth );
    appHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

    appWidth /= 2;

    // PIXI.settings.PRECISION_FRAGMENT = 'highp';
    PIXI.settings.RESOLUTION = 2;

    // Create the PIXI application, have it take the full page
    const app = new PIXI.Application({
        width: appWidth*1.2,
        height: appHeight*1.2,
        backgroundColor: 0xFFFFFF,
        antialias: true,
        autoResize: true,
        forceFXAA: true
    });

    canvasView.x = appWidth*1.2 / 2;
    canvasView.y = appHeight*1.2 / 2;

    ViewSettings.instance.application = app;

    // Add the view to the DOM
    pixiElement = document.getElementById('app');
    pixiElement.appendChild(app.view);

    // Create the lot view
    const lotCanvasView = new PIXI.Container();
    lotCanvasView.name = 'lotCanvasView';
    lotCanvasView.addChild(canvasView);
    app.stage.addChild(lotCanvasView);

    sizeApp(appWidth, appHeight);
}

function sizeApp(width, height, factor=0.75)
{
    console.log("resizing to ", width, height);

    const app = ViewSettings.instance.application;
    const renderer = ViewSettings.instance.renderer;

    renderer.resize(width, height);

    canvasView.resize(width*PIXI.settings.RESOLUTION, height*PIXI.settings.RESOLUTION);
    canvasView.scaleAndCenter(factor || 1);

    return;

    let canvasWidth    = pixiElement.clientWidth;
    let canvasHeight   = canvasWidth / aspectRatio;
    const parentHeight = pixiElement.parentNode.clientHeight;

    if (parentHeight < canvasHeight) {
        canvasHeight   = parentHeight;
        canvasWidth     = canvasHeight * aspectRatio;
    }

    renderer.view.style.width  = `${canvasWidth}px`;
    renderer.view.style.height = `${canvasHeight}px`;
}

function changeThemeProperties()
{
    canvasView.theme.lineThickness = 10;
    canvasView.theme.lineColor = '0xFF1313';
    canvasView.theme.fillColor = '0xEDEFFE';
    canvasView.theme.labelColor = '0x131313';
    canvasView.theme.labelFontFamily = "Arial";
    canvasView.theme.labelFontSize   = 18;
    canvasView.theme.labelColor      = '0x338833';
}

/**
 * @param e {DataEvent}
 */
function onLotFeatureAdded(e) {
    if (canvasModel.lotFeaturesModel.mode===LotFeaturesModel.MODE_BLOCK_EASEMENT) {
        console.log("Added Block Easement", e.data);
    }
}

/**
 * @param e {DataEvent}
 */
function onParallelEasementAdded(e) {
    console.log("Added Parallel Easement", e.data);
}

/**
 * All the edges in a lot have to be of type LotCurveModel, even if they are straight edges.
 * To indicate if an edge is straight or a curve, use the 'isCurve' property.
 *
 * @return LotCurveModel
 */
function firstEdge() { return lotModel.edges[0]; }
function secondEdge() { return lotModel.edges[1]; }
function thirdEdge() { return lotModel.edges[2]; }