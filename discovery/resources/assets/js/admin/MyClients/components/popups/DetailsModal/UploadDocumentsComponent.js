import React, {Fragment} from 'react';
import {withAlert} from 'react-alert';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';

import {FormRowDropdown, FormRowInput} from '~/helpers/FormRow';
import FileUploader from '~/file-uploader/FileUploader';
import UploadDocumentsTable from './UploadDocumentsTable';
import {LoadingSpinner} from '~/helpers';
import {DocumentType} from './DocumentType';

class UploadDocumentsComponent extends React.Component {
    static propTypes = {
        estates: PropTypes.array.isRequired,
        documents: PropTypes.array.isRequired,
        userActionData: PropTypes.shape({
            id: PropTypes.number.isRequired
        }).isRequired,
        isBuilder: PropTypes.bool.isRequired,
        uploadDocument: PropTypes.func.isRequired,
        viewDocument: PropTypes.func.isRequired,
        onDocumentDelete: PropTypes.func.isRequired
    };

    static documentTypes = Object.freeze({
        'Quote': () => <i className="landspot-icon ic-quote"/>,
        'Drawing': () => <i className="landspot-icon ic-drawings"/>,
        'Brochure': () => <i className="landspot-icon ic-brochure"/>,
        'H&L Package': () => <i className="landspot-icon cube"/>,
        'Other': () => <i className="landspot-icon ic-other"/>,
    });

    state = {
        documentName: '',
        filePath: '',
        estateSelected: {},
        typeSelected: 0,
        preloader: false
    };

    onEstateSelectChange = id =>
        this.setState({
            estateSelected:
                this.props.estates.find(estate => estate.id === id) || {}
        });

    fileUploadError = error => {
        if (error.errors && error.errors.file && error.errors.file.length) {
            this.props.alert.error(error.errors.file.join('\n'));
        }
        this.setState({preloader: false});
    };

    beforeUpload = () => {
        this.setState({preloader: true});
    };

    onAddDocument = () => {
        const {
            uploadDocument,
            userActionData,
            isBuilder
        } = this.props;
        const {
            filePath,
            estateSelected,
            typeSelected,
            documentName
        } = this.state;

        if ((isBuilder || !isEmpty(estateSelected)) && filePath.trim()) {
            const create = {
                user_id: userActionData.id,
                estate_id: estateSelected.id,
                type: typeSelected,
                name: documentName,
                path: filePath
            };
            uploadDocument(create);
        }
    };

    fileUploaded = ({fileName, storagePath = ''}) => {
        this.setState({
            documentName:
                this.state.documentName.trim() ||
                fileName
                    .split('.')
                    .slice(0, -1)
                    .join('.'),
            preloader: false,
            filePath: storagePath
        });
        this.props.alert.success('The document has been uploaded');

        const {
            estateSelected,
            filePath
        } = this.state;

        const {isBuilder} = this.props;

        if (!(!isBuilder && isEmpty(estateSelected)) || !filePath.trim()) {
            this.onAddDocument();
        }
    };

    selectDocument = (item) => {
        this.setState({
            typeSelected: item
        })
    }

    render() {
        const {
            estateSelected,
            typeSelected,
            preloader
        } = this.state;
        const {estates, documents, isBuilder, viewDocument} = this.props;

        const selectDocuments = Object.keys(UploadDocumentsComponent.documentTypes).map(
                (key, index) => {
                    return <DocumentType
                        key={index}
                        text={key}
                        active={typeSelected === index}
                        value={index}
                        selectDocument={this.selectDocument}
                        icon={UploadDocumentsComponent.documentTypes[key]}
                    />
                })
        return (
            <div className="upload-document">
                {preloader && (
                    <LoadingSpinner className={'overlay'}/>
                )}
                {!isBuilder && (
                    <Fragment>
                        <p className="upload-documents_title">Select Estate</p>
                        <div className="upload-documents_form">
                            <FormRowDropdown
                                defaultItem={
                                    isEmpty(estateSelected) ? 'Estate' : null
                                }
                                defaultValue={0}
                                items={estates.map(item => ({
                                    text: item.name,
                                    value: item.id
                                }))}
                                onChange={this.onEstateSelectChange}
                                value={estateSelected.id}
                            />
                        </div>
                    </Fragment>
                )}

                <p className="upload-documents_title">Add Document</p>
                <div className="upload-documents_form">
                    <div className="document-types">
                        {selectDocuments}
                    </div>

                    <FileUploader
                        className="file-upload"
                        baseUrl="/landspot/my-client-file"
                        acceptMime="*"
                        fileFieldName="file"
                        chooseFileButton={
                            <button
                                disabled={isEmpty(estateSelected) && !isBuilder}
                                className="button transparent"
                            >
                                <i className="landspot-icon cloud-upload"/>
                                Choose a file to upload
                            </button>
                        }
                        uploadError={this.fileUploadError}
                        uploadSuccess={this.fileUploaded}
                        beforeUpload={this.beforeUpload}
                    />
                </div>
                <p className="upload-documents_title">Documents</p>
                <UploadDocumentsTable
                    documents={documents}
                    onDelete={this.props.onDocumentDelete}
                    onView={viewDocument}
                    isBuilder={isBuilder}
                />
            </div>
        );
    }
}

export default withAlert(UploadDocumentsComponent);
