import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* catalogueSaga() {
    yield takeLatest([
        ActionTypes.GET_USER_LOTMIX,
    ], sendAPIRequest);
}

export default catalogueSaga;