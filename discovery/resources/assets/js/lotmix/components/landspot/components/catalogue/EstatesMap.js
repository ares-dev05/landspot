import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {isEmpty} from 'lodash';
import RichMarker, {RichMarkerPosition} from '~/helpers/RichMarker';
import MarkerClusterer from '~/helpers/MarkerClusterer';
import {MapOptions} from './MapHelpers';
import {getDistance} from '~/helpers';

class EstatesMap extends Component {
    static propTypes = {
        displayMap: PropTypes.bool.isRequired,
        setMapState: PropTypes.func.isRequired,
        onMounted: PropTypes.func.isRequired,
        estates: PropTypes.array.isRequired,
        showPlace: PropTypes.object,
        amenityIcons: PropTypes.object,
        amenityColor: PropTypes.any,
        singleEstate: PropTypes.bool,
    };

    static defaultProps = {
        showPlace: {},
        amenityIcons: {},
        amenityColor: '#3D40C6',
        singleEstate: false
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.mapMarkers = [];
        this.markerCluster = null;
        this.inputAutocomplete = null;
        this.autocompleteListener = null;
    }

    componentDidMount() {
        if (this.props.onMounted) {
            this.props.onMounted({
                drawMap: () => this.drawMap()
            });
        }

        const google = window['google'];

        this.googleMap = new google.maps.Map(this.mapElement, new MapOptions());

        this.fitMap();

        this.inputAutocomplete = new google.maps.places.Autocomplete(
            this.locationInput,
            {
                componentRestrictions: {country: 'au'}
            }
        );
        this.inputAutocomplete.setFields(['geometry']);

        this.autocompleteListener = google.maps.event.addListener(
            this.inputAutocomplete,
            'place_changed',
            () => {
                let place = this.inputAutocomplete.getPlace();
                if (place.geometry.viewport) {
                    this.googleMap.fitBounds(place.geometry.viewport);
                } else {
                    this.googleMap.setCenter(place.geometry.location);
                    this.googleMap.setZoom(17);
                }
            }
        );

        this.markerCluster = new MarkerClusterer(this.googleMap, [], {
            styles: [
                {
                    height: 40,
                    width: 40,
                    gridSize: 200,
                    averageCenter: true
                }
            ],
            className: 'map-cluster-icon'
        });
        if (this.props.estates.length <= 1) {
            const listener = google.maps.event.addListener(this.googleMap, 'idle', () => {
                this.googleMap.setZoom(10);
                google.maps.event.removeListener(listener);
            });
        }
        this.addMarkersToCluster();
    }

    componentDidUpdate(prevProps) {
        const {estates, showPlace} = this.props;
        let estatesChanged =
            !estates ||
            !prevProps.estates ||
            estates.length !== prevProps.estates.length;
        if (!estatesChanged) {
            estatesChanged = estates.every((estate, index) => {
                return estate.id === prevProps.estates[index].id;
            });
        }

        if (estatesChanged) {
            this.markerCluster.clearMarkers(true);
            this.mapMarkers = [];
            this.addMarkersToCluster();
        }

        if (this.props.displayMap) {
            this.fitMap();
        }
        if (prevProps.showPlace !== showPlace) {
            if (showPlace.geometry.viewport) {
                this.googleMap.fitBounds(showPlace.geometry.viewport);
            } else {
                this.googleMap.setCenter(showPlace.geometry.location);
                this.googleMap.setZoom(17);
            }
        }
    }

    componentWillUnmount() {
        const {google} = window;
        if (this.autocompleteListener) {
            google.maps.event.removeListener(this.autocompleteListener);
        }
        if (this.inputAutocomplete) {
            google.maps.event.clearInstanceListeners(this.inputAutocomplete);
        }
        this.autocompleteListener = null;
        this.inputAutocomplete = null;
    }

    fitMap() {
        let latMin, latMax, longMin, longMax;
        const {google} = window;
        this.props.estates.forEach(estate => {
            if (estate.geo_coords && (estate.published || estate.lotmix_public)) {
                if (latMin === undefined) {
                    latMin = estate.geo_coords[0];
                    latMax = estate.geo_coords[0];
                }
                if (longMin === undefined) {
                    longMin = estate.geo_coords[1];
                    longMax = estate.geo_coords[1];
                }
                if (estate.geo_coords[0] < latMin) {
                    latMin = estate.geo_coords[0];
                }
                if (estate.geo_coords[0] > latMax) {
                    latMax = estate.geo_coords[0];
                }
                if (estate.geo_coords[1] < longMin) {
                    longMin = estate.geo_coords[1];
                }
                if (estate.geo_coords[1] > longMax) {
                    longMax = estate.geo_coords[1];
                }
            }
        });

        if (latMin !== undefined && longMin !== undefined) {
            this.googleMap.fitBounds(
                new google.maps.LatLngBounds(
                    new google.maps.LatLng(latMin, longMin),
                    new google.maps.LatLng(latMax, longMax)
                )
            );
        }
    }

    addMarkersToCluster() {
        const {google} = window;
        for (let estate, i = 0; (estate = this.props.estates[i++]);) {
            if (!estate.published && !estate.lotmix_public) {
                continue;
            }

            const marker = new RichMarker({
                position: new google.maps.LatLng(
                    estate.geo_coords[0],
                    estate.geo_coords[1]
                ),
                anchor: RichMarkerPosition.BOTTOM,
                map: this.googleMap,
                draggable: false,
                flat: true,
                visible: true
            });

            const markerDiv = document.createElement('div');
            markerDiv.className = 'estate-marker';
            markerDiv.setAttribute('data-estate-id', estate.id);
            const logo = document.createElement('div');
            logo.className = 'image';
            if (estate.smallImage) {
                logo.style.backgroundImage = `url('${estate.smallImage}')`;
            }
            markerDiv.appendChild(logo);
            const title = document.createElement('div');
            title.textContent = estate.name;
            title.className = 'title';
            markerDiv.appendChild(title);

            const {lots_count} = estate;

            if (lots_count > 0) {
                const lotsCountDiv = document.createElement('div');
                lotsCountDiv.className = 'lots';
                lotsCountDiv.textContent =
                    lots_count + (lots_count === 1 ? ' Lot' : ' Lots');
                markerDiv.appendChild(lotsCountDiv);
            }

            marker.setContent(markerDiv);
            const _this = this;
            marker.addListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.onCloseMap(this.content.getAttribute('data-estate-id'));
            });
            const {amenityIcons, amenityColor} = this.props;
            if (!isEmpty(amenityIcons)) {
                const amenities = Object.values(estate.sortEstateAmenities || {}).reduce((a, c) => (a.concat(c)), []);
                amenities.forEach(amenity => {
                    const marker = new RichMarker({
                        position: new google.maps.LatLng(
                            amenity.lat,
                            amenity.long
                        ),
                        anchor: RichMarkerPosition.BOTTOM,
                        map: this.googleMap,
                        draggable: false,
                        flat: true,
                        visible: true
                    });

                    const distanceToEstate = getDistance({
                        lat: estate.geo_coords[0],
                        lng: estate.geo_coords[1]
                    }, {
                        lat: amenity.lat,
                        lng: amenity.long
                    });

                    const markerDiv = document.createElement('div');
                    markerDiv.className = 'amenity-marker';
                    ReactDOM.render(
                        <React.Fragment>
                            {amenityIcons[amenity.type_name]({
                                active: true,
                                color: (typeof amenityColor === 'string') ? amenityColor : amenityColor[amenity.type_name]
                            })}
                            <span>{distanceToEstate}</span>
                        </React.Fragment>
                        ,
                        markerDiv
                    );
                    marker.setContent(markerDiv);
                    this.mapMarkers.push(marker);
                });
            }
            if (!this.props.singleEstate) {
                this.mapMarkers.push(marker);
            }
        }
        this.markerCluster.addMarkers(this.mapMarkers);
    }

    drawMap = () => {
        this.props.setMapState(true);
    };

    /**
     * Close map and go to lots if estate marker was clicked
     * @param estateId
     */
    onCloseMap = estateId => {
        this.props.setMapState(false);
        this.markerCluster.clearMarkers(true);
        this.mapMarkers = [];
        if (estateId !== undefined) {
            this.props.onEstateSelect(parseInt(estateId));
        }
    };

    render() {
        const {displayMap} = this.props;
        return (
            <div
                className="estates-map"
                style={{
                    visibility: displayMap ? 'visible' : '',
                    transform: displayMap ? 'translateX(0)' : 'translateX(100%)'
                }}
            >
                <div className="map-location-search-wrapper">
                    <input
                        ref={locationInput =>
                            (this.locationInput = locationInput)
                        }
                        type="text"
                        className="map-location-search"
                        placeholder="Search for a location..."
                        autoComplete="off"
                    />
                </div>
                <div
                    className="map-wrapper"
                    ref={mapElement => (this.mapElement = mapElement)}
                />
            </div>
        );
    }
}

export default EstatesMap;
