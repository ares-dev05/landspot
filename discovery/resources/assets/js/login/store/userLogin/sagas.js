import {takeLatest, takeEvery, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';
import {takeLeading} from '~/axios/effects';

function* saga() {
    yield takeEvery(ActionTypes.GET_LOGIN_CONFIG, sendAPIRequest);

    yield takeLeading([
        ActionTypes.AUTHORIZE_USER,
        ActionTypes.SEND_AUTH_SMS,
    ], sendAPIRequest);
}

export default saga;