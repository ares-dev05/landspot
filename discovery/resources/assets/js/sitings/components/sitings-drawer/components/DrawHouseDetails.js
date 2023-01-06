import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import ApplicationStep from '~/sitings-sdk/src/sitings/model/ApplicationStep';
import {DrawerContext} from '../DrawerContainer';
import * as actions from '../store/details/actions';
import StepNavigation from './StepNavigation';
import HouseDetails from './sidebar/HouseDetails';
import {CompanyDataContext} from './CompanyDataContainer';


class DrawHouseDetails extends Component {
    static componentUrl = '/sitings/drawer/:sitingId/details';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                sitingId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        companyLoaded: PropTypes.bool.isRequired,
        loadSitingDrawer: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        resetDrawerStore: PropTypes.func.isRequired,
        setApplicationStep: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const {
            match: {
                params: {sitingId}
            },
            loadSitingDrawer,
            setCurrentStep,
            setApplicationStep,
            drawerData: {sitingSession}
        } = this.props;

        if (!sitingSession) {
            loadSitingDrawer({sitingId}, {step: 'house-details'});
        }

        setCurrentStep('DRAW_HOUSE_DETAILS');
        setApplicationStep(ApplicationStep.ADD_EXTENSIONS);
    }

    componentDidUpdate(prevProps) {
    }

    componentWillUnmount() {
    }

    render() {
        const {
            companyLoaded
        } = this.props;
        return (
            <React.Fragment>
                <div className="filter-bar">
                    <div className='sitting-header'>
                        <p className='letter'>Base Siting&nbsp;/&nbsp;</p>
                        <p className='letter-bold'>Step 3</p>
                        <div className='bar'></div>
                    </div>
                    <div className="filter-form">
                        <div className='first-row has-nav'>
                            <span className='filters-header'>House details</span>
                        </div>
                        <div className="step-note"><p>Modify your selected floorplan, or add trees and other structures to the site.</p></div>

                        <HouseDetails companyLoaded={companyLoaded}/>
                    </div>
                </div>
                <StepNavigation saveState={true}/>
            </React.Fragment>
        );
    }
}

const DrawHouseDetailsConsumer = (props) => (
    <CompanyDataContext.Consumer>
        {
            ({setApplicationStep, companyLoaded}) =>
                <DrawerContext.Consumer>
                    {
                        ({
                             state: {drawerData}, setCurrentStep
                         }) => <DrawHouseDetails  {...props} {...{
                            drawerData,
                            setCurrentStep,
                            setApplicationStep,
                            companyLoaded
                        }}/>
                    }
                </DrawerContext.Consumer>
        }
    </CompanyDataContext.Consumer>
);

const DrawHouseDetailsInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
}), actions)(DrawHouseDetailsConsumer);

export {DrawHouseDetailsInstance};

export default DrawHouseDetails;