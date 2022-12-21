import React, {useState, Fragment, useEffect} from 'react';
import {connect} from 'react-redux';
import Media from 'react-media';
import {isEmpty} from 'lodash';
import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';

import LandEstatesFilter from './components/estates/LandEstatesFilter';
import LandEstatesList from './components/estates/LandEstatesList';
import {LeftPanel, RightPanel} from '~/helpers/Panels';
import {NoMatch, LoadingSpinner, changeTitleAfterPipe} from '~/helpers';
import EstatesMap from '~/lotmix/components/landspot/components/catalogue/EstatesMap';

import * as actions from './store/estate/actions';


export const MobileTabModeContext = React.createContext();

const EstateLocator = ({
                           catalogue,
                           suburbs,
                           match: {params: {state: stateParam, suburb: suburbParam}},
                           state,
                           getStateEstates,
                           preloader,
                           history
                       }) => {
    const [selectedSuburb, setSelectedSuburb] = useState(suburbParam);
    const [estates, setEstates] = useState([]);
    const [filteredEstates, setFilteredEstates] = useState([]);
    const [isFilteredEstateReady, setIsFilteredEstateReady] = useState(false);
    const [showMap, setShowMap] = useState(false);

    //fetch estates
    useEffect(() => {
        getStateEstates({state: stateParam});
    }, []);

    //change url path
    useEffect(() => {
        if (selectedSuburb === suburbParam) {
            return;
        }
        history.replace(selectedSuburb
            ? EstateLocator.suburbUrl
                .replace(':state', stateParam)
                .replace(':suburb', selectedSuburb)
            : EstateLocator.stateUrl.replace(':state', stateParam)
        );
    }, [selectedSuburb, suburbParam]);

    //set estates init state
    useEffect(() => {
        if (!catalogue) {
            return;
        }
        setEstates(Object.values(catalogue).flat());
    }, [catalogue]);

    //set filtered estates state
    useEffect(() => {
        setFilteredEstates(
            selectedSuburb
                ? estates.filter(estate => estate.suburb_slug === selectedSuburb)
                : estates
        );
    }, [selectedSuburb, estates.length]);

    //check is filtered estates ready
    useEffect(() => {
        if (!filteredEstates.length) {
            return;
        }
        setIsFilteredEstateReady(true);
    }, [filteredEstates.length]);

    //change title && meta title
    useEffect(() => {
        if (isEmpty(state) && isEmpty(suburbs)) {
            return;
        }
        changeTitleAfterPipe(selectedSuburb ? suburbs[selectedSuburb] : state.name);
    }, [selectedSuburb, state, suburbs]);

    const setEstateSearch = keyword => {
        setFilteredEstates(
            estates.filter(estate => (estate.name.toLowerCase().includes(keyword.toLowerCase())))
        );
    };

    //not found if wrong suburb in url match params
    if (!preloader && !isEmpty(suburbParam) && !suburbs[suburbParam]) {
        return <NoMatch/>;
    }

    return isFilteredEstateReady ? (
        <Fragment>
            <LeftPanel className={'discovery-sidebar'}>
                <Fragment>
                    <LandEstatesFilter
                        state={state}
                        suburbs={suburbs}
                        selectedSuburb={selectedSuburb}
                        setSelectedSuburb={setSelectedSuburb}
                        setEstateSearch={setEstateSearch}
                    />
                    <Media query="(max-width: 760px)">
                        <Fragment>
                            <div
                                className="map-toggler"
                                onClick={() => setShowMap(!showMap)}
                            >
                                {
                                    showMap
                                        ? (<span>Hide map <i className="fas fa-arrow-up"/></span>)
                                        : (<span>Show map <i className="fas fa-arrow-down"/></span>)
                                }
                            </div>
                            {window['google'] && showMap && (
                                <div className="estate-map-wrapper">
                                    <EstatesMap
                                        onMounted={() => {}}
                                        displayMap={true}
                                        estates={filteredEstates}
                                        setMapState={() => {}}
                                        onEstateSelect={() => {}}
                                    />
                                </div>

                            )}
                        </Fragment>
                    </Media>
                    <LandEstatesList
                        estates={filteredEstates}
                        state={stateParam}
                    />
                </Fragment>
            </LeftPanel>
            <Media query="(min-width: 760px)">
                <RightPanel className={'discovery'}>
                    {window['google'] && (
                        <EstatesMap
                            onMounted={() => {}}
                            displayMap={true}
                            estates={filteredEstates}
                            setMapState={() => {}}
                            onEstateSelect={() => {}}
                        />
                    )}
                </RightPanel>
            </Media>
        </Fragment>
    ) : (
        <LoadingSpinner/>
    );
};

EstateLocator.propTypes = {
    catalogue: PropTypes.object,
    suburbs: PropTypes.object,
    getStateEstates: PropTypes.func.isRequired
};

EstateLocator.topLevelUrl = '/land-estates';
EstateLocator.stateUrl = '/land-estates/:state/';
EstateLocator.suburbUrl = '/land-estates/:state/:suburb/';

const EstateLocatorInstance = withAlert(
    connect(
        state => ({
            ...state
        }),
        actions
    )(EstateLocator)
);

export {EstateLocatorInstance, EstateLocator};
