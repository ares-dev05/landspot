import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {isEqual} from 'lodash';
import DisplayManager from '~/sitings-sdk/src/utils/DisplayManager';
import ViewSettings from '~/sitings-sdk/src/sitings/global/ViewSettings';
import HouseModel from '~/sitings-sdk/src/sitings/model/house/HouseModel';
import TransformationsLayerModel from '~/sitings-sdk/src/sitings/model/house/transform/TransformationsLayerModel';
import HouseView from '~/sitings-sdk/src/sitings/view/house/HouseView';

class HouseRenderer extends Component {

    state = {
        activeFacadeId: '',
        selectedOptions: [],
    };

    static propTypes = {
        houseData: PropTypes.object.isRequired,
        activeFacadeId: PropTypes.string,
        selectedOptions: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.rendererNode = React.createRef();
        this.pixiApp = null;
        this.houseView = null;
        initializeDM();
    }

    getCanvasSize = () => {
        const {rendererNode} = this;
        const height = Math.floor(rendererNode.clientHeight / window.devicePixelRatio);
        const width = Math.floor(rendererNode.clientWidth / window.devicePixelRatio);
        return {height, width}
    };

    setupRenderer = node => {
        this.rendererNode = node;
        if (node) {
            Promise.resolve()
                   .then(this.setupApp);
        }
    };

    componentDidMount() {
        window.addEventListener('resize', this.resizeEventListener);
    }

    componentWillUnmount() {
        this.rendererNode = null;
        this.pixiApp = null;
        this.houseView = null;
        window.removeEventListener('resize', this.resizeEventListener);
    }

    resizeEventListener = () => {
        if (this.pixiApp) {
            this.updateStage();
        }
    };

    static getDerivedStateFromProps(props, state) {
        const newState = {};
        if (state.activeFacadeId !== props.activeFacadeId) {
            newState.activeFacadeId = props.activeFacadeId;
        }

        if (!isEqual(state.selectedOptions, props.selectedOptions)) {
            newState.selectedOptions = props.selectedOptions;
        }

        return Object.keys(newState) ? newState : null;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {activeFacadeId, selectedOptions} = this.state;
        if (this.houseModel) {
            if (activeFacadeId !== prevState.activeFacadeId && activeFacadeId) {
                this.houseModel.selectFacade(this.props.activeFacadeId);
            }

            if (!isEqual(selectedOptions, prevState.selectedOptions)) {
                this.houseModel.selectOptions(selectedOptions);
            }
        }
    }

    setupApp = () => {
        const {height, width} = this.getCanvasSize();

        if (!this.pixiApp) {
            this.pixiApp = new PIXI.Application({
                width: width,
                height: height,
                autoResize: true,
                backgroundColor: 0xFFFFFF,
                antialias: true,
            });
            ViewSettings.instance.application = this.pixiApp;
            this.houseModel = new HouseModel(new TransformationsLayerModel());
            this.houseView = new HouseView(this.houseModel);
            this.houseView.x = width / 2;
            this.houseView.y = height / 2;
            this.pixiApp.stage.addChild(this.houseView);
            // loadHouse reads the house data and creates one layer for each facade, option and roofline found in the house
            // the layers parse the SVG instructions into geometric objects
            this.houseModel.loadHouse(this.props.houseData);
            const {activeFacadeId, selectedOptions} = this.props;
            if (activeFacadeId) {
                this.houseModel.selectFacade(activeFacadeId);
                this.houseModel.selectOptions(selectedOptions);
            }
        }

        if (!this.rendererNode.childNodes.length) {
            this.rendererNode.appendChild(this.pixiApp.view);
        }
    };

    updateStage = () => {
        const {
            // stage,
            renderer
        } = this.pixiApp;
        const {width, height} = this.getCanvasSize();

        this.houseView.x = width / 2;
        this.houseView.y = height / 2;

        renderer.resize(width, height);
    };

    render() {
        return (
            <div className='renderer'
                 ref={this.setupRenderer}
            />
        )
    }
}

export default HouseRenderer

function initializeDM() {
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

    PIXI.settings.RESOLUTION = 1;
}