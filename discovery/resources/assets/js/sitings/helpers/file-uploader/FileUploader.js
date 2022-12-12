import React from 'react';
import ReactUploadFile from './ReactUploadFile';

const FileUploader = (props) => {
    let {
        acceptMime,
        baseUrl,
        beforeUpload,
        bodyFields,
        chooseFileButton,
        className,
        didChoose,
        fileFieldName,
        multiple,
        progressCallback,
        uploadError,
        uploadSuccess,
        onProgress
    } = props;

    let options = {
        baseUrl: baseUrl,
        query: (/*files*/) => {},
        body: bodyFields || {},
        dataType: 'json',
        multiple,
        accept: acceptMime || 'image/*',
        fileFieldName: multiple ? fileFieldName + '[]' : fileFieldName,
        requestHeaders: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        beforeChoose: () => true,
        didChoose: () => didChoose,
        beforeUpload: (files) => {
            beforeUpload && beforeUpload(files);
            return true;
        },
        uploading: (progress) => {
            progressCallback && progressCallback(progress);
        },
        uploadSuccess: (response) => {
            uploadSuccess(response);
        },
        uploadError: (err) => {
            uploadError && uploadError(err);
        },
        onProgress: percent => onProgress && onProgress(percent)
    };

    let meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) {
        let token = meta.getAttribute('content');
        if (token) options.requestHeaders['X-CSRF-TOKEN'] = token;
    }

    return <ReactUploadFile {...{options, className, chooseFileButton}}/>;
};

export default FileUploader;