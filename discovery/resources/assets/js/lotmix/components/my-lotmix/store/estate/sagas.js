import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* estateSaga() {
    yield takeLatest([ActionTypes.GET_ESTATE_INFO, ActionTypes.TOGGLE_LOT_TO_SHORTLIST], sendAPIRequest);
}

export default estateSaga;
