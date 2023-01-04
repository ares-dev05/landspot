import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { LeftPanel, RightPanel } from '~sitings~/helpers/Panels'
import FileUploader from '~sitings~/helpers/file-uploader/FileUploader'
import { ProgressBar } from '~sitings~/helpers'
import { DrawerContext, tabs } from '../DrawerContainer'
import { CompanyDataContext } from './CompanyDataContainer'
import * as actions from '../store/details/actions'
import PagePreview from './page/PagePreview'
import StepNavigation from './StepNavigation'
import Builder from '~/sitings-sdk/src/sitings/data/Builder'
import uploadPng from './../../../../../img/upload.svg'
import FilepdfPng from './../../../../../img/FilePdf.svg'
import eyePng from './../../../../../img/Eye.svg'
import DotsThreePng from './../../../../../img/DotsThree.svg'
import LotEdges from './sidebar/LotEdges'

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
    currentStep: PropTypes.object,
    userProfile: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      uploadingReferenceFile: false,
      uploadingEngineeringFile: false,
      uploadingPercent: 0
    }
  }

  componentDidMount () {
    const {
      location: { state },
      setCurrentStep,
      loadSitingWithRef,
      createNewSiting
    } = this.props

    if (state) loadSitingWithRef({ ...state.drawerData })
    else createNewSiting()

    setCurrentStep('REF_PLAN_SELECT')
  }

  componentDidUpdate(prevProps) {
    if (this.props.drawerData !== prevProps.drawerData) {
        try {
            if (this.props.drawerData.referencePlan.name != undefined || this.props.drawerData.referencePlan.name != null) {
                // this.props.setDrawerData(this.props.drawerData);
                this.props.saveDrawerData(2);
            }
        } catch(e) {
            console.log('e', e)
        }
    }
}

  componentWillUnmount () {
    this.props.resetDrawerStore()
  }

  setPage = page => {
    const { setDrawerData, currentTab } = this.props
    if (currentTab === tabs.REFERENCE.id) {
      setDrawerData({ referencePage: page, zoom: 100 })
    }
    if (currentTab === tabs.ENGINEERING.id) {
      setDrawerData({ engineeringPage: page, zoom: 100 })
    }
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

    console.log('= fileUploaded =')
    saveDrawerData(currentStep + 1)
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

  render () {
    const {
      drawerDetails: { siting },
      drawerData,
      currentTab,
      userProfile,
      saveDrawerData,
      currentStep
    } = this.props
    const {
      uploadingReferenceFile,
      uploadingEngineeringFile,
      uploadingPercent
    } = this.state

    const plan = drawerData[currentTab]

    let hasEngineering = false
    if (
      userProfile &&
      userProfile.company &&
      ((userProfile.user &&
        Builder.fromName(userProfile.company.builder_id).hasEngineeringInState(
          userProfile.user.state_id
        )) ||
        userProfile.company.builder_id.toUpperCase() === Builder.DEFAULT.name ||
        userProfile.company.builder_id.toUpperCase() === Builder.HENLEY.name ||
        userProfile.company.builder_id.toUpperCase() ===
          Builder.HENLEY_SA.name ||
        userProfile.company.builder_id.toUpperCase() ===
          Builder.PLANTATION.name ||
        userProfile.company.builder_id.toUpperCase() ===
          Builder.FIRSTPLACE.name ||
        userProfile.company.builder_id.toUpperCase() ===
          Builder.ARLI_HOMES.name ||
        userProfile.company.builder_id.toUpperCase() === Builder.BOLD.name ||
        userProfile.company.builder_id.toUpperCase() ===
          Builder.RAWDONHILL.name)
    ) {
      hasEngineering = true
    }

    return (
      <React.Fragment>
        <LeftPanel className='sidebar'>
          <div className='filter-bar'>
            <div className='sitting-header'>
              <p className='letter'>Base Siting&nbsp;/&nbsp;</p>
              <p className='letter-bold'>Step 1</p>
              <div className='bar'></div>
            </div>
            <div className='filter-form'>
              <div className='first-row has-nav'>
                <span className='filters-header'>Lot boundaries</span>
              </div>

              <div className='step-note'>
                <p>
                  Create the boundaries for your lot. Upload a subplan to
                  reference or trace, or manually enter the details of each
                  boundary line below.
                </p>
              </div>

              {siting && (
                <React.Fragment>
                  <div className='form-rows form-upload'>
                    <div className='form-row form-upload-container'>
                      {plan && (
                        <div className='file-block'>
                          <span className='title'>Reference plan</span>
                          <div className='file-picker-wrap'>
                            <div className='document-wrap'>
                              <div className='pdf-image-wrap'>
                                <img src={FilepdfPng} />
                              </div>
                              <div className='detail-wrap'>
                                <span className='title'>{plan.name}</span>
                                <span className='info'>PDF 225kb</span>
                              </div>
                            </div>
                            <div className='tool-wrap'>
                              <img src={eyePng} />
                              <img src={DotsThreePng} />
                            </div>
                          </div>
                        </div>
                      )}
                      {plan == null && uploadingReferenceFile && (
                        <ProgressBar
                          percent={uploadingPercent}
                          className='form-upload-button'
                        />
                      )}
                      {plan == null && !uploadingReferenceFile && (
                        <div className='wrap-upload'>
                          <span>Reference plan</span>
                          <FileUploader
                            className='form-row'
                            baseUrl='/sitings/drawer/reference-plan'
                            acceptMime='application/pdf'
                            bodyFields={{ id: siting.id }}
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
                        </div>
                      )}
                    </div>
                  </div>
                  {/* <LotEdges
                    companyLoaded={true}
                    traceEnabled={false}
                    metric={true}
                  /> */}
                </React.Fragment>
              )}
            </div>
          </div>
          <StepNavigation hidePrev={true} />
        </LeftPanel>
        <RightPanel className='flex-column drawer'>
          {plan && (
            <PagePreview
              traceEnabled={false}
              engineeringEnabled={false}
              heightVisualisationEnabled={false}
            />
          )}
        </RightPanel>
      </React.Fragment>
    )
  }
}

const ReferencePlanConsumer = props => (
  <DrawerContext.Consumer>
    {({
      state: { drawerData, currentTab , currentStep},
      setTab,
      setCurrentStep,
      setDrawerData,
      resetDrawerData,
      showErrors,
      setupDrawerCallback,
      saveDrawerData,
      getPage,
    }) => (
          <ReferencePlan
            {...props}
            {...{
              setCurrentStep,
              drawerData,
              setDrawerData,
              resetDrawerData,
              showErrors,
              setupDrawerCallback,
              currentTab,
              setTab,
              saveDrawerData,
              getPage
            }}
          />
    )}
  </DrawerContext.Consumer>
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
