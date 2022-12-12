import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* myShortlistSaga() {
    yield takeLatest([ActionTypes.GET_SHORTLIST_DATA], sendAPIRequest);
}

export default myShortlistSaga;
