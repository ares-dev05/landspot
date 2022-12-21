import {takeLatest} from 'redux-saga/effects';
import * as ActionTypes from './actions';
import {sendAPIRequest} from '~sitings~/axios/api';

function* usersSaga() {
    yield takeLatest([
        ActionTypes.LOAD_REF_DOC,
        ActionTypes.CREATE_NEW_SITING,
        ActionTypes.SITE_LOT_AGAIN,
        ActionTypes.SAVE_RAW_DATA,
        ActionTypes.LOAD_SITING_DRAWER
    ], sendAPIRequest);
}

export default usersSaga;