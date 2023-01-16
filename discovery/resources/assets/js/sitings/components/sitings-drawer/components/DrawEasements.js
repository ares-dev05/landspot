import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep'
import { ToggleSwitch } from '~sitings~/helpers/ToggleSwitch'
import { DrawerContext } from '../DrawerContainer'
import * as actions from '../store/details/actions'
import StepNavigation from './StepNavigation'
import LotEasements from './sidebar/LotEasements'
import { CompanyDataContext } from './CompanyDataContainer'
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr'

class DrawEasements extends Component {
  static componentUrl = '/sitings/drawer/:sitingId/easements'

  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        sitingId: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    companyLoaded: PropTypes.bool.isRequired,
    loadSitingDrawer: PropTypes.func.isRequired,
    setCurrentStep: PropTypes.func.isRequired,
    resetDrawerStore: PropTypes.func.isRequired,
    setApplicationStep: PropTypes.func.isRequired,
    setMetric: PropTypes.func.isRequired,
    metric: PropTypes.bool.isRequired
  }

  constructor (props) {
    super(props)

    this.state = {}
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
      loadSitingDrawer({ sitingId }, { step: 'easements' })
    }

    setCurrentStep('DRAW_EASEMENTS')
    setApplicationStep(ApplicationStep.ADD_EASEMENT)
  }

  componentDidUpdate (prevProps) {}

  componentWillUnmount () {}

  render () {
    const { companyLoaded, metric, setMetric } = this.props

    // const hasTrace = AccountMgr.i.builder
    //   ? AccountMgr.i.builder.hasManualTracing
    //   : false

    const hasTrace = false

    return (
      <React.Fragment>
        <div className='filter-bar'>
          <div className='sitting-header'>
            <p className='letter'>Base Siting&nbsp;/&nbsp;</p>
            <p className='letter-bold'>Step 2</p>
            <div className='bar'></div>
          </div>
          <div className='filter-form'>
            <div className='first-row has-nav'>
              <span className='filters-header'>Lot details</span>

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
            </div>

            <div className='step-note'>
              <p>
                    Add any lot details such as any easements, crossovers and the lot envelope.
              </p>
            </div>

            {/* {companyLoaded && <LotEasements metric={metric}/>} */}
            <LotEasements metric={metric} />
          </div>
        </div>
        <StepNavigation saveState={true} />
      </React.Fragment>
    )
  }
}

const DrawEasementsConsumer = props => (
  <CompanyDataContext.Consumer>
    {({ setApplicationStep, companyLoaded, metric, setMetric }) => (
      <DrawerContext.Consumer>
        {({ state: { drawerData }, setCurrentStep }) => (
          <DrawEasements
            {...props}
            {...{
              drawerData,
              setCurrentStep,
              setApplicationStep,
              companyLoaded,
              metric,
              setMetric
            }}
          />
        )}
      </DrawerContext.Consumer>
    )}
  </CompanyDataContext.Consumer>
)

const DrawEasementsInstance = connect(
  state => ({
    drawerDetails: state.sitingsDrawerDetails
  }),
  actions
)(DrawEasementsConsumer)

export { DrawEasementsInstance }

export default DrawEasements
