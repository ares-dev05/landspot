import {takeEvery, takeLatest, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* featuresSaga() {
    yield throttle(2000, ActionTypes.FETCH_FEATURE_NOTIFICATIONS, sendAPIRequest);
    yield takeLatest([
        ActionTypes.CREATE_FEATURE_NOTIFICATION,
        ActionTypes.FETCH_COMPANIES,
        ActionTypes.FETCH_FEATURE_NOTIFICATION,
        ActionTypes.EDIT_FEATURE_NOTIFICATION,
    ], sendAPIRequest);
    yield takeEvery([
        ActionTypes.REMOVE_FEATURE_NOTIFICATION,
        ActionTypes.SEND_FEATURE_NOTIFICATION,
    ], sendAPIRequest);
}

export default featuresSaga;
