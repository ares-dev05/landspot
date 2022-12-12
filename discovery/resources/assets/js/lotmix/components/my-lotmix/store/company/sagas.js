import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* catalogueSaga() {
    yield takeLatest([
        ActionTypes.GET_COMPANY_DATA,
    ], sendAPIRequest);
}

export default catalogueSaga;