import {throttle} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* saga() {
    yield throttle(500, ActionTypes.FILTER_CATALOGUE, sendAPIRequest);
}

export default saga;