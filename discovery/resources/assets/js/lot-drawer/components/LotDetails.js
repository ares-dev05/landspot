import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import {LotDrawerContext} from '../LotDrawerContainer';
import * as actions from '../store/drawer/actions';
import store from '../store';
import StepNavigation from './StepNavigation';
import LotSettings from './details/LotSettings';
import LotView from './drawer/LotView';
import CanvasModel, {defaultTheme, imageSizes} from './drawer/CanvasModel';

class LotDetails extends Component {
    static componentUrl = '/landspot/lot-drawer/:lotId/lot-details';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                lotId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        loadLotSettings: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        saveLotRawData: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const {
            match: {
                params: {lotId}
            },
            loadLotSettings,
            setCurrentStep
        } = this.props;

        loadLotSettings({id: lotId});
        setCurrentStep('LOT_DETAILS');
    }

    componentDidUpdate(prevProps) {}

    componentWillUnmount() {
        CanvasModel.resetModel();
        store.dispatch({type: 'RESET_DRAWER_STATE'});
    }

    static getDerivedStateFromProps(props, state) {
        const {
            lotDrawer: {lotData, drawerTheme, DRAWER_UPDATED},
            setDrawerData
        } = props;

        if (DRAWER_UPDATED) {
            setDrawerData({
                lotId: lotData.lot.id,
                estateId: lotData.estate_id,
                theme: JSON.parse(drawerTheme.theme),
                rotation: lotData.rotation,
                viewScale: lotData.view_scale,
                edges: JSON.parse(lotData.edges),
                easements: JSON.parse(lotData.easements || null)
            });
        }

        return null;
    }

    render() {
        return (
            <React.Fragment>
                <LeftPanel className='sidebar'>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div>STEP 3</div>
                            <div className="first-row has-nav">
                                <span className="filters-header">Lot Details</span>
                            </div>

                            <div className="step-note">
                                <p>
                                    Add any lot details such as any easements, crossovers and the lot envelope.
                                </p>
                            </div>

                            <LotSettings/>
                        </div>
                    </div>
                    <StepNavigation hideNext={true} saveState={true}/>
                </LeftPanel>
                <RightPanel className='flex-column summary'>
                    <LotView showSettings={true}/>
                </RightPanel>
            </React.Fragment>
        );
    }
}

const LotDetailsConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 state: {drawerData}, setCurrentStep, setDrawerData, resetDrawerData
             }) => <LotDetails  {...props} {...{
                drawerData, setCurrentStep, setDrawerData, resetDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const LotDetailsInstance = connect((state) => ({
    lotDrawer: state.lotDrawer,
}), actions)(LotDetailsConsumer);

export {LotDetailsInstance};

export default LotDetails;