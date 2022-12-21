import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {NiceRadioGroup} from '~/helpers/NiceRadio';
import {connect} from 'react-redux';
import * as actions from '../../store/popupDialog/actions';
import NiceDropdown from '~/helpers/NiceDropdown';
import store from '../../store';

class EditDetailsDialog extends Component {
    static propTypes = {
        userActionData: PropTypes.oneOfType([
            PropTypes.shape({
                house: PropTypes.object.isRequired
            })
        ]),
        userRanges: PropTypes.array.isRequired,
        onCancel: PropTypes.func.isRequired,
        getHouses: PropTypes.func.isRequired,
        getHouseDetails: PropTypes.func.isRequired,
        saveHouseDetails: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired
    };

    static defaultHouseDetails = Object.freeze({
        id: null,
        area_size: null,
        house_title: null,
        depth: null,
        price: null,
        beds: null,
        size: null,
        size_units: 'm2',
        bathrooms: null,
        width: null,
        cars: null,
        story: null,
        description: null,
        house_volume: null,
        house_range_id: null
    });

    constructor(props) {
        super(props);

        this.state = {
            details: {...EditDetailsDialog.defaultHouseDetails},
            preloader: false,
            errors: []
        };
    }

    componentDidMount() {
        const {
            userActionData: {house}
        } = this.props;
        this.props.getHouseDetails(house);
        this.setState({preloader: true});
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    static getDerivedStateFromProps(props, state) {
        const {
            popupDialog: {errors, details, fetch, ajax_success},
            alert: {error},
            onCancel,
            getHouses
        } = props;
        const {details: stateDetails} = state;
        let newState = {};

        if (ajax_success) {
            onCancel();
            getHouses();
            return null;
        }

        if (errors && errors.length) {
            newState.errors = errors;
            newState.preloader = false;
            error(errors.map(
                (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
            ));
            store.dispatch({type: 'RESET_POPUP_MESSAGES'});
        }

        if (fetch) {
            newState.preloader = false;
            store.dispatch({type: 'RESET_POPUP_FETCH_FLAG'});
        }

        if (details && details.id !== stateDetails.id) {
            newState.details = EditDetailsDialog.parseHouseDetails(details);
        }

        return Object.keys(newState).length > 0 ? newState : null;
    }

    static parseHouseDetails = propsDetails => {
        let details = {...EditDetailsDialog.defaultHouseDetails};

        for (let i in propsDetails) {
            if (propsDetails.hasOwnProperty(i)) {
                let v = propsDetails[i];
                if (details.hasOwnProperty(i)) {
                    details[i] = v;
                }
            }
        }

        return details;
    };

    onInputChange = data => {
        this.setState({details: {...this.state.details, ...data}, errors: []});
    };

    saveHouseDetails = () => {
        const {details} = this.state;
        this.props.saveHouseDetails(details, details);

        this.setState({preloader: true});
    };

    convertHouseSize = ({size_units}) => {
        const {details} = this.state;
        const coefficient = 9.290304;

        if (isFinite(details.area_size)) {
            switch (size_units) {
                case 'm2': {
                    const size =
                        Math.round(details.area_size * coefficient * 1e4) / 1e4;
                    details.area_size = size;
                    details.size = size;
                    break;
                }
                case 'sq': {
                    const size =
                        Math.round((details.area_size / coefficient) * 1e4) /
                        1e4;
                    details.area_size = size;
                    details.size = size;
                    break;
                }

                default:
                    details.area_size = '';
                    details.size = '';
            }
        }

        this.setState({details: {...details, size_units}});
    };

    render() {
        const {details, errors, preloader} = this.state;
        return (
            <PopupModal
                title="Edit Details"
                dialogClassName={'wide-popup house-details overflow-unset'}
                onOK={this.saveHouseDetails}
                onModalHide={this.props.onCancel}
            >
                <React.Fragment>
                    {preloader && <LoadingSpinner className={'overlay'} />}
                    <p className="annotation">
                        Please fill out all the details for this house.
                    </p>
                    <div className="modal-form">
                        <div className="form-rows">
                            <div className="form-row input-group">
                                <div className="landspot-input input-group">
                                    <div className="input-group-addon">
                                        Range
                                    </div>
                                    <NiceDropdown
                                        defaultItem={null}
                                        defaultValue={null}
                                        items={this.props.userRanges.map(
                                            range => ({
                                                value: range.id,
                                                text: range.name
                                            })
                                        )}
                                        onChange={house_range_id =>
                                            this.onInputChange({house_range_id})
                                        }
                                        value={details['house_range_id']}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Name
                                        </div>
                                        <input
                                            type="text"
                                            name="house_title"
                                            className={
                                                errors['name']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="House Name"
                                            maxLength="255"
                                            value={details['house_title'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    house_title: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Depth
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['depth']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Depth"
                                            maxLength="255"
                                            value={details['depth'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    depth: e.target.value
                                                })
                                            }
                                        />
                                        <div className="input-group-addon">
                                            M
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Cost
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['price']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Cost"
                                            maxLength="255"
                                            value={details['price'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    price: e.target.value
                                                })
                                            }
                                        />
                                        <div className="input-group-addon">
                                            $
                                        </div>
                                    </div>
                                </div>
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Beds
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['beds']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Beds"
                                            maxLength="255"
                                            value={details['beds'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    beds: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Size
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['area_size']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Size"
                                            maxLength="255"
                                            value={details['area_size'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    area_size: e.target.value,
                                                    size: e.target.value
                                                })
                                            }
                                        />
                                        <div className="input-group-addon">
                                            <NiceDropdown
                                                defaultItem={null}
                                                defaultValue={'m2'}
                                                items={[
                                                    {value: 'm2', text: 'm2'},
                                                    {value: 'sq', text: 'sq'}
                                                ]}
                                                onChange={size_units =>
                                                    this.convertHouseSize({
                                                        size_units
                                                    })
                                                }
                                                value={
                                                    details['size_units'] ||
                                                    null
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Baths
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['bathrooms']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Baths"
                                            maxLength="255"
                                            value={details['bathrooms'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    bathrooms: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Width
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['width']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Width"
                                            maxLength="255"
                                            value={details['width'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    width: e.target.value
                                                })
                                            }
                                        />
                                        <div className="input-group-addon">
                                            M
                                        </div>
                                    </div>
                                </div>
                                <div className="row-column">
                                    <div className="landspot-input input-group">
                                        <div className="input-group-addon">
                                            Cars
                                        </div>
                                        <input
                                            type="number"
                                            name="name"
                                            className={
                                                errors['cars']
                                                    ? 'required-field'
                                                    : ''
                                            }
                                            placeholder="Cars"
                                            maxLength="255"
                                            value={details['cars'] || ''}
                                            onChange={e =>
                                                this.onInputChange({
                                                    cars: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="row-column">
                                    <NiceRadioGroup
                                        value={details.story || 0}
                                        labels={{
                                            1: 'Single story',
                                            2: 'Double story'
                                        }}
                                        name={'house-story-radio'}
                                        onChange={value =>
                                            this.onInputChange({story: value})
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="landspot-input">
                                    <textarea
                                        placeholder="Description"
                                        rows="3"
                                        name="description"
                                        onChange={e =>
                                            this.onInputChange({
                                                description: e.target.value
                                            })
                                        }
                                        value={details.description || ''}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="landspot-input">
                                    <input
                                        type="text"
                                        name="name"
                                        className={
                                            errors['house_volume']
                                                ? 'required-field'
                                                : ''
                                        }
                                        placeholder="Matterport link"
                                        maxLength="255"
                                        value={details['house_volume'] || ''}
                                        onChange={e =>
                                            this.onInputChange({
                                                house_volume: e.target.value
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            {details['house_volume'] && (
                                <iframe
                                    src={details['house_volume']}
                                    className="preview-3d"
                                />
                            )}
                        </div>
                    </div>
                </React.Fragment>
            </PopupModal>
        );
    }
}

export default withAlert(
    connect(
        state => ({
            popupDialog: state.popupDialog,
            userRanges: state.manager.userRanges
        }),
        actions
    )(EditDetailsDialog)
);
