import {takeLatest, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* catalogueSaga() {
  yield throttle(2000, ActionTypes.NEW_COMPANIES_CATALOGUE, sendAPIRequest);
  yield throttle(2000, ActionTypes.FILTER_COMPANIES_CATALOGUE, sendAPIRequest);
  yield takeLatest([ActionTypes.GET_USER], sendAPIRequest);
}

export default catalogueSaga;