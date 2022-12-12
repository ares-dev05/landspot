import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withAlert} from 'react-alert';
import {withRouter} from 'react-router-dom';
import {isEqual} from 'lodash';
import * as actions from '../../store/popupDialog/actions';
import {LoadingSpinner} from '~/helpers';
import {PopupModal} from '~/popup-dialog/PopupModal';

class SalesLocationsDialogue extends Component {
    static propTypes = {
        userActionData: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        resetDialogStore: PropTypes.func.isRequired,
        saveLocations: PropTypes.func.isRequired,
        company: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            sales_location: PropTypes.array.isRequired
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            locations: null,
            deletedLocations: [],
            preloader: false
        };
    }

    componentWillUnmount() {
        this.props.resetDialogStore();
    }

    componentDidMount() {
        const {company: {sales_location: locations}} = this.props.userActionData;
        this.setState({locations});
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            popupDialog: {message, errors: propsErrors},
            alert: {show, error},
            resetDialogStore,
            history: {push},
            location: {pathname, search},
            company: {sales_location: locations}
        } = this.props;
        const {preloader} = this.state;

        if (preloader && preloader === prevState.preloader) {
            this.setState({preloader: false});
        }
        
        if (!isEqual(locations, prevProps.company['sales_location'])) {
            this.setState({locations});
        }

        if (message && message.success) {
            show(
                message.success,
                {
                    type: 'success',
                }
            );
            resetDialogStore();
            push(`${pathname}${search}`);
        }

        if (propsErrors) {
            let errors = [];
            typeof propsErrors === 'object'
                ? Object.keys(propsErrors).forEach((error, i) => {
                    const column = propsErrors[error];
                    errors[i] = {
                        message: `${column}`,
                    };
                })
                : errors.push(propsErrors);

            if (errors.length) {
                error(errors.map(
                    (error, errorIndex) => <div key={errorIndex}>{error.message || error}</div>
                ));
            }
            resetDialogStore();
        }

    }

    removeLocation = (location) => {
        let {deletedLocations, locations} = this.state;

        locations = locations.filter(loc => loc.id !== location.id);
        if (location.id && !location.isNew) {
            deletedLocations.push(location);
        }

        this.setState({deletedLocations, locations});
    };

    addLocation = () => {
        let {locations} = this.state;
        const id = Math.round(Math.random() * 1e6);
        locations.push({name: '', id, isNew: true});
        this.setState({locations});
    };

    updateLocation = (location, name) => {
        let {locations} = this.state;
        const locationIndex = locations.findIndex(loc => loc.id === location.id);
        locations[locationIndex].name = name;

        this.setState({locations});
    };

    saveLocations = () => {
        const {saveLocations, company} = this.props;
        let {locations, deletedLocations} = this.state;

        locations = locations.filter(loc => loc.name);

        saveLocations({locations, deletedLocations}, {id: company.id});
        this.setState({preloader: true});
    };

    render() {
        const {locations, preloader} = this.state;
        const {onCancel, company} = this.props;
        return (
            <PopupModal dialogClassName={'sales-locations'}
                        title={`Manage locations for ${company.name}`}
                        onOK={this.saveLocations}
                        onModalHide={onCancel}
            >
                <React.Fragment>
                    {locations === null
                        ? <LoadingSpinner className={'overlay'}/>
                        : <LocationsList locations={locations}
                                         removeLocation={this.removeLocation}
                                         updateLocation={this.updateLocation}
                                         addLocation={this.addLocation}/>
                    }

                    {preloader && <LoadingSpinner className={'overlay'}/>}
                </React.Fragment>
            </PopupModal>
        );
    }
}

const LocationsList = ({locations, removeLocation, addLocation, updateLocation}) => {
    return (
        <ul>
            {locations.length
                ? locations.map((loc, locIndex) =>
                    <li key={locIndex}
                        className='landspot-input'>
                        <input type='text'
                               onChange={(e) => updateLocation(loc, e.target.value)}
                               placeholder='Location name'
                               maxLength={160}
                               defaultValue={loc.name}/>

                        <i className="landspot-icon trash"
                           onClick={() => removeLocation(loc)}/>
                    </li>
                )
                : 'The sales locations list is empty'
            }
            <li className='button default'
                onClick={() => addLocation()}>
                <i className="landspot-icon plus"/> Add location
            </li>
        </ul>
    );
};

LocationsList.propTypes = {
    locations: PropTypes.array.isRequired,
    removeLocation: PropTypes.func.isRequired,
    addLocation: PropTypes.func.isRequired,
    updateLocation: PropTypes.func.isRequired,
};

export default withAlert(withRouter(connect(
    (state => ({
        popupDialog: state.popupDialog,
        company: state.users.company,
    })), actions
)(SalesLocationsDialogue)));