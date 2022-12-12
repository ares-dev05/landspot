import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import RichMarker from '~/helpers/RichMarker';
import MarkerClusterer from '~/helpers/MarkerClusterer';
import {RichMarkerPosition} from '../../../helpers/RichMarker';
import {MapOptions} from './MapHelpers';

class EstatesMap extends Component {

    static propTypes = {
        displayMap: PropTypes.bool.isRequired,
        setMapState: PropTypes.func.isRequired,
        onMounted: PropTypes.func.isRequired,
        estates: PropTypes.array
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

        this.googleMap = new google.maps.Map(this.mapElement, new MapOptions);

        this.fitMap();

        this.inputAutocomplete = new google.maps.places.Autocomplete(this.locationInput, {
            componentRestrictions: {country: 'au'},
        });

        this.inputAutocomplete.setFields(['geometry']);

        this.autocompleteListener = google.maps.event.addListener(this.inputAutocomplete, 'place_changed', () => {
            let place = this.inputAutocomplete.getPlace();
            if (place.geometry.viewport) {
                this.googleMap.fitBounds(place.geometry.viewport);
            } else {
                this.googleMap.setCenter(place.geometry.location);
                this.googleMap.setZoom(17);
            }
        });

        this.markerCluster = new MarkerClusterer(
            this.googleMap,
            [],
            {
                styles: [{
                    height: 40,
                    width: 40,
                    gridSize: 200,
                    averageCenter: true
                }],
                className: 'map-cluster-icon'
            }
        );
    }

    componentDidUpdate(prevProps) {
        const {estates} = this.props;
        let estatesChanged = !estates || !prevProps.estates || estates.length !== prevProps.estates.length;
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
            this.googleMap.fitBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng(latMin, longMin),
                new google.maps.LatLng(latMax, longMax)
            ));
        }
    }

    addMarkersToCluster() {
        const {google} = window;
        for (let estate, i = 0; (estate = this.props.estates[i++]);) {
            if (!estate.published && !estate.lotmix_public) {
                continue;
            }

            const marker = new RichMarker({
                position: new google.maps.LatLng(estate.geo_coords[0], estate.geo_coords[1]),
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
            if (estate.small) {
                logo.style.backgroundImage = `url('${estate.small}')`;
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
                lotsCountDiv.textContent = lots_count + (lots_count === 1 ? ' Lot' : ' Lots');
                markerDiv.appendChild(lotsCountDiv);
            }

            marker.setContent(markerDiv);
            const _this = this;
            marker.addListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                _this.onCloseMap(this.content.getAttribute('data-estate-id'));
            });

            this.mapMarkers.push(marker);
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
            <div className="estates-map" style={{
                visibility: displayMap ? 'visible' : '',
                transform: displayMap ? 'translateX(0)' : 'translateX(100%)',
            }}>
                <div className="map-location-search-wrapper">
                    <input ref={locationInput => this.locationInput = locationInput}
                           type="text"
                           className="map-location-search"
                           placeholder="Search for a location..."
                           autoComplete="off"
                    />
                </div>
                <div className="map-wrapper" ref={mapElement => this.mapElement = mapElement}/>
            </div>
        );
    }
}

export default connect((state => ({
    estates: state.catalogue.estates,
})))(EstatesMap);