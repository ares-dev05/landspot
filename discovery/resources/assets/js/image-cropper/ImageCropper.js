import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {withAlert} from 'react-alert';
import Cropper from 'react-cropper';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';

class ImageCropper extends React.Component {
    static propTypes = {
        acceptMime: PropTypes.string,
        className: PropTypes.string,
        aspectRatio: PropTypes.number,
        baseUrl: PropTypes.string.isRequired,
        beforeUpload: PropTypes.func,
        uploadSuccess: PropTypes.func,
        uploadError: PropTypes.func,
        chooseFileButton: PropTypes.element.isRequired,
    };

    constructor(props) {
        super(props);
        this.dialog = null;

        this.defaultMimeType = 'image/png';
        this.state = {
            preloader: false,
            mimeType: this.defaultMimeType,
            showCropDialog: false,
            cropImageSrc: '',
        };
    }

    componentDidMount() {
    }

    saveFile = () => {
        const croppedCanvas = this.cropper.getCroppedCanvas();
        if (typeof croppedCanvas === 'undefined') {
            return;
        }

        const {
            beforeUpload,
            uploadError,
            uploadSuccess,
            baseUrl
        } = this.props;

        croppedCanvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append('image', blob);

            beforeUpload({files: blob});
            this.setState({preloader: true});

            axios.post(baseUrl, formData)
                .then(response => {
                    const {data} = response;

                    if (data && data.url) {
                        this.input.value = '';
                        this.setState({
                            preloader: false,
                            mimeType: this.defaultMimeType,
                            showCropDialog: false
                        });
                        uploadSuccess(data);
                    }
                })
                .catch(error => {
                    this.input.value = '';
                    this.setState({preloader: false});
                    uploadError({
                        status: error.response.status,
                        errors: error.response.data.errors ||
                        error.response.data.message
                    });
                });
        }, this.state.mimeType);
    };

    commonChooseFile = (e) => {
        if (e.target.name !== 'ajax-upload-file-input') {
            e.preventDefault();
            this.input.click();
        }
        e.stopPropagation();
    };


    closeCropDialog = () => {
        this.setState({
            showCropDialog: false,
            mimeType: this.defaultMimeType,
            cropImageSrc: ''
        });
        this.input.value = '';
    };

    commonChangeFile = (e) => {
        let files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }
        let cropImageSrc = URL.createObjectURL(files[0]);
            this.setState({
                mimeType: files[0].type,
                cropImageSrc,
                showCropDialog: true
            });
    };

    render() {
        const {preloader, showCropDialog, cropImageSrc} = this.state;
        const {chooseFileButton, acceptMime, className, aspectRatio = 16 / 10} = this.props;

        const inputProps = {
            multiple: false,
            accept: acceptMime || 'image/*',
        };

        const chooseFileButtonNode = React.cloneElement(
            chooseFileButton, {
                onClick: this.commonChooseFile
            },
            [...(this.props.chooseFileButton.props.children ? [this.props.chooseFileButton.props.children] : []), (
                <input type="file"
                       name="ajax-upload-file-input"
                       style={{display: 'none'}}
                       onChange={this.commonChangeFile}
                       {...inputProps}
                       key="file-button"
                       ref={node => this.input = node}
                />
            )]);

        return (
            <React.Fragment>
                <div className={className} style={{display: 'inline-block'}}>
                    {chooseFileButtonNode}
                </div>
                {showCropDialog &&
                <PopupModal title={'Please select a visible image area.'}
                            dialogClassName={'wide-popup house-details'}
                            okButtonDisabled={preloader}
                            onOK={this.saveFile}
                            okButtonTitle='Upload'
                            onModalHide={() => this.closeCropDialog()}
                >
                    <React.Fragment>
                        {preloader && <LoadingSpinner className={'overlay'}/>}
                        {cropImageSrc
                            ? <Cropper
                                ref={cropper => {
                                    this.cropper = cropper;
                                }}
                                viewMode={1}
                                src={cropImageSrc}
                                style={{height: 400, width: '100%', marginBottom: '10px'}}
                                aspectRatio={aspectRatio}
                                guides={false}/>
                            : <LoadingSpinner isStatic={true}/>}
                    </React.Fragment>
                </PopupModal>
                }
            </React.Fragment>
        );
    }
}

export default withAlert(ImageCropper);
