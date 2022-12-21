import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers.js';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {connect} from 'react-redux';
import * as actions from '../../store/popupDialog/actions';
import FileUploader from '~/file-uploader/FileUploader';
import store from '../../store';

class LotmixProfileDialog extends Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        setCompanyProfileData: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        company: PropTypes.shape({
            description: PropTypes.string,
            email: PropTypes.string,
            phone: PropTypes.string,
            website: PropTypes.string,
            main_address: PropTypes.string,
            video_link: PropTypes.string,
            main_image_path: PropTypes.string
        }).isRequired,
    };

    constructor(props) {
        super(props);
        const {
            description,
            website,
            email,
            phone,
            main_address,
            video_link,
            main_image_path
        } = props.company;

        this.state = {
            description,
            website,
            email,
            phone,
            main_address,
            video_link,
            main_image_path: null,
            preloader: false,
            errors: [],
        };
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {ajax_success, errors, fetch},
            onCancel,
            alert: {error},
        } = props;
        let newState = {};

        if (ajax_success) {
            onCancel();
            return null;
        }

        if (errors && errors.length) {
            newState.errors = errors;
            newState.preloader = false;
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }

        if (fetch) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_POPUP_FETCH_FLAG'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    onInputChange = (data) => {
        this.setState({...this.state, ...data, errors: []});
    };

    fileUploadError = error => {
        if (error.errors && error.errors.file && error.errors.file.length) {
            this.props.alert.error(error.errors.file.join('\n'));
        }
        this.setState({preloader: false});
    };

    beforeUpload = () => {
        this.setState({preloader: true});
    };

    fileUploaded = ({name, fileName, storagePath = ''}) => {
        this.setState({
            ...this.state,
            imageName: fileName,
            preloader: false,
            main_image_path: name
        });
        this.props.alert.success('The image has been uploaded');
    };

    saveCompanyProfile = () => {
        const {
            description,
            website, phone,
            main_address,
            video_link,
            main_image_path
        } = this.state;
        this.props.setCompanyProfileData({
            description,
            website,
            phone,
            main_address,
            video_link,
            main_image_path
        });
        this.setState({preloader: true});
    };

    render() {
        const {
            description,
            website,
            email,
            phone,
            preloader,
            main_address,
            video_link,
            main_image_path
        } = this.state;
        const {onCancel} = this.props;
        return (
            <PopupModal title="Edit Details"
                        dialogClassName={'wide-popup house-details'}
                        onOK={this.saveCompanyProfile}
                        onModalHide={onCancel}
            >
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                    <p className='annotation'>Please enter the following data for a company profile.</p>
                    <div className="modal-form">
                        <div className="form-rows">
                            <div className="form-row">
                                <div className="row-column">Email</div>
                                <div className="row-column">
                                    <div className="landspot-input">
                                        <input type="email" name="email"
                                               placeholder="Email"
                                               maxLength="255"
                                               disabled
                                               value={email || 'no email for company'}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">Website</div>
                                <div className="row-column">
                                    <div className="landspot-input">
                                        <input type="text" name="website"
                                               placeholder="Website"
                                               maxLength="255"
                                               value={website || ''}
                                               onChange={(e) => this.onInputChange({website: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">Head Office Address</div>
                                <div className="row-column">
                                    <div className="landspot-input">
                                        <input type="text" name="main_address"
                                               placeholder="Head Office Address"
                                               maxLength="255"
                                               value={main_address || ''}
                                               onChange={(e) => this.onInputChange({main_address: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">Video link</div>
                                <div className="row-column">
                                    <div className="landspot-input">
                                        <input type="text" name="video_link"
                                               placeholder="Video link"
                                               maxLength="255"
                                               value={video_link || ''}
                                               onChange={(e) => this.onInputChange({video_link: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">Phone</div>
                                <div className="row-column">
                                    <div className="landspot-input">
                                        <input type="text" name="phone"
                                               placeholder="Phone"
                                               maxLength="255"
                                               value={phone || ''}
                                               onChange={(e) => this.onInputChange({phone: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">Description</div>
                                <div className="row-column">
                                    <div className="landspot-input">
                                        <textarea name="description" rows="4"
                                                  placeholder="Description"
                                                  value={description || ''}
                                                  onChange={(e) => this.onInputChange({description: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="row-column">Main image</div>
                                <div className="row-column">
                                    <FileUploader
                                        className="file-upload"
                                        baseUrl="/manager/company/upload-image"
                                        acceptMime="image/*"
                                        fileFieldName="file"
                                        chooseFileButton={
                                            <button
                                                disabled={false}
                                                className="button transparent"
                                            >
                                                <i className="landspot-icon cloud-upload"/>
                                                Choose an image to upload
                                            </button>
                                        }
                                        uploadError={this.fileUploadError}
                                        uploadSuccess={this.fileUploaded}
                                        beforeUpload={this.beforeUpload}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </PopupModal>);
    }
}

export default withAlert(connect(
    (state => ({
        popupDialog: state.popupDialog,
    })), actions
)(LotmixProfileDialog));