import React from 'react';
import ReactUploadFile from './ReactUploadFile';

const FileUploader = props => {
    let {
        acceptMime,
        baseUrl,
        beforeUpload,
        bodyFields,
        chooseFileButton,
        className,
        didChoose,
        fileFieldName,
        progressCallback,
        uploadError,
        uploadSuccess
    } = props;

    let options = {
        baseUrl: baseUrl,
        query: files => {},
        body: bodyFields || {},
        dataType: 'json',
        multiple: props.multiple || false,
        accept: acceptMime || 'image/*',
        fileFieldName: fileFieldName || 'image',
        requestHeaders: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        beforeChoose: () => true,
        didChoose: () => didChoose,
        beforeUpload: () => {
            beforeUpload && beforeUpload();
            return true;
        },
        uploading: progress => {
            progressCallback && progressCallback(progress);
        },
        uploadSuccess: response => {
            uploadSuccess(response);
        },
        uploadError: err => {
            uploadError && uploadError(err);
        }
    };

    let meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) {
        let token = meta.getAttribute('content');
        if (token) options.requestHeaders['X-CSRF-TOKEN'] = token;
    }

    return (
        <ReactUploadFile
            options={options}
            className={className}
            chooseFileButton={chooseFileButton}
        />
    );
};

export default FileUploader;
