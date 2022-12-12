import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';

import FileUploader from '~/file-uploader/FileUploader';
import {LoadingSpinner, clickHandler} from '~/helpers';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import ImageCropper from '~/image-cropper/ImageCropper';


class MediaFile extends React.Component {
    static propTypes = {
        house: PropTypes.object.isRequired,
        mediaType: PropTypes.string.isRequired,
        mediaItem: PropTypes.object.isRequired,
        removeHouseMedia: PropTypes.func.isRequired,
        removeNewItem: PropTypes.func,
        onMount: PropTypes.func.isRequired,
        disableUploadBtn: PropTypes.func.isRequired,
    };

    static defaultMediaData = {
    };

    constructor(props) {
        super(props);

        this.state = {
            fileData: MediaFile.defaultMediaData,
            validationErrors: {},
            uploadedFile: null,
            uploadingFile: false,
            showConfirmDialog: false,
        };
    }

    componentDidMount() {
        this.setState(MediaFile.copyPropsToState(this.props));
        this.props.onMount(this.getValidatedState);
    }

    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {fetch},
        } = props;

        if (fetch) {
            return MediaFile.copyPropsToState(props);
        }

        return null;
    }

    static copyPropsToState = (props) => {
        const {
            mediaItem: {title = '', id, floor = null},
            popupDialog: {hasTitle}
        } = props;
        const fileData   = {...MediaFile.defaultMediaData};

        if (hasTitle) {
            fileData.title = title;
        }

        if (floor) {
            fileData.floor = floor;
        }

        if (id) {
            fileData.id = id;
        } else {
            delete fileData['id'];
        }

        return {fileData, uploadedFile: null};
    };

    onItemChange = (propertyName, value) => {
        let {fileData, validationErrors} = this.state;
        let options = {};

        options[propertyName] = value;

        fileData = {...fileData, ...options};
        delete validationErrors[propertyName];

        if (propertyName === '') {
            validationErrors[propertyName] = true;
        }
        this.setState({fileData, validationErrors});
    };

    getValidatedState = () => {
        const {fileData, validationErrors, uploadedFile} = this.state;
        let result = true;
        if (!fileData.id && !uploadedFile) return null;

        for (let key in fileData) {
            if (fileData.hasOwnProperty(key)) {
                let v = fileData[key];
                if (v === '') {
                    result = false;
                    validationErrors[key] = true;
                }
            }
        }
        this.setState({validationErrors});
        return result ? {fileData, uploadedFile} : result;
    };

    fileUploaded = ({name, fileName, url}) => {
        this.setState({
            fileData: {...this.state.fileData, fileName},
            uploadingFile: false,
            uploadedFile: {name, fileName, url}
        });
        this.props.disableUploadBtn(false);
    };

    fileUploadError = (response) => {
        if (response) {
            this.showErrors(response.errors)
        }
        this.setState({uploadingFile: false, uploadedFile: null});
        this.props.disableUploadBtn(false);
    };

    showErrors = (propsErrors = {}) => {
        const {
            alert: {error},
        } = this.props;

        let errors = [];
        typeof propsErrors === 'object'
            ? Object.keys(propsErrors).forEach((error, i) => {
                const column = propsErrors[error];
                errors[i] = {
                    message: `${column.message || column}`,
                };
            })
            : errors.push(propsErrors);

        if (errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
        }
    };

    beforeUpload = () => {
        this.setState({uploadingFile: true});
        this.props.disableUploadBtn(true);
    };

    onRemove = (showConfirmDialog) => {
        this.setState({showConfirmDialog});
    };

    removeHandler = (remove) => {
        this.setState({showConfirmDialog: false});
        if (remove) {
            const {fileData: {id, newItemId}} = this.state;
            const {mediaType, removeHouseMedia, removeNewItem} = this.props;

            if (id) {
                removeHouseMedia({id, mediaType});
            } else if (newItemId) {
                removeNewItem(newItemId);
            } else {
                this.setState(MediaFile.copyPropsToState(this.props));
            }
        }
    };

    render() {
        const {fileData, uploadingFile, uploadedFile, validationErrors, showConfirmDialog} = this.state;
        const {mediaItem, mediaType, popupDialog: {hasTitle}} = this.props;
        const thumbImage  = uploadedFile ? uploadedFile.url : mediaItem['mediumImage'];
        const withCropper = mediaType === 'facades';

        return (
            <React.Fragment>
                {showConfirmDialog &&
                <ConfirmDeleteDialog onConfirm={this.removeHandler}
                                     userActionData={{itemName: 'this item'}}
                                     onCancel={() => {
                                         this.removeHandler(false);
                                     }}
                />
                }
                <div className="form-row">
                    <div className="row-column">
                        {
                            withCropper
                                ?
                                <ImageCropper className="file-upload"
                                              baseUrl='/upload-image'
                                              acceptMime='image/*'
                                              chooseFileButton={
                                                  <button disabled={uploadingFile} type='button'
                                                          className="button default">Upload File</button>
                                              }
                                              beforeUpload={this.beforeUpload}
                                              uploadError={this.fileUploadError}
                                              uploadSuccess={this.fileUploaded}

                                />
                                :
                                <FileUploader
                                    className="file-upload"
                                    baseUrl='/upload-image'
                                    acceptMime='image/*'
                                    chooseFileButton={
                                        <button disabled={uploadingFile} type='button'
                                                className="button default">Upload File</button>
                                    }
                                    beforeUpload={this.beforeUpload}
                                    uploadError={this.fileUploadError}
                                    uploadSuccess={this.fileUploaded}
                                />
                        }

                        {hasTitle &&
                        <div className="landspot-input">
                            <input type="text"
                                   disabled={!thumbImage}
                                   placeholder={'Title'}
                                   maxLength={160}
                                   className={validationErrors['title'] ? 'required-field' : null}
                                   onChange={e => this.onItemChange('title', e.target.value)}
                                   value={fileData.title || ''}/>
                        </div>
                        }
                    </div>

                    <div className="row-column">
                        {
                            (thumbImage || fileData.id) &&
                            <a title="Delete media item" onClick={(e) => clickHandler(e, this.onRemove(true))}
                               className='trash-link'
                               href="#" aria-hidden="true">
                                <i className='landspot-icon trash'/>
                            </a>
                        }

                        <div className="img-preview"
                             style={
                                 {
                                     backgroundImage: thumbImage ? `url('${thumbImage}')` : null,
                                 }
                             }>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
    })), actions
)(MediaFile));