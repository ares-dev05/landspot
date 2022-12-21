import {takeEvery, takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* mediaSaga() {
    yield takeLatest([
        ActionTypes.FETCH_NOTIFICATION_MEDIA,
    ], sendAPIRequest);
    yield takeEvery([
        ActionTypes.REMOVE_NOTIFICATION_MEDIA
    ], sendAPIRequest);
}

export default mediaSaga;