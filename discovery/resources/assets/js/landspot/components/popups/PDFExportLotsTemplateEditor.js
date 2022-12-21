import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import TextareaAutosize from 'react-autosize-textarea';
import {SketchPicker} from 'react-color';

import FileUploader from '~/file-uploader/FileUploader';
import {clickHandler, LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import NiceDropdown from '~/helpers/NiceDropdown';

import * as actions from '../../store/popupDialog/actions';
import store from '~/landspot/store';

class PDFExportLotsTemplateEditor extends React.Component {
    static propTypes = {
        userActionData: PropTypes.shape({
            estate: PropTypes.object.isRequired,
        }).isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        getPDFTemplate: PropTypes.func.isRequired,
        updatePDFTemplate: PropTypes.func.isRequired,
    };

    static fontsFamilies = [
        'Arial', 'Helvetica', 'Tahoma',
        'Verdana, sans-serif',
        'Times New Roman, serif',
        'Georgia, serif',
        'Courier, monospace'
    ];

    constructor(props) {
        super(props);
        this.state = {
            templateData: {
                template_data: {}
            },
            preloader: false,
            uploadingHeaderImage: false,
            uploadingFooterImage: false
        };
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidMount() {
        const {
            userActionData,
            getPDFTemplate,
            alert: {error},
            onCancel
        } = this.props;

        if (userActionData) {
            getPDFTemplate(userActionData.estate);
            this.setState({preloader: true});
        } else {
            error('Invalid userActionData');
            onCancel();
        }
    }

    static getDerivedStateFromProps(props) {
        const {
            popupDialog: {
                fetch,
                template,
                ajax_success
            },
            alert: {show}
        } = props;

        let newState = {};
        if (fetch) {
            newState.templateData = template;
            newState.preloader = false;
            store.dispatch({type: 'RESET_POPUP_FETCH_FLAG'});
        }

        if (ajax_success) {
            show(ajax_success, {type: 'success'});
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    setColorPicker = (activeColorPicker) => {
        this.setState({activeColorPicker});
    };

    setUploadImageState = (data) => {
        this.setState(data);
    };

    saveValue = (data) => {
        let {templateData} = this.state;
        templateData.template_data = {...templateData.template_data, ...data};
        this.setState({templateData});
    };

    saveColorValue = (name, color) => {
        let {templateData} = this.state;
        templateData.template_data[name] = color;
        this.setState({templateData});
    };

    setLogo = (url, filename, imageType) => {
        let {templateData} = this.state;
        templateData[imageType] = url;
        templateData['new-' + imageType] = filename;
        this.setState({templateData});
    };

    removeLogo = (imageType) => {
        let {templateData} = this.state;
        templateData[imageType] = null;
        templateData['new-' + imageType] = '';
        this.setState({templateData});
    };

    updatePDFTemplate = () => {
        const {
            userActionData: {estate},
            updatePDFTemplate
        } = this.props;
        const {templateData} = this.state;

        updatePDFTemplate(templateData, estate);
        this.setState({preloader: true});
    };

    render() {
        const {
            uploadingHeaderImage,
            uploadingFooterImage,
            preloader,
            templateData: {template_data, headerImage, footerImage},
            activeColorPicker
        } = this.state;

        const {
            templateFont, tableHeadFontColor, tableHeadColor,
            tableTextColor, tableBodyOddRowColor, tableBodyEvenRowColor
        } = template_data;
        const defaultFont = PDFExportLotsTemplateEditor.fontsFamilies[0];


        return (
            <PopupModal dialogClassName={'wide-popup pdf-template-editor'}
                        topActionButtons={true}
                        okButtonTitle={'Save changes'}
                        title={'Format PDF Price List'}
                        onOK={this.updatePDFTemplate}
                        onModalHide={this.props.onCancel}>
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'}/>}
                    <header>
                        <div>
                            <div className='label'>BODY FONT</div>

                            <NiceDropdown
                                defaultItem={null}
                                defaultValue={defaultFont}
                                items={
                                    PDFExportLotsTemplateEditor.fontsFamilies.map(
                                        item => ({value: item, text: item})
                                    )
                                }
                                onChange={rangeId => this.saveValue({templateFont: rangeId})}
                                value={templateFont || defaultFont}
                            />
                        </div>

                        <div className="colorpickers">
                            <div className='label'>PRICE LIST COLOURS</div>
                            <ColorPicker
                                textLabel="Header"
                                name="tableHeadFontColor"
                                value={tableHeadFontColor || '#131313'}
                                saveColorValue={this.saveColorValue}
                                activeColorPicker={activeColorPicker}
                                setColorPicker={this.setColorPicker}
                            />
                            <ColorPicker
                                textLabel="Header Background"
                                name="tableHeadColor"
                                value={tableHeadColor || '#F5F5F5'}
                                saveColorValue={this.saveColorValue}
                                activeColorPicker={activeColorPicker}
                                setColorPicker={this.setColorPicker}
                            />
                            <ColorPicker
                                textLabel="Body"
                                name="tableTextColor"
                                value={tableTextColor || '#333333'}
                                saveColorValue={this.saveColorValue}
                                activeColorPicker={activeColorPicker}
                                setColorPicker={this.setColorPicker}
                            />
                            <ColorPicker
                                textLabel="Odd Row"
                                name="tableBodyOddRowColor"
                                value={tableBodyOddRowColor || '#FFFFFF'}
                                saveColorValue={this.saveColorValue}
                                activeColorPicker={activeColorPicker}
                                setColorPicker={this.setColorPicker}
                            />
                            <ColorPicker
                                textLabel="Even Row"
                                name="tableBodyEvenRowColor"
                                value={tableBodyEvenRowColor || '#FFFBE2'}
                                saveColorValue={this.saveColorValue}
                                activeColorPicker={activeColorPicker}
                                setColorPicker={this.setColorPicker}
                            />
                        </div>
                    </header>

                    <div className="pdf-template-container"
                         style={{
                             fontFamily: templateFont
                         }}>
                        <div className="wrapper">
                            <div className="page">
                                <HeaderImage headerImage={headerImage}
                                             removeLogo={this.removeLogo}
                                             setLogo={this.setLogo}
                                             setUploadImageState={this.setUploadImageState}
                                             uploadingImage={uploadingHeaderImage}
                                />
                                <TextareaAutosize
                                    maxLength="500"
                                    name="introText"
                                    spellCheck={false}
                                    placeholder="Text on the first page"
                                    value={template_data.introText}
                                    onChange={e => this.saveValue({introText: e.target.value})}
                                />
                                <TextareaAutosize
                                    maxLength="100"
                                    name="titleText"
                                    className="title-text"
                                    placeholder="Title text"
                                    value={template_data.titleText}
                                    onChange={e => this.saveValue({titleText: e.target.value})}
                                />
                                <StagesExampleTable template_data={template_data}/>
                                <TextareaAutosize
                                    maxLength="500"
                                    name="disclaimerText"
                                    placeholder="Disclaimer text"
                                    value={template_data.disclaimerText}
                                    onChange={e => this.saveValue({disclaimerText: e.target.value})}
                                />
                                <FooterImage footerImage={footerImage}
                                             removeLogo={this.removeLogo}
                                             setLogo={this.setLogo}
                                             setUploadImageState={this.setUploadImageState}
                                             uploadingImage={uploadingFooterImage}
                                />
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </PopupModal>
        );
    }
}

const HeaderImage = ({headerImage, setLogo, removeLogo, setUploadImageState, uploadingImage}) => {
    const logoType = 'headerImage';
    return (
        headerImage
            ?
            <header style={{backgroundImage: `url('${headerImage}')`}}>
                <a title="Delete image"
                   onClick={(e) => clickHandler(e, removeLogo(logoType))}
                   className='trash-link'
                   href="#" aria-hidden="true">
                    <i className='landspot-icon trash'/>
                </a>
            </header>
            :
            <header>
                <FileUploader
                    baseUrl={'/landspot/pdf-template/upload-image'}
                    className="image-uploader"
                    chooseFileButton={
                        <button type="button"
                                className="button transparent placeholder-text">
                            <span>
                                <i className='landspot-icon cloud-upload'/>
                                Click to upload a header image
                            </span>
                            <span className="helper">(190mm x 20mm. Max 500kb)</span>
                        </button>
                    }
                    beforeUpload={() => setUploadImageState({uploadingHeaderImage: true})}
                    uploadError={() => setUploadImageState({uploadingHeaderImage: false})}
                    uploadSuccess={({url, name}) => {
                        setLogo(url, name, logoType);
                        setUploadImageState({uploadingHeaderImage: false});
                    }}
                />
                {uploadingImage && <LoadingSpinner/>}
            </header>
    );
};

const FooterImage = ({footerImage, setLogo, removeLogo, setUploadImageState, uploadingImage}) => {
    const logoType = 'footerImage';
    return (
        footerImage
            ?
            <footer style={{backgroundImage: `url('${footerImage}')`}}>
                <a title="Delete image"
                   onClick={(e) => clickHandler(e, removeLogo(logoType))}
                   className='trash-link'
                   href="#" aria-hidden="true">
                    <i className='landspot-icon trash'/>
                </a>
            </footer>
            :
            <footer>
                <FileUploader
                    baseUrl={'/landspot/pdf-template/upload-image'}
                    className="image-uploader"
                    chooseFileButton={
                        <button type="button"
                                className="button transparent placeholder-text">
                            <span>
                                <i className='landspot-icon cloud-upload'/>
                                Click to upload a footer image
                            </span>
                            <span className="helper">(190mm x 20mm. Max 500kb)</span>
                        </button>
                    }
                    beforeUpload={() => setUploadImageState({uploadingFooterImage: true})}
                    uploadError={() => setUploadImageState({uploadingHeaderImage: false})}
                    uploadSuccess={({url, name}) => {
                        setLogo(url, name, logoType);
                        setUploadImageState({uploadingFooterImage: false});
                    }}
                />
                {uploadingImage && <LoadingSpinner/>}
            </footer>
    );
};

const StagesExampleTable = ({
                                template_data,
                            }) => {
    const {
        tableHeadFontColor, tableHeadColor, tableTextColor, tableBodyOddRowColor,
        tableBodyEvenRowColor
    } = template_data;
    return <div className="stages-table">
        <div className="header table-header">
            <div className="title">Stage Name</div>
        </div>
        <table className="table">
            <thead style={{
                color: tableHeadFontColor,
                background: tableHeadColor
            }}
            >
            <tr>
                <th>LOT NO</th>
                <th>COLUMN 1</th>
                <th>COLUMN 2</th>
                <th>COLUMN ...</th>
                <th>COLUMN N</th>
            </tr>
            </thead>
            <tbody style={{color: tableTextColor}}>
            <tr style={{
                backgroundColor: tableBodyOddRowColor
            }}>
                <td>1</td>
                <td>Example value 1</td>
                <td>Example value 2</td>
                <td>Example value ...</td>
                <td>Example value N</td>
            </tr>
            <tr style={{
                backgroundColor: tableBodyEvenRowColor
            }}>
                <td>2</td>
                <td>Example value 1</td>
                <td>Example value 2</td>
                <td>Example value ...</td>
                <td>Example value N</td>
            </tr>
            <tr style={{
                backgroundColor: tableBodyOddRowColor
            }}>
                <td>3</td>
                <td>Example value 1</td>
                <td>Example value 2</td>
                <td>Example value ...</td>
                <td>Example value N</td>
            </tr>
            </tbody>
        </table>
    </div>;
};

const ColorPicker = ({
                         activeColorPicker,
                         name,
                         saveColorValue,
                         setColorPicker,
                         textLabel,
                         value,
                     }) => {

    return <label>
        {textLabel}

        <div className="picker"
             style={{
                 backgroundColor: value
             }}
             onClick={() => setColorPicker(name)}/>
        <div className="landspot-input">
            <input type="text"
                   readOnly
                   value={value}
                   onClick={() => setColorPicker(name)}
            />
        </div>
        {
            activeColorPicker === name &&
            <div className="colorpicker-wrapper">
                <button className="button close transparent"
                        type="button"
                        onClick={e => {
                            clickHandler(e, () => setColorPicker(null));
                        }}>
                    <i className="landspot-icon times"/>
                </button>
                <SketchPicker
                    color={value}
                    disableAlpha={true}
                    onChange={data => saveColorValue(name, data.hex)}
                    onChangeComplete={data => saveColorValue(name, data.hex)}
                />
            </div>
        }
    </label>;
};

export default withAlert(connect(
    (state => ({popupDialog: state.popupDialog})), actions
)(PDFExportLotsTemplateEditor));