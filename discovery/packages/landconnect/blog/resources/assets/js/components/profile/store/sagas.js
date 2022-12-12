import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from "~blog~/axios/api";

function* catalogueSaga() {
    yield takeLatest([
        ActionTypes.GET_USER,
        ActionTypes.SUBSCRIBE_TO_THE_NEWSLETTER,
    ], sendAPIRequest);
}

export default catalogueSaga;