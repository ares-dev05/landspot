import {takeLatest, throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* catalogueSaga() {

    yield throttle(2000, ActionTypes.NEW_COMPANIES_CATALOGUE, sendAPIRequest);
    yield throttle(2000, ActionTypes.FILTER_COMPANIES_CATALOGUE, sendAPIRequest);
    yield takeLatest([ActionTypes.GET_USER], sendAPIRequest);
    yield takeLatest([ActionTypes.ADD_COMPANY, ActionTypes.UPDATE_COMPANY], sendAPIRequest);
}

export default catalogueSaga;