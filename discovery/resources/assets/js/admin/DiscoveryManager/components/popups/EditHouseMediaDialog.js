import React from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import {connect} from 'react-redux';
import UserAction from '../consts';
import MediaFile from './MediaFile';
import store from '../../store';

class EditHouseMediaDialog extends React.Component {
    static propTypes = {
        onCancel: PropTypes.func.isRequired,
        getHouseMedia: PropTypes.func.isRequired,
        updateHouseMedia: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        setUserAction: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.dialog = null;

        this.state = {
            preloader: false,
            newMedia: []
        };

        this.mediaFiles = [];
    }

    componentDidMount() {
        const {userActionData: {house, mediaType}, getHouseMedia} = this.props;
        getHouseMedia({mediaType}, house);
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {
                errors,
                fetch,
            },
            alert: {error},
        } = props;
        let newState = {};

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
            newState.newMedia = [];
            store.dispatch({type: 'RESET_POPUP_FETCH_FLAG'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    disableUploadBtn = (preloader) => {
        this.setState({preloader});
    };

    saveMediaFiles = () => {
        const {userActionData: {house, mediaType}, updateHouseMedia} = this.props;

        const mediaFiles = this.mediaFiles.map(callback => callback());

        if (mediaFiles.indexOf(false) === -1) {
            this.setState({preloader: true});
            updateHouseMedia({mediaFiles, mediaType}, house);
        } else {
            return false;
        }
    };

    addNewMediaFile = () => {
        let {newMedia} = this.state;
        const {house} = this.props.userActionData;
        newMedia = newMedia.concat({
            house_id: house.id,
            newItemId: Math.round(Math.random() * 1e6)
        });

        this.setState({newMedia});
    };

    removeNewItem = (newItemId) => {
        let {newMedia} = this.state;
        newMedia = newMedia.filter(media => media.newItemId !== newItemId);
        this.setState({newMedia});
    };

    mediaFilesList = () => {
        const {
            userActionData: {house, mediaType},
            popupDialog: {media}
        } = this.props;
        const {newMedia} = this.state;

        switch (mediaType) {
            case 'floorplans':
                return <React.Fragment>
                    <p className='annotation'>Please upload an image file of the standard floorplan.</p>
                    <div className="modal-form">
                        <div className="form-rows">
                            {media.map(
                                (mediaItem, mediaIndex) => {
                                    return <React.Fragment key={mediaIndex}>
                                        {mediaItem.floor &&
                                        <p className='annotation'>Ground Floor / First Floor image</p>
                                        }
                                        <MediaFile house={house}
                                                   onMount={
                                                       validationCallback => this.mediaFiles[mediaIndex] = validationCallback
                                                   }
                                                   mediaType={mediaType}
                                                   mediaItem={mediaItem}
                                                   disableUploadBtn={this.disableUploadBtn}
                                        />
                                    </React.Fragment>;
                                }
                            )}
                        </div>
                    </div>
                </React.Fragment>;
            default:
                return <React.Fragment>
                    <p className='annotation'>
                        {mediaType === 'facades' && 'Please upload a render image for each facade.'}
                        {mediaType === 'gallery' && 'Please upload any interior & exterior images of this floorplan design.'}
                        {mediaType === 'options' && 'Please upload an image file that displays the floorplan option.'}
                    </p>
                    <div className="modal-form">
                        <div className="form-rows">
                            {
                                [...media, ...newMedia].map(
                                    (mediaItem, mediaIndex) => <MediaFile key={mediaIndex}
                                                                          onMount={
                                                                              validationCallback => this.mediaFiles[mediaIndex] = validationCallback
                                                                          }
                                                                          house={house}
                                                                          mediaType={mediaType}
                                                                          mediaItem={mediaItem}
                                                                          removeNewItem={() => this.removeNewItem(mediaItem.newItemId)}
                                                                          disableUploadBtn={this.disableUploadBtn}
                                    />
                                )
                            }

                            <div className="form-row">
                                <button type='button'
                                        onClick={() => this.addNewMediaFile()}
                                        className="button default">Add
                                </button>
                            </div>
                        </div>
                    </div>
                </React.Fragment>;
        }

    };

    switchToBulkUploader = () => {
        const {userActionData: {house}} = this.props;
        this.props.setUserAction(UserAction.SHOW_FACADE_BULK_UPLOADER_DIALOG, {house});
    };

    render() {
        const {
            userActionData: {house, mediaType},
            popupDialog: {media}
        } = this.props;
        const {preloader} = this.state;
        const title = `Edit ${mediaType} - ${house.title}`;
        return (
            <PopupModal title={title}
                        customFooterButtons={
                            mediaType === 'facades'
                                ? <button className="button primary push-right" onClick={this.switchToBulkUploader}>
                                    Switch to Bulk uploader
                                </button>
                                : null
                        }
                        dialogClassName={'wide-popup house-details file-upload-modal'}
                        dialogFooterClassName={mediaType === 'facades' ? 'custom-buttons' : null}
                        okButtonDisabled={preloader}
                        onOK={this.saveMediaFiles}
                        okButtonTitle='Upload'
                        onModalHide={this.props.onCancel}
            >
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                    {media
                        ? (this.mediaFilesList())
                        : <LoadingSpinner isStatic={true}/>}
                </React.Fragment>
            </PopupModal>
        );
    }
}


export default withAlert(connect(
    (state => ({popupDialog: state.popupDialog})), actions
)(EditHouseMediaDialog));
