import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* saga() {
    yield takeLatest([
            ActionTypes.GET_USER_NOTIFICATIONS,
            ActionTypes.SET_USER_DECISION,
            ActionTypes.CLOSE_NOTIFICATION,
            ActionTypes.ACCEPT_TOS,
        ],
        sendAPIRequest
    );
}

export default saga;