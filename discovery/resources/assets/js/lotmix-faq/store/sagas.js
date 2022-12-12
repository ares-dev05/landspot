import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* estateSaga() {
    yield takeLatest([ActionTypes.GET_ESTATE], sendAPIRequest);
}

export default estateSaga;
