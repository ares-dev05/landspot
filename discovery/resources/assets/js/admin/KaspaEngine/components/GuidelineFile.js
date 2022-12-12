import React from 'react';

import FileUploader from '../../../file-uploader/FileUploader';
import {ConfirmDeleteDialog} from '~/popup-dialog/PopupModal';

const GuidelineFile = ({
                               stage,
                               doc,
                               confirmDelete,
                               onDeletePackage,
                               onConfirmDelete,
                               onUpdatePackage,
                               onUpdatePackageError,
                               onUpdatePackageProgress,
                           }) => {
    return (
        <React.Fragment>
            {
                doc
                    ? <div className='file'>
                        <a rel="noopener noreferrer"
                           target='_blank'
                           title={doc.name}
                           href={doc.viewURL}>
                            <i className="fal fa-download"/>
                            {doc.name ? doc.name : 'Noname.pdf'}
                        </a>
                        <button type='button'
                                onClick={() => onConfirmDelete({confirmDelete: true})}
                                className='button transparent trash-btn'
                                title='Delete file'>
                            <i className='landspot-icon times'/>
                        </button>
                    </div>
                    : <FileUploader
                        className='file'
                        baseUrl='/kaspa-engine/store-pdf'
                        acceptMime={'application/pdf'}
                        fileFieldName="file"
                        bodyFields={{stage_id: stage.id, type: 2}}
                        chooseFileButton={
                            <a href='#' className='empty'>
                                <i className='landspot-icon upload'/>
                                Choose a file to upload
                            </a>
                        }
                        uploadError={onUpdatePackageError}
                        uploadSuccess={onUpdatePackage}
                        beforeUpload={onUpdatePackageProgress}
                    />
            }
            {
                confirmDelete &&
                <ConfirmDeleteDialog onConfirm={() => onDeletePackage(true, doc.id)}
                                     userActionData={{
                                         itemType: doc.name + '  for stage',
                                         itemName: stage.name
                                     }}
                                     onCancel={() => onDeletePackage(false)}
                />
            }
        </React.Fragment>
    );
};

export default GuidelineFile;