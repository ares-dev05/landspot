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
    metric: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)
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
      drawerDetails: { drawerData }
    } = this.props
    const page = drawerData ? drawerData.page : null

    if (!sitingSession || !page) {
      loadSitingDrawer({ sitingId }, { step: 'edges' })
    }

    setCurrentStep('DRAW_EDGES')
    setApplicationStep(ApplicationStep.TRACE_OUTLINE)
  }

  toggleTraceMode () {
    const { setTraceMode, traceEnabled } = this.props

    setTraceMode(!traceEnabled)
  }

  componentDidUpdate (prevProps) {
    const {
        drawerData
      } = this.props
      if(drawerData.sitingId != undefined && drawerData.sitingId != null && drawerData.referencePlan == null) {
        console.log('-> ->')
        console.log('params', drawerData.sitingId)
        // window.location.href = "https://localsunny.com/sitings/drawer/478/edges";
        this.props.saveDrawerData(1)
      }
  }

  componentWillUnmount () {}

  render () {
    const {
      companyLoaded,
      traceEnabled,
      metric,
      setMetric,
      drawerData,
      getPage
    } = this.props

    const hasTrace = AccountMgr.i.builder
      ? AccountMgr.i.builder.hasManualTracing
      : false

    console.log('drawerData', drawerData.referencePlan)

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
