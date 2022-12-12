import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {withAlert} from 'react-alert';
import {connect} from 'react-redux';
import ImageCropper from '~/image-cropper/ImageCropper';
import {LoadingSpinner} from '~/helpers';
import {FormRowDropdown, FormRowInput} from '~/helpers/FormRow';
import {PopupModal} from '../../../popup-dialog/PopupModal';
import * as actions from '../../store/popupDialog/actions';
import store from '../../store';

const NewEstateContext = React.createContext();

class AddEstateModal extends React.Component {

    static propTypes = {
        regions: PropTypes.array,
        houseStates: PropTypes.array,
        addEstate: PropTypes.func.isRequired,
        updateEstate: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        initialEstateData: PropTypes.object,
        title: PropTypes.string,
        canApprove: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        regions: []
    };

    static defaultFormData = Object.freeze({
        'name': '',
        'website': '',
        'address': '',
        'contacts': '',
        'suburb': '',
        'state_id': '',
        'logoFileName': '',
        'lat': '',
        'long': '',
        'region_id': ''
    });

    constructor(props) {
        super(props);

        this.inputAutocomplete = null;
        this.autocompleteListener = null;
        this.addressInput = null;
        this.state = {
            validationErrors: {},
            uploadingFile: false,
            uploadedFile: null,
            estateId: null,
            preloader: false,
            formData: {...AddEstateModal.defaultFormData}
        };
    }

    componentWillUnmount() {
        this.cleanOldAutocompleteData();
        //skip 1st node (estates map autocomplete)
        Array.prototype.slice.call(document.querySelectorAll('.pac-container'))
            .forEach((node, index) => index > 0 && node.remove(node));
        this.props.resetDialogStore();
    }

    saveValue = (e) => {
        const validationErrors = {...this.state.validationErrors};
        delete validationErrors[e.target.id];
        this.setState({
            validationErrors,
            formData: {...this.state.formData, ...{[e.target.id]: e.target.value}}
        });
    };

    validateData = (data) => {
        const fields = ['name', 'website', 'address', 'contacts', 'suburb', 'state_id', 'lat', 'long', 'region_id'];

        if (!this.props.initialEstateData) {
            fields.push('logoFileName');
        }

        const validationErrors = {};
        fields.forEach(field => {
            if (data[field] == null || data[field].toString().trim() === '') {
                validationErrors[field] = true;
            }

            if (field === 'lat' || field === 'long') {
                let v = parseFloat(data[field]);
                if (isNaN(v) || v === 0) {
                    validationErrors['address'] = true;
                }
            }
        });

        this.setState({validationErrors});
        return Object.keys(validationErrors).length === 0;
    };

    cleanOldAutocompleteData() {
        const google = window['google'];
        if (this.autocompleteListener) {
            google.maps.event.removeListener(this.autocompleteListener);
        }
        if (this.inputAutocomplete) {
            google.maps.event.clearInstanceListeners(this.inputAutocomplete);
        }
        this.autocompleteListener = null;
        this.inputAutocomplete = null;
        this.addressInput = null;
    }

    addAutoComplete = (addressInput) => {
        if (!addressInput) {
            this.cleanOldAutocompleteData();
        }
        this.addressInput = addressInput;
        const {google} = window;

        if (addressInput && !this.inputAutocomplete) {
            this.inputAutocomplete = new google.maps.places.Autocomplete(addressInput, {
                componentRestrictions: {country: 'au'}
            });
            this.inputAutocomplete.setFields(['address_components', 'geometry', 'formatted_address']);
            this.autocompleteListener = google.maps.event.addListener(this.inputAutocomplete, 'place_changed', () => {
                const place = this.inputAutocomplete.getPlace();
                let suburb = '';
                let state_id = '';

                place.address_components.every(item => {
                    if (item.types.indexOf('administrative_area_level_1') >= 0) {

                        if (this.props.houseStates) {
                            let state = this.props.houseStates.find(
                                state => state['abbrev'] === item['short_name'].toUpperCase()
                            );
                            if (state) {
                                state_id = state.id;
                            }
                        } else {
                            const {house_state: state} = this.props.initialEstateData;
                            if (state['abbrev'] !== item['short_name'].toUpperCase()) {
                                this.props.alert.error('You cannot change a state of the estate. ' +
                                    'Please select an address within ' + state.name);
                                return;
                            }
                        }
                    }

                    if (item.types.indexOf('locality') >= 0) {
                        suburb = item.short_name;
                    }
                    return true;
                });

                let formData = {
                    ...this.state.formData,
                    ...{
                        lat: place.geometry.location.lat(),
                        long: place.geometry.location.lng(),
                        address: place.formatted_address,
                        suburb
                    }
                };

                if (state_id) {
                    formData.state_id = state_id;
                }

                this.setState({formData});
            });
        }
    };

    validationClassName = (inputName) => {
        return this.state.validationErrors[inputName] ? 'has-error' : null;
    };

    fileUploaded = ({name, url}) => {
        this.setState({
            uploadingFile: false,
            uploadedFile: {name, url}
        });
    };

    fileUploadError = () => {
        this.setState({uploadingFile: false, uploadedFile: {}});
    };

    beforeUpload = () => {
        this.setState({uploadingFile: true});
    };

    componentDidUpdate() {
        const {ADDED_NEW_ESTATE, ESTATE_UPDATED} = this.props.popupDialog;
        const type = ADDED_NEW_ESTATE || ESTATE_UPDATED;

        if (type) {
            const messages = {
                ADDED_NEW_ESTATE: 'The estate has been successfully created',
                ESTATE_UPDATED: 'The estate has been updated',
            };
            this.props.alert.success(messages[type]);
            this.props.onCancel(true);
        }
    }

    componentDidMount() {
        const {ESTATE_UPDATED} = this.props.popupDialog;
        if (ESTATE_UPDATED) {
            store.dispatch({type: 'RESET_ESTATE_UPDATED'});
        }

        const {initialEstateData} = this.props;
        if (initialEstateData) {
            const formData = Object.keys(AddEstateModal.defaultFormData)
                .reduce((form, key) => {
                    form[key] = initialEstateData[key] || '';
                    return form;
                }, {});

            const {geo_coords} = initialEstateData;
            if (geo_coords) {
                if (geo_coords.length === 2) {
                    formData['lat'] = geo_coords[0];
                    formData['long'] = geo_coords[1];
                }
                formData.region_id = initialEstateData.region_id;
                formData.state_id = initialEstateData.house_state.id;
            }
            this.setState({
                estateId: initialEstateData.id,
                formData,
                uploadedFile: {
                    name: '',
                    url: initialEstateData['thumbImage']
                }
            });
        }
    }


    submitForm = () => {
        const {formData, uploadedFile, estateId} = this.state;
        const data = {...formData};
        data.address = this.addressInput.value;
        data.logoFileName = uploadedFile && uploadedFile.name;

        if (this.validateData(data)) {
            this.setState({preloader: true});
            if (estateId) {
                this.props.updateEstate(data, {id: estateId});
            } else {
                this.props.addEstate(data);
            }
        }
    };

    render() {
        const {uploadingFile, uploadedFile, formData, validationErrors, preloader} = this.state;
        const {regions, houseStates, onCancel, initialEstateData, title, canApprove} = this.props;
        const thumbImage = uploadedFile ? uploadedFile.url : '';
        const logoFileName = uploadedFile ? uploadedFile.name : '';
        const contextValues = {
            formData, thumbImage, logoFileName, regions, houseStates, uploadingFile, validationErrors, initialEstateData,
            preloader,
            validationClassName: this.validationClassName,
            saveValue: this.saveValue,
            addAutoComplete: this.addAutoComplete,
            beforeUpload: this.beforeUpload,
            fileUploadError: this.fileUploadError,
            fileUploaded: this.fileUploaded,
            canApprove,
        };
        return (
            <NewEstateContext.Provider value={contextValues}>
                <PopupModal title={title}
                            dialogClassName='add-new-estate'
                            onCancel={onCancel}
                            onOK={this.submitForm}
                            onModalHide={onCancel}
                >
                    <EstateForm/>
                </PopupModal>
            </NewEstateContext.Provider>
        );
    }
}

const EstateForm = () => (
    <NewEstateContext.Consumer>
        {
            ({
                 formData, regions, houseStates, uploadingFile, validationErrors, thumbImage, initialEstateData, preloader,
                 saveValue, validationClassName, addAutoComplete, beforeUpload, fileUploadError, fileUploaded, canApprove
             }) =>
                <div className='form-rows'>
                    <FormRowInput id='name'
                                  label='Estate Name'
                                  inputClassName={validationClassName('name')}
                                  placeholder='Estate Name'
                                  maxLength='40'
                                  onChange={e => saveValue(e)}
                                  value={formData.name}
                    />

                    <FormRowInput id='website'
                                  label='Estate URL'
                                  inputClassName={validationClassName('website')}
                                  placeholder='Estate URL'
                                  maxLength='40'
                                  onChange={e => saveValue(e)}
                                  value={formData.website}
                    />
                    <div className='form-row'>
                        <label htmlFor='address'
                               className='left-item'>Address</label>
                        <div className={classnames('landspot-input right-item', validationClassName('address'))}>
                            <input type='text'
                                   maxLength='250'
                                   id='address'
                                   defaultValue={initialEstateData ? initialEstateData.address : ''}
                                   ref={e => addAutoComplete(e)}
                            />
                        </div>
                    </div>
                    <FormRowInput id='contacts'
                                  label='Phone'
                                  inputClassName={validationClassName('contacts')}
                                  placeholder='Phone'
                                  maxLength='250'
                                  onChange={e => saveValue(e)}
                                  value={formData.contacts}
                    />
                    <FormRowInput id='suburb'
                                  label='Suburb'
                                  inputClassName={validationClassName('suburb')}
                                  placeholder='Suburb'
                                  maxLength='40'
                                  onChange={e => saveValue(e)}
                                  value={formData.suburb}
                    />
                    <FormRowDropdown
                        label='Region'
                        itemClass={() => {}}
                        defaultItem={'Select region'}
                        items={regions.map(region => ({text: region.name, value: region.id}))}
                        onChange={value => saveValue({
                            target: {
                                id: 'region_id',
                                value
                            }
                        })}
                        value={formData.region_id}
                    />
                    {
                        initialEstateData
                            ? <FormRowInput id='state'
                                            label='State'
                                            inputClassName={validationClassName('state_id')}
                                            defaultValue={initialEstateData.house_state.name}
                                            readOnly
                            />

                            : <FormRowDropdown
                                label='State'
                                itemClass={validationClassName('state_id')}
                                defaultItem={'Select state'}
                                items={houseStates.map(state => ({text: state.abbrev, value: state.id}))}
                                onChange={value => saveValue({
                                    target: {
                                        id: 'state_id',
                                        value
                                    }
                                })}
                                value={formData.state_id}
                            />
                    }

                    {
                        (canApprove || !initialEstateData) &&
                        <React.Fragment>
                            <p>Please choose an estate logo (JPEG, PNG, GIF) with aspect ratio 16:10</p>

                            <div className='logo-wrapper'>
                                <ImageCropper
                                    className={
                                        classnames(
                                            'estate-logo',
                                            validationErrors['logoFileName'] ? 'has-error' : null
                                        )
                                    }
                                    baseUrl='/upload-image'
                                    acceptMime='image/*'
                                    chooseFileButton={
                                            <button type='button'
                                                    className='upload-image'
                                                    style={
                                                        {
                                                            backgroundImage: thumbImage ? `url('${thumbImage}')` : null,
                                                        }
                                                    }>
                                                {uploadingFile && <LoadingSpinner className='overlay'/>}
                                                {thumbImage ? '' : 'Upload logo'}
                                            </button>
                                    }
                                    beforeUpload={beforeUpload}
                                    uploadError={fileUploadError}
                                    uploadSuccess={fileUploaded}
                                />
                            </div>
                        </React.Fragment>
                    }
                    {
                        preloader && <LoadingSpinner className='overlay'/>
                    }
                </div>
        }

    </NewEstateContext.Consumer>
);

export default withAlert(connect((state => ({
        regions: state.catalogue.regions,
        popupDialog: state.popupDialog,
        houseStates: state.catalogue.house_states
})), actions)(AddEstateModal));