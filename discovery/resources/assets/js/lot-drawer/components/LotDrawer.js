import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import {LotDrawerContext} from '../LotDrawerContainer';
import * as actions from '../store/drawer/actions';
import store from '../store';
import PagePreview from './page/PagePreview';
import StepNavigation from './StepNavigation';
import LotEdges from './drawer/LotEdges';
import LotView from './drawer/LotView';
import CanvasModel from './drawer/CanvasModel';

class LotDrawer extends Component {
    static componentUrl = '/landspot/lot-drawer/:lotId/draw-lot';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                lotId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        loadLotData: PropTypes.func.isRequired,
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
            loadLotData,
            setCurrentStep
        } = this.props;

        loadLotData({id: lotId});
        setCurrentStep('DRAW_LOT');
    }

    componentDidUpdate(prevProps) {}

    componentWillUnmount() {
        CanvasModel.resetModel();
        store.dispatch({type: 'RESET_DRAWER_STATE'});
    }

    static getDerivedStateFromProps(props, state) {
        const {
            lotDrawer: {lotData, DRAWER_UPDATED},
            setDrawerData
        } = props;

        if (DRAWER_UPDATED) {
            setDrawerData({
                lotId: lotData.lot.id,
                estateId: lotData.estate_id,
                rotation: lotData.rotation,
                edges: JSON.parse(lotData.edges)
            });
        }

        return null;
    }

    render() {
        const {
            lotDrawer: {lotData},
        } = this.props;
        return (
            <React.Fragment>
                <LeftPanel className='sidebar'>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div>STEP 2</div>
                            <div className="first-row has-nav">
                                <span className="filters-header">Create lot boundaries</span>
                            </div>

                            <div className="step-note">
                                <p>
                                    Enter the details of each boundary line below, and they will
                                    automatically be created on your siting.
                                </p>
                            </div>

                            <LotEdges/>
                        </div>
                    </div>
                    <StepNavigation saveState={true}/>
                </LeftPanel>
                <RightPanel className='flex-column drawer'>
                    {lotData && <PagePreview page={lotData.page}/>}
                    <LotView/>
                    <div style={{position: 'absolute', width: '100vh', height: '100vh', left: 0, top: 0, content: '', zIndex: 999}}></div>
                </RightPanel>
            </React.Fragment>
        );
    }
}

const LotDrawerConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 state: {drawerData}, setCurrentStep, setDrawerData, resetDrawerData
             }) => <LotDrawer  {...props} {...{
                drawerData, setCurrentStep, setDrawerData, resetDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const LotDrawerInstance = connect((state) => ({
    lotDrawer: state.lotDrawer,
}), actions)(LotDrawerConsumer);

export {LotDrawerInstance};

export default LotDrawer;