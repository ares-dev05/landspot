import {APIAction} from '~/axios/api';

export const GET_FEATURES = 'GET_FEATURES';
export const UPDATE_FEATURE = 'UPDATE_FEATURE';
export const RESET_ESTATE_STATE = 'RESET_ESTATE_STATE';
export const RESET_ESTATE_PRELOADER = 'RESET_ESTATE_PRELOADER';

import {apiUrl} from '../companies/actions'

export const getFeatures = query => APIAction(GET_FEATURES, 'get', apiUrl, null, null, query);
export const updateFeature = (data, urlParams) => APIAction(UPDATE_FEATURE, 'put', `${apiUrl}/:type`, data, urlParams);
export const resetEstateData = () => ({type: RESET_ESTATE_STATE});
export const resetEstatePreloader = () => ({type: RESET_ESTATE_PRELOADER});

