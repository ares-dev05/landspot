import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withAlert} from 'react-alert';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {ContentPanel, LeftPanel, RightPanel} from '~/helpers/Panels';
import Cropper from 'react-cropper';
import {LoadingSpinner} from '~/helpers';
import axios from 'axios';
import {uploadMediaUrl} from '../../store/popupDialog/actions';

class FacadeBulkUploaderDialog extends Component {
    static propTypes = {
        userActionData: PropTypes.oneOfType([
            PropTypes.shape({
                house: PropTypes.object.isRequired
            })
        ]),
        onOk: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            preloader: -1,
            files: [],
        };
        this.cropperRefs = {};
        this.fileMultipleInputRef = React.createRef();
        this.facadesRef = React.createRef();
    }

    saveMultipleFacadeImages = () => {
        const {files} = this.state;
        let lastSuccessfullIndex = -1;

        (async () => {
            try {
                for (let i = 0; i < files.length; i++) {
                    this.setState({preloader: i});
                    const imageBlob = await this.getCroppedImageBlob(files[i]);
                    await this.storeFacade(files[i], imageBlob);
                    lastSuccessfullIndex = i + 1;
                }
            } catch (e) {
                if (e) {

                    if (e.response && e.response.data && e.response.data.errors) {
                        const {errors} = e.response.data;
                        const msg = Object.keys(errors).reduce((acc, key) => acc + errors[key].join(), ' ');
                        this.props.alert.error(msg);
                    } else {
                        this.props.alert.error(e.toString());
                    }

                }
            } finally {
                this.setState({
                    preloader: -1,
                    files: files.slice(lastSuccessfullIndex)
                });

                if (lastSuccessfullIndex >= files.length) {
                    this.props.alert.success('Images have been stored.');
                    this.props.onOk();
                }
            }
        })();

    };

    getCroppedImageBlob = file => {
        return new Promise((resolve, reject) => {
            const cropper = this.cropperRefs[file.key];
            if (!cropper) {
                reject('Unable to crop image');
            }

            const croppedCanvas = cropper.getCroppedCanvas();
            if (!croppedCanvas) {
                reject('Invalid image, please choose another one.');
            }
            croppedCanvas.toBlob(blob => {
                resolve(blob);
            }, file.type, 1)
        });
    };

    /**
     *
     * @param {Object} file
     * @param {Blob} imageBlob
     * @returns {Promise}
     */
    storeFacade = (file, imageBlob) => {
        const {userActionData: {house: {id}}} = this.props;
        const houseUrl = uploadMediaUrl.replace(':id', id);

        const formData = new FormData();
        formData.append('mediaBulkFile', imageBlob, file.name);
        formData.append('mediaType', 'facades');
        formData.append('skipResults', '1');
        return axios.post(houseUrl, formData);
    };

    setCropperRef = (id, ref) => this.cropperRefs[id] = ref;

    onInputFilesChange = e => {
        let files;
        if (e.dataTransfer) {
            files = Array.prototype.slice.call(e.dataTransfer.files);
        } else if (e.target) {
            files = Array.prototype.slice.call(e.target.files);
        }

        if (files) {
            if (files.length > 50) {
                files = files.slice(0, 50);
            }

            const invalidFiles = [];
            const newFiles = files.reduce((acc, file) => {
                if (file.type.indexOf('image/') === 0) {
                    acc.push({
                        key: Math.random().toString(36).substr(2, 8),
                        name: file.name
                                  .replace(/\.\w+$/g, '')
                                  .replace(/(?:\W|_)+/g, ' ')
                                  .replace(/\s{2,}/g, ' ')
                                  .substr(0, 255),
                        mimeType: file.type,
                        objectURL: URL.createObjectURL(file)
                    });
                } else {
                    invalidFiles.push(file.name);
                }

                return acc;
            }, []);

            this.setState({files: this.state.files.concat(newFiles)});
            if (invalidFiles.length) {
                this.props.alert.error(invalidFiles.join(', ') + (invalidFiles.length > 1 ? ' have' : ' has') + 'incorrect format');
            }
        }
    };

    clickInput = () => this.fileMultipleInputRef.current.click();

    deleteFacade = fileIndex => {
        const {files} = this.state;
        files.splice(fileIndex, 1);
        this.setState({files});
    };

    onNameChange = (fileIndex, name) => {
        const {files} = this.state;
        files[fileIndex] = {...files[fileIndex], ...{name}};
        this.setState({files});
    };

    onInputFocus = facadeId => {
        const facade = this.facadesRef.current.querySelector(`[data-facade-id='${facadeId}']`);
        facade && facade.scrollIntoView({behavior: 'smooth'});
    };

    render() {
        const {onCancel, userActionData: {house: {title, facades}}} = this.props;
        const {files, preloader} = this.state;

        return (
            <React.Fragment>
                <PopupModal title={`${title} -  Facades Bulk Uploader`}
                            dialogFooterClassName='custom-buttons'
                            modalBodyClass='bulk-uploader-dialogue'
                            dialogClassName='facade-bulk-uploader'
                            onOK={this.saveMultipleFacadeImages}
                            okButtonDisabled={!files.length || preloader >= 0}
                            customFooterButtons={
                                <button className="button primary push-right"
                                        onClick={this.clickInput}>
                                    Add Images
                                </button>
                            }
                            onModalHide={onCancel}
                >
                    {
                        preloader >= 0 &&
                        <React.Fragment>
                            <LoadingSpinner/>
                            <p>Please wait, uploading a file #{preloader + 1} of {files.length} ...</p>
                        </React.Fragment>
                    }
                    {
                        facades.length > 0 &&
                        <p className="annotation">New facade image files will be appended to existing ones.</p>
                    }
                    {
                        files.length > 0
                            ? <ContentPanel className={preloader >= 0 ? 'hidden' : null}>
                                <LeftPanel>
                                    <header>Please select an 16x10 area on each facade image</header>
                                    <ul className='facades-container' ref={this.facadesRef}>
                                        <FacadesList files={files}
                                                     setCropperRef={this.setCropperRef}
                                        />
                                    </ul>
                                </LeftPanel>
                                <RightPanel>
                                    <header>Facade names</header>
                                    <TitlesList files={files}
                                                onInputFocus={this.onInputFocus}
                                                onNameChange={this.onNameChange}
                                                deleteFacade={this.deleteFacade}
                                    />
                                </RightPanel>
                            </ContentPanel>
                            : <p>Please add some facade images to upload.</p>
                    }


                    <input type="file"
                           accept='image/*'
                           multiple={true}
                           name='facade-images-uploader'
                           style={{display: 'none'}}
                           onChange={this.onInputFilesChange}
                           ref={this.fileMultipleInputRef}
                    />
                </PopupModal>
            </React.Fragment>
        );
    }
}

const TitlesList = ({files, deleteFacade, onNameChange, onInputFocus}) => (
    files.map((file, fileIndex) =>
        <div className='landspot-input' key={file.key}>
            <input type='text'
                   value={file.name}
                   maxLength={160}
                   onFocus={() => onInputFocus(file.key)}
                   onChange={e => onNameChange(fileIndex, e.target.value)}
            />
            <button type='button'
                    className={'button  transparent'}
                    onClick={() => deleteFacade(fileIndex)}>
                <i className="fal fa-trash"/>
            </button>
        </div>
    )
);

const FacadesList = ({files, setCropperRef}) => (
    files.map((file, index) =>
        <li key={file.key} data-facade-id={file.key}>
            <div className='title ellipsis'>{file.name} ({index + 1}/{files.length})</div>
            <Cropper
                key={file.key}
                autoCropArea={1}
                viewMode={1}
                src={file.objectURL}
                style={{height: '33vh'}}
                aspectRatio={16 / 10}
                guides={true}
                zoomable={false}
                ref={ref => setCropperRef(file.key, ref)}
            />
        </li>
    )
);

export default withAlert(FacadeBulkUploaderDialog);