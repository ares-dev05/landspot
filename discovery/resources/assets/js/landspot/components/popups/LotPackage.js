import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {Fragment, Component} from 'react';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers';

import FileUploader from '~/file-uploader/FileUploader';
import NiceDropdown from '~/helpers/NiceDropdown';
import {ConfirmDeleteDialog} from '../../../popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';

const PackageCtx = React.createContext();

class LotPackage extends Component {
    static propTypes = {
        deleteLotPackage: PropTypes.func.isRequired,
        getLotPackagesForUpload: PropTypes.func.isRequired,
        onMount: PropTypes.func.isRequired,
        onUnmount: PropTypes.func.isRequired,
        packageIndex: PropTypes.number.isRequired,
        selectedFilters: PropTypes.object.isRequired,
    };

    static defaultPackageData = Object.freeze({
        range_id: '', house_id: '', facade_id: '', price: '', fileName: ''
    });

    constructor(props) {
        super(props);

        this.state = {
            packageData: {...LotPackage.defaultPackageData},
            showDeletionConfirmation: false,
            uploadedFile: null,
            uploadingFile: false,
            validationErrors: {},
        };
    }

    onItemChange = (propertyName, value) => {
        let {packageData, validationErrors} = this.state;
        let options = {};

        options[propertyName] = value;

        switch (propertyName) {
            case 'range_id':
                options['house_id'] = '';
                options['facade_id'] = '';
                break;
            case 'house_id':
                options['facade_id'] = '';
                break;
        }

        Object.assign(packageData, options);
        delete validationErrors[propertyName];

        if (propertyName !== 'price') {
            let query = Object.assign({}, packageData, {
                upload_package: this.props.packageIndex,
                id: this.props.lotId
            });
            this.props.getLotPackagesForUpload(query);
        } else {
            let v = parseInt(value);
            if (v < 0 || isNaN(v)) {
                validationErrors['price'] = true;
            }
        }
        this.setState({packageData, validationErrors});
    };

    getValidatedState = () => {
        const {packageData, validationErrors, uploadedFile} = this.state;
        let result = true;
        if (!packageData.fileName && !uploadedFile) {
            return null;
        }

        for (let key in packageData) {
            if (packageData.hasOwnProperty(key)) {
                let v = packageData[key];
                if (v === '') {
                    result = false;
                    validationErrors[key] = true;
                }
                if (key === 'price') {
                    v = parseInt(v);
                    if (v < 0 || isNaN(v)) {
                        validationErrors[key] = true;
                        result = false;
                    }
                }
            }
        }
        this.setState({validationErrors});
        return result ? {packageData, uploadedFile} : result;
    };

    fileUploaded = ({name, fileName, url}) => {
        this.setState({
            uploadingFile: false,
            uploadedFile: {name, fileName, url}
        });
    };

    fileUploadError = (args) => {
        if (args.errors && args.errors.image) {
            this.props.alert.error(args.errors.image.toString());
        }
        this.setState({uploadingFile: false, uploadedFile: null});
    };

    beforeUpload = () => {
        this.setState({uploadingFile: true});
    };

    componentDidMount() {
        this.copyPropsToState(this.props);
        this.props.onMount(this.getValidatedState);
    }

    componentWillUnmount() {
        this.props.onUnmount();
    }

    copyPropsToState(props) {
        const packageAttrs = props.lotPackages[props.packageIndex];
        const {facade, name} = packageAttrs;
        const {packageData} = this.state;
        packageData['fileName'] = name;

        if (facade) {
            Object.assign(packageData, {
                price: packageAttrs.price,
                range_id: facade.house.range.id,
                house_id: facade.house.id,
                facade_id: facade.id
            });
        }

        if (packageAttrs.id) {
            packageData.id = packageAttrs.id;
        }
        this.setState({packageData});
    }

    deletePackage = () => {
        this.setState({showDeletionConfirmation: true})
    };

    render() {
        const {packageData, uploadingFile, uploadedFile, validationErrors, showDeletionConfirmation} = this.state;
        const {packageIndex} = this.props;
        const lotPackage = this.props.lotPackages[packageIndex];
        const {facades, houses, ranges} = this.props[`availableData_${packageIndex}`];
        const thumbImage = uploadedFile ? uploadedFile.url : lotPackage['thumbImage'];
        const fileName = uploadedFile ? uploadedFile.fileName : packageData.fileName;

        const contextValues = {
            thumbImage,
            packageData,
            ranges, houses, facades, fileName,
            onItemChange: this.onItemChange,
            getValidationClass: key => validationErrors[key] ? 'has-error' : null
        };
        return (
            <PackageCtx.Provider value={contextValues}>
                <div className='image-uploader'>
                    <FileUploader
                        className='a4-thumb'
                        baseUrl='/landspot/lot-package'
                        acceptMime='application/pdf'
                        bodyFields={{id: this.props.lotId}}
                        chooseFileButton={
                            uploadingFile
                                ? <LoadingSpinner/>
                                : <button type='button'
                                          className={classnames('upload-btn', 'land-btn-upload', thumbImage ? 'has-bg' : null)}
                                          style={
                                              {
                                                  backgroundImage: thumbImage ? `url('${thumbImage}')` : null,
                                                  visibility: uploadingFile ? 'hidden' : 'visible'
                                              }
                                          }>
                                    <div className='titles'>
                                        <div>Upload</div>
                                        <div>PDF</div>
                                        <div>House & Land Packages</div>
                                    </div>
                                </button>
                        }
                        beforeUpload={this.beforeUpload}
                        uploadError={this.fileUploadError}
                        uploadSuccess={this.fileUploaded}
                    />
                </div>
                <div className='package-attributes'>
                    <RangeItem/>
                    {
                        fileName &&
                        <p className="ellipsis filename" title={fileName}>
                            <i className='landspot-icon paperclip'/>
                            {fileName}
                        </p>
                    }
                    {
                        packageData.id &&
                        <button type="button"
                                className="button transparent beg-icon"
                                onClick={this.deletePackage}>
                            <i className='landspot-icon trash'/>Delete package
                        </button>
                    }
                </div>
                {
                    showDeletionConfirmation &&
                    <ConfirmDeleteDialog onConfirm={
                        () => this.props.deleteLotPackage(
                            {filters: this.props.selectedFilters},
                            {id: packageData.id}
                        )
                    }
                                         onCancel={() => this.setState({showDeletionConfirmation: false})}
                                         userActionData={{
                                             itemType: 'package',
                                             itemName: fileName
                                         }}
                    />
                }
            </PackageCtx.Provider>
        );
    }
}

class ReadOnlyLotPackage extends Component {
    static propTypes = {
        packageIndex: PropTypes.number.isRequired,
    };

    static defaultPackageData = Object.freeze({
        range_id: '', house_id: '', facade_id: '', price: '', fileName: '', fileURL: ''
    });

    constructor(props) {
        super(props);

        this.state = {
            packageData: {...LotPackage.defaultPackageData},
        };
    }

    componentDidMount() {
        this.copyPropsToState(this.props);
    }

    copyPropsToState(props) {
        const packageAttrs  = props.lotPackages[props.packageIndex];
        const {
            facade,
            name,
            fileURL = ''
        }                       = packageAttrs;
        const {packageData}     = this.state;
        packageData['fileName'] = name;
        packageData['fileURL']  = fileURL;

        if (facade) {
            Object.assign(packageData, {
                price: packageAttrs.price,
                range_id: facade.house.range.id,
                house_id: facade.house.id,
                facade_id: facade.id
            });
        }

        if (packageAttrs.id) {
            packageData.id = packageAttrs.id;
        }
        this.setState({packageData});
    }

    render() {
        const {packageData}  = this.state;
        const {packageIndex} = this.props;
        const lotPackage     = this.props.lotPackages[packageIndex];
        const thumbImage     = lotPackage['thumbImage'];
        const {facades, houses, ranges} = this.props[`availableData_${packageIndex}`];

        const {
            fileURL, fileName,
            range_id, house_id,
            facade_id, price,
        }            = packageData;
        const range  = ranges.find((range) => range.id === range_id);
        const house  = houses.find((house) => house.id === house_id);
        const facade = facades.find((facade) => facade.id === facade_id);

        return (
            <React.Fragment>
                <div className='image-uploader'>
                    <div className="a4-thumb">
                        <button className={classnames('upload-btn', 'land-btn-upload', thumbImage ? 'has-bg' : null)}
                                style={
                                    {
                                        backgroundImage: thumbImage ? `url('${thumbImage}')` : null,
                                    }
                                }>
                            {fileURL
                                ?
                                <a href={fileURL}
                                   target="_blank" style={{
                                    width: '100%',
                                    display: 'block',
                                    height: '100%'
                                }}/>
                                : 'No package'
                            }
                        </button>
                    </div>
                </div>
                <div className='package-attributes'>
                    <div className="form-rows">
                        <div className="form-row">
                            <div className='landspot-input'>
                                <input type='text'
                                       readOnly={true}
                                       autoComplete="off"
                                       value={range ? range.name : ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landspot-input'>
                                <input type='text'
                                       readOnly={true}
                                       autoComplete="off"
                                       value={house ? house.title : ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landspot-input'>
                                <input type='text'
                                       readOnly={true}
                                       autoComplete="off"
                                       value={facade ? facade.title : ''}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className='landspot-input'>
                                <input type='number'
                                       readOnly={true}
                                       autoComplete="off"
                                       value={price || ''}
                                />
                            </div>
                        </div>
                    </div>
                    {
                        fileName &&
                        <p className="ellipsis filename" title={fileName}>
                            <i className='landspot-icon paperclip'/>
                            {fileName}
                        </p>
                    }
                </div>
            </React.Fragment>
        );
    }
}

const RangeItem = () => (
    <PackageCtx.Consumer>
        {
            ({thumbImage, packageData: {range_id}, ranges, getValidationClass, onItemChange}) =>
                thumbImage
                    ? <Fragment>
                        <NiceDropdown
                            defaultItem='Select a range'
                            defaultValue=''
                            onChange={value => onItemChange('range_id', value)}
                            value={range_id}
                            itemClass={getValidationClass('range_id')}
                            items={ranges.map(({id, name}) => ({text: name, value: id}))}
                        />
                        <HouseItem/>
                    </Fragment>
                    : <p>Please upload a PDF file first</p>
        }
    </PackageCtx.Consumer>
);

const HouseItem = () => (
    <PackageCtx.Consumer>
        {
            ({packageData: {range_id, house_id}, houses, getValidationClass, onItemChange}) =>
                range_id
                    ? <Fragment>
                        <NiceDropdown
                            defaultItem='Select a house'
                            defaultValue=''
                            onChange={value => onItemChange('house_id', value)}
                            value={house_id}
                            items={houses.map(({id, title}) => ({text: title, value: id}))}
                            itemClass={getValidationClass('house_id')}
                        />
                        <FacadeItem/>
                    </Fragment>
                    : <p>Please select a range</p>
        }
    </PackageCtx.Consumer>
);

const FacadeItem = () => (
    <PackageCtx.Consumer>
        {
            ({packageData: {house_id, facade_id, price}, houses, facades, getValidationClass, onItemChange}) =>
                house_id ?
                    <Fragment>
                        <NiceDropdown
                            defaultItem='Select a facade'
                            defaultValue=''
                            onChange={value => onItemChange('facade_id', value)}
                            value={facade_id}
                            items={facades.map(({id, title}) => ({text: title || 'Unnamed facade', value: id}))}
                            itemClass={getValidationClass('facade_id')}
                        />
                        <div className={classnames('landspot-input', getValidationClass('price'))}>
                            <input
                                placeholder="Package Price"
                                type='number'
                                autoComplete="off"
                                onChange={e => onItemChange('price', e.target.value)}
                                maxLength="9"
                                value={price}
                            />
                        </div>
                    </Fragment>
                    : <p>Please select a house</p>
        }
    </PackageCtx.Consumer>
);

export const ReadOnlyLotPackageInstance = withAlert(connect(
    (state => ({
        lotPackages: state.popupDialog.lotPackages,
        availableData_0: state.popupDialog.availableData_0,
        availableData_1: state.popupDialog.availableData_1,
        availableData_2: state.popupDialog.availableData_2,
    })), null, null
)(ReadOnlyLotPackage));

export default withAlert(connect(
    (state => ({
        lotPackages: state.popupDialog.lotPackages,
        availableData_0: state.popupDialog.availableData_0,
        availableData_1: state.popupDialog.availableData_1,
        availableData_2: state.popupDialog.availableData_2,
    })), actions, null
)(LotPackage));
