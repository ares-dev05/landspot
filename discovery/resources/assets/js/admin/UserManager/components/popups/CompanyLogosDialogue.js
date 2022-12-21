import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import FileUploader from '~/file-uploader/FileUploader';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';

const logosType = {
    company_logo: 'Card logo (16:10)',
    company_small_logo: 'Small logo (20px x 20px)',
    company_expanded_logo: 'Expanded logo (170px x 20px)',
};

class CompanyLogosDialogue extends Component {

    static propTypes = {
        company: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        getCompanyData: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        userActionData: PropTypes.object.isRequired
    };

    componentDidMount() {
        this.props.getCompanyData(this.props.userActionData.company);
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    constructor(props) {
        super(props);
        this.state = {
            uploadingFile: {}
        };
    }

    renderLogo = (type) => {
        const {company} = this.props.popupDialog;
        const uploadingFile = this.state.uploadingFile[type];

        return <tr key={type}>
            <td>{logosType[type]}</td>
            <td>
                <FileUploader
                    className={`logo ${type}`}
                    baseUrl='/landspot/lot-package'
                    acceptMime='image/*'
                    bodyFields={{id: this.props.lotId}}
                    chooseFileButton={
                        uploadingFile
                            ? <LoadingSpinner className={'overlay'}/>
                            : <button type='button'
                                      className='button transparent logo-btn'
                                      style={
                                          {
                                              backgroundImage: `url('${company[type]}')`,
                                              visibility: uploadingFile ? 'hidden' : 'visible'
                                          }
                                      }>
                            </button>
                    }
                    beforeUpload={() => this.beforeUpload(type)}
                    uploadError={() => this.fileUploadError(type)}
                    uploadSuccess={() => this.fileUploaded(type)}
                />
            </td>
        </tr>;
    };

    renderDialog = () => {
        return <table className='company-logos'>
            <tbody>
            {
                Object.keys(logosType).map(type => this.renderLogo(type))
            }
            </tbody>
        </table>;
    };

    render() {
        const {company} = this.props.popupDialog;
        const {onCancel} = this.props;
        return <PopupModal title="Upload company logos"
                           dialogClassName={'company-logo-dialog'}
                           showDialog={true}
                           onOK={onCancel}
                           onModalHide={onCancel}>
            {
                company
                    ? this.renderDialog()
                    : <LoadingSpinner isStatic={true} className={'overlay'}/>
            }
        </PopupModal>;
    }
}

export default connect(
    (state => ({popupDialog: state.popupDialog})), actions
)(CompanyLogosDialogue);