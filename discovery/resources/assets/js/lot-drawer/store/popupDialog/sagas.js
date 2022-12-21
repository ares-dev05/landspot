import {takeEvery, takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import {takeLeading} from '~/axios/effects';
import * as actions from './actions';

function* popupDialogSaga() {
    yield takeLatest([
            actions.GET_LOT_DRAWER_DATA,
        ], sendAPIRequest
    );
}

export default popupDialogSaga;