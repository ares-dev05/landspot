import React, {Component, useState, useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import _ from 'lodash';
import classnames from 'classnames';

import CompoundSlider from '~/helpers/CompoundSlider';
import {LotDrawerContext} from '../../LotDrawerContainer';
import ZoomButtons from '../page/ZoomButtons';
import CanvasModel, {imageSizes, defaultTheme} from './CanvasModel';
import store from '../../store';
import PixiApp from './PixiApp';

class LotView extends Component {
    static propTypes = {
        showSettings: PropTypes.bool,
        setDrawerData: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            restored: false
        };

        this.aspectRatio = Math.max(0, 4 / 3) || NaN;
        this.pixiElement = null;
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeEventListener);
        if (this.pixiElement) {
            const {showSettings} = this.props;
            PixiApp.setupCanvasView(showSettings);
        }
    }

    componentDidUpdate(prevProps) {
        this.setupLotPathModel();

        const {
            drawerData,
            lotDrawer
        } = this.props;
        if (lotDrawer.EXPORT_LOT_DATA && !prevProps.lotDrawer.EXPORT_LOT_DATA) {
            this.exportLotData();
        }

        if (lotDrawer.EXPORT_COMPLETE && !prevProps.lotDrawer.EXPORT_COMPLETE) {
            const lotNumber = _.get(lotDrawer, 'lotData.lot.lot_number');
            let imageSize = _.get(drawerData, 'theme.imageSize', defaultTheme.imageSize);
            imageSize     = imageSizes.find(size => size.value === imageSize);

            PixiApp.exportDoc({
                lotNumber,
                imageSize,
                callback: () => {
                    store.dispatch({type: 'RESET_EXPORT_COMPLETE'});
                }
            });
        }
    }

    componentWillUnmount() {
        this.pixiElement = null;
        PixiApp.removeData();
        window.removeEventListener('resize', this.resizeEventListener);
    }

    exportLotData = () => {
        const {
            saveDrawerData,
            setDrawerData,
            currentStep,
            drawerData
        } = this.props;

        try {
            let imageSize = _.get(drawerData, 'theme.imageSize', defaultTheme.imageSize);
            imageSize     = imageSizes.find(size => size.value === imageSize);

            const lotImage = PixiApp.drawLotImage(imageSize);

            setDrawerData(
                {lotImage},
                () => {
                    saveDrawerData(currentStep, true);
                }
            );
        } catch (e) {
            console.error(e);
        }
        store.dispatch({type: 'RESET_EXPORT_LOT_DATA'});
    };

    resizeEventListener = () => {
        if (PixiApp.pixiApp) {
            this.updateStage();
        }
    };

    setupLotPathModel = () => {
        const {
            lotDrawer: {lotData},
            setDrawerData,
            drawerData: {edges, easements}
        } = this.props;
        const {restored} = this.state;

        if (lotData && edges !== undefined) {
            if (!restored) {
                let restored = false;
                const drawerData = {};
                const canvasModel = CanvasModel.getModel();
                const {
                    pathModel,
                    lotFeaturesModel
                } = canvasModel;

                if (!pathModel.edges.length) {
                    canvasModel.initModelState();
                    if (edges) {
                        pathModel.restoreState({edges});
                    }
                    drawerData.edges = pathModel.recordState().edges;
                    restored = true;
                }

                if (easements) {
                    const {blocks, parallels} = easements;

                    if (!lotFeaturesModel.parallelEasements.edges.length && parallels) {
                        lotFeaturesModel.parallelEasements.restoreState({edges: parallels});
                        drawerData.easements = {parallels: lotFeaturesModel.parallelEasements.recordState().edges};
                    }

                    if (!lotFeaturesModel.specialEasements.length && blocks) {
                        lotFeaturesModel.restoreState({easements: blocks, driveways: []});
                        drawerData.easements = {
                            ...drawerData.easements,
                            blocks: lotFeaturesModel.recordState().easements
                        };
                    }
                }

                setDrawerData(drawerData);
                this.setState({restored});
            }

            this.setupViews();
        }
    };

    getDrawerDimensions = () => {
        const pagePreview = document.querySelector('.page-preview');
        let width  = this.pixiElement.parentNode.clientWidth;
        let height = this.pixiElement.parentNode.clientHeight;

        if (pagePreview) {
            width  = width - pagePreview.clientWidth;
        }

        if (this.props.showSettings) {
            let imageSize = _.get(this.props, 'drawerData.theme.imageSize', defaultTheme.imageSize);
            imageSize     = imageSizes.find(size => size.value === imageSize);

            width  = imageSize.width / PIXI.settings.RESOLUTION;
            height = width / this.aspectRatio;
        }

        return {width, height};
    };

    setupViews = () => {
        // Create the PIXI application, have it take the full page
        if (!PixiApp.pixiApp) {
            PixiApp.addPixiApp(this.pixiElement, this.getDrawerDimensions);

            PixiApp.addNorthArrow();
            PixiApp.addLotBackground();

            if (this.props.showSettings) {
                PixiApp.addLotArea(_.get(this.props, 'lotDrawer.lotData.lot.lot_number'));
            }
        }

        this.updateStage();
    };

    updateStage = () => {
        const {
            stage,
            renderer
        } = PixiApp.pixiApp;
        const {
            lotDrawer: {
                drawerTheme
            },
            drawerData,
            showSettings
        } = this.props;
        const {backgroundImage} = drawerTheme || {};
        const viewScale       = this.props.drawerData.viewScale || 1;
        const {width, height} = this.getDrawerDimensions();
        const mainStage       = stage.getChildByName('mainStage') || stage;
        const scaleRatio      = parseFloat(width / this.pixiElement.clientWidth).toFixed(1);

        const northArrow = mainStage.getChildByName('northArrow');
        if (northArrow) {
            northArrow.x = width - 48;
            northArrow.y = height - 145;

            if (showSettings) {
                northArrow.x = width - (48 * scaleRatio);
                northArrow.y = 48 * scaleRatio;
                northArrow.scale.x = northArrow.scale.y = scaleRatio;
            }
        }

        const lotBackground      = mainStage.getChildByName('lotBackground');
        if (lotBackground) {
            lotBackground.width  = width;
            lotBackground.height = height;
        }

        renderer.resize(width, height);
        PixiApp.canvasView.resize(
            width * PIXI.settings.RESOLUTION,
            height * PIXI.settings.RESOLUTION
        );
        PixiApp.canvasView.scaleAndCenter(viewScale);

        if (showSettings) {
            const clientWidth  = this.pixiElement.clientWidth;
            const clientHeight = this.pixiElement.parentNode.clientHeight - 166;

            let canvasWidth = clientHeight * this.aspectRatio;
            let canvasHeight = clientHeight;

            if (canvasWidth > clientWidth) {
                canvasWidth = clientWidth;
                canvasHeight = canvasWidth / this.aspectRatio;
            }

            renderer.view.style.width  = `${canvasWidth}px`;
            renderer.view.style.height = `${canvasHeight}px`;

            PixiApp.updateModelSettings(drawerData.theme, backgroundImage, this.getDrawerDimensions);
        }
        this.checkRotation();
    };

    checkRotation = (handleRotation = null) => {
        const {
            drawerData: {rotation},
            lotDrawer: {lotData},
        }                  = this.props;
        const viewRotation = handleRotation !== null
            ? handleRotation
            : rotation !== null
                ? rotation
                : lotData.rotation || 0;
        const stage        = PixiApp.pixiApp.stage;
        const mainStage    = stage.getChildByName('mainStage') || stage;
        const northArrow   = mainStage.getChildByName('northArrow');

        if (northArrow) {
            northArrow.rotation = viewRotation * Math.PI / 180;
        }

        PixiApp.canvasView.viewRotation = viewRotation;
    };

    render() {
        const {showSettings} = this.props;
        return (
            <React.Fragment>
                <div className='lot-view'
                     ref={node => this.pixiElement = node}/>

                <LotControls checkRotation={this.checkRotation}
                             showSettings={showSettings}/>
            </React.Fragment>
        );
    }

}

const LotControls = ({checkRotation, showSettings}) => {
    const canvasView  = PixiApp.canvasView || {};
    const pagePreview = document.querySelector('.page-preview');
    let leftMargin    = 30;

    if (pagePreview) {
        leftMargin = leftMargin + pagePreview.clientWidth;
    }

    return (
        <LotDrawerContext.Consumer>
            {
                ({
                     state: {drawerData}, setDrawerData
                 }) => {
                    const {rotation} = drawerData;

                    const scaleModel = (scale) => {
                        const viewScale = scale >= 0
                            ? parseFloat(parseFloat(canvasView.viewScale) + 0.1).toFixed(1)
                            : parseFloat(parseFloat(canvasView.viewScale) - 0.1).toFixed(1);
                        if (viewScale <= 5 && viewScale >= 0.1) {
                            setDrawerData({viewScale});
                        }
                    };

                    return (
                        <div className={classnames('lot-controls', showSettings && 'export')}>
                            <ZoomButtons setZoom={scaleModel}/>

                            <div className="sitings-sliders"
                                 style={{
                                     left: `${leftMargin}px`
                                 }}>
                                <Slider value={rotation || null}
                                        label='LOT ROTATION'
                                        onSlideEnd={values => {
                                            setDrawerData({rotation: values[0]});
                                        }}
                                        onUpdate={values => {
                                            checkRotation(values[0]);
                                            setDrawerData({rotation: values[0]});
                                        }}/>
                            </div>
                        </div>
                    );
                }
            }
        </LotDrawerContext.Consumer>
    );
};

const Slider = ({value, label, onSlideEnd, onUpdate}) => {
    const [rotation, setRotation] = useState(null);

    useEffect(
        () => {
            if (value !== null && rotation === null) {
                setRotation(value);
            }
        },
        [value, rotation]
    );

    return (
        <CompoundSlider min={-180} max={180} step={1}
                        values={[rotation || 0]}
                        formatter={value => rotationFormatter(value, label)}
                        onSlideEnd={onSlideEnd}
                        onUpdate={values => {
                            onUpdate(values);
                            setRotation(values[0]);
                        }}/>
    );
};

function rotationFormatter(d, text) {
    return (
        <React.Fragment>
            {text}

            <span className="slider-value">
                {`${d}°`}
            </span>

            <i className='landspot-icon rotation'/>
        </React.Fragment>
    );
}

const LotViewConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 state: {drawerData, currentStep}, setDrawerData, saveDrawerData
             }) => <LotView  {...props} {...{
                drawerData, currentStep, setDrawerData, saveDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const LotViewInstance = connect((state) => ({
    lotDrawer: state.lotDrawer,
}), null)(LotViewConsumer);

export default LotViewInstance;