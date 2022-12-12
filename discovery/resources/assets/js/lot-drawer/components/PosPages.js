import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import _ from 'lodash';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import CardImageItem from '~/helpers/CardImageItem';
import {Cards} from '~/helpers/CardImageItem';
import {LotDrawerContext} from '../LotDrawerContainer';
import * as actions from '../store/drawer/actions';
import store from '../store';
import PagePreview from './page/PagePreview';
import StepNavigation from './StepNavigation';

class PosPages extends Component {
    static componentUrl = '/landspot/lot-drawer/:lotId/pos-page';

    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                lotId: PropTypes.string.isRequired,
            }).isRequired,
        }).isRequired,
        loadPOSDoc: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        saveLotRawData: PropTypes.func.isRequired,
        setDrawerData: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {
        const {
            lotDrawer: {pos},
            match: {
                params: {lotId}
            },
            loadPOSDoc,
            setCurrentStep
        } = this.props;

        if (!pos) {
            loadPOSDoc({id: lotId});
        }

        setCurrentStep('PAGE_POS_SELECT');
    }

    componentWillUnmount() {
        store.dispatch({type: 'RESET_DRAWER_STATE'});
    }

    static getDerivedStateFromProps(props, state) {
        const {
            lotDrawer: {lot, DRAWER_UPDATED},
            setDrawerData
        } = props;

        if (DRAWER_UPDATED) {
            setDrawerData({
                lotId: lot.id,
                estateId: lot.stage.estate.id,
                stageId: lot.stage.id,
                pageId: _.get(lot, 'drawer_data.page_id', null),
            });
        }

        return null;
    }

    render() {
        const {
            lotDrawer: {pos},
            drawerData: {pageId},
            setDrawerData
        } = this.props;
        const page = pos ? pos.pages.find(page => page.id === pageId) : null;

        return (
            <React.Fragment>
                <LeftPanel className='sidebar'>
                    <div className="filter-bar">
                        <div className="filter-form">
                            <div>STEP 1</div>
                            <div className="first-row has-nav">
                                <span className="filters-header">Select your lot&apos;s page</span>
                            </div>

                            <div className="step-note">
                                <p>
                                    Select the page your lot is on. This document will be displayed
                                    as a reference during the process of creating your marketing site
                                    plan.
                                </p>

                                {pos &&
                                <div className='doc-name'>
                                    <a href={pos.viewURL} target='_blank'
                                       rel="noopener noreferrer">
                                        <i className="fal fa-file-pdf fa-3x"/>
                                        {pos.name}
                                    </a>
                                </div>
                                }
                            </div>

                            {pos &&
                            <React.Fragment>
                                <div className="form-rows">
                                    <div className="form-row">
                                        <label className="left-item">Page selection</label>
                                    </div>
                                </div>

                                <Cards>
                                    {
                                        pos.pages.map(
                                            ({id, image, page}) => {
                                                const selected = id === pageId;
                                                return <CardImageItem
                                                    key={id}
                                                    className={classnames('a4', selected && 'selected')}
                                                    onClick={() => setDrawerData({pageId: id})}
                                                    bgImage={`url('${image}')`}
                                                    bgSize='contain'
                                                    customContent={
                                                        <div className='page-num'>
                                                            <div>{`${page}/${pos.pages.length}`}</div>
                                                        </div>
                                                    }
                                                />;
                                            }
                                        )
                                    }
                                </Cards>
                            </React.Fragment>
                            }
                        </div>
                    </div>
                    <StepNavigation prevWithState={true}
                                    disabledNext={pageId === null}/>
                </LeftPanel>
                <RightPanel className='flex-column drawer'>
                    {pos && <PagePreview page={page}/>}
                    <div style={{position: 'absolute', width: '100vh', height: '100vh', left: 0, top: 0, content: '', zIndex: 999}}></div>
                </RightPanel>
            </React.Fragment>
        );
    }
}

const PosPagesConsumer = (props) => (
    <LotDrawerContext.Consumer>
        {
            ({
                 state: {drawerData}, setCurrentStep, setDrawerData, resetDrawerData
             }) => <PosPages  {...props} {...{
                setCurrentStep, drawerData, setDrawerData, resetDrawerData
            }}/>
        }
    </LotDrawerContext.Consumer>
);

const PosPagesInstance = connect((state) => ({
    lotDrawer: state.lotDrawer,
}), actions)(PosPagesConsumer);

export {PosPagesInstance};

export default PosPages;