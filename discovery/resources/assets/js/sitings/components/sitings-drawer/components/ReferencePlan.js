import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { get } from 'lodash';
import { LeftPanel, RightPanel } from '~sitings~/helpers/Panels';
import FileUploader from '~sitings~/helpers/file-uploader/FileUploader';
import CardImageItem from '~sitings~/helpers/CardImageItem';
import { Cards } from '~sitings~/helpers/CardImageItem';
import { ProgressBar } from '~sitings~/helpers';
import { DrawerContext, tabs } from '../DrawerContainer';
import * as actions from '../store/details/actions';
import PagePreview from './page/PagePreview';
import StepNavigation from './StepNavigation';
import AccountMgr from '~/sitings-sdk/src/sitings/data/AccountMgr';
import Builder from '~/sitings-sdk/src/sitings/data/Builder';
import uploadPng from './../../../../../img/upload.png'

class ReferencePlan extends Component {
    static componentUrl = '/sitings/drawer/reference-plan';

    static propTypes = {
        loadSitingWithRef: PropTypes.func.isRequired,
        setCurrentStep: PropTypes.func.isRequired,
        setDrawerData: PropTypes.func.isRequired,
        resetDrawerStore: PropTypes.func.isRequired,
        createNewSiting: PropTypes.func.isRequired,
        showErrors: PropTypes.func.isRequired,
        userProfile: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            uploadingReferenceFile: false,
            uploadingEngineeringFile: false,
            uploadingPercent: 0
        };
    }

    componentDidMount() {
        const {
            location: { state },
            setCurrentStep,
            loadSitingWithRef,
            createNewSiting
        } = this.props;

        if (state) loadSitingWithRef({ ...state.drawerData });
        else createNewSiting();

        setCurrentStep('REF_PLAN_SELECT');
    }

    componentWillUnmount() {
        this.props.resetDrawerStore();
    }

    setPage = page => {
        const { setDrawerData, currentTab } = this.props;
        if (currentTab === tabs.REFERENCE.id) {
            setDrawerData({ referencePage: page, zoom: 100 });
        }
        if (currentTab === tabs.ENGINEERING.id) {
            setDrawerData({ engineeringPage: page, zoom: 100 });
        }
    }

    fileUploaded = (uploadingFile) => {
        const {
            drawerDetails: { siting },
            loadSitingWithRef
        } = this.props;

        loadSitingWithRef({ sitingId: siting.id });
        this.setState({
            [uploadingFile]: false,
            uploadingPercent: 0
        });
    };

    fileUploadError = (response, uploadingFile) => {
        if (response) {
            this.props.showErrors(response);
        }
        this.setState({
            [uploadingFile]: false,
            uploadingPercent: 0
        });
    };

    beforeUpload = (uploadingFile) => {
        this.setState({ [uploadingFile]: true });
    };

    fileUploadingProgress = progress => {
        this.setState({
            uploadingPercent: parseInt((progress.loaded / progress.total) * 100)
        });
    }

    render() {
        const {
            drawerDetails: { siting },
            drawerData,
            currentTab,
            userProfile,
            getPage
        } = this.props;
        const {
            uploadingReferenceFile,
            uploadingEngineeringFile,
            uploadingPercent
        } = this.state;

        const currentPage = getPage();
        const plan = drawerData[currentTab];

        let hasEngineering = false;
        if (userProfile && userProfile.company && (
            (
                userProfile.user && Builder.fromName(userProfile.company.builder_id).hasEngineeringInState(userProfile.user.state_id)
            ) ||
            userProfile.company.builder_id.toUpperCase() === Builder.DEFAULT.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.HENLEY.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.HENLEY_SA.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.PLANTATION.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.FIRSTPLACE.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.ARLI_HOMES.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.BOLD.name ||
            userProfile.company.builder_id.toUpperCase() === Builder.RAWDONHILL.name
        )) {
            hasEngineering = true;
        }

        return (
            <React.Fragment>
                <LeftPanel className='sidebar'>
                    <div className="filter-bar">
                        <div className="sitting-header"><p className="letter">Base Siting&nbsp;/&nbsp;</p><p className="letter-bold">Step 1</p><div className="bar"></div></div>
                        <div className="filter-form">
                            <div className="first-row has-nav">
                                <span className="filters-header">Lot boundaries</span>
                            </div>

                            <div className="step-note">
                                <p>
                                    Create the boundaries for your lot. Upload a subplan to reference or trace, or manually enter the details of each boundary line below.
                                </p>
                            </div>

                            {console.log('siting', siting)}

                            {siting &&

                                <React.Fragment>
                                    <div className="form-rows form-upload">
                                        <div className="form-row form-upload-container">
                                            {plan && (
                                                <div className='document-wrap'>
                                                    <div className='upload-button'><img src={uploadPng} />Upload</div>
                                                    <div>A</div>
                                                </div>
                                            )}
                                            {!plan && uploadingReferenceFile &&
                                                <ProgressBar percent={uploadingPercent}
                                                    className='form-upload-button' />}
                                            {!plan && !uploadingReferenceFile && <div className='wrap-upload'>
                                                <span>Reference plan</span>
                                                <FileUploader
                                                    className='form-row'
                                                    baseUrl='/sitings/drawer/reference-plan'
                                                    acceptMime='application/pdf'
                                                    bodyFields={{ id: siting.id }}
                                                    fileFieldName={'image'}
                                                    chooseFileButton={<div className='upload-button'><img src={uploadPng} />Upload</div>
                                                    }
                                                    beforeUpload={() => this.beforeUpload('uploadingReferenceFile')}
                                                    uploadError={response => this.fileUploadError(response, 'uploadingReferenceFile')}
                                                    uploadSuccess={() => this.fileUploaded('uploadingReferenceFile')}
                                                    onProgress={this.fileUploadingProgress}
                                                /></div>}
                                        </div>
                                    </div>
                                    {/* {
                                        (hasEngineering || (AccountMgr.i.builder && AccountMgr.i.builder.hasEngineering)) &&
                                        <div className="form-rows form-upload">
                                            <div className="form-row form-upload-container">
                                                <span className="label form-upload-label">ENGINEERING PLAN</span>
                                                <FileUploader
                                                    className='form-row'
                                                    baseUrl='/sitings/drawer/engineering-plan'
                                                    acceptMime='application/pdf'
                                                    bodyFields={{ id: siting.id }}
                                                    fileFieldName={'image'}
                                                    chooseFileButton={
                                                        uploadingEngineeringFile
                                                            ? <ProgressBar percent={uploadingPercent}
                                                                className='form-upload-button' />
                                                            : <button type='button'
                                                                className={`button primary form-upload-button ${uploadingReferenceFile ? 'disabled' : ''}`}>
                                                                <i className="landconnect-icon cloud-upload" /> Upload
                                                                Engineering
                                                            </button>
                                                    }
                                                    beforeUpload={() => this.beforeUpload('uploadingEngineeringFile')}
                                                    uploadError={response => this.fileUploadError(response, 'uploadingEngineeringFile')}
                                                    uploadSuccess={() => this.fileUploaded('uploadingEngineeringFile')}
                                                    onProgress={this.fileUploadingProgress}
                                                />
                                            </div>
                                        </div>
                                    } */}
                                </React.Fragment>
                            }

                            {plan &&
                                <React.Fragment>
                                    <div className="form-rows">
                                        <div className="form-row">
                                            <label className="left-item">Page selection</label>
                                        </div>
                                    </div>

                                    <Cards>
                                        {plan.pages.map(page =>
                                            <CardImageItem
                                                key={page.id}
                                                className={classnames('a4', page.id === get(currentPage, 'id') && 'selected')}
                                                onClick={() => this.setPage(page)}
                                                bgImage={`url('${page.image}')`}
                                                bgSize='contain'
                                                customContent={
                                                    <div className='page-num'>
                                                        <div>{`${page.page}/${plan.pages.length}`}</div>
                                                    </div>
                                                }
                                            />
                                        )}
                                    </Cards>
                                </React.Fragment>
                            }
                        </div>
                    </div>
                    <StepNavigation hidePrev={true} />
                </LeftPanel>
                <RightPanel className='flex-column drawer'>
                    {plan && <PagePreview
                        traceEnabled={false}
                        engineeringEnabled={false}
                        heightVisualisationEnabled={false}
                    />
                    }
                </RightPanel>
            </React.Fragment>
        );
    }
}

const ReferencePlanConsumer = (props) => (
    <DrawerContext.Consumer>
        {
            ({
                state: { drawerData, currentTab },
                setTab,
                setCurrentStep,
                setDrawerData,
                resetDrawerData,
                showErrors,
                setupDrawerCallback,
                getPage
            }) => <ReferencePlan  {...props} {...{
                setCurrentStep,
                drawerData,
                setDrawerData,
                resetDrawerData,
                showErrors,
                setupDrawerCallback,
                currentTab,
                setTab,
                getPage
            }} />
        }
    </DrawerContext.Consumer>
);

const ReferencePlanInstance = connect((state) => ({
    drawerDetails: state.sitingsDrawerDetails,
    userProfile: state.userProfile
}), actions)(ReferencePlanConsumer);

export { ReferencePlanInstance };

export default ReferencePlan;