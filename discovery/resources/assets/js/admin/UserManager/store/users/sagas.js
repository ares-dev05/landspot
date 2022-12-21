import {takeLatest, takeEvery, throttle} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* usersSaga() {
  yield throttle(2000, ActionTypes.FILTER_USERS_LIST, sendAPIRequest);
  yield takeLatest([ActionTypes.ADD_USER], sendAPIRequest);
  yield takeLatest([ActionTypes.UPDATE_USER], sendAPIRequest);
  yield takeEvery([
      ActionTypes.REMOVE_USER,
      ActionTypes.RESTORE_USER,
      ActionTypes.SEND_RESET_PASSWORD_LINK,
      ActionTypes.RESET_USER_2FA,
      ActionTypes.SEND_SUPPORT_REQUEST,
      ActionTypes.CLOSE_ACCESS_REQUEST
  ], sendAPIRequest);
}

export default usersSaga;