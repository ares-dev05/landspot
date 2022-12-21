import {takeLatest} from 'redux-saga/effects';
import {sendAPIRequest} from '~/axios/api';
import * as ActionTypes from './actions';

function* popupDialogSaga() {
    yield takeLatest([
            ActionTypes.LOAD_LOT_VISIBILITY
        ], sendAPIRequest
    );
}

export default popupDialogSaga;