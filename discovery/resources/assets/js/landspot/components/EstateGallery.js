import React from 'react';
import PropTypes from 'prop-types';
import FileUploader from '~/file-uploader/FileUploader';
import {EstateDataContext} from './Estate-new';
import UserAction from './estate/consts';

const EstateGallery = ({
    gallery,
    imageUploadBefore,
    imageUploadError,
    imageUploaded,
    deleteImage,
    estateId
}) => {
    return (
        <EstateDataContext.Consumer>
            {({setUserAction}) => (
                <div className="estate-gallery">
                    <div className="estate-gallery-header">Estate Gallery</div>
                    <div className="gallery">
                        {gallery.length < 4 && (
                            <div className="gallery-image">
                                <FileUploader
                                    baseUrl={`/landspot/estate/${estateId}/estate-gallery`}
                                    acceptMime="image/*"
                                    fileFieldName="files[]"
                                    multiple
                                    className="file-loader"
                                    chooseFileButton={
                                        <div className="add-image-block">
                                            <i className="fal fa-plus-circle fa-2x"></i>
                                            <p>ADD NEW GALLERY IMAGE</p>
                                        </div>
                                    }
                                    beforeUpload={imageUploadBefore}
                                    uploadError={imageUploadError}
                                    uploadSuccess={imageUploaded}
                                />
                            </div>
                        )}
                        {gallery.map(({id, file_url}) => (
                            <div
                                className="gallery-image"
                                key={id}
                                style={{backgroundImage: `url(${file_url})`}}
                            >
                                <button
                                    className="delete-button"
                                    onClick={() => {
                                        setUserAction(
                                            UserAction.CONFIRM_REMOVE_IMAGE,
                                            {
                                                deleteImage() {
                                                    deleteImage({
                                                        estateId,
                                                        imageId: id
                                                    });
                                                    setUserAction(null);
                                                }
                                            }
                                        );
                                    }}
                                >
                                    DELETE
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </EstateDataContext.Consumer>
    );
};

EstateGallery.propTypes = {
    gallery: PropTypes.array,
    imageUploadBefore: PropTypes.func.isRequired,
    imageUploadError: PropTypes.func.isRequired,
    imageUploaded: PropTypes.func.isRequired,
    deleteImage: PropTypes.func.isRequired,
    estateId: PropTypes.number.isRequired
};
EstateGallery.defaultProps = {
    gallery: []
};

export default EstateGallery;
