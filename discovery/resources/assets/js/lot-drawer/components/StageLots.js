import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import NiceDropdown from '~/helpers/NiceDropdown';
import {LotDrawerContext} from '../LotDrawerContainer';
import * as actions from '../store/drawer/actions';
import store from '../store';

class StageLots extends Component {
    static componentUrl = '/landspot/lot-drawer/:estateId/stage';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                estateId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        getEstateData: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        setDrawerData: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const {
            lotDrawer: {estate},
            match: {
                params: {estateId}
            },
            getEstateData,
            setCurrentStep,
            setDrawerData,
            location: {state}
        } = this.props;

        if (!estate) {
            getEstateData({estateId});
        }

        if (state) {
            setDrawerData(state.drawerData);
        }

        setCurrentStep('STAGE_LOT_SELECT');
    }

    componentWillUnmount() {
        store.dispatch({type: 'RESET_DRAWER_STATE'});
    }

    componentDidUpdate(prevProps) {
        const {
            lotDrawer: {estate},
            match: {
                params: {estateId}
            },
            getEstateData
        } = this.props;
        const {
            lotDrawer: {estate: prevEstate},
        } = prevProps;

        if (!estate && prevEstate) {
            getEstateData({estateId});
        }
    }

    static getDerivedStateFromProps(props, state) {
        const {
            lotDrawer: {estate, DRAWER_UPDATED},
            setDrawerData
        } = props;

        if (DRAWER_UPDATED) {
            setDrawerData({estateId: estate.id});
        }

        return null;
    }

    loadPOS = () => {
        const {
            drawerData: {stageId, lotId}
        } = this.props;

        const {
            alert: {error},
            currentStep,
            setNextStep
        } = this.props;

        if (!stageId && !lotId) {
            error('Please select stage and lot');
        } else {
            setNextStep(currentStep + 1);
        }
    };

    render() {
        const {
            lotDrawer: {estate},
            setDrawerData,
            drawerData: {stageId, lotId}
        } = this.props;
        const stage = estate ? estate.stage.find(stage => stage.id === stageId) : {};
        return (
            <React.Fragment>
                <LeftPanel className='sidebar'>
                    <div className="step-nav">
                        Lot Drawer
                    </div>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div>STEP 1</div>
                            <div className="first-row has-nav">
                                <span className="filters-header">Select Your Lot</span>
                            </div>

                            <p>
                                Select your stage and lot that you want to draw. This
                                load the plan of subdivision for your reference.
                            </p>

                            {estate !== null &&
                            <div className="form-rows">
                                <div className="form-row">
                                    <label className="left-item">Stage</label>

                                    <NiceDropdown
                                        itemClass='right-item'
                                        defaultValue=''
                                        defaultItem='Stage'
                                        items={
                                            estate.stage.map(stage => ({
                                                text: stage.name,
                                                value: stage.id
                                            }))
                                        }
                                        onChange={stageId => setDrawerData({stageId, lotId: null})}
                                        value={stageId || ''}
                                    />
                                </div>
                                {stageId &&
                                <div className="form-row">
                                    <label className="left-item">Status</label>

                                    <NiceDropdown
                                        itemClass='right-item'
                                        defaultValue=''
                                        defaultItem='Lot No'
                                        items={
                                            stage.lots.map(lot => ({
                                                text: lot.lot_number,
                                                value: lot.id
                                            }))
                                        }
                                        onChange={lotId => setDrawerData({lotId})}
                                        value={lotId || ''}
                                    />
                                </div>
                                }

                                {(stageId && lotId) &&
                                <div className="form-row">
                                    <button className="button primary"
                                            type='button'
                                            onClick={() => this.loadPOS()}>Load POS
                                    </button>
                                </div>
                                }
                            </div>
                            }
                        </div>
                    </div>
                </LeftPanel>
                <RightPanel className='flex-column'>
                    {
                        estate !== null &&
                        (!estate.stage.length &&
                            <div>In this estate there is not a single stage with uploaded POS.</div>
                        )
                    }
                </RightPanel>
            </React.Fragment>
        );
    }
}

const StageLotsConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 state: {currentStep, drawerData}, setCurrentStep, setNextStep, setDrawerData
             }) => <StageLots  {...props} {...{
                currentStep, setCurrentStep, setNextStep, drawerData, setDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const StageLotsInstance = withAlert(connect((state) => ({
    lotDrawer: state.lotDrawer,
}), actions)(StageLotsConsumer));

export {StageLotsInstance};

export default StageLots;