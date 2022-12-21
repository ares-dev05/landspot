import React, {Component} from 'react';
import classnames from 'classnames';
import axios from 'axios';
import {ToggleSwitch} from '~sitings~/helpers/ToggleSwitch';
import SearchLocationAutocomplete from '~sitings~/helpers/SearchLocationAutocomplete';
import CanvasModel from '../CanvasModel';
import EventBase from '~/sitings-sdk/src/events/EventBase';
import PropTypes from 'prop-types';
import AccountMgr from '../../../../../sitings-sdk/src/sitings/data/AccountMgr';


// @TODO: read this from .env.HERECOM_API_KEY
const HERECOM_APP_ID  = 'MXtCW347CROeo0YIrbkW';
// const HERECOM_API_KEY = 'jS-g8e6I0MS6DDpa4kIXtqYb6hjldh-6_0KX8vPGloA';
const HERECOM_API_KEY = 'lysan1T8EfG_vdyeB7K5EPzKDO9jawGQQXLIhlQRJxo';

// @TODO: read this from .env.HERECOM_AUTOSUGGEST_URL
//const HERECOM_ENDPOINT = 'https://places.sit.ls.hereapi.com/places/v1/autosuggest';
const HERECOM_ENDPOINT = 'https://autosuggest.search.hereapi.com/v1/autosuggest';

class NearmapControls extends Component {
    static propTypes = {
        exitToSiting: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        const {nearmapModel} = CanvasModel.getModel();

        this.state = {
            searchText: null,
            suggestedLocations: [],
            selectedLocation: nearmapModel.location,
            autoPlacement: nearmapModel.autoPlacement,
            autoPlacementActive: nearmapModel.autoPlacementActive,
            flipSiting: nearmapModel.flipSiting,
            displayContours: nearmapModel.displayContours,
            displayFlood: nearmapModel.displayFlood,
            displayBushfire: nearmapModel.displayBushfire,
            displayOverland: nearmapModel.displayOverland,
        };
    }

    componentDidMount() {
        const {nearmapModel} = CanvasModel.getModel();
        nearmapModel.addEventListener(EventBase.CHANGE, this.handlePlacementChange, this);
    }

    componentWillUnmount() {
        const {nearmapModel} = CanvasModel.getModel();
        nearmapModel.removeEventListener(EventBase.CHANGE, this.handlePlacementChange, this);
    }

    handlePlacementChange = () => {
        const {nearmapModel} = CanvasModel.getModel();
        if (this.state.autoPlacementActive !== nearmapModel.autoPlacementActive) {
            this.setState({autoPlacementActive: nearmapModel.autoPlacementActive});
        }
    };

    updateLocation = (locationData) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({selectedLocation: locationData});
        nearmapModel.location = locationData;
    };

    updatePlacement = (autoPlacement) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({autoPlacement});
        nearmapModel.autoPlacement = autoPlacement;
    };

    openStreetView = () => {
        const {nearmapModel} = CanvasModel.getModel();
        if (!nearmapModel.location) {
            return;
        }

        const coords =
            nearmapModel.selectedCoordinates ?
                nearmapModel.selectedCoordinates.y+','+nearmapModel.selectedCoordinates.x :
                nearmapModel.latitude+','+nearmapModel.longitude;

        window.open('http://maps.google.com/?cbll='+coords+'&cbp=12,20.09,,0,5&layer=c', '_blank');
    };

    updateFlip = (flipSiting) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({flipSiting});
        nearmapModel.flipSiting = flipSiting;
    };

    updateContours = (displayContours) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({displayContours});
        nearmapModel.displayContours = displayContours;
    };

    updateFlood = (displayFlood) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({displayFlood});
        nearmapModel.displayFlood = displayFlood;
    };

    updateBushfire = (displayBushfire) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({displayBushfire});
        nearmapModel.displayBushfire = displayBushfire;
    };

    updateOverland = (displayOverland) => {
        const {nearmapModel} = CanvasModel.getModel();
        this.setState({displayOverland});
        nearmapModel.displayOverland = displayOverland;
    };

    updateSearchText = async (searchText) => {
        this.setState({searchText});

        /**
         at=-37.815018,144.946014&
         limit=5&
         lang=en&
         q=51%20belgrave%20r&
         apiKey=jS-g8e6I0MS6DDpa4kIXtqYb6hjldh-6_0KX8vPGloA
         */
        const params = {
            q: searchText,
            at: AccountMgr.i.builder.stateCenter,
            // result_types: 'address,place',
            matchLevel: 'houseNumber',
            limit: 6,
            lang: 'en',
            //tf: 'plain',
            // app_id: HERECOM_APP_ID,
            apiKey: HERECOM_API_KEY,
        };
        const url = new URL(HERECOM_ENDPOINT);
        url.search = new URLSearchParams(params).toString();

        if (searchText && searchText.length) {
            const response = await axios.get(
                url,
                {
                    headers: {
                        // 'X-Map-Viewport': '144.6086,-38.0093,145.2598,-37.5378'
                    },
                }
            );

            if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
                this.setState({suggestedLocations: response.data.items});
            }
        } else {
            // no-op
        }
    };

    render() {
        const {
            searchText,
            suggestedLocations,
            selectedLocation,
            autoPlacement,
            autoPlacementActive,
            flipSiting,
            displayContours,
            displayFlood,
            displayBushfire,
            displayOverland
        } = this.state;

        const {nearmapModel} = CanvasModel.getModel();

        return (
            <div className='lot-settings'>
                <div className='header' style={{marginBottom: '10px'}}>Enter Address</div>
                <div className='landconnect-input search-floorplan'>
                    <SearchLocationAutocomplete
                        onSearchInputChange={value => value.length > 3 && this.updateSearchText(value)}
                        items={suggestedLocations}
                        value={searchText || (selectedLocation ? selectedLocation.title || '' : '')}
                        onSelect={value => this.updateLocation(value)}
                        placeholder={'address'}
                    />
                </div>

                {selectedLocation !== null &&
                <React.Fragment>
                    <div className="first-row has-nav">
                        <span className="filters-header">Siting placement mode</span>

                        {autoPlacement &&
                        <div className='toggle-metric' style={{width: '125px'}}>
                            <ToggleSwitch
                                labelPosition="left"
                                onClick={() => this.updateFlip(!flipSiting)}
                                text={{on: 'Flip front', off: 'Flip front'}}
                                label={{on: '', off: ''}}
                                state={flipSiting}
                            />
                        </div>
                        }
                    </div>

                    <div className="easements">
                        <div className="btn-group">
                            <button type="button"
                                    className={classnames('button', autoPlacement === true ? 'primary' : 'default')}
                                    onClick={() => this.updatePlacement(true)}>
                                Automatic
                            </button>
                            <button type="button"
                                    className={classnames('button', autoPlacement === false ? 'primary' : 'default')}
                                    onClick={() => this.updatePlacement(false)}>
                                Manual
                            </button>

                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                {
                                    autoPlacement ?
                                        (autoPlacementActive ?
                                                'Click a lot on the map to automatically align the siting with it' :
                                                'Click the button below to perform an automatic alignment'
                                        ) :
                                        'Use the rotation and siting move controls to align with the map'
                                }
                            </div>

                            {autoPlacement &&
                            <button type="button"
                                    className={classnames('button', autoPlacementActive === true ? 'primary' : 'default')}
                                    onClick={() => nearmapModel.autoPlacementActive = true}
                                    style={{marginLeft: '0'}}>
                                Auto-align
                            </button>
                            }
                        </div>
                    </div>

                    {AccountMgr.i.builder.hasNearmapExtras &&
                        <React.Fragment>
                            <div className="first-row has-nav">
                                <span className="filters-header">Contours</span>

                                <div className='toggle-metric' style={{width: '125px'}}>
                                    <ToggleSwitch
                                        labelPosition="left"
                                        onClick={() => this.updateContours(!displayContours)}
                                        text={{on: '', off: ''}}
                                        label={{on: '', off: ''}}
                                        state={displayContours}
                                    />
                                </div>
                            </div>

                            {nearmapModel.hasFloodBushfireOverland &&
                                <React.Fragment>
                                    <div className="first-row has-nav" style={{paddingTop: 0}}>
                                        <span className="filters-header">Flood Areas</span>

                                        <div className='toggle-metric' style={{width: '125px'}}>
                                            <ToggleSwitch
                                                labelPosition="left"
                                                onClick={() => this.updateFlood(!displayFlood)}
                                                text={{on: '', off: ''}}
                                                label={{on: '', off: ''}}
                                                state={displayFlood}
                                            />
                                        </div>
                                    </div>

                                    <div className="first-row has-nav" style={{paddingTop:0}}>
                                        <span className="filters-header">Bushfire Areas</span>

                                        <div className='toggle-metric' style={{width: '125px'}}>
                                            <ToggleSwitch
                                                labelPosition="left"
                                                onClick={() => this.updateBushfire(!displayBushfire)}
                                                text={{on: '', off: ''}}
                                                label={{on: '', off: ''}}
                                                state={displayBushfire}
                                            />
                                        </div>
                                    </div>

                                    <div className="first-row has-nav" style={{paddingTop:0}}>
                                        <span className="filters-header">Overland Flow</span>

                                        <div className='toggle-metric' style={{width: '125px'}}>
                                            <ToggleSwitch
                                                labelPosition="left"
                                                onClick={() => this.updateOverland(!displayOverland)}
                                                text={{on: '', off: ''}}
                                                label={{on: '', off: ''}}
                                                state={displayOverland}
                                            />
                                        </div>
                                    </div>
                                </React.Fragment>
                            }
                        </React.Fragment>
                    }

                    <div className="first-row has-nav">
                        <span className="filters-header">Street View</span>
                    </div>

                    <div className="easements">
                        <div className="btn-group">
                            <div className="note">
                                <i className="fal fa-exclamation-circle"/>
                                Click to launch Google Street View of the currently selected lot or address in a new tab
                            </div>

                            <button type="button"
                                    className='button default'
                                    style={{marginLeft: '0'}}
                                    onClick={() => this.openStreetView()}>
                                Street View
                            </button>
                        </div>
                    </div>
                </React.Fragment>
                }

                <button type="button" style={{float: 'left', position: 'fixed', bottom: '80px'}}
                        className={classnames('button', 'default')}
                        onClick={() => this.props.exitToSiting()}>
                    Exit to Siting
                </button>
            </div>
        );
    }
}

export default NearmapControls;