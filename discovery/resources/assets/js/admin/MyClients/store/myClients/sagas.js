import {throttle, takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* projectSaga() {
    yield takeLatest([
        ActionTypes.ACCEPT_BRIEF_CLIENT,
        ActionTypes.REJECT_BRIEF_CLIENT,
        ActionTypes.DELETE_MY_CLIENT,
        ActionTypes.DELETE_SITING,
        ActionTypes.SEND_INVITE,
        ActionTypes.CLONE_EXISTING_SITING,
    ], sendAPIRequest);

    yield throttle(1500, ActionTypes.GET_MY_CLIENTS, sendAPIRequest);
}

export default projectSaga;
