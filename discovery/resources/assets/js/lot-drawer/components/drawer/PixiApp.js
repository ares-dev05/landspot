import * as PIXI from 'pixi.js';
import canvg from 'canvg';

import CanvasModel, {defaultTheme} from './CanvasModel';
import LotDrawerView from '~/sitings-sdk/src/lot-drawer/view/LotDrawerView';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import LotDrawerSvgView from '~/sitings-sdk/src/lot-drawer/view/LotDrawerSvgView';
import _ from "lodash";
import Render from '../../../sitings-sdk/src/sitings/global/Render';


class PixiApp {
    constructor() {
        this._canvasView  = null;
        this._pixiApp     = null;
        this._svgNode     = null;
    }

    get pixiApp() { return this._pixiApp; }
    get canvasView() { return this._canvasView; }


    removeData = () => {
        this._canvasView  = null;
        this._pixiApp     = null;
        this._svgNode     = null;
    };

    /**
     * @param showSettings {boolean}
     */
    setupCanvasView = (showSettings = false) => {
        const canvasModel    = CanvasModel.getModel();
        this._canvasView      = new LotDrawerView(canvasModel);

        if (showSettings) {
            canvasModel.step = ApplicationStep.ADD_EASEMENT;
        } else {
            canvasModel.step = ApplicationStep.TRACE_OUTLINE;
        }
    };

    /**
     * @param pixiElement
     * @param getDrawerDimensions {function}
     */
    addPixiApp = (pixiElement, getDrawerDimensions) => {
        const {width, height} = getDrawerDimensions();
        PIXI.settings.RESOLUTION = 2;
        this._pixiApp = new PIXI.Application({
            width,
            height,
            backgroundColor: 0xFFFFFF,
            antialias: true,
            autoResize: true,
            forceFXAA: true
        });
        pixiElement.appendChild(this._pixiApp.view);

        const mainStage = new PIXI.Container();
        mainStage.name  = 'mainStage';
        this._pixiApp.stage.addChild(mainStage);

        const lotCanvasView = new PIXI.Container();
        lotCanvasView.name = 'lotCanvasView';
        lotCanvasView.addChild(this._canvasView);
        this._pixiApp.stage.addChild(lotCanvasView);
    };

    addNorthArrow = () => {
        const arrowSprite  = new PIXI.Sprite(this.drawArrow());
        const arrowCircle  = new PIXI.Sprite(this.drawArrowCircle());
        const arrow        = new PIXI.Container();
        const arrowRadius  = 40;
        arrow.name         = 'northArrow';
        arrow.width        = arrowRadius * 2;
        arrow.height       = arrowRadius * 2;
        arrow.pivot.x      = arrowRadius / 2;
        arrow.pivot.y      = arrowRadius / 2;
        arrow.arrowSprite  = arrowSprite;
        arrow.arrowCircle  = arrowCircle;
        arrowSprite.x      = arrowRadius / 2 - arrowSprite.width / 2;
        arrowSprite.y      = arrowRadius / 2 - arrowSprite.height / 2 - 1;

        arrow.addChild(arrowCircle, arrowSprite);

        const mainStage = this._pixiApp.stage.getChildByName('mainStage') || this._pixiApp.stage;
        mainStage.addChild(arrow);
    };

    drawArrow = (color = 0x2b8cff) => {
        const arrowSprite  = new PIXI.Graphics();
        arrowSprite.clear();
        arrowSprite.beginFill(color);
        arrowSprite.drawPolygon([3, 17.45, 10, 2.55, 16.98, 17.45, 9.99, 13.72]);
        arrowSprite.endFill();
        return arrowSprite.generateTexture();
    };

    drawArrowCircle = (color = 0xffffff) => {
        const arrowCircle  = new PIXI.Graphics();
        arrowCircle.clear();
        arrowCircle.beginFill(color);
        arrowCircle.drawCircle(40, 40, 20);
        arrowCircle.endFill();
        return arrowCircle.generateTexture();
    };

    addLotArea = (lotNumber) => {
        CanvasModel.getModel().pathModel.lotName = `Lot No ${lotNumber}`;
    };

    addLotBackground = () => {
        const {stage}       = this._pixiApp;
        const mainStage     = stage.getChildByName('mainStage') || stage;

        const lotBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
        lotBackground.name  = 'lotBackground';
        mainStage.addChildAt(lotBackground, 0);
    };

    updateModelSettings = (theme, backgroundImage, getDrawerDimensions) => {
        const {
            backgroundColor, uploadedFile, arrowColor, arrowBackgroundColor,
            fontColor, fontType, lotBackground: lotBgColor, lineThickness,
            boundaryColor, fontSize, lotLabelFontSize
        } = theme || defaultTheme;
        const {
            stage,
        } = this._pixiApp;
        const mainStage     = stage.getChildByName('mainStage') || stage;
        const lotCanvasView = stage.getChildByName('lotCanvasView') || stage;

        const lotBackground = mainStage.getChildByName('lotBackground');

        if (lotBackground) {
            const thumbImage  = uploadedFile ? uploadedFile.url : backgroundImage;
            if (thumbImage) {
                lotBackground.setTexture(PIXI.Texture.from(thumbImage));
                lotBackground.tint = 0xffffff;
            } else if (backgroundColor) {
                lotBackground.setTexture(PIXI.Texture.WHITE);
                lotBackground.tint = backgroundColor.replace('#', '0x');
            } else {
                lotBackground.setTexture(PIXI.Texture.WHITE);
                lotBackground.tint = 0xF2F2F2;
            }
        }

        const northArrow = mainStage.getChildByName('northArrow');
        if (northArrow) {
            if (arrowBackgroundColor) {
                northArrow.arrowCircle.setTexture(this.drawArrowCircle(arrowBackgroundColor.replace('#', '0x')));
            }
            if (arrowColor) {
                northArrow.arrowSprite.setTexture(this.drawArrow(arrowColor.replace('#', '0x')));
            }
        }

        this._canvasView.theme.lineThickness = lineThickness;
        if (boundaryColor) {
            this._canvasView.theme.lineColor = boundaryColor.replace('#', '0x');
        }
        if (lotBgColor) {
            this._canvasView.theme.fillColor = lotBgColor.replace('#', '0x');
        }
        if (fontColor) {
            this._canvasView.theme.labelColor = fontColor.replace('#', '0x');
        }
        if (fontType) {
            this._canvasView.theme.labelFontFamily = fontType;
        }
        if (fontSize) {
            this._canvasView.theme.labelFontSize = fontSize;
        }

        this._canvasView.titleTheme.labelFontFamily = fontType || 'Montserrat, sans-serif';
        this._canvasView.titleTheme.labelFontSize   = lotLabelFontSize;
        this._canvasView.titleTheme.labelColor      = fontColor || 'black';
    };

    drawLotImage = (imageSize) => {
        let div = document.createElement('div');
        div.id  ='lot-export';
        div.setAttribute('style', 'opacity: 0');
        document.body.append(div);

        const canvasModel = CanvasModel.getModel();
       
        const svgView     = new LotDrawerSvgView(canvasModel, this._canvasView);

        // svgView._view.theme.labelFontSize =   this._canvasView.theme.labelFontSize * Render.FONT_RESOLUTION;

        svgView.draw('lot-export', imageSize.width, imageSize.height);

        this._svgNode = svgView.svgNode;
        const svgData  = (new XMLSerializer()).serializeToString(this._svgNode);
        const lotImage = window.btoa(encodeURIComponent(svgData.replace(/></g, '>\n\r<')));
        div.remove();

        return lotImage;
    };
    
    exportDoc = ({lotNumber, imageSize, callback}) => {
        const mainStage     = this._pixiApp.stage.getChildByName('mainStage');
        const lotBackground = this._pixiApp.renderer.extract.canvas(mainStage);

        const canvas = document.createElement('canvas');
        canvas.width = imageSize.width;
        canvas.height = imageSize.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'transparent';  /// set white fill style
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(lotBackground, 0, 0, canvas.width, canvas.height);
        //load a svg snippet in the canvas with id = 'drawingArea'
        canvg(canvas, this._svgNode.outerHTML, {
            ignoreMouse: true,
            ignoreAnimation: true,
            ignoreDimensions: true,
            ignoreClear: true
        });

        canvas.toBlob(function(b){
            let a = document.createElement('a');
            document.body.append(a);
            a.download = `Lot No ${lotNumber}`;
            a.href = URL.createObjectURL(b);
            a.click();
            a.remove();
            callback();
        }, 'image/png', 1);

        this._svgNode = null;
    };
}


export default new PixiApp();