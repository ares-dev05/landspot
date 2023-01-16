import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep'
import { ToggleSwitch } from '~sitings~/helpers/ToggleSwitch'
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr'
import { DrawerContext } from '../DrawerContainer'
import * as actions from '../store/details/actions'
import StepNavigation from './StepNavigation'
import LotEdges from './sidebar/LotEdges'
import { ProgressBar } from '~sitings~/helpers'
import FileUploader from '~sitings~/helpers/file-uploader/FileUploader'
import { CompanyDataContext } from './CompanyDataContainer'
import uploadPng from './../../../../../img/upload.svg'
import FilepdfPng from './../../../../../img/FilePdf.svg'
import eyePng from './../../../../../img/Eye.svg'
import DotsThreePng from './../../../../../img/DotsThree.svg'

class DrawEdges extends Component {
  static componentUrl = '/sitings/drawer/:sitingId/edges'

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        sitingId: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    companyLoaded: PropTypes.bool.isRequired,
    traceEnabled: PropTypes.bool.isRequired,
    loadSitingDrawer: PropTypes.func.isRequired,
    setCurrentStep: PropTypes.func.isRequired,
    resetDrawerStore: PropTypes.func.isRequired,
    setApplicationStep: PropTypes.func.isRequired,
    setTraceMode: PropTypes.func.isRequired,
    setMetric: PropTypes.func.isRequired,
    loadSitingWithRef: PropTypes.func.isRequired,
    metric: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {
      uploadingReferenceFile: false,
      uploadingPercent: 0
    }
  }

  componentDidMount () {
    const {
      match: {
        params: { sitingId }
      },
      loadSitingDrawer,
      setCurrentStep,
      setApplicationStep,
      drawerData: { sitingSession },
      drawerDetails: { drawerData },
      location: { state },
      loadSitingWithRef
    } = this.props
    const page = drawerData ? drawerData.page : null

    if (!sitingSession || !page) {
      loadSitingDrawer({ sitingId }, { step: 'edges' })
    }

    if (state) loadSitingWithRef({ ...state.drawerData })

    setCurrentStep('DRAW_EDGES')
    setApplicationStep(ApplicationStep.TRACE_OUTLINE)
  }

  toggleTraceMode () {
    const { setTraceMode, traceEnabled } = this.props

    setTraceMode(!traceEnabled)
  }

  fileUploaded = uploadingFile => {
    const {
      drawerData,
      loadSitingWithRef,
      saveDrawerData
    } = this.props

    loadSitingWithRef({ sitingId: drawerData.sitingId })
    this.setState({
      [uploadingFile]: false,
      uploadingPercent: 0
    })

    saveDrawerData(2)
  }

  fileUploadError = (response, uploadingFile) => {
    if (response) {
      this.props.showErrors(response)
    }
    this.setState({
      [uploadingFile]: false,
      uploadingPercent: 0
    })
  }

  beforeUpload = uploadingFile => {
    this.setState({ [uploadingFile]: true })
  }

  fileUploadingProgress = progress => {
    this.setState({
      uploadingPercent: parseInt((progress.loaded / progress.total) * 100)
    })
  }

  componentDidUpdate (prevProps) {
    const {
        drawerData
      } = this.props
      if(drawerData.sitingId != undefined && drawerData.sitingId != null && drawerData.referencePlan == null) {
        // window.location.href = "https://localsunny.com/sitings/drawer/478/edges";
        // this.props.saveDrawerData(1)
      }
  }

  componentWillUnmount () {}

  render () {
    const {
      traceEnabled,
      metric,
      setMetric,
      drawerData,
      getPage,
      match: {
        params: { sitingId }
      },
    } = this.props

    const {
      uploadingReferenceFile,
      uploadingPercent
    } = this.state
    
    const hasTrace = AccountMgr.i.builder
      ? AccountMgr.i.builder.hasManualTracing
      : false

    return (
      <React.Fragment>
        <div className='filter-bar'>
          <div className='sitting-header'>
            <p className='letter'>Base Siting&nbsp;/&nbsp;</p>
            <p className='letter-bold'>Step 1</p>
            <div className='bar'></div>
          </div>
          <div className='filter-form'>

            <div className='first-row has-nav'>
              <span className='filters-header'>Lot boundaries</span>

              {!hasTrace &&
                <div className='toggle-metric'>
                    <ToggleSwitch
                        labelPosition="left"
                        onClick={() => setMetric(!metric)}
                        text={{on: 'Metric', off: 'Imperial'}}
                        label={{on: '', off: ''}}
                        state={metric}
                    />
                </div>
                }

                {hasTrace &&
                <button type="button" className='button default'
                        onClick={() => this.toggleTraceMode()}>
                    {traceEnabled ? 'Complete Trace' : 'Trace Lot'}
                </button>
                }
            </div>

            <div className='step-note'>
              <p>
                Create the boundaries for your lot. Upload a subplan to
                reference or trace, or manually enter the details of each
                boundary line below.
              </p>
            </div>

            {drawerData.referencePlan != null && <div className='file-block'>
              <span className='title'>Reference plan</span>
              <div className='file-picker-wrap'>
                <div className='document-wrap'>
                  <div className='pdf-image-wrap'>
                    <img src={FilepdfPng} />
                  </div>
                  <div className='detail-wrap'>
                    <span className='title'>{drawerData.referencePlan.name}</span>
                    <span className='info'>PDF 225kb</span>
                  </div>
                </div>
                <div className='tool-wrap'>
                  <img src={eyePng} />
                  <img src={DotsThreePng} />
                </div>
              </div>
            </div>}

            {drawerData.referencePlan == null && uploadingReferenceFile && (
                <ProgressBar
                  percent={uploadingPercent}
                  className='form-upload-button'
                />
              )}

            {drawerData.referencePlan == null && !uploadingReferenceFile && (
              <div className='wrap-upload'>
                <span>Reference plan</span>
                <FileUploader
                  className='form-row'
                  // baseUrl={`/sitings/drawer/${sitingId}/edges`}
                  baseUrl='/sitings/drawer/reference-plan'
                  acceptMime='application/pdf'
                  bodyFields={{ id: sitingId }}
                  fileFieldName={'image'}
                  chooseFileButton={
                    <div className='upload-button'>
                      <img src={uploadPng} />
                      Upload
                    </div>
                  }
                  beforeUpload={() =>
                    this.beforeUpload('uploadingReferenceFile')
                  }
                  uploadError={response =>
                    this.fileUploadError(
                      response,
                      'uploadingReferenceFile'
                    )
                  }
                  uploadSuccess={() =>
                    this.fileUploaded('uploadingReferenceFile')
                  }
                  onProgress={this.fileUploadingProgress}
                />
              </div>)}

            <LotEdges
              companyLoaded={true}
              traceEnabled={traceEnabled}
              metric={metric}
            />
          </div>
        </div>
        <StepNavigation saveState={true} />
      </React.Fragment>
    )
  }
}

const DrawerConsumer = props => (
  <CompanyDataContext.Consumer>
    {({
      setApplicationStep,
      setTraceMode,
      companyLoaded,
      traceEnabled,
      setMetric,
      metric
    }) => (
      <DrawerContext.Consumer>
        {({ state: { drawerData, currentTab }, setCurrentStep, getPage, saveDrawerData }) => (
          <DrawEdges
            {...props}
            {...{
              drawerData,
              currentTab,
              setCurrentStep,
              setApplicationStep,
              setTraceMode,
              companyLoaded,
              traceEnabled,
              setMetric,
              metric,
              saveDrawerData,
              getPage
            }}
          />
        )}
      </DrawerContext.Consumer>
    )}
  </CompanyDataContext.Consumer>
)

const DrawEdgesInstance = connect(
  state => ({
    drawerDetails: state.sitingsDrawerDetails
  }),
  actions
)(DrawerConsumer)

export { DrawEdgesInstance }

export default DrawEdges
