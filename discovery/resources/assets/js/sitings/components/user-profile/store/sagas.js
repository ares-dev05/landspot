import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from "~sitings~/axios/api";
// import {takeLeading} from '~sitings~/axios/effects';

function* saga() {
    yield takeLatest([
        ActionTypes.GET_USER,
    ], sendAPIRequest);
}

export default saga;