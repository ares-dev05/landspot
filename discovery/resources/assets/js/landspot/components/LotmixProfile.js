import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';

import AmenitySection from '~/lotmix/components/my-lotmix/components/EstateComponent/AmenitySection.js';
import FaqSection from '~/lotmix/components/my-lotmix/components/EstateComponent/FaqSection.js';
import EstateGallery from './EstateGallery';
import * as actions from '../store/estate/actions';
import store from '../store';
import {LoadingSpinner} from '~/helpers';

class LotmixProfile extends React.Component {
    static propTypes = {
        alert: PropTypes.object.isRequired,
        errors: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        descriptionUpdated: PropTypes.bool,
        estateImageDeleted: PropTypes.bool,
        updateEstateDescription: PropTypes.func.isRequired,
        addAmenity: PropTypes.func.isRequired,
        estate: PropTypes.object,
        deleteEstateImage: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired
    };
    static defaultProps = {
        descriptionUpdated: false,
        estateImageDeleted: false,
        estate: {}
    };

    constructor(props) {
        super(props);
        const {estate: {description, description_secondary, description_suburb}} = props;
        this.state = {
            description: description || '',
            description_secondary: description_secondary || '',
            description_suburb: description_suburb || '',
            descriptionEditable: false,
            upsellEditable: false,
            suburbEditable: false,
            preloader: false
        };
    }

    static getDerivedStateFromProps(props) {
        const {
            errors,
            descriptionUpdated,
            estateImageDeleted,
            alert: {error, success}
        } = props;

        if (errors && errors.length) {
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_ERRORS'});
        }

        if (descriptionUpdated) {
            success('Description updated!');
            store.dispatch({type: 'RESET_DESCRIPTION_UPDATED'});
        }
        if (estateImageDeleted) {
            success('Image deleted!');
            store.dispatch({type: 'RESET_ESTATE_IMAGE_DELETED'});
        }

        return null;
    }

    static showErrors = (propsErrors, error) => {
        const errorsArray = Array.isArray(propsErrors)
            ? propsErrors
            : Object.values(propsErrors).flat();

        error(
            errorsArray.map((error, errorIndex) => (
                <div key={errorIndex}>
                    {errorIndex + 1}) {error.message || error}
                </div>
            ))
        );
    };

    onSaveDescription = () => {
        const {
            alert: {error},
            estate,
            updateEstateDescription
        } = this.props;
        const {description, description_secondary, description_suburb} = this.state;
        if (this.state.description.length > 1000) {
            error('Max description length - 1000 symbols');
        } else if (this.state.description_secondary.length > 1000) {
            error('Max secondary description length - 1000 symbols');
        } else if (this.state.description_suburb.length > 1000) {
            error('Max suburb description length - 1000 symbols');
        } else {
            if (estate && (
                this.state.description !== estate.description ||
                this.state.description_secondary !== estate.description_secondary ||
                this.state.description_suburb !== estate.description_suburb
            )) {
                updateEstateDescription({description, description_secondary, description_suburb}, {id: estate.id});
            }
        }
    };

    handleTextChange = (name, edit) => e => {
        this.setState({
            [name]: e.target.value,
            [edit]: true
        });
    }

    imageUploadError = data => {
        const {
            alert: {error}
        } = this.props;

        LotmixProfile.showErrors(data.errors || data.message, error);
        this.setState({preloader: false});
    };
    imageUploaded = response => {
        const {
            alert: {show}
        } = this.props;
        let alertMsg = '';
        let alertType = 'error';

        if (response.error) {
            alertMsg = response.error;
        } else if (response.success) {
            alertMsg = response.success;
            alertType = 'success';
            this.props.pushEstateGallery(response.estateGallery);
        } else {
            alertMsg = response.message;
        }

        show(alertMsg, {
            type: alertType
        });
        this.setState({preloader: false});
    };

    render() {
        const {preloader, description, description_secondary, description_suburb} = this.state;
        const {estate, deleteEstateImage, loading, addAmenity, updateSnapshots, updateAnswers} = this.props;

        return (
            <div className="lotmix-profile">
                {preloader ||
                (loading && <LoadingSpinner className={'overlay'}/>)}
                <div className="estate-description-form">
                    <p className="estate-description-header">
                        Estate Description
                    </p>
                    <textarea
                        value={description}
                        cols="30"
                        maxLength="1000"
                        onChange={this.handleTextChange('description', 'descriptionEditable').bind(this)}
                        className="description-form"
                        rows="10"
                        placeholder="Enter your estate description here"
                    />

                    <textarea
                        value={description_secondary}
                        cols="30"
                        maxLength="1000"
                        onChange={this.handleTextChange('description_secondary', 'upsellEditable').bind(this)}
                        className="description-form"
                        rows="10"
                        placeholder="Estate the 'Why Buy in Estate' description here"
                    />

                    <textarea
                        value={description_suburb}
                        cols="30"
                        maxLength="1000"
                        onChange={this.handleTextChange('description_suburb', 'suburbEditable').bind(this)}
                        className="description-form"
                        rows="10"
                        placeholder="Suburb profile description here"
                    />

                    <div className="button-section">
                        <button
                            className="button default"
                            onClick={() =>
                                this.setState({
                                    description: '',
                                    description_secondary: '',
                                    description_suburb: '',
                                    descriptionEditable: false,
                                    upsellEditable: false,
                                    suburbEditable: false
                                })
                            }
                        >
                            Cancel
                        </button>
                        <button
                            className="button primary"
                            onClick={this.onSaveDescription}
                        >
                            Update Estate Description
                        </button>
                    </div>
                </div>
                <AmenitySection
                    addAmenity={addAmenity}
                    updateSnapshots={updateSnapshots}
                    estate={estate}
                    iconColor="#3D40C6"
                    showForm
                />
                <FaqSection
                    updateAnswers={updateAnswers}
                    estate={estate}
                    iconColor="#3D40C6"
                    showForm
                />
                <EstateGallery
                    deleteImage={deleteEstateImage}
                    gallery={estate.estate_gallery}
                    imageUploadError={this.imageUploadError}
                    imageUploaded={this.imageUploaded}
                    estateId={estate.id}
                    imageUploadBefore={() => this.setState({preloader: true})}
                />
            </div>
        );
    }
}

export default withAlert(
    connect(
        state => ({...state.estate}),
        actions
    )(LotmixProfile)
);
