import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import FileUploader from '~sitings~/helpers/file-uploader/FileUploader'
import { ProgressBar } from '~sitings~/helpers'
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr'
import { ToggleSwitch } from '~sitings~/helpers/ToggleSwitch'
import { DrawerContext } from '../DrawerContainer'
import { CompanyDataContext } from './CompanyDataContainer'
import * as actions from '../store/details/actions'
import StepNavigation from './StepNavigation'
import LotEdges from './sidebar/LotEdges'
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';

import uploadPng from './../../../../../img/upload.svg'
import uploadhoverPng from './../../../../../img/upload-hover.svg'
import FilepdfPng from './../../../../../img/FilePdf.svg'
import eyePng from './../../../../../img/Eye.svg'
import DotsThreePng from './../../../../../img/DotsThree.svg'

class ReferencePlan extends Component {
  static componentUrl = '/sitings/drawer/reference-plan'

  static propTypes = {
    loadSitingWithRef: PropTypes.func.isRequired,
    setCurrentStep: PropTypes.func.isRequired,
    setDrawerData: PropTypes.func.isRequired,
    resetDrawerStore: PropTypes.func.isRequired,
    createNewSiting: PropTypes.func.isRequired,
    showErrors: PropTypes.func.isRequired,
    saveDrawerData: PropTypes.func.isRequired,
    userProfile: PropTypes.object,
    setApplicationStep: PropTypes.func.isRequired,
    setTraceMode: PropTypes.func.isRequired,
    setMetric: PropTypes.func.isRequired,
    loadSitingWithRef: PropTypes.func.isRequired,
    metric: PropTypes.bool.isRequired,
    companyLoaded: PropTypes.bool.isRequired,
    traceEnabled: PropTypes.bool.isRequired,
    loadSitingDrawer: PropTypes.func.isRequired,
  }

  constructor (props) {
    super(props)

    this.state = {
      uploadingReferenceFile: false,
      uploadingPercent: 0,
      loadSitingsDrawer: false,
      uploadBtnPng: uploadPng,
      menu: false,
      editable: false
    }
  }

  componentDidMount () {
    const {
      location: { state },
      loadSitingWithRef,
      createNewSiting
    } = this.props
    
    if (state) loadSitingWithRef({ ...state.drawerData })
    else createNewSiting()

    if (state) loadSitingWithRef({ ...state.drawerData })
  }

  toggleTraceMode () {
    const { setTraceMode, traceEnabled } = this.props

    setTraceMode(!traceEnabled)
  }

  fileUploaded = uploadingFile => {
    const {
      drawerDetails: { siting },
      loadSitingWithRef,
      saveDrawerData
    } = this.props

    loadSitingWithRef({ sitingId: siting.id })
    this.setState({
      [uploadingFile]: false,
      uploadingPercent: 0
    })
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
      drawerDetails: { siting },
      drawerDetails: { drawerData },
      loadSitingDrawer,
      drawerData: { sitingSession },
      setCurrentStep,
      setApplicationStep
    } = this.props

    const page = drawerData ? drawerData.page : null

    if (this.props.drawerDetails != prevProps.drawerDetails && siting != undefined && siting != null && this.state.loadSitingsDrawer == false) {
      if (!sitingSession || !page) {
        loadSitingDrawer({ sitingId: siting.id }, { step: 'edges' });
        this.setState({loadSitingsDrawer: true});
      }
      setCurrentStep('DRAW_EDGES')
      setApplicationStep(ApplicationStep.TRACE_OUTLINE)
    }
  }

  componentWillUnmount () {}

  render () {
    const {
      traceEnabled,
      metric,
      drawerDetails: { siting },
      drawerData,
      setDrawerData,
      currentTab,
      setMetric
    } = this.props

    const {
      uploadingReferenceFile,
      uploadingPercent
    } = this.state

    const plan = drawerData[currentTab];
    
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

                {/* {hasTrace &&
                  <div className='btn-primary default'
                          onClick={() => this.toggleTraceMode()}>
                      {traceEnabled ? 'Complete Trace' : 'Trace Lot'}
                  </div>
                } */}
              </div>

              <div className='step-note'>
                <p>
                  Create the boundaries for your lot. Upload a subplan to
                  reference or trace, or manually enter the details of each
                  boundary line below.
                </p>
              </div>

            {plan && <div className='file-block'>
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
                  <img src={DotsThreePng} onClick={() => {
                    this.setState({menu: !this.state.menu})
                  }}/>
                  <div className='menu' style={{
                    display: this.state.menu?'flex': 'none'
                  }}>
                    <div className='item' onClick={() => {
                      this.setState({editable: true})
                      this.setState({menu: false})
                    }}>Edit</div>
                    <div className='item'>Trace plan</div>
                    <div className='item' onClick={() => {
                      setDrawerData({referencePlan: null})
                      this.setState({menu: false})
                    }}>Delete</div>
                  </div>
                </div>
              </div>
            </div>}

            {plan == null && uploadingReferenceFile && (
                <ProgressBar
                  percent={uploadingPercent}
                  className='form-upload-button'
                />
              )}


            {/* {siting != undefined && ( */}
            {((plan == null && siting != undefined && !uploadingReferenceFile) || this.state.editable == true) && (
              <div className='wrap-upload'>
                <span>Reference plan</span>
                <FileUploader
                  className='form-row'
                  baseUrl='/sitings/drawer/reference-plan'
                  acceptMime='application/pdf'
                  bodyFields={{ id: siting.id}}
                  fileFieldName={'image'}
                  chooseFileButton={
                    <div className='upload-button'
                      onMouseEnter={() => {
                        this.setState({uploadBtnPng: uploadhoverPng})
                      }}
                      onMouseLeave={() => {
                        this.setState({uploadBtnPng: uploadPng})
                      }}>
                      <img src={this.state.uploadBtnPng} />
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
                  uploadSuccess={() => {
                    this.fileUploaded('uploadingReferenceFile')

                    this.setState({editable: false})
                  }
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

const ReferencePlanConsumer = props => (
  <CompanyDataContext.Consumer>
    {({
      setTraceMode,
      companyLoaded,
      traceEnabled,
      setApplicationStep,
      setMetric,
      metric
    }) => (
      <DrawerContext.Consumer>
        {({ state: { drawerData, currentTab },
      setCurrentStep,
      setDrawerData,
      resetDrawerData,
      showErrors,
      setupDrawerCallback,
      saveDrawerData,
      getPage, }) => (
          <ReferencePlan
            {...props}
            {...{
              setCurrentStep,
              setDrawerData,
              resetDrawerData,
              showErrors,
              setupDrawerCallback,
              saveDrawerData,
              getPage,
              drawerData, 
              currentTab, 
              setTraceMode,
              companyLoaded,
              traceEnabled,
              setApplicationStep,
              setMetric,
              metric
            }}
          />
        )}
      </DrawerContext.Consumer>
    )}
  </CompanyDataContext.Consumer>
)

const ReferencePlanInstance = connect(
  state => ({
    drawerDetails: state.sitingsDrawerDetails,
    userProfile: state.userProfile
  }),
  actions
)(ReferencePlanConsumer)

export { ReferencePlanInstance }

export default ReferencePlan