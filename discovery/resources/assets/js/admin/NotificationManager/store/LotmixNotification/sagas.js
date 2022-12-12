import {takeEvery, takeLatest, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* featuresSaga() {
    yield throttle(2000, ActionTypes.FETCH_LOTMIX_NOTIFICATIONS, sendAPIRequest);
    yield takeLatest([
        ActionTypes.CREATE_LOTMIX_NOTIFICATION,
        ActionTypes.FETCH_LOTMIX_NOTIFICATION,
        ActionTypes.EDIT_LOTMIX_NOTIFICATION,
    ], sendAPIRequest);
    yield takeEvery([
        ActionTypes.REMOVE_LOTMIX_NOTIFICATION,
        ActionTypes.SEND_LOTMIX_NOTIFICATION,
    ], sendAPIRequest);
}

export default featuresSaga;
