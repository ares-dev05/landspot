import React from 'react';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';
import classnames from 'classnames';

import NiceDropdown from '~/helpers/NiceDropdown';

class AddAmenityForm extends React.Component {
    static propTypes = {
        categories: PropTypes.array.isRequired,
        addAmenity: PropTypes.func.isRequired,
        estateId: PropTypes.number.isRequired,
    };

    initialState = Object.freeze({amenityId: null, formData: {}});
    nameInput = React.createRef();
    latInput = React.createRef();
    longInput = React.createRef();

    state = {
        ...this.initialState,
        currentTab: 0,
        name: '',
        lat: '',
        long: ''
    };
    addAutoComplete = addressInput => {
        if (!addressInput) {
            this.cleanOldAutocompleteData();
        }
        this.addressInput = addressInput;
        const {google} = window;

        if (addressInput && !this.inputAutocomplete) {
            this.inputAutocomplete = new google.maps.places.Autocomplete(
                addressInput,
                {
                    componentRestrictions: {country: 'au'}
                }
            );
            this.inputAutocomplete.setFields(['geometry', 'name']);
            this.autocompleteListener = google.maps.event.addListener(
                this.inputAutocomplete,
                'place_changed',
                () => {
                    const place = this.inputAutocomplete.getPlace();

                    let formData = {
                        lat: place.geometry.location.lat(),
                        long: place.geometry.location.lng(),
                        name: place.name
                    };
                    this.props.setPlace(place);
                    this.setState({formData});
                }
            );
        }
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

    setFormDataProperty(prop, value) {
        this.setState({
            formData: {
                ...this.state.formData,
                [prop]: value
            }
        });
    }

    setTab(tabIndex) {
        if (this.state.currentTab !== tabIndex){
            this.setState({
                currentTab: tabIndex,
                formData: {}
            });
        }
    }

    addAmenity = () => {
        this.props.addAmenity(
            {
                ...this.state.formData,
                type: this.props.categories[this.state.amenityId]
            },
            {
                id: this.props.estateId
            }
        );
        // clear data after safe
        this.setState({...this.initialState});
        if (this.state.currentTab === 0){
            this.addressInput.value = '';
        }
        this.setState({
            name:'',
            lat:'',
            long:''
        });
    };
    render() {
        const {categories} = this.props;
        const {amenityId, formData, currentTab} = this.state;
        return (
            <div className="add-amenity-form">
                <NiceDropdown
                    itemClass="amenity-category"
                    defaultItem={'Select category'}
                    defaultValue={amenityId}
                    items={categories.map((currentValue, index) => ({
                        value: index,
                        text: currentValue
                    }))}
                    onChange={amenityId => this.setState({amenityId})}
                    value={amenityId}
                />
                <div className="add-amenity-tabs">
                    <div className={classnames('add-amenity-tab', currentTab === 0 ? 'add-amenity-tab-active' : '')}
                         onClick={() => {this.setTab(0)}}
                    >
                        Existing Location
                    </div>
                    <div className={classnames('add-amenity-tab', currentTab === 1 ? 'add-amenity-tab-active' : '')}
                         onClick={() => {this.setTab(1)}}
                    >
                        Proposed Location
                    </div>
                </div>
                {
                    currentTab === 0 ?
                        <div className="landspot-input">
                            <input
                                type="text"
                                maxLength="250"
                                id="address"
                                placeholder="Search Google"
                                disabled={amenityId === null}
                                ref={e => this.addAutoComplete(e)}
                            />
                        </div> :
                        <React.Fragment>
                            <div className="landspot-input">
                                <input
                                    type="text"
                                    value={this.state.name}
                                    maxLength="250"
                                    placeholder="Name"
                                    disabled={amenityId === null}
                                    onInput={(event) =>
                                            {
                                                this.setFormDataProperty('name',event.target.value);
                                                this.setState({name: event.target.value});
                                            }
                                        }
                                />
                            </div>
                            <div className="landspot-input two-inputs">
                                <input
                                    type="number"
                                    value={this.state.lat}
                                    maxLength="250"
                                    placeholder="Latitude"
                                    disabled={amenityId === null}
                                    onInput={(event) =>
                                            {
                                                this.setFormDataProperty('lat', parseFloat(event.target.value));
                                                this.setState({lat: event.target.value});
                                            }
                                        }
                                />
                                <input
                                    type="number"
                                    value={this.state.long}
                                    maxLength="250"
                                    placeholder="Longitude"
                                    disabled={amenityId === null}
                                    onInput={(event) =>
                                            {
                                                this.setFormDataProperty('long', parseFloat(event.target.value));
                                                this.setState({long: event.target.value});
                                            }
                                        }
                                />
                            </div>
                        </React.Fragment>
                }
                <button
                    className="add-button"
                    disabled={amenityId === null || isEmpty(formData)}
                    onClick={this.addAmenity}
                >
                    <i className="fal fa-plus-circle" />
                    Add New
                </button>
            </div>
        );
    }
}

export default AddAmenityForm;
