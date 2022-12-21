import {takeLatest, takeEvery} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~/axios/api';

function* popupDialogSaga() {
    yield takeLatest(ActionTypes.SAVE_PERMISSIONS, sendAPIRequest);
}

export default popupDialogSaga;