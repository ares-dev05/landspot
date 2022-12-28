import React, { Component, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import * as PIXI from 'pixi.js'
import _ from 'lodash'
import classnames from 'classnames'
import CircularSlider from '@fseehawer/react-circular-slider'

import { DrawerContext } from '../../DrawerContainer'
import CanvasView from '~/sitings-sdk/src/sitings/view/SitingsView'
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep'
import ViewSettings from '~/sitings-sdk/src/sitings/global/ViewSettings'
import SitingsSvgView from '~/sitings-sdk/src/sitings/svg/SitingsSvgView'
import PdfPage from '~/sitings-sdk/src/sitings/global/PdfPage'
import CanvasModel from '../CanvasModel'
import store from '~sitings~/store'
import ZoomButtons from '../page/ZoomButtons'
import CompoundSlider from '~sitings~/helpers/CompoundSlider'
import UserAction from '../consts'
import MeasurementsLayerModel from '~/sitings-sdk/src/sitings/model/measure/MeasurementsLayerModel'
import EventBase from '~/sitings-sdk/src/events/EventBase'
import ThemeManager from '~/sitings-sdk/src/sitings/view/theme/ThemeManager'
import Geom from '~/sitings-sdk/src/utils/Geom'
import ModelEvent from '~/sitings-sdk/src/sitings/events/ModelEvent'
import { ToggleSwitch } from '~sitings~/helpers/ToggleSwitch'
import DisplayManager from '../../../../../sitings-sdk/src/utils/DisplayManager'
import MagnifyingGlassMinus from '~/../img/MagnifyingGlassMinus.png'
import MagnifyingGlassPlus from '~/../img/MagnifyingGlassPlus.png'
import NavigationArrow from '~/../img/NavigationArrow.png'

class LotView extends Component {
  static propTypes = {
    step: PropTypes.number,
    engineeringEnabled: PropTypes.bool,
    heightVisualisationEnabled: PropTypes.bool,
    threeDVisualisationEnabled: PropTypes.bool,
    nearmapsVisualisationEnabled: PropTypes.bool,
    setDrawerData: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      hasError: false,
      sitingPage: true
    }
    this.sitingSession = null

    this.canvasView = null
    this.measurementsModel = null
    this.multiFloors = null
    this.northIndicator = null
    this.canvasSvgView = null
    this.pixiApp = null
    this.pixiElement = null
  }

  componentDidMount () {
    window.addEventListener('resize', this.resizeEventListener)
    this.addPixiApp()
    if (this.pixiElement) {
      this.setupCanvasView()
      this.setupLotPathModel()
      this.setupViews()
    }
  }

  componentDidCatch (error, errorInfo) {
    console.error(error, errorInfo)
    this.setState({ hasError: true })
  }

  componentDidUpdate (prevProps) {
    const { drawerDetails, step, drawerData } = this.props

    if (
      drawerDetails.EXPORT_LOT_DATA &&
      !prevProps.drawerDetails.EXPORT_LOT_DATA
    ) {
      this.exportLotData(drawerDetails.exportType)
    } else {
      this.setupLotPathModel()
    }

    if (step !== prevProps.step) {
      this.setupModelStep()
      this.clearViews()
      this.setupViews()
      this.updateStage()
    }

    if (drawerData.previewHeight != prevProps.drawerData.previewHeight) {
      const { width, height } = this.getDrawerDimensions()
      this.pixiApp.renderer.resize(width, height - drawerData.previewHeight)
    }
  }

  componentWillUnmount () {
    const canvasModel = CanvasModel.getModel()

    if (this.multiFloors) {
      this.multiFloors.removeEventListener(
        'floorRotated',
        this.onFloorRotated,
        this
      )
      this.multiFloors.removeEventListener(
        ModelEvent.SELECT,
        this.newHouseModelSelected,
        this
      )
      this.multiFloors = null
    }
    if (this.measurementsModel) {
      this.measurementsModel.removeEventListener(
        EventBase.CHANGE,
        this.onMeasurementModelChanged,
        this
      )
      this.measurementsModel.removeEventListener(
        EventBase.ADDED,
        this.onMeasurementModelChanged,
        this
      )
      this.measurementsModel = null
    }

    if (this.canvasView) {
      this.canvasView.removeListener('scaleChanged', this.onScaleChanged, this)
    }

    this.canvasView = null
    this.canvasSvgView = null
    this.pixiApp = null
    this.pixiElement = null

    window.removeEventListener('resize', this.resizeEventListener)
  }

  exportLotData = exportType => {
    const { saveDrawerData, setDrawerData, currentStep } = this.props
    switch (exportType) {
      case UserAction.ASSIGN_TO_CLIENT:
      case UserAction.SAVE_AND_EXPORT: {
        const sitingImage = this.drawLotImage()
        const engineeringImage = this.drawEngineeringImage()
        const nearmapImage = this.drawNearmapImage()

        setDrawerData({ sitingImage, engineeringImage, nearmapImage }, () =>
          saveDrawerData(currentStep, exportType)
        )
        store.dispatch({ type: 'RESET_EXPORT_LOT_DATA' })

        break
      }
      default:
        store.dispatch({ type: 'RESET_EXPORT_LOT_DATA' })
        break
    }
  }

  /**
   * @param view {SitingsView|AlignEngineeringView}
   * @param printDpi {number}
   *
   * @returns {{svgData: string, config: {width: number, pageSize: {width: number, height: number}, underlay: (Matrix|null), height: number}}}
   * @private
   */
  _renderViewToSvg = (view, printDpi = 144) => {
    let div = document.createElement('div')
    div.id = 'lot-export'
    div.setAttribute('style', 'opacity: 0')
    document.body.append(div)

    // Send the Page size and Export scale to the SVG renderer
    const props = this.props.drawerData.siting
    const config = this.canvasSvgView.drawView(
      // Application view that provides render settings (scale & rotation)
      view,
      // HTML div to draw into
      'lot-export',
      // selected page size, or A4 default
      props.page_size || PdfPage.SIZE_A4,
      // selected scale, or 1:200 default
      props.page_scale || 200,
      // DPI to use when creating the SVG output
      printDpi
    )

    const svgData = new XMLSerializer().serializeToString(
      this.canvasSvgView.svgNode
    )
    div.remove()

    return {
      config: config,
      svgData: svgData
    }
  }

  /**
   * @returns {string}
   */
  drawLotImage = () => {
    return window.btoa(
      encodeURIComponent(
        this._renderViewToSvg(this.canvasView).svgData.replace(/></g, '>\n\r<')
      )
    )
  }

  /**
   * @return {string}
   */
  drawNearmapImage = () => {
    const model = CanvasModel.getModel()

    // @TODO @TEMP @UPGRADE
    if (model && model.nearmapRender) {
      const PW = 796.8
      const PH = 1123.2
      const FOOTER = 60

      const width = model.nearmapWidth
      const height = model.nearmapHeight

      const address = model.nearmapModel.selectedAddress

      // scale
      const SCALE = Math.min((PH - FOOTER) / height, PW / width)
      const SCW = Math.ceil(SCALE * width)
      const SCH = Math.ceil(SCALE * height)
      const DX = Math.floor(PW - SCW) / 2
      const DY = Math.floor(PH - FOOTER - SCH) / 2

      const template =
        '<html lang="">\n' +
        '<head>\n' +
        '<meta charSet="utf-8">\n' +
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '    <style type="text/css">\n' +
        '       img {' +
        '           width: ' +
        SCW +
        'px;\n' +
        '           height:' +
        SCH +
        'px;\n' +
        '           position: absolute;' +
        '           left: ' +
        DX +
        'px;' +
        '           top: ' +
        DY +
        'px;' +
        '       }' +
        '       .image {' +
        '           width: ' +
        PW +
        'px;\n' +
        '           height:' +
        (PH - FOOTER) +
        'px;\n' +
        '           position: absolute;' +
        '           left: 0;' +
        '           top: 0;' +
        '           overflow: hidden;' +
        '       }' +
        '       .footer {' +
        '           width: ' +
        SCW +
        'px;\n' +
        '           height:' +
        FOOTER +
        'px;\n' +
        '           position: absolute;' +
        '           left: 0px;' +
        '           top: ' +
        (PH - FOOTER) +
        'px;' +
        //                '           background-color: white;' +
        '       }' +
        '       .logo {' +
        '           position: absolute;' +
        '           left: ' +
        (PW - 182) +
        'px;' +
        '           bottom: 5px;' +
        '       }' +
        '       span {' +
        '           font-size: 14px;' +
        '           color: black;' +
        '           padding: 20px;' +
        '           line-height: 20px;' +
        '           display: block;' +
        '       }' +
        '        html, body {\n' +
        '            padding: 0; margin: 0; overflow: hidden;' +
        '            width: ' +
        PW +
        'px;\n' +
        '            height: ' +
        PH +
        'px;\n' +
        '        }\n' +
        '    </style>\n' +
        '    <title>PDF Render</title>\n' +
        '</head>\n' +
        '<body>\n' +
        '<div class="image">\n' +
        '<img src="' +
        model.nearmapRender +
        '"/> ' +
        '</div>\n' +
        '<div class="footer">\n' +
        '<span>' +
        address +
        '</span>' +
        '<div class="logo"><svg width="172" height="50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="b"><stop stop-color="#004B8D" offset="0%"/><stop stop-color="#0078B5" offset="70%"/><stop stop-color="#13B5EA" offset="100%"/></linearGradient><path d="M33.2 0c.8 0 1.1.5 1.1 1.2v.6C34 3 32.8 4.3 31.5 3.3c-1-.8 0-3 1.2-3.2l.5-.1Zm-3.6 8.7c0-1.8 1-2.7 2-2.7h.3c2 .5.9 4.6-1.2 4.3-.6-.2-1.1-.8-1.1-1.6ZM28.9 3h.2c1 0 1.2.8 1 1.7-.4 1.3-1.6 2.5-2.6 1.4l-.2-.9c0-.9.7-2 1.4-2.2h.2Zm-2.6 0c-1.6-.2-.6-2.6.7-2.6.2 0 .4 0 .6.2.8.5-.3 2.6-1.3 2.5Zm-5.5-1.4c.3-.6.8-1.2 1.4-1.2l.6.2c.8.7-.6 3-1.7 2.4-.5-.4-.5-1-.3-1.4ZM22.5 6c-1-.6-.1-2.8 1-2.8.3 0 .6 0 .8.3.8.9-.7 3.2-1.8 2.5Zm2 .1h.6c1 0 1.2.9 1 1.9-.3 1.2-1.4 2.4-2.5 1.6-1.3-.9-.2-3.2 1-3.5Zm1.9 4 .6-.2c1 0 1.3 1.1 1 2.2-.2 1.5-1.4 3-2.7 1.8-1-1-.2-3.2 1-3.8Zm3 5.5h.3c1.2 0 1.7 1.2 1.6 2.5-.2 1.4-1 2.7-2.5 2.5-2-.3-1.6-4.7.6-5Zm-2.8 10.8h.6c3.3 0 3.2 7.8-.1 7.8-3.2 0-3.4-7-.5-7.8ZM24.3 19h.4c1.3 0 1.9 1.5 1.8 3-.2 1.6-1 3.2-2.6 3-2.5-.4-1.8-5.5.4-6Zm-1.7-5.6h.1c1.1 0 1.5 1.2 1.3 2.4-.1 1.2-1 2.5-2.2 2.3-2-.3-1.2-4.5.8-4.7ZM20 13c-1.4-.4-.6-3.8 1-3.8l.7.1c1.4 1 0 4.3-1.7 3.7Zm-.3-7h.3c1 0 1 .8.8 1.6-.4 1.1-1.4 2.2-2.2 1.4-1-.8.1-2.8 1.1-3Zm-2.1-.3C17 5.2 17.9 3 19 3h.3c1.2.7-.4 3.5-1.7 2.7Zm-.8-2.6c-.8-.7.4-2.6 1.4-2.6.1 0 .3 0 .4.2.8.7-.8 2.8-1.8 2.4Zm-1 5.8a1.2 1.2 0 0 1 1.3-.4c.6.3.5 1.2.2 2-.4.8-1.2 1.4-2 1-.5-.6-.3-1.9.4-2.6Zm.6 7c-1.2-.5-.3-3.5 1.2-3.5h.2c1.3.5.3 4.2-1.4 3.6Zm1.4 1.5h.5c.8 0 1 1 1 2-.3 1.2-1 2.3-2.1 2-1.5-.4-.3-3.7.6-4Zm-3.4 3.5h.2c.8 0 1 1 .8 2-.2 1-.8 2-1.6 2-1.7-.3-.5-3.9.6-4ZM13.3 19c-1.4-.1-.7-3.6.9-3.6l.4.1c1 .6 0 3.6-1.3 3.5Zm-.6-5c-1-.6 0-3 1.3-3h.3c.9.3-.4 3.4-1.6 3Zm-2.8 2.2c-.8-.5 0-2.7 1.1-2.7h.3c.8.5-.4 3.2-1.4 2.7Zm0 5.5c-1.1-.6-.2-3.3 1.1-3.3h.3c1 .6-.1 3.6-1.4 3.3Zm0 6.6c-1.3-.6-.5-3.7 1-3.7h.5c1 .5-.1 4.2-1.5 3.7Zm-3.6 3c-1-.7 0-3.7 1.2-3.7l.4.1c.7.3-.2 4-1.6 3.5ZM7 24c-1-.6-.2-3.2 1-3.2h.3c.8.5-.2 3.5-1.3 3.2Zm-.1-5.7c-.6-.5.2-2.7 1-2.7H8c1.1.2.2 3.4-1.2 2.7Zm-3 8.2c-1-.2-.2-2.6.7-2.6h.2c.9.5 0 2.7-.9 2.6Zm0 4.2H4c.7 0 .7.8.4 1.6-.4 1.2-1.4 2.4-1.7.7-.1-1 .6-2.2 1.1-2.3Zm-3.3 5c-1-.4-.3-2.4.7-2.4h.1c.6.2 0 2.7-.8 2.4Zm.5-7c-.6-.4 0-2.4.8-2.4H2c.6.3-.2 2.5-1 2.3Zm1-6.3c-.6-.2 0-2 .8-2H3c.4.3-.3 2.3-1 2Zm2.2-1.8c-.5-.3.1-2.3 1-2.3h.2c.7.4-.3 2.6-1.2 2.3Z" id="a"/></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M2.3.6h4.1l-.2 1.7C7 1.6 7.8 1 8.6.7c.8-.4 1.7-.6 2.5-.6a4.8 4.8 0 0 1 5 5 15.3 15.3 0 0 1-.3 3l-1.3 9.6h-4l1.2-9.4a31 31 0 0 0 .1-2.1c0-.7-.1-1.3-.5-1.6l-.7-.5h-1c-.7 0-1.4.2-2 .6-.8.5-1.3 1.2-1.7 2l-.5 2-.5 3-.8 6H0L2.3.6ZM34.7 14.6c-.8 1.1-1.8 2-3.2 2.6a9.6 9.6 0 0 1-4.5 1c-2.5 0-4.6-.8-6-2.3a7.2 7.2 0 0 1-1.7-2.5c-.4-1-.6-2-.6-3.3A9.8 9.8 0 0 1 24.6.9a9 9 0 0 1 7.8.3c1.3.7 2.2 1.7 3 3a9.1 9.1 0 0 1 .9 6.2H22.8a4 4 0 0 0 1.2 2.8c.4.4.8.6 1.3.8.5.2 1 .3 1.7.3a6 6 0 0 0 4.1-1.6l3.6 2Zm-2.5-7.3c-.3-1-.9-1.9-1.6-2.4-.3-.3-.7-.5-1.2-.6L28 4a4.7 4.7 0 0 0-3.8 1.8l-.8 1.4h8.8ZM53 .6h4l-2.3 17.1h-4l.2-1.8a9 9 0 0 1-2.5 1.7 6 6 0 0 1-2.6.6c-2.3 0-4-.9-5.4-2.6a9 9 0 0 1-2-5.8A9.8 9.8 0 0 1 45.4.5c.7-.3 1.5-.4 2.3-.4a5.9 5.9 0 0 1 5 2.9L53 .6Zm-3.6 13.1c.8-.4 1.4-1.2 2-2.2.4-1 .7-2 .7-3 0-1.3-.4-2.4-1.2-3.3-.4-.4-.8-.7-1.3-.9A5 5 0 0 0 44 5.6c-.5.6-.9 1.2-1.1 2a7 7 0 0 0-.4 2.3c0 1.4.4 2.5 1.1 3.3a4.4 4.4 0 0 0 3 1.2 5 5 0 0 0 2.7-.7ZM60 .6h3.7l-.3 2.3c.6-1 1.2-1.6 1.8-2 .7-.5 1.4-.8 2.2-.8l1.2.3L67 4.3a3.7 3.7 0 0 0-.7-.2c-.8 0-1.6.5-2.2 1.4-.3.5-.6 1.2-.8 2.2-.3 1-.5 2.1-.7 3.6l-.8 6.4h-4.2L60 .6Z" fill="#13B5EA" transform="translate(-145 -6590) translate(145 6590) translate(0 20.2)"/><path d="M70.5.6h4.2l-.3 1.8A8 8 0 0 1 76.8.7a6.3 6.3 0 0 1 4.8-.2l1.6 1 .5.8.5 1a8 8 0 0 1 4.3-3 7 7 0 0 1 1.7-.2 4.7 4.7 0 0 1 4.5 3.1c.3.7.4 1.4.4 2.1a13.8 13.8 0 0 1-.2 2.2l-1.4 10.2h-4.1L90.6 9a67.3 67.3 0 0 0 .2-2.4c0-.8-.2-1.4-.6-1.8l-.7-.5-1-.1c-.7 0-1.4.2-2.1.7-.7.5-1.3 1.2-1.6 2l-.6 1.8-.4 2.6-.9 6.5h-4L80 8.4a19 19 0 0 0 .1-2c0-.7-.2-1.3-.6-1.7a2 2 0 0 0-.8-.5L78 4c-.7 0-1.3.2-2 .7-.7.5-1.3 1.1-1.7 2L73.7 8l-.4 2.2-1 7.4h-4L70.4.6ZM111.3.6h4.1l-2.3 17.1H109l.2-1.8a9 9 0 0 1-2.5 1.7 6 6 0 0 1-2.6.6c-2.3 0-4-.9-5.3-2.6a9 9 0 0 1-2-5.8 9.9 9.9 0 0 1 6.8-9.3c.8-.3 1.5-.4 2.3-.4a5.9 5.9 0 0 1 5 2.9l.4-2.4Zm-3.6 13.1c.8-.4 1.4-1.2 2-2.2.5-1 .7-2 .7-3 0-1.3-.4-2.4-1.2-3.3-.3-.4-.8-.7-1.3-.9-.5-.2-1-.3-1.7-.3a5 5 0 0 0-3.8 1.7c-.5.5-.9 1.1-1.1 1.9a7 7 0 0 0-.4 2.3c0 1.4.4 2.5 1.2 3.3.4.4.8.7 1.3.9.5.2 1 .3 1.7.3a5 5 0 0 0 2.6-.7ZM118.7 29.8h-4.2l4-29.2h4l-.3 1.8c1-.8 1.7-1.4 2.5-1.8a6 6 0 0 1 2.6-.5c2.2 0 4 .9 5.3 2.5a9 9 0 0 1 2 5.8 10 10 0 0 1-4.7 8.5 9 9 0 0 1-4.4 1.2 5.8 5.8 0 0 1-4-1.6 6 6 0 0 1-1-1.2l-1.8 14.5Zm5-25.2c-.8.4-1.4 1.2-1.9 2.2-.5 1-.7 2-.7 3 0 1.3.3 2.4 1.1 3.2.4.5.8.8 1.3 1 .5.2 1 .3 1.7.3 1.5 0 2.7-.6 3.7-1.7.5-.5.9-1.2 1.1-1.9a7 7 0 0 0 .4-2.3c0-1.4-.4-2.5-1.1-3.3l-1.3-1-1.7-.2c-1 0-1.8.2-2.6.7Z" fill="#004B8D" transform="translate(-145 -6590) translate(145 6590) translate(0 20.2)"/><g transform="translate(-145 -6590) translate(145 6590) translate(137)"><mask id="c" fill="#fff"><use xlink:href="#a"/></mask><path fill="url(#b)" fill-rule="nonzero" mask="url(#c)" d="M-1.1-1.7H35V37.9H-1.1z"/></g></g></svg></div>' +
        '</div>\n' +
        '</body>\n' +
        '</html>\n'

      return window.btoa(encodeURIComponent(template.replace(/></g, '>\n\r<')))
    }

    return ''
  }

  drawEngineeringImage = () => {
    const model = CanvasModel.getModel()
    if (model.engineeringState && model.engineeringState.view) {
      // Start by rendering the engineering SVG
      const render = this._renderViewToSvg(
        model.engineeringState.view,
        96 /*web print DPI, needed for correct PhantomJS export, due to zoom set by rasterize.js*/
      )
      const config = render.config

      /* engineering format:
            {
                "id": 20,
                "page": 2,
                "width": 3973,
                "height": 2807,
                "image": "https://localapollo.com/storage/documents/reference_plan_pages/21/03/thumb_uM3WCz0GAX1UX1ZY59A5JYja1JIVFmPWlBLrk3pw-1.png"
            }
            */
      const engineering = model.engineeringState.view.pdfPage

      // calculate the full engineering image size (base size X scale)
      // config.underlay is a Matrix, where a=d=scale; e=tx; f=ty
      const engineeringWidth = engineering.width * config.underlay.a
      const engineeringHeight = engineering.height * config.underlay.a

      // Create a HTML template that contains the engineering image and the SVG overlay
      const template =
        '<html lang="">\n' +
        '<head>\n' +
        '<meta charSet="utf-8">\n' +
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '    <style type="text/css">\n' +
        '        .image {\n' +
        '            overflow: hidden;' +
        '            width: ' +
        (config.pageSize.width - Math.round(config.underlay.e)) +
        'px;\n' +
        '            height: ' +
        (config.pageSize.height - Math.round(config.underlay.f)) +
        'px;\n' +
        '        }\n' +
        '       img {' +
        '           width: ' +
        engineeringWidth +
        'px;' +
        '           height: ' +
        engineeringHeight +
        'px;' +
        '           position: absolute;' +
        '           left: ' +
        Math.round(config.underlay.e) +
        'px;' +
        '           top: ' +
        Math.round(config.underlay.f) +
        'px;' +
        '       }' +
        '       svg {' +
        '           position: absolute; left: 0; top: 0;' +
        '       }' +
        '        html, body {\n' +
        '            padding: 0; margin: 0; overflow: hidden;' +
        '            width: ' +
        config.pageSize.width +
        'px;\n' +
        '            height: ' +
        config.pageSize.height +
        'px;\n' +
        '        }\n' +
        '    </style>\n' +
        '    <title>PDF Render</title>\n' +
        '</head>\n' +
        '<body>\n' +
        '<div class="image">' +
        '<img src="' +
        engineering.image +
        '"/> ' +
        '</div>\n' +
        // SVG render goes here
        render.svgData +
        '</body>\n' +
        '</html>\n'

      /*
            background-image: url("'+engineering.image+'");\n' +
            '            background-size: '+engineeringWidth+'px '+engineeringHeight+'px;\n' +
            '            background-position: '+config.underlay.e+'px '+config.underlay.f+'px;\n' +
            '            position: absolute; left: 0; top: 0; overflow: hidden;' +
            '            width: '+config.pageSize.width+'px;\n' +
            '            height: '+config.pageSize.height+'px;\n' +
            */

      return window.btoa(encodeURIComponent(template.replace(/></g, '>\n\r<')))
    }

    return ''
  }

  resizeEventListener = () => {
    if (this.pixiApp) {
      this.updateStage()
    }
  }

  setupCanvasView = () => {
    const canvasModel = CanvasModel.getModel()
    this.canvasView = new CanvasView(canvasModel)
    this.canvasSvgView = new SitingsSvgView(canvasModel, this.canvasView)
    CanvasModel.svgView = this.canvasSvgView

    this.northIndicator = new InteractiveNorthIndicator()
    this.northIndicator.addListener(
      EventBase.CHANGE,
      this.northRotationChanged,
      this
    )
    this.setupModelStep()

    canvasModel.multiFloors.addEventListener(
      'floorRotated',
      this.onFloorRotated,
      this
    )
    canvasModel.multiFloors.addEventListener(
      ModelEvent.SELECT,
      this.newHouseModelSelected,
      this
    )

    canvasModel.measurementsModel.addEventListener(
      EventBase.CHANGE,
      this.onMeasurementModelChanged,
      this
    )
    canvasModel.measurementsModel.addEventListener(
      EventBase.ADDED,
      this.onMeasurementModelChanged,
      this
    )

    this.multiFloors = canvasModel.multiFloors
    this.measurementsModel = canvasModel.measurementsModel

    this.canvasView.addListener('scaleChanged', this.onScaleChanged, this)
  }

  newHouseModelSelected = () => {
    this.forceUpdate()
  }

  onMeasurementModelChanged = () => {
    this.forceUpdate()
  }

  onFloorRotated = () => {
    // this.forceUpdate();
  }

  onScaleChanged = () => {
    const { setDrawerData } = this.props
    const viewScale = DisplayManager.instance.viewScale
    setDrawerData({ viewScale })
  }

  clearViews = () => {
    const { stage } = this.pixiApp
    const mainStage = stage.getChildByName('mainStage') || stage

    if (stage.getChildByName('mainStage')) {
      stage.removeChild(stage.getChildByName('mainStage'))
    }

    if (mainStage.getChildByName('lotBackground')) {
      mainStage.removeChild(mainStage.getChildByName('lotBackground'))
    }

    if (mainStage.getChildByName('northIndicator')) {
      mainStage.removeChild(mainStage.getChildByName('northIndicator'))
    }
  }

  setupModelStep = () => {
    const canvasModel = CanvasModel.getModel()
    const { step } = this.props

    switch (step) {
      case ApplicationStep.ADD_EASEMENT:
        canvasModel.step = ApplicationStep.ADD_EASEMENT
        break
      case ApplicationStep.TRACE_OUTLINE:
        canvasModel.step = ApplicationStep.TRACE_OUTLINE
        break
      case ApplicationStep.IMPORT_FLOOR_PLAN:
        canvasModel.step = ApplicationStep.IMPORT_FLOOR_PLAN
        break
      case ApplicationStep.ADD_EXTENSIONS:
        canvasModel.step = ApplicationStep.ADD_EXTENSIONS
        break
      case ApplicationStep.ADD_MEASUREMENTS:
        canvasModel.step = ApplicationStep.ADD_MEASUREMENTS
        break
      case ApplicationStep.EXPORT_PDF:
        canvasModel.step = ApplicationStep.EXPORT_PDF
        break

      default:
        canvasModel.step = ApplicationStep.TRACE_OUTLINE
        break
    }
  }

  setupLotPathModel = () => {
    const {
      drawerDetails: { drawerData },
      setDrawerData,
      drawerData: { sitingSession, restored }
    } = this.props

    if (drawerData && sitingSession !== undefined) {
      if (!restored) {
        const drawerData = {
          restored
        }

        if (this.restoreModel(sitingSession)) {
          drawerData.restored = true
        }

        setDrawerData(drawerData)

        this.setupModelStep()
      }

      this.updateStage()
    }
  }

  restoreModel = (sitingSession = null) => {
    const canvasModel = CanvasModel.getModel()
    const { pathModel } = canvasModel

    if (!pathModel.edges.length) {
      canvasModel.initModelState()
      if (sitingSession) {
        canvasModel.restoreState(sitingSession)
      }
    }
    return true
  }

  getDrawerDimensions = () => {
    const pagePreview = document.querySelector('.page-preview')
    let width = this.pixiElement.parentNode.clientWidth
    let height = this.pixiElement.parentNode.clientHeight
    if (pagePreview) {
      // width = width - pagePreview.clientWidth;
    }

    if (this.props.step === ApplicationStep.EXPORT_PDF) {
      width = 595
      height = 842
    }

    return { width, height }
  }

  setupViews = () => {
    this.addMainStage()
    this.addLotBackground()
    this.addNorthIndicator()
  }

  addPixiApp = () => {
    const { width, height } = this.getDrawerDimensions()
    PIXI.settings.RESOLUTION = 1

    this.pixiApp = new PIXI.Application({
      width,
      height,
      backgroundColor: 0xffffff,
      antialias: true,
      autoResize: true,
      forceFXAA: true,
      forceCanvas: true
    })

    ViewSettings.instance.application = this.pixiApp

    this.pixiElement.appendChild(this.pixiApp.view)
  }

  addMainStage = () => {
    const { width, height } = this.getDrawerDimensions()
    let mainStage = this.canvasView
    this.canvasView.name = 'canvasView'
    // Create the lot view
    if (this.props.step === ApplicationStep.EXPORT_PDF) {
      mainStage = new PIXI.Container()
      mainStage.name = 'mainStage'
      ViewSettings.instance.stageResize(width, height)
      ViewSettings.instance.setTransform(width / 2, height / 2)
      mainStage.addChild(this.canvasView)
    }

    this.pixiApp.stage.addChild(mainStage)
  }

  updateStage = () => {
    const { stage, renderer } = this.pixiApp
    const {
      step,
      engineeringEnabled,
      heightVisualisationEnabled,
      threeDVisualisationEnabled,
      nearmapsVisualisationEnabled,
      drawerData: { siting }
    } = this.props

    let viewScale = this.props.drawerData.viewScale
    viewScale = parseFloat(viewScale)
    if (!isFinite(viewScale)) {
      console.log('resetting viewScale to 1')
      viewScale = 1
    }
    const { width, height } = this.getDrawerDimensions()
    const mainStage = stage.getChildByName('mainStage') || stage

    if (this.northIndicator) {
      this.northIndicator.x = width - this.northIndicator.size / 2 - 26
      this.northIndicator.y = height - 142
    }

    const lotBackground = mainStage.getChildByName('lotBackground')
    if (lotBackground) {
      if (this.props.step === ApplicationStep.EXPORT_PDF) {
        lotBackground.texture = siting.templateImage
          ? PIXI.Texture.from(siting.templateImage)
          : PIXI.Texture.WHITE

        lotBackground.width = width
        lotBackground.height = height
        lotBackground.x = width / 2 - lotBackground.width / 2
        lotBackground.y = height / 2 - lotBackground.height / 2
      } else {
        if (lotBackground.width !== width || lotBackground.height !== height) {
          lotBackground.width = width
          lotBackground.height = height
        }
      }
    }
    if (renderer.width !== width || renderer.height !== height) {
      renderer.resize(width, height)

      this.props.setDrawerData({ resizeTS: 1 })
    }

    // Center the canvasView in the window. All content will then be centred inside the canvasView automatically
    this.canvasView.resize(
      width * PIXI.settings.RESOLUTION,
      height * PIXI.settings.RESOLUTION
    )

    // When in the Export step, hide the Pixi view and show the SVG view instead
    if (step === ApplicationStep.EXPORT_PDF) {
      const clientWidth = this.pixiElement.clientWidth
      const clientHeight = clientWidth / this.aspectRatio

      if (clientWidth < 595) {
        renderer.view.style.width = `${clientWidth}px`
        renderer.view.style.height = `${clientHeight}px`
      } else {
        renderer.view.style.width = '595px'
        renderer.view.style.height = '842px'
      }

      // hide the Sitings view and show the SVG view
      this.canvasView.visible = false
      this.northIndicator.visible = false

      const props = this.props.drawerData.siting

      this.canvasSvgView.drawView(
        // Application view that provides render settings (scale & rotation)
        this.canvasView,
        // HTML div to draw into
        'export-preview',
        // selected page size, or A4 default
        props.page_size || PdfPage.SIZE_A4,
        // selected scale, or 1:200 default
        props.page_scale || 200
      )

      /**
       * @Yehor: you can Display the engineering overlay here.
       *
       * The engineering view doesn't need to have any template applied on top of it (like the 'lotBackground'
       *  that we show behind the 'export-preview' div.
       *
       * Below is the code you can use to render the engineering view to SVG in a new DIV:
       *
       */
      const model = CanvasModel.getModel()

      if (model.engineeringState && model.engineeringState.view) {
        // @INFO: you can use the same canvasSvgView to render to different divs as this class is
        // mostly stateless and draw() creates a fresh render each time
        this.canvasSvgView.drawView(
          // Application view that provides render settings (scale & rotation)
          model.engineeringState.view,
          // HTML div to draw into
          'engineering-preview',
          // selected page size, or A4 default
          props.page_size || PdfPage.SIZE_A4,
          // selected scale, or 1:200 default
          props.page_scale || 200
        )
      }
    } else {
      // show the Sitings view and hide the SVG view
      this.canvasView.visible = true
      this.northIndicator.visible = true
    }
    if (
      this.canvasView.viewScale !== viewScale &&
      !engineeringEnabled &&
      !heightVisualisationEnabled &&
      !threeDVisualisationEnabled &&
      !nearmapsVisualisationEnabled
    ) {
      console.log(
        'resetting viewScale and centering ',
        this.canvasView.viewScale,
        viewScale
      )
      this.canvasView.scaleAndCenter(viewScale)
    }

    this.checkRotation()
  }

  addLotBackground = () => {
    const { stage } = this.pixiApp
    const mainStage = stage.getChildByName('mainStage') || stage

    const lotBackground = new PIXI.Sprite(PIXI.Texture.WHITE)
    lotBackground.tint = 0xffffff
    lotBackground.name = 'lotBackground'
    mainStage.addChildAt(lotBackground, 0)
  }

  addNorthIndicator = () => {
    const { stage } = this.pixiApp
    const mainStage = stage.getChildByName('mainStage') || stage

    this.northIndicator.name = 'northIndicator'
    mainStage.addChild(this.northIndicator)
  }

  northRotationChanged = angle => {
    const { setDrawerData } = this.props

    setDrawerData({ northRotation: angle })
  }

  setSitingPage = v => {
    this.setState({ sitingPage: v })
  }

  checkRotation = (handleRotation = null, type = 'lot') => {
    const {
      drawerData: { rotation },
      drawerDetails: { drawerData }
    } = this.props

    // const houseRotation = _.get(this.props, 'drawerData.sitingSession.multiFloors.layers.0.rotation', null);
    const houseRotation = _.get(
      this.props,
      'drawerData.sitingSession.multiFloors.crtFloor.rotation',
      null
    )
    if (type === 'house' || (houseRotation && handleRotation === null)) {
      const viewRotation =
        handleRotation !== null && type === 'house'
          ? handleRotation
          : houseRotation !== null
          ? houseRotation
          : drawerData.houseRotation || 0

      const canvasModel = CanvasModel.getModel()

      if (canvasModel.multiFloors.crtFloor.rotation !== viewRotation) {
        canvasModel.multiFloors.setFloorRotation(viewRotation)
      }
    }

    if (type === 'lot' || (rotation && handleRotation === null)) {
      const viewRotation =
        handleRotation !== null
          ? handleRotation
          : rotation !== null
          ? rotation
          : drawerData.rotation || 0

      if (this.canvasView.viewRotation !== viewRotation) {
        this.canvasView.viewRotation = viewRotation
      }

      // Update the north indicator rotation
      let northRotation = parseFloat(this.props.drawerData.northRotation)
      if (!isFinite(northRotation)) {
        northRotation = 0
      }

      // update the north rotation
      this.northIndicator.angle = northRotation ? northRotation : viewRotation
    }
  }

  render () {
    const { step } = this.props
    if (this.state.hasError) {
      return 'Internal error'
    }

    const {
      drawerDetails,
      setDrawerData,
      drawerData: { restored }
    } = this.props

    const { drawerData } = this.props
    const { sitingPage } = this.state

    const canvasModel = CanvasModel.getModel()
    const pageAlignMode =
      step === ApplicationStep.ADD_MEASUREMENTS &&
      canvasModel.measurementsModel.currentMode ===
        MeasurementsLayerModel.MODE_PAGE_ALIGNMENT
    const disablePageAlignButtons =
      !pageAlignMode || canvasModel.measurementsModel.currentPoint === null

    let houseRotation = 0
    try {
      houseRotation = canvasModel.multiFloors.crtFloor.rotation
    } catch (e) {}
    houseRotation = Math.round((houseRotation + Number.EPSILON) * 100) / 100

    const northRotation = this.northIndicator ? this.northIndicator.angle : 0
    const alignPage = side => {
      canvasModel.measurementsModel.alignDirectionSelected(side)
      setDrawerData({
        rotation: this.canvasView.viewRotation,
        sitingSession: canvasModel.recordState()
      })
    }

    const model = CanvasModel.getModel()
    const isExport = step === ApplicationStep.EXPORT_PDF
    const hasEngineering = model.engineeringState && model.engineeringState.view
    const isEngineeringExport = isExport && hasEngineering

    return (
      <React.Fragment>
        <div
          className={classnames('lot-view', isExport && 'export')}
          ref={node => (this.pixiElement = node)}
        />

        {/* {restored && <SiteCoverage full={isExport} />} */}

        {isExport && (
          <div
            id='export-preview'
            className={classnames('export-preview', !sitingPage && 'hidden')}
          />
        )}

        {isExport && (
          <div
            id='engineering-preview'
            className={classnames(
              'export-preview',
              'solid',
              sitingPage && 'hidden'
            )}
          />
        )}

        {isEngineeringExport && (
          <div className='page-toggle'>
            <ToggleSwitch
              labelPosition='left'
              onClick={() => this.setSitingPage(!sitingPage)}
              text={{ on: 'Siting Page', off: 'Engineering Page' }}
              label={{ on: '', off: '' }}
              state={sitingPage}
              style={{ marginTop: '10px' }}
            />
          </div>
        )}

        {pageAlignMode && (
          <PageAlignButtons
            alignPage={alignPage}
            disabled={disablePageAlignButtons}
          />
        )}

        <LotControls
          houseRotation={houseRotation}
          northRotation={northRotation}
          checkRotation={this.checkRotation}
          step={step}
          canvasView={this.canvasView}
          drawerDetails={drawerDetails}
        />
      </React.Fragment>
    )
  }
}

const PageAlignButtons = ({ alignPage, disabled }) => {
  return (
    <div className={classnames('align-to-page', disabled && 'disabled')}>
      <button
        type='button'
        className='button transparent left'
        title='Align to Left'
        onClick={() => alignPage(MeasurementsLayerModel.DIRECTION_LEFT)}
      >
        <i className='landconnect-icon arrow-left' />
      </button>

      <button
        type='button'
        className='button transparent right'
        title='Align to Right'
        onClick={() => alignPage(MeasurementsLayerModel.DIRECTION_RIGHT)}
      >
        <i className='landconnect-icon arrow-right' />
      </button>

      <button
        type='button'
        className='button transparent top'
        title='Align to Top'
        onClick={() => alignPage(MeasurementsLayerModel.DIRECTION_UP)}
      >
        <i className='landconnect-icon arrow-left' />
      </button>

      <button
        type='button'
        className='button transparent bottom'
        title='Align to Bottom'
        onClick={() => alignPage(MeasurementsLayerModel.DIRECTION_DOWN)}
      >
        <i className='landconnect-icon arrow-right' />
      </button>
    </div>
  )
}

const SiteCoverage = ({ full }) => {
  const siteCalculator = CanvasModel.getModel().coverageCalculator
  siteCalculator.calculate()
  const houseAreas = CanvasModel.getModel().getHouseAreaBreakdown()

  const coverage = siteCalculator.siteCoverage

  const areas = [
    { label: 'Ground Floor', area: houseAreas.floor || 0 },
    { label: 'Garage', area: houseAreas.garage || 0 },
    { label: 'Porch', area: houseAreas.porch || 0 },
    { label: 'Alfresco', area: houseAreas.alfresco || 0 },
    { label: 'Options', area: siteCalculator.optionsArea },
    {
      label: 'Ext/Red',
      area: siteCalculator.transformArea + siteCalculator.structureArea
    }
    // {label: 'Grand Total', area: siteCalculator.sitedArea},
  ]

  return (
    <div className='site-coverage'>
      <table>
        <tbody>
          <tr>
            <th>
              <b>SITE COVERAGE</b>
            </th>
            <th>
              <b>{coverage.toFixed(2)}%</b>
            </th>
          </tr>

          {full &&
            areas.map((item, index) => (
              <tr key={index}>
                <td>{item.label}</td>
                <td>{item.area.toFixed(2)} m²</td>
              </tr>
            ))}

          <tr>
            <td>Total Footprint</td>
            <td>{siteCalculator.sitedArea.toFixed(2)} m²</td>
          </tr>
        </tbody>
      </table>

      {coverage > 60 && <SiteCoverageWarning />}
    </div>
  )
}

const LotControls = ({
  checkRotation,
  step,
  canvasView = {},
  houseRotation = 0,
  northRotation = 0
}) => {
  const pagePreview = document.querySelector('.page-preview')
  let leftMargin = 30

  if (pagePreview) {
    leftMargin = leftMargin + pagePreview.clientWidth
  }

  const [rotationDeg, setRotationDeg] = useState('20')

  useEffect(() => {}, [rotationDeg])

  return (
    <DrawerContext.Consumer>
      {({ state: { drawerData }, setDrawerData }) => {
        const { rotation, previewHeight } = drawerData

        const scaleModel = scale => {
          const viewScale =
            scale >= 0
              ? parseFloat(parseFloat(canvasView.viewScale) + 0.1).toFixed(1)
              : parseFloat(parseFloat(canvasView.viewScale) - 0.1).toFixed(1)
          if (viewScale <= 5 && viewScale >= 0.1) {
            setDrawerData({ viewScale })
          }
        }

        return (
          <div className='lot-controls'>
            {step === ApplicationStep.EXPORT_PDF && (
              <div className='north-indicator disabled'>
                <NorthIndicator angle={northRotation} />
              </div>
            )}

            <div
              className='control-pan'
              style={{
                bottom: `${previewHeight + 60}px`
              }}
            >
              <div className='circle-slider'>
                <CircularSlider
                  min={0}
                  max={360}
                  width={35}
                  direction={1}
                  appendToValue='°'
                  valueFontSize='10px'
                  progressSize={1}
                  trackSize={1}
                  knobSize={15}
                  trackColor='#eeeeee'
                  progressColorFrom='#1F65FF'
                  progressColorTo='#1F65FF'
                  labelColor='#1F65FF'
                  knobColor='#1F65FF'
                  label=' '
                  labelBottom={true}
                  onChange={value => {
                    if (value > 180) {
                      value = value - 360
                    }
                    if (
                      step === ApplicationStep.IMPORT_FLOOR_PLAN ||
                      step === ApplicationStep.ADD_EXTENSIONS ||
                      step === ApplicationStep.ADD_MEASUREMENTS
                    ) {
                      checkRotation(value, 'house')
                      const canvasModel = CanvasModel.getModel()
                      setDrawerData({
                        sitingSession: canvasModel.recordState()
                      })
                    } else if (step !== ApplicationStep.EXPORT_PDF) {
                      checkRotation(value)
                      setDrawerData({ rotation: value })
                    }
                  }}
                />
              </div>
              <img
                src={MagnifyingGlassPlus}
                width='16px'
                height='16px'
                onClick={() => {
                  scaleModel(5)
                }}
              />
              <img
                src={MagnifyingGlassMinus}
                width='16px'
                height='16px'
                onClick={() => {
                  scaleModel(-5)
                }}
              />
              <div className='cursor-wrap'>
                <img src={NavigationArrow} width='16px' height='16px' />
              </div>
            </div>
          </div>
        )
      }}
    </DrawerContext.Consumer>
  )
}

const Slider = ({ value, label, onSlideEnd, onUpdate }) => {
  return (
    <CompoundSlider
      min={-180}
      max={180}
      step={0.01}
      formatter={value => rotationFormatter(value, label, onUpdate)}
      values={[value || 0]}
      onSlideEnd={onSlideEnd}
      onUpdate={values => {
        onUpdate(values)
      }}
    />
  )
}

const NorthIndicator = ({ angle }) => (
  <svg
    width='40px'
    height='40px'
    viewBox='-20 -20 40 40'
    version='1.1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    style={{
      transform: `rotate(${(angle * Math.PI) / 180}rad)`
    }}
  >
    <g
      id='xxhdpi/ic_launcher_APP'
      stroke='none'
      strokeWidth='0'
      fill='none'
      fillRule='evenodd'
    >
      <circle id='circle' cx='0' cy='0' r='20' />
      <polygon
        id='arrow'
        fill='white'
        fillRule='nonzero'
        transform='translate(0, 0) rotate(0) translate(-72.205854, -72.205854) '
        points='65.2247503 79.6580073 72.2058539 64.7537005 79.1869576 79.6580073 72.2058539 75.9291345'
      />
    </g>
  </svg>
)

const SiteCoverageWarning = () => (
  <svg
    height='11'
    width='12.5'
    viewBox='0 0 627.769 550.45'
    version='1.0'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      id='path2231'
      fill='#ea0000'
      d='m614.57 504.94l-279.4-483.94c-4.38-7.588-12.47-12.262-21.23-12.262s-16.85 4.674-21.23 12.258l-279.41 483.94c-4.375 7.58-4.375 16.93 0.003 24.52 4.379 7.58 12.472 12.25 21.23 12.25h558.81c8.76 0 16.86-4.67 21.23-12.25 4.38-7.59 4.38-16.94 0-24.52z'
    />
    <polygon
      id='polygon2233'
      points='93.977 482.88 533.9 482.88 313.94 101.89'
      fill='#ea0000'
    />
    <path
      d='m291.87 343.36c1.21 11.49 3.21 20.04 6.02 25.66 2.81 5.63 7.82 8.43 15.04 8.43h2.01c7.22 0 12.24-2.8 15.04-8.43 2.81-5.62 4.82-14.17 6.02-25.66l6.42-88.75c1.21-17.3 1.81-29.71 1.81-37.25 0-10.25-2.91-18.25-8.73-23.99-5.53-5.46-13.38-8.59-21.56-8.59s-16.04 3.13-21.57 8.59c-5.81 5.74-8.72 13.74-8.72 23.99 0 7.54 0.6 19.95 1.8 37.25l6.42 88.75z'
      id='path2235'
      fill='#fff'
    />
    <circle cy='430.79' cx='313.94' r='30.747' id='circle2237' fill='#fff' />
  </svg>
)

function rotationFormatter (d, text, onUpdate) {
  return (
    <React.Fragment>
      {text}

      <input
        type='number'
        className='slider-value'
        onChange={e => {
          const value =
            parseFloat(e.target.value.slice(0, e.target.maxLength)) || 0
          if (e.target.value === '-') {
            onUpdate([-0])
          } else if (!isNaN(value)) {
            onUpdate([value])
          }
        }}
        maxLength={6}
        value={d}
      />

      <i className='landconnect-icon rotation' />
    </React.Fragment>
  )
}

const LotViewConsumer = props => (
  <DrawerContext.Consumer>
    {({
      state: { drawerData, currentStep },
      setDrawerData,
      saveDrawerData
    }) => (
      <LotView
        {...props}
        {...{
          drawerData,
          currentStep,
          setDrawerData,
          saveDrawerData
        }}
      />
    )}
  </DrawerContext.Consumer>
)

const LotViewInstance = connect(
  state => ({
    drawerDetails: state.sitingsDrawerDetails
  }),
  null
)(LotViewConsumer)

export default LotViewInstance

/**
 * North Indicator
 */
class InteractiveNorthIndicator extends PIXI.Sprite {
  constructor (size = 40, angle = 0) {
    super()

    this._angle = 0
    this.size = size

    // Draw graphics
    this.back = new PIXI.Graphics()
    this.back.beginFill(ThemeManager.i.theme.primary)
    this.back.lineStyle(1, 0, 0)
    this.back.drawCircle(0, 0, this.size / 2)
    this.back.endFill()

    this.symbol = new PIXI.Graphics()
    this.symbol.beginFill(0xffffff)
    this.symbol.moveTo(65.2247503, 79.6580073)
    this.symbol.lineTo(72.2058539, 64.7537005)
    this.symbol.lineTo(79.1869576, 79.6580073)
    this.symbol.lineTo(72.2058539, 75.9291345)
    this.symbol.lineTo(65.2247503, 79.6580073)
    this.symbol.endFill()
    this.symbol.x = -72.205854
    this.symbol.y = -72.205854

    this.symbolHolder = new PIXI.Sprite()

    // this.addChild(this.back)
    // this.addChild(this.symbolHolder)
    // this.symbolHolder.addChild(this.symbol)

    // rotate the symbol
    this.angle = angle

    // this.symbolHolder.interactiveChildren  = false;
    // this.symbolHolder.mouseChildren = false;

    this.interactive = true
    // this.interactiveChildren = false;
    this.buttonMode = true
    this.addListener(EventBase.CLICK, this.onSymbolClicked, this)
  }

  set angle (value) {
    this._angle = value
    this.symbolHolder.rotation = Geom.deg2rad(value)
  }
  get angle () {
    return this._angle
  }

  onSymbolClicked (event) {
    const position = this.toLocal(event.data.global)
    const angle = Geom.rad2deg(Math.atan2(position.y, position.x)) + 90

    this.angle = angle
    this.emit(EventBase.CHANGE, angle)
  }
}
