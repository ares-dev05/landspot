import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import _ from 'lodash';

import CanvasModel, {imageSizes, defaultTheme} from '../../drawer/CanvasModel';
import store from '../../../store';
import PixiApp from '../../drawer/PixiApp';

class LotView extends Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
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
            PixiApp.setupCanvasView();
        }
    }

    componentDidUpdate(prevProps) {
        const {
            popupDialog,
            lotDrawer,
            theme
        } = this.props;

        if (popupDialog.POPUP_UPDATED) {
            CanvasModel.getModel().clearAllModels();
            this.resetViewTheme();
            this.restoreModel();
            if (PixiApp.pixiApp) {
                this.updateLotArea();
            }
            this.setupViews();
        }

        if (theme.imageSize !== prevProps.theme.imageSize) {
            this.updateStage();
        }

        if (lotDrawer.EXPORT_LOT_DATA && !prevProps.lotDrawer.EXPORT_LOT_DATA) {
            this.exportLotData();
        }
    }

    componentWillUnmount() {
        this.pixiElement = null;
        PixiApp.removeData();
        window.removeEventListener('resize', this.resizeEventListener);
    }

    updateLotArea = () => {
        const {stage} = PixiApp.pixiApp;

        const lotLabel = stage.getChildByName('lotLabel');
        if (lotLabel) {
            stage.removeChild(lotLabel);
        }
        PixiApp.addLotArea(_.get(this.props, 'popupDialog.lotData.lot.lot_number'));
    };

    exportLotData = () => {
        const {
            onItemChange,
            theme,
            popupDialog
        } = this.props;
        const lotNumber = _.get(popupDialog, 'lotData.lot.lot_number');
        let imageSize   = _.get(theme, 'imageSize', defaultTheme.imageSize);
        imageSize       = imageSizes.find(size => size.value === imageSize);

        PixiApp.drawLotImage(imageSize);

        PixiApp.exportDoc({
            lotNumber,
            imageSize,
            callback: () => {
                store.dispatch({type: 'RESET_EXPORT_LOT_DATA'});
                onItemChange({preloader: false});
            }
        });
    };

    resetViewTheme = () => {
        if (PixiApp.canvasView) {
            PixiApp.canvasView.theme.lineThickness   = 2;
            PixiApp.canvasView.theme.lineColor       = 0;
            PixiApp.canvasView.theme.fillColor       = 0xEEEEEE;
            PixiApp.canvasView.theme.labelColor      = 0;
            PixiApp.canvasView.theme.labelFontFamily = 'Arial';
            PixiApp.canvasView.theme.labelFontSize   = 13;
        }
    };

    resizeEventListener = () => {
        if (PixiApp.pixiApp) {
            this.updateStage();
        }
    };

    restoreModel = () => {
        const {
            popupDialog: {lotData},
        } = this.props;
        const canvasModel = CanvasModel.getModel();
        const edges       = JSON.parse(lotData.edges);
        const easements   = JSON.parse(lotData.easements || null);
        const {
            pathModel,
            lotFeaturesModel
        } = canvasModel;

        canvasModel.initModelState();
        if (edges) {
            pathModel.restoreState({edges});
        }

        if (easements) {
            const {blocks, parallels} = easements;

            if (parallels) {
                lotFeaturesModel.parallelEasements.restoreState({edges: parallels});
            }

            if (blocks) {
                lotFeaturesModel.restoreState({easements: blocks, driveways: []});
            }
        }
    };

    getDrawerDimensions = () => {
        let imageSize   = _.get(this.props, 'theme.imageSize', defaultTheme.imageSize);
        imageSize       = imageSizes.find(size => size.value === imageSize);
        const width     = imageSize.width / PIXI.settings.RESOLUTION;
        const height    = width / this.aspectRatio;

        return {width, height};
    };

    setupViews = () => {
        // Create the PIXI application, have it take the full page
        if (!PixiApp.pixiApp) {
            PixiApp.addPixiApp(this.pixiElement, this.getDrawerDimensions);

            PixiApp.addNorthArrow();
            PixiApp.addLotBackground();
            PixiApp.addLotArea(_.get(this.props, 'popupDialog.lotData.lot.lot_number'));
        }

        this.updateStage();
    };

    updateStage = () => {
        const {
            stage,
            renderer
        } = PixiApp.pixiApp;
        const {
            popupDialog: {
                lotData,
                drawerTheme
            },
            theme
        }               = this.props;
        const viewScale = lotData ? lotData.view_scale || 0 : 0;
        const {width, height} = this.getDrawerDimensions();
        const mainStage       = stage.getChildByName('mainStage') || stage;
        const scaleRatio      = parseFloat(width / this.pixiElement.clientWidth).toFixed(1);

        const northArrow = mainStage.getChildByName('northArrow');
        if (northArrow) {
            northArrow.x = width - (48 * scaleRatio);
            northArrow.y = 48 * scaleRatio;
            northArrow.scale.x = northArrow.scale.y = scaleRatio;
        }

        const lotBackground      = mainStage.getChildByName('lotBackground');
        if (lotBackground) {
            lotBackground.width  = width;
            lotBackground.height = height;
        }

        renderer.resize(width, height);
        PixiApp.canvasView.resize(
            width*PIXI.settings.RESOLUTION,
            height*PIXI.settings.RESOLUTION
        );
        PixiApp.canvasView.scaleAndCenter(viewScale || 1);

        let canvasWidth    = this.pixiElement.clientWidth;
        let canvasHeight   = canvasWidth / this.aspectRatio;
        const parentHeight = this.pixiElement.parentNode.clientHeight;

        if (parentHeight < canvasHeight) {
            canvasHeight   = parentHeight;
            canvasWidth     = canvasHeight * this.aspectRatio;
        }

        renderer.view.style.width  = `${canvasWidth}px`;
        renderer.view.style.height = `${canvasHeight}px`;

        const {backgroundImage} = drawerTheme || {};
        PixiApp.updateModelSettings(theme, backgroundImage, this.getDrawerDimensions);
        this.checkRotation();
    };

    checkRotation = () => {
        const {
            popupDialog: {lotData},
        }                  = this.props;
        const viewRotation = lotData ? lotData.rotation || 0 : 0;
        const stage        = PixiApp.pixiApp.stage;
        const mainStage    = stage.getChildByName('mainStage') || stage;
        const northArrow   = mainStage.getChildByName('northArrow');

        if (northArrow) {
            northArrow.rotation = viewRotation * Math.PI / 180;
        }

        PixiApp.canvasView.viewRotation = viewRotation;
    };

    render() {
        return (
            <div className='lot-view'
                 ref={node => this.pixiElement = node}/>
        );
    }

}

export default connect((state) => ({
    popupDialog: state.popupDialog,
    lotDrawer: state.lotDrawer,
}), null)(LotView);