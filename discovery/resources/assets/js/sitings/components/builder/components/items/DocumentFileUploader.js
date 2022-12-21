import React from 'react';
import FileUploader from '~sitings~/helpers/file-uploader/FileUploader';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~sitings~/helpers';

class DocumentFileUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            uploadingFile: false,
        };
    }

    static propTypes = {
        buttonClass: PropTypes.string,
        buttonTitle: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
        customFields: PropTypes.object,
        disabled: PropTypes.bool,
        multiple: PropTypes.bool,
        onFileUploaded: PropTypes.func.isRequired,
        uploadURL: PropTypes.string.isRequired,
    };

    fileUploaded = (args) => {
        this.setState({
            uploadingFile: false,
        });
        this.props.onFileUploaded(args);
    };

    fileUploadError = (data) => {
        this.setState({
            uploadingFile: false,
        });

        const {errors} = data;

        this.setState({
            uploadingFile: false,
        });

        if (errors && errors.file && errors.file.length) {
            this.props.alert.error(
                <React.Fragment>
                    {
                        errors.file.map((item, i) => <div key={i}>{item}</div>)
                    }
                </React.Fragment>
            );
        }
    };

    fileProgess = () => {
        this.setState({uploadingFile: true});
    };

    render() {
        const {mimeType, buttonTitle, uploadURL, buttonClass, customFields, disabled, multiple} = this.props;

        return (
            <FileUploader
                bodyFields={customFields}
                baseUrl={uploadURL}
                acceptMime={mimeType}
                fileFieldName='files'
                chooseFileButton={
                    this.state.uploadingFile
                        ? <LoadingSpinner isStatic={true}/>
                        : <button type='button'
                                  className={classnames('upload-btn', buttonClass)}
                                  disabled={disabled}>
                            {buttonTitle}
                        </button>
                }
                beforeUpload={this.fileProgess}
                uploadError={this.fileUploadError}
                uploadSuccess={this.fileUploaded}
                multiple={multiple}
            />
        );
    }
}

export default withAlert(DocumentFileUploader);