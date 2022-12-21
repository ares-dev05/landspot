import React, {useState, useEffect} from 'react';
import {withRouter} from 'react-router-dom';

import {connect} from 'react-redux';
import * as actions from '../store/estate/actions';


import PropTypes from 'prop-types';
import {withAlert} from 'react-alert';
import queryString from 'query-string';
import {isEqual, isEmpty} from 'lodash';
import {PopupModal} from '~/popup-dialog/PopupModal';
import {LoadingSpinner} from '~/helpers';

import LotsFilter from './LotsFilter';
import EstateLots from './EstateLots';
import {LandspotEstates} from '../LandspotEstates';
import EstateFilter from './estatanew/EstateFilter';
import LotCard from '~/lotmix/components/discovery/components/catalogue/LotCard';
import DialogList from '~/lotmix/components/discovery/components/popups/DialogList';
import AmenitySection from '~/lotmix/components/my-lotmix/components/EstateComponent/AmenitySection';
import pluralize from 'pluralize';

const Estate = ({catalogue, estate, location, getEstateLots, filterEstatesList, match, history}) => {

    const [data, setData] = useState({
        tab: 'lots',
        userAction: null,
        preloader: false,
        locationKey: null,
        displayMap: false,
        userActionData: null,
        showAmenityPopup: false,
        mobileGlobalSwitch: true,
        selectedFilters: {...Estate.defaultPropsFilters}
    });

    useEffect(() => {
        getEstateLotsData(true);
        if (!catalogue.estates) {
            if (location.search) {
                getLocationFilters();
            } else {
                filterEstatesList(
                    getEstateSelectedFilters(data.selectedFilters, true)
                );
            }
        } else if (location.search) {
            getLocationFilters();
        }
    }, [location.search]);

    const setUserAction = (action, actionData) => {
        console.log('ACTION: ' + (action ? action.toString() : 'none'), actionData);
        const {userAction, userActionData} = data;

        const actionChanged =
            action !== userAction ||
            (actionData != null && !isEqual(actionData, userActionData));

        if (actionChanged) {
            setData({
                ...data,
                userAction: action,
                userActionData: actionData || null
            });
        }
    };

    const getLots = () => {
        const {columns, stages} = estate;
        const columnsByName = prepareColumnsByName(columns);
        return stages ? stages.reduce((result, stage) => {
            const lots = stage.lots ? stage.lots.map((lot, lotIndex) => ({
                id: stage['lotIds'][lotIndex],
                number: lot[getColumnIndex(columnsByName, 'lot_number')],
                area: lot[getColumnIndex(columnsByName, 'area')],
                frontage: lot[getColumnIndex(columnsByName, 'frontage')],
                depth: lot[getColumnIndex(columnsByName, 'depth')],
                price: lot[getColumnIndex(columnsByName, 'price')],
                titleDate: lot[getColumnIndex(columnsByName, 'title_date')],
                stageId: stage.id,
                estateId: estate.estate.id,
                packageAvailable: stage.lotPackages[lotIndex] !== 0,
                image: stage['lotImages'][lotIndex] || null,
                lotRotation: stage['lotRotation'][lotIndex] || 0
            })) : [];
            result.push(...lots);
            return result;
        }, []) : [];
    };

    const onFilterChange = filterData => {
        const selectedFilters = {...data.selectedFilters, ...filterData};
        setData({...data, selectedFilters: selectedFilters});

        const query = getEstateSelectedFilters(selectedFilters, true);
        if (location.pathname === LandspotEstates.componentUrl) {
            filterChangeHandler(query, 'filter', true);
        } else {
            const {slug} = match.params;
            history.push('/land-for-sale/communities/' + slug + '?filters=1&' + query);
            getEstateLots({slug}, selectedFilters);
        }
    };

    const getLocationFilters = () => {
        let query = location.search;
        const parsed = queryString.parse(query);
        let selectedFilters = {...Estate.defaultPropsFilters};

        for (let i in parsed) {
            let v = parsed[i];
            if (Estate.defaultPropsFilters.hasOwnProperty(i)) {
                if (typeof Estate.defaultPropsFilters[i] === 'number') {
                    v = parseInt(v);
                    if (isNaN(v)) {
                        continue;
                    }
                }
                selectedFilters[i] = v;
            }
        }

        setData({...data, selectedFilters});
        filterChangeHandler(
            getEstateSelectedFilters(selectedFilters, true),
            'filter',
            false
        );
    };

    const resetFilter = () => {
        setData({
            ...data,
            selectedFilters: {...Estate.defaultPropsFilters}
        });

        filterEstatesList('');
        history.push(location.pathname);
    };

    const getDrawerThemes = () => {
        const {stages} = estate;
        return stages.reduce((map, obj) => {
            map[obj.id] = obj.drawerTheme;
            return map;
        }, {});
    };

    function getEstateLotsData(withFilters = false) {
        const selectedFilters = getSelectedFilters();

        if (withFilters) {
            selectedFilters.filters = 1;
        }

        const {slug} = match.params;
        getEstateLots({slug}, selectedFilters);
        setData({...data, preloader: true});
    }

    function getEstateSelectedFilters(filters, asQuery) {
        let params = {};
        for (let key in Estate.defaultPropsFilters) {
            if (
                Estate.defaultPropsFilters.hasOwnProperty(key) &&
                Estate.defaultPropsFilters[key] !== filters[key]
            ) {
                params[key] = filters[key];
            }
        }
        return asQuery ? queryString.stringify(params) : params;
    }

    function getSelectedFilters() {
        const {search} = location;
        return LotsFilter.getSelectedFilters(search);
    }

    function getColumnIndex(columnsByName, column) {
        return columnsByName[column] ? columnsByName[column].index : -1;
    }

    function prepareColumnsByName(columns) {
        const columnsByName = {};
        columns.forEach((item, index) => {
            columnsByName[item['attr_name']] = {order: item['order'], index};
        });
        return columnsByName;
    }

    function filterChangeHandler(query, type, toHistory) {
        let url = catalogue.basePath + '?' + query;
        if (type === 'filter') {
            filterEstatesList(query);
        }

        if (toHistory) {
            history.push(url);
        }
    }

    if (isEmpty(estate.estate) || isEmpty(catalogue.filters)) {
        return <LoadingSpinner className='overlay'/>;
    }

    const lots = getLots();
    const drawerThemes = getDrawerThemes();
    const {filters, isBuilder} = catalogue;
    const {userAction, userActionData, selectedFilters, displayMap, showAmenityPopup} = data;

    return (
        <div className="lotmix-estate">
            <DialogList userAction={userAction} userActionData={userActionData} setUserAction={setUserAction}/>
            <div className="left-section">
                <LotCard
                    setUserAction={setUserAction}
                    estate={estate.estate}
                    displayLocationCallback={() => {
                        setData({...data, showAmenityPopup: true});
                    }}
                    displayLocationLabel="View Amenity Map"
                />
            </div>
            {showAmenityPopup &&
            <PopupModal okButtonTitle={'OK'}
                        dialogClassName={'filters-popup extra-wide-popup'}
                        title={'Amenities'}
                        hideCancelButton={true}
                        onOK={() => setData({...data, showAmenityPopup: false})}
                        onModalHide={() => setData({...data, showAmenityPopup: false})}>
                <div className={'amenity-popup-lotmix lotmix-app'}>
                    <div className={'lotmix-estate-container'}>
                        <div className={'lotmix-estate'}>
                            <AmenitySection iconColor="#29C97C"
                                            estate={estate.estate} />
                        </div>
                    </div>
                </div>
            </PopupModal>
            }
            <div className="right-section">
                <EstateFilter
                    {...{
                        isBuilder,
                        displayMap,
                        filters,
                        selectedFilters,
                        setMapState: () => setData({...data, displayMap}),
                        onFilterChange,
                        resetFilter
                    }}
                />
                <div className="header">
                    <div className='results'>{lots.length} {pluralize('results', lots.length)}</div>
                </div>
                <EstateLots setUserAction={setUserAction} lots={lots} drawerThemes={drawerThemes}/>
            </div>
        </div>);
};

Estate.componentUrl = '/land-for-sale/communities/:slug';
Estate.propTypes = {
    catalogue: PropTypes.object.isRequired,
    estate: PropTypes.object.isRequired,
    alert: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    getEstateLots: PropTypes.func.isRequired,
    filterEstatesList: PropTypes.func.isRequired,
    resetEstateData: PropTypes.func.isRequired,
};

Estate.defaultPropsFilters = {
    area: '',
    max_area: '',
    width: '',
    depth: '',
    orientation: '',
    status: '',
    max: 0,
    min: 0,
    unsold_lots: null,
    from_house: null
};

const iconColor = {
    education: '#3d40c6',
    health: '#ff5d53',
    shopping: '#1ce895',
    dining: '#ef6f38',
    clubs: '#9400d2'
};

export {Estate};

export default withRouter(withAlert(connect((
    state => ({
        catalogue: state.landspotCatalogue,
        estate: state.landspotEstate
    })
), actions)(Estate)));