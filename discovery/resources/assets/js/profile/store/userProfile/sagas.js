import {takeLatest, takeEvery, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';
import {takeLeading} from '~/axios/effects';

function* usersSaga() {
    yield takeLatest([ActionTypes.GET_USER_PROFILE], sendAPIRequest);
    yield takeLeading([
        ActionTypes.UPDATE_USER_PROFILE,
        ActionTypes.CHANGE_USER_PHONE,
        ActionTypes.AUTHORIZE_FOR_2FA,
        ActionTypes.GET_2FA_CONFIG,
        ActionTypes.VERIFY_OTP_CODE,
    ], sendAPIRequest);
}

export default usersSaga;