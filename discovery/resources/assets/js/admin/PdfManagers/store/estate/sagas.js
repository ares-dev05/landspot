import {throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* usersSaga() {
    yield throttle(2000, ActionTypes.FILTER_USERS_LIST, sendAPIRequest);
    yield throttle(2000, ActionTypes.REMOVE_USER, sendAPIRequest);
}

export default usersSaga;