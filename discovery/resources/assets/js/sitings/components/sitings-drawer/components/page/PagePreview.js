import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import CompoundSlider from '~sitings~/helpers/CompoundSlider'
import ZoomButtons from './ZoomButtons'
import Pan from '~sitings~/helpers/Pan'
import { ResizableBox } from 'react-resizable'
import { DrawerContext, tabs } from '../../DrawerContainer'
import * as PIXI from 'pixi.js'
import SitingsTraceView from '~/sitings-sdk/src/sitings/view/trace/SitingsTraceView'
import CanvasModel from '../CanvasModel'
import ManipulationManager from '~/sitings-sdk/src/sitings/model/lot/trace/ManipulationManager'
import AlignEngineeringView from '~/sitings-sdk/src/sitings/view/engineering/AlignEngineeringView'
import { ToggleSwitch } from '~sitings~/helpers/ToggleSwitch'
import EnvelopeCanvasView from '~/sitings-sdk/src/sitings/view/envelope/EnvelopeCanvasView'
import CanvasView from '~/sitings-sdk/src/sitings/view/SitingsView'
import DisplayManager from '~/sitings-sdk/src/utils/DisplayManager'
import Lot3DView from '~/sitings-sdk/src/sitings/view/levels/3d/Lot3DView'
import LotSurfaceBuilder from '~/sitings-sdk/src/sitings/model/levels/3d/LotSurfaceBuilder'
import AccountMgr from '../../../../../sitings-sdk/src/sitings/data/AccountMgr'
import NearmapOverlayView from '../../../../../sitings-sdk/src/sitings/view/nearmaps/NearmapOverlayView'
import NearmapModel from '../../../../../sitings-sdk/src/sitings/model/nearmap/NearmapModel'
import EventBase from '../../../../../sitings-sdk/src/events/EventBase'
import ViewSettings from '../../../../../sitings-sdk/src/sitings/global/ViewSettings'
import Utils from '../../../../../sitings-sdk/src/utils/Utils'
import CarrotUp from '~/../img/CarrotUp.svg'
import CarrotDown from '~/../img/CarrotDown.svg'
import XPng from '~/../img/X.svg'

class PagePreview extends Component {
  static propTypes = {
    page: PropTypes.object,
    currentTab: PropTypes.string,
    traceEnabled: PropTypes.bool.isRequired,
    engineeringEnabled: PropTypes.bool,
    heightVisualisationEnabled: PropTypes.bool,
    threeDVisualisationEnabled: PropTypes.bool,
    nearmapsVisualisationEnabled: PropTypes.bool,
    setEngineeringMode: PropTypes.func,
    setTab: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.canvasTraceView = null
    this.alignEngineeringView = null
    this.envelopeCanvasView = null
    this.nearmapView = null
    this.pixiApp = null
    this.pixiElement = null
    /**
     * @type {Lot3DView}
     */
    this.lot3DView = null

    this.state = {
      resizeTS: 0,
      resetPage: false,
      rotation: 0,
      scale: 1,
      planScale: 1,
      moveSetting: false,
      currentView: 'referenceView',
      // nearmap settings
      nearmapAutoPlacement: false,
      nearmapLocation: null,
      height: this.props.drawerData.previewHeight
    }
  }

  setEnvelopeZoom = v => {
    const canvasModel = CanvasModel.getModel()
    const canvasView = new CanvasView(canvasModel)
    const { setDrawerData } = this.props
    const viewScale =
      v >= 0
        ? parseFloat(parseFloat(canvasView.viewScale) + 0.1).toFixed(1)
        : parseFloat(parseFloat(canvasView.viewScale) - 0.1).toFixed(1)
    setDrawerData({ viewScale })
  }

  setNearmapZoom = v => {
    const canvasModel = CanvasModel.getModel()
    canvasModel.nearmapModel.zoom += v > 0 ? 1 : -1
  }

  componentDidMount () {
    let { resizeTS } = this.state
    const { getPage } = this.props

    const page = getPage()

    if (page) {
      this.setState({
        resizeTS: ++resizeTS,
        height: this.props.drawerData.previewHeight
      })
    }

    this.addNearmapModelListener()
  }

  componentWillUnmount () {
    this.removeNearmapModelListener()
  }

  addNearmapModelListener () {
    const { nearmapModel } = CanvasModel.getModel()
    if (nearmapModel) {
      nearmapModel.addEventListener(
        EventBase.CHANGE,
        this.onNearmapModelChanged,
        this
      )
    }

    // Also set initial state
    this.setState({
      nearmapLocation: nearmapModel.location,
      nearmapAutoPlacement: nearmapModel.autoPlacement
    })
  }

  removeNearmapModelListener () {
    const { nearmapModel } = CanvasModel.getModel()
    if (nearmapModel) {
      nearmapModel.removeEventListener(
        NearmapModel.LOCATION_CHANGE,
        this.onNearmapModelChanged,
        this
      )
    }
    if (this.nearmapView) {
      this.nearmapView.cleanup()
      this.nearmapView = null
    }
  }

  onNearmapModelChanged () {
    const { nearmapModel } = CanvasModel.getModel()

    // only one item will change at a time
    if (nearmapModel.location !== this.state.nearmapLocation) {
      this.setState({ nearmapLocation: nearmapModel.location })
    }
    if (nearmapModel.autoPlacement !== this.state.nearmapAutoPlacement) {
      this.setState({ nearmapAutoPlacement: nearmapModel.autoPlacement })
    }
  }

  componentDidUpdate (prevProps) {
    const { resetPage } = this.state
    const {
      getPage,
      traceEnabled,
      currentTab,
      engineeringEnabled,
      heightVisualisationEnabled,
      threeDVisualisationEnabled,
      nearmapsVisualisationEnabled,
      setDrawerData
    } = this.props

    const page = getPage()

    if (
      prevProps.nearmapsVisualisationEnabled !== nearmapsVisualisationEnabled &&
      !nearmapsVisualisationEnabled
    ) {
      this.saveNearmapOverlay()
    }

    switch (currentTab) {
      case tabs.REFERENCE.id: {
        if (this.canvasTraceView) {
          this.canvasTraceView.pdfPage = page
        }
        break
      }
      case tabs.ENGINEERING.id: {
        let state = null

        if (
          prevProps.engineeringEnabled !== engineeringEnabled &&
          engineeringEnabled
        ) {
          state = this.enableEngineeringView()

          if (this.alignEngineeringView) {
            this.alignEngineeringView.pdfPage = page

            if (
              state &&
              !heightVisualisationEnabled &&
              !threeDVisualisationEnabled &&
              !nearmapsVisualisationEnabled
            ) {
              this.alignEngineeringView.restoreEngineeringState(state)
              const view = this.alignEngineeringView

              // @TODO: change to window.requestAnimationFrame
              setTimeout(function () {
                view.viewScale = state.s - 0.0001
                view.viewScale = state.s
                setDrawerData({ viewScale: view.viewScale })
              }, 50)
            }
          }
        }
        break
      }
      case tabs.HEIGHT_VISUALISATION.id: {
        if (
          prevProps.heightVisualisationEnabled !== heightVisualisationEnabled &&
          heightVisualisationEnabled
        ) {
          this.enableEnvelopeCanvasView()
        }
        break
      }
      case tabs.THREE_D_VISUALISATION.id: {
        if (
          prevProps.threeDVisualisationEnabled !== threeDVisualisationEnabled &&
          threeDVisualisationEnabled
        ) {
          this.enableThreeDVisualisation()
        }
        break
      }
      case tabs.NEARMAPS_VISUALISATION.id: {
        if (
          prevProps.nearmapsVisualisationEnabled !==
            nearmapsVisualisationEnabled &&
          nearmapsVisualisationEnabled
        ) {
          this.enableNearmapsOverlay()
        }
        break
      }
    }

    // Manual trace mode
    if (prevProps.traceEnabled !== traceEnabled) {
      this.enableTraceView(traceEnabled)
    }

    if (resetPage) {
      this.setState({ resetPage: false })
    }
  }

  /**
   * @returns {null|PIXI.Application}
   */
  getPixiApp () {
    if (!this.pixiElement) {
      return null
    }

    // Create the pixi app if this is the first time when the trace is being enabled
    if (!this.pixiApp) {
      // Create a PIXI renderer
      const width = this.pixiElement.parentNode.clientWidth
      const height = this.pixiElement.parentNode.clientHeight

      this.pixiApp = new PIXI.Application({
        width,
        height,
        transparent: true,
        antialias: true,
        autoResize: true,
        forceFXAA: true,
        forceCanvas: true
      })

      this.pixiElement.appendChild(this.pixiApp.view)
    }

    return this.pixiApp
  }

  enableTraceView (traceEnabled) {
    const pixiApp = this.getPixiApp()

    if (pixiApp) {
      if (!this.canvasTraceView) {
        this.canvasTraceView = new SitingsTraceView(
          CanvasModel.getModel(),
          this.pixiApp
        )
      }

      // Enable trace
      if (traceEnabled) {
        this.pixiApp.stage.removeChildren()
        this.pixiApp.stage.addChild(this.canvasTraceView)

        ManipulationManager.i.start()
        this.canvasTraceView.onOpen()
        this.resizeCurrentView(true)
      } else {
        ManipulationManager.i.applyToAllEdges()
      }
    }
  }

  enableEnvelopeCanvasView () {
    const pixiApp = this.getPixiApp()

    if (pixiApp) {
      if (!this.envelopeCanvasView) {
        this.envelopeCanvasView = new EnvelopeCanvasView(
          CanvasModel.getEnvelopeModel(),
          this.pixiApp
        )
      }

      this.pixiApp.stage.removeChildren()
      this.pixiApp.stage.addChild(this.envelopeCanvasView)

      this.clear3DVisualisation()

      this.envelopeCanvasView.onOpen()

      this.resizeCurrentView(true)
    }

    this.alignEngineeringView.onExit()
  }

  clear3DVisualisation () {
    if (this.lot3DView) {
      this.lot3DView.container = null
    }
  }

  enableThreeDVisualisation () {
    if (!this.pixiElement) {
      return null
    }

    const width = Math.max(this.pixiElement.parentNode.clientWidth, 640)
    const height = Math.max(this.pixiElement.parentNode.clientHeight, 480)

    const envelope = CanvasModel.getEnvelopeModel()
    const builder = envelope.surfaces
    builder.recalculate(LotSurfaceBuilder.DEFAULT_SCALE_UP)

    if (!this.lot3DView) {
      this.lot3DView = new Lot3DView(builder, width, height)
    } else {
      this.lot3DView.resize(width, height)
    }

    // this.lot3DView.addSurface(surface);
    this.lot3DView.container = this.pixiElement

    // update displayed surface
    this.lot3DView.surfaceModeChanged()
  }

  enableNearmapsOverlay () {
    /*
        const map = L.map(this.pixiElement).setView([51.505, -0.09], 19);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        */

    const { nearmapsVisualisationEnabled } = this.props
    const pixiApp = this.getPixiApp()
    const canvasModel = CanvasModel.getModel()

    let state

    if (pixiApp) {
      canvasModel.advancedMode = true

      if (!this.nearmapView) {
        this.nearmapView = new NearmapOverlayView(canvasModel, this.pixiApp)
      }

      // state = this.nearmapView.engineeringState;

      // Enable engineering
      if (nearmapsVisualisationEnabled) {
        // @TODO: refactor this whole block
        this.nearmapView.waitNoSave = true
        this.pixiApp.stage.removeChildren()
        this.pixiApp.stage.addChild(this.nearmapView)

        canvasModel.nearmapModel.pixiApp = this.pixiApp

        this.clear3DVisualisation()

        this.nearmapView.onOpen()
        // this.canvasTraceView.onOpen();
        this.resizeCurrentView(true)

        const view = this.nearmapView
        const newScale = DisplayManager.i.viewScale
        setTimeout(
          function (newScale) {
            // view.viewScale = newScale;
            view.setViewScale()
          },
          50,
          newScale
        )
        this.setState({ scale: newScale })

        // this.nearmapView.restoreEngineeringState();
        this.nearmapView.waitNoSave = false
      } else {
        this.nearmapView.onExit()
      }
    }

    return state
  }

  // @TODO @REFACTOR: cleanup this function call
  saveNearmapOverlay () {
    if (!this.nearmapView || !this.nearmapView.nearmapModel.location) {
      return
    }

    const W = this.nearmapView.sizedWidth,
      H = this.nearmapView.sizedHeight
    const mainStage = this.nearmapView // this.pixiApp.stage.getChildByName('nearmapView');

    // create a mask for the rendering
    const mask = new PIXI.Graphics()
    mask.beginFill(1, 1)
    mask.drawRect(0, 0, W, H)
    mainStage.parent.mask = mask

    const lotBackground = this.pixiApp.renderer.extract.canvas(mainStage.parent)

    const canvas = document.createElement('canvas')
    canvas.width = H // lotBackground.width;
    canvas.height = W // lotBackground.height;
    const ctx = canvas.getContext('2d')

    ctx.save()
    ctx.translate(H / 2, W / 2)
    ctx.rotate(Math.PI / 2)
    ctx.translate(-W / 2, -H / 2)
    ctx.drawImage(
      lotBackground,
      0,
      0,
      lotBackground.width,
      lotBackground.height
    )
    ctx.restore()

    // remove the mask
    mainStage.parent.mask = null

    canvas.toBlob(
      function (b) {
        // const image = document.createElement('img');
        const reader = new FileReader()
        reader.addEventListener('loadend', () => {
          const model = CanvasModel.getModel()
          // @TODO @TEMP @UPGRADE
          model.nearmapRender = reader.result
          model.nearmapWidth = canvas.width
          model.nearmapHeight = canvas.height
          // image.src = reader.result;
          // document.body.appendChild(image);
        })

        if (b instanceof Blob) reader.readAsDataURL(b)
      },
      'image/png',
      1
    )
  }

  enableEngineeringView () {
    const { engineeringEnabled } = this.props
    const pixiApp = this.getPixiApp()
    const canvasModel = CanvasModel.getModel()

    let state

    if (pixiApp) {
      canvasModel.advancedMode = true

      if (!this.alignEngineeringView) {
        this.alignEngineeringView = new AlignEngineeringView(
          canvasModel,
          this.pixiApp
        )
      }

      state = this.alignEngineeringView.engineeringState

      // Enable engineering
      if (engineeringEnabled) {
        this.alignEngineeringView.waitNoSave = true
        this.pixiApp.stage.removeChildren()
        this.pixiApp.stage.addChild(this.alignEngineeringView)

        this.clear3DVisualisation()

        this.alignEngineeringView.onOpen()
        // this.canvasTraceView.onOpen();
        this.resizeCurrentView(true)

        if (state) {
          this.setState({
            rotation: state.r,
            scale: state.s,
            planScale: state.hasOwnProperty('ps') ? state.ps : 1
          })
        } else {
          const view = this.alignEngineeringView
          const newScale = DisplayManager.i.viewScale === 1 ? 1.1 : 1
          setTimeout(
            function (newScale) {
              view.viewScale = newScale
            },
            50,
            newScale
          )
          this.setState({ scale: newScale, planScale: 1 })
        }

        this.alignEngineeringView.restoreEngineeringState()
        this.alignEngineeringView.waitNoSave = false
      } else {
        this.alignEngineeringView.onExit()
      }
    }

    return state
  }

  /**
   * Resize the PIXI view to the new dimensions (if available)
   */
  resizeCurrentView (forceResize = false) {
    if (!this.pixiApp) {
      // nothing to resize
      return
    }

    const { renderer } = this.pixiApp
    const pagePreview = document.querySelector('.page-preview')
    const width = pagePreview.clientWidth
    const height = pagePreview.clientHeight

    if (renderer.width !== width || renderer.height !== height || forceResize) {
      renderer.resize(width, height - this.props.previewHeight)

      /// Center the canvasView in the window. All content will then be centred inside the canvasView automatically
      if (this.pixiApp.stage.children.length) {
        const currentView = this.pixiApp.stage.getChildAt(0)
        if (currentView)
          try {
            currentView.resize(
              width * PIXI.settings.RESOLUTION,
              height * PIXI.settings.RESOLUTION
            )
          } catch (e) {
            // @TODO
          }
      }
    }
  }

  setZoom = v => {
    let { resizeTS } = this.state
    let {
      drawerData: { zoom },
      setDrawerData
    } = this.props
    zoom = v === 0 ? 100 : zoom + v

    if (zoom >= 10 && zoom <= 200) {
      setDrawerData({ zoom })
      this.setState({
        resizeTS: ++resizeTS
      })
    }
  }

  setTraceZoom = v => {
    this.setZoom(v)
  }

  setMoveToggle = v => {
    this.setState({ moveSetting: v })

    const { engineeringEnabled, nearmapsVisualisationEnabled } = this.props

    if (engineeringEnabled && this.alignEngineeringView) {
      this.alignEngineeringView.moveSiting = v
    }
    if (nearmapsVisualisationEnabled && this.nearmapView) {
      this.nearmapView.moveSiting = v
    }
  }

  render () {
    const { measurementsModel, nearmapModel } = CanvasModel.getModel()
    const {
      traceEnabled,
      engineeringEnabled,
      setEngineeringMode,
      setPreviewHeight,
      setDrawerData,
      drawerData,
      currentTab,
      setTab,
      heightVisualisationEnabled,
      threeDVisualisationEnabled,
      nearmapsVisualisationEnabled,
      showTestEnvelope,
      show3DLandSurvey,
      showNearmapsOverlay,
      showErrors,
      oldViewScale,
      getPage
    } = this.props
    let {
      resizeTS,
      resetPage,
      rotation,
      scale,
      planScale,
      moveSetting,
      nearmapLocation,
      nearmapAutoPlacement
    } = this.state

    const page = getPage()

    // indicates if any of the advanced modes are currently opened
    const inAdvancedMode =
      engineeringEnabled ||
      heightVisualisationEnabled ||
      threeDVisualisationEnabled ||
      nearmapsVisualisationEnabled

    // indicates if trace view is currently disabled
    const traceViewDisabled = !traceEnabled && !inAdvancedMode

    const hasAdvancedFeatures =
      AccountMgr.i.builder && AccountMgr.i.builder.hasAdvancedFeatures
    const hasHeightEnvelope =
      AccountMgr.i.builder && AccountMgr.i.builder.hasHeightEnvelope
    const hasNearmapOverlay =
      AccountMgr.i.builder && AccountMgr.i.builder.hasNearmapOverlay

    const hasNearmapLocation = nearmapLocation !== null
    const hasNearmapControls =
      nearmapsVisualisationEnabled &&
      hasNearmapLocation &&
      !nearmapAutoPlacement

    const maxHeight =
      document.getElementsByClassName('right-panel')[0].offsetHeight

    return (
      <ResizableBox
        className='page-preview'
        onResize={(event, dimensions) => {
          //   this.setState({resizeTS: --resizeTS});
          //   setDrawerData({resizeTS: --resizeTS});
          setDrawerData({
            ...oldViewScale,
            previewHeight: dimensions.size.height
          })
          this.resizeCurrentView()
        }}
        resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
        minConstraints={[0, 0]}
        width={0}
        height={this.props.drawerData.previewHeight}
        axis='y'
      >
        <React.Fragment>
          {(heightVisualisationEnabled ||
            (nearmapsVisualisationEnabled && hasNearmapLocation)) && (
            <ZoomButtons
              setZoom={
                heightVisualisationEnabled
                  ? this.setEnvelopeZoom
                  : this.setNearmapZoom
              }
              disabled={false}
            />
          )}
          {nearmapsVisualisationEnabled && hasNearmapLocation && (
            <div className='nearmap-copyright'>
              <img src='/sitings/assets/textures/nearmap.png' />
              <span className='attribution'>Imagery © 2022 Nearmap</span>
            </div>
          )}

          {nearmapsVisualisationEnabled && !hasNearmapLocation && (
            <div className='nearmap-block'>
              <div className='nearmap-placeholder'>
                <img src='/sitings/assets/textures/nearmap.svg' />

                <span className='text'>
                  Enter an address and select a location to begin
                </span>
                <span className='attribution'>Imagery © 2022 Nearmap</span>
              </div>
            </div>
          )}

          {traceViewDisabled && (
            <div className={classnames('image', !page && 'cross')}>
              {page && (
                <React.Fragment>
                  <Pan
                    resizeTS={resizeTS}
                    resetPage={resetPage}
                    zoom={drawerData.zoom}
                  >
                    <img
                      src={page.image}
                      height={(page.height * drawerData.zoom) / 100}
                      width={(page.width * drawerData.zoom) / 100}
                      crossOrigin='anonymous'
                      alt={page.name}
                    />
                  </Pan>

                  <ZoomButtons setZoom={this.setZoom} disabled={false} />
                </React.Fragment>
              )}
            </div>
          )}
          <div>
            <div
              className={classnames(
                'trace-view',
                traceViewDisabled && 'disabled'
              )}
              ref={node => (this.pixiElement = node)}
            />
            {traceEnabled && (
              <ZoomButtons setZoom={this.setTraceZoom} disabled={false} />
            )}
            {(engineeringEnabled || hasNearmapControls) &&
              !heightVisualisationEnabled &&
              !threeDVisualisationEnabled && (
                <div
                  className='sitings-sliders'
                  style={{
                    left: '30px',
                    background: 'white',
                    padding: '15px 10px 0',
                    border: '1px solid #ccc',
                    width: '800px'
                  }}
                >
                  <div className='btn-group' style={{ display: 'block' }}>
                    <ToggleSwitch
                      labelPosition='left'
                      onClick={() => this.setMoveToggle(!moveSetting)}
                      text={{
                        on: 'Move Siting',
                        off: engineeringEnabled ? 'Move Workspace' : 'Move Map'
                      }}
                      label={{ on: '', off: '' }}
                      state={moveSetting}
                      style={{ marginTop: '10px' }}
                    />

                    <span>
                      &nbsp;&nbsp;&nbsp;(You can also use the Arrow Keys to
                      move)
                    </span>

                    {engineeringEnabled && (
                      <button
                        type='button'
                        style={{ float: 'right' }}
                        className={classnames('button', 'default')}
                        onClick={() => {
                          setEngineeringMode ? setEngineeringMode(false) : {}
                          setDrawerData({ ...oldViewScale, previewWidth: 300 })
                        }}
                      >
                        Exit to Siting
                      </button>
                    )}
                  </div>

                  {engineeringEnabled && (
                    <React.Fragment>
                      <Slider
                        value={planScale || null}
                        label='PLAN SCALE'
                        min={0.01}
                        max={5}
                        step={0.001}
                        formatter={scaleFormatter}
                        onSlideEnd={values => {
                          const planScale = values[0]
                          if (this.alignEngineeringView) {
                            this.alignEngineeringView.planScale = planScale
                          }
                          this.setState({ planScale })
                        }}
                        onUpdate={values => {
                          const planScale = values[0]
                          if (this.alignEngineeringView) {
                            this.alignEngineeringView.planScale = planScale
                          }
                          this.setState({ planScale })
                        }}
                      />

                      <Slider
                        value={scale || null}
                        label='SITING SCALE'
                        min={0.01}
                        max={5}
                        step={0.001}
                        formatter={scaleFormatter}
                        onSlideEnd={values => {
                          const scale = values[0]
                          if (this.alignEngineeringView) {
                            this.alignEngineeringView.viewScale = scale
                          }
                          setDrawerData({ viewScale: scale })
                          this.setState({ scale })
                        }}
                        onUpdate={values => {
                          const scale = values[0]
                          if (this.alignEngineeringView) {
                            this.alignEngineeringView.viewScale = scale
                          }
                          setDrawerData({ viewScale: scale })
                          this.setState({ scale })
                        }}
                      />
                    </React.Fragment>
                  )}

                  <Slider
                    value={rotation || null}
                    label='SITING ROTATION'
                    formatter={rotationFormatter}
                    onSlideEnd={values => {
                      const rotation = values[0]
                      if (engineeringEnabled && this.alignEngineeringView) {
                        this.alignEngineeringView.viewRotation = rotation
                      }
                      if (nearmapsVisualisationEnabled && this.nearmapView) {
                        this.nearmapView.viewRotation = rotation
                      }
                      this.setState({ rotation })
                    }}
                    onUpdate={values => {
                      const rotation = values[0]
                      if (engineeringEnabled && this.alignEngineeringView) {
                        this.alignEngineeringView.viewRotation = rotation
                      }
                      if (nearmapsVisualisationEnabled && this.nearmapView) {
                        this.nearmapView.viewRotation = rotation
                      }
                      this.setState({ rotation })
                    }}
                  />
                </div>
              )}
          </div>
          <div className='page-preview-tabs'>
            <React.Fragment>
              <span className='pdf-name'>
                {drawerData.referencePlan != null
                  ? drawerData.referencePlan.name
                  : 'Loading...'}
              </span>
              <div className='tool-wrap'>
                {this.props.drawerData.previewHeight < maxHeight && (
                  <img
                    src={CarrotUp}
                    onClick={() => {
                      setDrawerData({
                        ...oldViewScale,
                        previewHeight: maxHeight
                      })
                    }}
                  />
                )}
                {this.props.drawerData.previewHeight == maxHeight && (
                  <img
                    src={CarrotDown}
                    onClick={() => {
                      setDrawerData({
                        ...oldViewScale,
                        previewHeight: 0
                      })
                    }}
                  />
                )}
                <img src={XPng} />
              </div>
            </React.Fragment>
          </div>
        </React.Fragment>
      </ResizableBox>
    )
  }
}

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

function scaleFormatter (d, text, onUpdate) {
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

      <i className='landconnect-icon search' />
    </React.Fragment>
  )
}

const Slider = ({
  value,
  label,
  onSlideEnd,
  onUpdate,
  formatter,
  min = -180,
  max = 180,
  step = 0.01
}) => {
  return (
    <CompoundSlider
      min={min}
      max={max}
      step={step}
      formatter={value => formatter(value, label, onUpdate)}
      values={[value || 0]}
      onSlideEnd={onSlideEnd}
      onUpdate={values => {
        onUpdate(values)
      }}
    />
  )
}

const PagePreviewConsumer = props => (
  <DrawerContext.Consumer>
    {({
      setDrawerData,
      state: { currentTab, drawerData },
      setTab,
      setPreviewHeight,
      getPage,
      showErrors
    }) => (
      <PagePreview
        {...props}
        {...{
          showErrors,
          setDrawerData,
          currentTab,
          setTab,
          setPreviewHeight,
          drawerData,
          getPage
        }}
      />
    )}
  </DrawerContext.Consumer>
)

export default PagePreviewConsumer
