import {throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* catalogueSaga() {
    yield throttle(2000, ActionTypes.FILTER_COMPANIES_CATALOGUE, sendAPIRequest);
}

export default catalogueSaga;