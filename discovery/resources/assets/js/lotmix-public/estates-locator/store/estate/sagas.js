import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* estateSaga() {
    yield takeLatest([ActionTypes.GET_STATE_ESTATES], sendAPIRequest);
}

export default estateSaga;
