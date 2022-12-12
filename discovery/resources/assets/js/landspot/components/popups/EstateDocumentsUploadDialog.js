import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import NiceDropdown from '../../../helpers/NiceDropdown';
import {ConfirmDeleteDialog, PopupModal} from '../../../popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import FileUploader from '../../../file-uploader/FileUploader';
import {LoadingSpinner} from '~/helpers';
import {EstateDocTypes} from './EstateDocumentsDialog';

const PackagesCtx = React.createContext();

class EstateDocumentsUploadDialog extends React.Component {

    static propTypes = {
        estate: PropTypes.object.isRequired,
        deleteEstateDocuments: PropTypes.func.isRequired,
        getEstateDocuments: PropTypes.func.isRequired,
        resetDialogMessages: PropTypes.func.isRequired,
        updateEstateDocuments: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            preloader: false,
            deletingPackage: null,
            uploadingFile: false,
            selectedDocType: 0,
            selectedStageId: '',
        };
    }

    componentDidMount() {
        this.props.getEstateDocuments({estateId: this.props.estate.id});
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    static getDerivedStateFromProps(props, state) {
        const {stages, PACKAGE_DELETED} = props.popupDialog;
        if (state.selectedStageId === '' && stages && stages.length) {
            return {selectedStageId: stages[0].id}
        }

        if (PACKAGE_DELETED) {
            props.resetDialogMessages();
            return {preloader: false};
        }

        return null;
    }

    fileUploaded = (args) => {
        this.props.updateEstateDocuments(args);
        this.props.alert.success('The document has been uploaded');
        this.setState({
            uploadingFile: false
        });
    };

    fileUploadError = (error) => {
        this.setState({
            uploadingFile: false,
        });

        if (error.errors && error.errors.file && error.errors.file.length) {
            this.props.alert.error(error.errors.file.join('\n'));
        }
    };

    fileProgess = () => {
        this.setState({uploadingFile: true});
    };

    onStageSelect = selectedStageId => this.setState({selectedStageId});

    deletePackage = (confirmedDelete) => {
        const state = {deletingPackage: null};
        if (confirmedDelete) {
            state.preloader = true;
            this.props.deleteEstateDocuments({id: this.state.deletingPackage.id});
        }
        this.setState(state);
    };

    onPackageDelete = (data, stageName) => this.setState({deletingPackage: {...data, ...{stageName}}});

    render() {
        const {onCancel, popupDialog: {stages}, estate} = this.props;
        const {deletingPackage, selectedStageId, preloader, uploadingFile} = this.state;
        const stage = stages && stages.find(stage => stage.id === selectedStageId);
        const contextValues = {
            estateId: estate.id,
            onPackageDelete: this.onPackageDelete,
            fileUploadError: this.fileUploadError,
            fileUploaded: this.fileUploaded,
            fileProgess: this.fileProgess,
        };
        return (
            <PopupModal title={estate.name + ' Documents'}
                        dialogClassName='estate-docs'
                        hideCancelButton={true}
                        onOK={onCancel}
                        onModalHide={onCancel}>
                {
                    stages
                        ? (
                            stages.length > 0
                                ?
                                <React.Fragment>
                                    <div className='docs-container'>
                                        {
                                            (preloader || uploadingFile) && <LoadingSpinner className='overlay'/>
                                        }
                                        <StagesDropdown
                                            {...{
                                                stages,
                                                selectedStageId,
                                                onStageSelect: this.onStageSelect
                                            }}
                                        />
                                        <PackagesCtx.Provider value={contextValues}>
                                            <DocumentsList key={selectedStageId} {...{stage}}/>
                                        </PackagesCtx.Provider>
                                        {
                                            deletingPackage &&
                                            <ConfirmDeleteDialog onConfirm={() => this.deletePackage(true)}
                                                                 userActionData={{
                                                                     itemType: EstateDocTypes[deletingPackage.type] + '  for stage',
                                                                     itemName: deletingPackage.stageName
                                                                 }}
                                                                 onCancel={() => this.deletePackage(false)}
                                            />
                                        }
                                    </div>
                                </React.Fragment>
                                : 'No stages were added to this estate'
                        )
                        : <LoadingSpinner/>
                }
            </PopupModal>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
        estate: state.estate.estate
    })), actions
)(EstateDocumentsUploadDialog));

const StagesDropdown = ({stages, selectedStageId, onStageSelect, isDisabled}) => (
    <div className='stages'>
        <label>SELECT A STAGE</label>
        <NiceDropdown
            disabled={isDisabled}
            defaultItem={null}
            items={stages.map(({name, id}) => ({text: name, value: id}))}
            onChange={onStageSelect}
            value={selectedStageId}
        />
    </div>
);

const DocumentsList = ({stage: {id, name, stage_docs}}) => (
    <ul>
        {
            Object.keys(EstateDocTypes)
                  .map(
                      type => <DocumentRow key={type}
                                           type={type}
                                           stageID={id}
                                           stageName={name}
                                           data={stage_docs.find(doc => doc.type === parseInt(type))}
                      />
                  )
        }
    </ul>
);

const DocumentRow = ({type, data, stageName, stageID}) => (
    <PackagesCtx.Consumer>
        {
            ({estateId, onPackageDelete, fileUploadError, fileUploaded, fileProgess}) => (
                <li>
                    <label>{EstateDocTypes[type]}</label>
                    {
                        data
                            ? <div>
                                <a rel="noopener noreferrer"
                                   target='_blank'
                                   title={data.name}
                                   href={data.fileURL}>{data.name ? data.name : 'Noname.pdf'}</a>
                                <button type='button'
                                        onClick={() => onPackageDelete(data, stageName)}
                                        className='button transparent trash-btn'
                                        title='Delete file'>
                                    <i className='landspot-icon times'/>
                                </button>
                            </div>
                            :
                            <FileUploader
                                baseUrl='/landspot/estate-package'
                                acceptMime={parseInt(type) === 3 ? 'application/pdf, image/*' : 'application/pdf'}
                                fileFieldName="file"
                                bodyFields={{stage_id: stageID, type}}
                                chooseFileButton={
                                    <a href='#' className='empty'>
                                        <i className='landspot-icon upload'/>
                                        Choose a file to upload
                                    </a>
                                }
                                uploadError={fileUploadError}
                                uploadSuccess={fileUploaded}
                                progressCallback={fileProgess}
                                beforeUpload={fileProgess}
                            />
                    }
                </li>
            )
        }
    </PackagesCtx.Consumer>
);